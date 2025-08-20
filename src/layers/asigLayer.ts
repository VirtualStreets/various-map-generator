import * as L from 'leaflet';
import { ASIGTileGenerator } from '@/agis/tile';


class GeoJsonTileLayer extends L.GridLayer {
    private _tileLayerGroups: Map<string, L.LayerGroup> = new Map();
    private _currentZoom: number | null = null;

    onAdd(map: L.Map): this {
        super.onAdd(map);
        map.on('zoomend', () => {
            const zoom = map.getZoom();
            if (this._currentZoom !== null && zoom !== this._currentZoom && zoom <= 15) {
                for (const [key, group] of this._tileLayerGroups.entries()) {
                    const [z] = key.split('_');
                    if (parseInt(z) !== zoom) {
                        group.remove();
                        this._tileLayerGroups.delete(key);
                    }
                }
            }
            this._currentZoom = zoom;
        });
        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        this._tileLayerGroups.forEach(group => group.remove());
        this._tileLayerGroups.clear();
        this._currentZoom = null;
        return this;
    }

    createTile(coords: L.Coords, done: (error?: Error, tile?: HTMLElement) => void): HTMLElement {
        const tile = L.DomUtil.create('div', 'leaflet-tile');
        tile.style.pointerEvents= 'none'; // Disable pointer events for the tile
        const layerGroup = L.layerGroup();
        const tileKey = `${coords.z}_${coords.x}_${coords.y}`;
        this._tileLayerGroups.set(tileKey, layerGroup);
        ASIGTileGenerator.getTileGeoJsonByCoords(coords.x, coords.y, coords.z)
            .then((data: any) => {
                if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                    let features = data.features;
                    if (coords.z < 16) {
                        const pointFeatures = features.filter((f: any) => f.geometry?.type === 'Point');
                        const maxPoints = coords.z * 10;
                        if (pointFeatures.length > maxPoints) {
                            const sampled: any[] = [];
                            const used = new Set<number>();
                            while (sampled.length < maxPoints) {
                                const idx = Math.floor(Math.random() * pointFeatures.length);
                                if (!used.has(idx)) {
                                    sampled.push(pointFeatures[idx]);
                                    used.add(idx);
                                }
                            }
                            features = [...sampled];
                        }
                    }
                    const geoJsonLayer = L.geoJSON({ ...data, features }, {
                        interactive: false,
                        style: (feature: any) => {
                            if (feature.geometry.type === 'LineString') {
                                return {} as any;
                            }
                        },
                        pointToLayer: (feature: any) => {
                            if (feature && feature.geometry && feature.geometry.type === 'Point') {
                                return L.circleMarker(L.latLng(feature.properties.lat, feature.properties.lon), {
                                    radius: 5,
                                    color: '#2196f3',
                                    fillColor: '#ffffff',
                                    fillOpacity: 0.3,
                                    weight: 1,
                                });
                            }
                            return {} as any;
                        }
                    });
                    layerGroup.addLayer(geoJsonLayer);
                }
                layerGroup.addTo(this._map);
                done(undefined, tile);
            })
            .catch(() => {
                done(undefined, tile);
            });
        tile.addEventListener('tileunload', () => {
            const group = this._tileLayerGroups.get(tileKey);
            if (group) {
                group.remove();
                this._tileLayerGroups.delete(tileKey);
            }
        });
        return tile;
    }
}

export const ASIGLayer = new GeoJsonTileLayer();
