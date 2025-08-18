import type { OpenMapFeature } from '@/openmap/types';
import { pixelToLatLng } from '@/composables/utils';

const EXTENT = 4096;

class S_ {
    public buf: Uint8Array;
    public dataView: DataView;
    public pos: number;
    public type: number;
    public length: number;
    constructor(t: ArrayBuffer | Uint8Array) {
        this.buf = ArrayBuffer.isView(t) ? t as Uint8Array : new Uint8Array(t);
        this.dataView = new DataView(this.buf.buffer);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
    }
    readFields<T>(fn: (tag: number, obj: T, reader: S_) => void, obj: T, end: number = this.length): T {
        while (this.pos < end) {
            const s = this.readVarint();
            const tag = s >> 3;
            const oldPos = this.pos;
            this.type = s & 7;
            fn(tag, obj, this);
            if (this.pos === oldPos) this.skip(s);
        }
        return obj;
    }
    readMessage<T>(fn: (tag: number, obj: T, reader: S_) => void, obj: T): T {
        return this.readFields(fn, obj, this.readVarint() + this.pos);
    }
    readVarint(): number {
        const buf = this.buf;
        let val, b;
        b = buf[this.pos++];
        val = b & 0x7F;
        if (b < 0x80) return val;
        b = buf[this.pos++];
        val |= (b & 0x7F) << 7;
        if (b < 0x80) return val;
        b = buf[this.pos++];
        val |= (b & 0x7F) << 14;
        if (b < 0x80) return val;
        b = buf[this.pos++];
        val |= (b & 0x7F) << 21;
        if (b < 0x80) return val;
        b = buf[this.pos];
        val |= (b & 0x0F) << 28;
        return val;
    }
    readString(): string {
        const end = this.readVarint() + this.pos;
        const start = this.pos;
        this.pos = end;
        return new TextDecoder().decode(this.buf.subarray(start, end));
    }
    readFloat(): number {
        const value = this.dataView.getFloat32(this.pos, true);
        this.pos += 4;
        return value;
    }
    readDouble(): number {
        const value = this.dataView.getFloat64(this.pos, true);
        this.pos += 8;
        return value;
    }
    readSVarint(): number {
        const t = this.readVarint();
        return t % 2 === 1 ? (t + 1) / -2 : t / 2;
    }
    readBoolean(): boolean {
        return !!this.readVarint();
    }
    skip(tag: number): void {
        const type = tag & 7;
        if (type === 0) {
            while (this.buf[this.pos++] > 127);
        } else if (type === 2) {
            this.pos = this.readVarint() + this.pos;
        } else if (type === 5) {
            this.pos += 4;
        } else if (type === 1) {
            this.pos += 8;
        } else {
            this.pos++;
        }
    }
}

function parseValue(reader: S_): any {
    let value: any = null;
    reader.readMessage((tag, obj, r) => {
        switch (tag) {
            case 1: value = r.readString(); break;
            case 2: value = r.readFloat(); break;
            case 3: value = r.readDouble(); break;
            case 4: value = r.readVarint(); break;
            case 5: value = r.readVarint(); break;
            case 6: value = r.readSVarint(); break;
            case 7: value = r.readBoolean(); break;
        }
    }, {});
    return value;
}

class Dx {
    public version: number = 1;
    public name: string = "";
    public extent: number = EXTENT;
    public length: number = 0;
    public _pbf: S_;
    public _keys: string[] = [];
    public _values: any[] = [];
    public _features: number[] = [];
    constructor(reader: S_, end: number) {
        this._pbf = reader;
        reader.readFields((tag: number, layer: Dx, r: S_) => {
            switch (tag) {
                case 15: layer.version = r.readVarint(); break;
                case 1: layer.name = r.readString(); break;
                case 5: layer.extent = r.readVarint(); break;
                case 2: layer._features.push(r.pos); break;
                case 3: layer._keys.push(r.readString()); break;
                case 4: layer._values.push(parseValue(r)); break;
            }
        }, this, end);
        this.length = this._features.length;
    }
    public feature(idx: number): Feature {
        if (idx < 0 || idx >= this._features.length) throw new Error("feature index out of bounds");
        this._pbf.pos = this._features[idx];
        const end = this._pbf.readVarint() + this._pbf.pos;
        return new Feature(this._pbf, end, this.extent, this._keys, this._values);
    }
}

class Feature {
    public id: string | number | undefined = undefined;
    public type: number = 0;
    public extent: number;
    public properties: Record<string, any> = {};
    public _geometry: number = -1;
    public _pbf: S_;
    public _keys: string[];
    public _values: any[];
    constructor(reader: S_, end: number, extent: number, keys: string[], values: any[]) {
        this.extent = extent;
        this._pbf = reader;
        this._keys = keys;
        this._values = values;
        reader.readFields((tag: number, feat: Feature, r: S_) => {
            switch (tag) {
                case 1: feat.id = r.readVarint(); break;
                case 2: {
                    const e = r.readVarint() + r.pos;
                    while (r.pos < e) {
                        const k = feat._keys[r.readVarint()];
                        const v = feat._values[r.readVarint()];
                        feat.properties[k] = v;
                    }
                } break;
                case 3: feat.type = r.readVarint(); break;
                case 4: feat._geometry = r.pos; break;
            }
        }, this, end);
    }
    public loadGeometry(): { x: number; y: number }[][] {
        const r = this._pbf;
        r.pos = this._geometry;
        const end = r.readVarint() + r.pos;
        const rings: { x: number; y: number }[][] = [];
        let s: { x: number; y: number }[] | undefined;
        let cmd = 1, length = 0, x = 0, y = 0;
        for (; r.pos < end;) {
            if (length <= 0) {
                const c = r.readVarint();
                cmd = c & 7;
                length = c >> 3;
            }
            length--;
            if (cmd === 1 || cmd === 2) {
                x += r.readSVarint();
                y += r.readSVarint();
                if (cmd === 1) {
                    if (s) rings.push(s);
                    s = [];
                }
                s && s.push({ x, y });
            } else if (cmd === 7) {
                s && s.push(s[0] ? { ...s[0] } : { x, y });
            } else {
                throw new Error(`unknown command ${cmd}`);
            }
        }
        s && rings.push(s);
        return rings;
    }
}

class Nx {
    public layers: Record<string, Dx> = {};
    constructor(reader: S_, end?: number) {
        this.layers = reader.readFields((tag: number, obj: Record<string, Dx>, r: S_) => {
            if (tag === 3) {
                const layer = new Dx(r, r.readVarint() + r.pos);
                if (layer.length) obj[layer.name] = layer;
            }
        }, {}, end);
    }
}

export function parseTile(buffer: ArrayBuffer, z?: number, x?: number, y?: number): OpenMapFeature[] {
    const tile = new Nx(new S_(buffer));
    const layer = tile.layers['pictures'];
    if (!layer || !layer.length) return [];
    const features: OpenMapFeature[] = [];
    for (let i = 0; i < layer.length; i++) {
        const feat = layer.feature(i);
        let lat = 0, lng = 0;
        if (z !== undefined && x !== undefined && y !== undefined) {
            const geometry = feat.loadGeometry();
            if (geometry.length && geometry[0].length) {
                const gx = geometry[0][0].x;
                const gy = geometry[0][0].y;
                [lat, lng] = pixelToLatLng(gx, gy, z, x, y, layer.extent);
            }
        }
        features.push({
            id: String(feat.properties.id ?? feat.id ?? `${x}_${y}_${i}`),
            sequences:JSON.parse(feat.properties.sequences),
            lat,
            lng,
            heading: Number(feat.properties.heading ?? 0),
            time: feat.properties.ts,
        });
    }
    return features;
}