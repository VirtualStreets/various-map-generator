// Type definitions for Leaflet.draw plugin
import 'leaflet'

declare module 'leaflet' {
  interface DrawMap extends L.Map {
    mergeOptions: any;
    addInitHook: any;
  }

  namespace Draw {
    interface IBaseOptions {
      shapeOptions?: L.PathOptions;
    }

    interface PolygonOptions extends IBaseOptions {
      allowIntersection?: boolean;
      drawError?: {
        color?: string;
        message?: string;
      };
      showArea?: boolean;
    }

    class Feature {
      initialize(map: DrawMap, options?: any): void;
    }

    class Polygon extends Feature {
      type: string;
    }

    class PolygonHole extends Polygon {
      constructor(map: DrawMap, options?: PolygonOptions);
      type: 'polygonHole';
    }
  }

  interface Control {
    Draw: {
      mergeOptions(object: any): void;
      prototype: any;
    }
  }

  namespace Control {
    interface DrawOptions {
      position?: string;
      draw?: {
        polyline?: boolean | Draw.PolygonOptions;
        polygon?: boolean | Draw.PolygonOptions;
        rectangle?: boolean | Draw.PolygonOptions;
        circle?: boolean | Draw.PolygonOptions;
        marker?: boolean;
        circlemarker?: boolean;
        polygonHole?: boolean | Draw.PolygonOptions;
        [key: string]: any;
      };
      edit?: {
        featureGroup?: L.FeatureGroup;
        remove?: boolean;
        edit?: boolean;
      };
    }
  }
}