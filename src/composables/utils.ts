import proj4 from 'proj4';


export function sendNotification(title: string, body: string) {
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  } catch (error) {
    console.warn('Notification failed:', error)
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
  if (provider === 'google') {

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
    if (width === 17664) return 2;
    if (width === 5632) return 1;
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
  return {
    currentYear: year,
    currentDate: `${year}-${month}`,
  }
}

// this will parse the Date object from res.time[i] (like Fri Oct 01 2021 00:00:00 GMT-0700 (Pacific Daylight Time)) to a local timestamp, like Date.parse("2021-09") == 1630454400000 for Pacific Daylight Time
export function parseDate(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const monthStr = month < 10 ? `0${month}` : `${month}`
  return Date.parse(`${year}-${monthStr}`)
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

export const isDate = (date: string) => {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
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