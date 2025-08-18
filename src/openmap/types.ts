export interface OpenMapFeature {
    id: string;
    lat: number;
    sequences: string[];
    lng: number;
    heading: number;
    time: number | null;
}

export interface OpenMapTileInfo {
    z: number;
    x: number;
    y: number;
    url: string;
}
