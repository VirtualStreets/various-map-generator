import { wgs84_to_tile_coord } from "@/composables/utils";

class LRUCache<K, V> {
    private cache = new Map<K, V>();
    constructor(private maxSize: number) { }
    get(key: K): V | undefined {
        if (!this.cache.has(key)) return undefined;
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    set(key: K, value: V) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
}

// Tile data generator with LRU cache
class Generator {
    private minLat = 39.6
    private maxLat = 42.7
    private minLng = 19.2
    private maxLng = 21.1;
    private cache = new LRUCache<string, any>(200);

    async getTileGeoJsonByCoords(x: number, y: number, z: number): Promise<any | null> {
        if (z > 15) z = 15; // Limit to zoom levels <= 15

        const key = `${z}/${x}/${y}`;
        const cached = this.cache.get(key);
        if (cached) return cached;

        const [minX, minY] = wgs84_to_tile_coord(this.minLat, this.minLng, z);
        const [maxX, maxY] = wgs84_to_tile_coord(this.maxLat, this.maxLng, z);

        if (x < Math.min(minX, maxX) || x > Math.max(minX, maxX) || y < Math.min(minY, maxY) || y > Math.max(minY, maxY)) {
            return null;
        }
        const url = `https://cors-proxy.ac4.stocc.dev/https://360.asig.gov.al/AlbaniaStreetView/player2/tiles-1674737600/${z}/${x}/${y}.geojson`;
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return null;
                this.cache.set(key, null);
            }
            const data = await res.json();
            this.cache.set(key, data);
            return data;
        } catch {
            return null;
            this.cache.set(key, null);
        }
    }

    // Fetches GeoJSON by lat/lng and zoom
    async getTileGeoJsonByLatLng(lat: number, lng: number, zoom: number): Promise<any | null> {
        if (zoom > 15) zoom = 15; // Limit to zoom levels <= 15
        const [x, y] = wgs84_to_tile_coord(lat, lng, zoom);
        return this.getTileGeoJsonByCoords(x, y, zoom);
    }
}

export const ASIGTileGenerator = new Generator();