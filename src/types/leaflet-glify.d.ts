import L from 'leaflet'

declare module 'leaflet' {
  namespace glify {
    interface IColor {
      r: number
      g: number
      b: number
      a?: number
    }

    interface PointsOptions {
      map: L.Map
      data: GeoJSON.FeatureCollection<GeoJSON.Point> | [number, number][]
      size?: number | ((index: number, point: [number, number] | GeoJSON.Feature<GeoJSON.Point>) => number)
      color?: IColor | string | ((index: number, point: [number, number] | GeoJSON.Feature<GeoJSON.Point>) => IColor)
      opacity?: number
      className?: string
      vertexShaderSource?: string | (() => string)
      fragmentShaderSource?: string | (() => string)
      click?: (e: MouseEvent, feature: GeoJSON.Feature<GeoJSON.Point> | [number, number], xy: { x: number, y: number }) => boolean | void
      hover?: (e: MouseEvent, feature: GeoJSON.Feature<GeoJSON.Point> | [number, number], xy: { x: number, y: number }) => boolean | void
      sensitivity?: number
      sensitivityHover?: number
      preserveDrawingBuffer?: boolean
      pane?: string
    }

    interface PointsInstance {
      remove(): this
      update(data: GeoJSON.FeatureCollection<GeoJSON.Point> | [number, number][], index?: number): this
      render(): this
    }

    function points(options: PointsOptions): PointsInstance
  }
}

export {}
