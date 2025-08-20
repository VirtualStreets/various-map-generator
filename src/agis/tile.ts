import { wgs84_to_tile_coord } from "@/composables/utils";
import { LRUCache } from '@/cache';
import { calculateTilesInRadius } from "@/composables/utils";


// Tile data generator with LRU cache
class Generator {
    private minLat = 39.6
    private maxLat = 42.7
    private minLng = 19.2
    private maxLng = 21.1;
    private cache = new LRUCache<string, any>(100);

    async getTileGeoJsonByCoords(x: number, y: number, z: number): Promise<any> {
        if (z > 15) z = 15; // Limit to zoom levels <= 15

        const [minX, minY] = wgs84_to_tile_coord(this.minLat, this.minLng, z);
        const [maxX, maxY] = wgs84_to_tile_coord(this.maxLat, this.maxLng, z);

        if (x < Math.min(minX, maxX) || x > Math.max(minX, maxX) || y < Math.min(minY, maxY) || y > Math.max(minY, maxY)) {
            return null;
        }

        return this.loadTileGeoJson(x, y, z);
    }

    async loadTileGeoJson(x: number, y: number, z: number): Promise<any | null> {
        const key = `${z}/${x}/${y}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const url = `https://cors-proxy.ac4.stocc.dev/https://360.asig.gov.al/AlbaniaStreetView/player2/tiles-1674737600/${z}/${x}/${y}.geojson`;
        try {
            const res = await fetch(url);
            if (!res.ok) {
                this.cache.set(key, null);
                return null;
            }
            const data = await res.json();
            this.cache.set(key, data);
            return data;
        } catch {
            this.cache.set(key, null);
            return null;
        }
    }
    // Fetches GeoJSON by lat/lng and zoom
    async getTileGeoJsonByLatLng(lat: number, lng: number, radius: number): Promise<any | null> {
        const [minX, minY, maxX, maxY] = calculateTilesInRadius(lat, lng, radius, 15);

        const tilePromises: Promise<any>[] = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                tilePromises.push(this.loadTileGeoJson(x, y, 15));
            }
        }
        const results = await Promise.all(tilePromises);
        const allFeatures: any[] = [];

        for (const data of results) {
            if (data && Array.isArray(data.features)) {
                allFeatures.push(...data.features!);
            }
        }
        return {
            type: 'FeatureCollection',
            features: allFeatures
        }
    }
}

export const ASIGTileGenerator = new Generator();