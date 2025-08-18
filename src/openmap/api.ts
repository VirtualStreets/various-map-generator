import type { OpenMapFeature, OpenMapTileInfo } from '@/openmap/types';
import { parseTile } from '@/openmap/parser';
import { wgs84_to_tile_coord } from '@/composables/utils';


export class OpenMapAPI {
    private readonly baseUrl: string = 'https://gpx-tiles.streetview.vn';
    private readonly maxCacheSize: number;
    private readonly tileCache: Map<string, OpenMapFeature[]> = new Map();
    private readonly tileCacheOrder: string[] = [];

    private static readonly EARTH_CIRCUMFERENCE = 40075000;
    private static readonly TILESIZE = 256;

    constructor(maxCacheSize = 100) {
        this.maxCacheSize = maxCacheSize;
    }

    private setTileCache(key: string, features: OpenMapFeature[]) {
        if (this.tileCache.has(key)) {
            const idx = this.tileCacheOrder.indexOf(key);
            if (idx !== -1) this.tileCacheOrder.splice(idx, 1);
        }
        this.tileCache.set(key, features);
        this.tileCacheOrder.push(key);
        if (this.tileCacheOrder.length > this.maxCacheSize) {
            const oldest = this.tileCacheOrder.shift();
            if (oldest) this.tileCache.delete(oldest);
        }
    }

    private getTileCache(key: string): OpenMapFeature[] | undefined {
        if (this.tileCache.has(key)) {
            // Move to most recently used
            const features = this.tileCache.get(key)!;
            this.setTileCache(key, features);
            return features;
        }
        return undefined;
    }

    public clearCache(): void {
        this.tileCache.clear();
        this.tileCacheOrder.length = 0;
    }

    public getCacheStats(): { tileCount: number; featureCount: number } {
        let featureCount = 0;
        this.tileCache.forEach(features => {
            featureCount += features.length;
        });

        return {
            tileCount: this.tileCache.size,
            featureCount
        };
    }

    public async searchFeatures(lat: number, lng: number, radius: number): Promise<OpenMapFeature[]> {
        const tileSizeMeters = OpenMapAPI.EARTH_CIRCUMFERENCE / Math.pow(2, 18);
        const [tileX, tileY] = [
            Math.floor((lng + 180) / 360 * Math.pow(2, 18)),
            Math.floor(
                (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 18)
            )
        ];

        let minX = tileX, maxX = tileX, minY = tileY, maxY = tileY;
        if (radius > tileSizeMeters / 2) {
            const tileRadius = Math.ceil(radius / tileSizeMeters);
            minX = tileX - tileRadius;
            maxX = tileX + tileRadius;
            minY = tileY - tileRadius;
            maxY = tileY + tileRadius;
        }

        const tilePromises: Promise<OpenMapFeature[]>[] = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const tile: OpenMapTileInfo = {
                    z: 18,
                    x,
                    y,
                    url: this.buildTileUrl(18, x, y)
                };
                tilePromises.push(this.loadTileFeatures(tile));
            }
        }
        const results = await Promise.all(tilePromises);

        return results.flat();
    }

    private async loadTileFeatures(tile: OpenMapTileInfo): Promise<OpenMapFeature[]> {
        const cacheKey = `${tile.z}/${tile.x}/${tile.y}`;

        const cached = this.getTileCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(tile.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const features = parseTile(buffer, tile.z, tile.x, tile.y);
            this.setTileCache(cacheKey, features);
            return features;
        } catch (error) {
            //console.error(`error loading tile ${cacheKey}:`, error);
            return [];
        }
    }

    private buildTileUrl(z: number, x: number, y: number): string {
        return `${this.baseUrl}/${z}/${x}/${y}.mvt`;
    }

    public getFeature(id: string): OpenMapFeature | null {
        for (const features of this.tileCache.values()) {
            const found = features.find(f => f.id === id);
            if (found) return found;
        }
        return null;
    }
}