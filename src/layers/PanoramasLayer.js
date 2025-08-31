import L from 'leaflet'
import { StreetViewRequest, StreetViewResponse, encodeStreetViewRequest } from './schema.js';

async function Fu(t) {
  const e = new StreetViewRequest({
    context: {
      client: "maps_sv.tactile"
    },
    tile: {
      x: t.x,
      y: t.y,
      zoom: 17
    }
  });

  const s = new URL("https://www.google.com/maps/photometa/ac/v1");
  s.searchParams.set("pb", encodeStreetViewRequest(e));

  const r = await fetch(s.toString(), {
    referrerPolicy: "no-referrer"
  });

  const n = JSON.parse((await r.text()).replace(/^\)\]\}'\n/, ""));
  return new StreetViewResponse(n).panoramas.panoramas;
}


function B0({ x: t, y: e, z: s }) {
  const r = Math.pow(2, s);
  return [
    t / r * 360 - 180,
    Math.atan(Math.sinh(Math.PI - 2 * Math.PI * (e + 1) / r)) / Math.PI * 180,
    (t + 1) / r * 360 - 180,
    Math.atan(Math.sinh(Math.PI - 2 * Math.PI * e / r)) / Math.PI * 180
  ];
}

export class PanoramasLayer extends L.GridLayer {
  constructor(e = {}) {
    super({
      ...e,
      minZoom: 16,
      maxNativeZoom: 17
    })
  }
  createTile(e, s) {
    if (e.z < 16) {
      const f = L.DomUtil.create("div", "leaflet-tile");
      return queueMicrotask(() => s(void 0, f)),
        f
    }
    const r = devicePixelRatio * 2
      , n = this.getTileSize()
      , o = L.DomUtil.create("canvas", "leaflet-tile");
    o.width = n.x * r,
      o.height = n.y * r;
    const a = o.getContext("2d");
    a.scale(r, r),
      a.fillStyle = "#f00",
      a.strokeStyle = "#f00",
      a.beginPath();
    const l = B0(e)
      , h = l[3] - l[1]
      , u = l[2] - l[0];
    function c({ lat: f, lng: y }) {
      const b = n.y - (f - l[1]) / h * n.y;
      return {
        x: (y - l[0]) / u * n.x,
        y: b
      }
    }
    const d = 2.5 / 17 * e.z;
    return Fu(e).then(f => {
      for (const { links: y, pano: b } of f) {
        const w = c(b.viewpoint.position);
        for (const v of y) {
          const E = c(f[v].pano.viewpoint.position);
          a.moveTo(w.x, w.y),
            a.lineTo(E.x, E.y)
        }
      }
      a.stroke();
      for (let y = 0; y < f.length; y += 1) {
        const { x: b, y: w } = c(f[y].pano.viewpoint.position);
        a.moveTo(b + d, w),
          a.arc(b, w, d, 0, 2 * Math.PI)
      }
      a.fill(),
        s(void 0, o)
    }, s),
      o
  }
}
