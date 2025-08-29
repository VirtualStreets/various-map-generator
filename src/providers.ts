import {
    extractDateFromPanoId,
    formatTimeStr,
    createPayload,
    wgs84_to_tile_coord,
    opk_to_hpr,
} from '@/composables/utils';
import { cacheManager } from '@/cache';
import { getPano } from '@/apple/tile';
import type { AppleLookAroundPano } from '@/apple/types';
import { MapyCzApi } from '@/mapycz/api';
import { MapillaryAPI } from '@/mapillary/api';
import { OpenMapAPI } from './openmap/api';
import { ASIGTileGenerator } from './agis/tile';
import { VegbilderTileGenerator } from './vegbilder/tile';
import { settings } from '@/settings';
import gcoord from 'gcoord';
import { degToRad } from 'web-merc-projection/util';

let svService: google.maps.StreetViewService | null = null

const MAPYCZ_API = new MapyCzApi();
const MAPILLARY_API = new MapillaryAPI();
const OPENMAP_API = new OpenMapAPI();

const providerMap: Record<string, Function> = {
    google: getFromGoogle,
    apple: getFromApple,
    tencent: getFromTencent,
    bing: getFromBing,
    baidu: getFromBaidu,
    yandex: getFromYandex,
    kakao: getFromKakao,
    naver: getFromNaver,
    googleZoom: getFromGoogleZoom,
    mapycz: getFromMapyCZ,
    mapillary: getFromMapillary,
    openmap: getFromOpenMap,
    asig: getFromASIG,
    ja: getFromJa360,
    vegbilder: getFromVegbilder,
};


export function updateMapyCzApiKey() {
    MAPYCZ_API.setApiKey(settings.apiKeys.mapycz);
}

// Initialize API key on startup
updateMapyCzApiKey();

// Google Zoom (tile coordinate)
async function getFromGoogleZoom(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.location) {
            const { lat, lng }: any = request.location;
            const [x, y] = wgs84_to_tile_coord(lat, lng, 17);
            const cacheKey = `${x},${y}`;
            let panoIds = cacheManager.get('google', cacheKey);
            if (!panoIds) {
                const url = `https://www.google.com/maps/photometa/ac/v1?pb=!1m1!1smaps_sv.tactile!6m3!1i${x}!2i${y}!3i17!8b1`;
                const resp = await fetch(url);
                let text = await resp.text();
                if (text.startsWith(")]}'")) {
                    text = text.slice(5);
                }
                const data = JSON.parse(text);
                panoIds = Array.isArray(data?.[1]?.[1]) ? data[1][1].map((item: any) => item?.[0]?.[0]?.[1]) : [];
                cacheManager.set('google', cacheKey, panoIds);
            }
            if (Array.isArray(panoIds) && panoIds.length) {
                const result = panoIds[Math.floor(Math.random() * panoIds.length)];
                if (result) return await getFromGoogle({ pano: result }, onCompleted);
                else onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
            } else {
                onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
            }
        }
        else if (request.pano) {
            return await getFromGoogle(request, onCompleted);
        }
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR);
    }
}

function getStreetViewService() {
    if (!svService) {
        svService = new google.maps.StreetViewService()
    }
    return svService
}

function parseGoogle(data: any): google.maps.StreetViewPanoramaData {
    try {
        let roadName = null;
        let country = null;
        let desc_raw = null;
        let shortDesc_raw = null;
        let service = null;

        const panoId = data[1][0][1][1];
        const lat = data[1][0][5][0][1][0][2];
        const lng = data[1][0][5][0][1][0][3];
        const heading = data[1][0][5][0][1][2][0];
        const worldsize = data[1][0][2][2];

        const imageYear = data[1][0][6][7][0];
        const imageMonth = data[1][0][6][7][1];
        const imageDate = `${imageYear}-${String(imageMonth).padStart(2, '0')}`;

        const historyRaw = data[1][0][5][0][8];
        const linksRaw = data[1][0][5][0][6];
        const nodes = data[1][0][5][0][3][0];

        const altitude = data[1][0][5][0][1][1][0]

        try {
            country = data[1][0][5][0][1][4];
            if (['TW', 'HK', 'MO'].includes(country)) {
                country = 'CN';
            }
        } catch (e) { }
        try {
            roadName = data[1][0][5][0][12][0][0][0][2][0];
        } catch (e) { }
        try {
            service = data[1][0][6][5][2];
        } catch (e) { }
        try {
            desc_raw = data[1][0][3][2][1][0]
        } catch (e) {
            try { desc_raw = data[1][0][3][0][0] } catch (error) { }
        }
        try {
            shortDesc_raw = data[1][0][3][2][0][0]
        } catch (e) { try { shortDesc_raw = data[1][0][3][0][0] } catch (error) { } }

        const history = historyRaw ? (historyRaw.map((node: any) => ({
            pano: nodes[node[0]][0][1],
            date: new Date(`${node[1][0]}-${String(node[1][1]).padStart(2, '0')}`),
        })))
            : [];
        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(lat, lng),
                description: !desc_raw && !shortDesc_raw ? null : `${shortDesc_raw}, ${desc_raw}`,
                shortDescription: shortDesc_raw,
                altitude,
                country,
                service
            },
            links: linksRaw ? linksRaw.map((link: any) => ({
                pano: nodes[link[0]][0][1],
                heading: link[1][3] ?? 0,
            })) : [],
            tiles: {
                centerHeading: heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(worldsize[1], worldsize[0]),
                getTileUrl: () => '',
            },
            imageDate,
            copyright: '© Google',
            time: [...history, { pano: panoId, date: new Date(imageDate) }]
                .sort((a, b) => a.date.getTime() - b.date.getTime()),
        };

        return panorama;
    } catch (error: any) {
        console.error('Failed to parse panorama data:', error.message);
        throw new Error('Invalid panorama data format');
    }
}

async function getMetadata(
    pano: string,
): Promise<any> {
    try {
        const endpoint = `https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata`;
        const payload = createPayload(pano);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json+protobuf",
                "x-user-agent": "grpc-web-javascript/0.1"
            },
            body: payload,
            mode: "cors",
            credentials: "omit"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(`Error fetching Google panorama: ${error.message}`);
    }
}

// Google
async function getFromGoogle(
    request: google.maps.StreetViewLocationRequest | google.maps.StreetViewPanoRequest,
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    const sv = getStreetViewService()
    if ('pano' in request && typeof request.pano === 'string' && request.pano.length == 22) {
        try {
            const result = await getMetadata(request.pano)
            if (result.length > 1) onCompleted(parseGoogle(result), google.maps.StreetViewStatus.OK)
            else onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
        }
        catch (error) {
            onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
        }
    }
    else {
        await sv.getPanorama(request, onCompleted)
    }

}

// Apple Look Around
async function getFromApple(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus
    ) => void
) {
    try {
        let apple: AppleLookAroundPano | null = null

        if (request.pano && cacheManager.has('apple', request.pano)) {
            onCompleted(cacheManager.get('apple', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        if (request.location) {
            const { lat, lng }: any = request.location
            apple = await getPano(lat, lng)
        }

        if (!apple?.panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const date = new Date(apple.date)
        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: apple.panoId.toString(),
                latLng: new google.maps.LatLng(apple.lat, apple.lng),
                description: '© Apple Look Around',
                service: apple.coverage_type == 3 ? "backpack" : (apple.camera_type)
            },
            links: [],
            tiles: {
                centerHeading: apple.heading,
                tileSize: new google.maps.Size(256, 256),
                worldSize: new google.maps.Size(16384, 8192),
                getTileUrl: () => "",
            },
            imageDate: date.toISOString(),
            copyright: "© Apple Look Around",
            time: [{ pano: apple.panoId, date: date } as any],
        }
        cacheManager.set('apple', apple.panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (error) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Yandex
async function getFromYandex(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('yandex', request.pano)) {
            onCompleted(cacheManager.get('yandex', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }
        let panoId: string | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {
            const { lat, lng } = request.location
            const uri = `https://api-maps.yandex.com/services/panoramas/1.x/?l=stv&lang=en_US&origin=userAction&provider=streetview&ll=${lng},${lat}`
            const resp = await fetch(uri)
            const json = await resp.json()
            panoId = json?.data?.Data?.panoramaId
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://api-maps.yandex.com/services/panoramas/1.x/?l=stv&lang=en_US&origin=userAction&provider=streetview&oid=${panoId}`
        const resp = await fetch(uri)
        const json = await resp.json()
        const result = json.data

        if (!result?.Data?.panoramaId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const date = new Date(Number(result.Data.panoramaId.split('_').pop()) * 1000)
        const heading = (result.Data.EquirectangularProjection.Origin[0] + 180) % 360

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.Data.Point.coordinates[1], result.Data.Point.coordinates[0]),
                description: result.Data.Point.name
            },
            links: result.Annotation?.Thoroughfares?.map((r: any) => ({
                pano: new URL(r.Connection.href).searchParams.get('oid'),
                heading: 0,
            })) ?? [],
            tiles: {
                centerHeading: heading,
                tileSize: new google.maps.Size(256, 256),
                worldSize: new google.maps.Size(result.Data.Images.Zooms[0].width, result.Data.Images.Zooms[0].height),
                getTileUrl: () => '',
            },
            imageDate: date.toISOString(),
            copyright: result.Author ? result.Author.name : '© Yandex Maps',
            time: [
                ...(result.Annotation?.HistoricalPanoramas?.map((r: any) => ({
                    pano: r.Connection.oid,
                    date: new Date(Number(r.Connection.oid.split('_').pop()) * 1000),
                })) ?? []),
                {
                    pano: panoId,
                    date: date,
                },
            ].sort((a, b) => a.date.getTime() - b.date.getTime()),
        }
        cacheManager.set('yandex', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Tencent
async function getFromTencent(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('tencent', request.pano)) {
            onCompleted(cacheManager.get('tencent', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {
            const { lat, lng } = request.location
            const r = request.radius || 50
            const uri = `https://sv.map.qq.com/xf?output=json&charset=utf-8&lng=${lng}&lat=${lat}&r=${r}`
            const resp = await fetch(uri)
            const json = await resp.json()
            panoId = json?.detail?.svid
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://sv.map.qq.com/sv?output=json&svid=${panoId}`
        const resp = await fetch(uri)
        const json = await resp.json()
        const result = json?.detail

        if (!result?.basic?.svid) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const date = extractDateFromPanoId(result.basic.svid.slice(8, 20))
        const trans_svid = result.basic.trans_svid

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.addr.y_lat, result.addr.x_lng),
                description: result.basic.append_addr,
                shortDescription: result.basic.mode === "night" ? panoId : (trans_svid || null),
                country: 'CN'
            },
            links: result.all_scenes?.map((r: any) => ({
                pano: r.svid,
                heading: 0,
            })) ?? [],
            tiles: {
                centerHeading: Number(result.basic.dir),
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: date,
            copyright: '© Tencent Maps',
            time: [
                ...(result.history?.nodes?.map((r: any) => ({
                    pano: r.svid,
                    date: new Date(extractDateFromPanoId(r.svid.slice(8, 20))),
                })) ?? []),
                {
                    pano: panoId,
                    date: new Date(date),
                },
            ].sort((a, b) => a.date.getTime() - b.date.getTime()),
        }
        cacheManager.set('tencent', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Bing
async function getFromBing(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('bing', request.pano)) {
            onCompleted(cacheManager.get('bing', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined
        const uri = new URL("https://t.ssl.ak.tiles.virtualearth.net/tiles/cmd/StreetSideBubbleMetaData")
        if (request.pano) {
            panoId = request.pano
            uri.searchParams.set("id", panoId)
        } else if (request.location) {
            const { lat, lng }: any = request.location
            const radius = request.radius || 50
            const rangeDeg = radius / 1000 / 111;
            uri.searchParams.set("count", "50");
            uri.searchParams.set("north", (lat + rangeDeg).toString());
            uri.searchParams.set("south", (lat - rangeDeg).toString());
            uri.searchParams.set("east", (lng + rangeDeg).toString());
            uri.searchParams.set("west", (lng - rangeDeg).toString());

            const resp = await fetch(uri)
            const json = await resp.json()
            const results = Array.isArray(json) ? json.slice(1) : []
            const result = results.length > 0
                ? results[Math.floor(Math.random() * results.length)]
                : null
            panoId = result ? result.id : null
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const resp = await fetch(uri)
        const json = await resp.json()
        const result = json?.[1]

        if (!result?.id) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }
        const date = new Date(result.cd)

        const links: google.maps.StreetViewLink[] = []
        if (result.pr) links.push({
            pano: String(result.pr),
            heading: (result.he + 180) % 360,
            description: ''
        })
        if (result.ne) links.push({
            pano: result.ne.toString(),
            heading: result.he,
            description: ''
        })
        if (result.nbn) {
            for (const link of result.nbn) {
                if (result.id != link.id) {
                    links.push({
                        pano: link.id.toString(),
                        heading: link.az,
                        description: ''
                    })
                }
            }
        }

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.la, result.lo),
                description: String(result.ml),
                service: result.ml,
                altitude: result.al
            },
            links,
            tiles: {
                centerHeading: result.he,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: formatTimeStr(result.cd),
            copyright: '© Bing Streetside',
            time: [{ pano: result.panoId, date: date }],
        }
        cacheManager.set('bing', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Kakao
async function getFromKakao(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {

        if (request.pano && cacheManager.has('kakao', request.pano)) {
            onCompleted(cacheManager.get('kakao', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {
            const { lat, lng } = request.location

            const rad = request.radius || 50
            const uri = `https://rv.map.kakao.com/roadview-search/v2/nodes?PX=${lng}&PY=${lat}&RAD=${rad}&PAGE_SIZE=1&INPUT=wgs&TYPE=w&SERVICE=glpano`
            const resp = await fetch(uri)
            const json = await resp.json()
            panoId = json?.street_view?.streetList?.[0]?.id?.toString()
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://rv.map.kakao.com/roadview-search/v2/node/${panoId}?SERVICE=glpano`
        const resp = await fetch(uri)
        const json = await resp.json()
        const result = json.street_view?.street

        const date = result.shot_date
        const heading = (parseFloat(result.angle) + 180) % 360
        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.wgsy, result.wgsx),
                description: result.addr,
                country: 'KR'
            },
            links: result.spot?.map((r: any) => ({
                pano: r.id.toString(),
                heading: (parseFloat(r.pan) % 180) + (heading > 180 ? 180 : 0),
            })) ?? [],
            imageDate: date,
            tiles: {
                centerHeading: heading,
                getTileUrl: () => '',
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
            },
            copyright: '© Kakao Maps',
            time: [
                ...(result.past?.map((r: any) => ({
                    date: new Date(r.shot_date),
                    pano: r.id.toString(),
                })) ?? []),
                {
                    date: new Date(date),
                    pano: panoId,
                },
            ].sort((a, b) => a.date.getTime() - b.date.getTime()),
        }

        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Naver
async function getFromNaver(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('naver', request.pano)) {
            onCompleted(cacheManager.get('naver', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined
        let heading: number | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {
            const { lat, lng } = request.location
            const uri = `https://cors-proxy.ac4.stocc.dev/https://panorama.map.naver.com/api/v2/nearby/${lng}/${lat}?lang=en`
            const resp = await fetch(uri)
            const json = await resp.json()

            panoId = json.features?.[0]?.properties?.id
            heading = json.features?.[0]?.properties?.heading

        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://cors-proxy.ac4.stocc.dev/https://panorama.map.naver.com/metadataV3/basic/${panoId}?lang=en`
        const history_uri = `https://cors-proxy.ac4.stocc.dev/https://panorama.map.naver.com/metadata/timeline/${panoId}`
        const [resultResp, timelineResp] = await Promise.all([fetch(uri), fetch(history_uri)]);
        const result = await resultResp.json();
        const timeline = await timelineResp.json();

        if (!result?.id) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }
        const date = result.info?.photodate

        let history: Array<{ date: Date, pano: string }> = [];

        if (timeline.timeline?.panoramas && Array.isArray(timeline.timeline?.panoramas)) {
            const panoramas = timeline.timeline?.panoramas.slice(1);

            history = panoramas.map((item: any[]) => ({
                pano: item[0], // id
                date: new Date(item[4])
            }));
            history.sort((a, b) => a.date.getTime() - b.date.getTime());
        }

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.latitude, result.longitude),
                description: result.info?.description,
                service: result.dtl_type,
                altitude: result.altitude,
                country: 'KR'
            },
            links: result.links?.map((r: any) => ({
                pano: r.id,
                heading: 0,
            })) ?? [],
            imageDate: date,
            tiles: {
                centerHeading: heading || 0,
                getTileUrl: () => '',
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
            },
            copyright: '© Naver',
            time: history.length > 0 ? history : [{
                date: new Date(date),
                pano: panoId
            } as any],
        }

        cacheManager.set('naver', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Baidu
async function getFromBaidu(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('baidu', request.pano)) {
            onCompleted(cacheManager.get('baidu', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {

            const lat = typeof request.location.lat === 'function' ? request.location.lat() : request.location.lat
            const lng = typeof request.location.lng === 'function' ? request.location.lng() : request.location.lng

            const [bd09mcLng, bd09mcLat] = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.BD09MC)
            const r = request.radius || 50
            const uri = `https://mapsv0.bdimg.com/?qt=qsdata&x=${bd09mcLng}&y=${bd09mcLat}&r=${r}`
            const resp = await fetch(uri)
            const json = await resp.json()
            panoId = json?.content?.id
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://mapsv0.bdimg.com/?qt=sdata&sid=${panoId}`
        const resp = await fetch(uri)
        const json = await resp.json()
        const result = json.content[0]

        if (!result?.ID) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const date = extractDateFromPanoId(panoId.slice(10, 22))
        const [lng, lat] = gcoord.transform([result.X / 100, result.Y / 100], gcoord.BD09MC, gcoord.GCJ02);
        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(lat, lng),
                description: result.Rname,
                altitude: result.Z,
                country: 'CN'
            },
            links: result.Links?.map((r: any) => ({
                pano: r.PID,
                heading: 0,
            })) ?? [],
            tiles: {
                centerHeading: result.Heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: date,
            copyright: '© Baidu Maps',
            time: [
                ...(result.TimeLine?.map((r: any) => ({
                    pano: r.ID,
                    date: new Date(extractDateFromPanoId(r.ID.slice(10, 22))),
                })) ?? []),
                {
                    pano: panoId,
                    date: new Date(date),
                },
            ].sort((a, b) => a.date.getTime() - b.date.getTime()),
        }
        cacheManager.set('baidu', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// MapyCZ
async function getFromMapyCZ(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('mapycz', request.pano)) {
            onCompleted(cacheManager.get('mapycz', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }
        let result: any = null;
        let panoId: string = '';

        if (request.pano) {
            // Load panorama by ID
            result = await MAPYCZ_API.loadPanoramaDetails(parseInt(request.pano));
            panoId = request.pano;
        } else if (request.location) {
            // Load panorama by location
            const { lat, lng }: any = request.location;
            result = await MAPYCZ_API.loadPanoramaGetBest(lng, lat, request.radius || 50);
            panoId = result?.pid.toString() ?? result?.panInfo?.pid.toString();
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
            return;
        }
        if (result?.panInfo) result = result.panInfo;

        const date = result.createdAtTimestamp ? new Date(result.createdAtTimestamp * 1000) : new Date(result.createdAt * 1000);
        const { heading, pitch, roll } = opk_to_hpr(result.omega, result.phi, result.kappa);

        let neighbours: any[] = [];
        try {
            neighbours = await MAPYCZ_API.loadPanoramaNeighbours(parseInt(panoId));
        } catch (error) {
        }
        const links: google.maps.StreetViewLink[] = neighbours?.map(neighbour => {
            return {
                pano: neighbour.near?.pid?.toString() || neighbour.far?.pid?.toString(),
                heading: neighbour.angle,
                description: neighbour.near?.provider || neighbour.far?.provider || 'MapyCZ',
            };
        }).filter(link => link.pano);

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.mark.lat, result.mark.lon),
                description: result.provider,
                altitude: result.mark?.alt,
                service: result.provider
            },
            copyright: '© MapyCZ',
            imageDate: result.createdAtTimestamp ? result.createdAt : date.toISOString(),
            links,
            time: [{
                date: date,
                pano: panoId
            } as any],
            tiles: {
                getTileUrl: () => '',
                centerHeading: result.extra?.carDirection ? degToRad(result.extra?.carDirection) : heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
            },
        };

        cacheManager.set('mapycz', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK);
    } catch (error) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR);
    }
}

// Mapillary
async function getFromMapillary(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('mapillary', request.pano)) {
            onCompleted(cacheManager.get('mapillary', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }
        let result: any = null;
        let panoId: string = '';

        if (request.pano) {
            result = await MAPILLARY_API.getImageById(request.pano);
            panoId = request.pano;
        } else if (request.location) {
            const { lat, lng }: any = request.location;
            const searchResult = await MAPILLARY_API.searchImagesByLocation(lng, lat, request.radius || 50, { limit: 1 });

            if (!searchResult.data || searchResult.data.length === 0) {
                onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
                return;
            }

            result = searchResult.data[0];
            panoId = result.id;
        }

        const [longitude, latitude] = result.computed_geometry?.coordinates || result.geometry?.coordinates;
        if (!result || !panoId || !latitude || !longitude) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
            return;
        }

        const date = result.captured_at ? new Date(result.captured_at) : new Date();

        const heading = result.computed_compass_angle || result.compass_angle || 0;

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(latitude, longitude),
                description: `${result.make || ''} - ${result.model || ''}`.trim(),
                altitude: result.computed_altitude,
                service: result.is_pano
            },
            copyright: '© Mapillary',
            imageDate: date.toISOString(),
            links: [], // Mapillary doesn't provide direct neighboring images in this format
            time: request.pano ? [] : [{
                date: date,
                pano: panoId
            } as any],
            tiles: {
                getTileUrl: () => '',
                centerHeading: heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(2048, 1024),
            },
        };
        cacheManager.set('mapillary', panoId, panorama);
        onCompleted(panorama, google.maps.StreetViewStatus.OK);
    } catch (error) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR);
    }
}

// OpenMap
async function getFromOpenMap(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        let feature: any = null;
        let links: google.maps.StreetViewLink[] = [];
        if (request.pano) {
            if (cacheManager.has('openmap', request.pano)) {
                onCompleted(cacheManager.get('openmap', request.pano)!, google.maps.StreetViewStatus.OK);
                return;
            }
            feature = OPENMAP_API.getFeature(request.pano);
        }
        else if (request.location) {
            const { lat, lng }: any = request.location;
            const features = await OPENMAP_API.searchFeatures(lat, lng);
            if (!features.length) {
                onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
                return;
            }
            const featureIndex = Math.floor(Math.random() * features.length);
            feature = features[featureIndex];
            const prevFeature = features[featureIndex - 1] ?? null;
            const nextFeature = features[featureIndex + 1] ?? null;
            links.push(...[prevFeature, nextFeature]
                .filter(f => f && f.sequences.some(seq => feature.sequences.includes(seq)))
                .map(f => ({
                    pano: f.id,
                    heading: f.heading || 0,
                    description: 'OpenMap',
                }))
            );
        }
        if (!feature) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
            return;
        }
        const panorama = {
            location: {
                pano: feature.id,
                latLng: new google.maps.LatLng(feature.lat, feature.lng),
                description: 'OpenMap',
                country: 'VN',
            },
            links,
            tiles: {
                centerHeading: feature.heading || 0,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: feature.time,
            copyright: '© OpenMap',
            time: [{
                date: new Date(feature.time),
                pano: feature.id
            } as any],
        };

        cacheManager.set('openmap', feature.id, panorama);
        onCompleted(panorama, google.maps.StreetViewStatus.OK);
    }
    catch (error) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR);
    }

}

// ASIG
async function getFromASIG(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,) {
    if (request.pano) {
        if (cacheManager.has('asig', request.pano)) {
            onCompleted(cacheManager.get('asig', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }
        else onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
    }

    else if (request.location) {
        try {
            const { lat, lng }: any = request.location
            const data = await ASIGTileGenerator.getTileGeoJsonByLatLng(lat, lng, 15)
            if (data && data.features.length > 0) {
                const pointFeatures = data.features.filter((f: { geometry: { type: string; }; }) => f.geometry?.type === 'Point');
                const feature = pointFeatures[Math.floor(Math.random() * pointFeatures.length)].properties;

                const idMatch = feature.id.match(/camera-\d+-\d+/);
                const numMatch = feature.id.match(/(\d{9,})$/);
                let links: any[] = [];
                if (numMatch && idMatch) {
                    const num = parseInt(numMatch[1], 10);
                    const prevId = `${idMatch[0]}-${String(num - 1).padStart(numMatch[1].length, '0')}`;
                    const nextId = `${idMatch[0]}-${String(num + 1).padStart(numMatch[1].length, '0')}`;

                    for (const pf of pointFeatures) {
                        if (pf.properties.id === prevId || pf.properties.id === nextId) {
                            links.push({
                                pano: pf.properties.id,
                                heading: pf.properties.id === nextId ? pf.properties.heading : (pf.properties.heading + 180) % 360,
                                description: 'AIGS',
                            });
                        }
                    }
                }
                const panorama = {
                    location: {
                        pano: feature.id,
                        latLng: new google.maps.LatLng(feature.lat, feature.lon),
                        description: 'AIGS',
                        country: 'AL',
                        altitude: feature.height
                    },
                    links,
                    tiles: {
                        centerHeading: feature.heading,
                        tileSize: new google.maps.Size(512, 512),
                        worldSize: new google.maps.Size(2048, 1024),
                        getTileUrl: () => '',
                    },
                    imageDate: feature.date,
                    copyright: '© AIGS',
                    time: [{
                        date: new Date(feature.date),
                        pano: feature.id
                    } as any],
                };

                cacheManager.set('asig', feature.id, panorama);
                onCompleted(panorama, google.maps.StreetViewStatus.OK);
            }
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS);
        }
        catch (error) {
            onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
        }

    }
}

// Já360
async function getFromJa360(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('ja', request.pano)) {
            onCompleted(cacheManager.get('ja', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let panoId: string | undefined

        if (request.pano) {
            panoId = request.pano
        } else if (request.location) {
            const { lat, lng } = request.location
            const uri = `https://ja.is/kort/closest/?lat=${lat}&lng=${lng}&meters=${request.radius || 50}`
            const resp = await fetch(uri)
            const result = await resp.json()
            panoId = result?.id?.toString()
        }

        if (!panoId) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }

        const uri = `https://ja.is/kort/scene/?json=1&image_id=${panoId}`
        const resp = await fetch(uri)
        const result = await resp.json()

        if (!result || !result.image || !result?.image?.id) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }
        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: panoId,
                latLng: new google.maps.LatLng(result.image?.lat, result.image?.lng),
                description: result.streets?.street.name || 'Já360',
                country: 'IS'
            },
            links: result.streets?.street.azimuths.map((r: any, idx: number) => ({
                pano: `${panoId.slice(0, -1)}${idx}`,
                heading: r,
                description: result.streets?.street.name || 'Já360',
            })) ?? [],
            tiles: {
                centerHeading: result.image?.heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: result.image?.month,
            time: [{
                date: new Date(result.image?.month),
                pano: panoId
            } as any],
        }
        cacheManager.set('ja', panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (err) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}

// Vegbilder (Norwegian road images)
async function getFromVegbilder(
    request: google.maps.StreetViewLocationRequest & { pano?: string },
    onCompleted: (
        res: google.maps.StreetViewPanoramaData | null,
        status: google.maps.StreetViewStatus,
    ) => void,
) {
    try {
        if (request.pano && cacheManager.has('vegbilder', request.pano)) {
            onCompleted(cacheManager.get('vegbilder', request.pano)!, google.maps.StreetViewStatus.OK)
            return
        }

        let feature: any = null
        let links: any[] = [];
        let prev: any = null;
        let next: any = null;

        if (request.pano) {
            feature = await VegbilderTileGenerator.getFeatureById(request.pano)
        } else if (request.location) {
            const { lat, lng }: any = request.location

            const data = await VegbilderTileGenerator.getTileGeoJsonByLatLng(lat, lng, request.radius || 50)
            
            if (data && data.features && data.features.length > 0) {
                const idx = Math.floor(Math.random() * data.features.length);
                feature = data.features[idx];
                if (idx > 0) {
                    prev = data.features[idx - 1];
                }
                if (idx < data?.features.length - 1) {
                    next = data.features[idx + 1];
                }
            }
        }

        if (!feature) {
            onCompleted(null, google.maps.StreetViewStatus.ZERO_RESULTS)
            return
        }
    
        const info = VegbilderTileGenerator.extractFeatureInfo(feature)

        if (prev?.properties?.id) {
            links.push({ pano: prev.properties.id, heading: (info.heading + 180) % 360 });
        }

        if (next?.properties?.id) {
            links.push({ pano: next.properties.id, heading: info.heading });
        }

        const panorama: google.maps.StreetViewPanoramaData = {
            location: {
                pano: info.panoId,
                latLng: new google.maps.LatLng(info.lat, info.lng),
                description: info.description,
                country: 'NO'
            },
            links,
            tiles: {
                centerHeading: info.heading,
                tileSize: new google.maps.Size(512, 512),
                worldSize: new google.maps.Size(8192, 4096),
                getTileUrl: () => '',
            },
            imageDate: info.date,
            copyright: '© Statens vegvesen',
            time: [{
                pano: info.panoId,
                date: new Date(info.date)
            } as any],
        }

        cacheManager.set('vegbilder', info.panoId, panorama)
        onCompleted(panorama, google.maps.StreetViewStatus.OK)
    } catch (error) {
        onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR)
    }
}



const StreetViewProviders = {
    getPanorama: async (
        provider: string,
        request: google.maps.StreetViewLocationRequest & { pano?: string },
        onCompleted: (
            res: google.maps.StreetViewPanoramaData | null,
            status: google.maps.StreetViewStatus,
        ) => void,
    ) => {
        const fn = providerMap[provider];
        if (typeof fn === "function") {
            await fn(request, onCompleted);
        } else {
            onCompleted(null, google.maps.StreetViewStatus.UNKNOWN_ERROR);
        }
    },
}


export default StreetViewProviders
