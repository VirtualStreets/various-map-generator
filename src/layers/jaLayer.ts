import * as L from 'leaflet';
import VectorTileLayer from 'leaflet-vector-tile-layer';

function createVectorLayer(minZoom: number): L.Layer {
    return VectorTileLayer('https://tiles.aws-prod.ja.is/tilesets/v11/ja360/tiles/{z}/{x}/{y}.pbf', {
        style: (feature:any) => {
            return {
                color: 'rgba(178, 21, 226, 1)',
                weight: 1,
                opacity: 1,
                fill: false,
            };
        },
        tolerance: 5,
        simplifyFactor: 1.5,
        rendererFactory: () => L.canvas({ padding: 0.5 }),
        minZoom,
        maxNativeZoom: 14,
        interactive: false,
    });
}

export const JaLayer = createVectorLayer(5);
