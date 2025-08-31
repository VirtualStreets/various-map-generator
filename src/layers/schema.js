function Yu(vt) {
  return vt && vt.__esModule && Object.prototype.hasOwnProperty.call(vt, "default") ? vt.default : vt
}
var Wu = Object.defineProperty;
var Ca = t => {
  throw TypeError(t)
}
  ;
var Gu = (t, e, s) => e in t ? Wu(t, e, {
  enumerable: !0,
  configurable: !0,
  writable: !0,
  value: s
}) : t[e] = s;
var tn = (t, e, s) => Gu(t, typeof e != "symbol" ? e + "" : e, s)
  , Da = (t, e, s) => e.has(t) || Ca("Cannot " + s);
var i = (t, e, s) => (Da(t, e, "read from private field"),
  s ? s.call(t) : e.get(t))
  , p = (t, e, s) => e.has(t) ? Ca("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s)
  , g = (t, e, s, r) => (Da(t, e, "write to private field"),
    r ? r.call(t, s) : e.set(t, s),
    s);

(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload"))
    return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]'))
    r(n);
  new MutationObserver(n => {
    for (const o of n)
      if (o.type === "childList")
        for (const a of o.addedNodes)
          a.tagName === "LINK" && a.rel === "modulepreload" && r(a)
  }
  ).observe(document, {
    childList: !0,
    subtree: !0
  });
  function s(n) {
    const o = {};
    return n.integrity && (o.integrity = n.integrity),
      n.referrerPolicy && (o.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials" ? o.credentials = "include" : n.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin",
      o
  }
  function r(n) {
    if (n.ep)
      return;
    n.ep = !0;
    const o = s(n);
    fetch(n.href, o)
  }
}
)();
var As, hi;
class Zu {
  constructor(e) {
    p(this, As);
    p(this, hi, new Set);
    g(this, As, e)
  }
  get current() {
    return i(this, As)
  }
  set current(e) {
    i(this, As) != e && (g(this, As, e),
      i(this, hi).forEach(s => s(e)))
  }
  on(e) {
    return i(this, hi).add(e),
      () => i(this, hi).delete(e)
  }
}
As = new WeakMap,
  hi = new WeakMap;
const xc = t => new Zu(t)
  , Mo = Symbol.for("atomico.hooks");
globalThis[Mo] = globalThis[Mo] || {};
let Ai = globalThis[Mo];
const Ju = Symbol.for("Atomico.suspense")
  , Sc = Symbol.for("Atomico.effect")
  , Qu = Symbol.for("Atomico.layoutEffect")
  , _c = Symbol.for("Atomico.insertionEffect")
  , _i = (t, e, s) => {
    const { i: r, hooks: n } = Ai.c
      , o = n[r] = n[r] || {};
    return o.value = t(o.value),
      o.effect = e,
      o.tag = s,
      Ai.c.i++,
      n[r].value
  }
  , Xu = t => _i((e = xc(t)) => e)
  , ur = () => _i((t = xc(Ai.c.host)) => t)
  , Ec = () => Ai.c.update
  , td = (t, e, s = 0) => {
    let r = {}
      , n = !1;
    const o = () => n
      , a = (l, h) => {
        for (const u in r) {
          const c = r[u];
          c.effect && c.tag === l && (c.value = c.effect(c.value, h))
        }
      }
      ;
    return {
      load: l => {
        Ai.c = {
          host: e,
          hooks: r,
          update: t,
          i: 0,
          id: s
        };
        let h;
        try {
          n = !1,
            h = l()
        } catch (u) {
          if (u !== Ju)
            throw u;
          n = !0
        } finally {
          Ai.c = null
        }
        return h
      }
      ,
      cleanEffects: l => (a(_c, l),
        () => (a(Qu, l),
          () => {
            a(Sc, l)
          }
        )),
      isSuspense: o
    }
  }
  , Ei = Symbol.for;
function kc(t, e) {
  const s = t.length;
  if (s !== e.length)
    return !1;
  for (let r = 0; r < s; r++) {
    let n = t[r]
      , o = e[r];
    if (n !== o)
      return !1
  }
  return !0
}
const Ce = t => typeof t == "function"
  , Wi = t => typeof t == "object"
  , { isArray: ed } = Array
  , Io = (t, e) => (e ? t instanceof HTMLStyleElement : !0) && "hydrate" in ((t == null ? void 0 : t.dataset) || {});
function zc(t, e) {
  let s;
  const r = n => {
    let { length: o } = n;
    for (let a = 0; a < o; a++) {
      const l = n[a];
      if (l && Array.isArray(l))
        r(l);
      else {
        const h = typeof l;
        if (l == null || h === "function" || h === "boolean")
          continue;
        h === "string" || h === "number" ? (s == null && (s = ""),
          s += l) : (s != null && (e(s),
            s = null),
            e(l))
      }
    }
  }
    ;
  r(t),
    s != null && e(s)
}
const $c = (t, e, s) => (t.addEventListener(e, s),
  () => t.removeEventListener(e, s));
class Cc {
  constructor(e, s, r) {
    this.message = s,
      this.target = e,
      this.value = r
  }
}
class Dc extends Cc {
}
class sd extends Cc {
}
const Lr = "Custom"
  , id = null
  , rd = {
    true: 1,
    "": 1,
    1: 1
  };
function nd(t, e, s, r, n) {
  const { type: o, reflect: a, event: l, value: h, attr: u = od(e) } = (s == null ? void 0 : s.name) != Lr && Wi(s) && s != id ? s : {
    type: s
  }
    , c = (o == null ? void 0 : o.name) === Lr && o.map
    , d = h != null ? o == Function || !Ce(h) ? () => h : h : null;
  Object.defineProperty(t, e, {
    configurable: !0,
    set(f) {
      const y = this[e];
      d && o != Boolean && f == null && (f = d());
      const { error: b, value: w } = (c ? hd : cd)(o, f);
      if (b && w != null)
        throw new Dc(this, `The value defined for prop '${e}' must be of type '${o.name}'`, w);
      y != w && (this._props[e] = w ?? void 0,
        this.update(),
        l && Lc(this, l),
        this.updated.then(() => {
          a && (this._ignoreAttr = u,
            ad(this, o, u, this[e]),
            this._ignoreAttr = null)
        }
        ))
    },
    get() {
      return this._props[e]
    }
  }),
    d && (n[e] = d()),
    r[u] = {
      prop: e,
      type: o
    }
}
const Lc = (t, { type: e, base: s = CustomEvent, ...r }) => t.dispatchEvent(new s(e, r))
  , od = t => t.replace(/([A-Z])/g, "-$1").toLowerCase()
  , ad = (t, e, s, r) => r == null || e == Boolean && !r ? t.removeAttribute(s) : t.setAttribute(s, (e == null ? void 0 : e.name) === Lr && (e != null && e.serialize) ? e == null ? void 0 : e.serialize(r) : Wi(r) ? JSON.stringify(r) : e == Boolean ? "" : r)
  , ld = (t, e) => t == Boolean ? !!rd[e] : t == Number ? Number(e) : t == String ? e : t == Array || t == Object ? JSON.parse(e) : t.name == Lr ? e : new t(e)
  , hd = ({ map: t }, e) => {
    try {
      return {
        value: t(e),
        error: !1
      }
    } catch {
      return {
        value: e,
        error: !0
      }
    }
  }
  , cd = (t, e) => t == null || e == null ? {
    value: e,
    error: !1
  } : t != String && e === "" ? {
    value: void 0,
    error: !1
  } : t == Object || t == Array || t == Symbol ? {
    value: e,
    error: {}.toString.call(e) !== `[object ${t.name}]`
  } : e instanceof t ? {
    value: e,
    error: t == Number && Number.isNaN(e.valueOf())
  } : t == String || t == Number || t == Boolean ? {
    value: e,
    error: t == Number ? typeof e != "number" ? !0 : Number.isNaN(e) : t == String ? typeof e != "string" : typeof e != "boolean"
  } : {
    value: e,
    error: !0
  };
let ud = 0;
const dd = t => {
  var s;
  return ((s = (t == null ? void 0 : t.dataset) || {}) == null ? void 0 : s.hydrate) || "" || "c" + ud++
}
  , dr = (t, e = HTMLElement) => {
    const s = {}
      , r = {}
      , n = "prototype" in e && e.prototype instanceof Element
      , o = n ? e : "base" in e ? e.base : HTMLElement
      , { props: a, styles: l } = n ? t : e;
    class h extends o {
      constructor() {
        super(),
          this._setup(),
          this._render = () => t({
            ...this._props
          });
        for (const c in r)
          this[c] = r[c]
      }
      static get styles() {
        return [super.styles, l]
      }
      async _setup() {
        if (this._props)
          return;
        this._props = {};
        let c, d;
        this.mounted = new Promise(v => this.mount = () => {
          v(),
            c != this.parentNode && (d != c ? this.unmounted.then(this.update) : this.update()),
            c = this.parentNode
        }
        ),
          this.unmounted = new Promise(v => this.unmount = () => {
            v(),
              (c != this.parentNode || !this.isConnected) && (f.cleanEffects(!0)()(),
                d = this.parentNode,
                c = null)
          }
          ),
          this.symbolId = this.symbolId || Symbol(),
          this.symbolIdParent = Symbol();
        const f = td(() => this.update(), this, dd(this));
        let y, b = !0;
        const w = Io(this);
        this.update = () => (y || (y = !0,
          this.updated = (this.updated || this.mounted).then(() => {
            try {
              const v = f.load(this._render)
                , E = f.cleanEffects();
              return v && v.render(this, this.symbolId, w),
                y = !1,
                b && !f.isSuspense() && (b = !1,
                  !w && fd(this)),
                E()
            } finally {
              y = !1
            }
          }
          ).then(v => {
            v && v()
          }
          )),
          this.updated),
          this.update()
      }
      connectedCallback() {
        this.mount(),
          super.connectedCallback && super.connectedCallback()
      }
      disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback(),
          this.unmount()
      }
      attributeChangedCallback(c, d, f) {
        if (s[c]) {
          if (c === this._ignoreAttr || d === f)
            return;
          const { prop: y, type: b } = s[c];
          try {
            this[y] = ld(b, f)
          } catch {
            throw new sd(this, `The value defined as attr '${c}' cannot be parsed by type '${b.name}'`, f)
          }
        } else
          super.attributeChangedCallback(c, d, f)
      }
      static get props() {
        return {
          ...super.props,
          ...a
        }
      }
      static get observedAttributes() {
        const c = super.observedAttributes || [];
        for (const d in a)
          nd(this.prototype, d, a[d], s, r);
        return Object.keys(s).concat(c)
      }
    }
    return h
  }
  ;
function fd(t) {
  const { styles: e } = t.constructor
    , { shadowRoot: s } = t;
  if (s && e.length) {
    const r = [];
    zc(e, n => {
      n && (n instanceof Element ? s.appendChild(n.cloneNode(!0)) : r.push(n))
    }
    ),
      r.length && (s.adoptedStyleSheets = r)
  }
}
const Pc = t => (e, s) => {
  _i(([r, n] = []) => ((n || !n) && (n && kc(n, s) ? r = r || !0 : (Ce(r) && r(),
    r = null)),
    [r, s]), ([r, n], o) => o ? (Ce(r) && r(),
      []) : [r || e(), n], t)
}
  , sr = Pc(Sc)
  , gd = Pc(_c);
class Tc extends Array {
  constructor(e, s) {
    let r = !0;
    const n = o => {
      try {
        s(o, this, r)
      } finally {
        r = !1
      }
    }
      ;
    super(void 0, n, s),
      n(e)
  }
}
const Xo = t => {
  const e = Ec();
  return _i((s = new Tc(t, (r, n, o) => {
    r = Ce(r) ? r(n[0]) : r,
      r !== n[0] && (n[0] = r,
        o || e())
  }
  )) => s)
}
  , fs = (t, e) => {
    const [s] = _i(([r, n, o = 0] = []) => ((!n || n && !kc(n, e)) && (r = t()),
      [r, e, o]));
    return s
  }
  , ta = t => {
    const { current: e } = ur();
    if (!(t in e))
      throw new Dc(e, `For useProp("${t}"), the prop does not exist on the host.`, t);
    return _i((s = new Tc(e[t], (r, n) => {
      r = Ce(r) ? r(e[t]) : r,
        e[t] = r
    }
    )) => (s[0] = e[t],
      s))
  }
  , cs = (t, e = {}) => {
    const s = ur();
    return s[t] || (s[t] = (r = e.detail) => Lc(s.current, {
      type: t,
      ...e,
      detail: r
    })),
      s[t]
  }
  , Fo = Ei("atomico/options");
globalThis[Fo] = globalThis[Fo] || {
  sheet: !!document.adoptedStyleSheets
};
const jc = globalThis[Fo]
  , pd = {
    checked: 1,
    value: 1,
    selected: 1
  }
  , yd = {
    list: 1,
    type: 1,
    size: 1,
    form: 1,
    width: 1,
    height: 1,
    src: 1,
    href: 1,
    slot: 1
  }
  , md = {
    shadowDom: 1,
    staticNode: 1,
    cloneNode: 1,
    children: 1,
    key: 1
  }
  , Er = {}
  , Ro = [];
class Uo extends Text {
}
const bd = Ei("atomico/id")
  , Gi = Ei("atomico/type")
  , en = Ei("atomico/ref")
  , Mc = Ei("atomico/vnode")
  , wd = () => { }
  ;
function vd(t, e, s) {
  return Fc(this, t, e, s)
}
const Ic = (t, e, ...s) => {
  const r = e || Er;
  let { children: n } = r;
  if (n = n ?? (s.length ? s : Ro),
    t === wd)
    return n;
  const o = t ? t instanceof Node ? 1 : t.prototype instanceof HTMLElement && 2 : 0;
  if (o === !1 && t instanceof Function)
    return t(n != Ro ? {
      children: n,
      ...r
    } : r);
  const a = jc.render || vd;
  return {
    [Gi]: Mc,
    type: t,
    props: r,
    children: n,
    key: r.key,
    shadow: r.shadowDom,
    static: r.staticNode,
    raw: o,
    is: r.is,
    clone: r.cloneNode,
    render: a
  }
}
  ;
function Fc(t, e, s = bd, r, n) {
  let o;
  if (e && e[s] && e[s].vnode == t || t[Gi] != Mc)
    return e;
  (t || !e) && (n = n || t.type == "svg",
    o = t.type != "host" && (t.raw == 1 ? (e && t.clone ? e[en] : e) != t.type : t.raw == 2 ? !(e instanceof t.type) : e ? e[en] || e.localName != t.type : !e),
    o && t.type != null && (t.raw == 1 && t.clone ? (r = !0,
      e = t.type.cloneNode(!0),
      e[en] = t.type) : e = t.raw == 1 ? t.type : t.raw == 2 ? new t.type : n ? document.createElementNS("http://www.w3.org/2000/svg", t.type) : document.createElement(t.type, t.is ? {
        is: t.is
      } : void 0)));
  const a = e[s] ? e[s] : Er
    , { vnode: l = Er, cycle: h = 0 } = a;
  let { fragment: u, handlers: c } = a;
  const { children: d = Ro, props: f = Er } = l;
  if (c = o ? {} : c || {},
    t.static && !o)
    return e;
  if (t.shadow && !e.shadowRoot && e.attachShadow({
    mode: "open",
    ...t.shadow
  }),
    t.props != f && xd(e, f, t.props, c, n),
    t.children !== d) {
    const y = t.shadow ? e.shadowRoot : e;
    u = Od(t.children, u, y, s, !h && r, n && t.type == "foreignObject" ? !1 : n)
  }
  return e[s] = {
    vnode: t,
    handlers: c,
    fragment: u,
    cycle: h + 1
  },
    e
}
function Ad(t, e) {
  const s = new Uo("")
    , r = new Uo("");
  let n;
  if (t[e ? "prepend" : "append"](s),
    e) {
    let { lastElementChild: o } = t;
    for (; o;) {
      const { previousElementSibling: a } = o;
      if (Io(o, !0) && !Io(a, !0)) {
        n = o;
        break
      }
      o = a
    }
  }
  return n ? n.before(r) : t.append(r),
  {
    markStart: s,
    markEnd: r
  }
}
function Od(t, e, s, r, n, o) {
  t = t == null ? null : ed(t) ? t : [t];
  const a = e || Ad(s, n)
    , { markStart: l, markEnd: h, keyes: u } = a;
  let c;
  const d = u && new Set;
  let f = l;
  if (t && zc(t, y => {
    if (typeof y == "object" && !y[Gi])
      return;
    const b = y[Gi] && y.key
      , w = u && b != null && u.get(b);
    f != h && f === w ? d.delete(f) : f = f == h ? h : f.nextSibling;
    const v = u ? w : f;
    let E = v;
    if (y[Gi])
      E = Fc(y, v, r, n, o);
    else {
      const P = y + "";
      !(E instanceof Text) || E instanceof Uo ? E = new Text(P) : E.data != P && (E.data = P)
    }
    E != f && (u && d.delete(E),
      !v || u ? (s.insertBefore(E, f),
        u && f != h && d.add(f)) : v == h ? s.insertBefore(E, h) : (s.replaceChild(E, v),
          f = E)),
      b != null && (c = c || new Map,
        c.set(b, E))
  }
  ),
    f = f == h ? h : f.nextSibling,
    e && f != h)
    for (; f != h;) {
      const y = f;
      f = f.nextSibling,
        y.remove()
    }
  return d && d.forEach(y => y.remove()),
    a.keyes = c,
    a
}
function xd(t, e, s, r, n) {
  for (const o in e)
    !(o in s) && La(t, o, e[o], null, n, r);
  for (const o in s)
    La(t, o, e[o], s[o], n, r)
}
function La(t, e, s, r, n, o) {
  if (e = e == "class" && !n ? "className" : e,
    s = s ?? null,
    r = r ?? null,
    e in t && pd[e] && (s = t[e]),
    !(r === s || md[e] || e[0] == "_"))
    if (e[0] == "o" && e[1] == "n" && (Ce(r) || Ce(s)))
      Sd(t, e.slice(2), r, o);
    else if (e == "ref")
      r && (Ce(r) ? r(t) : r.current = t);
    else if (e == "style") {
      const { style: a } = t;
      s = s || "",
        r = r || "";
      const l = Wi(s)
        , h = Wi(r);
      if (l)
        for (const u in s)
          if (h)
            !(u in r) && Pa(a, u, null);
          else
            break;
      if (h)
        for (const u in r) {
          const c = r[u];
          l && s[u] === c || Pa(a, u, c)
        }
      else
        a.cssText = r
    } else {
      const a = e[0] == "$" ? e.slice(1) : e;
      a === e && (!n && !yd[e] && e in t || Ce(r) || Ce(s)) ? t[e] = r ?? "" : r == null ? t.removeAttribute(a) : t.setAttribute(a, Wi(r) ? JSON.stringify(r) : r)
    }
}
function Sd(t, e, s, r) {
  if (r.handleEvent || (r.handleEvent = n => r[n.type].call(t, n)),
    s) {
    if (!r[e]) {
      const n = s.capture || s.once || s.passive ? Object.assign({}, s) : null;
      t.addEventListener(e, r, n)
    }
    r[e] = s
  } else
    r[e] && (t.removeEventListener(e, r),
      delete r[e])
}
function Pa(t, e, s) {
  let r = "setProperty";
  s == null && (r = "removeProperty",
    s = null),
    ~e.indexOf("-") ? t[r](e, s) : t[e] = s
}
const Ta = {};
function Br(t, ...e) {
  const s = (t.raw || t).reduce((r, n, o) => r + n + (e[o] || ""), "");
  return Ta[s] = Ta[s] || _d(s)
}
function _d(t) {
  if (jc.sheet) {
    const e = new CSSStyleSheet;
    return e.replaceSync(t),
      e
  } else {
    const e = document.createElement("style");
    return e.textContent = t,
      e
  }
}
const Ed = Ic("host", {
  style: "display: contents"
})
  , sn = Ei("atomico/context")
  , kd = (t, e) => {
    const s = ur();
    gd(() => $c(s.current, "ConnectContext", r => {
      t === r.detail.id && (r.stopPropagation(),
        r.detail.connect(e))
    }
    ), [t])
  }
  , zd = t => {
    const e = cs("ConnectContext", {
      bubbles: !0,
      composed: !0
    })
      , s = () => {
        let o;
        return e({
          id: t,
          connect(a) {
            o = a
          }
        }),
          o
      }
      , [r, n] = Xo(s);
    return sr(() => {
      r || (t[sn] || (t[sn] = customElements.whenDefined(new t().localName)),
        t[sn].then(() => n(s)))
    }
      , [t]),
      r
  }
  , $d = t => {
    const e = zd(t)
      , s = Ec();
    return sr(() => {
      if (e)
        return $c(e, "UpdatedValue", s)
    }
      , [e]),
      (e || t).value
  }
  , Cd = t => {
    const e = dr(() => (kd(e, ur().current),
      Ed), {
      props: {
        value: {
          type: Object,
          event: {
            type: "UpdatedValue"
          },
          value: () => t
        }
      }
    });
    return e.value = t,
      e
  }
  , I = (t, e, s) => (e == null ? e = {
    key: s
  } : e.key = s,
    Ic(t, e))
  , Yi = I
  , Rc = Br`*,*:before,*:after{box-sizing:border-box}button{padding:0;touch-action:manipulation;cursor:pointer;user-select:none}`
  , Uc = Br`.vh{position:absolute;transform:scale(0)}`;
function ea() {
  return ye.from(new Date)
}
function sa(t, e = 0) {
  const s = xe(t)
    , r = s.getUTCDay()
    , n = (r < e ? 7 : 0) + r - e;
  return s.setUTCDate(s.getUTCDate() - n),
    ye.from(s)
}
function Bc(t, e = 0) {
  return sa(t, e).add({
    days: 6
  })
}
function Nc(t) {
  return ye.from(new Date(Date.UTC(t.year, t.month, 0)))
}
function Nr(t, e, s) {
  return e && ye.compare(t, e) < 0 ? e : s && ye.compare(t, s) > 0 ? s : t
}
const Dd = {
  days: 1
};
function Ld(t, e = 0) {
  let s = sa(t.toPlainDate(), e);
  const r = Bc(Nc(t), e)
    , n = [];
  for (; ye.compare(s, r) < 0;) {
    const o = [];
    for (let a = 0; a < 7; a++)
      o.push(s),
        s = s.add(Dd);
    n.push(o)
  }
  return n
}
function xe(t) {
  return new Date(Date.UTC(t.year, t.month - 1, t.day ?? 1))
}
const Pd = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$/
  , rn = (t, e) => t.toString().padStart(e, "0");
let ye = class ms {
  constructor(e, s, r) {
    this.year = e,
      this.month = s,
      this.day = r
  }
  add(e) {
    const s = xe(this);
    if ("days" in e)
      return s.setUTCDate(this.day + e.days),
        ms.from(s);
    let { year: r, month: n } = this;
    "months" in e ? (n = this.month + e.months,
      s.setUTCMonth(n - 1)) : (r = this.year + e.years,
        s.setUTCFullYear(r));
    const o = ms.from(xe({
      year: r,
      month: n,
      day: 1
    }));
    return Nr(ms.from(s), o, Nc(o))
  }
  toString() {
    return `${rn(this.year, 4)}-${rn(this.month, 2)}-${rn(this.day, 2)}`
  }
  toPlainYearMonth() {
    return new Vr(this.year, this.month)
  }
  equals(e) {
    return ms.compare(this, e) === 0
  }
  static compare(e, s) {
    return e.year < s.year ? -1 : e.year > s.year ? 1 : e.month < s.month ? -1 : e.month > s.month ? 1 : e.day < s.day ? -1 : e.day > s.day ? 1 : 0
  }
  static from(e) {
    if (typeof e == "string") {
      const s = e.match(Pd);
      if (!s)
        throw new TypeError(e);
      const [, r, n, o] = s;
      return new ms(parseInt(r, 10), parseInt(n, 10), parseInt(o, 10))
    }
    return new ms(e.getUTCFullYear(), e.getUTCMonth() + 1, e.getUTCDate())
  }
}
  ;
class Vr {
  constructor(e, s) {
    this.year = e,
      this.month = s
  }
  add(e) {
    const s = xe(this)
      , r = (e.months ?? 0) + (e.years ?? 0) * 12;
    return s.setUTCMonth(s.getUTCMonth() + r),
      new Vr(s.getUTCFullYear(), s.getUTCMonth() + 1)
  }
  equals(e) {
    return this.year === e.year && this.month === e.month
  }
  toPlainDate() {
    return new ye(this.year, this.month, 1)
  }
}
function Pr(t, e) {
  if (e)
    try {
      return t.from(e)
    } catch { }
}
function xs(t) {
  const [e, s] = ta(t);
  return [fs(() => Pr(ye, e), [e]), r => s(r == null ? void 0 : r.toString())]
}
function Td(t) {
  const [e = "", s] = ta(t);
  return [fs(() => {
    const [r, n] = e.split("/")
      , o = Pr(ye, r)
      , a = Pr(ye, n);
    return o && a ? [o, a] : []
  }
    , [e]), r => s(`${r[0]}/${r[1]}`)]
}
function jd(t) {
  const [e = "", s] = ta(t);
  return [fs(() => {
    const r = [];
    for (const n of e.trim().split(/\s+/)) {
      const o = Pr(ye, n);
      o && r.push(o)
    }
    return r
  }
    , [e]), r => s(r.join(" "))]
}
function ir(t, e) {
  return fs(() => new Intl.DateTimeFormat(e, {
    timeZone: "UTC",
    ...t
  }), [e, t])
}
function ja(t, e, s) {
  const r = ir(t, s);
  return fs(() => {
    const n = []
      , o = new Date;
    for (var a = 0; a < 7; a++) {
      const l = (o.getUTCDay() - e + 7) % 7;
      n[l] = r.format(o),
        o.setUTCDate(o.getUTCDate() + 1)
    }
    return n
  }
    , [e, r])
}
const Ma = (t, e, s) => Nr(t, e, s) === t
  , Ia = t => t.target.matches(":dir(ltr)")
  , Md = {
    month: "long",
    day: "numeric"
  }
  , Id = {
    month: "long"
  }
  , Fd = {
    weekday: "narrow"
  }
  , Rd = {
    weekday: "long"
  }
  , nn = {
    bubbles: !0
  };
function Ud({ props: t, context: e }) {
  const { offset: s } = t
    , { firstDayOfWeek: r, isDateDisallowed: n, min: o, max: a, page: l, locale: h, focusedDate: u } = e
    , c = ea()
    , d = ja(Rd, r, h)
    , f = ja(Fd, r, h)
    , y = ir(Md, h)
    , b = ir(Id, h)
    , w = fs(() => l.start.add({
      months: s
    }), [l, s])
    , v = fs(() => Ld(w, r), [w, r])
    , E = cs("focusday", nn)
    , P = cs("selectday", nn)
    , $i = cs("hoverday", nn);
  function Cs(M) {
    E(Nr(M, o, a))
  }
  function Ci(M) {
    let N;
    switch (M.key) {
      case "ArrowRight":
        N = u.add({
          days: Ia(M) ? 1 : -1
        });
        break;
      case "ArrowLeft":
        N = u.add({
          days: Ia(M) ? -1 : 1
        });
        break;
      case "ArrowDown":
        N = u.add({
          days: 7
        });
        break;
      case "ArrowUp":
        N = u.add({
          days: -7
        });
        break;
      case "PageUp":
        N = u.add(M.shiftKey ? {
          years: -1
        } : {
          months: -1
        });
        break;
      case "PageDown":
        N = u.add(M.shiftKey ? {
          years: 1
        } : {
          months: 1
        });
        break;
      case "Home":
        N = sa(u, r);
        break;
      case "End":
        N = Bc(u, r);
        break;
      default:
        return
    }
    Cs(N),
      M.preventDefault()
  }
  function yr(M) {
    var ps;
    const N = w.equals(M);
    if (!e.showOutsideDays && !N)
      return;
    const Di = M.equals(u)
      , ct = M.equals(c)
      , Li = xe(M)
      , Ds = n == null ? void 0 : n(Li)
      , mr = !Ma(M, o, a);
    let Pi = "", kt;
    if (e.type === "range") {
      const [ke, it] = e.value
        , br = ke == null ? void 0 : ke.equals(M)
        , wr = it == null ? void 0 : it.equals(M);
      kt = ke && it && Ma(M, ke, it),
        Pi = `${br ? "range-start" : ""} ${wr ? "range-end" : ""} ${kt && !br && !wr ? "range-inner" : ""}`
    } else
      e.type === "multi" ? kt = e.value.some(ke => ke.equals(M)) : kt = (ps = e.value) == null ? void 0 : ps.equals(M);
    return {
      part: `${`button day ${N ? kt ? "selected" : "" : "outside"} ${Ds ? "disallowed" : ""} ${ct ? "today" : ""}`} ${Pi}`,
      tabindex: N && Di ? 0 : -1,
      disabled: mr,
      "aria-disabled": Ds ? "true" : void 0,
      "aria-pressed": N && kt,
      "aria-current": ct ? "date" : void 0,
      "aria-label": y.format(Li),
      onkeydown: Ci,
      onclick() {
        Ds || P(M),
          Cs(M)
      },
      onmouseover() {
        !Ds && !mr && $i(M)
      }
    }
  }
  return {
    weeks: v,
    yearMonth: w,
    daysLong: d,
    daysShort: f,
    formatter: b,
    getDayProps: yr
  }
}
const on = ea()
  , ia = Cd({
    type: "date",
    firstDayOfWeek: 1,
    isDateDisallowed: () => !1,
    focusedDate: on,
    page: {
      start: on.toPlainYearMonth(),
      end: on.toPlainYearMonth()
    }
  });
customElements.define("calendar-month-ctx", ia);
const Bd = dr(t => {
  const e = $d(ia)
    , s = Xu()
    , r = Ud({
      props: t,
      context: e
    });
  function n() {
    var o;
    (o = s.current.querySelector("button[tabindex='0']")) == null || o.focus()
  }
  return Yi("host", {
    shadowDom: !0,
    focus: n,
    children: [I("div", {
      id: "h",
      part: "heading",
      children: r.formatter.format(xe(r.yearMonth))
    }), Yi("table", {
      ref: s,
      "aria-labelledby": "h",
      part: "table",
      children: [I("thead", {
        children: I("tr", {
          part: "tr head",
          children: r.daysLong.map((o, a) => Yi("th", {
            part: "th",
            scope: "col",
            children: [I("span", {
              class: "vh",
              children: o
            }), I("span", {
              "aria-hidden": "true",
              children: r.daysShort[a]
            })]
          }))
        })
      }), I("tbody", {
        children: r.weeks.map((o, a) => I("tr", {
          part: "tr week",
          children: o.map((l, h) => {
            const u = r.getDayProps(l);
            return I("td", {
              part: "td",
              children: u && I("button", {
                ...u,
                children: l.day
              })
            }, h)
          }
          )
        }, a))
      })]
    })]
  })
}
  , {
    props: {
      offset: {
        type: Number,
        value: 0
      }
    },
    styles: [Rc, Uc, Br`:host{--color-accent: black;--color-text-on-accent: white;display:flex;flex-direction:column;gap:.25rem;text-align:center;inline-size:fit-content}table{border-collapse:collapse;font-size:.875rem}th{font-weight:700;block-size:2.25rem}td{padding-inline:0}button{color:inherit;font-size:inherit;background:transparent;border:0;font-variant-numeric:tabular-nums;block-size:2.25rem;inline-size:2.25rem}button:hover:where(:not(:disabled,[aria-disabled])){background:#0000000d}button:is([aria-pressed=true],:focus-visible){background:var(--color-accent);color:var(--color-text-on-accent)}button:focus-visible{outline:1px solid var(--color-text-on-accent);outline-offset:-2px}button:disabled,:host::part(outside),:host::part(disallowed){cursor:default;opacity:.5}`]
  });
customElements.define("calendar-month", Bd);
function Fa(t) {
  return I("button", {
    part: `button ${t.name} ${t.onclick ? "" : "disabled"}`,
    onclick: t.onclick,
    "aria-disabled": t.onclick ? null : "true",
    children: I("slot", {
      name: t.name,
      children: t.children
    })
  })
}
function ra(t) {
  const e = xe(t.page.start)
    , s = xe(t.page.end);
  return Yi("div", {
    role: "group",
    "aria-labelledby": "h",
    part: "container",
    children: [I("div", {
      id: "h",
      class: "vh",
      "aria-live": "polite",
      "aria-atomic": "true",
      children: t.formatVerbose.formatRange(e, s)
    }), Yi("div", {
      part: "header",
      children: [I(Fa, {
        name: "previous",
        onclick: t.previous,
        children: "Previous"
      }), I("slot", {
        part: "heading",
        name: "heading",
        children: I("div", {
          "aria-hidden": "true",
          children: t.format.formatRange(e, s)
        })
      }), I(Fa, {
        name: "next",
        onclick: t.next,
        children: "Next"
      })]
    }), I(ia, {
      value: t,
      onselectday: t.onSelect,
      onfocusday: t.onFocus,
      onhoverday: t.onHover,
      children: I("slot", {})
    })]
  })
}
const na = {
  value: {
    type: String,
    value: ""
  },
  min: {
    type: String,
    value: ""
  },
  max: {
    type: String,
    value: ""
  },
  isDateDisallowed: {
    type: Function,
    value: t => !1
  },
  firstDayOfWeek: {
    type: Number,
    value: () => 1
  },
  showOutsideDays: {
    type: Boolean,
    value: !1
  },
  locale: {
    type: String,
    value: () => { }
  },
  months: {
    type: Number,
    value: 1
  },
  focusedDate: {
    type: String,
    value: () => { }
  },
  pageBy: {
    type: String,
    value: () => "months"
  }
}
  , oa = [Rc, Uc, Br`:host{display:block;inline-size:fit-content}[role=group]{display:flex;flex-direction:column;gap:1em}:host::part(header){display:flex;align-items:center;justify-content:space-between}:host::part(heading){font-weight:700;font-size:1.25em}button{display:flex;align-items:center;justify-content:center}button[aria-disabled]{cursor:default;opacity:.5}`]
  , Nd = {
    year: "numeric"
  }
  , Vd = {
    year: "numeric",
    month: "long"
  };
function an(t, e) {
  return (e.year - t.year) * 12 + e.month - t.month
}
const Ra = (t, e) => (t = e === 12 ? new Vr(t.year, 1) : t,
{
  start: t,
  end: t.add({
    months: e - 1
  })
});
function qd({ pageBy: t, focusedDate: e, months: s, max: r, min: n, goto: o }) {
  const a = t === "single" ? 1 : s
    , [l, h] = Xo(() => Ra(e.toPlainYearMonth(), s))
    , u = d => h(Ra(l.start.add({
      months: d
    }), s))
    , c = d => {
      const f = an(l.start, d.toPlainYearMonth());
      return f >= 0 && f < s
    }
    ;
  return sr(() => {
    if (c(e))
      return;
    const d = an(e.toPlainYearMonth(), l.start);
    o(e.add({
      months: d
    }))
  }
    , [l.start]),
    sr(() => {
      if (c(e))
        return;
      const d = an(l.start, e.toPlainYearMonth());
      u(d === -1 ? -a : d === s ? a : Math.floor(d / s) * s)
    }
      , [e, a, s]),
  {
    page: l,
    previous: !n || !c(n) ? () => u(-a) : void 0,
    next: !r || !c(r) ? () => u(a) : void 0
  }
}
function aa({ months: t, pageBy: e, locale: s, focusedDate: r, setFocusedDate: n }) {
  const [o] = xs("min")
    , [a] = xs("max")
    , l = cs("focusday")
    , h = cs("change")
    , u = fs(() => Nr(r ?? ea(), o, a), [r, o, a]);
  function c(v) {
    n(v),
      l(xe(v))
  }
  const { next: d, previous: f, page: y } = qd({
    pageBy: e,
    focusedDate: u,
    months: t,
    min: o,
    max: a,
    goto: c
  })
    , b = ur();
  function w() {
    b.current.querySelectorAll("calendar-month").forEach(v => v.focus())
  }
  return {
    format: ir(Nd, s),
    formatVerbose: ir(Vd, s),
    page: y,
    focusedDate: u,
    dispatch: h,
    onFocus(v) {
      v.stopPropagation(),
        c(v.detail),
        setTimeout(w)
    },
    min: o,
    max: a,
    next: d,
    previous: f,
    focus: w
  }
}
const Hd = dr(t => {
  const [e, s] = xs("value")
    , [r = e, n] = xs("focusedDate")
    , o = aa({
      ...t,
      focusedDate: r,
      setFocusedDate: n
    });
  function a(l) {
    s(l.detail),
      o.dispatch()
  }
  return I("host", {
    shadowDom: !0,
    focus: o.focus,
    children: I(ra, {
      ...t,
      ...o,
      type: "date",
      value: e,
      onSelect: a
    })
  })
}
  , {
    props: na,
    styles: oa
  });
customElements.define("calendar-date", Hd);
const Ua = (t, e) => ye.compare(t, e) < 0 ? [t, e] : [e, t]
  , Kd = dr(t => {
    const [e, s] = Td("value")
      , [r = e[0], n] = xs("focusedDate")
      , o = aa({
        ...t,
        focusedDate: r,
        setFocusedDate: n
      })
      , a = cs("rangestart")
      , l = cs("rangeend")
      , [h, u] = xs("tentative")
      , [c, d] = Xo();
    sr(() => d(void 0), [h]);
    function f(v) {
      o.onFocus(v),
        y(v)
    }
    function y(v) {
      v.stopPropagation(),
        h && d(v.detail)
    }
    function b(v) {
      const E = v.detail;
      v.stopPropagation(),
        h ? (s(Ua(h, E)),
          u(void 0),
          l(xe(E)),
          o.dispatch()) : (u(E),
            a(xe(E)))
    }
    const w = h ? Ua(h, c ?? h) : e;
    return I("host", {
      shadowDom: !0,
      focus: o.focus,
      children: I(ra, {
        ...t,
        ...o,
        type: "range",
        value: w,
        onFocus: f,
        onHover: y,
        onSelect: b
      })
    })
  }
    , {
      props: {
        ...na,
        tentative: {
          type: String,
          value: ""
        }
      },
      styles: oa
    });
customElements.define("calendar-range", Kd);
const Wd = dr(t => {
  const [e, s] = jd("value")
    , [r = e[0], n] = xs("focusedDate")
    , o = aa({
      ...t,
      focusedDate: r,
      setFocusedDate: n
    });
  function a(l) {
    const h = [...e]
      , u = e.findIndex(c => c.equals(l.detail));
    u < 0 ? h.push(l.detail) : h.splice(u, 1),
      s(h),
      o.dispatch()
  }
  return I("host", {
    shadowDom: !0,
    focus: o.focus,
    children: I(ra, {
      ...t,
      ...o,
      type: "multi",
      value: e,
      onSelect: a
    })
  })
}
  , {
    props: na,
    styles: oa
  });
customElements.define("calendar-multi", Wd);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kr = globalThis
  , la = kr.ShadowRoot && (kr.ShadyCSS === void 0 || kr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype
  , ha = Symbol()
  , Ba = new WeakMap;
let Vc = class {
  constructor(e, s, r) {
    if (this._$cssResult$ = !0,
      r !== ha)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e,
      this.t = s
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (la && e === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (e = Ba.get(s)),
        e === void 0 && ((this.o = e = new CSSStyleSheet).replaceSync(this.cssText),
          r && Ba.set(s, e))
    }
    return e
  }
  toString() {
    return this.cssText
  }
}
  ;
const Gd = t => new Vc(typeof t == "string" ? t : t + "", void 0, ha)
  , as = (t, ...e) => {
    const s = t.length === 1 ? t[0] : e.reduce((r, n, o) => r + (a => {
      if (a._$cssResult$ === !0)
        return a.cssText;
      if (typeof a == "number")
        return a;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")
    }
    )(n) + t[o + 1], t[0]);
    return new Vc(s, t, ha)
  }
  , Yd = (t, e) => {
    if (la)
      t.adoptedStyleSheets = e.map(s => s instanceof CSSStyleSheet ? s : s.styleSheet);
    else
      for (const s of e) {
        const r = document.createElement("style")
          , n = kr.litNonce;
        n !== void 0 && r.setAttribute("nonce", n),
          r.textContent = s.cssText,
          t.appendChild(r)
      }
  }
  , Na = la ? t => t : t => t instanceof CSSStyleSheet ? (e => {
    let s = "";
    for (const r of e.cssRules)
      s += r.cssText;
    return Gd(s)
  }
  )(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Zd, defineProperty: Jd, getOwnPropertyDescriptor: Qd, getOwnPropertyNames: Xd, getOwnPropertySymbols: tf, getPrototypeOf: ef } = Object
  , us = globalThis
  , Va = us.trustedTypes
  , sf = Va ? Va.emptyScript : ""
  , ln = us.reactiveElementPolyfillSupport
  , Zi = (t, e) => t
  , Oi = {
    toAttribute(t, e) {
      switch (e) {
        case Boolean:
          t = t ? sf : null;
          break;
        case Object:
        case Array:
          t = t == null ? t : JSON.stringify(t)
      }
      return t
    },
    fromAttribute(t, e) {
      let s = t;
      switch (e) {
        case Boolean:
          s = t !== null;
          break;
        case Number:
          s = t === null ? null : Number(t);
          break;
        case Object:
        case Array:
          try {
            s = JSON.parse(t)
          } catch {
            s = null
          }
      }
      return s
    }
  }
  , ca = (t, e) => !Zd(t, e)
  , qa = {
    attribute: !0,
    type: String,
    converter: Oi,
    reflect: !1,
    hasChanged: ca
  };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")),
  us.litPropertyMetadata ?? (us.litPropertyMetadata = new WeakMap);
class Fs extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(),
      (this.l ?? (this.l = [])).push(e)
  }
  static get observedAttributes() {
    return this.finalize(),
      this._$Eh && [...this._$Eh.keys()]
  }
  static createProperty(e, s = qa) {
    if (s.state && (s.attribute = !1),
      this._$Ei(),
      this.elementProperties.set(e, s),
      !s.noAccessor) {
      const r = Symbol()
        , n = this.getPropertyDescriptor(e, r, s);
      n !== void 0 && Jd(this.prototype, e, n)
    }
  }
  static getPropertyDescriptor(e, s, r) {
    const { get: n, set: o } = Qd(this.prototype, e) ?? {
      get() {
        return this[s]
      },
      set(a) {
        this[s] = a
      }
    };
    return {
      get() {
        return n == null ? void 0 : n.call(this)
      },
      set(a) {
        const l = n == null ? void 0 : n.call(this);
        o.call(this, a),
          this.requestUpdate(e, l, r)
      },
      configurable: !0,
      enumerable: !0
    }
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? qa
  }
  static _$Ei() {
    if (this.hasOwnProperty(Zi("elementProperties")))
      return;
    const e = ef(this);
    e.finalize(),
      e.l !== void 0 && (this.l = [...e.l]),
      this.elementProperties = new Map(e.elementProperties)
  }
  static finalize() {
    if (this.hasOwnProperty(Zi("finalized")))
      return;
    if (this.finalized = !0,
      this._$Ei(),
      this.hasOwnProperty(Zi("properties"))) {
      const s = this.properties
        , r = [...Xd(s), ...tf(s)];
      for (const n of r)
        this.createProperty(n, s[n])
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0)
        for (const [r, n] of s)
          this.elementProperties.set(r, n)
    }
    this._$Eh = new Map;
    for (const [s, r] of this.elementProperties) {
      const n = this._$Eu(s, r);
      n !== void 0 && this._$Eh.set(n, s)
    }
    this.elementStyles = this.finalizeStyles(this.styles)
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const n of r)
        s.unshift(Na(n))
    } else
      e !== void 0 && s.push(Na(e));
    return s
  }
  static _$Eu(e, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0
  }
  constructor() {
    super(),
      this._$Ep = void 0,
      this.isUpdatePending = !1,
      this.hasUpdated = !1,
      this._$Em = null,
      this._$Ev()
  }
  _$Ev() {
    var e;
    this._$ES = new Promise(s => this.enableUpdating = s),
      this._$AL = new Map,
      this._$E_(),
      this.requestUpdate(),
      (e = this.constructor.l) == null || e.forEach(s => s(this))
  }
  addController(e) {
    var s;
    (this._$EO ?? (this._$EO = new Set)).add(e),
      this.renderRoot !== void 0 && this.isConnected && ((s = e.hostConnected) == null || s.call(e))
  }
  removeController(e) {
    var s;
    (s = this._$EO) == null || s.delete(e)
  }
  _$E_() {
    const e = new Map
      , s = this.constructor.elementProperties;
    for (const r of s.keys())
      this.hasOwnProperty(r) && (e.set(r, this[r]),
        delete this[r]);
    e.size > 0 && (this._$Ep = e)
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Yd(e, this.constructor.elementStyles),
      e
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(!0),
      (e = this._$EO) == null || e.forEach(s => {
        var r;
        return (r = s.hostConnected) == null ? void 0 : r.call(s)
      }
      )
  }
  enableUpdating(e) { }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach(s => {
      var r;
      return (r = s.hostDisconnected) == null ? void 0 : r.call(s)
    }
    )
  }
  attributeChangedCallback(e, s, r) {
    this._$AK(e, r)
  }
  _$EC(e, s) {
    var o;
    const r = this.constructor.elementProperties.get(e)
      , n = this.constructor._$Eu(e, r);
    if (n !== void 0 && r.reflect === !0) {
      const a = (((o = r.converter) == null ? void 0 : o.toAttribute) !== void 0 ? r.converter : Oi).toAttribute(s, r.type);
      this._$Em = e,
        a == null ? this.removeAttribute(n) : this.setAttribute(n, a),
        this._$Em = null
    }
  }
  _$AK(e, s) {
    var o;
    const r = this.constructor
      , n = r._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const a = r.getPropertyOptions(n)
        , l = typeof a.converter == "function" ? {
          fromAttribute: a.converter
        } : ((o = a.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? a.converter : Oi;
      this._$Em = n,
        this[n] = l.fromAttribute(s, a.type),
        this._$Em = null
    }
  }
  requestUpdate(e, s, r) {
    if (e !== void 0) {
      if (r ?? (r = this.constructor.getPropertyOptions(e)),
        !(r.hasChanged ?? ca)(this[e], s))
        return;
      this.P(e, s, r)
    }
    this.isUpdatePending === !1 && (this._$ES = this._$ET())
  }
  P(e, s, r) {
    this._$AL.has(e) || this._$AL.set(e, s),
      r.reflect === !0 && this._$Em !== e && (this._$Ej ?? (this._$Ej = new Set)).add(e)
  }
  async _$ET() {
    this.isUpdatePending = !0;
    try {
      await this._$ES
    } catch (s) {
      Promise.reject(s)
    }
    const e = this.scheduleUpdate();
    return e != null && await e,
      !this.isUpdatePending
  }
  scheduleUpdate() {
    return this.performUpdate()
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
        this._$Ep) {
        for (const [o, a] of this._$Ep)
          this[o] = a;
        this._$Ep = void 0
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0)
        for (const [o, a] of n)
          a.wrapped !== !0 || this._$AL.has(o) || this[o] === void 0 || this.P(o, this[o], a)
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s),
        e ? (this.willUpdate(s),
          (r = this._$EO) == null || r.forEach(n => {
            var o;
            return (o = n.hostUpdate) == null ? void 0 : o.call(n)
          }
          ),
          this.update(s)) : this._$EU()
    } catch (n) {
      throw e = !1,
      this._$EU(),
      n
    }
    e && this._$AE(s)
  }
  willUpdate(e) { }
  _$AE(e) {
    var s;
    (s = this._$EO) == null || s.forEach(r => {
      var n;
      return (n = r.hostUpdated) == null ? void 0 : n.call(r)
    }
    ),
      this.hasUpdated || (this.hasUpdated = !0,
        this.firstUpdated(e)),
      this.updated(e)
  }
  _$EU() {
    this._$AL = new Map,
      this.isUpdatePending = !1
  }
  get updateComplete() {
    return this.getUpdateComplete()
  }
  getUpdateComplete() {
    return this._$ES
  }
  shouldUpdate(e) {
    return !0
  }
  update(e) {
    this._$Ej && (this._$Ej = this._$Ej.forEach(s => this._$EC(s, this[s]))),
      this._$EU()
  }
  updated(e) { }
  firstUpdated(e) { }
}
Fs.elementStyles = [],
  Fs.shadowRootOptions = {
    mode: "open"
  },
  Fs[Zi("elementProperties")] = new Map,
  Fs[Zi("finalized")] = new Map,
  ln == null || ln({
    ReactiveElement: Fs
  }),
  (us.reactiveElementVersions ?? (us.reactiveElementVersions = [])).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ji = globalThis
  , Tr = Ji.trustedTypes
  , Ha = Tr ? Tr.createPolicy("lit-html", {
    createHTML: t => t
  }) : void 0
  , qc = "$lit$"
  , ls = `lit$${Math.random().toFixed(9).slice(2)}$`
  , Hc = "?" + ls
  , rf = `<${Hc}>`
  , Ss = document
  , rr = () => Ss.createComment("")
  , nr = t => t === null || typeof t != "object" && typeof t != "function"
  , ua = Array.isArray
  , nf = t => ua(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function"
  , hn = `[ 	
\f\r]`
  , ji = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g
  , Ka = /-->/g
  , Wa = />/g
  , ys = RegExp(`>|${hn}(?:([^\\s"'>=/]+)(${hn}*=${hn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g")
  , Ga = /'/g
  , Ya = /"/g
  , Kc = /^(?:script|style|textarea|title)$/i
  , of = t => (e, ...s) => ({
    _$litType$: t,
    strings: e,
    values: s
  })
  , Et = of(1)
  , Oe = Symbol.for("lit-noChange")
  , V = Symbol.for("lit-nothing")
  , Za = new WeakMap
  , vs = Ss.createTreeWalker(Ss, 129);
function Wc(t, e) {
  if (!ua(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return Ha !== void 0 ? Ha.createHTML(e) : e
}
const af = (t, e) => {
  const s = t.length - 1
    , r = [];
  let n, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = ji;
  for (let l = 0; l < s; l++) {
    const h = t[l];
    let u, c, d = -1, f = 0;
    for (; f < h.length && (a.lastIndex = f,
      c = a.exec(h),
      c !== null);)
      f = a.lastIndex,
        a === ji ? c[1] === "!--" ? a = Ka : c[1] !== void 0 ? a = Wa : c[2] !== void 0 ? (Kc.test(c[2]) && (n = RegExp("</" + c[2], "g")),
          a = ys) : c[3] !== void 0 && (a = ys) : a === ys ? c[0] === ">" ? (a = n ?? ji,
            d = -1) : c[1] === void 0 ? d = -2 : (d = a.lastIndex - c[2].length,
              u = c[1],
              a = c[3] === void 0 ? ys : c[3] === '"' ? Ya : Ga) : a === Ya || a === Ga ? a = ys : a === Ka || a === Wa ? a = ji : (a = ys,
                n = void 0);
    const y = a === ys && t[l + 1].startsWith("/>") ? " " : "";
    o += a === ji ? h + rf : d >= 0 ? (r.push(u),
      h.slice(0, d) + qc + h.slice(d) + ls + y) : h + ls + (d === -2 ? l : y)
  }
  return [Wc(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r]
}
  ;
class or {
  constructor({ strings: e, _$litType$: s }, r) {
    let n;
    this.parts = [];
    let o = 0
      , a = 0;
    const l = e.length - 1
      , h = this.parts
      , [u, c] = af(e, s);
    if (this.el = or.createElement(u, r),
      vs.currentNode = this.el.content,
      s === 2 || s === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes)
    }
    for (; (n = vs.nextNode()) !== null && h.length < l;) {
      if (n.nodeType === 1) {
        if (n.hasAttributes())
          for (const d of n.getAttributeNames())
            if (d.endsWith(qc)) {
              const f = c[a++]
                , y = n.getAttribute(d).split(ls)
                , b = /([.?@])?(.*)/.exec(f);
              h.push({
                type: 1,
                index: o,
                name: b[2],
                strings: y,
                ctor: b[1] === "." ? hf : b[1] === "?" ? cf : b[1] === "@" ? uf : qr
              }),
                n.removeAttribute(d)
            } else
              d.startsWith(ls) && (h.push({
                type: 6,
                index: o
              }),
                n.removeAttribute(d));
        if (Kc.test(n.tagName)) {
          const d = n.textContent.split(ls)
            , f = d.length - 1;
          if (f > 0) {
            n.textContent = Tr ? Tr.emptyScript : "";
            for (let y = 0; y < f; y++)
              n.append(d[y], rr()),
                vs.nextNode(),
                h.push({
                  type: 2,
                  index: ++o
                });
            n.append(d[f], rr())
          }
        }
      } else if (n.nodeType === 8)
        if (n.data === Hc)
          h.push({
            type: 2,
            index: o
          });
        else {
          let d = -1;
          for (; (d = n.data.indexOf(ls, d + 1)) !== -1;)
            h.push({
              type: 7,
              index: o
            }),
              d += ls.length - 1
        }
      o++
    }
  }
  static createElement(e, s) {
    const r = Ss.createElement("template");
    return r.innerHTML = e,
      r
  }
}
function xi(t, e, s = t, r) {
  var a, l;
  if (e === Oe)
    return e;
  let n = r !== void 0 ? (a = s._$Co) == null ? void 0 : a[r] : s._$Cl;
  const o = nr(e) ? void 0 : e._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== o && ((l = n == null ? void 0 : n._$AO) == null || l.call(n, !1),
    o === void 0 ? n = void 0 : (n = new o(t),
      n._$AT(t, s, r)),
    r !== void 0 ? (s._$Co ?? (s._$Co = []))[r] = n : s._$Cl = n),
    n !== void 0 && (e = xi(t, n._$AS(t, e.values), n, r)),
    e
}
let lf = class {
  constructor(e, s) {
    this._$AV = [],
      this._$AN = void 0,
      this._$AD = e,
      this._$AM = s
  }
  get parentNode() {
    return this._$AM.parentNode
  }
  get _$AU() {
    return this._$AM._$AU
  }
  u(e) {
    const { el: { content: s }, parts: r } = this._$AD
      , n = ((e == null ? void 0 : e.creationScope) ?? Ss).importNode(s, !0);
    vs.currentNode = n;
    let o = vs.nextNode()
      , a = 0
      , l = 0
      , h = r[0];
    for (; h !== void 0;) {
      if (a === h.index) {
        let u;
        h.type === 2 ? u = new fr(o, o.nextSibling, this, e) : h.type === 1 ? u = new h.ctor(o, h.name, h.strings, this, e) : h.type === 6 && (u = new df(o, this, e)),
          this._$AV.push(u),
          h = r[++l]
      }
      a !== (h == null ? void 0 : h.index) && (o = vs.nextNode(),
        a++)
    }
    return vs.currentNode = Ss,
      n
  }
  p(e) {
    let s = 0;
    for (const r of this._$AV)
      r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, s),
        s += r.strings.length - 2) : r._$AI(e[s])),
        s++
  }
}
  ;
class fr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv
  }
  constructor(e, s, r, n) {
    this.type = 2,
      this._$AH = V,
      this._$AN = void 0,
      this._$AA = e,
      this._$AB = s,
      this._$AM = r,
      this.options = n,
      this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = s.parentNode),
      e
  }
  get startNode() {
    return this._$AA
  }
  get endNode() {
    return this._$AB
  }
  _$AI(e, s = this) {
    e = xi(this, e, s),
      nr(e) ? e === V || e == null || e === "" ? (this._$AH !== V && this._$AR(),
        this._$AH = V) : e !== this._$AH && e !== Oe && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : nf(e) ? this.k(e) : this._(e)
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB)
  }
  T(e) {
    this._$AH !== e && (this._$AR(),
      this._$AH = this.O(e))
  }
  _(e) {
    this._$AH !== V && nr(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Ss.createTextNode(e)),
      this._$AH = e
  }
  $(e) {
    var o;
    const { values: s, _$litType$: r } = e
      , n = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = or.createElement(Wc(r.h, r.h[0]), this.options)),
        r);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === n)
      this._$AH.p(s);
    else {
      const a = new lf(n, this)
        , l = a.u(this.options);
      a.p(s),
        this.T(l),
        this._$AH = a
    }
  }
  _$AC(e) {
    let s = Za.get(e.strings);
    return s === void 0 && Za.set(e.strings, s = new or(e)),
      s
  }
  k(e) {
    ua(this._$AH) || (this._$AH = [],
      this._$AR());
    const s = this._$AH;
    let r, n = 0;
    for (const o of e)
      n === s.length ? s.push(r = new fr(this.O(rr()), this.O(rr()), this, this.options)) : r = s[n],
        r._$AI(o),
        n++;
    n < s.length && (this._$AR(r && r._$AB.nextSibling, n),
      s.length = n)
  }
  _$AR(e = this._$AA.nextSibling, s) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, s); e && e !== this._$AB;) {
      const n = e.nextSibling;
      e.remove(),
        e = n
    }
  }
  setConnected(e) {
    var s;
    this._$AM === void 0 && (this._$Cv = e,
      (s = this._$AP) == null || s.call(this, e))
  }
}
class qr {
  get tagName() {
    return this.element.tagName
  }
  get _$AU() {
    return this._$AM._$AU
  }
  constructor(e, s, r, n, o) {
    this.type = 1,
      this._$AH = V,
      this._$AN = void 0,
      this.element = e,
      this.name = s,
      this._$AM = n,
      this.options = o,
      r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String),
        this.strings = r) : this._$AH = V
  }
  _$AI(e, s = this, r, n) {
    const o = this.strings;
    let a = !1;
    if (o === void 0)
      e = xi(this, e, s, 0),
        a = !nr(e) || e !== this._$AH && e !== Oe,
        a && (this._$AH = e);
    else {
      const l = e;
      let h, u;
      for (e = o[0],
        h = 0; h < o.length - 1; h++)
        u = xi(this, l[r + h], s, h),
          u === Oe && (u = this._$AH[h]),
          a || (a = !nr(u) || u !== this._$AH[h]),
          u === V ? e = V : e !== V && (e += (u ?? "") + o[h + 1]),
          this._$AH[h] = u
    }
    a && !n && this.j(e)
  }
  j(e) {
    e === V ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "")
  }
}
class hf extends qr {
  constructor() {
    super(...arguments),
      this.type = 3
  }
  j(e) {
    this.element[this.name] = e === V ? void 0 : e
  }
}
class cf extends qr {
  constructor() {
    super(...arguments),
      this.type = 4
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== V)
  }
}
let uf = class extends qr {
  constructor(e, s, r, n, o) {
    super(e, s, r, n, o),
      this.type = 5
  }
  _$AI(e, s = this) {
    if ((e = xi(this, e, s, 0) ?? V) === Oe)
      return;
    const r = this._$AH
      , n = e === V && r !== V || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive
      , o = e !== V && (r === V || n);
    n && this.element.removeEventListener(this.name, this, r),
      o && this.element.addEventListener(this.name, this, e),
      this._$AH = e
  }
  handleEvent(e) {
    var s;
    typeof this._$AH == "function" ? this._$AH.call(((s = this.options) == null ? void 0 : s.host) ?? this.element, e) : this._$AH.handleEvent(e)
  }
}
  ;
class df {
  constructor(e, s, r) {
    this.element = e,
      this.type = 6,
      this._$AN = void 0,
      this._$AM = s,
      this.options = r
  }
  get _$AU() {
    return this._$AM._$AU
  }
  _$AI(e) {
    xi(this, e)
  }
}
const cn = Ji.litHtmlPolyfillSupport;
cn == null || cn(or, fr),
  (Ji.litHtmlVersions ?? (Ji.litHtmlVersions = [])).push("3.2.1");
const ff = (t, e, s) => {
  const r = (s == null ? void 0 : s.renderBefore) ?? e;
  let n = r._$litPart$;
  if (n === void 0) {
    const o = (s == null ? void 0 : s.renderBefore) ?? null;
    r._$litPart$ = n = new fr(e.insertBefore(rr(), o), o, void 0, s ?? {})
  }
  return n._$AI(t),
    n
}
  ;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let Qi = class extends Fs {
  constructor() {
    super(...arguments),
      this.renderOptions = {
        host: this
      },
      this._$Do = void 0
  }
  createRenderRoot() {
    var s;
    const e = super.createRenderRoot();
    return (s = this.renderOptions).renderBefore ?? (s.renderBefore = e.firstChild),
      e
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(e),
      this._$Do = ff(s, this.renderRoot, this.renderOptions)
  }
  connectedCallback() {
    var e;
    super.connectedCallback(),
      (e = this._$Do) == null || e.setConnected(!0)
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(),
      (e = this._$Do) == null || e.setConnected(!1)
  }
  render() {
    return Oe
  }
}
  ;
var zl;
Qi._$litElement$ = !0,
  Qi.finalized = !0,
  (zl = globalThis.litElementHydrateSupport) == null || zl.call(globalThis, {
    LitElement: Qi
  });
const un = globalThis.litElementPolyfillSupport;
un == null || un({
  LitElement: Qi
});
(globalThis.litElementVersions ?? (globalThis.litElementVersions = [])).push("4.1.1");
var gf = as`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`
  , Bo = "";
function Ja(t) {
  Bo = t
}
function pf(t = "") {
  if (!Bo) {
    const e = [...document.getElementsByTagName("script")]
      , s = e.find(r => r.hasAttribute("data-shoelace"));
    if (s)
      Ja(s.getAttribute("data-shoelace"));
    else {
      const r = e.find(o => /shoelace(\.min)?\.js($|\?)/.test(o.src) || /shoelace-autoloader(\.min)?\.js($|\?)/.test(o.src));
      let n = "";
      r && (n = r.getAttribute("src")),
        Ja(n.split("/").slice(0, -1).join("/"))
    }
  }
  return Bo.replace(/\/$/, "") + (t ? `/${t.replace(/^\//, "")}` : "")
}
var yf = {
  name: "default",
  resolver: t => pf(`assets/icons/${t}.svg`)
}
  , mf = yf
  , Qa = {
    caret: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,
    check: `
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
    "chevron-down": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
    "chevron-left": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,
    "chevron-right": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
    copy: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,
    eye: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,
    "eye-slash": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,
    eyedropper: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,
    "grip-vertical": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,
    indeterminate: `
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
    "person-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,
    "play-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,
    "pause-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,
    radio: `
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,
    "star-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,
    "x-lg": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,
    "x-circle-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `
  }
  , bf = {
    name: "system",
    resolver: t => t in Qa ? `data:image/svg+xml,${encodeURIComponent(Qa[t])}` : ""
  }
  , wf = bf
  , vf = [mf, wf]
  , No = [];
function Af(t) {
  No.push(t)
}
function Of(t) {
  No = No.filter(e => e !== t)
}
function Xa(t) {
  return vf.find(e => e.name === t)
}
var xf = as`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`
  , Gc = Object.defineProperty
  , Sf = Object.defineProperties
  , _f = Object.getOwnPropertyDescriptor
  , Ef = Object.getOwnPropertyDescriptors
  , tl = Object.getOwnPropertySymbols
  , kf = Object.prototype.hasOwnProperty
  , zf = Object.prototype.propertyIsEnumerable
  , el = (t, e, s) => e in t ? Gc(t, e, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: s
  }) : t[e] = s
  , ki = (t, e) => {
    for (var s in e || (e = {}))
      kf.call(e, s) && el(t, s, e[s]);
    if (tl)
      for (var s of tl(e))
        zf.call(e, s) && el(t, s, e[s]);
    return t
  }
  , da = (t, e) => Sf(t, Ef(e))
  , m = (t, e, s, r) => {
    for (var n = r > 1 ? void 0 : r ? _f(e, s) : e, o = t.length - 1, a; o >= 0; o--)
      (a = t[o]) && (n = (r ? a(e, s, n) : a(n)) || n);
    return r && n && Gc(e, s, n),
      n
  }
  , Yc = (t, e, s) => {
    if (!e.has(t))
      throw TypeError("Cannot " + s)
  }
  , $f = (t, e, s) => (Yc(t, e, "read from private field"),
    e.get(t))
  , Cf = (t, e, s) => {
    if (e.has(t))
      throw TypeError("Cannot add the same private member more than once");
    e instanceof WeakSet ? e.add(t) : e.set(t, s)
  }
  , Df = (t, e, s, r) => (Yc(t, e, "write to private field"),
    e.set(t, s),
    s);
function Le(t, e) {
  const s = ki({
    waitUntilFirstUpdate: !1
  }, e);
  return (r, n) => {
    const { update: o } = r
      , a = Array.isArray(t) ? t : [t];
    r.update = function (l) {
      a.forEach(h => {
        const u = h;
        if (l.has(u)) {
          const c = l.get(u)
            , d = this[u];
          c !== d && (!s.waitUntilFirstUpdate || this.hasUpdated) && this[n](c, d)
        }
      }
      ),
        o.call(this, l)
    }
  }
}
var zs = as`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lf = {
  attribute: !0,
  type: String,
  converter: Oi,
  reflect: !1,
  hasChanged: ca
}
  , Pf = (t = Lf, e, s) => {
    const { kind: r, metadata: n } = s;
    let o = globalThis.litPropertyMetadata.get(n);
    if (o === void 0 && globalThis.litPropertyMetadata.set(n, o = new Map),
      o.set(s.name, t),
      r === "accessor") {
      const { name: a } = s;
      return {
        set(l) {
          const h = e.get.call(this);
          e.set.call(this, l),
            this.requestUpdate(a, h, t)
        },
        init(l) {
          return l !== void 0 && this.P(a, void 0, t),
            l
        }
      }
    }
    if (r === "setter") {
      const { name: a } = s;
      return function (l) {
        const h = this[a];
        e.call(this, l),
          this.requestUpdate(a, h, t)
      }
    }
    throw Error("Unsupported decorator location: " + r)
  }
  ;
function _(t) {
  return (e, s) => typeof s == "object" ? Pf(t, e, s) : ((r, n, o) => {
    const a = n.hasOwnProperty(o);
    return n.constructor.createProperty(o, a ? {
      ...r,
      wrapped: !0
    } : r),
      a ? Object.getOwnPropertyDescriptor(n, o) : void 0
  }
  )(t, e, s)
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Pe(t) {
  return _({
    ...t,
    state: !0,
    attribute: !1
  })
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tf = (t, e, s) => (s.configurable = !0,
  s.enumerable = !0,
  Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, s),
  s);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $s(t, e) {
  return (s, r, n) => {
    const o = a => {
      var l;
      return ((l = a.renderRoot) == null ? void 0 : l.querySelector(t)) ?? null
    }
      ;
    return Tf(s, r, {
      get() {
        return o(this)
      }
    })
  }
}
var zr, _e = class extends Qi {
  constructor() {
    super(),
      Cf(this, zr, !1),
      this.initialReflectedProperties = new Map,
      Object.entries(this.constructor.dependencies).forEach(([t, e]) => {
        this.constructor.define(t, e)
      }
      )
  }
  emit(t, e) {
    const s = new CustomEvent(t, ki({
      bubbles: !0,
      cancelable: !1,
      composed: !0,
      detail: {}
    }, e));
    return this.dispatchEvent(s),
      s
  }
  static define(t, e = this, s = {}) {
    const r = customElements.get(t);
    if (!r) {
      try {
        customElements.define(t, e, s)
      } catch {
        customElements.define(t, class extends e {
        }
          , s)
      }
      return
    }
    let n = " (unknown version)"
      , o = n;
    "version" in e && e.version && (n = " v" + e.version),
      "version" in r && r.version && (o = " v" + r.version),
      !(n && o && n === o) && console.warn(`Attempted to register <${t}>${n}, but <${t}>${o} has already been registered.`)
  }
  attributeChangedCallback(t, e, s) {
    $f(this, zr) || (this.constructor.elementProperties.forEach((r, n) => {
      r.reflect && this[n] != null && this.initialReflectedProperties.set(n, this[n])
    }
    ),
      Df(this, zr, !0)),
      super.attributeChangedCallback(t, e, s)
  }
  willUpdate(t) {
    super.willUpdate(t),
      this.initialReflectedProperties.forEach((e, s) => {
        t.has(s) && this[s] == null && (this[s] = e)
      }
      )
  }
}
  ;
zr = new WeakMap;
_e.version = "2.17.1";
_e.dependencies = {};
m([_()], _e.prototype, "dir", 2);
m([_()], _e.prototype, "lang", 2);
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jf = (t, e) => (t == null ? void 0 : t._$litType$) !== void 0
  , Mf = t => t.strings === void 0
  , If = {}
  , Ff = (t, e = If) => t._$AH = e;
var Mi = Symbol(), vr = Symbol(), dn, fn = new Map, Ee = class extends _e {
  constructor() {
    super(...arguments),
      this.initialRender = !1,
      this.svg = null,
      this.label = "",
      this.library = "default"
  }
  async resolveIcon(t, e) {
    var s;
    let r;
    if (e != null && e.spriteSheet)
      return this.svg = Et`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`,
        this.svg;
    try {
      if (r = await fetch(t, {
        mode: "cors"
      }),
        !r.ok)
        return r.status === 410 ? Mi : vr
    } catch {
      return vr
    }
    try {
      const n = document.createElement("div");
      n.innerHTML = await r.text();
      const o = n.firstElementChild;
      if (((s = o == null ? void 0 : o.tagName) == null ? void 0 : s.toLowerCase()) !== "svg")
        return Mi;
      dn || (dn = new DOMParser);
      const l = dn.parseFromString(o.outerHTML, "text/html").body.querySelector("svg");
      return l ? (l.part.add("svg"),
        document.adoptNode(l)) : Mi
    } catch {
      return Mi
    }
  }
  connectedCallback() {
    super.connectedCallback(),
      Af(this)
  }
  firstUpdated() {
    this.initialRender = !0,
      this.setIcon()
  }
  disconnectedCallback() {
    super.disconnectedCallback(),
      Of(this)
  }
  getIconSource() {
    const t = Xa(this.library);
    return this.name && t ? {
      url: t.resolver(this.name),
      fromLibrary: !0
    } : {
      url: this.src,
      fromLibrary: !1
    }
  }
  handleLabelChange() {
    typeof this.label == "string" && this.label.length > 0 ? (this.setAttribute("role", "img"),
      this.setAttribute("aria-label", this.label),
      this.removeAttribute("aria-hidden")) : (this.removeAttribute("role"),
        this.removeAttribute("aria-label"),
        this.setAttribute("aria-hidden", "true"))
  }
  async setIcon() {
    var t;
    const { url: e, fromLibrary: s } = this.getIconSource()
      , r = s ? Xa(this.library) : void 0;
    if (!e) {
      this.svg = null;
      return
    }
    let n = fn.get(e);
    if (n || (n = this.resolveIcon(e, r),
      fn.set(e, n)),
      !this.initialRender)
      return;
    const o = await n;
    if (o === vr && fn.delete(e),
      e === this.getIconSource().url) {
      if (jf(o)) {
        if (this.svg = o,
          r) {
          await this.updateComplete;
          const a = this.shadowRoot.querySelector("[part='svg']");
          typeof r.mutator == "function" && a && r.mutator(a)
        }
        return
      }
      switch (o) {
        case vr:
        case Mi:
          this.svg = null,
            this.emit("sl-error");
          break;
        default:
          this.svg = o.cloneNode(!0),
            (t = r == null ? void 0 : r.mutator) == null || t.call(r, this.svg),
            this.emit("sl-load")
      }
    }
  }
  render() {
    return this.svg
  }
}
  ;
Ee.styles = [zs, xf];
m([Pe()], Ee.prototype, "svg", 2);
m([_({
  reflect: !0
})], Ee.prototype, "name", 2);
m([_()], Ee.prototype, "src", 2);
m([_()], Ee.prototype, "label", 2);
m([_({
  reflect: !0
})], Ee.prototype, "library", 2);
m([Le("label")], Ee.prototype, "handleLabelChange", 1);
m([Le(["name", "src", "library"])], Ee.prototype, "setIcon", 1);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bs = {
  ATTRIBUTE: 1,
  CHILD: 2,
  PROPERTY: 3,
  BOOLEAN_ATTRIBUTE: 4,
  EVENT: 5,
  ELEMENT: 6
}
  , Zc = t => (...e) => ({
    _$litDirective$: t,
    values: e
  });
let Jc = class {
  constructor(e) { }
  get _$AU() {
    return this._$AM._$AU
  }
  _$AT(e, s, r) {
    this._$Ct = e,
      this._$AM = s,
      this._$Ci = r
  }
  _$AS(e, s) {
    return this.update(e, s)
  }
  update(e, s) {
    return this.render(...s)
  }
}
  ;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _s = Zc(class extends Jc {
  constructor(t) {
    var e;
    if (super(t),
      t.type !== bs.ATTRIBUTE || t.name !== "class" || ((e = t.strings) == null ? void 0 : e.length) > 2)
      throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")
  }
  render(t) {
    return " " + Object.keys(t).filter(e => t[e]).join(" ") + " "
  }
  update(t, [e]) {
    var r, n;
    if (this.st === void 0) {
      this.st = new Set,
        t.strings !== void 0 && (this.nt = new Set(t.strings.join(" ").split(/\s/).filter(o => o !== "")));
      for (const o in e)
        e[o] && !((r = this.nt) != null && r.has(o)) && this.st.add(o);
      return this.render(e)
    }
    const s = t.element.classList;
    for (const o of this.st)
      o in e || (s.remove(o),
        this.st.delete(o));
    for (const o in e) {
      const a = !!e[o];
      a === this.st.has(o) || (n = this.nt) != null && n.has(o) || (a ? (s.add(o),
        this.st.add(o)) : (s.remove(o),
          this.st.delete(o)))
    }
    return Oe
  }
}
);
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qc = Symbol.for("")
  , Rf = t => {
    if ((t == null ? void 0 : t.r) === Qc)
      return t == null ? void 0 : t._$litStatic$
  }
  , sl = (t, ...e) => ({
    _$litStatic$: e.reduce((s, r, n) => s + (o => {
      if (o._$litStatic$ !== void 0)
        return o._$litStatic$;
      throw Error(`Value passed to 'literal' function must be a 'literal' result: ${o}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)
    }
    )(r) + t[n + 1], t[0]),
    r: Qc
  })
  , il = new Map
  , Uf = t => (e, ...s) => {
    const r = s.length;
    let n, o;
    const a = []
      , l = [];
    let h, u = 0, c = !1;
    for (; u < r;) {
      for (h = e[u]; u < r && (o = s[u],
        (n = Rf(o)) !== void 0);)
        h += n + e[++u],
          c = !0;
      u !== r && l.push(o),
        a.push(h),
        u++
    }
    if (u === r && a.push(e[r]),
      c) {
      const d = a.join("$$lit$$");
      (e = il.get(d)) === void 0 && (a.raw = a,
        il.set(d, e = a)),
        s = l
    }
    return t(e, ...s)
  }
  , Bf = Uf(Et);
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const we = t => t ?? V;
var Lt = class extends _e {
  constructor() {
    super(...arguments),
      this.hasFocus = !1,
      this.label = "",
      this.disabled = !1
  }
  handleBlur() {
    this.hasFocus = !1,
      this.emit("sl-blur")
  }
  handleFocus() {
    this.hasFocus = !0,
      this.emit("sl-focus")
  }
  handleClick(t) {
    this.disabled && (t.preventDefault(),
      t.stopPropagation())
  }
  click() {
    this.button.click()
  }
  focus(t) {
    this.button.focus(t)
  }
  blur() {
    this.button.blur()
  }
  render() {
    const t = !!this.href
      , e = t ? sl`a` : sl`button`;
    return Bf`
      <${e}
        part="base"
        class=${_s({
      "icon-button": !0,
      "icon-button--disabled": !t && this.disabled,
      "icon-button--focused": this.hasFocus
    })}
        ?disabled=${we(t ? void 0 : this.disabled)}
        type=${we(t ? void 0 : "button")}
        href=${we(t ? this.href : void 0)}
        target=${we(t ? this.target : void 0)}
        download=${we(t ? this.download : void 0)}
        rel=${we(t && this.target ? "noreferrer noopener" : void 0)}
        role=${we(t ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        aria-label="${this.label}"
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${we(this.name)}
          library=${we(this.library)}
          src=${we(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `
  }
}
  ;
Lt.styles = [zs, gf];
Lt.dependencies = {
  "sl-icon": Ee
};
m([$s(".icon-button")], Lt.prototype, "button", 2);
m([Pe()], Lt.prototype, "hasFocus", 2);
m([_()], Lt.prototype, "name", 2);
m([_()], Lt.prototype, "library", 2);
m([_()], Lt.prototype, "src", 2);
m([_()], Lt.prototype, "href", 2);
m([_()], Lt.prototype, "target", 2);
m([_()], Lt.prototype, "download", 2);
m([_()], Lt.prototype, "label", 2);
m([_({
  type: Boolean,
  reflect: !0
})], Lt.prototype, "disabled", 2);
var Xc = new Map
  , Nf = new WeakMap;
function Vf(t) {
  return t ?? {
    keyframes: [],
    options: {
      duration: 0
    }
  }
}
function rl(t, e) {
  return e.toLowerCase() === "rtl" ? {
    keyframes: t.rtlKeyframes || t.keyframes,
    options: t.options
  } : t
}
function tu(t, e) {
  Xc.set(t, Vf(e))
}
function nl(t, e, s) {
  const r = Nf.get(t);
  if (r != null && r[e])
    return rl(r[e], s.dir);
  const n = Xc.get(e);
  return n ? rl(n, s.dir) : {
    keyframes: [],
    options: {
      duration: 0
    }
  }
}
function ol(t, e) {
  return new Promise(s => {
    function r(n) {
      n.target === t && (t.removeEventListener(e, r),
        s())
    }
    t.addEventListener(e, r)
  }
  )
}
function al(t, e, s) {
  return new Promise(r => {
    if ((s == null ? void 0 : s.duration) === 1 / 0)
      throw new Error("Promise-based animations must be finite.");
    const n = t.animate(e, da(ki({}, s), {
      duration: qf() ? 0 : s.duration
    }));
    n.addEventListener("cancel", r, {
      once: !0
    }),
      n.addEventListener("finish", r, {
        once: !0
      })
  }
  )
}
function qf() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
function ll(t) {
  return Promise.all(t.getAnimations().map(e => new Promise(s => {
    e.cancel(),
      requestAnimationFrame(s)
  }
  )))
}
var fa = class {
  constructor(t, ...e) {
    this.slotNames = [],
      this.handleSlotChange = s => {
        const r = s.target;
        (this.slotNames.includes("[default]") && !r.name || r.name && this.slotNames.includes(r.name)) && this.host.requestUpdate()
      }
      ,
      (this.host = t).addController(this),
      this.slotNames = e
  }
  hasDefaultSlot() {
    return [...this.host.childNodes].some(t => {
      if (t.nodeType === t.TEXT_NODE && t.textContent.trim() !== "")
        return !0;
      if (t.nodeType === t.ELEMENT_NODE) {
        const e = t;
        if (e.tagName.toLowerCase() === "sl-visually-hidden")
          return !1;
        if (!e.hasAttribute("slot"))
          return !0
      }
      return !1
    }
    )
  }
  hasNamedSlot(t) {
    return this.host.querySelector(`:scope > [slot="${t}"]`) !== null
  }
  test(t) {
    return t === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(t)
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.handleSlotChange)
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.handleSlotChange)
  }
}
  ;
const Vo = new Set
  , Rs = new Map;
let ws, ga = "ltr", pa = "en";
const eu = typeof MutationObserver < "u" && typeof document < "u" && typeof document.documentElement < "u";
if (eu) {
  const t = new MutationObserver(iu);
  ga = document.documentElement.dir || "ltr",
    pa = document.documentElement.lang || navigator.language,
    t.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["dir", "lang"]
    })
}
function su(...t) {
  t.map(e => {
    const s = e.$code.toLowerCase();
    Rs.has(s) ? Rs.set(s, Object.assign(Object.assign({}, Rs.get(s)), e)) : Rs.set(s, e),
      ws || (ws = e)
  }
  ),
    iu()
}
function iu() {
  eu && (ga = document.documentElement.dir || "ltr",
    pa = document.documentElement.lang || navigator.language),
    [...Vo.keys()].map(t => {
      typeof t.requestUpdate == "function" && t.requestUpdate()
    }
    )
}
let Hf = class {
  constructor(e) {
    this.host = e,
      this.host.addController(this)
  }
  hostConnected() {
    Vo.add(this.host)
  }
  hostDisconnected() {
    Vo.delete(this.host)
  }
  dir() {
    return `${this.host.dir || ga}`.toLowerCase()
  }
  lang() {
    return `${this.host.lang || pa}`.toLowerCase()
  }
  getTranslationData(e) {
    var s, r;
    const n = new Intl.Locale(e.replace(/_/g, "-"))
      , o = n == null ? void 0 : n.language.toLowerCase()
      , a = (r = (s = n == null ? void 0 : n.region) === null || s === void 0 ? void 0 : s.toLowerCase()) !== null && r !== void 0 ? r : ""
      , l = Rs.get(`${o}-${a}`)
      , h = Rs.get(o);
    return {
      locale: n,
      language: o,
      region: a,
      primary: l,
      secondary: h
    }
  }
  exists(e, s) {
    var r;
    const { primary: n, secondary: o } = this.getTranslationData((r = s.lang) !== null && r !== void 0 ? r : this.lang());
    return s = Object.assign({
      includeFallback: !1
    }, s),
      !!(n && n[e] || o && o[e] || s.includeFallback && ws && ws[e])
  }
  term(e, ...s) {
    const { primary: r, secondary: n } = this.getTranslationData(this.lang());
    let o;
    if (r && r[e])
      o = r[e];
    else if (n && n[e])
      o = n[e];
    else if (ws && ws[e])
      o = ws[e];
    else
      return console.error(`No translation found for: ${String(e)}`),
        String(e);
    return typeof o == "function" ? o(...s) : o
  }
  date(e, s) {
    return e = new Date(e),
      new Intl.DateTimeFormat(this.lang(), s).format(e)
  }
  number(e, s) {
    return e = Number(e),
      isNaN(e) ? "" : new Intl.NumberFormat(this.lang(), s).format(e)
  }
  relativeTime(e, s, r) {
    return new Intl.RelativeTimeFormat(this.lang(), r).format(e, s)
  }
}
  ;
var ru = {
  $code: "en",
  $name: "English",
  $dir: "ltr",
  carousel: "Carousel",
  clearEntry: "Clear entry",
  close: "Close",
  copied: "Copied",
  copy: "Copy",
  currentValue: "Current value",
  error: "Error",
  goToSlide: (t, e) => `Go to slide ${t} of ${e}`,
  hidePassword: "Hide password",
  loading: "Loading",
  nextSlide: "Next slide",
  numOptionsSelected: t => t === 0 ? "No options selected" : t === 1 ? "1 option selected" : `${t} options selected`,
  previousSlide: "Previous slide",
  progress: "Progress",
  remove: "Remove",
  resize: "Resize",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  selectAColorFromTheScreen: "Select a color from the screen",
  showPassword: "Show password",
  slideNum: t => `Slide ${t}`,
  toggleColorFormat: "Toggle color format"
};
su(ru);
var Kf = ru
  , Wf = class extends Hf {
  }
  ;
su(Kf);
var Gf = as`
  :host {
    display: contents;

    /* For better DX, we'll reset the margin here so the base part can inherit it */
    margin: 0;
  }

  .alert {
    position: relative;
    display: flex;
    align-items: stretch;
    background-color: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-top-width: calc(var(--sl-panel-border-width) * 3);
    border-radius: var(--sl-border-radius-medium);
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-normal);
    line-height: 1.6;
    color: var(--sl-color-neutral-700);
    margin: inherit;
    overflow: hidden;
  }

  .alert:not(.alert--has-icon) .alert__icon,
  .alert:not(.alert--closable) .alert__close-button {
    display: none;
  }

  .alert__icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-large);
    padding-inline-start: var(--sl-spacing-large);
  }

  .alert--has-countdown {
    border-bottom: none;
  }

  .alert--primary {
    border-top-color: var(--sl-color-primary-600);
  }

  .alert--primary .alert__icon {
    color: var(--sl-color-primary-600);
  }

  .alert--success {
    border-top-color: var(--sl-color-success-600);
  }

  .alert--success .alert__icon {
    color: var(--sl-color-success-600);
  }

  .alert--neutral {
    border-top-color: var(--sl-color-neutral-600);
  }

  .alert--neutral .alert__icon {
    color: var(--sl-color-neutral-600);
  }

  .alert--warning {
    border-top-color: var(--sl-color-warning-600);
  }

  .alert--warning .alert__icon {
    color: var(--sl-color-warning-600);
  }

  .alert--danger {
    border-top-color: var(--sl-color-danger-600);
  }

  .alert--danger .alert__icon {
    color: var(--sl-color-danger-600);
  }

  .alert__message {
    flex: 1 1 auto;
    display: block;
    padding: var(--sl-spacing-large);
    overflow: hidden;
  }

  .alert__close-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
    padding-inline-end: var(--sl-spacing-medium);
  }

  .alert__countdown {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(var(--sl-panel-border-width) * 3);
    background-color: var(--sl-panel-border-color);
    display: flex;
  }

  .alert__countdown--ltr {
    justify-content: flex-end;
  }

  .alert__countdown .alert__countdown-elapsed {
    height: 100%;
    width: 0;
  }

  .alert--primary .alert__countdown-elapsed {
    background-color: var(--sl-color-primary-600);
  }

  .alert--success .alert__countdown-elapsed {
    background-color: var(--sl-color-success-600);
  }

  .alert--neutral .alert__countdown-elapsed {
    background-color: var(--sl-color-neutral-600);
  }

  .alert--warning .alert__countdown-elapsed {
    background-color: var(--sl-color-warning-600);
  }

  .alert--danger .alert__countdown-elapsed {
    background-color: var(--sl-color-danger-600);
  }

  .alert__timer {
    display: none;
  }
`
  , Ps = Object.assign(document.createElement("div"), {
    className: "sl-toast-stack"
  })
  , Pt = class extends _e {
    constructor() {
      super(...arguments),
        this.hasSlotController = new fa(this, "icon", "suffix"),
        this.localize = new Wf(this),
        this.open = !1,
        this.closable = !1,
        this.variant = "primary",
        this.duration = 1 / 0,
        this.remainingTime = this.duration
    }
    firstUpdated() {
      this.base.hidden = !this.open
    }
    restartAutoHide() {
      this.handleCountdownChange(),
        clearTimeout(this.autoHideTimeout),
        clearInterval(this.remainingTimeInterval),
        this.open && this.duration < 1 / 0 && (this.autoHideTimeout = window.setTimeout(() => this.hide(), this.duration),
          this.remainingTime = this.duration,
          this.remainingTimeInterval = window.setInterval(() => {
            this.remainingTime -= 100
          }
            , 100))
    }
    pauseAutoHide() {
      var t;
      (t = this.countdownAnimation) == null || t.pause(),
        clearTimeout(this.autoHideTimeout),
        clearInterval(this.remainingTimeInterval)
    }
    resumeAutoHide() {
      var t;
      this.duration < 1 / 0 && (this.autoHideTimeout = window.setTimeout(() => this.hide(), this.remainingTime),
        this.remainingTimeInterval = window.setInterval(() => {
          this.remainingTime -= 100
        }
          , 100),
        (t = this.countdownAnimation) == null || t.play())
    }
    handleCountdownChange() {
      if (this.open && this.duration < 1 / 0 && this.countdown) {
        const { countdownElement: t } = this
          , e = "100%"
          , s = "0";
        this.countdownAnimation = t.animate([{
          width: e
        }, {
          width: s
        }], {
          duration: this.duration,
          easing: "linear"
        })
      }
    }
    handleCloseClick() {
      this.hide()
    }
    async handleOpenChange() {
      if (this.open) {
        this.emit("sl-show"),
          this.duration < 1 / 0 && this.restartAutoHide(),
          await ll(this.base),
          this.base.hidden = !1;
        const { keyframes: t, options: e } = nl(this, "alert.show", {
          dir: this.localize.dir()
        });
        await al(this.base, t, e),
          this.emit("sl-after-show")
      } else {
        this.emit("sl-hide"),
          clearTimeout(this.autoHideTimeout),
          clearInterval(this.remainingTimeInterval),
          await ll(this.base);
        const { keyframes: t, options: e } = nl(this, "alert.hide", {
          dir: this.localize.dir()
        });
        await al(this.base, t, e),
          this.base.hidden = !0,
          this.emit("sl-after-hide")
      }
    }
    handleDurationChange() {
      this.restartAutoHide()
    }
    async show() {
      if (!this.open)
        return this.open = !0,
          ol(this, "sl-after-show")
    }
    async hide() {
      if (this.open)
        return this.open = !1,
          ol(this, "sl-after-hide")
    }
    async toast() {
      return new Promise(t => {
        this.handleCountdownChange(),
          Ps.parentElement === null && document.body.append(Ps),
          Ps.appendChild(this),
          requestAnimationFrame(() => {
            this.clientWidth,
              this.show()
          }
          ),
          this.addEventListener("sl-after-hide", () => {
            Ps.removeChild(this),
              t(),
              Ps.querySelector("sl-alert") === null && Ps.remove()
          }
            , {
              once: !0
            })
      }
      )
    }
    render() {
      return Et`
      <div
        part="base"
        class=${_s({
        alert: !0,
        "alert--open": this.open,
        "alert--closable": this.closable,
        "alert--has-countdown": !!this.countdown,
        "alert--has-icon": this.hasSlotController.test("icon"),
        "alert--primary": this.variant === "primary",
        "alert--success": this.variant === "success",
        "alert--neutral": this.variant === "neutral",
        "alert--warning": this.variant === "warning",
        "alert--danger": this.variant === "danger"
      })}
        role="alert"
        aria-hidden=${this.open ? "false" : "true"}
        @mouseenter=${this.pauseAutoHide}
        @mouseleave=${this.resumeAutoHide}
      >
        <div part="icon" class="alert__icon">
          <slot name="icon"></slot>
        </div>

        <div part="message" class="alert__message" aria-live="polite">
          <slot></slot>
        </div>

        ${this.closable ? Et`
              <sl-icon-button
                part="close-button"
                exportparts="base:close-button__base"
                class="alert__close-button"
                name="x-lg"
                library="system"
                label=${this.localize.term("close")}
                @click=${this.handleCloseClick}
              ></sl-icon-button>
            ` : ""}

        <div role="timer" class="alert__timer">${this.remainingTime}</div>

        ${this.countdown ? Et`
              <div
                class=${_s({
        alert__countdown: !0,
        "alert__countdown--ltr": this.countdown === "ltr"
      })}
              >
                <div class="alert__countdown-elapsed"></div>
              </div>
            ` : ""}
      </div>
    `
    }
  }
  ;
Pt.styles = [zs, Gf];
Pt.dependencies = {
  "sl-icon-button": Lt
};
m([$s('[part~="base"]')], Pt.prototype, "base", 2);
m([$s(".alert__countdown-elapsed")], Pt.prototype, "countdownElement", 2);
m([_({
  type: Boolean,
  reflect: !0
})], Pt.prototype, "open", 2);
m([_({
  type: Boolean,
  reflect: !0
})], Pt.prototype, "closable", 2);
m([_({
  reflect: !0
})], Pt.prototype, "variant", 2);
m([_({
  type: Number
})], Pt.prototype, "duration", 2);
m([_({
  type: String,
  reflect: !0
})], Pt.prototype, "countdown", 2);
m([Pe()], Pt.prototype, "remainingTime", 2);
m([Le("open", {
  waitUntilFirstUpdate: !0
})], Pt.prototype, "handleOpenChange", 1);
m([Le("duration")], Pt.prototype, "handleDurationChange", 1);
tu("alert.show", {
  keyframes: [{
    opacity: 0,
    scale: .8
  }, {
    opacity: 1,
    scale: 1
  }],
  options: {
    duration: 250,
    easing: "ease"
  }
});
tu("alert.hide", {
  keyframes: [{
    opacity: 1,
    scale: 1
  }, {
    opacity: 0,
    scale: .8
  }],
  options: {
    duration: 250,
    easing: "ease"
  }
});
Pt.define("sl-alert");
var Yf = as`
  :host {
    display: inline-block;
  }

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .checkbox--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .checkbox--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .checkbox--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .checkbox__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 2px;
    background-color: var(--sl-input-background-color);
    color: var(--sl-color-neutral-0);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .checkbox__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .checkbox__checked-icon,
  .checkbox__indeterminate-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  /* Hover */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Focus */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked/indeterminate */
  .checkbox--checked .checkbox__control,
  .checkbox--indeterminate .checkbox__control {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked/indeterminate + hover */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__control:hover,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked/indeterminate + focus */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .checkbox--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .checkbox__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }
`
  , Zf = (t = "value") => (e, s) => {
    const r = e.constructor
      , n = r.prototype.attributeChangedCallback;
    r.prototype.attributeChangedCallback = function (o, a, l) {
      var h;
      const u = r.getPropertyOptions(t)
        , c = typeof u.attribute == "string" ? u.attribute : t;
      if (o === c) {
        const d = u.converter || Oi
          , y = (typeof d == "function" ? d : (h = d == null ? void 0 : d.fromAttribute) != null ? h : Oi.fromAttribute)(l, u.type);
        this[t] !== y && (this[s] = y)
      }
      n.call(this, o, a, l)
    }
  }
  , nu = as`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`
  , Ii = new WeakMap
  , Fi = new WeakMap
  , Ri = new WeakMap
  , gn = new WeakSet
  , Ar = new WeakMap
  , ou = class {
    constructor(t, e) {
      this.handleFormData = s => {
        const r = this.options.disabled(this.host)
          , n = this.options.name(this.host)
          , o = this.options.value(this.host)
          , a = this.host.tagName.toLowerCase() === "sl-button";
        this.host.isConnected && !r && !a && typeof n == "string" && n.length > 0 && typeof o < "u" && (Array.isArray(o) ? o.forEach(l => {
          s.formData.append(n, l.toString())
        }
        ) : s.formData.append(n, o.toString()))
      }
        ,
        this.handleFormSubmit = s => {
          var r;
          const n = this.options.disabled(this.host)
            , o = this.options.reportValidity;
          this.form && !this.form.noValidate && ((r = Ii.get(this.form)) == null || r.forEach(a => {
            this.setUserInteracted(a, !0)
          }
          )),
            this.form && !this.form.noValidate && !n && !o(this.host) && (s.preventDefault(),
              s.stopImmediatePropagation())
        }
        ,
        this.handleFormReset = () => {
          this.options.setValue(this.host, this.options.defaultValue(this.host)),
            this.setUserInteracted(this.host, !1),
            Ar.set(this.host, [])
        }
        ,
        this.handleInteraction = s => {
          const r = Ar.get(this.host);
          r.includes(s.type) || r.push(s.type),
            r.length === this.options.assumeInteractionOn.length && this.setUserInteracted(this.host, !0)
        }
        ,
        this.checkFormValidity = () => {
          if (this.form && !this.form.noValidate) {
            const s = this.form.querySelectorAll("*");
            for (const r of s)
              if (typeof r.checkValidity == "function" && !r.checkValidity())
                return !1
          }
          return !0
        }
        ,
        this.reportFormValidity = () => {
          if (this.form && !this.form.noValidate) {
            const s = this.form.querySelectorAll("*");
            for (const r of s)
              if (typeof r.reportValidity == "function" && !r.reportValidity())
                return !1
          }
          return !0
        }
        ,
        (this.host = t).addController(this),
        this.options = ki({
          form: s => {
            const r = s.form;
            if (r) {
              const o = s.getRootNode().querySelector(`#${r}`);
              if (o)
                return o
            }
            return s.closest("form")
          }
          ,
          name: s => s.name,
          value: s => s.value,
          defaultValue: s => s.defaultValue,
          disabled: s => {
            var r;
            return (r = s.disabled) != null ? r : !1
          }
          ,
          reportValidity: s => typeof s.reportValidity == "function" ? s.reportValidity() : !0,
          checkValidity: s => typeof s.checkValidity == "function" ? s.checkValidity() : !0,
          setValue: (s, r) => s.value = r,
          assumeInteractionOn: ["sl-input"]
        }, e)
    }
    hostConnected() {
      const t = this.options.form(this.host);
      t && this.attachForm(t),
        Ar.set(this.host, []),
        this.options.assumeInteractionOn.forEach(e => {
          this.host.addEventListener(e, this.handleInteraction)
        }
        )
    }
    hostDisconnected() {
      this.detachForm(),
        Ar.delete(this.host),
        this.options.assumeInteractionOn.forEach(t => {
          this.host.removeEventListener(t, this.handleInteraction)
        }
        )
    }
    hostUpdated() {
      const t = this.options.form(this.host);
      t || this.detachForm(),
        t && this.form !== t && (this.detachForm(),
          this.attachForm(t)),
        this.host.hasUpdated && this.setValidity(this.host.validity.valid)
    }
    attachForm(t) {
      t ? (this.form = t,
        Ii.has(this.form) ? Ii.get(this.form).add(this.host) : Ii.set(this.form, new Set([this.host])),
        this.form.addEventListener("formdata", this.handleFormData),
        this.form.addEventListener("submit", this.handleFormSubmit),
        this.form.addEventListener("reset", this.handleFormReset),
        Fi.has(this.form) || (Fi.set(this.form, this.form.reportValidity),
          this.form.reportValidity = () => this.reportFormValidity()),
        Ri.has(this.form) || (Ri.set(this.form, this.form.checkValidity),
          this.form.checkValidity = () => this.checkFormValidity())) : this.form = void 0
    }
    detachForm() {
      if (!this.form)
        return;
      const t = Ii.get(this.form);
      t && (t.delete(this.host),
        t.size <= 0 && (this.form.removeEventListener("formdata", this.handleFormData),
          this.form.removeEventListener("submit", this.handleFormSubmit),
          this.form.removeEventListener("reset", this.handleFormReset),
          Fi.has(this.form) && (this.form.reportValidity = Fi.get(this.form),
            Fi.delete(this.form)),
          Ri.has(this.form) && (this.form.checkValidity = Ri.get(this.form),
            Ri.delete(this.form)),
          this.form = void 0))
    }
    setUserInteracted(t, e) {
      e ? gn.add(t) : gn.delete(t),
        t.requestUpdate()
    }
    doAction(t, e) {
      if (this.form) {
        const s = document.createElement("button");
        s.type = t,
          s.style.position = "absolute",
          s.style.width = "0",
          s.style.height = "0",
          s.style.clipPath = "inset(50%)",
          s.style.overflow = "hidden",
          s.style.whiteSpace = "nowrap",
          e && (s.name = e.name,
            s.value = e.value,
            ["formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"].forEach(r => {
              e.hasAttribute(r) && s.setAttribute(r, e.getAttribute(r))
            }
            )),
          this.form.append(s),
          s.click(),
          s.remove()
      }
    }
    getForm() {
      var t;
      return (t = this.form) != null ? t : null
    }
    reset(t) {
      this.doAction("reset", t)
    }
    submit(t) {
      this.doAction("submit", t)
    }
    setValidity(t) {
      const e = this.host
        , s = !!gn.has(e)
        , r = !!e.required;
      e.toggleAttribute("data-required", r),
        e.toggleAttribute("data-optional", !r),
        e.toggleAttribute("data-invalid", !t),
        e.toggleAttribute("data-valid", t),
        e.toggleAttribute("data-user-invalid", !t && s),
        e.toggleAttribute("data-user-valid", t && s)
    }
    updateValidity() {
      const t = this.host;
      this.setValidity(t.validity.valid)
    }
    emitInvalidEvent(t) {
      const e = new CustomEvent("sl-invalid", {
        bubbles: !1,
        composed: !1,
        cancelable: !0,
        detail: {}
      });
      t || e.preventDefault(),
        this.host.dispatchEvent(e) || t == null || t.preventDefault()
    }
  }
  , ya = Object.freeze({
    badInput: !1,
    customError: !1,
    patternMismatch: !1,
    rangeOverflow: !1,
    rangeUnderflow: !1,
    stepMismatch: !1,
    tooLong: !1,
    tooShort: !1,
    typeMismatch: !1,
    valid: !0,
    valueMissing: !1
  })
  , Jf = Object.freeze(da(ki({}, ya), {
    valid: !1,
    valueMissing: !0
  }))
  , Qf = Object.freeze(da(ki({}, ya), {
    valid: !1,
    customError: !0
  }));
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hl = Zc(class extends Jc {
  constructor(t) {
    if (super(t),
      t.type !== bs.PROPERTY && t.type !== bs.ATTRIBUTE && t.type !== bs.BOOLEAN_ATTRIBUTE)
      throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Mf(t))
      throw Error("`live` bindings can only contain a single expression")
  }
  render(t) {
    return t
  }
  update(t, [e]) {
    if (e === Oe || e === V)
      return e;
    const s = t.element
      , r = t.name;
    if (t.type === bs.PROPERTY) {
      if (e === s[r])
        return Oe
    } else if (t.type === bs.BOOLEAN_ATTRIBUTE) {
      if (!!e === s.hasAttribute(r))
        return Oe
    } else if (t.type === bs.ATTRIBUTE && s.getAttribute(r) === e + "")
      return Oe;
    return Ff(t),
      e
  }
}
);
var st = class extends _e {
  constructor() {
    super(...arguments),
      this.formControlController = new ou(this, {
        value: t => t.checked ? t.value || "on" : void 0,
        defaultValue: t => t.defaultChecked,
        setValue: (t, e) => t.checked = e
      }),
      this.hasSlotController = new fa(this, "help-text"),
      this.hasFocus = !1,
      this.title = "",
      this.name = "",
      this.size = "medium",
      this.disabled = !1,
      this.checked = !1,
      this.indeterminate = !1,
      this.defaultChecked = !1,
      this.form = "",
      this.required = !1,
      this.helpText = ""
  }
  get validity() {
    return this.input.validity
  }
  get validationMessage() {
    return this.input.validationMessage
  }
  firstUpdated() {
    this.formControlController.updateValidity()
  }
  handleClick() {
    this.checked = !this.checked,
      this.indeterminate = !1,
      this.emit("sl-change")
  }
  handleBlur() {
    this.hasFocus = !1,
      this.emit("sl-blur")
  }
  handleInput() {
    this.emit("sl-input")
  }
  handleInvalid(t) {
    this.formControlController.setValidity(!1),
      this.formControlController.emitInvalidEvent(t)
  }
  handleFocus() {
    this.hasFocus = !0,
      this.emit("sl-focus")
  }
  handleDisabledChange() {
    this.formControlController.setValidity(this.disabled)
  }
  handleStateChange() {
    this.input.checked = this.checked,
      this.input.indeterminate = this.indeterminate,
      this.formControlController.updateValidity()
  }
  click() {
    this.input.click()
  }
  focus(t) {
    this.input.focus(t)
  }
  blur() {
    this.input.blur()
  }
  checkValidity() {
    return this.input.checkValidity()
  }
  getForm() {
    return this.formControlController.getForm()
  }
  reportValidity() {
    return this.input.reportValidity()
  }
  setCustomValidity(t) {
    this.input.setCustomValidity(t),
      this.formControlController.updateValidity()
  }
  render() {
    const t = this.hasSlotController.test("help-text")
      , e = this.helpText ? !0 : !!t;
    return Et`
      <div
        class=${_s({
      "form-control": !0,
      "form-control--small": this.size === "small",
      "form-control--medium": this.size === "medium",
      "form-control--large": this.size === "large",
      "form-control--has-help-text": e
    })}
      >
        <label
          part="base"
          class=${_s({
      checkbox: !0,
      "checkbox--checked": this.checked,
      "checkbox--disabled": this.disabled,
      "checkbox--focused": this.hasFocus,
      "checkbox--indeterminate": this.indeterminate,
      "checkbox--small": this.size === "small",
      "checkbox--medium": this.size === "medium",
      "checkbox--large": this.size === "large"
    })}
        >
          <input
            class="checkbox__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${we(this.value)}
            .indeterminate=${hl(this.indeterminate)}
            .checked=${hl(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked ? "true" : "false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />

          <span
            part="control${this.checked ? " control--checked" : ""}${this.indeterminate ? " control--indeterminate" : ""}"
            class="checkbox__control"
          >
            ${this.checked ? Et`
                  <sl-icon part="checked-icon" class="checkbox__checked-icon" library="system" name="check"></sl-icon>
                ` : ""}
            ${!this.checked && this.indeterminate ? Et`
                  <sl-icon
                    part="indeterminate-icon"
                    class="checkbox__indeterminate-icon"
                    library="system"
                    name="indeterminate"
                  ></sl-icon>
                ` : ""}
          </span>

          <div part="label" class="checkbox__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${e ? "false" : "true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `
  }
}
  ;
st.styles = [zs, nu, Yf];
st.dependencies = {
  "sl-icon": Ee
};
m([$s('input[type="checkbox"]')], st.prototype, "input", 2);
m([Pe()], st.prototype, "hasFocus", 2);
m([_()], st.prototype, "title", 2);
m([_()], st.prototype, "name", 2);
m([_()], st.prototype, "value", 2);
m([_({
  reflect: !0
})], st.prototype, "size", 2);
m([_({
  type: Boolean,
  reflect: !0
})], st.prototype, "disabled", 2);
m([_({
  type: Boolean,
  reflect: !0
})], st.prototype, "checked", 2);
m([_({
  type: Boolean,
  reflect: !0
})], st.prototype, "indeterminate", 2);
m([Zf("checked")], st.prototype, "defaultChecked", 2);
m([_({
  reflect: !0
})], st.prototype, "form", 2);
m([_({
  type: Boolean,
  reflect: !0
})], st.prototype, "required", 2);
m([_({
  attribute: "help-text"
})], st.prototype, "helpText", 2);
m([Le("disabled", {
  waitUntilFirstUpdate: !0
})], st.prototype, "handleDisabledChange", 1);
m([Le(["checked", "indeterminate"], {
  waitUntilFirstUpdate: !0
})], st.prototype, "handleStateChange", 1);
st.define("sl-checkbox");
var Xf = as`
  :host {
    display: block;
  }

  :host(:focus-visible) {
    outline: 0px;
  }

  .radio {
    display: inline-flex;
    align-items: top;
    font-family: var(--sl-input-font-family);
    font-size: var(--sl-input-font-size-medium);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .radio--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .radio--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .radio--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .radio__checked-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  .radio__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 50%;
    background-color: var(--sl-input-background-color);
    color: transparent;
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .radio__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Hover */
  .radio:not(.radio--checked):not(.radio--disabled) .radio__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Checked */
  .radio--checked .radio__control {
    color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked + hover */
  .radio.radio--checked:not(.radio--disabled) .radio__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked + focus */
  :host(:focus-visible) .radio__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .radio--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When the control isn't checked, hide the circle for Windows High Contrast mode a11y */
  .radio:not(.radio--checked) svg circle {
    opacity: 0;
  }

  .radio__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }
`
  , Te = class extends _e {
    constructor() {
      super(),
        this.checked = !1,
        this.hasFocus = !1,
        this.size = "medium",
        this.disabled = !1,
        this.handleBlur = () => {
          this.hasFocus = !1,
            this.emit("sl-blur")
        }
        ,
        this.handleClick = () => {
          this.disabled || (this.checked = !0)
        }
        ,
        this.handleFocus = () => {
          this.hasFocus = !0,
            this.emit("sl-focus")
        }
        ,
        this.addEventListener("blur", this.handleBlur),
        this.addEventListener("click", this.handleClick),
        this.addEventListener("focus", this.handleFocus)
    }
    connectedCallback() {
      super.connectedCallback(),
        this.setInitialAttributes()
    }
    setInitialAttributes() {
      this.setAttribute("role", "radio"),
        this.setAttribute("tabindex", "-1"),
        this.setAttribute("aria-disabled", this.disabled ? "true" : "false")
    }
    handleCheckedChange() {
      this.setAttribute("aria-checked", this.checked ? "true" : "false"),
        this.setAttribute("tabindex", this.checked ? "0" : "-1")
    }
    handleDisabledChange() {
      this.setAttribute("aria-disabled", this.disabled ? "true" : "false")
    }
    render() {
      return Et`
      <span
        part="base"
        class=${_s({
        radio: !0,
        "radio--checked": this.checked,
        "radio--disabled": this.disabled,
        "radio--focused": this.hasFocus,
        "radio--small": this.size === "small",
        "radio--medium": this.size === "medium",
        "radio--large": this.size === "large"
      })}
      >
        <span part="${`control${this.checked ? " control--checked" : ""}`}" class="radio__control">
          ${this.checked ? Et` <sl-icon part="checked-icon" class="radio__checked-icon" library="system" name="radio"></sl-icon> ` : ""}
        </span>

        <slot part="label" class="radio__label"></slot>
      </span>
    `
    }
  }
  ;
Te.styles = [zs, Xf];
Te.dependencies = {
  "sl-icon": Ee
};
m([Pe()], Te.prototype, "checked", 2);
m([Pe()], Te.prototype, "hasFocus", 2);
m([_()], Te.prototype, "value", 2);
m([_({
  reflect: !0
})], Te.prototype, "size", 2);
m([_({
  type: Boolean,
  reflect: !0
})], Te.prototype, "disabled", 2);
m([Le("checked")], Te.prototype, "handleCheckedChange", 1);
m([Le("disabled", {
  waitUntilFirstUpdate: !0
})], Te.prototype, "handleDisabledChange", 1);
Te.define("sl-radio");
var tg = as`
  :host {
    display: block;
  }

  .form-control {
    position: relative;
    border: none;
    padding: 0;
    margin: 0;
  }

  .form-control__label {
    padding: 0;
  }

  .radio-group--required .radio-group__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`
  , eg = as`
  :host {
    display: inline-block;
  }

  .button-group {
    display: flex;
    flex-wrap: nowrap;
  }
`
  , gr = class extends _e {
    constructor() {
      super(...arguments),
        this.disableRole = !1,
        this.label = ""
    }
    handleFocus(t) {
      const e = Ui(t.target);
      e == null || e.toggleAttribute("data-sl-button-group__button--focus", !0)
    }
    handleBlur(t) {
      const e = Ui(t.target);
      e == null || e.toggleAttribute("data-sl-button-group__button--focus", !1)
    }
    handleMouseOver(t) {
      const e = Ui(t.target);
      e == null || e.toggleAttribute("data-sl-button-group__button--hover", !0)
    }
    handleMouseOut(t) {
      const e = Ui(t.target);
      e == null || e.toggleAttribute("data-sl-button-group__button--hover", !1)
    }
    handleSlotChange() {
      const t = [...this.defaultSlot.assignedElements({
        flatten: !0
      })];
      t.forEach(e => {
        const s = t.indexOf(e)
          , r = Ui(e);
        r && (r.toggleAttribute("data-sl-button-group__button", !0),
          r.toggleAttribute("data-sl-button-group__button--first", s === 0),
          r.toggleAttribute("data-sl-button-group__button--inner", s > 0 && s < t.length - 1),
          r.toggleAttribute("data-sl-button-group__button--last", s === t.length - 1),
          r.toggleAttribute("data-sl-button-group__button--radio", r.tagName.toLowerCase() === "sl-radio-button"))
      }
      )
    }
    render() {
      return Et`
      <div
        part="base"
        class="button-group"
        role="${this.disableRole ? "presentation" : "group"}"
        aria-label=${this.label}
        @focusout=${this.handleBlur}
        @focusin=${this.handleFocus}
        @mouseover=${this.handleMouseOver}
        @mouseout=${this.handleMouseOut}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `
    }
  }
  ;
gr.styles = [zs, eg];
m([$s("slot")], gr.prototype, "defaultSlot", 2);
m([Pe()], gr.prototype, "disableRole", 2);
m([_()], gr.prototype, "label", 2);
function Ui(t) {
  var e;
  const s = "sl-button, sl-radio-button";
  return (e = t.closest(s)) != null ? e : t.querySelector(s)
}
var rt = class extends _e {
  constructor() {
    super(...arguments),
      this.formControlController = new ou(this),
      this.hasSlotController = new fa(this, "help-text", "label"),
      this.customValidityMessage = "",
      this.hasButtonGroup = !1,
      this.errorMessage = "",
      this.defaultValue = "",
      this.label = "",
      this.helpText = "",
      this.name = "option",
      this.value = "",
      this.size = "medium",
      this.form = "",
      this.required = !1
  }
  get validity() {
    const t = this.required && !this.value;
    return this.customValidityMessage !== "" ? Qf : t ? Jf : ya
  }
  get validationMessage() {
    const t = this.required && !this.value;
    return this.customValidityMessage !== "" ? this.customValidityMessage : t ? this.validationInput.validationMessage : ""
  }
  connectedCallback() {
    super.connectedCallback(),
      this.defaultValue = this.value
  }
  firstUpdated() {
    this.formControlController.updateValidity()
  }
  getAllRadios() {
    return [...this.querySelectorAll("sl-radio, sl-radio-button")]
  }
  handleRadioClick(t) {
    const e = t.target.closest("sl-radio, sl-radio-button")
      , s = this.getAllRadios()
      , r = this.value;
    !e || e.disabled || (this.value = e.value,
      s.forEach(n => n.checked = n === e),
      this.value !== r && (this.emit("sl-change"),
        this.emit("sl-input")))
  }
  handleKeyDown(t) {
    var e;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(t.key))
      return;
    const s = this.getAllRadios().filter(l => !l.disabled)
      , r = (e = s.find(l => l.checked)) != null ? e : s[0]
      , n = t.key === " " ? 0 : ["ArrowUp", "ArrowLeft"].includes(t.key) ? -1 : 1
      , o = this.value;
    let a = s.indexOf(r) + n;
    a < 0 && (a = s.length - 1),
      a > s.length - 1 && (a = 0),
      this.getAllRadios().forEach(l => {
        l.checked = !1,
          this.hasButtonGroup || l.setAttribute("tabindex", "-1")
      }
      ),
      this.value = s[a].value,
      s[a].checked = !0,
      this.hasButtonGroup ? s[a].shadowRoot.querySelector("button").focus() : (s[a].setAttribute("tabindex", "0"),
        s[a].focus()),
      this.value !== o && (this.emit("sl-change"),
        this.emit("sl-input")),
      t.preventDefault()
  }
  handleLabelClick() {
    const t = this.getAllRadios()
      , s = t.find(r => r.checked) || t[0];
    s && s.focus()
  }
  handleInvalid(t) {
    this.formControlController.setValidity(!1),
      this.formControlController.emitInvalidEvent(t)
  }
  async syncRadioElements() {
    var t, e;
    const s = this.getAllRadios();
    if (await Promise.all(s.map(async r => {
      await r.updateComplete,
        r.checked = r.value === this.value,
        r.size = this.size
    }
    )),
      this.hasButtonGroup = s.some(r => r.tagName.toLowerCase() === "sl-radio-button"),
      s.length > 0 && !s.some(r => r.checked))
      if (this.hasButtonGroup) {
        const r = (t = s[0].shadowRoot) == null ? void 0 : t.querySelector("button");
        r && r.setAttribute("tabindex", "0")
      } else
        s[0].setAttribute("tabindex", "0");
    if (this.hasButtonGroup) {
      const r = (e = this.shadowRoot) == null ? void 0 : e.querySelector("sl-button-group");
      r && (r.disableRole = !0)
    }
  }
  syncRadios() {
    if (customElements.get("sl-radio") && customElements.get("sl-radio-button")) {
      this.syncRadioElements();
      return
    }
    customElements.get("sl-radio") ? this.syncRadioElements() : customElements.whenDefined("sl-radio").then(() => this.syncRadios()),
      customElements.get("sl-radio-button") ? this.syncRadioElements() : customElements.whenDefined("sl-radio-button").then(() => this.syncRadios())
  }
  updateCheckedRadio() {
    this.getAllRadios().forEach(e => e.checked = e.value === this.value),
      this.formControlController.setValidity(this.validity.valid)
  }
  handleSizeChange() {
    this.syncRadios()
  }
  handleValueChange() {
    this.hasUpdated && this.updateCheckedRadio()
  }
  checkValidity() {
    const t = this.required && !this.value
      , e = this.customValidityMessage !== "";
    return t || e ? (this.formControlController.emitInvalidEvent(),
      !1) : !0
  }
  getForm() {
    return this.formControlController.getForm()
  }
  reportValidity() {
    const t = this.validity.valid;
    return this.errorMessage = this.customValidityMessage || t ? "" : this.validationInput.validationMessage,
      this.formControlController.setValidity(t),
      this.validationInput.hidden = !0,
      clearTimeout(this.validationTimeout),
      t || (this.validationInput.hidden = !1,
        this.validationInput.reportValidity(),
        this.validationTimeout = setTimeout(() => this.validationInput.hidden = !0, 1e4)),
      t
  }
  setCustomValidity(t = "") {
    this.customValidityMessage = t,
      this.errorMessage = t,
      this.validationInput.setCustomValidity(t),
      this.formControlController.updateValidity()
  }
  render() {
    const t = this.hasSlotController.test("label")
      , e = this.hasSlotController.test("help-text")
      , s = this.label ? !0 : !!t
      , r = this.helpText ? !0 : !!e
      , n = Et`
      <slot @slotchange=${this.syncRadios} @click=${this.handleRadioClick} @keydown=${this.handleKeyDown}></slot>
    `;
    return Et`
      <fieldset
        part="form-control"
        class=${_s({
      "form-control": !0,
      "form-control--small": this.size === "small",
      "form-control--medium": this.size === "medium",
      "form-control--large": this.size === "large",
      "form-control--radio-group": !0,
      "form-control--has-label": s,
      "form-control--has-help-text": r
    })}
        role="radiogroup"
        aria-labelledby="label"
        aria-describedby="help-text"
        aria-errormessage="error-message"
      >
        <label
          part="form-control-label"
          id="label"
          class="form-control__label"
          aria-hidden=${s ? "false" : "true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div class="visually-hidden">
            <div id="error-message" aria-live="assertive">${this.errorMessage}</div>
            <label class="radio-group__validation">
              <input
                type="text"
                class="radio-group__validation-input"
                ?required=${this.required}
                tabindex="-1"
                hidden
                @invalid=${this.handleInvalid}
              />
            </label>
          </div>

          ${this.hasButtonGroup ? Et`
                <sl-button-group part="button-group" exportparts="base:button-group__base" role="presentation">
                  ${n}
                </sl-button-group>
              ` : n}
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${r ? "false" : "true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </fieldset>
    `
  }
}
  ;
rt.styles = [zs, nu, tg];
rt.dependencies = {
  "sl-button-group": gr
};
m([$s("slot:not([name])")], rt.prototype, "defaultSlot", 2);
m([$s(".radio-group__validation-input")], rt.prototype, "validationInput", 2);
m([Pe()], rt.prototype, "hasButtonGroup", 2);
m([Pe()], rt.prototype, "errorMessage", 2);
m([Pe()], rt.prototype, "defaultValue", 2);
m([_()], rt.prototype, "label", 2);
m([_({
  attribute: "help-text"
})], rt.prototype, "helpText", 2);
m([_()], rt.prototype, "name", 2);
m([_({
  reflect: !0
})], rt.prototype, "value", 2);
m([_({
  reflect: !0
})], rt.prototype, "size", 2);
m([_({
  reflect: !0
})], rt.prototype, "form", 2);
m([_({
  type: Boolean,
  reflect: !0
})], rt.prototype, "required", 2);
m([Le("size", {
  waitUntilFirstUpdate: !0
})], rt.prototype, "handleSizeChange", 1);
m([Le("value")], rt.prototype, "handleValueChange", 1);
rt.define("sl-radio-group");
class au extends Date {
  constructor() {
    super(),
      this.setTime(arguments.length === 0 ? Date.now() : arguments.length === 1 ? typeof arguments[0] == "string" ? +new Date(arguments[0]) : arguments[0] : Date.UTC(...arguments))
  }
  getTimezoneOffset() {
    return 0
  }
}
const cl = /^(get|set)(?!UTC)/;
Object.getOwnPropertyNames(Date.prototype).forEach(t => {
  if (cl.test(t)) {
    const e = Date.prototype[t.replace(cl, "$1UTC")];
    e && (au.prototype[t] = e)
  }
}
);
class fe extends au {
  toString() {
    const e = this.toDateString()
      , s = this.toTimeString();
    return `${e} ${s}`
  }
  toDateString() {
    const e = sg.format(this)
      , s = ig.format(this)
      , r = this.getFullYear();
    return `${e} ${s} ${r}`
  }
  toTimeString() {
    return `${rg.format(this)} GMT+0000 (Coordinated Universal Time)`
  }
  toLocaleString(e, s) {
    return Date.prototype.toLocaleString.call(this, e, {
      timeZone: "UTC",
      ...s
    })
  }
  toLocaleDateString(e, s) {
    return Date.prototype.toLocaleDateString.call(this, e, {
      timeZone: "UTC",
      ...s
    })
  }
  toLocaleTimeString(e, s) {
    return Date.prototype.toLocaleTimeString.call(this, e, {
      timeZone: "UTC",
      ...s
    })
  }
}
var sg = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC"
})
  , ig = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  })
  , rg = new Intl.DateTimeFormat("en-GB", {
    hour12: !1,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "UTC"
  });
function lt(t, e, s, r) {
  const n = r.length;
  r.push(""),
    e(s, r);
  const o = r.length - n - 1;
  return o !== 0 ? r[n] = `${t}m${o}` : r.pop(),
    r
}
function Hr(t, e) {
  const s = [];
  return t(e, s),
    `!${s.join("!")}`
}
function De(t) {
  return t.replace(/[!*]/g, e => `*${e.charCodeAt(0).toString(16).toUpperCase()}`)
}
var $r = (t => (t[t.NULL = 0] = "NULL",
  t[t.OFFICIAL = 2] = "OFFICIAL",
  t[t.USER_PHOTO = 3] = "USER_PHOTO",
  t[t.USER_PHOTO_2 = 8] = "USER_PHOTO_2",
  t[t.USER_UPLOADED = 10] = "USER_UPLOADED",
  t))($r || {}), Cr = (t => (t[t.NULL = 0] = "NULL",
    t[t.UNKNOWN1 = 1] = "UNKNOWN1",
    t[t.PHOTOSPHERE = 2] = "PHOTOSPHERE",
    t[t.PHOTO = 3] = "PHOTO",
    t[t.VIDEO = 4] = "VIDEO",
    t))(Cr || {}), Bs = (t => (t[t.ROADMAP = 0] = "ROADMAP",
      t[t.SATELLITE = 1] = "SATELLITE",
      t[t.OVERLAY = 2] = "OVERLAY",
      t[t.UNKNOWN = 3] = "UNKNOWN",
      t[t.TERRAIN = 4] = "TERRAIN",
      t[t.TERRAIN_RELIEF = 5] = "TERRAIN_RELIEF",
      t[t.TERRAIN_CONTOURS = 6] = "TERRAIN_CONTOURS",
      t))(Bs || {}), et = (t => (t[t.NULL = 0] = "NULL",
        t[t.NORMAL = 1] = "NORMAL",
        t[t.HIGH_DPI = 2] = "HIGH_DPI",
        t[t.NO_LABELS = 3] = "NO_LABELS",
        t[t.SATELLITE = 4] = "SATELLITE",
        t[t.BIG_ROAD_ICONS = 13] = "BIG_ROAD_ICONS",
        t[t.LABELS_ONLY = 15] = "LABELS_ONLY",
        t[t.LABELS_ONLY_ROADMAP = 18] = "LABELS_ONLY_ROADMAP",
        t[t.WHITE_ROADS = 21] = "WHITE_ROADS",
        t[t.STYLERS = 26] = "STYLERS",
        t[t.SMARTMAPS = 37] = "SMARTMAPS",
        t[t.STREET_VIEW_DARK = 40] = "STREET_VIEW_DARK",
        t[t.TERRAIN_ROADS = 63] = "TERRAIN_ROADS",
        t[t.NO_LAND_USE = 64] = "NO_LAND_USE",
        t[t.TERRAIN = 67] = "TERRAIN",
        t[t.BASEMAP = 68] = "BASEMAP",
        t))(et || {}), lu = (t => (t[t.OVERLAY_NULL = 0] = "OVERLAY_NULL",
          t[t.HYBRID_OVERLAY = 18] = "HYBRID_OVERLAY",
          t))(lu || {}), ci, $l, pn = ($l = class {
            constructor(e) {
              p(this, ci, []);
              Array.isArray(e) ? g(this, ci, e) : e && Object.assign(this, e)
            }
            toArray() {
              return i(this, ci)
            }
            toObject() {
              return {}
            }
            serialize(e) {
              i(this, ci).length
            }
          }
            ,
            ci = new WeakMap,
            $l);
function ng(t, e) { }
var ui, Cl, yn = (Cl = class {
  constructor(e) {
    p(this, ui, []);
    Array.isArray(e) ? g(this, ui, e) : e && Object.assign(this, e)
  }
  toArray() {
    return i(this, ui)
  }
  toObject() {
    return {}
  }
  serialize(e) {
    i(this, ui).length
  }
}
  ,
  ui = new WeakMap,
  Cl);
function og(t, e) { }
var di, Dl, mn = (Dl = class {
  constructor(e) {
    p(this, di, []);
    Array.isArray(e) ? g(this, di, e) : e && Object.assign(this, e)
  }
  toArray() {
    return i(this, di)
  }
  toObject() {
    return {}
  }
  serialize(e) {
    i(this, di).length
  }
}
  ,
  di = new WeakMap,
  Dl);
function ag(t, e) { }
var O, Ll, bn = (Ll = class {
  constructor(e) {
    p(this, O, []);
    Array.isArray(e) ? g(this, O, e) : e && Object.assign(this, e)
  }
  get client() {
    return i(this, O)[0] ?? ""
  }
  set client(e) {
    i(this, O)[0] = e
  }
  get source() {
    return i(this, O)[1] ?? 0
  }
  set source(e) {
    i(this, O)[1] = e
  }
  get clientId() {
    return i(this, O)[2] ?? 0
  }
  set clientId(e) {
    i(this, O)[2] = e
  }
  get cacheBehavior() {
    return i(this, O)[3] ?? 0
  }
  set cacheBehavior(e) {
    i(this, O)[3] = e
  }
  get language() {
    return i(this, O)[4] ?? ""
  }
  set language(e) {
    i(this, O)[4] = e
  }
  get gpsDebugLevel() {
    return i(this, O)[5] ?? 0
  }
  set gpsDebugLevel(e) {
    i(this, O)[5] = e
  }
  get httpResponseFormat() {
    return i(this, O)[6] ?? 0
  }
  set httpResponseFormat(e) {
    i(this, O)[6] = e
  }
  get inlineExtraDataSpec() {
    return i(this, O)[7] ?? !1
  }
  set inlineExtraDataSpec(e) {
    i(this, O)[7] = e
  }
  get queryOrigin() {
    return i(this, O)[8] ?? ""
  }
  set queryOrigin(e) {
    i(this, O)[8] = e
  }
  get superrootParams() {
    var e;
    return new pn((e = i(this, O))[9] ?? (e[9] = []))
  }
  set superrootParams(e) {
    i(this, O)[9] = e != null ? (e instanceof pn ? e : new pn(e)).toArray() : []
  }
  get productSpecialCaseOptions() {
    var e;
    return new yn((e = i(this, O))[10] ?? (e[10] = []))
  }
  set productSpecialCaseOptions(e) {
    i(this, O)[10] = e != null ? (e instanceof yn ? e : new yn(e)).toArray() : []
  }
  get experimentalOptions() {
    var e;
    return new mn((e = i(this, O))[11] ?? (e[11] = []))
  }
  set experimentalOptions(e) {
    i(this, O)[11] = e != null ? (e instanceof mn ? e : new mn(e)).toArray() : []
  }
  toArray() {
    return i(this, O)
  }
  toObject() {
    return {
      client: this.client,
      source: this.source,
      clientId: this.clientId,
      cacheBehavior: this.cacheBehavior,
      language: this.language,
      gpsDebugLevel: this.gpsDebugLevel,
      httpResponseFormat: this.httpResponseFormat,
      inlineExtraDataSpec: this.inlineExtraDataSpec,
      queryOrigin: this.queryOrigin,
      superrootParams: this.superrootParams.toObject(),
      productSpecialCaseOptions: this.productSpecialCaseOptions.toObject(),
      experimentalOptions: this.experimentalOptions.toObject()
    }
  }
  serialize(e) {
    i(this, O).length !== 0 && (i(this, O)[0] != null && e.writeString(1, this.client),
      i(this, O)[1] != null && e.writeEnum(2, this.source),
      i(this, O)[2] != null && e.writeInt32(3, this.clientId),
      i(this, O)[3] != null && e.writeEnum(4, this.cacheBehavior),
      i(this, O)[4] != null && e.writeString(5, this.language),
      i(this, O)[5] != null && e.writeEnum(6, this.gpsDebugLevel),
      i(this, O)[6] != null && e.writeEnum(7, this.httpResponseFormat),
      i(this, O)[7] != null && e.writeBool(8, this.inlineExtraDataSpec),
      i(this, O)[8] != null && e.writeString(9, this.queryOrigin),
      i(this, O)[9] != null && e.writeMessage(10, this.superrootParams, s => s.serialize(e)),
      i(this, O)[10] != null && e.writeMessage(11, this.productSpecialCaseOptions, s => s.serialize(e)),
      i(this, O)[11] != null && e.writeMessage(12, this.experimentalOptions, s => s.serialize(e)))
  }
}
  ,
  O = new WeakMap,
  Ll);
function lg(t, e) {
  t[0] != null && t[0] != "" && e.push(`1s${De(t[0])}`),
    t[1] != null && t[1] != 0 && e.push(`2e${t[1]}`),
    t[2] != null && t[2] != 0 && e.push(`3i${t[2]}`),
    t[3] != null && t[3] != 0 && e.push(`4e${t[3]}`),
    t[4] != null && t[4] != "" && e.push(`5s${De(t[4])}`),
    t[5] != null && t[5] != 0 && e.push(`6e${t[5]}`),
    t[6] != null && t[6] != 0 && e.push(`7e${t[6]}`),
    t[7] && e.push("8b1"),
    t[8] != null && t[8] != "" && e.push(`9s${De(t[8])}`),
    t[9] != null && lt(10, ng, t[9], e),
    t[10] != null && lt(11, og, t[10], e),
    t[11] != null && lt(12, ag, t[11], e)
}
var Tt, Pl, Me = (Pl = class {
  constructor(e) {
    p(this, Tt, []);
    Array.isArray(e) ? g(this, Tt, e) : e && Object.assign(this, e)
  }
  get lat() {
    return i(this, Tt)[2] ?? 0
  }
  set lat(e) {
    i(this, Tt)[2] = e
  }
  get lng() {
    return i(this, Tt)[3] ?? 0
  }
  set lng(e) {
    i(this, Tt)[3] = e
  }
  toArray() {
    return i(this, Tt)
  }
  toObject() {
    return {
      lat: this.lat,
      lng: this.lng
    }
  }
  serialize(e) {
    i(this, Tt).length !== 0 && (i(this, Tt)[2] != null && e.writeDouble(3, this.lat),
      i(this, Tt)[3] != null && e.writeDouble(4, this.lng))
  }
}
  ,
  Tt = new WeakMap,
  Pl), jt, Tl, wn = (Tl = class {
    constructor(e) {
      p(this, jt, []);
      Array.isArray(e) ? g(this, jt, e) : e && Object.assign(this, e)
    }
    get type() {
      return i(this, jt)[0] ?? 0
    }
    set type(e) {
      i(this, jt)[0] = e
    }
    get id() {
      return i(this, jt)[1] ?? ""
    }
    set id(e) {
      i(this, jt)[1] = e
    }
    toArray() {
      return i(this, jt)
    }
    toObject() {
      return {
        type: this.type,
        id: this.id
      }
    }
    serialize(e) {
      i(this, jt).length !== 0 && (i(this, jt)[0] != null && e.writeInt32(1, this.type),
        i(this, jt)[1] != null && e.writeString(2, this.id))
    }
  }
    ,
    jt = new WeakMap,
    Tl), ut, jl, vn = (jl = class {
      constructor(e) {
        p(this, ut, []);
        Array.isArray(e) ? g(this, ut, e) : e && Object.assign(this, e)
      }
      get heading() {
        return i(this, ut)[0] ?? 0
      }
      set heading(e) {
        i(this, ut)[0] = e
      }
      get tilt() {
        return i(this, ut)[1] ?? 0
      }
      set tilt(e) {
        i(this, ut)[1] = e
      }
      get roll() {
        return i(this, ut)[2] ?? 0
      }
      set roll(e) {
        i(this, ut)[2] = e
      }
      toArray() {
        return i(this, ut)
      }
      toObject() {
        return {
          heading: this.heading,
          tilt: this.tilt,
          roll: this.roll
        }
      }
      serialize(e) {
        i(this, ut).length !== 0 && (i(this, ut)[0] != null && e.writeDouble(1, this.heading),
          i(this, ut)[1] != null && e.writeDouble(2, this.tilt),
          i(this, ut)[2] != null && e.writeDouble(3, this.roll))
      }
    }
      ,
      ut = new WeakMap,
      jl), Mt, Ml, An = (Ml = class {
        constructor(t) {
          p(this, Mt, []);
          Array.isArray(t) ? g(this, Mt, t) : t && Object.assign(this, t)
        }
        get position() {
          var t;
          return new Me((t = i(this, Mt))[0] ?? (t[0] = []))
        }
        set position(t) {
          i(this, Mt)[0] = t != null ? (t instanceof Me ? t : new Me(t)).toArray() : []
        }
        get pov() {
          var t;
          return new vn((t = i(this, Mt))[1] ?? (t[1] = []))
        }
        set pov(t) {
          i(this, Mt)[1] = t != null ? (t instanceof vn ? t : new vn(t)).toArray() : []
        }
        toArray() {
          return i(this, Mt)
        }
        toObject() {
          return {
            position: this.position.toObject(),
            pov: this.pov.toObject()
          }
        }
        serialize(t) {
          i(this, Mt).length !== 0 && (i(this, Mt)[0] != null && t.writeMessage(1, this.position, e => e.serialize(t)),
            i(this, Mt)[1] != null && t.writeMessage(2, this.pov, e => e.serialize(t)))
        }
      }
        ,
        Mt = new WeakMap,
        Ml), It, Il, On = (Il = class {
          constructor(t) {
            p(this, It, []);
            Array.isArray(t) ? g(this, It, t) : t && Object.assign(this, t)
          }
          get id() {
            var t;
            return new wn((t = i(this, It))[0] ?? (t[0] = []))
          }
          set id(t) {
            i(this, It)[0] = t != null ? (t instanceof wn ? t : new wn(t)).toArray() : []
          }
          get viewpoint() {
            var t;
            return new An((t = i(this, It))[2] ?? (t[2] = []))
          }
          set viewpoint(t) {
            i(this, It)[2] = t != null ? (t instanceof An ? t : new An(t)).toArray() : []
          }
          toArray() {
            return i(this, It)
          }
          toObject() {
            return {
              id: this.id.toObject(),
              viewpoint: this.viewpoint.toObject()
            }
          }
          serialize(t) {
            i(this, It).length !== 0 && (i(this, It)[0] != null && t.writeMessage(1, this.id, e => e.serialize(t)),
              i(this, It)[2] != null && t.writeMessage(3, this.viewpoint, e => e.serialize(t)))
          }
        }
          ,
          It = new WeakMap,
          Il), Ft, Fl, xn = (Fl = class {
            constructor(t) {
              p(this, Ft, []);
              Array.isArray(t) ? g(this, Ft, t) : t && Object.assign(this, t)
            }
            get pano() {
              var t;
              return new On((t = i(this, Ft))[0] ?? (t[0] = []))
            }
            set pano(t) {
              i(this, Ft)[0] = t != null ? (t instanceof On ? t : new On(t)).toArray() : []
            }
            get links() {
              return i(this, Ft)[1] ?? 0
            }
            set links(t) {
              i(this, Ft)[1] = (t ?? []).map(e => e)
            }
            toArray() {
              return i(this, Ft)
            }
            toObject() {
              return {
                pano: this.pano.toObject(),
                links: this.links
              }
            }
            serialize(t) {
              i(this, Ft).length !== 0 && (i(this, Ft)[0] != null && t.writeMessage(1, this.pano, e => e.serialize(t)),
                i(this, Ft)[1] != null && t.writeRepeatedInt32(2, this.links))
            }
          }
            ,
            Ft = new WeakMap,
            Fl), Rt, Rl, Sn = (Rl = class {
              constructor(t) {
                p(this, Rt, []);
                Array.isArray(t) ? g(this, Rt, t) : t && Object.assign(this, t)
              }
              get status() {
                return i(this, Rt)[0] ?? 0
              }
              set status(t) {
                i(this, Rt)[0] = t
              }
              get panoramas() {
                var t;
                return ((t = i(this, Rt))[1] ?? (t[1] = [])).map(e => new xn(e))
              }
              set panoramas(t) {
                i(this, Rt)[1] = (t ?? []).map(e => (e instanceof xn ? e : new xn(e)).toArray())
              }
              toArray() {
                return i(this, Rt)
              }
              toObject() {
                return {
                  status: this.status,
                  panoramas: (this.panoramas ?? []).map(t => t.toObject())
                }
              }
              serialize(t) {
                i(this, Rt).length !== 0 && (i(this, Rt)[0] != null && t.writeInt32(1, this.status),
                  i(this, Rt)[1] != null && t.writeRepeatedMessage(2, this.panoramas, e => e.serialize(t)))
              }
            }
              ,
              Rt = new WeakMap,
              Rl), Ut, Ul, _n = (Ul = class {
                constructor(t) {
                  p(this, Ut, []);
                  Array.isArray(t) ? g(this, Ut, t) : t && Object.assign(this, t)
                }
                get a() {
                  var t;
                  return new Me((t = i(this, Ut))[2] ?? (t[2] = []))
                }
                set a(t) {
                  i(this, Ut)[2] = t != null ? (t instanceof Me ? t : new Me(t)).toArray() : []
                }
                get b() {
                  var t;
                  return new Me((t = i(this, Ut))[3] ?? (t[3] = []))
                }
                set b(t) {
                  i(this, Ut)[3] = t != null ? (t instanceof Me ? t : new Me(t)).toArray() : []
                }
                toArray() {
                  return i(this, Ut)
                }
                toObject() {
                  return {
                    a: this.a.toObject(),
                    b: this.b.toObject()
                  }
                }
                serialize(t) {
                  i(this, Ut).length !== 0 && (i(this, Ut)[2] != null && t.writeMessage(3, this.a, e => e.serialize(t)),
                    i(this, Ut)[3] != null && t.writeMessage(4, this.b, e => e.serialize(t)))
                }
              }
                ,
                Ut = new WeakMap,
                Ul), Bt, Bl, En = (Bl = class {
                  constructor(t) {
                    p(this, Bt, []);
                    Array.isArray(t) ? g(this, Bt, t) : t && Object.assign(this, t)
                  }
                  get unknownId() {
                    return i(this, Bt)[0] ?? ""
                  }
                  set unknownId(t) {
                    i(this, Bt)[0] = t
                  }
                  get latLng() {
                    var t;
                    return new _n((t = i(this, Bt))[1] ?? (t[1] = []))
                  }
                  set latLng(t) {
                    i(this, Bt)[1] = t != null ? (t instanceof _n ? t : new _n(t)).toArray() : []
                  }
                  toArray() {
                    return i(this, Bt)
                  }
                  toObject() {
                    return {
                      unknownId: this.unknownId,
                      latLng: this.latLng.toObject()
                    }
                  }
                  serialize(t) {
                    i(this, Bt).length !== 0 && (i(this, Bt)[0] != null && t.writeString(1, this.unknownId),
                      i(this, Bt)[1] != null && t.writeMessage(2, this.latLng, e => e.serialize(t)))
                  }
                }
                  ,
                  Bt = new WeakMap,
                  Bl), dt, Nl, kn = (Nl = class {
                    constructor(t) {
                      p(this, dt, []);
                      Array.isArray(t) ? g(this, dt, t) : t && Object.assign(this, t)
                    }
                    get x() {
                      return i(this, dt)[0] ?? 0
                    }
                    set x(t) {
                      i(this, dt)[0] = t
                    }
                    get y() {
                      return i(this, dt)[1] ?? 0
                    }
                    set y(t) {
                      i(this, dt)[1] = t
                    }
                    get zoom() {
                      return i(this, dt)[2] ?? 0
                    }
                    set zoom(t) {
                      i(this, dt)[2] = t
                    }
                    toArray() {
                      return i(this, dt)
                    }
                    toObject() {
                      return {
                        x: this.x,
                        y: this.y,
                        zoom: this.zoom
                      }
                    }
                    serialize(t) {
                      i(this, dt).length !== 0 && (i(this, dt)[0] != null && t.writeInt32(1, this.x),
                        i(this, dt)[1] != null && t.writeInt32(2, this.y),
                        i(this, dt)[2] != null && t.writeInt32(3, this.zoom))
                    }
                  }
                    ,
                    dt = new WeakMap,
                    Nl);
function hg(t, e) {
  t[0] != null && t[0] != 0 && e.push(`1i${t[0]}`),
    t[1] != null && t[1] != 0 && e.push(`2i${t[1]}`),
    t[2] != null && t[2] != 0 && e.push(`3i${t[2]}`)
}
var Nt, Vl, cg = (Vl = class {
  constructor(t) {
    p(this, Nt, []);
    Array.isArray(t) ? g(this, Nt, t) : t && Object.assign(this, t)
  }
  get context() {
    var t;
    return new bn((t = i(this, Nt))[0] ?? (t[0] = []))
  }
  set context(t) {
    i(this, Nt)[0] = t != null ? (t instanceof bn ? t : new bn(t)).toArray() : []
  }
  get tile() {
    var t;
    return new kn((t = i(this, Nt))[5] ?? (t[5] = []))
  }
  set tile(t) {
    i(this, Nt)[5] = t != null ? (t instanceof kn ? t : new kn(t)).toArray() : []
  }
  toArray() {
    return i(this, Nt)
  }
  toObject() {
    return {
      context: this.context.toObject(),
      tile: this.tile.toObject()
    }
  }
  serialize(t) {
    i(this, Nt).length !== 0 && (i(this, Nt)[0] != null && t.writeMessage(1, this.context, e => e.serialize(t)),
      i(this, Nt)[5] != null && t.writeMessage(6, this.tile, e => e.serialize(t)))
  }
}
  ,
  Nt = new WeakMap,
  Vl);
function ug(t, e) {
  t[0] != null && lt(1, lg, t[0], e),
    t[5] != null && lt(6, hg, t[5], e)
}
function dg(t) {
  return Hr(ug, t.toArray())
}
var ft, ql, fg = (ql = class {
  constructor(t) {
    p(this, ft, []);
    Array.isArray(t) ? g(this, ft, t) : t && Object.assign(this, t)
  }
  get status() {
    return i(this, ft)[0] ?? 0
  }
  set status(t) {
    i(this, ft)[0] = t
  }
  get panoramas() {
    var t;
    return new Sn((t = i(this, ft))[1] ?? (t[1] = []))
  }
  set panoramas(t) {
    i(this, ft)[1] = t != null ? (t instanceof Sn ? t : new Sn(t)).toArray() : []
  }
  get unknown() {
    var t;
    return ((t = i(this, ft))[2] ?? (t[2] = [])).map(e => new En(e))
  }
  set unknown(t) {
    i(this, ft)[2] = (t ?? []).map(e => (e instanceof En ? e : new En(e)).toArray())
  }
  toArray() {
    return i(this, ft)
  }
  toObject() {
    return {
      status: this.status,
      panoramas: this.panoramas.toObject(),
      unknown: (this.unknown ?? []).map(t => t.toObject())
    }
  }
  serialize(t) {
    i(this, ft).length !== 0 && (i(this, ft)[0] != null && t.writeInt32(1, this.status),
      i(this, ft)[1] != null && t.writeMessage(2, this.panoramas, e => e.serialize(t)),
      i(this, ft)[2] != null && t.writeRepeatedMessage(3, this.unknown, e => e.serialize(t)))
  }
}
  ,
  ft = new WeakMap,
  ql), H, Hl, zn = (Hl = class {
    constructor(e) {
      p(this, H, []);
      Array.isArray(e) ? g(this, H, e) : e && Object.assign(this, e)
    }
    get frontend() {
      return i(this, H)[0] ?? 0
    }
    set frontend(e) {
      i(this, H)[0] = e
    }
    get tiled() {
      return i(this, H)[1] ?? !1
    }
    set tiled(e) {
      i(this, H)[1] = e
    }
    get imageFormat() {
      return i(this, H)[2] ?? 0
    }
    set imageFormat(e) {
      i(this, H)[2] = e
    }
    get tourFormat() {
      return i(this, H)[3] ?? 0
    }
    set tourFormat(e) {
      i(this, H)[3] = e
    }
    toArray() {
      return i(this, H)
    }
    toObject() {
      return {
        frontend: this.frontend,
        tiled: this.tiled,
        imageFormat: this.imageFormat,
        tourFormat: this.tourFormat
      }
    }
    serialize(e) {
      i(this, H).length !== 0 && (i(this, H)[0] != null && e.writeEnum(1, this.frontend),
        i(this, H)[1] != null && e.writeBool(2, this.tiled),
        i(this, H)[2] != null && e.writeEnum(3, this.imageFormat),
        i(this, H)[3] != null && e.writeEnum(4, this.tourFormat))
    }
  }
    ,
    H = new WeakMap,
    Hl);


var ai = Math.pow
  , nt = (t, e, s) => new Promise((r, n) => {
    var o = h => {
      try {
        l(s.next(h))
      } catch (u) {
        n(u)
      }
    }
      , a = h => {
        try {
          l(s.throw(h))
        } catch (u) {
          n(u)
        }
      }
      , l = h => h.done ? r(h.value) : Promise.resolve(h.value).then(o, a);
    l((s = s.apply(t, e)).next())
  }
  )
  , $t = Uint8Array
  , Xi = Uint16Array
  , Wp = Int32Array
  , Ou = new $t([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0])
  , xu = new $t([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0])
  , Gp = new $t([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
  , Su = function (t, e) {
    for (var s = new Xi(31), r = 0; r < 31; ++r)
      s[r] = e += 1 << t[r - 1];
    for (var n = new Wp(s[30]), r = 1; r < 30; ++r)
      for (var o = s[r]; o < s[r + 1]; ++o)
        n[o] = o - s[r] << 5 | r;
    return {
      b: s,
      r: n
    }
  }
  , _u = Su(Ou, 2)
  , Eu = _u.b
  , Yp = _u.r;
Eu[28] = 258,
  Yp[258] = 28;

export { cg as StreetViewRequest, fg as StreetViewResponse, zn as TileParameters, dg as encodeStreetViewRequest };