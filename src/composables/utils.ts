import proj4 from 'proj4';

export const MONTHS_NAME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getCountryName(countryCode: string, locale: string = 'en'): string {
  try {
    if (!countryCode) {
      return 'Unknown'
    }
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch (error) {
    console.warn('Failed to get country name:', error);
    return countryCode || 'Unknown';
  }
}

export function getMonthEndTimestamp(monthString: string): number {
  const date = new Date(monthString);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  date.setUTCHours(23, 59, 59, 999);
  return date.getTime();
}

async function createDiscordMessage(title: string, pano: {
  panoId: string;
  lat: number;
  lng: number;
  heading: number;
  imageDate: string;
  country: string;
  region: string;
  locality: string;
  road: string;
  update_type: string;
}): Promise<string> {
  let position_word = 'in'
  if (pano.locality) {
    if (pano.road && pano.road == pano.locality) position_word = 'on'
  }
  else if (pano.road) position_word = 'on'
  const link = `https://www.google.com/maps/@?api=1&map_action=pano&pano=${pano.panoId}`;
  const countryName = getCountryName(pano.country || '');
  const countryCode = pano.country ? pano.country.toLowerCase() : 'xx';
  return `:white_check_mark: ${title}\n\n:flag_${countryCode}:${pano.update_type ? ` :${pano.update_type}: ` : ' '}${MONTHS_NAME[parseInt(pano.imageDate.slice(5, 7)) - 1]} ${pano.imageDate.slice(0, 4)} ${position_word} ${pano.locality || pano.road || ''}${(pano.locality || pano.road) ? ', ' : ''}${pano.region || ''}, ${countryName}\n<${link}>`;
}

export async function sendToDiscord(url: string,
  title: string,
  data: {
    panoId: string;
    lat: number;
    lng: number;
    heading: number;
    imageDate: string;
    country: string;
    region: string;
    road: string;
    locality: string;
    update_type: string;
  }): Promise<void> {
  const content = data ? await createDiscordMessage(title, data) : title;
  const payload = JSON.stringify({
    content,
    username: "Various MapGenerator",
    avatar_url: "https://various-map-generator.pages.dev/favicon.png"
  });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    });
    if (response.status != 204) {
      console.error("Error sending message to Discord.");
    }
  } catch (error) {
    //console.error("Error sending message to Discord: " + error);
  }
}

export function sendNotifications(
  title: string,
  body: string,
  isDiscord: boolean = false,
  webhook?: string,
  location?: any,) {
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  } catch (error) {
    console.warn('Notification failed:', error)
  }

  if (isDiscord && webhook) {
    try {
      sendToDiscord(webhook, `**${body}**`, location);
    }
    catch (error) {
      //console.error("Error sending message to Discord: " + error);
    }
  }
}

export function isOfficial(pano: string, provider: string) {
  switch (provider) {
    case 'google':
    case 'googleZoom':
      return pano.length === 22  // Checks if pano ID is 22 characters long. Otherwise, it's an Ari
    // return (!/^\xA9 (?:\d+ )?Google$/.test(pano.copyright))
    case 'mapycz':
    case 'yandex':
    case 'apple':
    case 'bing':
    case 'baidu':
    case 'naver':
    case 'kakao':
    case 'mapillary':
    case 'openmap':
    case 'tencent':
    case 'vegbilder':
    case 'asig':
    case 'ja':
      return true
    default:
      return false
  }
}

export function isPhotosphere(res: google.maps.StreetViewPanoramaData) {
  return res.links?.length === 0
}

export function isDrone(res: google.maps.StreetViewPanoramaData) {
  return isPhotosphere(res) && [2048, 7200].includes(res.tiles.worldSize.height)
}

export function hasAnyDescription(location: google.maps.StreetViewLocation) {
  return location.description || location.shortDescription
}

export function getStreetViewStatus(key: keyof typeof google.maps.StreetViewStatus): google.maps.StreetViewStatus {
  return google?.maps?.StreetViewStatus?.[key] ?? key
}

export function makeLatLng(lat: number, lng: number): google.maps.LatLng {
  return new google.maps.LatLng(lat, lng)
}

proj4.defs('EPSG:3057', '+proj=tmerc +lat_0=65 +lon_0=-19 +k=1 +x_0=500000 +y_0=500000 +ellps=GRS80 +units=m +no_defs');

export function wgs84_to_isn93(lat: number, lng: number): [number, number] {
  return proj4('EPSG:4326', 'EPSG:3057', [lng, lat]);
}

export async function getElevation(lat: number, lon: number): Promise<number | null> {
  const endpoints: { url: string, parse: (resp: any) => number | null }[] = [
    {
      url: `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
      parse: (resp: any) =>
        Array.isArray(resp.results) && resp.results[0]?.elevation !== undefined
          ? resp.results[0].elevation
          : null
    },
    {
      url: `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`,
      parse: (resp: any) =>
        Array.isArray(resp.elevation) && typeof resp.elevation[0] === 'number'
          ? resp.elevation[0]
          : null
    },
    {
      url: `https://cors-proxy.ac4.stocc.dev/https://www.elevation-api.eu/v1/elevation/${lat}/${lon}?json`,
      parse: (resp: any) =>
        typeof resp?.elevation === 'number' ? resp.elevation : null
    },
    {
      url: `https://cors-proxy.ac4.stocc.dev/https://api.opentopodata.org/v1/test-dataset?locations=${lat},${lon}`,
      parse: (resp: any) =>
        Array.isArray(resp.results) && resp.results[0]?.elevation !== undefined
          ? resp.results[0].elevation
          : null
    },
  ];

  const indices = Array(endpoints.length).fill(0).map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (const idx of indices) {
    const { url, parse } = endpoints[idx];
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      const elevation = parse(data);
      if (typeof elevation === 'number' && !isNaN(elevation)) {
        return elevation;
      }
    } catch (e) {
    }
  }
  console.warn('All elevation APIs failed');
  return null
}

export function wgs84_to_tile_coord(lat: number, lng: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180.0;
  const scale = 1 << zoom;
  const x = ((lng + 180.0) / 360.0) * scale;
  const y = (1.0 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0 * scale;
  return [Math.floor(x), Math.floor(y)];
}

export function tile_coord_to_wgs84(x: number, y: number, zoom: number) {
  const scale = 1 << zoom;
  const lonDeg = (x / scale) * 360.0 - 180.0;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale)));
  const latDeg = (latRad * 180.0) / Math.PI;
  return [latDeg, lonDeg];
}

export function pixelToLatLng(
  x: number,
  y: number,
  zoom: number,
  tileX: number,
  tileY: number,
  tileSize: number): [number, number] {
  const n = Math.pow(2, zoom);
  const globalX = (tileX * tileSize + x) / tileSize;
  const globalY = (tileY * tileSize + y) / tileSize;
  const lng = globalX / n * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * globalY / n)));
  const lat = latRad * 180 / Math.PI;
  return [lat, lng];
}

export function isAcceptableCurve(
  links: google.maps.StreetViewLink[],
  minCurveAngle: number,
): boolean {
  if (links.length !== 2 || links[0].heading == null || links[1].heading == null) return false

  const angleDifference = Math.abs(links[0].heading - links[1].heading) % 360
  const smallestAngle = angleDifference > 180 ? 360 - angleDifference : angleDifference
  const curveAngle = Math.abs(180 - smallestAngle)
  return curveAngle >= minCurveAngle
}

const gen3Dates = new Map<string, string>([
  ['BD', '2021-04'], ['FI', '2020-09'], ['IN', '2021-10'], ['LK', '2021-02'],
  ['LB', '2021-05'], ['NG', '2021-06'], ['US', '2019-01'], ['VN', '2021-01']
]);

const gen2Countries = new Set([
  'AU', 'BR', 'CA', 'CL', 'JP', 'GB', 'IE', 'NZ', 'MX', 'RU', 'US', 'IT', 'DK', 'GR', 'RO',
  'PL', 'CZ', 'CH', 'SE', 'FI', 'BE', 'LU', 'NL', 'ZA', 'SG', 'TW', 'HK', 'MO', 'MC', 'SM',
  'AD', 'IM', 'JE', 'FR', 'DE', 'ES', 'PT', 'SJ'
]);

function dateToMonthNumber(date: string): number {
  const [y, m] = date.split('-').map(Number);
  return (y || 0) * 12 + (m || 0);
}

export function getCameraGeneration(
  pano: google.maps.StreetViewPanoramaData,
  provider: string
): number | string {
  const location = pano.location;
  const country = location?.country ?? 'None';
  const lat = location?.latLng?.lat() ?? 0;
  const imageDate = pano.imageDate ?? '';
  const { width, height } = pano.tiles.worldSize;
  if (provider === 'google' || provider === 'googleZoom') {

    if (height === 8192) return 4;
    if (height === 1664) return 1;

    if (height === 6656) {
      if (pano.location?.service === 'launch') {
        const targetDate = gen3Dates.get(country) ?? '9999-99';
        const imageMonth = dateToMonthNumber(imageDate);
        const targetMonth = dateToMonthNumber(targetDate);

        if (imageMonth >= dateToMonthNumber('2022-01') ||
          (imageMonth >= targetMonth && (country !== 'US' || lat > 52))) {
          return 'badcam';
        }
      }
      if (gen2Countries.has(country) && imageDate <= '2011-11') {
        return imageDate >= '2010-09' ? 23 : 2;
      }

      return 3;
    }

    return 0;
  }

  else if (provider === 'apple' || provider === 'bing' || provider === 'naver' || provider === 'mapillary') {
    if (pano.location?.service === 2 && provider === 'naver') return 1
    else if (provider === 'mapillary') return pano.location?.service ? 1 : 2
    return pano.location?.service;
  }

  else if (provider === 'yandex') {
    if (!width) return 0;
    if (width >= 17664) return 2;
    else if (width == 5632) return 1;
    return 'trekker';
  }

  return 0;
}

export function createPayload(
  pano: string
): string {
  let payload: any;
  let pano_type: number = 2;
  if (pano.slice(0, 4) == 'CIHM' || pano.length != 22) pano_type = 10
  payload = [
    ["apiv3", null, null, null, "US", null, null, null, null, null, [[0]]],
    ["en", "US"],
    [[[pano_type, pano]]],
    [[1, 2, 3, 4, 8, 6]]
  ];

  return JSON.stringify(payload);
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .trim()
}

function tokenize(text: string) {
  return text.split(/[\s_,.;!?()'"“”«»]+/).filter(Boolean)
}

function sectionmatch(text: string, target: string): boolean {
  const term = normalizeText(target)
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents

  const pattern = new RegExp(`(^${term}$|^${term},|,\\s*${term}$|,\\s*${term},)`, 'i')

  return pattern.test(normalized)
}

export function searchInDescription(
  loc: google.maps.StreetViewLocation,
  searchConfig: SearchInDescriptionConfig,
) {
  if (!searchConfig.searchTerms.trim()) return true

  const searchTerms = searchConfig.searchTerms
    .split(',')
    .map((term) => normalizeText(term.trim()))
    .filter(Boolean)

  if (searchTerms.length === 0) return true

  const description = loc.description ?? ''
  const shortDescription = loc.shortDescription ?? ''
  const combinedDescription = `${description} ${shortDescription}`

  const normalizedText = normalizeText(combinedDescription)
  const words = tokenize(combinedDescription).map(normalizeText)

  const hasMatch = searchTerms.some((term) => {
    switch (searchConfig.searchMode) {
      case 'contains':
        return normalizedText.includes(term)
      case 'fullword':
        const phrase = words.join(' ')
        return new RegExp(`\\b${term}\\b`, 'i').test(phrase)
      case 'startswith':
        return words.some((word) => word.startsWith(term))
      case 'endswith':
        return words.some((word) => word.endsWith(term))
      case 'sectionmatch':
        return sectionmatch(description, term) || sectionmatch(shortDescription, term)
    }
  })

  return searchConfig.filterType === 'exclude' ? !hasMatch : hasMatch
}

/**
 * Returns a timestamp (in ms) for the given date, truncated to the year and month (local time).
 * Example: new Date("Fri Oct 01 2021") → 1630454400000 (for "2021-10")
 */
export function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  //const day = String(now.getDate()).padStart(2, '0')
  return {
    currentYear: year,
    currentDate: `${year}-${month}`,
    //currentDate: `${year}-${month}-${day}`,
  }
}

export function parseDate(date: Date): number {
  const isLocalMidnight = date.getHours() === 0
  const year = isLocalMidnight ? date.getFullYear() : date.getUTCFullYear()
  const month = isLocalMidnight ? date.getMonth() : date.getUTCMonth()
  return Date.UTC(year, month)
}

export function extractMonthYear(date: Date): { month: number; year: number } {
  const isLocalMidnight = date.getHours() === 0
  const year = isLocalMidnight ? date.getFullYear() : date.getUTCFullYear()
  const month = isLocalMidnight ? date.getMonth() + 1 : date.getUTCMonth() + 1
  return { month, year }
}

export function extractDateFromPanoId(pano: string) {
  const year = 2000 + Number(pano.slice(0, 2));
  const month = pano.slice(2, 4);
  const day = pano.slice(4, 6);
  const hour = pano.slice(6, 8);
  const minute = pano.slice(8, 10);
  const second = pano.slice(10, 12);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export function formatTimeStr(datetimeStr: string): string {
  const date = new Date(datetimeStr);
  if (isNaN(date.getTime())) throw new Error("Invalid date string");
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const sec = date.getSeconds().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}`;
}

export function randomPointInPoly(polygon: Polygon) {
  const bounds = polygon.getBounds()
  const x_min = bounds.getEast()
  const x_max = bounds.getWest()
  const y_min = bounds.getSouth()
  const y_max = bounds.getNorth()
  const lat =
    (Math.asin(
      Math.random() * (Math.sin((y_max * Math.PI) / 180) - Math.sin((y_min * Math.PI) / 180)) +
      Math.sin((y_min * Math.PI) / 180),
    ) *
      180) /
    Math.PI
  const lng = x_min + Math.random() * (x_max - x_min)
  return { lat, lng }
}

type LatLng = { lat: number; lng: number }
type PolygonLike = { _leaflet_id?: number; feature?: any; getBounds?: () => any }

class BitsetTwoHash {
  private bytes: Uint8Array
  private bits: number
  private mask: number

  constructor(bitsPow2 = 20) {
    // bitsPow2 = 20 => 2^20 bits = 1,048,576 bits = 131,072 bytes
    this.bits = 1 << bitsPow2
    this.mask = this.bits - 1
    this.bytes = new Uint8Array(this.bits >>> 3)
  }

  // FNV-1a 32-bit hash for small strings
  static fnv1a32(str: string): number {
    let h = 0x811c9dc5 >>> 0
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 0x01000193) >>> 0
    }
    return h >>> 0
  }

  // multiply-mix hash for second hash (fast)
  static mulHash32(n: number): number {
    // 32-bit integer mix (from splitmix-like)
    let x = (n + 0x9e3779b97f4a7c15) >>> 0
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0
    return x >>> 0
  }

  private setBit(idx: number) {
    this.bytes[idx >>> 3] |= 1 << (idx & 7)
  }

  private getBit(idx: number): boolean {
    return (this.bytes[idx >>> 3] & (1 << (idx & 7))) !== 0
  }

  hasTwoHash(keyStr: string, numericSeed?: number): boolean {
    const h1 = BitsetTwoHash.fnv1a32(keyStr)
    const h2 = BitsetTwoHash.mulHash32(numericSeed ?? h1)
    const i1 = (h1 & this.mask) >>> 0
    const i2 = (h2 & this.mask) >>> 0
    return this.getBit(i1) && this.getBit(i2)
  }

  addTwoHash(keyStr: string, numericSeed?: number) {
    const h1 = BitsetTwoHash.fnv1a32(keyStr)
    const h2 = BitsetTwoHash.mulHash32(numericSeed ?? h1)
    const i1 = (h1 & this.mask) >>> 0
    const i2 = (h2 & this.mask) >>> 0
    this.setBit(i1)
    this.setBit(i2)
  }

  toBase64(): string {
    // Convert bytes -> binary string in chunks
    const CH = 0x8000
    let i = 0
    const len = this.bytes.length
    let s = ''
    while (i < len) {
      const sub = this.bytes.subarray(i, Math.min(i + CH, len))
      // apply String.fromCharCode on numbers
      s += String.fromCharCode.apply(null, Array.from(sub))
      i += CH
    }
    return btoa(s)
  }

  static fromBase64(b64: string, bitsPow2 = 20): BitsetTwoHash {
    const bs = new BitsetTwoHash(bitsPow2)
    try {
      const bin = atob(b64)
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      if (arr.length <= bs.bytes.length) {
        bs.bytes.set(arr)
      } else {
        bs.bytes.set(arr.subarray(0, bs.bytes.length))
      }
    } catch (e) {
      // ignore parse errors -> return empty bitset
    }
    return bs
  }

  reset() {
    this.bytes.fill(0)
  }

  // approximate count not supported (would need popcount)
}

export class GridCoordinateGenerator {
  // bounds and steps (degrees)
  private bounds: { south: number; north: number; west: number; east: number }
  private latStep: number
  private lngStep: number

  // edges typed arrays
  private edgeCount = 0
  private yMinArr!: Float64Array
  private yMaxArr!: Float64Array
  private xAtYMinArr!: Float64Array
  private invSlopeArr!: Float64Array

  // active edge table (indices) + currentX
  private activeIdx: Int32Array // capacity = edgeCount
  private activeX!: Float64Array
  private activeCount = 0

  // iteration / offsets
  private iteration = 0
  private readonly golden = 0.618033988749895

  // bitset visited
  private bitset: BitsetTwoHash
  private readonly BITSET_POW2: number

  // storage key
  private readonly STORAGE_KEY: string

  // resume state
  private currentRowIndex = 0

  // save thinning
  private yieldsSinceSave = 0
  private readonly SAVE_EVERY_YIELDS = 6

  constructor(polygon: PolygonLike, radiusMeters: number, opts?: { bitsetPow2?: number }) {
    this.STORAGE_KEY = `grid_ultra_${String((polygon as any)._leaflet_id || (polygon.feature && polygon.feature.id) || Math.random().toString(36).slice(2, 8))}`
    this.BITSET_POW2 = opts?.bitsetPow2 ?? 20
    this.bitset = new BitsetTwoHash(this.BITSET_POW2)

    // bounds
    if (!polygon.getBounds) throw new Error('polygon must provide getBounds()')
    const b = polygon.getBounds()
    this.bounds = {
      south: b.getSouth(),
      north: b.getNorth(),
      west: b.getWest(),
      east: b.getEast()
    }

    // spacing
    const spacingMeters = radiusMeters * 2 * 0.866
    const midLat = (this.bounds.south + this.bounds.north) / 2
    const metersPerDegLat = 111320
    const metersPerDegLng = 111320 * Math.cos(midLat * Math.PI / 180)
    this.latStep = spacingMeters / metersPerDegLat
    this.lngStep = spacingMeters / metersPerDegLng

    // build edges into typed arrays
    this.buildEdgeArrays(polygon)

    // active arrays init (max capacity = edgeCount)
    this.activeIdx = new Int32Array(this.edgeCount)
    this.activeX = new Float64Array(this.edgeCount)

    // try restore state
    this.restoreState()
  }

  /** Build typed arrays from polygon feature coordinates (ignore horizontal edges). */
  private buildEdgeArrays(polygon: PolygonLike) {
    const feature = (polygon as any).feature
    if (!feature || !feature.geometry) {
      this.edgeCount = 0
      this.yMinArr = new Float64Array(0)
      this.yMaxArr = new Float64Array(0)
      this.xAtYMinArr = new Float64Array(0)
      this.invSlopeArr = new Float64Array(0)
      return
    }

    const coords = feature.geometry.coordinates
    const polygons = feature.geometry.type === 'MultiPolygon' ? coords : [coords]

    // count non-horizontal edges
    let cnt = 0
    for (const rings of polygons) {
      for (const ring of rings as any[]) {
        const n = ring.length
        for (let i = 0; i < n - 1; i++) {
          const p1 = ring[i], p2 = ring[i + 1]
          if (Math.abs(p2[1] - p1[1]) < 1e-12) continue
          cnt++
        }
      }
    }

    this.edgeCount = cnt
    this.yMinArr = new Float64Array(cnt)
    this.yMaxArr = new Float64Array(cnt)
    this.xAtYMinArr = new Float64Array(cnt)
    this.invSlopeArr = new Float64Array(cnt)

    // fill
    let idx = 0
    for (const rings of polygons) {
      for (const ring of rings as any[]) {
        const n = ring.length
        for (let i = 0; i < n - 1; i++) {
          const p1 = ring[i], p2 = ring[i + 1]
          const lng1 = p1[0], lat1 = p1[1]
          const lng2 = p2[0], lat2 = p2[1]
          if (Math.abs(lat2 - lat1) < 1e-12) continue

          const yMin = Math.min(lat1, lat2)
          const yMax = Math.max(lat1, lat2)
          const xAtYMin = lat1 < lat2 ? lng1 : lng2
          const xAtYMax = lat1 < lat2 ? lng2 : lng1
          const invSlope = (xAtYMax - xAtYMin) / (yMax - yMin)

          this.yMinArr[idx] = yMin
          this.yMaxArr[idx] = yMax
          this.xAtYMinArr[idx] = xAtYMin
          this.invSlopeArr[idx] = invSlope
          idx++
        }
      }
    }

    // sort by yMin ascending (parallel arrays)
    if (this.edgeCount > 1) {
      const order = new Uint32Array(this.edgeCount)
      for (let i = 0; i < this.edgeCount; i++) order[i] = i
      const orderArr = Array.from(order)
      orderArr.sort((a, b) => this.yMinArr[a] - this.yMinArr[b])
      const newYMin = new Float64Array(this.edgeCount)
      const newYMax = new Float64Array(this.edgeCount)
      const newXAt = new Float64Array(this.edgeCount)
      const newInv = new Float64Array(this.edgeCount)
      for (let i = 0; i < this.edgeCount; i++) {
        const o = orderArr[i]
        newYMin[i] = this.yMinArr[o]
        newYMax[i] = this.yMaxArr[o]
        newXAt[i] = this.xAtYMinArr[o]
        newInv[i] = this.invSlopeArr[o]
      }
      this.yMinArr = newYMin
      this.yMaxArr = newYMax
      this.xAtYMinArr = newXAt
      this.invSlopeArr = newInv
    }
  }

  /** Save minimal state to localStorage: iteration, currentRowIndex, bitset */
  private saveState() {
    try {
      const meta = {
        iteration: this.iteration,
        currentRowIndex: this.currentRowIndex,
        latStep: this.latStep,
        lngStep: this.lngStep,
        bounds: this.bounds,
        bitsetPow2: this.BITSET_POW2
      }
      localStorage.setItem(`${this.STORAGE_KEY}_meta`, JSON.stringify(meta))
      localStorage.setItem(`${this.STORAGE_KEY}_bits`, this.bitset.toBase64())
    } catch (e) {
      console.warn('Grid saveState error', e)
    }
  }

  private restoreState() {
    try {
      const metaStr = localStorage.getItem(`${this.STORAGE_KEY}_meta`)
      if (metaStr) {
        const meta = JSON.parse(metaStr)
        this.iteration = meta.iteration || 0
        this.currentRowIndex = meta.currentRowIndex || 0
      }
      const bits = localStorage.getItem(`${this.STORAGE_KEY}_bits`)
      if (bits) {
        this.bitset = BitsetTwoHash.fromBase64(bits, this.BITSET_POW2)
      }
    } catch (e) {
      console.warn('Grid restoreState error', e)
    }
  }

  public clearSavedState() {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_meta`)
      localStorage.removeItem(`${this.STORAGE_KEY}_bits`)
      this.bitset.reset()
      this.iteration = 0
      this.currentRowIndex = 0
    } catch (e) {
      console.warn('clearSavedState error', e)
    }
  }

  /** Quantize grid index for lat/lng (integers) */
  private quantizeLatIndex(lat: number): number {
    return Math.round((lat - this.bounds.south) / this.latStep)
  }
  private quantizeLngIndex(lng: number): number {
    return Math.round((lng - this.bounds.west) / this.lngStep)
  }

  /** Make a compact string key for hashing (short) */
  private makeKeyStr(latIdx: number, lngIdx: number): string {
    // small string representation: "l<lat>,g<lng>" is compact
    return `${latIdx},${lngIdx}`
  }

  /** The core: AET-based generateBatch */
  *generateBatch(batchSize: number): Generator<LatLng[], void, unknown> {
    const batch: LatLng[] = []
    // row range computed from bounds
    const totalRows = Math.floor((this.bounds.north - this.bounds.south) / this.latStep) + 1
    // fractional offsets for this iteration -> vary grid each iteration
    const frac = (this.iteration * this.golden) % 1
    const latStartOffset = frac * this.latStep // shift rows fractionally
    const lngFrac = ((this.iteration + 7) * 0.7548776662466927) % 1 // second irrational for lng
    const lngStartFrac = lngFrac * this.lngStep

    // AET maintenance pointers
    let edgeAddPtr = 0
    this.activeCount = 0
    let row = this.currentRowIndex || 0

    // baseRowLat computed as bounds.south + latStartOffset + row * latStep
    for (; row < totalRows; row++) {
      const lat = this.bounds.south + latStartOffset + row * this.latStep

      // add edges whose yMin <= lat
      while (edgeAddPtr < this.edgeCount && this.yMinArr[edgeAddPtr] <= lat) {
        // only activate if lat < yMax (edge spans current lat)
        if (lat <= this.yMaxArr[edgeAddPtr]) {
          // compute initial currentX = xAtYMin + (lat - yMin) * invSlope
          const curX = this.xAtYMinArr[edgeAddPtr] + (lat - this.yMinArr[edgeAddPtr]) * this.invSlopeArr[edgeAddPtr]
          this.activeIdx[this.activeCount] = edgeAddPtr
          this.activeX[this.activeCount] = curX
          this.activeCount++
        }
        edgeAddPtr++
      }

      // remove edges where yMax <= lat (they no longer intersect this row)
      // perform in-place compaction
      if (this.activeCount > 0) {
        let w = 0
        for (let i = 0; i < this.activeCount; i++) {
          const ei = this.activeIdx[i]
          if (lat <= this.yMaxArr[ei]) {
            // still active
            this.activeIdx[w] = this.activeIdx[i]
            this.activeX[w] = this.activeX[i]
            w++
          }
        }
        this.activeCount = w
      }

      if (this.activeCount === 0) {
        // nothing intersects this row
        this.currentRowIndex = row + 1
        continue
      }

      // Build array of pairs (currentX) sorted ascending
      if (this.activeCount <= 16) {
        // insertion sort on activeX & activeIdx (stable)
        for (let i = 1; i < this.activeCount; i++) {
          const ai = this.activeIdx[i]
          const ax = this.activeX[i]
          let j = i - 1
          while (j >= 0 && this.activeX[j] > ax) {
            this.activeIdx[j + 1] = this.activeIdx[j]
            this.activeX[j + 1] = this.activeX[j]
            j--
          }
          this.activeIdx[j + 1] = ai
          this.activeX[j + 1] = ax
        }
      } else {
        // build small array of indices then sort by activeX using built-in sort
        const idxArr = new Array<number>(this.activeCount)
        for (let i = 0; i < this.activeCount; i++) idxArr[i] = i
        idxArr.sort((a, b) => this.activeX[a] - this.activeX[b])
        // reorder activeIdx & activeX based on sorted idxArr
        const tmpIdx = new Int32Array(this.activeCount)
        const tmpX = new Float64Array(this.activeCount)
        for (let i = 0; i < this.activeCount; i++) {
          tmpIdx[i] = this.activeIdx[idxArr[i]]
          tmpX[i] = this.activeX[idxArr[i]]
        }
        // copy back
        for (let i = 0; i < this.activeCount; i++) {
          this.activeIdx[i] = tmpIdx[i]
          this.activeX[i] = tmpX[i]
        }
      }

      const rowHexOffset = (row & 1) ? (this.lngStep / 2) : 0
      const totalLngOffset = rowHexOffset + lngStartFrac

      for (let ai = 0; ai + 1 < this.activeCount; ai += 2) {
        let xL = this.activeX[ai]
        let xR = this.activeX[ai + 1]
        const firstIdx = Math.ceil((xL - this.bounds.west - totalLngOffset) / this.lngStep)

        for (let lngIdx = firstIdx;; lngIdx++) {
          const lng = this.bounds.west + lngIdx * this.lngStep + totalLngOffset
          if (lng > xR) break

          const latQ = this.quantizeLatIndex(lat)
          const lngQ = this.quantizeLngIndex(lng)
          const key = this.makeKeyStr(latQ, lngQ)
          // use two-hash check/add
          if (!this.bitset.hasTwoHash(key, latQ ^ (lngQ << 1))) {
            this.bitset.addTwoHash(key, latQ ^ (lngQ << 1))
            batch.push({ lat, lng })
            if (batch.length >= batchSize) {
              // update resume pointers & save occasionally
              this.currentRowIndex = row
              this.yieldsSinceSave++
              if (this.yieldsSinceSave >= this.SAVE_EVERY_YIELDS) {
                this.saveState()
                this.yieldsSinceSave = 0
              }
              // yield a copy of batch
              yield batch.splice(0, batch.length)
            }
          }
        }
      } // end pairs processing

      for (let i = 0; i < this.activeCount; i++) {
        const edgeIndex = this.activeIdx[i]
        this.activeX[i] += this.invSlopeArr[edgeIndex] * this.latStep
      }

      // end row -> next
      this.currentRowIndex = row + 1
    } // end rows

    // flush remaining
    if (batch.length > 0) {
      this.saveState()
      yield batch.splice(0, batch.length)
    }

    this.iteration++
    this.currentRowIndex = 0
    this.yieldsSinceSave = 0
    this.saveState()
  }

  getCheckedApproxBytes() { return (this.BITSET_POW2 >>> 3) } // approximate bytes allocated
}

export function radians_to_degrees(radians: number) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

export function distanceBetween(coords1: LatLng, coords2: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180 // Converts numeric degrees to radians

  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(coords2.lat - coords1.lat)
  const dLon = toRad(coords2.lng - coords1.lng)
  const lat1 = toRad(coords1.lat)
  const lat2 = toRad(coords2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

const A$1 = 114.59155902616465;
const SCALE = 111319.49077777778;
function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

export function tencentToGcj02([x, y]: [number, number]) {
  return [
    x / SCALE,
    A$1 * Math.atan(Math.exp(deg2rad(y / SCALE))) - 90
  ];
}

export function randomInRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min + 1) + min) * 100) / 100
}

export function getPolygonName(properties: Polygon['feature']['properties']) {
  return (
    properties.name ||
    properties.NAME ||
    properties.NAME_1 ||
    properties.NAMELSAD ||
    properties.NAMELSAD10 ||
    properties.city ||
    properties.CITY ||
    properties.county ||
    properties.COUNTY ||
    properties.COUNTY_STATE_CODE ||
    properties.COUNTY_STATE_NAME ||
    properties.PRNAME ||
    properties.prov_name_en ||
    properties.state ||
    properties.STATE ||
    properties.country ||
    properties.COUNTRY ||
    properties.id ||
    properties.ID ||
    'Untitled Polygon'
  )
}

export function changePolygonName(properties: Polygon['feature']['properties']) {
  // if (typeof polygon.feature.properties.code == 'undefined') {
  const newName = prompt('New name for polygon: ')
  if (typeof newName === 'string' && newName !== '') {
    properties.name = newName
  }
  //let countryCode = prompt("Country code (optional): ");
  //polygon.feature.properties.code = countryCode;
  // }
}

export async function readFileAsText(file: File) {
  const result = await new Promise<string>((resolve) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result as string)
    fileReader.readAsText(file)
  })
  return result
}

export function isValidGeoJSON(data: unknown) {
  if (typeof data !== 'object' || data === null) return false

  const type = (data as { type?: unknown }).type
  return type === 'Feature' || type === 'FeatureCollection'
}

function opkToRotationMatrixYXZ(omega: number, phi: number, kappa: number): number[][] {
  const cz = Math.cos(phi), sz = Math.sin(phi);        // (phi)
  const cx = Math.cos(-omega), sx = Math.sin(-omega);  // (-omega)
  const cy = Math.cos(kappa), sy = Math.sin(kappa);    // (kappa)

  // ZXY = Ry * Rx * Rz
  return [
    [cz * cy - sz * sx * sy, -sz * cx, cz * sy + sz * sx * cy],
    [sz * cy + cz * sx * sy, cz * cx, sz * sy - cz * sx * cy],
    [-cx * sy, sx, cx * cy]
  ];
}

function matrixToEulerYXZ(m: number[][]): { heading: number, pitch: number, roll: number } {
  let heading: number, pitch: number, roll: number;

  if (Math.abs(m[2][1]) < 0.999999) {
    pitch = Math.asin(m[2][1]);
    heading = Math.atan2(-m[2][0], m[2][2]);
    roll = Math.atan2(-m[0][1], m[1][1]);
  } else {
    pitch = Math.PI / 2 * Math.sign(m[2][1]);
    heading = Math.atan2(m[1][0], m[0][0]);
    roll = 0;
  }

  return { heading, pitch, roll };
}

export function opk_to_hpr(
  omega: number, phi: number, kappa: number
): { heading: number, pitch: number, roll: number } {
  const m = opkToRotationMatrixYXZ(deg2rad(omega), deg2rad(phi), deg2rad(kappa));
  return matrixToEulerYXZ(m);
}

export function headingToMapillaryX(heading: number, imageHeading: number = 0): number {
  let relativeHeading = heading - imageHeading;
  relativeHeading = ((relativeHeading % 360) + 360) % 360;
  let x = 0.5 - (relativeHeading / 360);
  if (x < 0) x += 1;
  return Math.max(0, Math.min(1, x));
}

export function pitchToMapillaryY(pitch: number): number {
  const y = 0.5 - (pitch / 180);
  return Math.max(0, Math.min(1, y));
}

export function calculateTilesInRadius(lat: number, lng: number, radius: number, zoom: number,): number[] {
  const tileSizeMeters = 40075000 / Math.pow(2, zoom);
  const [tileX, tileY] = wgs84_to_tile_coord(lat, lng, zoom);

  let minX = tileX, maxX = tileX, minY = tileY, maxY = tileY;
  if (radius > tileSizeMeters / 2) {
    const tileRadius = Math.ceil(radius / tileSizeMeters);
    minX = tileX - tileRadius;
    maxX = tileX + tileRadius;
    minY = tileY - tileRadius;
    maxY = tileY + tileRadius;
  }
  return [minX, minY, maxX, maxY]
}