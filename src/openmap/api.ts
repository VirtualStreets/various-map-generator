import type { OpenMapFeature, OpenMapTileInfo } from '@/openmap/types';
import { parseTile } from '@/openmap/parser';
import { wgs84_to_tile_coord } from "@/composables/utils";
import { LRUCache } from '@/cache';

export class OpenMapAPI {
    private readonly baseUrl: string = 'https://gpx-tiles.streetview.vn';
    private readonly tileCache: LRUCache<string, OpenMapFeature[]>;
    private readonly minLat = 8.18
    private readonly maxLat = 23.39;
    private readonly minLng = 102.14;
    private readonly maxLng = 109.46;

    constructor(maxCacheSize = 100) {
        this.tileCache = new LRUCache<string, OpenMapFeature[]>(maxCacheSize);
    }

    public async searchFeatures(lat: number, lng: number): Promise<OpenMapFeature[]> {
        if (lat < this.minLat || lat > this.maxLat || lng < this.minLng || lng > this.maxLng) {
            return [];
        }

        const [x, y] = wgs84_to_tile_coord(lat, lng, 18);

        return this.loadTileFeatures({ x, y, url: this.buildTileUrl(x, y) });
    }

    private async loadTileFeatures(tile: OpenMapTileInfo): Promise<OpenMapFeature[]> {

        const cacheKey = `18/${tile.x}/${tile.y}`;

        if (this.tileCache.has(cacheKey)) {
            return this.tileCache.get(cacheKey)!;;
        }

        try {
            const response = await fetch(tile.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const features = parseTile(buffer, 18, tile.x, tile.y);
            this.tileCache.set(cacheKey, features);
            return features;
        } catch (error) {
            //console.error(`error loading tile ${cacheKey}:`, error);
            return [];
        }
    }

    private buildTileUrl(x: number, y: number): string {
        return `${this.baseUrl}/18/${x}/${y}.mvt`;
    }

    public getFeature(id: string): OpenMapFeature | null {
        for (const features of this.tileCache['cache'].values()) {
            const found = features.find((f: OpenMapFeature) => f.id === id);
            if (found) return found;
        }
        return null;
    }
}