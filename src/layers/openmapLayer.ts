import * as L from 'leaflet';
import VectorTileLayer from 'leaflet-vector-tile-layer';

function determineLineWidth(zoom: number): number {
    return zoom > 12 ? 4 : zoom > 10 ? 3 : 1.5;
}

function determineRadius(zoom: number): number {
    return zoom > 12 ? 16 : zoom > 10 ? 8 : 4;
}
function createVectorLayer(minZoom: number, maxZoom: number,): L.Layer {
    return VectorTileLayer('https://gpx-tiles.streetview.vn/{z}/{x}/{y}.mvt', {
        style: (feature: any, zoom: number) => {
            if (feature.type === 1) {
                return {
                    radius: determineRadius(zoom),
                    color: 'rgba(101, 163, 248, 1)',
                    fillColor: 'rgba(183, 210, 248, 1)',
                    fillOpacity: 0.3,
                    weight: 1,
                };
            }
            return {
                color: 'rgba(101, 163, 248, 1)',
                weight: determineLineWidth(zoom),
                opacity: 1,
                fill: false,
            };
        },
        tolerance: 10,
        simplifyFactor: 2,
        rendererFactory: () => L.canvas({ padding: 0.5 }),
        minZoom,
        maxNativeZoom: 20,
        maxZoom,
        interactive: false,
    });
}

export const OpenMapLayer = createVectorLayer(6, 19);
