import { tile_coord_to_wgs84, distanceBetween } from "@/composables/utils";

class VegbilderGenerator {
    private baseUrl = 'https://ogckart-sn1.atlas.vegvesen.no/vegbilder_1_0/ows';
    private maxFeatureCount = 100;

    /**
     * 构建WFS请求URL
     */
    private buildWFSUrl(minLat: number, minLng: number, maxLat: number, maxLng: number): string {
        const params = new URLSearchParams({
            service: 'WFS',
            version: '2.0.0',
            request: 'GetFeature',
            typenames: 'vegbilder_1_0:Vegbilder_360_2025',
            startindex: '0',
            count: this.maxFeatureCount.toString(),
            srsname: 'urn:ogc:def:crs:EPSG::4326',
            bbox: `${minLat},${minLng},${maxLat},${maxLng},urn:ogc:def:crs:EPSG::4326`,
            outputformat: 'application/json'
        });
        return `${this.baseUrl}?${params.toString()}`;
    }

    /**
     * 根据瓦片坐标获取GeoJSON数据
     */
    async getTileGeoJsonByCoords(x: number, y: number, z: number): Promise<any> {
        if (z > 18) z = 18;

        const [maxLat, minLng] = tile_coord_to_wgs84(x, y, z);
        const [minLat, maxLng] = tile_coord_to_wgs84(x + 1, y + 1, z);

        return this.loadTileGeoJson(minLat, minLng, maxLat, maxLng);
    }


    /**
     * 加载指定边界框的GeoJSON数据
     */
    async loadTileGeoJson(minLat: number, minLng: number, maxLat: number, maxLng: number): Promise<any | null> {
        const url = this.buildWFSUrl(minLat, minLng, maxLat, maxLng);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return null;
            }
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching Vegbilder data:', error);
            return null;
        }
    }

    async getGeoJsonByBounds(minLat: number, minLng: number, maxLat: number, maxLng: number): Promise<any | null> {
        const url = this.buildWFSUrl(minLat, minLng, maxLat, maxLng);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return null;
            }
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching Vegbilder data:', error);
            return null;
        }
    }

    /**
     * 根据经纬度和半径获取GeoJSON数据
     */
    async getTileGeoJsonByLatLng(lat: number, lng: number, radius: number): Promise<any | null> {
        const { minLat, minLng, maxLat, maxLng } = this.getLatitudeLongitudeBounds(radius, lat, lng);

        const data = await this.loadTileGeoJson(minLat, minLng, maxLat, maxLng);
        let features: any[] = [];
        if (data && data.features && Array.isArray(data.features)) {
            features = this.deduplicateFeatures(data.features);
        }
        return {
            type: 'FeatureCollection',
            features
        };
    }

    private getLatitudeLongitudeBounds(radius: number, lat: number, lng: number) {
        const dLat = (radius / 6378137) * (180 / Math.PI);
        const dLng = (radius / 6378137) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

        const minLat = lat - dLat;
        const maxLat = lat + dLat;
        const minLng = lng - dLng;
        const maxLng = lng + dLng;
        return { minLat, minLng, maxLat, maxLng };
    }

    /**
     * 去重features（基于ID或坐标）
     */
    private deduplicateFeatures(features: any[]): any[] {
        const seen = new Set<string>();
        return features.filter(feature => {
            // 优先使用feature ID
            if (feature.id) {
                if (seen.has(feature.id)) return false;
                seen.add(feature.id);
                return true;
            }

            // 如果没有ID，使用坐标作为唯一标识
            if (feature.geometry && feature.geometry.coordinates) {
                const coordKey = JSON.stringify(feature.geometry.coordinates);
                if (seen.has(coordKey)) return false;
                seen.add(coordKey);
                return true;
            }

            return true;
        });
    }

    /**
     * 根据ID获取单个feature
     */
    async getFeatureById(featureId: string): Promise<any | null> {
        // 简单实现：从ID中提取可能的坐标信息进行查询
        // 由于LRU缓存不支持遍历，这里返回null，实际使用时可通过坐标查询
        return null;
    }

    /**
     * 提取feature中的关键信息
     */
    extractFeatureInfo(feature: any): any {
        try {
            if (!feature?.geometry?.coordinates || !feature?.properties) return null;

            const [lng, lat] = feature.geometry.coordinates;
            const props = feature.properties;

            return {
                lat,
                lng,
                panoId: feature.id || '',
                date: props.TIDSPUNKT || '',
                description: `${props?.VEGKATEGORI || ''}${props?.VEGSTATUS || ''}${props?.VEGNUMMER || ''}`,
                heading: props.RETNING || 0,
                pitch: props.REFLINKPOSISJON || 0,
                url: props.URL || '',
                preview: props.URLPREVIEW || ''
            };
        }
        catch (error) {
            return null;
        }
    }
}

export const VegbilderTileGenerator = new VegbilderGenerator();

