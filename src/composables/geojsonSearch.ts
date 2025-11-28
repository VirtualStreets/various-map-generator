// 核心GeoJSON搜索函数
export interface SearchResult {
  display_name: string
  country: string
  country_code?: string
  osm_id: number
  osm_type?: string
  address?: {
    country?: string
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

/**
 * Adaptive point decimation based on current data size
 * More aggressive decimation for larger datasets
 * @param coords Array of [lon, lat] coordinates
 * @param targetSize Target size in KB (smaller = more aggressive decimation)
 * @param currentSize Current data size in bytes
 */
function simplifyLineAdaptive(coords: any[], targetSize: number = 50, currentSize: number = 0): any[] {
  if (coords.length <= 4) return coords
  
  // Calculate decimation factor based on current size vs target
  // If data is 3x larger than target, keep only 1/3rd of points
  let decimation = 1
  if (currentSize > 0) {
    const targetBytes = targetSize * 1024
    if (currentSize > targetBytes) {
      decimation = Math.max(1, Math.ceil(currentSize / targetBytes * 0.5))
    }
  }
  
  const simplified: any[] = []
  
  // Always keep first point
  simplified.push(coords[0])
  
  // Keep every nth point
  if (decimation > 1) {
    for (let i = decimation; i < coords.length - 1; i += decimation) {
      simplified.push(coords[i])
    }
  } else {
    // No decimation needed, keep more points
    for (let i = 1; i < coords.length - 1; i++) {
      simplified.push(coords[i])
    }
  }
  
  // Always keep last point
  const lastCoord = coords[coords.length - 1]
  if (JSON.stringify(simplified[simplified.length - 1]) !== JSON.stringify(lastCoord)) {
    simplified.push(lastCoord)
  }
  
  // Ensure minimum points for valid shape
  if (simplified.length < 3 && coords.length >= 3) {
    return [coords[0], coords[Math.floor(coords.length / 2)], coords[coords.length - 1]]
  }
  
  return simplified
}

/**
 * Moderately simplify coordinates to meet 50KB target
 * Balances compression with shape preservation
 */
function SimplifyGeometry(geometry: GeoJSON.Geometry, pass: number = 1): GeoJSON.Geometry {
  if (!geometry) return geometry

  const simplified = { ...geometry } as any

  const processPoly = (coords: any[][], pass: number): any[][] => {
    return coords.map((ring, ringIdx) => {
      if (ring.length < 3) return ring
      
      // Moderate decimation that preserves shape better
      // Pass 1: Keep 1 in 2 (exterior) or 1 in 3 (interior)
      // Pass 2: Keep 1 in 3 (exterior) or 1 in 5 (interior)
      // Pass 3: Keep 1 in 5 (exterior) or 1 in 8 (interior)
      const isExterior = ringIdx === 0
      const baseDecimals = isExterior ? [2, 3, 5] : [3, 5, 8]
      const decimation = baseDecimals[Math.min(pass - 1, 2)]
      
      const rounded = ring.map((coord: any) => [
        Math.round(coord[0] * 10000) / 10000,  // 4 decimals = ~11m accuracy
        Math.round(coord[1] * 10000) / 10000
      ])
      
      const decimated = simplifyLineAdaptive(rounded, 50, JSON.stringify(ring).length)
      
      // Apply additional decimation only if necessary
      let result = decimated
      if (result.length > 50 && pass > 1) {
        result = result.filter((_: any, i: number) => i === 0 || i === result.length - 1 || i % decimation === 0)
      }
      
      // Ensure polygon is closed
      if (JSON.stringify(result[0]) !== JSON.stringify(result[result.length - 1])) {
        result.push(result[0])
      }
      
      return result.length >= 3 ? result : ring
    })
  }

  const processLine = (coords: any[], pass: number): any[] => {
    if (coords.length < 2) return coords
    
    const decimation = pass === 1 ? 1 : (pass === 2 ? 2 : 3)
    
    const rounded = coords.map((coord: any) => [
      Math.round(coord[0] * 10000) / 10000,
      Math.round(coord[1] * 10000) / 10000
    ])
    
    let result = simplifyLineAdaptive(rounded, 50, JSON.stringify(coords).length)
    
    if (result.length > 30 && decimation > 1) {
      result = result.filter((_: any, i: number) => i === 0 || i === result.length - 1 || i % decimation === 0)
    }
    
    return result.length >= 2 ? result : rounded
  }

  switch (geometry.type) {
    case 'Point':
      simplified.coordinates = [
        Math.round(geometry.coordinates[0] * 10000) / 10000,
        Math.round(geometry.coordinates[1] * 10000) / 10000
      ]
      break
    case 'LineString':
    case 'MultiPoint':
      simplified.coordinates = processLine(geometry.coordinates as any, pass)
      break
    case 'Polygon':
      simplified.coordinates = processPoly(geometry.coordinates as any, pass)
      break
    case 'MultiLineString':
      simplified.coordinates = (geometry.coordinates as any[]).map(line => processLine(line, pass))
      break
    case 'MultiPolygon':
      simplified.coordinates = (geometry.coordinates as any[]).map(poly => processPoly(poly, pass))
      break
    case 'GeometryCollection':
      simplified.geometries = (geometry as any).geometries.map((g: GeoJSON.Geometry) => 
        SimplifyGeometry(g, pass)
      )
      break
  }

  return simplified
}

/**
 * Enforce 50KB size limit with moderate simplification
 */
function enforceMaxSize(data: GeoJSON.GeoJsonObject, maxSizeKB: number = 50): GeoJSON.GeoJsonObject {
  let currentSize = JSON.stringify(data).length / 1024

  if (currentSize <= maxSizeKB) {
    return data
  }

  // For FeatureCollection: remove features starting from largest
  if (data.type === 'FeatureCollection') {
    let features = [...(data as GeoJSON.FeatureCollection).features]
    
    while (features.length > 0 && currentSize > maxSizeKB) {
      let largestIdx = 0
      let largestSize = JSON.stringify(features[0]).length
      
      for (let i = 1; i < features.length; i++) {
        const featureSize = JSON.stringify(features[i]).length
        if (featureSize > largestSize) {
          largestSize = featureSize
          largestIdx = i
        }
      }
      
      features.splice(largestIdx, 1)
      currentSize = (JSON.stringify({
        type: 'FeatureCollection',
        features
      }).length / 1024)
    }
    
    return {
      type: 'FeatureCollection',
      features
    } as any
  }

  // For single Feature: apply re-simplification passes
  if (data.type === 'Feature') {
    let pass = 1
    let result = data as any
    
    while (currentSize > maxSizeKB && pass < 4) {
      result = {
        ...result,
        geometry: SimplifyGeometry(result.geometry, pass + 1)
      }
      currentSize = JSON.stringify(result).length / 1024
      pass++
    }
    
    return result
  }

  return data
}

export async function downloadGeoJSON(osmID: number): Promise<GeoJSON.GeoJsonObject | null> {
  const url = `https://polygons.openstreetmap.fr/get_geojson.py?id=${osmID}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch GeoJSON data.')
    }
    let data = await response.json()

    const originalSize = JSON.stringify(data).length
    const originalSizeKB = (originalSize / 1024).toFixed(2)

    // Wrap geometry in Feature if needed
    if (data.type === 'Polygon' || data.type === 'MultiPolygon') {
      data = {
        type: 'Feature',
        geometry: SimplifyGeometry(data, 1),
        properties: {}
      }
    } else if (data.type === 'GeometryCollection' && data.geometries) {
      // Convert GeometryCollection to FeatureCollection
      data = {
        type: 'FeatureCollection',
        features: data.geometries.map((geom: any) => ({
          type: 'Feature',
          geometry: SimplifyGeometry(geom, 1),
          properties: {}
        }))
      }
    } else if (data.type === 'Feature') {
      data.geometry = SimplifyGeometry(data.geometry, 1)
    } else if (data.type === 'FeatureCollection') {
      data.features = data.features.map((f: GeoJSON.Feature) => ({
        ...f,
        geometry: SimplifyGeometry(f.geometry, 1)
      }))
    }

    // Enforce 50KB maximum size
    data = enforceMaxSize(data, 50)

    const finalSize = JSON.stringify(data).length
    const finalSizeKB = (finalSize / 1024).toFixed(2)
    const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(1)

    console.info(`GeoJSON: ${originalSizeKB}KB → ${finalSizeKB}KB (${compressionRatio}% reduction)`)

    if (finalSize > 50 * 1024) {
      console.warn(`⚠️ GeoJSON ${finalSizeKB}KB exceeds 50KB target`)
    } else {
      console.info(`✓ GeoJSON successfully compressed to ${finalSizeKB}KB`)
    }

    return data
  } catch (error) {
    console.error('Error downloading GeoJSON:', error)
    return null
  }
}
