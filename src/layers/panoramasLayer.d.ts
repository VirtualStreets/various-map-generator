import * as L from 'leaflet';

export class PanoramasLayer extends L.GridLayer {
  constructor(options?: L.GridLayerOptions | any);
  createTile(coords: { x: number; y: number; z: number }, done: (err?: any, tile?: HTMLElement) => void): HTMLElement;
}
