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

interface GridOptions {
  bitsetPow2?: number
  bitsetBytesLimit?: number
  insertionSortThreshold?: number
  dedupeEpsilon?: number
  debug?: boolean
}

interface PolygonState {
  iteration: number
  currentRow: number
  sortedPtr: number
  oddIntersectionsSeen: number
}

const POLY_STATES = new WeakMap<Polygon, PolygonState>()

export class GridGenerator {
  // Bounds & grid
  private bounds: { south: number; north: number; west: number; east: number }
  private latStep: number
  private lngStep: number
  private rows: number
  private cols: number

  // SOA edge arrays
  private edgeCount = 0
  private yMinArr!: Float32Array
  private yMaxArr!: Float32Array
  private xAtYMinArr!: Float32Array
  private invSlopeArr!: Float32Array
  private sortedByY!: Int32Array

  // AET
  private activeIdx!: Int32Array
  private activeX!: Float64Array // use Float64 for intersection precision
  private activeCap = 0

  // temp arrays preallocated (no per-row alloc)
  private tmpIdx!: Int32Array
  private tmpX!: Float64Array

  // bitset
  private bitWords!: Uint32Array
  private bitCount = 0
  private bitMask = 0

  // state
  private state: PolygonState

  // config
  private insertionSortThreshold: number
  private dedupeEpsilon: number
  private debug: boolean
  private readonly golden = 0.618033988749895

  // safety
  private readonly BITSET_BYTES_LIMIT: number // max bytes for bitset to allow (avoid OOM)

  constructor(polygon: Polygon, radiusMeters: number, opts?: GridOptions) {
    let ll: any = polygon.getLatLngs()
    
    // Handle nested arrays - flatten to get the actual coordinate array
    // getLatLngs() can return LatLng[], LatLng[][], or LatLng[][][]
    while (Array.isArray(ll) && ll.length > 0 && Array.isArray(ll[0])) {
      ll = ll[0]
    }
    
    // Verify we have valid coordinates
    if (!Array.isArray(ll) || ll.length < 3) {
      console.error('Invalid polygon structure:', polygon.getLatLngs())
      throw new Error('Invalid polygon coords')
    }
    
    // Map to [lng, lat] coordinate pairs
    let coords : [number,number][] = ll.map((p:any) => {
      if (p && typeof p.lat === 'number' && typeof p.lng === 'number') {
        return [p.lng, p.lat]
      }
      throw new Error('Invalid coordinate point in polygon')
    })
    
    if (!coords || coords.length < 3) throw new Error('Invalid polygon coords')

    // get or create in-memory polygon state
    let st = POLY_STATES.get(polygon)
    if (!st) {
      st = { iteration: 0, currentRow: 0, sortedPtr: 0, oddIntersectionsSeen: 0 }
      POLY_STATES.set(polygon, st)
    }
    this.state = st

    this.insertionSortThreshold = opts?.insertionSortThreshold ?? 64
    this.dedupeEpsilon = opts?.dedupeEpsilon ?? 1e-9
    this.debug = !!opts?.debug
    this.BITSET_BYTES_LIMIT = opts?.bitsetBytesLimit ?? 64 * 1024 * 1024 // default 64MB safe limit

    // compute bounds
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    for (const [lng, lat] of coords) {
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
    }
    const eps = 1e-12
    this.bounds = { south: minLat - eps, north: maxLat + eps, west: minLng - eps, east: maxLng + eps }

    // compute grid step degrees
    const spacingMeters = radiusMeters * 2 * 0.866
    const midLat = (this.bounds.south + this.bounds.north) / 2
    const metersPerDegLat = 111320
    const metersPerDegLng = 111320 * Math.cos(midLat * Math.PI / 180)
    this.latStep = spacingMeters / metersPerDegLat
    this.lngStep = spacingMeters / metersPerDegLng

    // compute rows & cols
    this.rows = Math.floor((this.bounds.north - this.bounds.south) / this.latStep) + 1
    this.cols = Math.floor((this.bounds.east - this.bounds.west) / this.lngStep) + 1

    // safety: check bitset size
    const totalBits = this.rows * this.cols
    const totalBytes = Math.ceil(totalBits / 8)
    if (totalBytes > this.BITSET_BYTES_LIMIT) {
      throw new Error(`Bitset size ${totalBytes} bytes exceeds limit ${this.BITSET_BYTES_LIMIT}. Choose larger grid step or use sparse mode.`)
    }

    // allocate dense bitset words
    const wordCount = Math.ceil(totalBits / 32)
    this.bitWords = new Uint32Array(wordCount)
    this.bitCount = totalBits
    this.bitMask = totalBits - 1 // not used for mapping since we use direct index calc

    // build SOA edge arrays
    this.buildEdgeSOA(coords)

    // allocate active arrays and temp arrays based on edgeCount
    this.activeCap = Math.max(8, this.edgeCount)
    this.activeIdx = new Int32Array(this.activeCap)
    this.activeX = new Float64Array(this.activeCap)
    this.tmpIdx = new Int32Array(this.activeCap)
    this.tmpX = new Float64Array(this.activeCap)
  }

  // -------------------- helpers --------------------
  private normalizeCoords(input: any): [number, number][] {
    if (!input) throw new Error('Empty polygon input')

    if (Array.isArray(input)) {
      const first = input[0]
      if (!first) return []
      if (Array.isArray(first) && first.length >= 2) {
        // [[lng,lat], ...]
        return input as [number, number][]
      } else if (typeof first === 'object' && 'lat' in first && 'lng' in first) {
        return (input as LatLng[]).map(p => [p.lng, p.lat])
      }
    }
    // GeoJSON feature
    if (input.geometry && input.geometry.type) {
      const type = input.geometry.type
      const coords = input.geometry.coordinates
      if (type === 'Polygon') {
        return coords[0] as [number, number][]
      }
      if (type === 'MultiPolygon') {
        return coords[0][0] as [number, number][]
      }
    }
    throw new Error('Unsupported polygon input format')
  }

  private buildEdgeSOA(coords: [number, number][]) {
    // collect edges excluding horizontal edges
    const tmp: { yMin: number; yMax: number; xAtYMin: number; invSlope: number }[] = []
    const n = coords.length
    for (let i = 0; i < n; i++) {
      const [x1, y1] = coords[i]
      const [x2, y2] = coords[(i + 1) % n]
      if (Math.abs(y2 - y1) < 1e-12) continue
      if (y1 < y2) {
        tmp.push({ yMin: y1, yMax: y2, xAtYMin: x1, invSlope: (x2 - x1) / (y2 - y1) })
      } else {
        tmp.push({ yMin: y2, yMax: y1, xAtYMin: x2, invSlope: (x1 - x2) / (y1 - y2) })
      }
    }

    this.edgeCount = tmp.length
    this.yMinArr = new Float32Array(this.edgeCount)
    this.yMaxArr = new Float32Array(this.edgeCount)
    this.xAtYMinArr = new Float32Array(this.edgeCount)
    this.invSlopeArr = new Float32Array(this.edgeCount)

    for (let i = 0; i < this.edgeCount; i++) {
      const e = tmp[i]
      this.yMinArr[i] = e.yMin
      this.yMaxArr[i] = e.yMax
      this.xAtYMinArr[i] = e.xAtYMin
      this.invSlopeArr[i] = e.invSlope
    }

    // sorted indices by yMin (Int32Array)
    const idxs: number[] = Array.from({ length: this.edgeCount }, (_, i) => i)
    idxs.sort((a, b) => this.yMinArr[a] - this.yMinArr[b])
    this.sortedByY = new Int32Array(idxs)
  }

  // ---------------- bitset operations ----------------
  private setBitByIndex(bitIndex: number) {
    const w = (bitIndex >>> 5)
    const b = bitIndex & 31
    this.bitWords[w] |= (1 << b)
  }

  private testBitByIndex(bitIndex: number): boolean {
    const w = (bitIndex >>> 5)
    const b = bitIndex & 31
    return (this.bitWords[w] & (1 << b)) !== 0
  }

  // ---------------- in-place quicksort + insertionSort ----------------
  private insertionSort(activeCount: number) {
    // typed arrays activeX & activeIdx
    const activeX = this.activeX
    const activeIdx = this.activeIdx
    for (let i = 1; i < activeCount; i++) {
      const ax = activeX[i]
      const ai = activeIdx[i]
      let j = i - 1
      while (j >= 0 && activeX[j] > ax) {
        activeX[j + 1] = activeX[j]
        activeIdx[j + 1] = activeIdx[j]
        j--
      }
      activeX[j + 1] = ax
      activeIdx[j + 1] = ai
    }
  }

  private quicksortInPlace(lo: number, hi: number) {
    const activeX = this.activeX
    const activeIdx = this.activeIdx
    // non-recursive stack
    const stack: number[] = []
    stack.push(lo, hi)
    while (stack.length) {
      const r = stack.pop()!; const l = stack.pop()!
      if (l >= r) continue
      let i = l, j = r
      const pivot = activeX[(l + r) >> 1]
      while (i <= j) {
        while (activeX[i] < pivot) i++
        while (activeX[j] > pivot) j--
        if (i <= j) {
          // swap
          const tx = activeX[i]; activeX[i] = activeX[j]; activeX[j] = tx
          const ti = activeIdx[i]; activeIdx[i] = activeIdx[j]; activeIdx[j] = ti
          i++; j--
        }
      }
      if (l < j) { stack.push(l, j) }
      if (i < r) { stack.push(i, r) }
    }
  }

  // ---------------- main generator ----------------
  *generateBatch(batchSize: number): Generator<LatLng[], void, unknown> {
    const batch: LatLng[] = []
    const st = this.state

    let row = st.currentRow || 0
    let sortedPtr = st.sortedPtr || 0
    let activeCount = 0

    // precompute constants
    const latStep = this.latStep
    const lngStep = this.lngStep
    const west = this.bounds.west
    const east = this.bounds.east
    const rows = this.rows
    const dedupeEps = this.dedupeEpsilon
    const insertThresh = this.insertionSortThreshold

    // iteration fractional offsets
    const fracLat = (st.iteration * this.golden) % 1
    const fracLng = ((st.iteration * 0.7548776662466927) % 1)
    const latOffset = fracLat * latStep
    const lngOffsetBase = fracLng * lngStep

    // main rows loop
    for (; row < rows; row++) {
      const lat = this.bounds.south + latOffset + row * latStep
      // add new edges whose yMin <= lat
      while (sortedPtr < this.edgeCount && this.yMinArr[this.sortedByY[sortedPtr]] <= lat) {
        const ei = this.sortedByY[sortedPtr]
        if (lat < this.yMaxArr[ei]) {
          if (activeCount >= this.activeCap) {
            // should not happen because we sized activeCap >= edgeCount, but guard
            this.resizeActiveCapacity(activeCount + 4)
          }
          this.activeIdx[activeCount] = ei
          this.activeX[activeCount] = this.xAtYMinArr[ei] + (lat - this.yMinArr[ei]) * this.invSlopeArr[ei]
          activeCount++
        }
        sortedPtr++
      }

      // remove expired edges (yMax <= lat)
      if (activeCount > 0) {
        let w = 0
        for (let i = 0; i < activeCount; i++) {
          const ei = this.activeIdx[i]
          if (lat < this.yMaxArr[ei]) {
            this.activeIdx[w] = this.activeIdx[i]
            this.activeX[w] = this.activeX[i]
            w++
          }
        }
        activeCount = w
      }

      if (activeCount === 0) continue

      // sort active edges by X (in-place)
      if (activeCount <= insertThresh) {
        this.insertionSort(activeCount)
      } else {
        this.quicksortInPlace(0, activeCount - 1)
      }

      // dedupe nearly-equal intersections (tangents etc.)
      // compact into tmp arrays, then copy back to active arrays
      let m = 0
      let prevX = Number.NaN
      for (let i = 0; i < activeCount; i++) {
        const ax = this.activeX[i]
        if (i === 0 || Math.abs(ax - prevX) > dedupeEps) {
          this.tmpX[m] = ax
          this.tmpIdx[m] = this.activeIdx[i]
          prevX = ax
          m++
        } else {
          // near-duplicate intersection: skip this one (tangent)
          // do not advance m
        }
      }
      // if dedup removed items, copy back
      if (m < activeCount) {
        for (let i = 0; i < m; i++) {
          this.activeX[i] = this.tmpX[i]
          this.activeIdx[i] = this.tmpIdx[i]
        }
        activeCount = m
      }

      // if odd intersections -> geometry problem; drop last intersection and count
      if ((activeCount & 1) === 1) {
        st.oddIntersectionsSeen = (st.oddIntersectionsSeen || 0) + 1
        // drop last
        activeCount = activeCount - 1
      }

      if (activeCount === 0) continue

      // precompute latIdx (quantized) for this row -> used for index calc
      const latIdx = Math.round((lat - this.bounds.south) / latStep) | 0

      // iterate pairs
      for (let a = 0; a < activeCount; a += 2) {
        const xL = this.activeX[a]
        const xR = this.activeX[a + 1]
        if (xR <= west || xL >= east) continue
        const minLng = Math.max(west, xL)
        const maxLng = Math.min(east, xR)

        // compute col index range (integer) with offset
        // apply row parity hex offset (alternate rows)
        const rowHexOffset = (row & 1) ? (lngStep * 0.5) : 0
        const totalLngOffset = lngOffsetBase + rowHexOffset

        const firstCol = Math.ceil((minLng - west - totalLngOffset) / lngStep) | 0
        const lastCol = Math.floor((maxLng - west - totalLngOffset) / lngStep) | 0

        if (lastCol < firstCol) continue

        // loop columns - simple integer increment
        for (let col = firstCol; col <= lastCol; col++) {
          const lng = west + col * lngStep + totalLngOffset
          // compute unique bit index = latIdx * cols + col
          const bitIndex = latIdx * this.cols + col
          if (bitIndex < 0 || bitIndex >= this.bitCount) continue // safety
          if (this.testBitByIndex(bitIndex)) continue
          this.setBitByIndex(bitIndex)
          batch.push({ lat, lng })
          if (batch.length >= batchSize) {
            // save resume pointers in-memory
            st.currentRow = row
            st.sortedPtr = sortedPtr
            // yield
            yield batch.splice(0, batch.length)
          }
        }
      }

      // incrementally update activeX for next row
      for (let i = 0; i < activeCount; i++) {
        const ei = this.activeIdx[i]
        // add delta = invSlope * latStep
        this.activeX[i] += this.invSlopeArr[ei] * latStep
      }
    } // end rows

    // flush remaining
    if (batch.length > 0) {
      st.currentRow = this.rows
      st.sortedPtr = this.edgeCount
      yield batch.splice(0, batch.length)
    }

    // finished pass: bump iteration and reset pointers
    st.iteration = (st.iteration || 0) + 1
    st.currentRow = 0
    st.sortedPtr = 0
    // keep bitset to avoid re-visiting points in future iterations in same page
  }

  private resizeActiveCapacity(newCap: number) {
    const cap = Math.max(newCap, this.activeCap * 2)
    const nActive = this.activeCap
    const newActiveIdx = new Int32Array(cap)
    const newActiveX = new Float64Array(cap)
    newActiveIdx.set(this.activeIdx.subarray(0, nActive))
    newActiveX.set(this.activeX.subarray(0, nActive))
    this.activeIdx = newActiveIdx
    this.activeX = newActiveX
    this.tmpIdx = new Int32Array(cap)
    this.tmpX = new Float64Array(cap)
    this.activeCap = cap
  }

  // clear bitset and state
  public reset(polygon?: Polygon) {
    if (polygon) {
      const st = POLY_STATES.get(polygon)
      if (st) {
        st.iteration = 0
        st.currentRow = 0
        st.sortedPtr = 0
        st.oddIntersectionsSeen = 0
      }
    }
    // clear bitset
    this.bitWords.fill(0)
  }

  public getState(): PolygonState {
    return this.state
  }

  public approxVisitedCountSample(): number {
    // sample-based estimate of set bits
    let sum = 0
    const words = this.bitWords
    const step = Math.max(1, Math.floor(words.length / 1024))
    let samples = 0
    for (let i = 0; i < words.length; i += step) {
      samples++
      sum += popcount32(words[i])
    }
    if (samples === 0) return 0
    const avg = sum / samples
    return Math.round(avg * words.length)
  }

  /**
   * Clear saved state for this generator.
   * Called when polygon is deleted or generation is complete.
   * Since this implementation uses in-memory state (WeakMap), this resets the state.
   */
  public clearSavedState(): void {
    this.reset()
  }
}

// popcount for 32-bit words
function popcount32(x: number) {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24
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