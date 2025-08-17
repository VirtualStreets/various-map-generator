import * as L from 'leaflet';
import VectorTileLayer from 'leaflet-vector-tile-layer';

const MAPILLARY_VECTOR_TILE_URL = 'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4223665974375089|d62822dd792b6a823d0794ef26450398';

export function createMapillaryVectorTileLayer(minZoom: number, maxZoom: number): L.Layer {
    return VectorTileLayer(MAPILLARY_VECTOR_TILE_URL, {
        style: (feature: any, zoom:number) => {
            switch (feature.type) {
                case 2: // LineString - sequences
                    return {
                        color: '#ff9900',
                        weight: 0.5,
                        opacity: 0.9
                    };
                default:
                    return {
                        opacity: 0,
                        fillOpacity: 0,
                        weight: 0
                    };
            }
        },
        minZoom,
        maxZoom,
        maxNativeZoom: 14 
    });
}

export const MapillaryLayer = createMapillaryVectorTileLayer(15, 20);