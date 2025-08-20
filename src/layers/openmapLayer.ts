import * as L from 'leaflet';
import VectorTileLayer from 'leaflet-vector-tile-layer';

function createVectorLayer(minZoom: number, maxZoom: number,): L.Layer {
    return VectorTileLayer('https://gpx-tiles.streetview.vn/{z}/{x}/{y}.mvt', {
        style: (feature: any) => {
            if (feature.type === 1) {
                return {
                    radius: 4,
                    color: 'rgba(101, 163, 248, 1)',
                    fillColor: 'rgba(183, 210, 248, 1)',
                    fillOpacity: 0.3,
                    weight: 1,
                };
            }
            return {
                color: 'rgba(101, 163, 248, 1)',
                weight: 2,
                opacity: 1,
                fill: false,
            };
        },
        tolerance: 10,
        simplifyFactor: 2,
        rendererFactory: () => L.canvas({ padding: 0.5 }),
        minZoom,
        maxNativeZoom: 18,
        maxZoom,
        interactive: false,
    });
}

export const OpenMapLayer = createVectorLayer(10, 20);
