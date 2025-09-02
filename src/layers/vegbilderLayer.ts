import * as L from 'leaflet';

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

    private getTileBbox(x: number, y: number, z: number): [number, number, number, number] {
        // 获取瓦片四个角的WGS84坐标
        const [lat1, lng1] = this.tileToLatLng(x, y, z);         // 左上角
        const [lat2, lng2] = this.tileToLatLng(x + 1, y + 1, z); // 右下角

        // 返回bbox: [minX, minY, maxX, maxY]
        return [
            lng1,
            lat2, 
            lng2,
            lat1
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
            srs: 'EPSG:4326',
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
                //console.warn('Failed to load Vegbilder WMS tile:', coords);
                done(undefined, img);
            };
            
            img.src = url;
        } catch (error) {
            //console.error('Error creating Vegbilder tile:', error);
            done(undefined, img);
        }

        return img;
    }
}

export const VegbilderLayer = new VegbilderWMSLayer();
