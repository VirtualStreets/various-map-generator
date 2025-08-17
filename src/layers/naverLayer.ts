import * as L from 'leaflet';
import VectorTileLayer from 'leaflet-vector-tile-layer';

function determineLineWidth(level: number): number {

    return 4 / (level + 1);
}

function createVectorLayer(minZoom: number, maxZoom: number,): L.Layer {
    return VectorTileLayer('https://map.pstatic.net/nvbpc/wmts/panorama/b7f15e87-e5d4-43a5-9826-e8cebdd02ae2/getTile/{x}/{y}/{z}/pbf', {
        style: (feature: any, zoom: number) => {
            return {
                color: 'rgba(254, 145, 62, 1)',
                weight: determineLineWidth(feature.properties.dp_level),
                opacity: 1,
                fill: false,
            };
        },
        tolerance: 5,
        simplifyFactor: 1.5,
        rendererFactory: () => L.canvas({ padding: 0.5 }),
        minZoom,
        maxNativeZoom: 20,
        maxZoom,
        interactive: false,
    });
}

export const NaverLayer = createVectorLayer(15, 20);
