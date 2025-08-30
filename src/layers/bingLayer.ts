import L from 'leaflet'

function tileXYToQuadKey(x: number, y: number, zoom: number): string {
  let quadKey = '';
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) !== 0) digit += 1;
    if ((y & mask) !== 0) digit += 2;
    quadKey += digit.toString();
  }
  return quadKey;
}

class BingTileLayer extends L.TileLayer {
  private layer: string;

  constructor(layer: string, maxZoom: number) {
    super('', {
      tileSize: 256,
      attribution: '',
      maxZoom: maxZoom
    });
    this.layer = layer;
  }

  override getTileUrl(coords: L.Coords): string {
    const quadKey = tileXYToQuadKey(coords.x, coords.y, coords.z);
    if (this.layer === 'sv') {
      return `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadKey}?it=Z,HC`;
    }
    else if (this.layer === 'sre') {
      return `https://ecn.t${quadKey.length % 2}.tiles.virtualearth.net/tiles/sre${quadKey}.jpeg?g=14792`;
    }
    else if(this.layer ==='dark'){
      return `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadKey}?mkt=en-us&ur=cn&it=G,LC,AP,L,LA&jp=0&mvt=1&tj=1&og=2724&sv=9.42&n=t&dre=1&o=webp,100&cstl=VBD&st=bld|v:0`
    }
    else {
      return `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadKey}?mkt=en-us&ur=cn&it=G,LC,L&jp=1&og=2618&sv=9.33&n=t&dre=1&o=webp,100&cstl=s23&st=bld|v:0`;
    }
  }
}

export const bingBaseLayer = new BingTileLayer('r', 20)
export const bingTerrainLayer = new BingTileLayer('sre', 15)
export const bingStreetideLayer = new BingTileLayer('sv', 20)
export const bingBaseDarkLayer = new BingTileLayer('dark', 20)
