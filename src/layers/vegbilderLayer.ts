import * as L from 'leaflet';
import proj4 from 'proj4';

// 定义EPSG:25833投影 (UTM Zone 33N for Norway)
proj4.defs("EPSG:25833", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

class VegbilderWMSLayer extends L.GridLayer {
    private baseUrl = 'https://ogckart-sn1.atlas.vegvesen.no/vegbilder_1_0/ows';

    /**
     * 将瓦片坐标转换为WGS84经纬度
     */
    private tileToLatLng(x: number, y: number, z: number): [number, number] {
        const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return [
            Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) * 180 / Math.PI, // lat
            x / Math.pow(2, z) * 360 - 180 // lng
        ];
    }

    /**
     * 将WGS84坐标转换为EPSG:25833坐标
     */
    private wgs84ToEPSG25833(lng: number, lat: number): [number, number] {
        return proj4('EPSG:4326', 'EPSG:25833', [lng, lat]);
    }

    /**
     * 计算瓦片的EPSG:25833边界框
     */
    private getTileBbox(x: number, y: number, z: number): [number, number, number, number] {
        // 获取瓦片四个角的WGS84坐标
        const [lat1, lng1] = this.tileToLatLng(x, y, z);         // 左上角
        const [lat2, lng2] = this.tileToLatLng(x + 1, y + 1, z); // 右下角

        // 转换为EPSG:25833坐标
        const [x1, y1] = this.wgs84ToEPSG25833(lng1, lat1);
        const [x2, y2] = this.wgs84ToEPSG25833(lng2, lat2);

        // 返回bbox: [minX, minY, maxX, maxY]
        return [
            Math.min(x1, x2),
            Math.min(y1, y2), 
            Math.max(x1, x2),
            Math.max(y1, y2)
        ];
    }

    /**
     * 构建WMS请求URL
     */
    private buildWMSUrl(bbox: [number, number, number, number]): string {
        const params = new URLSearchParams({
            service: 'WMS',
            request: 'GetMap',
            layers: 'vegbilder_1_0:Vegbilder_dekning, vegbilder_1_0:Vegbilder_360_dekning',// vegbilder_1_0:Vegbilder_oversikt_2025, vegbilder_1_0:Vegbilder_360_oversikt_2025
            styles: '',
            format: 'image/png',
            transparent: 'true',
            version: '1.1.1',
            width: '256',
            height: '256',
            srs: 'EPSG:25833',
            bbox: bbox.join(',')
        });
        return `${this.baseUrl}?${params.toString()}`;
    }

    createTile(coords: L.Coords, done: (error?: Error, tile?: HTMLElement) => void): HTMLElement {
        const img = document.createElement('img');
        img.width = 256;
        img.height = 256;
        img.style.pointerEvents = 'none';
        img.style.filter = 'hue-rotate(140deg) saturate(200%)';

        // 只在挪威地区显示（大致边界检查）
        const [lat, lng] = this.tileToLatLng(coords.x, coords.y, coords.z);
        if (lng < 4 || lng > 32 || lat < 57 || lat > 72) {
            done(undefined, img);
            return img;
        }

        try {
            const bbox = this.getTileBbox(coords.x, coords.y, coords.z);
            const url = this.buildWMSUrl(bbox);
            
            img.onload = () => {
                done(undefined, img);
            };
            
            img.onerror = () => {
                console.warn('Failed to load Vegbilder WMS tile:', coords);
                done(undefined, img);
            };
            
            img.src = url;
        } catch (error) {
            console.error('Error creating Vegbilder tile:', error);
            done(undefined, img);
        }

        return img;
    }
}

export const VegbilderLayer = new VegbilderWMSLayer();
