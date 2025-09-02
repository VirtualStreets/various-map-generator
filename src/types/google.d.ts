declare namespace google.maps {
  interface StreetViewPanoramaData {
    time?: {
      pano: string
      [key?: string]: Date
    }[]
  }

  interface StreetViewLocation {
    altitude?: number | null
    country?: string | null
    region?: string | null
    locality?: string | null
    road?: string | null
    service?: any
  }
}
