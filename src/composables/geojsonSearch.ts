export interface SearchResult {
  display_name: string
  osm_id: number
  osm_type?: string
  address?: {
    country?: string
    country_code?: string
    state?: string
    city?: string
    county?: string
    region?: string
    [key: string]: string | undefined
  }
  lat?: string
  lon?: string
}

export async function getOSMID(placeName: string): Promise<SearchResult[] | null> {
  try {
    const nominatimURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&addressdetails=1&limit=5`
    const response = await fetch(nominatimURL, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })
    const data = await response.json()
    return data.length > 0 ? data : null
  } catch (error) {
    console.error('Error fetching OSM ID:', error)
    return null
  }
}

/** Visvalingam–Whyatt simplification */
function simplifyVW(points: number[][], targetCount: number): number[][] {
  if (points.length <= targetCount) return points

  const areas = points.map((p, i) => {
    if (i === 0 || i === points.length - 1) return Infinity
    const a = points[i - 1], b = points[i], c = points[i + 1]
    return Math.abs(
      (a[0] * (b[1] - c[1]) +
       b[0] * (c[1] - a[1]) +
       c[0] * (a[1] - b[1])) / 2
    )
  })

  const indices = [...areas.keys()].sort((a, b) => areas[b] - areas[a])
  const keep = new Set(indices.slice(0, targetCount))
  return points.filter((_, i) => keep.has(i))
}

/** keep the largest polygon, remove holes */
function filterMainPolygon(coordinates: number[][][]): number[][][] {
  // Find largest ring (area)
  let maxArea = -Infinity
  let mainRing: number[][] = coordinates[0]

  for (const ring of coordinates) {
    const area = Math.abs(ring.reduce((acc, p, i) => {
      const q = ring[(i + 1) % ring.length]
      return acc + p[0] * q[1] - q[0] * p[1]
    }, 0)) / 2

    if (area > maxArea) {
      maxArea = area
      mainRing = ring
    }
  }

  return [mainRing] // only exterior, remove holes
}

/** Simplify polygon → target <10 KB */
function simplifyPolygon(poly: number[][][]): number[][][] {
  const filtered = filterMainPolygon(poly)
  let ring = filtered[0]

  // Rough target: ~100–300 points → 1–5 KB
  const targetCount = Math.max(40, Math.floor(ring.length * 0.1))
  ring = simplifyVW(ring, targetCount)

  // Close ring
  if (ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push([...ring[0]])
  }

  return [ring]
}

/** Simplify any geometry */
function simplifyGeometry(geom: GeoJSON.Geometry): GeoJSON.Geometry {
  if (geom.type === "Polygon") {
    return { type: "Polygon", coordinates: simplifyPolygon(geom.coordinates) }
  }

  if (geom.type === "MultiPolygon") {
    if (geom.coordinates.length === 0) return geom
    return {
      type: "Polygon", // reduce multipolygon to single largest
      coordinates: simplifyPolygon(geom.coordinates.flat(1))
    }
  }

  return geom
}

/** Download + simplify */
export async function downloadGeoJSON(osmID: number) {
  const url = `https://polygons.openstreetmap.fr/get_geojson.py?id=${osmID}`
  try {
    const res = await fetch(url)
    const data = await res.json()

    const feature: GeoJSON.Feature = {
      type: "Feature",
      geometry: simplifyGeometry(
        data.type === "Feature" ? data.geometry : data
      ),
      properties: {}
    }

    // ensure <10 KB (usually 1–5 KB)
    let size = JSON.stringify(feature).length
    if (size > 10000) {
      feature.geometry = simplifyGeometry(feature.geometry)
      size = JSON.stringify(feature).length
    }
    return feature
  } catch (e) {
    console.error("GeoJSON download failed:", e)
    return null
  }
}
