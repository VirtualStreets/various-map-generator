import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/assets/leaflet-draw/leaflet.draw.js' // npm one is broken for rectangles so we use a patched one
import '@/assets/leaflet-draw/leaflet.draw.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster.freezable/dist/leaflet.markercluster.freezable.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-contextmenu'
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'

import markerBlue from '@/assets/markers/marker-blue.png'
import markerRed from '@/assets/markers/marker-red.png'
import markerViolet from '@/assets/markers/marker-violet.png'
import markerGreen from '@/assets/markers/marker-green.png'
import markerPink from '@/assets/markers/marker-pink.png'

import { ref, watch } from 'vue'
import { useStorage, useColorMode } from '@vueuse/core'
import { settings } from '@/settings'
import { isValidGeoJSON, getPolygonName, readFileAsText } from '@/composables/utils.ts'
import { BaiduLayer } from './layers/baiduLayer'
import { bingBaseLayer, bingTerrainLayer, bingStreetideLayer, bingBaseDarkLayer } from './layers/bingLayer'
import { YandexLayer } from './layers/yandexLayer'
import { AppleLayer } from './layers/appleLayer'
import { TencentCoverageLayer } from './layers/tencentLayer'
import { NaverLayer } from './layers/naverLayer'
import { OpenMapLayer } from './layers/openmapLayer'
import { MapillaryLayer } from './layers/mapillaryLayer'
import { ASIGLayer } from './layers/asigLayer'
import { JaLayer } from './layers/jaLayer'
import { VegbilderLayer } from './layers/vegbilderLayer'
import { ZoomCoverageLayer } from './layers/panoramasLayer'
import {
  ColorScheme,
  CARTO_MAPS_TEMPLATE,
  TENCENT_MAPS_TEMPLATE,
  GOOGLE_MAPS_TEMPLATE,
  OSM_TEMPLATE,
  PETAL_MAPS_TEMPLATE
} from './constants'

import { useStore } from '@/store'
const { selected, select, state } = useStore()

let map: L.Map
const currentZoom = ref(1)
const themeMode = useColorMode()

let roadmapBaseLayer = L.tileLayer(themeMode.value == 'dark' ? GOOGLE_MAPS_TEMPLATE.Roadmap_Dark : GOOGLE_MAPS_TEMPLATE.Roadmap, { maxZoom: 19 })
let roadmapLabelsLayer = L.tileLayer(themeMode.value == 'dark' ? GOOGLE_MAPS_TEMPLATE.Labels_Dark : GOOGLE_MAPS_TEMPLATE.Roadmap_Labels, { pane: 'labelPane', maxZoom: 19 },)
let roadmapLayer = L.layerGroup([roadmapBaseLayer, roadmapLabelsLayer])

const terrainBaseLayer = L.tileLayer(themeMode.value == 'dark' ? GOOGLE_MAPS_TEMPLATE.Terrain_Dark : GOOGLE_MAPS_TEMPLATE.Terrain, { maxZoom: 19 })
const terrainLayer = L.layerGroup([terrainBaseLayer, roadmapLabelsLayer])

const satelliteBaseLayer = L.tileLayer(GOOGLE_MAPS_TEMPLATE.Satellite, { maxZoom: 19 })
const satelliteLabelsLayer = L.tileLayer(GOOGLE_MAPS_TEMPLATE.Satellite_Labels, { pane: 'labelPane', maxZoom: 19 },)
const satelliteLayer = L.layerGroup([satelliteBaseLayer, satelliteLabelsLayer])

const osmLayer = L.tileLayer(OSM_TEMPLATE.Standard, { maxZoom: 18 })

const cartoLayer = L.tileLayer(themeMode.value == 'dark' ? CARTO_MAPS_TEMPLATE.Dark : CARTO_MAPS_TEMPLATE.Light)

let bingMapsLayer = L.layerGroup([themeMode.value == 'light' ? bingBaseLayer : bingBaseDarkLayer, bingTerrainLayer])

const petalMapsLayer = L.tileLayer(themeMode.value == 'light' ? PETAL_MAPS_TEMPLATE.Light : PETAL_MAPS_TEMPLATE.Dark)

const tencentBaseLayer = L.tileLayer(themeMode.value == 'light' ? TENCENT_MAPS_TEMPLATE.Light : TENCENT_MAPS_TEMPLATE.Dark, { subdomains: ["0", "1", "2", "3"], minNativeZoom: 3, minZoom: 1 })

const gsvLayer = L.tileLayer(settings.coverage.blobby ? GOOGLE_MAPS_TEMPLATE.StreetView_Blobby : GOOGLE_MAPS_TEMPLATE.StreetView, { maxZoom: 19 })
const gsvLayer2 = L.tileLayer(settings.coverage.blobby ? GOOGLE_MAPS_TEMPLATE.StreetView_Blobby : GOOGLE_MAPS_TEMPLATE.StreetView_Official, { maxZoom: 19 })
const gsvLayer3 = L.tileLayer(settings.coverage.blobby ? GOOGLE_MAPS_TEMPLATE.StreetView_Blobby : GOOGLE_MAPS_TEMPLATE.StreetView_Unofficial, { maxZoom: 19 })
const gsvLayer4 = new ZoomCoverageLayer({ minZoom:16, pane: "panoramasPane" });

const appleCoverageLayer = L.tileLayer('https://lookmap.eu.pythonanywhere.com/bluelines_raster_2x/{z}/{x}/{y}.png', { minZoom: 1, maxZoom: 7 })

const baiduCoverageLayer = new BaiduLayer({ filter: "hue-rotate(140deg) saturate(200%)" })

const yandexCoverageLayer = new YandexLayer()

//const mapyczCoverageLayer = L.tileLayer('https://mapserver.mapy.cz/panorama_hybrid-m/{z}-{x}-{y}', { minZoom: 5, subdomains: ["0", "1", "2", "3"] })

const baseMaps = {
  "Google Roadmap": roadmapLayer,
  "Google Satellite": satelliteLayer,
  "Google Terrain": terrainLayer,
  Carto: cartoLayer,
  OSM: osmLayer,
  Bing: bingMapsLayer,
  Tencent: tencentBaseLayer,
  Petal: petalMapsLayer,
}

const overlayMaps = {
  'Google Street View': gsvLayer,
  'Google Street View Official Only': gsvLayer2,
  'Google Unofficial Coverage Only': gsvLayer3,
  'Google Street View Panoramas((requires zoom level 16+)': gsvLayer4,
  'Apple Look Around': appleCoverageLayer,
  'Apple Look Around (requires zoom level 10+)': AppleLayer,
  'Bing Streetside': bingStreetideLayer,
  'Yandex Panorama': yandexCoverageLayer,
  'Naver Panorama (requires zoom level 15+)': NaverLayer,
  'Mapillary (requires zoom level 15+)': MapillaryLayer,
  'Streetview.vn (requires zoom level 10+)': OpenMapLayer,
  //'Mapy.cz Panorama  (Only Works at Zoom Level 5+)': mapyczCoverageLayer,
  'Tencent Street View (requires zoom level 5+)': TencentCoverageLayer,
  'Baidu Street View (requires zoom level5+)': baiduCoverageLayer,
  'Já 360 (requires zoom level 5+)': JaLayer,
  'AlbaniaStreetView': ASIGLayer,
  'Vegbilder Norway (requires zoom level 10+)': VegbilderLayer,

}

const allLayers = [
  ...Object.values(baseMaps),
  ...Object.values(overlayMaps)
]

const drawnPolygonsLayer = new L.GeoJSON()

const drawControl = new L.Control.Draw({
  position: 'bottomleft',
  draw: {
    polyline: false,
    marker: false,
    circlemarker: false,
    circle: false,
    polygon: {
      allowIntersection: false,
      drawError: {
        color: '#e1e100',
        message:
          '<strong>Polygon draw does not allow intersections!<strong> (allowIntersection: false)',
      },
      shapeOptions: { color: '#5d8ce3' },
    },
    rectangle: { shapeOptions: { color: '#5d8ce3' } },
  },
  edit: { featureGroup: drawnPolygonsLayer },
})

async function initMap(el: string) {
  if (map) return map

  map = L.map(el, {
    attributionControl: false,
    contextmenu: true,
    contextmenuItems: [
      { text: 'Copy Coordinates', callback: copyCoords },
      { text: 'See Nearest Pano', callback: openNearestPano },
    ],
    center: [0, 0],
    preferCanvas: true,
    zoom: 1,
    minZoom: 1,
    maxZoom: 19,
    zoomControl: false,
    worldCopyJump: true,
  })

  map.createPane('labelPane')
  map.createPane('panoramasPane')
  map.getPane('labelPane')!.style.zIndex = '300';
  map.getPane("panoramasPane")!.style.zIndex = '500';

  const selectedBase = baseMaps[storedLayers.value.base] || roadmapLayer
  selectedBase.addTo(map)

  storedLayers.value.overlays.forEach((name) => {
    const layer = overlayMaps[name]
    if (layer) map.addLayer(layer)
  })

  L.control.layers(baseMaps, overlayMaps, { position: 'bottomleft' }).addTo(map)

  for (const layer of availableLayers.value) {
    if (layer.visible) {
      const loaded = await loadLayer(layer as LayerMeta)
      map.addLayer(loaded)
    }
  }

  Object.entries(markerLayers).forEach(([key]) => {
    updateMarkerLayers(key as MarkerLayersTypes)
  })

  map.addControl(drawControl)

  map.on('baselayerchange', (e) => {
    const name = baseLayerToName.get(e.layer)
    if (name) storedLayers.value.base = name as BaseMapName
    toggleMapTheme(themeMode.value)
  })
  map.on('overlayadd', (e) => {
    const name = overlayLayerToName.get(e.layer) as OverlayMapName
    if (name && !storedLayers.value.overlays.includes(name)) {
      storedLayers.value.overlays.push(name)
    }
  })
  map.on('overlayremove', (e) => {
    const name = overlayLayerToName.get(e.layer)
    if (name) {
      storedLayers.value.overlays = storedLayers.value.overlays.filter((n) => n !== name)
    }
  })

  map.on('draw:created', (e) => {
    const event = e as L.DrawEvents.Created
    const polygon = event.layer as Polygon
    polygon.feature = event.layer.toGeoJSON()
    polygon.feature.properties.name = `Custom polygon ${drawnPolygonsLayer.getLayers().length + 1}`
    initPolygon(polygon)
    polygon.setStyle(polygonStyles.customPolygonStyle())
    polygon.setStyle(polygonStyles.highlighted())
    polygon.on('mouseover', (e: L.LeafletMouseEvent) => highlightFeature(e))
    polygon.on('mouseout', (e: L.LeafletMouseEvent) => resetHighlight(e))
    polygon.on('click', (e: L.LeafletMouseEvent) => selectPolygon(e))
    drawnPolygonsLayer.addLayer(polygon)
    selected.value.push(polygon)
  })
  map.on('draw:edited', (e) => {
    const event = e as L.DrawEvents.Edited
    event.layers.eachLayer((layer) => {
      const polygon = layer as Polygon
      const geojson = polygon.toGeoJSON()
      polygon.feature = geojson
      const index = selected.value.findIndex((x) => x._leaflet_id === polygon._leaflet_id)
      if (index != -1) selected.value[index] = polygon
    })
  })
  map.on('draw:deleted', (e) => {
    const event = e as L.DrawEvents.Deleted
    event.layers.eachLayer((layer) => {
      const polygon = layer as Polygon
      clearPolygon(polygon)
      const index = selected.value.findIndex((x) => x._leaflet_id === polygon._leaflet_id)
      if (index != -1) selected.value.splice(index, 1)
    })
  })

  map.on('zoom', ({ target }) => {
    currentZoom.value = target.getZoom()
  })
  map.on('zoomend', ({ target }) => {
    currentZoom.value = target.getZoom()
  })

  const mapDiv = document.getElementById('map') as HTMLElement
  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize()
    // Hack for tiles not loading after hard refresh on firefox
    const zoom = map.getZoom()
    map.setZoom(zoom - 1)
    map.setZoom(zoom + 1)
  })
  resizeObserver.observe(mapDiv)

  // we move leaflet controls out of the #map container for z-index
  const drawControlContainer = map.getContainer().querySelector('.leaflet-control-container')
  const ui = document.getElementById('leaflet-ui')
  if (ui && drawControlContainer) {
    ui.appendChild(drawControlContainer)
  }

  return map
}

function toggleMap(provider: string) {
  function resetLayer() {
    allLayers.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  }
  if (provider.includes('google')) {
    resetLayer()
    roadmapLayer.addTo(map)
    gsvLayer2.addTo(map)
  }
  else if (provider === 'apple') {
    resetLayer()
    appleCoverageLayer.addTo(map)
    cartoLayer.addTo(map)
    AppleLayer.addTo(map)
  }
  else if (provider === 'bing') {
    resetLayer()
    bingMapsLayer.addTo(map)
    bingStreetideLayer.addTo(map)
  }
  else if (provider === 'tencent') {
    resetLayer()
    tencentBaseLayer.addTo(map)
    TencentCoverageLayer.addTo(map)
  }
  else if (provider === 'baidu') {
    resetLayer()
    petalMapsLayer.addTo(map)
    baiduCoverageLayer.addTo(map)
  }
  else if (provider === 'yandex') {
    resetLayer()
    roadmapLayer.addTo(map)
    yandexCoverageLayer.addTo(map)
  }
  else if (provider === 'naver') {
    resetLayer()
    cartoLayer.addTo(map)
    NaverLayer.addTo(map)
  }
  else if (provider === 'mapillary') {
    resetLayer()
    roadmapLayer.addTo(map)
    MapillaryLayer.addTo(map)
  }
  else if (provider === 'openmap') {
    resetLayer()
    roadmapLayer.addTo(map)
    OpenMapLayer.addTo(map)
    map.flyTo([14.0583, 108.2772], map.getZoom()) // Center on Vietnam
  }
  else if (provider === 'asig') {
    resetLayer()
    roadmapLayer.addTo(map)
    ASIGLayer.addTo(map)
    map.flyTo([41.3275, 19.8189], map.getZoom()) // Center on Albania
  }
  else if (provider === 'ja') {
    resetLayer()
    roadmapLayer.addTo(map)
    JaLayer.addTo(map)
    map.flyTo([64.9631, -19.0208], map.getZoom()) // Center on Iceland
  }
  else if (provider === 'vegbilder') {
    resetLayer()
    roadmapLayer.addTo(map)
    VegbilderLayer.addTo(map)
    map.flyTo([60.4720, 8.4689], map.getZoom()) // Center on Norway
  }
}

const copyCoords = (e: L.ContextMenuItemClickEvent) => {
  navigator.clipboard.writeText(e.latlng.lat.toFixed(7) + ', ' + e.latlng.lng.toFixed(7))
}
const openNearestPano = (e: L.ContextMenuItemClickEvent) => {
  switch (settings.provider) {
    case 'google':
      open(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${e.latlng.lat},${e.latlng.lng}`,
      )
      break
    case 'apple':
      open(`https://lookmap.eu.pythonanywhere.com/#c=18/${e.latlng.lat}/${e.latlng.lng}&p=${e.latlng.lat}/${e.latlng.lng}`)
      break
    case 'bing':
      open(
        `https://www.bing.com/maps/?style=x&lvl=18&cp=${e.latlng.lat}%7E${e.latlng.lng}&v=2&form=LMLTCC`)
      break
    default:
      open(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${e.latlng.lat},${e.latlng.lng}`,
      )
  }
}

function initPolygon(polygon: Polygon) {
  if (!polygon.found) polygon.found = []
  if (!polygon.nbNeeded) polygon.nbNeeded = 100
  if (!polygon.checkedPanos) polygon.checkedPanos = new Set()
}

function selectPolygon(e: L.LeafletMouseEvent) {
  if (state.started) return
  const polygon = e.target as Polygon
  const index = selected.value.findIndex((x) => x._leaflet_id === polygon._leaflet_id)
  if (index == -1) {
    polygon.setStyle(polygonStyles.highlighted())
    selected.value.push(polygon)
  } else {
    selected.value.splice(index, 1)
    resetHighlight(e)
  }
}

const loadedLayers: Record<string, L.GeoJSON> = {}

type BaseMapName = keyof typeof baseMaps
type OverlayMapName = keyof typeof overlayMaps
const storedLayers = useStorage<{
  base: BaseMapName
  overlays: OverlayMapName[]
}>('map_generator__layers', {
  base: 'Google Roadmap',
  overlays: ['Google Street View Official Only'],
})

const baseLayerToName = new Map<L.Layer, string>()
for (const [name, layer] of Object.entries(baseMaps)) {
  baseLayerToName.set(layer, name)
}

const overlayLayerToName = new Map<L.Layer, string>()
for (const [name, layer] of Object.entries(overlayMaps)) {
  overlayLayerToName.set(layer, name)
}

type MarkerLayersTypes = 'gen4' | 'gen2Or3' | 'gen1' | 'newRoad' | 'noBlueLine'
const markerLayers: Record<MarkerLayersTypes, L.MarkerClusterGroup> = {
  gen4: L.markerClusterGroup({ maxClusterRadius: 100, disableClusteringAtZoom: 15 }),
  gen2Or3: L.markerClusterGroup({ maxClusterRadius: 100, disableClusteringAtZoom: 15 }),
  gen1: L.markerClusterGroup({ maxClusterRadius: 100, disableClusteringAtZoom: 15 }),
  newRoad: L.markerClusterGroup({ maxClusterRadius: 100, disableClusteringAtZoom: 15 }),
  noBlueLine: L.markerClusterGroup({ maxClusterRadius: 100, disableClusteringAtZoom: 15 }),
}

export interface LayerMeta {
  label: string
  key: string
  source: string | L.Layer
  visible: boolean
}
const availableLayers = ref<LayerMeta[]>([
  {
    label: 'World Borders',
    key: 'world_borders',
    source: '/geojson/world_borders.json',
    visible: true,
  },
  {
    label: 'China Borders',
    key: 'china_borders',
    source: '/geojson/china_borders.json',
    visible: false,
  },
  {
    label: 'Drawn polygons',
    key: 'drawn_polygons',
    source: drawnPolygonsLayer,
    visible: true,
  },
])

async function loadLayer(layer: LayerMeta) {
  if (loadedLayers[layer.key]) return loadedLayers[layer.key]

  let geoJsonLayer: L.GeoJSON

  if (layer.key === 'drawn_polygons') {
    geoJsonLayer = drawnPolygonsLayer
  } else {
    let data: GeoJSON.GeoJsonObject
    if (typeof layer.source === 'string') {
      const response = await fetch(layer.source)
      data = await response.json()
    } else {
      data = layer.source as unknown as GeoJSON.GeoJsonObject
    }

    const style =
      layer.key === 'world_borders' ? polygonStyles.defaultHidden : polygonStyles.customPolygonStyle

    geoJsonLayer = L.geoJSON(data, { style, onEachFeature })
    geoJsonLayer.eachLayer((polygon) => {
      initPolygon(polygon as Polygon)
    })
  }
  loadedLayers[layer.key] = geoJsonLayer
  return geoJsonLayer
}

async function toggleLayer(layer: LayerMeta) {
  if (layer.visible) {
    const loaded = await loadLayer(layer)
    map.addLayer(loaded)
  } else {
    const loaded = loadedLayers[layer.key]
    if (loaded) map.removeLayer(loaded)
  }
}

function replaceBaseLayerContents(name: string, newChildren: L.Layer[]): boolean {
  const layerObj = (baseMaps as any)[name] as L.Layer | undefined
  if (!layerObj) return false

  const layerGroupLike = layerObj as unknown as L.LayerGroup
  if (typeof (layerGroupLike as any).clearLayers === 'function' && typeof (layerGroupLike as any).addLayer === 'function') {
    try {
      layerGroupLike.clearLayers()
      newChildren.forEach((ch) => layerGroupLike.addLayer(ch))
      return true
    } catch (err) {
      console.error('replaceBaseLayerContents error', err)
      return false
    }
  }
  return false
}

function toggleMapTheme(theme: string) {
  if (!map || !storedLayers) return
  const activeBaseLayer = storedLayers.value.base
  const storedOverlays = storedLayers.value.overlays

  if (activeBaseLayer == 'Google Roadmap' || activeBaseLayer == 'Google Terrain') {
    toggleGoogleMapsTheme(theme)
  }
  if (theme == 'dark') {
    if (activeBaseLayer == 'Bing') {
      const children = storedOverlays.includes('Bing Streetside')
        ? [bingBaseDarkLayer, bingTerrainLayer, bingStreetideLayer]
        : [bingBaseDarkLayer, bingTerrainLayer]

      replaceBaseLayerContents('Bing', children)
    }
    else if (activeBaseLayer == 'Carto') {
      cartoLayer.setUrl(CARTO_MAPS_TEMPLATE.Dark)
    }
    else if (activeBaseLayer == 'OSM') {
      osmLayer.setUrl(OSM_TEMPLATE.Dark)
    }
    else if (activeBaseLayer == 'Petal') {
      petalMapsLayer.setUrl(PETAL_MAPS_TEMPLATE.Dark)
    }
    else if (activeBaseLayer == 'Tencent') {
      tencentBaseLayer.setUrl(TENCENT_MAPS_TEMPLATE.Dark)
    }

  } else if (theme === 'light') {
    if (activeBaseLayer == 'Bing') {
      const children = storedOverlays.includes('Bing Streetside')
        ? [bingBaseLayer, bingTerrainLayer, bingStreetideLayer]
        : [bingBaseLayer, bingTerrainLayer]

      replaceBaseLayerContents('Bing', children)
    }
    else if (activeBaseLayer == 'Carto') {
      cartoLayer.setUrl(CARTO_MAPS_TEMPLATE.Light)
    }
    else if (activeBaseLayer == 'OSM') {
      osmLayer.setUrl(OSM_TEMPLATE.Standard)
    }
    else if (activeBaseLayer == 'Petal') {
      petalMapsLayer.setUrl(PETAL_MAPS_TEMPLATE.Light)
    }
    else if (activeBaseLayer == 'Tencent') {
      tencentBaseLayer.setUrl(TENCENT_MAPS_TEMPLATE.Light)
    }
  }
}

watch(
  () => themeMode.value,
  (newTheme) => {
    try {
      toggleMapTheme(newTheme)
    } catch (err) {
      console.error('Failed to apply map theme:', err)
    }
  },
  { immediate: true }
)

function toggleGoogleMapsTheme(theme: string) {
  if (settings.coverage.enabled) return
  if (theme == 'light') {
    roadmapBaseLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Roadmap)
    roadmapLabelsLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Roadmap_Labels)
    terrainBaseLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Terrain)
  }
  else {
    roadmapBaseLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Roadmap_Dark)
    terrainBaseLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Terrain_Dark)
    roadmapLabelsLayer.setUrl(GOOGLE_MAPS_TEMPLATE.Labels_Dark)
  }
}

function toggleGSVLayerCorlor(scheme: string) {
  if (settings.coverage.blobby) {
    toggleGSVBlobbyLayer()
    return
  }
  const [stroke, fill] = ColorScheme[scheme]
  gsvLayer.setUrl(`https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1.1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${scheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`)
  gsvLayer2.setUrl(`https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1.1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${scheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`)
  gsvLayer3.setUrl(`https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${scheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`)
}

function toggleGSVBlobbyLayer() {
  if (settings.coverage.blobby) {
    const [stroke, fill] = ColorScheme[settings.coverage.colorScheme]
    gsvLayer.setUrl(`https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m8!1e2!2ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*21%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%215m1%215f1.35`)
    gsvLayer2.setUrl(`https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m8!1e2!2ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*21%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%215m1%215f1.35`)
    gsvLayer3.setUrl(`https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m8!1e2!2ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*21%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%215m1%215f1.35`)
  }
  else toggleGSVLayerCorlor(settings.coverage.colorScheme)
}

function setCoverageLayerOpacity(opacity: number) {
  Object.values(overlayMaps).forEach((layer) => {
    if (map.hasLayer(layer)) {
      layer.setOpacity(opacity)
    }
  })
}

function selectLayer(layerKey: string) {
  const layer = loadedLayers[layerKey]
  if (!layer) return

  const alreadySelected = new Set(selected.value.map((p) => p._leaflet_id))
  const toAdd: Polygon[] = []

  layer.eachLayer((polygon) => {
    const p = polygon as Polygon
    if (!alreadySelected.has(p._leaflet_id)) {
      toAdd.push(p)
    }
  })
  layer.setStyle(polygonStyles.highlighted)
  selected.value.push(...toAdd)
}

function deselectLayer(layerKey: string) {
  const layer = loadedLayers[layerKey]
  if (!layer) return

  const idsToRemove = new Set<number>()

  layer.eachLayer((polygon) => {
    const p = polygon as Polygon
    if (p._leaflet_id) {
      idsToRemove.add(p._leaflet_id)
    }
  })
  layer.setStyle(
    layerKey === 'world_borders' ? polygonStyles.defaultHidden : polygonStyles.customPolygonStyle,
  )
  selected.value = selected.value.filter((p) => !idsToRemove.has(p._leaflet_id))
}

async function importLayer(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  for (const file of input.files) {
    const result = await readFileAsText(file)
    try {
      const json = JSON.parse(result)
      if (!isValidGeoJSON(json)) {
        throw new Error('Invalid GeoJSON structure.')
      }

      const meta: LayerMeta = {
        label: file.name,
        key: file.name,
        source: json,
        visible: true,
      }
      availableLayers.value.push(meta)
      const layer = await loadLayer(meta)
      map.addLayer(layer)
    } catch (e) {
      alert(`Invalid GeoJSON in "${file.name}"`)
      console.error(e)
    }
  }
}

function exportLayer(l: LayerMeta) {
  const layer = loadedLayers[l.key]
  if (!layer) return

  const dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(layer.toGeoJSON()))
  const fileName = l.label ?? 'Custom Layer'
  const linkElement = document.createElement('a')
  linkElement.href = dataUri
  linkElement.download = fileName
  linkElement.click()
}

function updateMarkerLayers(gen: MarkerLayersTypes) {
  if (
    (gen === 'gen4' && settings.markers.gen4) ||
    (gen === 'gen2Or3' && settings.markers.gen2Or3) ||
    (gen === 'gen1' && settings.markers.gen1) ||
    (gen === 'newRoad' && settings.markers.newRoad) ||
    (gen === 'noBlueLine' && settings.markers.noBlueLine)
  ) {
    map.addLayer(markerLayers[gen])
    if (!settings.markers.cluster) markerLayers[gen].disableClustering()
    else markerLayers[gen].enableClustering()
  } else {
    map.removeLayer(markerLayers[gen])
  }
}

function updateClusters() {
  Object.values(markerLayers).forEach((markerLayer) => {
    if (settings.markers.cluster) markerLayer.enableClustering()
    else markerLayer.disableClustering()
  })
}

function clearPolygon(polygon: Polygon) {
  Object.values(markerLayers).forEach((markerLayer) => {
    const toRemove = markerLayer.getLayers().filter((layer) => {
      const marker = layer as L.Marker
      return marker.polygonID === polygon._leaflet_id
    })
    toRemove.forEach((marker) => {
      markerLayer.removeLayer(marker)
    })
  })
  polygon.found.length = 0
}

function clearMarkers() {
  Object.values(markerLayers).forEach((markerLayer) => {
    markerLayer.clearLayers()
  })
}

function onEachFeature(_: Feature, layer: L.Layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: selectPolygon,
  })
}

function highlightFeature(e: L.LeafletMouseEvent) {
  if (state.started) return
  const polygon = e.target as Polygon
  if (!selected.value.some((x) => x._leaflet_id === polygon._leaflet_id)) {
    polygon.setStyle(polygonStyles.highlighted())
  }
  select.value = `${getPolygonName(polygon.feature.properties)} ${polygon.found ? '(' + polygon.found.length + ')' : '(0)'}`
}

function resetHighlight(e: L.LeafletMouseEvent) {
  const polygon = e.target as Polygon
  if (!selected.value.some((x) => x._leaflet_id === polygon._leaflet_id)) {
    polygon.setStyle(polygonStyles.removeHighlight())
  }
  select.value = 'Select a country or draw a polygon'
}

const polygonStyles = {
  defaultHidden: () => ({
    opacity: 0,
    fillOpacity: 0,
  }),

  customPolygonStyle: () => ({
    weight: 2,
    color: getRandomColor(),
    fillOpacity: 0,
  }),

  highlighted: () => ({
    fillColor: getRandomColor(),
    fillOpacity: 0.5,
  }),

  removeHighlight: () => ({
    fillOpacity: 0,
  }),
}

function getRandomColor() {
  const red = Math.floor(((1 + Math.random()) * 256) / 2)
  const green = Math.floor(((1 + Math.random()) * 256) / 2)
  const blue = Math.floor(((1 + Math.random()) * 256) / 2)
  return 'rgb(' + red + ', ' + green + ', ' + blue + ')'
}

const icons = {
  gen1: L.icon({ iconUrl: markerGreen, iconAnchor: [12, 41] }),
  gen2Or3: L.icon({ iconUrl: markerViolet, iconAnchor: [12, 41] }),
  gen4: L.icon({ iconUrl: markerBlue, iconAnchor: [12, 41] }),
  newLoc: L.icon({ iconUrl: markerRed, iconAnchor: [12, 41] }),
  noBlueLine: L.icon({ iconUrl: markerPink, iconAnchor: [12, 41] }),
}

export {
  L,
  initMap,
  toggleMap,
  selectLayer,
  deselectLayer,
  toggleLayer,
  toggleGSVBlobbyLayer,
  setCoverageLayerOpacity,
  toggleGSVLayerCorlor,
  importLayer,
  exportLayer,
  updateMarkerLayers,
  availableLayers,
  markerLayers,
  updateClusters,
  clearMarkers,
  currentZoom,
  icons,
}
