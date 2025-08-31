import { settings } from './settings'

export const ColorScheme: any = {
    Default: ['1098ad', '99e9f2'],
    Crimson: ['f03e3e', 'ffc9c9'],
    Deep_Pink: ['d6336c', 'fcc2d7'],
    Blue_Violet: ['ae3ec9', 'eebefa'],
    Slate_Blue: ['7048e8', 'd0bfff'],
    Royal_Blue: ['4263eb', 'bac8ff'],
    Dodger_Blue: ['1c7ed6', 'a5d8ff'],
    Sea_Green: ['0ca678', '96f2d7'],
    Lime_Green: ['37b24d', 'b2f2bb'],
    Olive_Drab: ['74b816', 'd8f5a2'],
    Orange: ['f59f00', 'ffec99'],
    Dark_Orange: ['f76707', 'ffd8a8'],
    Brown: ['bd5f1b', 'f7ca9e']
}
const [stroke, fill] = ColorScheme[settings.coverage.colorScheme]

export const GOOGLE_MAPS_TEMPLATE = {
    Roadmap: 'https://mapsresources-pa.googleapis.com/v1/tiles?map_id=61449c20e7fc278b&version=15797339025669136861&pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m2!1e0!2sm!3m7!2sen!3sCN!5e1105!12m1!1e3!12m1!1e2!4e0!5m5!1e0!8m2!1e1!1e1!8i47083502!6m6!1e12!2i2!11e0!39b0!44e0!50e0',
    Terrain: 'https://mapsresources-pa.googleapis.com/v1/tiles?map_id=61449c20e7fc278b&version=15797339025669136861&pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e4!2st!3i725!2m3!1e0!2sr!3i725483392!3m12!2sen!3sCN!5e18!12m1!1e3!2m2!1sset!2sTerrain!12m3!1e37!2m1!1ssmartmaps!4e0!5m2!1e3!5f2!23i56565656!26m2!1e2!1e3',
    Satellite: 'https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m2!1e1!2sm!3m3!2sen!3sus!5e1105!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e0',
    Satellite_Labels: 'https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m2!1e0!2sm!3m5!2sen!3sus!5e1105!12m1!1e4!4e0!5m4!1e0!8m2!1e1!1e1!8i47083502!6m6!1e12!2i2!11e0!39b0!44e0!50e0',
    Roadmap_Labels: 'https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m2!1e0!2sm!3m7!2sen!3scn!5e1105!12m1!1e2!12m1!1e15!4e0!5m5!1e0!8m2!1e1!1e1!8i47083502!6m6!1e12!2i2!11e0!39b0!44e0!50e0',
    StreetView: `https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1.1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${settings.coverage.colorScheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`,
    StreetView_Blobby:`https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m8!1e2!2ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*21%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%215m1%215f1.35`,
    StreetView_Official: `https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e2*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1.1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${settings.coverage.colorScheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`,
    StreetView_Unofficial: `https://maps.googleapis.com/maps/vt?pb=%211m5%211m4%211i{z}%212i{x}%213i{y}%214i256%212m8%211e2%212ssvv%214m2%211scc%212s*211m3*211e3*212b1*213e2*211m3*211e10*212b1*213e2*212b1*214b1%214m2%211ssvl%212s*212b1%213m16%212sen%213sUS%2112m4%211e68%212m2%211sset%212sRoadmap%2112m3%211e37%212m1%211ssmartmaps%2112m4%211e26%212m2%211sstyles%212sp.c%3A%23${stroke}%2Cs.e%3Ag.f%7Cp.c%3A%23${stroke}%7Cp.w%3A1%2Cs.e%3Ag.s%7Cp.c%3A%23${fill}%7Cp.w%3A${settings.coverage.colorScheme == 'Default' ? 3 : 1.5}%215m1%215f1.35`,
    Roadmap_Dark: 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i746506288!3m18!2sen!3scn!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiMxZDJjNGQscy5lOmx8cC52Om9mZixzLmU6bC50LmZ8cC5jOiM4ZWMzYjkscy5lOmwudC5zfHAuYzojMWEzNjQ2LHMudDoxN3xzLmU6Zy5zfHAuYzojNGI2ODc4LHMudDoyMXxwLnY6b2ZmLHMudDoyMXxzLmU6bC50LmZ8cC5jOiM2NDc3OWUscy50OjIwfHAudjpvZmYscy50OjE4fHMuZTpnLnN8cC5jOiM0YjY4Nzgscy50OjgxfHMuZTpnLnN8cC5jOiMzMzRlODcscy50OjgyfHMuZTpnfHAuYzojMDIzZTU4LHMudDoyfHMuZTpnfHAuYzojMjgzZDZhLHMudDoyfHMuZTpsLnQuZnxwLmM6IzZmOWJhNSxzLnQ6MnxzLmU6bC50LnN8cC5jOiMxZDJjNGQscy50OjQwfHMuZTpnLmZ8cC5jOiMwMjNlNTgscy50OjQwfHMuZTpsLnQuZnxwLmM6IzNDNzY4MCxzLnQ6M3xzLmU6Z3xwLmM6IzMwNGE3ZCxzLnQ6M3xzLmU6bC50LmZ8cC5jOiM5OGE1YmUscy50OjN8cy5lOmwudC5zfHAuYzojMWQyYzRkLHMudDo0OXxzLmU6Z3xwLmM6IzJjNjY3NSxzLnQ6NDl8cy5lOmcuc3xwLmM6IzI1NTc2MyxzLnQ6NDl8cy5lOmwudC5mfHAuYzojYjBkNWNlLHMudDo0OXxzLmU6bC50LnN8cC5jOiMwMjNlNTgscy50OjR8cy5lOmwudC5mfHAuYzojOThhNWJlLHMudDo0fHMuZTpsLnQuc3xwLmM6IzFkMmM0ZCxzLnQ6NjV8cy5lOmcuZnxwLmM6IzI4M2Q2YSxzLnQ6NjZ8cy5lOmd8cC5jOiMzYTQ3NjIscy50OjZ8cy5lOmd8cC5jOiMwZTE2MjYscy50OjZ8cy5lOmwudC5mfHAuYzojNGU2ZDcw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502',
    Labels_Dark: 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i746506157!3m18!2sen!3scn!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiMxZDJjNGQscy5lOmcuZnxwLnY6b2ZmLHMuZTpnLnN8cC52Om9mZixzLmU6bC50LmZ8cC5jOiM4ZWMzYjkscy5lOmwudC5zfHAuYzojMWEzNjQ2LHMudDoxN3xzLmU6Zy5zfHAuYzojNGI2ODc4fHAudjpvbixzLnQ6MjF8cy5lOmwudC5mfHAuYzojNjQ3NzllLHMudDoxOHxzLmU6Zy5zfHAuYzojNGI2ODc4fHAudjpvbixzLnQ6ODF8cy5lOmcuc3xwLmM6IzMzNGU4NyxzLnQ6ODJ8cy5lOmd8cC5jOiMwMjNlNTgscy50OjJ8cy5lOmd8cC5jOiMyODNkNmEscy50OjJ8cy5lOmwudC5mfHAuYzojNmY5YmE1LHMudDoyfHMuZTpsLnQuc3xwLmM6IzFkMmM0ZCxzLnQ6NDB8cy5lOmcuZnxwLmM6IzAyM2U1OCxzLnQ6NDB8cy5lOmwudC5mfHAuYzojM0M3NjgwLHMudDozfHMuZTpnfHAuYzojMzA0YTdkLHMudDozfHMuZTpsLnQuZnxwLmM6Izk4YTViZSxzLnQ6M3xzLmU6bC50LnN8cC5jOiMxZDJjNGQscy50OjQ5fHMuZTpnfHAuYzojMmM2Njc1LHMudDo0OXxzLmU6Zy5zfHAuYzojMjU1NzYzLHMudDo0OXxzLmU6bC50LmZ8cC5jOiNiMGQ1Y2Uscy50OjQ5fHMuZTpsLnQuc3xwLmM6IzAyM2U1OCxzLnQ6NHxzLmU6bC50LmZ8cC5jOiM5OGE1YmUscy50OjR8cy5lOmwudC5zfHAuYzojMWQyYzRkLHMudDo2NXxzLmU6Zy5mfHAuYzojMjgzZDZhLHMudDo2NnxzLmU6Z3xwLmM6IzNhNDc2MixzLnQ6NnxzLmU6Z3xwLmM6IzBlMTYyNixzLnQ6NnxzLmU6bC50LmZ8cC5jOiM0ZTZkNzA!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502',
    Terrain_Dark: 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m2!1e0!2sm!2m2!1e5!2sshading!2m2!1e6!2scontours!3m17!2sen!3scn!5e0!12m4!1e68!2m2!1sset!2sTerrain!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy5lOmd8cC5jOiMxZDJjNGQscy5lOmx8cC52Om9mZixzLmU6bC50LmZ8cC5jOiM4ZWMzYjkscy5lOmwudC5zfHAuYzojMWEzNjQ2LHMudDoxN3xzLmU6Zy5zfHAuYzojNGI2ODc4LHMudDoyMXxwLnY6b2ZmLHMudDoyMXxzLmU6bC50LmZ8cC5jOiM2NDc3OWUscy50OjIwfHAudjpvZmYscy50OjE4fHMuZTpnLnN8cC5jOiM0YjY4Nzgscy50OjgxfHMuZTpnLnN8cC5jOiMzMzRlODcscy50OjgyfHMuZTpnfHAuYzojMDIzZTU4LHMudDoyfHMuZTpnfHAuYzojMjgzZDZhLHMudDoyfHMuZTpsLnQuZnxwLmM6IzZmOWJhNSxzLnQ6MnxzLmU6bC50LnN8cC5jOiMxZDJjNGQscy50OjQwfHMuZTpnLmZ8cC5jOiMwMjNlNTgscy50OjQwfHMuZTpsLnQuZnxwLmM6IzNDNzY4MCxzLnQ6M3xzLmU6Z3xwLmM6IzMwNGE3ZCxzLnQ6M3xzLmU6bC50LmZ8cC5jOiM5OGE1YmUscy50OjN8cy5lOmwudC5zfHAuYzojMWQyYzRkLHMudDo0OXxzLmU6Z3xwLmM6IzJjNjY3NSxzLnQ6NDl8cy5lOmcuc3xwLmM6IzI1NTc2MyxzLnQ6NDl8cy5lOmwudC5mfHAuYzojYjBkNWNlLHMudDo0OXxzLmU6bC50LnN8cC5jOiMwMjNlNTgscy50OjR8cy5lOmwudC5mfHAuYzojOThhNWJlLHMudDo0fHMuZTpsLnQuc3xwLmM6IzFkMmM0ZCxzLnQ6NjV8cy5lOmcuZnxwLmM6IzI4M2Q2YSxzLnQ6NjZ8cy5lOmd8cC5jOiMzYTQ3NjIscy50OjZ8cy5lOmd8cC5jOiMwZTE2MjYscy50OjZ8cy5lOmwudC5mfHAuYzojNGU2ZDcw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502'
}

export const TENCENT_MAPS_TEMPLATE = {
    Dark: 'https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={-y}&styleid=4',
    Light: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}'
}

export const CARTO_MAPS_TEMPLATE = {
    Dark: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}@2x.png',
    Light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
}

export const OSM_TEMPLATE = {
    Standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    Dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png'
}

export const PETAL_MAPS_TEMPLATE = {
    Light: "https://maprastertile-drcn.dbankcdn.cn/display-service/v1/online-render/getTile/24.12.10.10/{z}/{x}/{y}/?language=en&p=46&scale=2&mapType=ROADMAP&presetStyleId=standard&pattern=JPG&key=DAEDANitav6P7Q0lWzCzKkLErbrJG4kS1u%2FCpEe5ZyxW5u0nSkb40bJ%2BYAugRN03fhf0BszLS1rCrzAogRHDZkxaMrloaHPQGO6LNg==",
    Dark: "https://maprastertile-drcn.dbankcdn.cn/display-service/v1/online-render/getTile/25.07.19.40.300/{z}/{x}/{y}/?language=en&p=46&scale=2&mapType=ROADMAP&presetStyleId=night&pattern=JPG&key=DAEDANitav6P7Q0lWzCzKkLErbrJG4kS1u%2FCpEe5ZyxW5u0nSkb40bJ%2BYAugRN03fhf0BszLS1rCrzAogRHDZkxaMrloaHPQGO6LNg=="
}

