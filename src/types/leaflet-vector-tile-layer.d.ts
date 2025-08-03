declare module 'leaflet-vector-tile-layer' {
  import * as L from 'leaflet';

  export interface VectorTileLayerOptions extends L.GridLayerOptions {
    style?: (feature: any, zoom: number) => L.PathOptions;
    minZoom?: number;
    maxZoom?: number;
    interactive?: boolean;
    maxNativeZoom?: number;
    tolerance?: number;
    simplifyFactor?: number;
    rendererFactory?: L.RendererFunction;
  }

  export default function vectorTileLayer(url: string, options?: VectorTileLayerOptions): L.GridLayer;
}
