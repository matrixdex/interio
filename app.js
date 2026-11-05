/* Interio Kreativ — single-file SPA (vanilla JS + three.js r152 classic build)
 * Sections: 1 utils/icons · 2 textures & materials · 3 catalog (dummy 3D objects) · 4 rooms & templates
 *           5 scene/camera · 6 items & interaction · 7 UI (panel, popovers, wizard) · 8 hub & routing
 */
(function () {
'use strict';
const THREE = window.THREE;

/* ═══════════════ 1 · utils & icons ═══════════════ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k.startsWith('aria-')) { if (v != null) e.setAttribute(k, String(v)); }
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const uid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const money = n => Math.round(n).toLocaleString('en-IN');
const priceHTML = n => `<small>Rs.</small>${money(n)}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hexRGB = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgbHex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
const shade = (hex, f) => { const [r, g, b] = hexRGB(hex); return f >= 0 ? rgbHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgbHex(r * (1 + f), g * (1 + f), b * (1 + f)); };
const store = {
  get(k, d) { try { const v = localStorage.getItem('interio.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('interio.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};

const IC = {
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bag: '<path d="M5 9h14l-1.2 10H6.2L5 9zM9 9V7a3 3 0 016 0v2"/>',
  bagplus: '<path d="M5 9h14l-1.2 10H6.2L5 9zM9 9V7a3 3 0 016 0v2M12 12v4M10 14h4"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
  save: '<path d="M5 4h11l3 3v13H5V4z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  sidebar: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 5v14"/>',
  rotate: '<path d="M5 12a7 7 0 0112-5l2 2M19 12a7 7 0 01-12 5l-2-2M19 5v4h-4M5 19v-4h4"/>',
  swap: '<path d="M6 8h12l-3-3M18 16H6l3 3"/>',
  goes: '<rect x="5" y="4" width="8" height="16" rx="1"/><path d="M16 9h3M16 14h3M17.5 7.5v3M17.5 12.5v3"/>',
  copy: '<rect x="9" y="9" width="10" height="10" rx="1"/><path d="M15 9V6a1 1 0 00-1-1H6a1 1 0 00-1 1v8a1 1 0 001 1h3"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"/>',
  dollhouse: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
  top: '<rect x="4" y="5" width="16" height="14"/><path d="M4 11h7v8"/>',
  sides: '<rect x="4" y="6" width="16" height="12"/><path d="M4 10h16M8 10v8"/>',
  palette: '<path d="M5 15l7-10 7 10-7 5z"/><circle cx="12" cy="14" r="1.2"/>',
  ruler: '<path d="M4 16L16 4l4 4L8 20z"/><path d="M8 12l2 2M11 9l2 2M14 6l2 2"/>',
  edit: '<path d="M5 5h4M15 5h4M5 19h4M15 19h4M5 5v4M19 5v4M5 15v4M19 15v4"/><circle cx="12" cy="12" r="2"/>',
  chev: '<path d="M7 10l5 5 5-5"/>', chevr: '<path d="M10 7l5 5-5 5"/>', chevl: '<path d="M14 7l-5 5 5 5"/>',
  undo: '<path d="M9 7L5 11l4 4"/><path d="M5 11h8a5 5 0 010 10h-3"/>', redo: '<path d="M15 7l4 4-4 4"/><path d="M19 11h-8a5 5 0 000 10h3"/>',
  check: '<path d="M5 12l5 5 9-10"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
  warn: '<path d="M12 4l9 16H3L12 4zM12 10v4M12 17v.5"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>', list: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>'
};
const ico = (n, s = 22) => `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const hydrateIcons = (root = document) => $$('[data-ico]', root).forEach(e => { if (!e.firstChild) e.innerHTML = ico(e.dataset.ico, e.classList.contains('mini') ? 16 : 22); });

/* ═══════════════ 2 · procedural textures & materials ═══════════════ */
function canvasTex(size, draw, seed) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, size, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function noise(g, s, amt, r) {
  const d = g.getImageData(0, 0, s, s), a = d.data;
  for (let i = 0; i < a.length; i += 4) { const n = (r() - .5) * amt; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
  g.putImageData(d, 0, 0);
}
function grain(g, s, r, n, aMax) {
  for (let k = 0; k < n; k++) {
    const yy = r() * s;
    g.strokeStyle = r() < .5 ? `rgba(0,0,0,${.03 + r() * aMax})` : `rgba(255,255,255,${.03 + r() * aMax * .8})`;
    g.lineWidth = .6 + r() * 1.2; g.beginPath(); g.moveTo(0, yy);
    g.bezierCurveTo(s * .3, yy + (r() - .5) * 6, s * .65, yy + (r() - .5) * 6, s, yy + (r() - .5) * 4); g.stroke();
  }
}
const TK = {
  plain(g, s, c) { g.fillStyle = c; g.fillRect(0, 0, s, s); },
  plank(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s); const n = 8, ph = s / n;
    for (let i = 0; i < n; i++) {
      const y = i * ph; g.fillStyle = shade(c, (r() - .5) * .18); g.fillRect(0, y, s, ph);
      g.save(); g.beginPath(); g.rect(0, y, s, ph); g.clip(); grain(g, s, r, 0, 0); g.restore();
      for (let k = 0; k < 22; k++) { const yy = y + r() * ph; g.strokeStyle = r() < .5 ? `rgba(0,0,0,${.04 + r() * .08})` : `rgba(255,255,255,${.04 + r() * .07})`; g.lineWidth = .6 + r(); g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(s * .3, yy + (r() - .5) * 4, s * .6, yy + (r() - .5) * 4, s, yy + (r() - .5) * 3); g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,.38)'; g.fillRect(0, y, s, 1.6); g.fillRect(r() * s, y, 1.6, ph);
    }
  },
  wood(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s); grain(g, s, r, 70, .09);
    for (let k = 0; k < 2; k++) { const x = r() * s, y = r() * s; const gr = g.createRadialGradient(x, y, 1, x, y, 14 + r() * 10); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 30, y - 30, 60, 60); }
  },
  herring(g, s, c, c2, r) {
    g.fillStyle = shade(c, -.25); g.fillRect(0, 0, s, s); const L = s / 4, W = s / 16;
    for (let y = -L; y < s + L; y += W) for (let x = -L; x < s + L; x += L) {
      const k = ((y / W) | 0) & 1;
      g.fillStyle = shade(c, (r() - .5) * .2); const bx = x + (k ? L / 2 : 0);
      g.fillRect(bx + 1, y + 1, L - 2, W - 1); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(bx + 1, y + W / 2, L - 2, 1);
    }
  },
  fabric(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 4) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(i, 0, 2, s); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, i, s, 2); }
    noise(g, s, 14, r);
  },
  linen(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 260; k++) { g.strokeStyle = r() < .5 ? `rgba(0,0,0,${.04 + r() * .08})` : `rgba(255,255,255,${.06 + r() * .1})`; g.lineWidth = 1; const x = r() * s, y = r() * s, l = 8 + r() * 26; g.beginPath(); if (r() < .5) { g.moveTo(x, y); g.lineTo(x + l, y); } else { g.moveTo(x, y); g.lineTo(x, y + l); } g.stroke(); }
    noise(g, s, 10, r);
  },
  velvet(g, s, c, c2, r) {
    const gr = g.createLinearGradient(0, 0, s, s); gr.addColorStop(0, shade(c, .1)); gr.addColorStop(.5, c); gr.addColorStop(1, shade(c, -.12));
    g.fillStyle = gr; g.fillRect(0, 0, s, s); noise(g, s, 26, r);
  },
  leather(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${r() * .12})`; g.beginPath(); g.arc(r() * s, r() * s, .6 + r() * 1.6, 0, 6.3); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 30; k++) { g.beginPath(); g.moveTo(r() * s, r() * s); g.lineTo(r() * s, r() * s); g.stroke(); }
    noise(g, s, 8, r);
  },
  metal(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .18})` : `rgba(0,0,0,${r() * .15})`; g.fillRect(0, y, s, 1.5); }
  },
  marble(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 7; k++) { g.strokeStyle = `rgba(80,85,95,${.15 + r() * .25})`; g.lineWidth = .6 + r() * 1.8; g.beginPath(); let x = r() * s, y = 0; g.moveTo(x, y); for (let i = 0; i < 8; i++) { x += (r() - .5) * 60; y += s / 8; g.lineTo(x, y); } g.stroke(); }
    noise(g, s, 6, r);
  },
  laminate(g, s, c, c2, r) { g.fillStyle = c; g.fillRect(0, 0, s, s); noise(g, s, 7, r); },
  rattan(g, s, c, c2, r) {
    g.fillStyle = shade(c, -.35); g.fillRect(0, 0, s, s); const n = 16, w = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = shade(c, ((i + j) & 1 ? .08 : -.08) + (r() - .5) * .1); if ((i + j) & 1) g.fillRect(i * w + 1, j * w + 2, w - 2, w - 4); else g.fillRect(i * w + 2, j * w + 1, w - 4, w - 2); }
  },
  plaid(g, s, c, c2) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    g.fillStyle = c2; g.globalAlpha = .55; for (const p of [.12, .5, .78]) { g.fillRect(p * s, 0, s * .08, s); g.fillRect(0, p * s, s, s * .08); }
    g.globalAlpha = .25; g.fillStyle = '#000'; g.fillRect(s * .3, 0, 3, s); g.fillRect(0, s * .3, s, 3); g.globalAlpha = 1;
  },
  stripe(g, s, c, c2) { g.fillStyle = c; g.fillRect(0, 0, s, s); g.fillStyle = c2; const n = 8; for (let i = 0; i < n; i += 2) g.fillRect(i * s / n, 0, s / n, s); },
  tile(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = shade(c, (r() - .5) * .08); g.fillRect(i * s / 2 + 2, j * s / 2 + 2, s / 2 - 4, s / 2 - 4); }
    g.fillStyle = c2 || '#8a8a8a'; g.fillRect(0, 0, s, 3); g.fillRect(0, s / 2 - 1, s, 3); g.fillRect(0, 0, 3, s); g.fillRect(s / 2 - 1, 0, 3, s);
  },
  checker(g, s, c, c2) { const n = 4, w = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) & 1 ? c2 : c; g.fillRect(i * w, j * w, w, w); } },
  carpet(g, s, c, c2, r) { g.fillStyle = c; g.fillRect(0, 0, s, s); noise(g, s, 38, r); for (let k = 0; k < 2200; k++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; g.fillRect(r() * s, r() * s, 1.5, 1.5); } },
  concrete(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 40; k++) { const x = r() * s, y = r() * s, rr = 14 + r() * 40; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, r() < .5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    noise(g, s, 12, r);
  },
  leaf(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 90; k++) { g.fillStyle = shade(c, (r() - .5) * .5); g.beginPath(); g.ellipse(r() * s, r() * s, 6 + r() * 14, 3 + r() * 6, r() * 3, 0, 6.3); g.fill(); }
  }
};
const SURF = { // roughness / metalness per texture kind
  plank: [.55, 0], wood: [.62, 0], herring: [.55, 0], fabric: [.96, 0], linen: [.95, 0], velvet: [.9, 0], leather: [.5, 0],
  metal: [.35, .75], marble: [.2, 0], laminate: [.45, 0], rattan: [.8, 0], plaid: [.96, 0], stripe: [.96, 0],
  tile: [.3, 0], checker: [.3, 0], carpet: [1, 0], concrete: [.85, 0], leaf: [.8, 0], plain: [.8, 0]
};
const texCache = new Map(), matCache = new Map();
function getTex(kind, c, c2) {
  const key = `${kind}|${c}|${c2 || ''}`;
  if (!texCache.has(key)) texCache.set(key, canvasTex(256, (g, s, r) => (TK[kind] || TK.plain)(g, s, c, c2, r), key.length * 977 + c.charCodeAt(1) * 31 + c.charCodeAt(3)));
  return texCache.get(key);
}
function mat(kind, c, c2, extra) {
  const key = `${kind}|${c}|${c2 || ''}|${extra ? JSON.stringify(extra) : ''}`;
  if (!matCache.has(key)) {
    const [rough, met] = SURF[kind] || SURF.plain;
    matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ map: getTex(kind, c, c2), roughness: rough, metalness: met }, extra || {})));
  }
  return matCache.get(key);
}
const flat = (c, extra) => { const key = 'flat|' + c + JSON.stringify(extra || {}); if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85 }, extra || {}))); return matCache.get(key); };
const glassMat = new THREE.MeshStandardMaterial({ color: '#cfe6f2', roughness: .05, metalness: .1, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false });

/* ── geometry helpers ── */
function scaleUV(g, w, h, d, t = .6) {
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / t, uv.getY(k) * dims[f][1] / t); }
  uv.needsUpdate = true;
}
function shadow(o, cast = true) { o.castShadow = cast; o.receiveShadow = true; return o; }
const bx = (w, hh, d, m, x = 0, y = 0, z = 0) => { const g = new THREE.BoxGeometry(w, hh, d); scaleUV(g, w, hh, d); const o = shadow(new THREE.Mesh(g, m)); o.position.set(x, y + hh / 2, z); return o; };
function rbx(w, hh, d, r, m, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, hh, d, 4, 4, 4); const p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  r = Math.min(r, w / 2 - .001, hh / 2 - .001, d / 2 - .001); const hx = w / 2 - r, hy = hh / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz)); v.sub(c);
    if (v.lengthSq() > 1e-10) v.normalize().multiplyScalar(r); p.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z);
  }
  g.computeVertexNormals(); scaleUV(g, w, hh, d);
  const o = shadow(new THREE.Mesh(g, m)); o.position.set(x, y + hh / 2, z); return o;
}
const cyl = (rt, rb, hh, m, x = 0, y = 0, z = 0, seg = 24) => { const o = shadow(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, seg), m)); o.position.set(x, y + hh / 2, z); return o; };
const sph = (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o; };

/* ═══════════════ 3 · catalog — dummy 3D objects with different textures ═══════════════ */
/* Local coords: x = width, y = up, z = depth. +z is the FRONT of the object, -z its back. */
const CATS = {
  living: { label: 'Living room', color: '#6d8f7a', cats: ['Sofas', 'Armchairs', 'Tables', 'Storage', 'Rugs', 'Lighting & decor'] },
  bedroom: { label: 'Bedroom', color: '#7a86a8', cats: ['Beds', 'Wardrobes', 'Chest of drawers', 'Nightstands', 'Rugs', 'Lighting & decor'] },
  kids: { label: "Children's room", color: '#d49a4a', cats: ['Kids beds', 'Kids desks & chairs', 'Storage', 'Rugs'] },
  dining: { label: 'Dining room', color: '#a8735a', cats: ['Dining tables', 'Chairs & benches', 'Storage', 'Rugs'] },
  hallway: { label: 'Hallway', color: '#7f7f7f', cats: ['Shoe storage', 'Benches', 'Mirrors & hooks', 'Lighting & decor'] }
};
const ROOM_ORDER = ['living', 'bedroom', 'kids', 'dining', 'hallway'];
const PRODUCTS = [];
const PMAP = {};
function product(def) { def.variants.forEach((v, i) => v.i = i); PRODUCTS.push(def); PMAP[def.id] = def; }
const P = id => PMAP[id];
const Mv = (variant) => (key) => { const m = variant.m[key]; if (!m) throw new Error('no material ' + key); return m[0] === 'flat' ? flat(m[1], m[2]) : mat(m[0], m[1], m[2]); };

/* — bedroom — */
const BED_SIZES = { f: 'Size 160×200 cm' };
function bedBuilder(opt = {}) {
  return (M, W, D, H) => {
    const g = new THREE.Group(), fr = M('fab'), lg = M('leg');
    g.add(rbx(W, .26, D, .03, fr, 0, .14, 0));
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.032, .024, .14, lg, a * (W / 2 - .08), 0, b * (D / 2 - .08)));
    if (opt.slats) { const n = 9, sw = (W - .06) / n; for (let i = 0; i < n; i++) g.add(bx(sw * .6, H - .25, .04, fr, -W / 2 + .06 + sw * (i + .5), .25, -D / 2 + .05)); g.add(bx(W, .06, .08, fr, 0, H - .06, -D / 2 + .05)); }
    else g.add(rbx(W, H - .3, .1, .04, fr, 0, .3, -D / 2 + .05));
    if (opt.storage) for (let i = 0; i < 2; i++) g.add(bx(W * .42, .12, .02, M('leg'), (i ? 1 : -1) * W * .25, .2, D / 2 + .005));
    if (opt.rail) { g.add(bx(.03, .22, D - .2, fr, W / 2 - .02, .38, 0)); g.add(bx(.03, .22, D - .2, fr, -W / 2 + .02, .38, 0)); }
    const mh = opt.thin ? .16 : .24;
    g.add(rbx(W - .06, mh, D - .14, .06, M('bed'), 0, .40, .03));
    g.add(rbx(W - .02, .07, D * .62, .03, M('duv'), 0, .40 + mh - .02, D * .17));
    const pw = opt.single ? W * .6 : W * .4;
    for (const s of opt.single ? [0] : [-1, 1]) g.add(rbx(pw, .14, .42, .06, M('pil'), s * W * .24, .40 + mh, -D / 2 + .4));
    return g;
  };
}
const bedVariants = (kinds) => kinds.map(([n, sw, fab, bed, duv, pil, leg]) => ({ n, sw, m: { fab, bed, duv, pil, leg } }));
product({
  id: 'badda', name: 'BÄDDA', type: 'Upholstered bed frame', cat: 'Beds', rooms: ['bedroom'], w: 160, d: 200, h: 100, price: 11990, rating: 4, reviews: 601, size: '160×200 cm',
  goes: ['natta', 'skapa', 'lada', 'matta-plaid'], build: bedBuilder(),
  variants: bedVariants([
    ['Vissle dark grey', '#4a4d52', ['velvet', '#4a4d52'], ['linen', '#f1efea'], ['linen', '#e9e6df'], ['velvet', '#3c3d41'], ['metal', '#222222']],
    ['Linen beige', '#c9b79c', ['linen', '#c9b79c'], ['linen', '#f4f1ea'], ['plaid', '#e6dccb', '#b69f7f'], ['linen', '#e8dfd0'], ['wood', '#6b4a32']],
    ['Brown leather', '#6d4a34', ['leather', '#6d4a34'], ['linen', '#eceae4'], ['stripe', '#d8d3c8', '#aab6bd'], ['velvet', '#8fa3ad'], ['metal', '#1f1f1f']]
  ])
});
product({
  id: 'sovna', name: 'SÖVNA', type: 'Bed frame with storage', cat: 'Beds', rooms: ['bedroom'], w: 180, d: 205, h: 95, price: 19990, rating: 4, reviews: 233, size: '180×200 cm',
  goes: ['natta', 'skapa', 'lada'], build: bedBuilder({ slats: true, storage: true }),
  variants: bedVariants([
    ['Oak effect', '#c19a64', ['wood', '#c19a64'], ['linen', '#f3f1ec'], ['stripe', '#e8e4da', '#9db0a6'], ['linen', '#efe9dc'], ['wood', '#a97f4d']],
    ['White stained', '#efe9df', ['laminate', '#efe9df'], ['linen', '#f6f4ef'], ['linen', '#d6dde2'], ['linen', '#ffffff'], ['wood', '#cdb79b']],
    ['Walnut', '#5a3a28', ['wood', '#5a3a28'], ['linen', '#f1efea'], ['plaid', '#e8e3d9', '#7b4a3a'], ['linen', '#e1d8c8'], ['metal', '#1d1d1d']]
  ])
});
product({
  id: 'barna', name: 'BARNA', type: 'Kids bed frame with rail', cat: 'Kids beds', rooms: ['kids', 'bedroom'], w: 95, d: 205, h: 70, price: 8490, rating: 5, reviews: 87, size: '90×200 cm',
  goes: ['kidsdesk', 'leksak', 'matta-stripe'], build: bedBuilder({ rail: true, single: true, thin: true }),
  variants: bedVariants([
    ['Sky blue', '#6fa6cf', ['laminate', '#6fa6cf'], ['linen', '#f5f3ee'], ['stripe', '#f5d36a', '#f4efe0'], ['linen', '#ffffff'], ['wood', '#d8c4a3']],
    ['Sunny yellow', '#e9bb4a', ['laminate', '#e9bb4a'], ['linen', '#f5f3ee'], ['plaid', '#cfe0d4', '#6fa6a0'], ['linen', '#ffffff'], ['wood', '#d8c4a3']],
    ['Birch', '#d9c19a', ['wood', '#d9c19a'], ['linen', '#f5f3ee'], ['fabric', '#e5b3b3'], ['linen', '#ffffff'], ['wood', '#b79c74']]
  ])
});
function wardrobeBuilder(n, mirror) {
  return (M, W, D, H) => {
    const g = new THREE.Group(), body = M('body'), door = M('door'), hd = M('metal');
    g.add(bx(W, H - .08, D, body, 0, .08, 0)); g.add(bx(W - .04, .08, D - .06, M('dark'), 0, 0, 0));
    const dw = (W - .02) / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + .01 + dw * (i + .5), isM = mirror && i === n - 1;
      g.add(bx(dw - .008, H - .14, .02, isM ? M('mirror') : door, x, .1, D / 2 + .01));
      g.add(bx(.014, .26, .02, hd, x + (i % 2 ? -1 : 1) * (dw / 2 - .05), H * .45, D / 2 + .03));
    }
    return g;
  };
}
const wardVariants = [
  ['White', '#efece6', { body: ['laminate', '#e3e0da'], door: ['laminate', '#f3f1ec'], dark: ['flat', '#8d8a85'], metal: ['metal', '#9d9d9d'], mirror: ['metal', '#cfd6dc'] }],
  ['Walnut', '#6a4430', { body: ['wood', '#5b3b2a'], door: ['wood', '#6a4430'], dark: ['flat', '#2b1c14'], metal: ['metal', '#c3a35b'], mirror: ['metal', '#cfd6dc'] }],
  ['Oak', '#c5a06b', { body: ['wood', '#b48f5b'], door: ['wood', '#c5a06b'], dark: ['flat', '#6b5233'], metal: ['metal', '#444'], mirror: ['metal', '#cfd6dc'] }],
  ['Black-brown', '#3a2f2a', { body: ['laminate', '#2e2622'], door: ['laminate', '#3a2f2a'], dark: ['flat', '#111'], metal: ['metal', '#b0a58f'], mirror: ['metal', '#cfd6dc'] }]
].map(([n, sw, m]) => ({ n, sw, m }));
product({ id: 'skapa', name: 'SKÅPA', type: 'Wardrobe with 3 doors', cat: 'Wardrobes', rooms: ['bedroom'], w: 117, d: 58, h: 201, price: 12990, rating: 4, reviews: 412, size: '117×58×201 cm', goes: ['natta', 'badda'], build: wardrobeBuilder(3, false), variants: wardVariants });
product({ id: 'spegla', name: 'SPEGLA', type: 'Wardrobe with mirror door', cat: 'Wardrobes', rooms: ['bedroom', 'hallway'], w: 100, d: 58, h: 201, price: 14990, rating: 4, reviews: 129, size: '100×58×201 cm', goes: ['natta'], build: wardrobeBuilder(2, true), variants: wardVariants });
function chestBuilder(rows) {
  return (M, W, D, H) => {
    const g = new THREE.Group(), body = M('body'), fr = M('front'), kn = M('knob');
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.025, .018, .1, M('leg'), a * (W / 2 - .06), 0, b * (D / 2 - .06)));
    g.add(bx(W, H - .1, D, body, 0, .1, 0));
    const dh = (H - .16) / rows;
    for (let i = 0; i < rows; i++) {
      g.add(bx(W - .05, dh - .012, .02, fr, 0, .12 + i * dh, D / 2 + .01));
      g.add(cyl(.018, .018, .03, kn, 0, 0, 0, 12).translateY(.12 + i * dh + dh / 2).translateZ(D / 2 + .035).rotateX(Math.PI / 2));
    }
    return g;
  };
}
const chestVars = [
  ['Light beige', '#e0d5bd', { body: ['laminate', '#d9ccb1'], front: ['laminate', '#e0d5bd'], knob: ['metal', '#555'], leg: ['wood', '#8c6c47'] }],
  ['Walnut', '#6a4430', { body: ['wood', '#5b3b2a'], front: ['wood', '#6a4430'], knob: ['metal', '#c3a35b'], leg: ['metal', '#222'] }],
  ['Sage green', '#8fa58a', { body: ['laminate', '#7f967a'], front: ['laminate', '#8fa58a'], knob: ['metal', '#e8e1d0'], leg: ['wood', '#caa874'] }]
].map(([n, sw, m]) => ({ n, sw, m }));
product({ id: 'lada', name: 'LÅDA', type: 'Chest of 3 drawers', cat: 'Chest of drawers', rooms: ['bedroom', 'kids'], w: 76, d: 44, h: 80, price: 7990, rating: 4, reviews: 342, size: '76×44×80 cm', goes: ['natta', 'badda', 'lamp'], build: chestBuilder(3), variants: chestVars });
product({ id: 'lada5', name: 'LÅDA TALL', type: 'Chest of 5 drawers', cat: 'Chest of drawers', rooms: ['bedroom', 'kids'], w: 70, d: 42, h: 120, price: 10990, rating: 5, reviews: 95, size: '70×42×120 cm', goes: ['natta', 'badda'], build: chestBuilder(5), variants: chestVars });
product({
  id: 'natta', name: 'NATTA', type: 'Nightstand with drawer', cat: 'Nightstands', rooms: ['bedroom'], w: 45, d: 40, h: 55, price: 3490, rating: 4, reviews: 1020, size: '45×40×55 cm', goes: ['badda', 'lamp'],
  build: (M, W, D, H) => { const g = new THREE.Group(); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.016, .012, .16, M('leg'), a * (W / 2 - .04), 0, b * (D / 2 - .04))); g.add(bx(W, H - .16, D, M('body'), 0, .16, 0)); g.add(bx(W - .05, (H - .2) / 2 - .01, .02, M('front'), 0, .18, D / 2 + .01)); g.add(bx(W - .05, (H - .2) / 2 - .01, .02, M('front'), 0, .18 + (H - .2) / 2, D / 2 + .01)); g.add(cyl(.016, .016, .03, M('knob'), 0, 0, 0, 12).translateY(H * .76).translateZ(D / 2 + .035).rotateX(Math.PI / 2)); return g; },
  variants: [
    ['Black stained', '#2e2b2a', { body: ['wood', '#2e2b2a'], front: ['wood', '#3b3735'], knob: ['metal', '#c3a35b'], leg: ['metal', '#1c1c1c'] }],
    ['White', '#efece6', { body: ['laminate', '#e8e5de'], front: ['laminate', '#f3f1ec'], knob: ['metal', '#888'], leg: ['wood', '#bba27c'] }],
    ['Teak', '#a9693d', { body: ['wood', '#9a5d36'], front: ['wood', '#a9693d'], knob: ['metal', '#333'], leg: ['wood', '#6a3f22'] }]
  ].map(([n, sw, m]) => ({ n, sw, m }))
});

/* — living / dining — */
function sofaBuilder(seats, arm) {
  return (M, W, D, H) => {
    const g = new THREE.Group(), f = M('fab'), cu = M('cush');
    const aw = arm ? .17 : 0, sw = (W - aw * 2) / seats;
    for (const a of [-1, 1]) g.add(cyl(.025, .02, .1, M('leg'), a * (W / 2 - .1), 0, D / 2 - .1), cyl(.025, .02, .1, M('leg'), a * (W / 2 - .1), 0, -D / 2 + .1));
    g.add(rbx(W, .22, D, .04, f, 0, .1, 0));
    g.add(rbx(W, H - .32, .22, .06, f, 0, .32, -D / 2 + .11));
    if (arm) for (const a of [-1, 1]) g.add(rbx(aw, .3, D, .06, f, a * (W / 2 - aw / 2), .32, 0));
    for (let i = 0; i < seats; i++) {
      const x = -W / 2 + aw + sw * (i + .5);
      g.add(rbx(sw - .015, .16, D - .26, .06, cu, x, .32, .08));
      const b = rbx(sw - .02, .4, .16, .07, cu, x, .44, -D / 2 + .3); b.rotation.x = -.18; g.add(b);
    }
    return g;
  };
}
const sofaVars = [
  ['Grey weave', '#8a8d90', { fab: ['fabric', '#7c8083'], cush: ['fabric', '#8a8d90'], leg: ['wood', '#4a3626'] }],
  ['Mustard velvet', '#c9983a', { fab: ['velvet', '#bd8c2f'], cush: ['velvet', '#c9983a'], leg: ['metal', '#222'] }],
  ['Forest linen', '#5d7a64', { fab: ['linen', '#55715c'], cush: ['linen', '#5d7a64'], leg: ['wood', '#caa874'] }],
  ['Cognac leather', '#9a5a30', { fab: ['leather', '#8b5029'], cush: ['leather', '#9a5a30'], leg: ['metal', '#1c1c1c'] }]
].map(([n, sw, m]) => ({ n, sw, m }));
product({ id: 'soffa3', name: 'SOFFA', type: '3-seater sofa', cat: 'Sofas', rooms: ['living'], w: 220, d: 92, h: 85, price: 34990, rating: 4, reviews: 760, size: '220×92×85 cm', goes: ['kaffe', 'fatol', 'matta-plaid', 'lamp'], build: sofaBuilder(3, true), variants: sofaVars });
product({ id: 'soffa2', name: 'SOFFA MINI', type: '2-seater sofa', cat: 'Sofas', rooms: ['living'], w: 160, d: 88, h: 82, price: 24990, rating: 4, reviews: 410, size: '160×88×82 cm', goes: ['kaffe', 'fatol', 'matta-plaid'], build: sofaBuilder(2, true), variants: sofaVars });
product({ id: 'fatol', name: 'FÅTÖL', type: 'Armchair', cat: 'Armchairs', rooms: ['living', 'bedroom'], w: 82, d: 85, h: 82, price: 14990, rating: 5, reviews: 288, size: '82×85×82 cm', goes: ['soffa3', 'kaffe', 'lamp'], build: sofaBuilder(1, true), variants: sofaVars });
product({
  id: 'kaffe', name: 'KAFFE', type: 'Round coffee table', cat: 'Tables', rooms: ['living'], w: 90, d: 90, h: 42, price: 7490, rating: 4, reviews: 512, size: 'Ø 90 cm', goes: ['soffa3', 'fatol', 'matta-plaid'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(cyl(W / 2, W / 2, .04, M('top'), 0, H - .04)); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, r = W / 2 - .12; g.add(cyl(.022, .016, H - .04, M('leg'), Math.cos(a) * r, 0, Math.sin(a) * r, 10)); } g.add(cyl(W / 2 - .12, W / 2 - .12, .02, M('shelf'), 0, .12)); return g; },
  variants: [
    ['White marble', '#ece9e4', { top: ['marble', '#ece9e4'], leg: ['metal', '#2a2a2a'], shelf: ['wood', '#a9885a'] }],
    ['Oak & black', '#b8905c', { top: ['wood', '#b8905c'], leg: ['metal', '#1e1e1e'], shelf: ['wood', '#8c6c47'] }],
    ['Rattan top', '#c8a265', { top: ['rattan', '#c8a265'], leg: ['wood', '#6b4a32'], shelf: ['rattan', '#b08c52'] }]
  ].map(([n, sw, m]) => ({ n, sw, m }))
});
function tableBuilder(round) {
  return (M, W, D, H) => { const g = new THREE.Group(); if (round) { g.add(cyl(W / 2, W / 2, .04, M('top'), 0, H - .04)); g.add(cyl(.05, .09, H - .04, M('leg'), 0, 0, 0, 16)); g.add(cyl(.3, .3, .03, M('leg'), 0, 0, 0)); } else { g.add(bx(W, .04, D, M('top'), 0, H - .04, 0)); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(bx(.06, H - .04, .06, M('leg'), a * (W / 2 - .07), 0, b * (D / 2 - .07))); g.add(bx(W - .2, .08, .03, M('leg'), 0, H - .12, D / 2 - .07)); g.add(bx(W - .2, .08, .03, M('leg'), 0, H - .12, -D / 2 + .07)); } return g; };
}
const tableVars = [
  ['Oak', '#c5a06b', { top: ['wood', '#c5a06b'], leg: ['wood', '#a8834f'] }],
  ['Walnut', '#6a4430', { top: ['wood', '#6a4430'], leg: ['metal', '#1c1c1c'] }],
  ['White', '#efece6', { top: ['laminate', '#f1eee8'], leg: ['wood', '#c5a06b'] }],
  ['Marble', '#e9e6e1', { top: ['marble', '#e9e6e1'], leg: ['metal', '#c3a35b'] }]
].map(([n, sw, m]) => ({ n, sw, m }));
product({ id: 'borda', name: 'BORDA', type: 'Dining table, 6 seats', cat: 'Dining tables', rooms: ['dining'], w: 180, d: 90, h: 74, price: 17990, rating: 4, reviews: 640, size: '180×90×74 cm', goes: ['stola', 'bank', 'matta-carpet'], build: tableBuilder(false), variants: tableVars });
product({ id: 'bordar', name: 'BORDA RUND', type: 'Round dining table', cat: 'Dining tables', rooms: ['dining'], w: 110, d: 110, h: 74, price: 12990, rating: 4, reviews: 301, size: 'Ø 110 cm', goes: ['stola'], build: tableBuilder(true), variants: tableVars });
product({
  id: 'stola', name: 'STOLA', type: 'Dining chair', cat: 'Chairs & benches', rooms: ['dining', 'living'], w: 45, d: 50, h: 85, price: 2990, rating: 4, reviews: 2210, size: '45×50×85 cm', goes: ['borda', 'bordar'],
  build: (M, W, D, H) => { const g = new THREE.Group(); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.016, .012, .45, M('leg'), a * (W / 2 - .03), 0, b * (D / 2 - .03), 10)); g.add(rbx(W, .05, D, .02, M('seat'), 0, .45, 0)); g.add(rbx(W, .3, .04, .02, M('back'), 0, .56, -D / 2 + .03)); for (const a of [-1, 1]) g.add(bx(.03, .22, .03, M('leg'), a * (W / 2 - .04), .5, -D / 2 + .035)); return g; },
  variants: [
    ['Rattan & black', '#c8a265', { seat: ['rattan', '#c8a265'], back: ['rattan', '#c8a265'], leg: ['metal', '#1e1e1e'] }],
    ['Green velvet', '#4f7a63', { seat: ['velvet', '#4f7a63'], back: ['velvet', '#4f7a63'], leg: ['wood', '#a8834f'] }],
    ['Leather brown', '#7b4a2e', { seat: ['leather', '#7b4a2e'], back: ['leather', '#7b4a2e'], leg: ['metal', '#2a2a2a'] }],
    ['Plain pine', '#d8b982', { seat: ['wood', '#d8b982'], back: ['wood', '#d8b982'], leg: ['wood', '#b8955f'] }]
  ].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'bank', name: 'BÄNK', type: 'Bench with fabric seat', cat: 'Chairs & benches', rooms: ['dining', 'hallway'], w: 110, d: 38, h: 46, price: 4990, rating: 4, reviews: 188, size: '110×38×46 cm', goes: ['borda', 'skoa'],
  build: (M, W, D, H) => { const g = new THREE.Group(); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.022, .016, H - .06, M('leg'), a * (W / 2 - .06), 0, b * (D / 2 - .05), 10)); g.add(rbx(W, .07, D, .02, M('seat'), 0, H - .07, 0)); return g; },
  variants: [['Linen grey', '#a7a299', { seat: ['linen', '#a7a299'], leg: ['wood', '#8c6c47'] }], ['Plaid red', '#b2493d', { seat: ['plaid', '#b2493d', '#e8d6a8'], leg: ['metal', '#222'] }], ['Leather black', '#2c2724', { seat: ['leather', '#2c2724'], leg: ['wood', '#c5a06b'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
function shelfBuilder(rows, books, bins) {
  return (M, W, D, H) => {
    const g = new THREE.Group(), f = M('frame'), r = rng(7 + rows * 13 + Math.round(W * 100)), pal = ['#b4533f', '#4f6e8f', '#d8b25a', '#5e8a6b', '#e8e1d0', '#7a4f7a', '#2f3a45'];
    g.add(bx(.03, H, D, f, -W / 2 + .015, 0, 0)); g.add(bx(.03, H, D, f, W / 2 - .015, 0, 0)); g.add(bx(W, H, .012, M('back'), 0, 0, -D / 2 + .006));
    const gap = (H - .03) / rows;
    for (let i = 0; i <= rows; i++) g.add(bx(W - .06, .03, D, f, 0, Math.min(i * gap, H - .03), 0));
    for (let i = 0; i < rows; i++) {
      const y = i * gap + .03; let x = -W / 2 + .06;
      if (bins) { const bw = (W - .12) / 2; for (let k = 0; k < 2; k++) g.add(bx(bw - .03, gap * .62, D - .1, flat(pal[(i * 2 + k) % pal.length]), -W / 2 + .05 + bw * (k + .5), y, .02)); continue; }
      if (books && i % 2 === 0 && i < rows) while (x < W / 2 - .12) { const bw = .025 + r() * .035, bh = gap * (.55 + r() * .3); g.add(bx(bw, bh, D * .7, flat(pal[(r() * pal.length) | 0]), x + bw / 2, y, 0)); x += bw + .004; }
    }
    return g;
  };
}
const shelfVars = [
  ['Oak', '#c5a06b', { frame: ['wood', '#c5a06b'], back: ['wood', '#a8834f'] }],
  ['White', '#efece6', { frame: ['laminate', '#f1eee8'], back: ['laminate', '#e2dfd8'] }],
  ['Black-brown', '#3a2f2a', { frame: ['wood', '#3a2f2a'], back: ['wood', '#2a221e'] }]
].map(([n, sw, m]) => ({ n, sw, m }));
product({ id: 'hylla', name: 'HYLLA', type: 'Bookcase, 5 shelves', cat: 'Storage', rooms: ['living', 'kids', 'dining'], w: 90, d: 30, h: 180, price: 8990, rating: 4, reviews: 970, size: '90×30×180 cm', goes: ['soffa3', 'skriva'], build: shelfBuilder(5, true), variants: shelfVars });
product({ id: 'leksak', name: 'LEKSAK', type: 'Toy storage with bins', cat: 'Storage', rooms: ['kids'], w: 80, d: 36, h: 70, price: 5490, rating: 5, reviews: 133, size: '80×36×70 cm', goes: ['barna', 'kidsdesk'], build: shelfBuilder(2, false, true), variants: shelfVars });
product({
  id: 'tvbank', name: 'TVBÄNK', type: 'TV unit with doors', cat: 'Storage', rooms: ['living'], w: 160, d: 42, h: 110, price: 15490, rating: 4, reviews: 355, size: '160×42×110 cm', goes: ['soffa3', 'matta-plaid'],
  build: (M, W, D, H) => { const g = new THREE.Group(), cab = .5; for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.02, .015, .12, M('leg'), a * (W / 2 - .06), 0, b * (D / 2 - .06), 10)); g.add(bx(W, cab - .12, D, M('body'), 0, .12, 0)); for (let i = 0; i < 3; i++) { g.add(bx(W / 3 - .03, cab - .17, .02, M('door'), -W / 3 + i * W / 3, .14, D / 2 + .01)); } g.add(bx(.7, .04, .2, flat('#222'), 0, cab, 0)); g.add(bx(1.2, .68, .04, flat('#0e0f12', { roughness: .25, metalness: .4 }), 0, cab + .04, 0)); return g; },
  variants: [['Walnut', '#6a4430', { body: ['wood', '#5b3b2a'], door: ['wood', '#6a4430'], leg: ['metal', '#222'] }], ['Light oak', '#c9a874', { body: ['wood', '#b8955f'], door: ['wood', '#c9a874'], leg: ['metal', '#2a2a2a'] }], ['Graphite', '#4a4c50', { body: ['laminate', '#3d3f43'], door: ['laminate', '#4a4c50'], leg: ['wood', '#a8834f'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'skriva', name: 'SKRIVA', type: 'Desk with drawers', cat: 'Tables', rooms: ['living', 'bedroom'], w: 140, d: 65, h: 74, price: 11990, rating: 4, reviews: 421, size: '140×65×74 cm', goes: ['stola', 'lamp'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(bx(W, .035, D, M('top'), 0, H - .035, 0)); g.add(bx(.04, H - .035, D - .04, M('leg'), -W / 2 + .03, 0, 0)); g.add(bx(.45, H - .035, D - .04, M('body'), W / 2 - .25, 0, 0)); for (let i = 0; i < 3; i++) g.add(bx(.41, (H - .1) / 3 - .01, .02, M('front'), W / 2 - .25, .04 + i * (H - .1) / 3, D / 2 - .01)); g.add(bx(W - .5, .3, .02, M('leg'), -.2, H - .4, -D / 2 + .03)); return g; },
  variants: [['Oak & white', '#c5a06b', { top: ['wood', '#c5a06b'], leg: ['laminate', '#f1eee8'], body: ['laminate', '#e8e5de'], front: ['laminate', '#f3f1ec'] }], ['Black', '#2c2a29', { top: ['laminate', '#2c2a29'], leg: ['metal', '#1c1c1c'], body: ['laminate', '#3a3836'], front: ['laminate', '#2c2a29'] }], ['Walnut', '#6a4430', { top: ['wood', '#6a4430'], leg: ['wood', '#5b3b2a'], body: ['wood', '#5b3b2a'], front: ['wood', '#6a4430'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'kidsdesk', name: 'LEKBORD', type: "Children's desk", cat: 'Kids desks & chairs', rooms: ['kids'], w: 100, d: 55, h: 60, price: 4990, rating: 4, reviews: 77, size: '100×55×60 cm', goes: ['kidschair', 'barna'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(bx(W, .03, D, M('top'), 0, H - .03, 0)); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(bx(.05, H - .03, .05, M('leg'), a * (W / 2 - .05), 0, b * (D / 2 - .05))); return g; },
  variants: [['Birch & blue', '#d9c19a', { top: ['wood', '#d9c19a'], leg: ['laminate', '#6fa6cf'] }], ['White & yellow', '#efece6', { top: ['laminate', '#f1eee8'], leg: ['laminate', '#e9bb4a'] }], ['Green', '#7fa98a', { top: ['laminate', '#7fa98a'], leg: ['wood', '#d9c19a'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'kidschair', name: 'LEKSTOL', type: "Children's chair", cat: 'Kids desks & chairs', rooms: ['kids'], w: 32, d: 34, h: 55, price: 1490, rating: 4, reviews: 61, size: '32×34×55 cm', goes: ['kidsdesk'],
  build: (M, W, D, H) => { const g = new THREE.Group(); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.014, .012, .3, M('leg'), a * (W / 2 - .025), 0, b * (D / 2 - .025), 8)); g.add(bx(W, .035, D, M('seat'), 0, .3, 0)); g.add(bx(W, .2, .025, M('seat'), 0, .35, -D / 2 + .02)); return g; },
  variants: [['Red', '#c9473d', { seat: ['laminate', '#c9473d'], leg: ['metal', '#888'] }], ['Blue', '#4f86b8', { seat: ['laminate', '#4f86b8'], leg: ['metal', '#888'] }], ['Natural', '#d9c19a', { seat: ['wood', '#d9c19a'], leg: ['wood', '#b8955f'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});

/* — rugs / lighting / decor / hallway — */
function rugBuilder(round) { return (M, W, D) => { const g = new THREE.Group(); const o = round ? cyl(W / 2, W / 2, .015, M('rug'), 0, 0, 0, 40) : bx(W, .015, D, M('rug'), 0, 0, 0); o.castShadow = false; g.add(o); return g; }; }
function rugVars(list) { return list.map(([n, sw, kind, c, c2]) => ({ n, sw, m: { rug: [kind, c, c2] } })); }
product({ id: 'matta-plaid', name: 'MATTA', type: 'Flatwoven rug, plaid', cat: 'Rugs', rooms: ['living', 'bedroom', 'dining'], w: 200, d: 300, h: 2, rug: true, price: 6990, rating: 4, reviews: 220, size: '200×300 cm', goes: [], build: rugBuilder(false), variants: rugVars([['Terracotta plaid', '#b86a4a', 'plaid', '#d9bfa0', '#8a3f2a'], ['Blue plaid', '#5c7a99', 'plaid', '#d9dfe3', '#2f4a66'], ['Sand plaid', '#d6c6a8', 'plaid', '#f0e8d6', '#9b8460']]) });
product({ id: 'matta-stripe', name: 'MATTA STRIPE', type: 'Striped cotton rug', cat: 'Rugs', rooms: ['kids', 'bedroom', 'hallway'], w: 140, d: 200, h: 2, rug: true, price: 2990, rating: 4, reviews: 145, size: '140×200 cm', goes: [], build: rugBuilder(false), variants: rugVars([['Blue stripe', '#5c7a99', 'stripe', '#f1efe9', '#5c7a99'], ['Yellow stripe', '#e2b84b', 'stripe', '#f6f3ec', '#e2b84b'], ['Grey stripe', '#8d8d8d', 'stripe', '#eceae4', '#8d8d8d']]) });
product({ id: 'matta-carpet', name: 'MATTA SHAGGY', type: 'Round high-pile rug', cat: 'Rugs', rooms: ['living', 'bedroom', 'kids', 'dining'], w: 160, d: 160, h: 2, rug: true, price: 4490, rating: 5, reviews: 310, size: 'Ø 160 cm', goes: [], build: rugBuilder(true), variants: rugVars([['Cream', '#e8e0d0', 'carpet', '#e8e0d0'], ['Charcoal', '#4a4a4c', 'carpet', '#4a4a4c'], ['Sage', '#9aab94', 'carpet', '#9aab94']]) });
product({
  id: 'lamp', name: 'LAMPA', type: 'Floor lamp', cat: 'Lighting & decor', rooms: ['living', 'bedroom', 'hallway'], w: 36, d: 36, h: 150, price: 3990, rating: 4, reviews: 840, size: 'H 150 cm', goes: ['soffa3', 'natta'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(cyl(.17, .17, .025, M('base'), 0, 0, 0)); g.add(cyl(.012, .012, H - .35, M('base'), 0, 0, 0, 10)); const s = cyl(.14, .2, .32, M('shade'), 0, H - .32, 0, 28); s.castShadow = false; g.add(s); return g; },
  variants: [['Black & linen', '#2c2c2c', { base: ['metal', '#222'], shade: ['flat', '#efe4c8', { emissive: '#f2d79a', emissiveIntensity: .35, roughness: .9 }] }], ['Brass & white', '#c3a35b', { base: ['metal', '#c3a35b'], shade: ['flat', '#f4f1ea', { emissive: '#f4e6c3', emissiveIntensity: .3, roughness: .9 }] }], ['Wood & terracotta', '#b86a4a', { base: ['wood', '#8c6c47'], shade: ['flat', '#d98a62', { emissive: '#d98a62', emissiveIntensity: .25, roughness: .9 }] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'vaxt', name: 'VÄXT', type: 'Potted plant', cat: 'Lighting & decor', rooms: ['living', 'bedroom', 'hallway', 'dining', 'kids'], w: 40, d: 40, h: 110, price: 1990, rating: 4, reviews: 412, size: 'H 110 cm', goes: ['soffa3'],
  build: (M, W, D, H) => { const g = new THREE.Group(), r = rng(11); g.add(cyl(.17, .12, .28, M('pot'), 0, 0, 0)); g.add(cyl(.012, .012, H * .6, flat('#4a3a2a'), 0, .28, 0, 8)); for (let i = 0; i < 14; i++) { const a = r() * 6.28, rr = .06 + r() * .17, y = .5 + r() * (H - .6); const l = sph(.1 + r() * .06, M('leaf'), Math.cos(a) * rr, y, Math.sin(a) * rr, 1, .55, 1.2); l.rotation.y = a; l.rotation.z = (r() - .5); g.add(l); } return g; },
  variants: [['Green · white pot', '#5e8a6b', { pot: ['laminate', '#eee9df'], leaf: ['leaf', '#4f7f5c'] }], ['Olive · terracotta', '#8a9a5a', { pot: ['concrete', '#c5775a'], leaf: ['leaf', '#7b8f4a'] }], ['Deep green · black pot', '#2f5a45', { pot: ['laminate', '#2a2a2a'], leaf: ['leaf', '#2f5a45'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'skoa', name: 'SKOA', type: 'Shoe cabinet, 3 compartments', cat: 'Shoe storage', rooms: ['hallway'], w: 80, d: 30, h: 108, price: 6990, rating: 4, reviews: 520, size: '80×30×108 cm', goes: ['bank', 'spegel'],
  build: (M, W, D, H) => { const g = new THREE.Group(); for (const a of [-1, 1]) g.add(bx(.04, .1, D - .04, M('leg'), a * (W / 2 - .05), 0, 0)); g.add(bx(W, H - .1, D, M('body'), 0, .1, 0)); for (let i = 0; i < 3; i++) { const f = bx(W - .04, (H - .16) / 3 - .01, .02, M('front'), 0, .12 + i * (H - .14) / 3, D / 2 + .01); f.rotation.x = -.12; g.add(f); g.add(bx(W * .5, .012, .012, M('metal'), 0, .12 + (i + 1) * (H - .14) / 3 - .035, D / 2 + .03)); } return g; },
  variants: [['White', '#efece6', { body: ['laminate', '#e5e2db'], front: ['laminate', '#f3f1ec'], leg: ['wood', '#a8834f'], metal: ['metal', '#999'] }], ['Black', '#2c2a29', { body: ['laminate', '#262423'], front: ['laminate', '#2c2a29'], leg: ['metal', '#555'], metal: ['metal', '#b9a77e'] }], ['Oak', '#c5a06b', { body: ['wood', '#b48f5b'], front: ['wood', '#c5a06b'], leg: ['metal', '#222'], metal: ['metal', '#333'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'konsol', name: 'KONSOL', type: 'Console table', cat: 'Storage', rooms: ['hallway', 'living', 'dining'], w: 120, d: 32, h: 78, price: 6490, rating: 4, reviews: 203, size: '120×32×78 cm', goes: ['spegel', 'vaxt'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(bx(W, .035, D, M('top'), 0, H - .035, 0)); for (const a of [-1, 1]) for (const b of [-1, 1]) g.add(cyl(.016, .012, H - .035, M('leg'), a * (W / 2 - .05), 0, b * (D / 2 - .04), 10)); g.add(bx(W - .12, .02, D - .08, M('shelf'), 0, .2, 0)); return g; },
  variants: [['Oak & black', '#c5a06b', { top: ['wood', '#c5a06b'], leg: ['metal', '#1c1c1c'], shelf: ['wood', '#a8834f'] }], ['Marble & brass', '#ece9e4', { top: ['marble', '#ece9e4'], leg: ['metal', '#c3a35b'], shelf: ['marble', '#dedad4'] }], ['Walnut', '#6a4430', { top: ['wood', '#6a4430'], leg: ['wood', '#5b3b2a'], shelf: ['wood', '#5b3b2a'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'spegel', name: 'SPEGEL', type: 'Standing mirror', cat: 'Mirrors & hooks', rooms: ['hallway', 'bedroom'], w: 60, d: 6, h: 170, price: 4290, rating: 4, reviews: 390, size: '60×170 cm', goes: ['skoa', 'konsol'],
  build: (M, W, D, H) => { const g = new THREE.Group(); const f = bx(W, H, .035, M('frame'), 0, 0, 0); g.add(f); g.add(bx(W - .06, H - .06, .01, flat('#cfe0e8', { roughness: .08, metalness: .6, emissive: '#7fa0b0', emissiveIntensity: .18 }), 0, .03, .02)); return g; },
  variants: [['Oak frame', '#c5a06b', { frame: ['wood', '#c5a06b'] }], ['Black frame', '#222', { frame: ['metal', '#222'] }], ['Brass frame', '#c3a35b', { frame: ['metal', '#c3a35b'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});
product({
  id: 'rack', name: 'KROK', type: 'Coat rack stand', cat: 'Mirrors & hooks', rooms: ['hallway'], w: 45, d: 45, h: 175, price: 2490, rating: 4, reviews: 266, size: 'H 175 cm', goes: ['skoa'],
  build: (M, W, D, H) => { const g = new THREE.Group(); g.add(cyl(.2, .22, .03, M('base'), 0, 0, 0)); g.add(cyl(.016, .016, H, M('base'), 0, 0, 0, 10)); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, hk = cyl(.01, .01, .16, M('hook'), Math.cos(a) * .08, H - .2, Math.sin(a) * .08, 8); hk.rotation.z = Math.cos(a) * -.9; hk.rotation.x = Math.sin(a) * .9; g.add(hk); } return g; },
  variants: [['Black', '#222', { base: ['metal', '#222'], hook: ['metal', '#222'] }], ['Bamboo', '#c8b27a', { base: ['wood', '#c8b27a'], hook: ['metal', '#555'] }], ['Brass', '#c3a35b', { base: ['metal', '#c3a35b'], hook: ['metal', '#c3a35b'] }]].map(([n, sw, m]) => ({ n, sw, m }))
});

/* ═══════════════ 4 · rooms, templates & style tables ═══════════════ */
const WALL_COLORS = ['#f0efeb', '#d1c7bb', '#e2d3c7', '#ad5a22', '#8f5646', '#bccace', '#6a8794', '#929a79', '#87847d', '#9a8678', '#77566d', '#5a766b'];
const DEFAULT_WALL = WALL_COLORS[0];
const FLOORS = [
  ['Natural oak', 'plank', '#b98a5a'], ['Light ash', 'plank', '#d9c19a'], ['Walnut', 'plank', '#6b4630'], ['Dark espresso', 'plank', '#3b2a22'],
  ['Grey oak', 'plank', '#9a9488'], ['White wash', 'plank', '#e6dccb'], ['Honey pine', 'plank', '#d4a24e'], ['Cherry', 'plank', '#8b4a3a'],
  ['Oak herringbone', 'herring', '#b98a5a'], ['Grey herringbone', 'herring', '#8b8780'], ['White tile', 'tile', '#eeeeea', '#9a9a96'], ['Charcoal tile', 'tile', '#4a4b4e', '#26272a'],
  ['Terracotta tile', 'tile', '#b5663f', '#6e3b22'], ['Checkerboard', 'checker', '#efefea', '#2b2b2b'], ['Polished concrete', 'concrete', '#8e8e8c'], ['Light concrete', 'concrete', '#c4c2bc'],
  ['White marble', 'marble', '#ecebe7'], ['Beige carpet', 'carpet', '#cbbba0'], ['Grey carpet', 'carpet', '#7d7f84']
].map(([name, kind, c, c2], i) => ({ id: 'f' + i, name, kind, c, c2 }));
const FLOOR = id => FLOORS.find(f => f.id === id) || FLOORS[0];
const DOORS = [
  { id: 'single', name: 'Single Panel Door', w: .9, h: 2.1, leaves: 1, mode: 'solid' },
  { id: 'glass', name: 'Glass Door', w: .9, h: 2.1, leaves: 1, mode: 'glass' },
  { id: 'french', name: 'French Double Door', w: 1.5, h: 2.1, leaves: 2, mode: 'grid' },
  { id: 'double', name: 'Double Panel Door', w: 1.5, h: 2.1, leaves: 2, mode: 'solid' },
  { id: 'bifold', name: 'Bifold Panel Double Door', w: 1.8, h: 2.1, leaves: 4, mode: 'solid' },
  { id: 'glassdouble', name: 'Glass Double Door', w: 1.6, h: 2.1, leaves: 2, mode: 'glass' }
].map(d => Object.assign(d, { kind: 'door', sill: 0 }));
const WINDOWS = [
  { id: 'w1', name: 'Glass Window Single', w: 1.0, h: 1.2, leaves: 1, mode: 'grid', sill: .9 },
  { id: 'w2', name: 'Glass Window Double', w: 1.8, h: 1.2, leaves: 2, mode: 'grid', sill: .9 }
].map(d => Object.assign(d, { kind: 'window' }));
const STYLE = {}; [...DOORS, ...WINDOWS].forEach(s => STYLE[s.id] = s);
const feat = (wall, style, u, extra) => { const s = STYLE[style]; return Object.assign({ id: uid(), wall, style, kind: s.kind, u, w: s.w, h: s.h, sill: s.sill }, extra || {}); };

/* Template rooms. Footprints chosen so areas match the labels (sq.ft). */
const TEMPLATES = [
  { id: 'open-spacious', name: 'Open spacious', W: 8.6, D: 5.1, ceil: 2.6, wall: 0, floor: 'f0', feats: () => [feat('W', 'french', 1.2), feat('W', 'french', 2.9), feat('E', 'single', 2.1)] },
  { id: 'neutral-standard', name: 'Neutral standard', W: 5.6, D: 4.1, ceil: 2.5, wall: 0, floor: 'f1', feats: () => [feat('N', 'w2', 2.8), feat('S', 'single', 4.4)] },
  { id: 'bright-spacious', name: 'Bright spacious', W: 6.0, D: 4.3, ceil: 2.7, wall: 2, floor: 'f5', feats: () => [feat('N', 'w2', 1.6), feat('N', 'w1', 4.3), feat('W', 'single', 2.2)] },
  { id: 'cozy-contemporary', name: 'Cozy contemporary', W: 4.6, D: 3.9, ceil: 2.45, wall: 7, floor: 'f2', feats: () => [feat('N', 'w1', 2.3), feat('E', 'glass', 1.9)] },
  { id: 'warm-contemporary', name: 'Warm contemporary', W: 4.4, D: 3.65, ceil: 2.5, wall: 1, floor: 'f6', feats: () => [feat('W', 'w1', 1.8), feat('S', 'single', 1.5)] },
  { id: 'peaceful-hideaway', name: 'Peaceful hideaway', W: 5.0, D: 3.9, ceil: 2.6, wall: 5, floor: 'f4', feats: () => [feat('N', 'w2', 1.9), feat('E', 'glassdouble', 2.0)] }
];
const FURNISHED = [
  { id: 'f-bedroom', name: 'Bedroom retreat', base: 'neutral-standard', roomType: 'bedroom', wall: 5, floor: 'f1',
    items: [['matta-plaid', 1, 0, .5, 0], ['sovna', 1, 0, -1.0, 0], ['natta', 0, -1.15, -1.85, 0], ['natta', 1, 1.15, -1.85, 0], ['skapa', 2, 2.51, 1.0, -90], ['lamp', 1, -2.5, -1.85, 0], ['vaxt', 0, 2.45, -1.75, 0]] },
  { id: 'f-living', name: 'Living lounge', base: 'open-spacious', roomType: 'living', wall: 0, floor: 'f4',
    items: [['matta-plaid', 1, 0, .6, 0], ['soffa3', 3, 0, 1.9, 180], ['kaffe', 0, 0, .5, 0], ['fatol', 1, -2.2, .5, 90], ['tvbank', 0, 0, -2.4, 0], ['hylla', 0, 3.5, -2.4, 0], ['lamp', 1, 2.4, 2.2, 0], ['vaxt', 1, -3.8, -2.2, 0]] },
  { id: 'f-dining', name: 'Dining nook', base: 'bright-spacious', roomType: 'dining', wall: 2, floor: 'f0',
    items: [['matta-plaid', 0, 0, 0, 90], ['borda', 0, 0, 0, 0], ['stola', 1, -.6, -.75, 0], ['stola', 1, .6, -.75, 0], ['stola', 1, -.6, .75, 180], ['stola', 1, .6, .75, 180], ['bank', 1, -2.6, 0, 90], ['konsol', 0, 0, 1.95, 180]] }
];
const TPL = id => TEMPLATES.find(t => t.id === id);
function roomFromTemplate(t) {
  return { x0: -t.W / 2, x1: t.W / 2, z0: -t.D / 2, z1: t.D / 2, h: t.ceil, wall: WALL_COLORS[t.wall], floor: t.floor, feats: t.feats() };
}
const sqft = R => Math.round((R.x1 - R.x0) * (R.z1 - R.z0) * 10.7639);

/* ═══════════════ 5 · state, scene & cameras ═══════════════ */
const S = {
  route: 'hub', mode: 'design', view: 'dollhouse', designId: null, templateId: null, title: 'Untitled Design', roomType: 'bedroom',
  room: null, items: [], sel: null, tab: 'add', cat: null, query: '', itemTab: 'details', rotating: false, stripOpen: false, insideWall: 'N',
  units: 'ft', measure: { prod: false, space: false, room: false },
  favs: new Set(store.get('favs', [])), bag: store.get('bag', []), actions: 0, feedbackShown: false, panelOpen: true
};
const WALLS = ['N', 'E', 'S', 'W'];
const WALL_NAME = { N: 'North wall', E: 'East wall', S: 'South wall', W: 'West wall' };
const T_WALL = .12;
const GL = { renderer: null, scene: null, persp: null, ortho: null, inside: null, cam: null, roomGroup: null, itemGroup: null, hemi: null, sun: null, lamp: null, refs: null, need: true, ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), vw: 1, vh: 1 };
const CAM = { az: 38, el: 33, dist: 14, minD: 4, maxD: 40, tz: 1, px: 0, pz: 0, yaw: 0, pitch: 0, fov: 72 };
const roomCenter = () => ({ x: (S.room.x0 + S.room.x1) / 2, z: (S.room.z0 + S.room.z1) / 2 });
const markDirty = () => { GL.need = true; };

function initGL() {
  const canvas = $('#gl');
  const r = GL.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.setClearColor(0xcfcfcf, 1);
  const sc = GL.scene = new THREE.Scene();
  GL.persp = new THREE.PerspectiveCamera(30, 1, .1, 300);
  GL.ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 200);
  GL.inside = new THREE.PerspectiveCamera(72, 1, .05, 100);
  GL.cam = GL.persp;
  GL.hemi = new THREE.HemisphereLight(0xffffff, 0xcdbfa8, .72); sc.add(GL.hemi);
  sc.add(new THREE.AmbientLight(0xffffff, .22));
  const sun = GL.sun = new THREE.DirectionalLight(0xffffff, .78);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sc.add(sun); sc.add(sun.target);
  GL.lamp = new THREE.PointLight(0xfff1dc, .0, 14, 1.6); sc.add(GL.lamp);
  GL.roomGroup = new THREE.Group(); GL.itemGroup = new THREE.Group(); sc.add(GL.roomGroup, GL.itemGroup);
  new ResizeObserver(resize).observe($('#view'));
  resize();
  (function loop() { requestAnimationFrame(loop); if (GL.need && S.route === 'designer') { GL.need = false; renderFrame(); } })();
}
function resize() {
  const v = $('#view'); if (!v || !GL.renderer) return;
  const w = Math.max(1, v.clientWidth), hh = Math.max(1, v.clientHeight);
  GL.vw = w; GL.vh = hh; GL.renderer.setSize(w, hh, false);
  for (const c of [GL.persp, GL.inside]) { c.aspect = w / hh; c.updateProjectionMatrix(); }
  $('#dims').setAttribute('viewBox', `0 0 ${w} ${hh}`);
  updateCamera(); markDirty();
}

/* camera rigs */
function fitCamera() {
  if (!S.room) return;
  const W = S.room.x1 - S.room.x0, D = S.room.z1 - S.room.z0, big = Math.max(W, D);
  CAM.dist = clamp(big * 1.75 + 2, 7, 40); CAM.minD = Math.max(3.5, big * .5); CAM.maxD = big * 4 + 10;
  CAM.tz = 1; CAM.px = 0; CAM.pz = 0; CAM.yaw = 0; CAM.pitch = 0; CAM.fov = 72;
}
function topViewHeight() {
  const W = S.room.x1 - S.room.x0, D = S.room.z1 - S.room.z0, asp = GL.vw / GL.vh;
  const pad = (S.mode === 'edit' && S.edit && S.edit.step === 1) ? 1.7 : 1.28;
  return Math.max(D * pad, W * pad / asp, 4) / CAM.tz;
}
function insidePose(key) {
  const R = S.room, c = roomCenter(), m = .45, eye = Math.min(1.5, R.h - .7);
  // look AT the named wall from the opposite side
  const pose = { N: [c.x, R.z1 - m, c.x, R.z0, 0], S: [c.x, R.z0 + m, c.x, R.z1, 1], E: [R.x0 + m, c.z, R.x1, c.z, 2], W: [R.x1 - m, c.z, R.x0, c.z, 3] }[key];
  return { eye, a: pose };
}
function setInsideCam(cam, key, yaw = 0, pitch = 0) {
  const R = S.room, c = roomCenter(), { eye } = insidePose(key); let x, z, dx, dz;
  const m = .4;
  if (key === 'N') { x = c.x; z = R.z1 - m; dx = 0; dz = -1; }
  if (key === 'S') { x = c.x; z = R.z0 + m; dx = 0; dz = 1; }
  if (key === 'E') { x = R.x0 + m; z = c.z; dx = 1; dz = 0; }
  if (key === 'W') { x = R.x1 - m; z = c.z; dx = -1; dz = 0; }
  const base = Math.atan2(dx, -dz), ang = base + rad(yaw);
  cam.position.set(x, eye, z);
  cam.lookAt(x + Math.sin(ang) * 5, eye + Math.tan(rad(pitch)) * 5 - .25, z - Math.cos(ang) * 5);
}
function updateCamera() {
  if (!S.room) return;
  const c = roomCenter();
  if (S.view === 'dollhouse') {
    GL.cam = GL.persp;
    const el = rad(CAM.el), az = rad(CAM.az), t = new THREE.Vector3(c.x + CAM.px, .6, c.z + CAM.pz);
    GL.persp.position.set(t.x + CAM.dist * Math.sin(az) * Math.cos(el), t.y + CAM.dist * Math.sin(el), t.z + CAM.dist * Math.cos(az) * Math.cos(el));
    GL.persp.lookAt(t);
  } else if (S.view === 'top') {
    GL.cam = GL.ortho;
    const hh = FREEZE ? FREEZE.hh : topViewHeight(), ww = hh * GL.vw / GL.vh, o = GL.ortho, cx = (FREEZE ? FREEZE.cx : c.x) + CAM.px, cz = (FREEZE ? FREEZE.cz : c.z) + CAM.pz;
    o.left = -ww / 2; o.right = ww / 2; o.top = hh / 2; o.bottom = -hh / 2; o.updateProjectionMatrix();
    o.position.set(cx, 40, cz); o.up.set(0, 0, -1); o.lookAt(cx, 0, cz);
  } else {
    GL.cam = GL.inside; GL.inside.fov = CAM.fov; GL.inside.updateProjectionMatrix();
    setInsideCam(GL.inside, S.insideWall, CAM.yaw, CAM.pitch);
  }
  GL.cam.updateMatrixWorld();
  updateWallVisibility(); updateZoomButtons();
}
function updateWallVisibility() {
  const refs = GL.refs; if (!refs) return;
  const c = roomCenter(), p = GL.cam.position;
  const hide = { N: false, S: false, E: false, W: false };
  if (S.view === 'dollhouse') {
    const dx = p.x - c.x, dz = p.z - c.z;
    if (Math.abs(dz) > 1e-3) hide[dz > 0 ? 'S' : 'N'] = true;
    if (Math.abs(dx) > 1e-3) hide[dx > 0 ? 'E' : 'W'] = true;
  }
  for (const k of WALLS) refs.walls[k].visible = !hide[k];
  refs.ceil.visible = S.view === 'inside';
  GL.lamp.intensity = S.view === 'inside' ? .55 : 0;
  GL.hemi.intensity = S.view === 'inside' ? .6 : .72;
}
/* f < 1 zooms in, f > 1 zooms out (a multiplicative step, so gestures scale smoothly) */
function zoomScale(f) {
  if (S.view === 'dollhouse') CAM.dist = clamp(CAM.dist * f, CAM.minD, CAM.maxD);
  else if (S.view === 'top') CAM.tz = clamp(CAM.tz / f, .6, 4);
  else CAM.fov = clamp(CAM.fov * f, 38, 100);
  updateCamera(); markDirty(); positionOverlay();
}
const zoomBy = dir => zoomScale(dir > 0 ? .85 : 1 / .85);
function updateZoomButtons() {
  const inB = $('#zoom-in'), outB = $('#zoom-out'); if (!inB) return;
  let lo, hi;
  if (S.view === 'dollhouse') { hi = CAM.dist <= CAM.minD + .01; lo = CAM.dist >= CAM.maxD - .01; }
  else if (S.view === 'top') { hi = CAM.tz >= 3.99; lo = CAM.tz <= .61; }
  else { hi = CAM.fov <= 38.1; lo = CAM.fov >= 99.9; }
  inB.disabled = hi; outB.disabled = lo;
}

/* ═══════════════ 6 · room geometry ═══════════════ */
function disposeTree(o) { o.traverse(c => { if (c.geometry) c.geometry.dispose(); }); }
const wallLen = k => (k === 'N' || k === 'S') ? S.room.x1 - S.room.x0 : S.room.z1 - S.room.z0;
const featLocalX = (f, L) => f.wall === 'E' ? L - f.u : f.u;
function floorMaterial(R) {
  const f = FLOOR(R.floor), t = getTex(f.kind, f.c, f.c2).clone(); t.needsUpdate = true;
  const tile = (f.kind === 'tile' || f.kind === 'checker') ? 1.2 : f.kind === 'herring' ? 1.6 : f.kind === 'carpet' || f.kind === 'concrete' || f.kind === 'marble' ? 2.4 : 2;
  t.repeat.set((R.x1 - R.x0) / tile, (R.z1 - R.z0) / tile);
  const [rough, met] = SURF[f.kind] || SURF.plain;
  return new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: met * .2 });
}
function feature3D(f, T) {
  const st = STYLE[f.style] || STYLE.single, g = new THREE.Group(), w = f.w, hh = f.h, y0 = f.sill || 0, ft = .05;
  const fr = flat('#f4f1ea'), leafM = f.kind === 'door' ? mat('laminate', '#e9e2d3') : flat('#f4f1ea'), dark = flat('#d3c9b4'), brass = mat('metal', '#c3a35b');
  g.userData.feature = f;
  const add = (o) => { g.add(o); return o; };
  const zf = T * .5;
  add(bx(ft, hh, T * .9, fr, -w / 2 + ft / 2, y0, zf)); add(bx(ft, hh, T * .9, fr, w / 2 - ft / 2, y0, zf)); add(bx(w, ft, T * .9, fr, 0, y0 + hh - ft, zf));
  if (f.kind === 'window') add(bx(w, ft * 1.4, T * 1.25, fr, 0, y0 - .02, zf + .05));
  const n = st.leaves, lw = (w - ft * 2) / n, ly = y0 + (f.kind === 'door' ? .015 : ft * .5), lh = hh - ft - (f.kind === 'door' ? .015 : ft * .5);
  for (let i = 0; i < n; i++) {
    const lx = -w / 2 + ft + lw * (i + .5), z = T * .55;
    if (st.mode === 'solid') {
      add(bx(lw - .01, lh, .04, leafM, lx, ly, z));
      add(bx(lw * .68, lh * .3, .012, dark, lx, ly + lh * .08, z + .024)); add(bx(lw * .68, lh * .38, .012, dark, lx, ly + lh * .52, z + .024));
    } else {
      const b = .06;
      add(bx(b, lh, .04, leafM, lx - lw / 2 + b / 2, ly, z)); add(bx(b, lh, .04, leafM, lx + lw / 2 - b / 2, ly, z));
      add(bx(lw - b * 2, b, .04, leafM, lx, ly + lh - b, z)); add(bx(lw - b * 2, b * (st.mode === 'glass' && f.kind === 'door' ? 2.2 : 1), .04, leafM, lx, ly, z));
      const gl = shadow(new THREE.Mesh(new THREE.PlaneGeometry(lw - b * 2, lh - b * 2.6), glassMat), false); gl.position.set(lx, ly + lh / 2, z); gl.userData.glass = true; g.add(gl);
      if (st.mode === 'grid') {
        const rows = lh > 1.6 ? 3 : 1;
        add(bx(.02, lh - b * 2, .03, leafM, lx, ly + b, z));
        for (let k = 1; k <= rows; k++) add(bx(lw - b * 2, .02, .03, leafM, lx, ly + b + (lh - b * 2) * k / (rows + 1), z));
      }
    }
    if (f.kind === 'door') add(bx(.025, .12, .035, brass, lx + (i % 2 ? -1 : 1) * (lw / 2 - .07), ly + lh * .47, z + .035));
  }
  return g;
}
function wallPieces(key, L, H, feats) {
  const out = [], sorted = feats.map(f => ({ f, cx: featLocalX(f, L) })).sort((a, b) => a.cx - b.cx); let cur = 0;
  for (const { f, cx } of sorted) {
    const a = clamp(cx - f.w / 2, cur, L), b = clamp(cx + f.w / 2, a, L), y0 = f.sill || 0;
    out.push([cur, a, 0, H]);
    out.push([a, b, Math.min(H, y0 + f.h), H]);
    if (y0 > 0) out.push([a, b, 0, y0]);
    cur = b;
  }
  out.push([cur, L, 0, H]);
  return out.filter(p => p[1] - p[0] > .002 && p[3] - p[2] > .002);
}
function buildRoom() {
  const R = S.room, W = R.x1 - R.x0, D = R.z1 - R.z0, H = R.h, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  GL.roomGroup.children.slice().forEach(c => { GL.roomGroup.remove(c); disposeTree(c); });
  const refs = GL.refs = { walls: {}, feats: [] };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMaterial(R)); floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0, cz); floor.receiveShadow = true; floor.userData.floor = true;
  GL.roomGroup.add(floor); refs.floor = floor;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), flat('#f7f6f2', { roughness: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(cx, H, cz); GL.roomGroup.add(ceil); refs.ceil = ceil;
  const wallMat = flat(R.wall, { roughness: .95 });
  for (const k of WALLS) {
    const L = wallLen(k), g = new THREE.Group(); g.userData.wall = k;
    const feats = R.feats.filter(f => f.wall === k);
    for (const [a, b, y0, y1] of wallPieces(k, L, H, feats)) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, y1 - y0, T_WALL), wallMat); m.position.set((a + b) / 2, (y0 + y1) / 2, T_WALL / 2); m.receiveShadow = true; g.add(m);
    }
    for (const f of feats) { const fg = feature3D(f, T_WALL); fg.position.x = featLocalX(f, L); g.add(fg); refs.feats.push(fg); }
    // plinth strip so the footprint stays readable when the wall is cut away
    const pl = new THREE.Mesh(new THREE.BoxGeometry(L, .07, T_WALL), flat('#ffffff')); pl.position.set(L / 2, .035, T_WALL / 2); g.add(pl);
    if (k === 'N') g.position.set(R.x0, 0, R.z0 - T_WALL);
    if (k === 'S') g.position.set(R.x0, 0, R.z1);
    if (k === 'W') { g.position.set(R.x0, 0, R.z0); g.rotation.y = -Math.PI / 2; }
    if (k === 'E') { g.position.set(R.x1, 0, R.z1); g.rotation.y = Math.PI / 2; }
    GL.roomGroup.add(g); refs.walls[k] = g;
  }
  // lights follow the room
  const span = Math.max(W, D) * .75 + 1;
  GL.sun.position.set(cx + W * .22, H * 3.2, cz + D * .55); GL.sun.target.position.set(cx, 0, cz);
  const sc = GL.sun.shadow.camera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = H * 8 + 20; sc.updateProjectionMatrix();
  GL.lamp.position.set(cx, H - .3, cz);
  updateCamera(); markDirty();
}

/* ═══════════════ 6b · items: nodes, placement, collisions ═══════════════ */
const ext = (p, rot) => { const c = Math.abs(Math.cos(rad(rot))), s = Math.abs(Math.sin(rad(rot))), w = p.w / 100, d = p.d / 100; return { hw: (c * w + s * d) / 2, hd: (s * w + c * d) / 2 }; };
function clampPos(p, rot, x, z) {
  const R = S.room, e = ext(p, rot);
  const lo = R.x0 + e.hw, hi = R.x1 - e.hw, lz = R.z0 + e.hd, hz = R.z1 - e.hd;
  return { x: lo > hi ? (R.x0 + R.x1) / 2 : clamp(x, lo, hi), z: lz > hz ? (R.z0 + R.z1) / 2 : clamp(z, lz, hz) };
}
function collides(p, rot, x, z, ignore) {
  if (p.rug) return false;
  const e = ext(p, rot);
  return S.items.some(o => {
    if (o === ignore) return false; const q = P(o.pid); if (q.rug) return false; const f = ext(q, o.rot);
    return Math.abs(x - o.x) < e.hw + f.hw - .004 && Math.abs(z - o.z) < e.hd + f.hd - .004;
  });
}
function findSpot(p, rot, px, pz, ignore) {
  const c = roomCenter(), tryPos = (x, z) => { const q = clampPos(p, rot, x, z); return collides(p, rot, q.x, q.z, ignore) ? null : q; };
  let q = tryPos(px ?? c.x, pz ?? c.z); if (q) return q;
  for (let r = .3; r < 14; r += .3) { const n = Math.max(8, Math.round(r * 14)); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; q = tryPos((px ?? c.x) + Math.cos(a) * r * 1.4, (pz ?? c.z) + Math.sin(a) * r); if (q) return q; } }
  return null;
}
function makeNode(it) {
  const p = P(it.pid), v = p.variants[it.v] || p.variants[0];
  const root = new THREE.Group(); root.add(p.build(Mv(v), p.w / 100, p.d / 100, p.h / 100));
  root.userData.item = it; root.position.set(it.x, 0, it.z); root.rotation.y = rad(it.rot); it.node = root;
  return root;
}
function attachItem(it) { GL.itemGroup.add(makeNode(it)); if (S.sel === it) setOutline(it.node, true); }
function detachItem(it) { if (it.node) { GL.itemGroup.remove(it.node); disposeTree(it.node); it.node = null; } }
function rebuildItem(it) { detachItem(it); attachItem(it); markDirty(); }
function syncNode(it) { if (it.node) { it.node.position.set(it.x, 0, it.z); it.node.rotation.y = rad(it.rot); } markDirty(); }
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.BackSide });
function setOutline(root, on) {
  root.traverse(m => { if (m.userData.outline) m.userData.kill = true; });
  const kill = []; root.traverse(m => { if (m.userData.kill) kill.push(m); }); kill.forEach(m => m.parent.remove(m));
  if (!on) return;
  const add = []; root.traverse(m => { if (m.isMesh && !m.userData.outline) add.push(m); });
  for (const m of add) {
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    const o = new THREE.Mesh(m.geometry, OUTLINE); o.userData.outline = true; o.position.copy(m.position); o.rotation.copy(m.rotation);
    const k = 1 + .028 / Math.max(.08, m.geometry.boundingSphere.radius); o.scale.copy(m.scale).multiplyScalar(k); m.parent.add(o);
  }
}
const itemOf = o => { while (o) { if (o.userData && o.userData.item) return o.userData.item; o = o.parent; } return null; };
function worldBox(it) { return it.node ? new THREE.Box3().setFromObject(it.node) : null; }

/* item operations ─ every mutation funnels through afterChange() */
function afterChange(opts = {}) {
  refreshTotals(); refreshWarnings(); positionOverlay(); markDirty(); queueSave();
  if (!opts.quiet) { S.actions++; maybeFeedback(); }
  if (S.stripOpen) S.stripDirty = true;
  if (!opts.keepPanel) renderPanel();
}
function addItem(pid, opts = {}) {
  const p = P(pid); if (!p) return null;
  const rot = opts.rot ?? 0, spot = findSpot(p, rot, opts.x, opts.z);
  if (!spot) { toast('There is no free space left for this item.'); return null; }
  const it = { uid: uid(), pid, v: opts.v || 0, x: spot.x, z: spot.z, rot };
  S.items.push(it); attachItem(it);
  if (!opts.silent) { afterChange({ keepPanel: false }); toastAdded(it); }
  return it;
}
function removeItem(it) {
  if (S.sel === it) { S.sel = null; S.rotating = false; }
  S.items = S.items.filter(i => i !== it); detachItem(it); afterChange(); renderBottomBar();
}
function copyItem(it) {
  const p = P(it.pid), spot = findSpot(p, it.rot, it.x + .45, it.z + .45, null) || findSpot(p, it.rot, it.x - .5, it.z - .5, null);
  if (!spot) return toast('No free space for a copy.');
  const c = { uid: uid(), pid: it.pid, v: it.v, x: spot.x, z: spot.z, rot: it.rot }; S.items.push(c); attachItem(c); select(c); afterChange(); toast('Copy added.');
}
function setVariant(it, vi) { it.v = vi; rebuildItem(it); afterChange({ keepPanel: false }); }
function replaceItem(it, pid) {
  const p = P(pid), spot = findSpot(p, it.rot, it.x, it.z, it);
  if (!spot) return toast('The replacement would not fit here.');
  detachItem(it); it.pid = pid; it.v = 0; it.x = spot.x; it.z = spot.z; attachItem(it); S.itemTab = 'details'; afterChange(); toast(`Swapped to ${p.name}.`);
}
function setRotation(it, d) {
  d = ((d + 540) % 360) - 180; for (const s of [0, 90, -90, 180, -180]) if (Math.abs(d - s) < 3.5) d = s === -180 ? 180 : s;
  const p = P(it.pid), q = clampPos(p, d, it.x, it.z);
  if (collides(p, d, q.x, q.z, it)) return false;
  it.rot = d; it.x = q.x; it.z = q.z; syncNode(it); afterChange({ keepPanel: true, quiet: true }); return true;
}
function moveToWall(it, wall) {
  const p = P(it.pid), R = S.room, rot = { N: 0, E: -90, S: 180, W: 90 }[wall], e = ext(p, rot);
  const along = (wall === 'N' || wall === 'S') ? it.x : it.z;
  const place = a => { const x = wall === 'W' ? R.x0 + e.hw : wall === 'E' ? R.x1 - e.hw : a, z = wall === 'N' ? R.z0 + e.hd : wall === 'S' ? R.z1 - e.hd : a; return clampPos(p, rot, x, z); };
  let q = null;
  for (let k = 0; k < 120 && !q; k++) { for (const sgn of [1, -1]) { const c = place(along + sgn * k * .1); if (!collides(p, rot, c.x, c.z, it)) { q = c; break; } } }
  if (!q) return toast('No free spot along that wall.');
  it.rot = rot; it.x = q.x; it.z = q.z; syncNode(it); afterChange({ keepPanel: true }); renderPanel();
}
function select(it) {
  if (S.sel === it) return;
  if (S.sel && S.sel.node) setOutline(S.sel.node, false);
  S.sel = it; S.rotating = false; S.itemTab = 'details';
  if (it && it.node) setOutline(it.node, true);
  closePopovers(); renderPanel(); renderBottomBar(); renderItemFloat(); positionOverlay(); markDirty();
}
function deselect() { select(null); }
function nudge(it, dx, dz) {
  const p = P(it.pid), q = clampPos(p, it.rot, it.x + dx, it.z + dz);
  if (collides(p, it.rot, q.x, q.z, it)) return; it.x = q.x; it.z = q.z; syncNode(it); afterChange({ keepPanel: true, quiet: true });
}

/* warnings */
function computeWarnings() {
  const out = [], R = S.room;
  for (const it of S.items) {
    const p = P(it.pid); if (p.rug) continue; const e = ext(p, it.rot), n = p.name, tol = .07;
    const box = { x0: it.x - e.hw, x1: it.x + e.hw, z0: it.z - e.hd, z1: it.z + e.hd };
    for (const f of R.feats) {
      const L = wallLen(f.wall), a = f.u - f.w / 2, b = f.u + f.w / 2, base = (f.wall === 'N' || f.wall === 'S') ? R.x0 : R.z0;
      let touch, lo, hi;
      if (f.wall === 'N') { touch = box.z0 - R.z0 < tol; lo = box.x0 - base; hi = box.x1 - base; }
      if (f.wall === 'S') { touch = R.z1 - box.z1 < tol; lo = box.x0 - base; hi = box.x1 - base; }
      if (f.wall === 'W') { touch = box.x0 - R.x0 < tol; lo = box.z0 - base; hi = box.z1 - base; }
      if (f.wall === 'E') { touch = R.x1 - box.x1 < tol; lo = box.z0 - base; hi = box.z1 - base; }
      if (touch && lo < b && hi > a) {
        if (f.kind === 'door') out.push({ it, text: `${n} is blocking a door on the ${WALL_NAME[f.wall].toLowerCase()}.` });
        else if (p.h / 100 > (f.sill || 0) + .05) out.push({ it, text: `${n} overlaps a window on the ${WALL_NAME[f.wall].toLowerCase()}.` });
      }
    }
    if (p.h / 100 > R.h - .02) out.push({ it, text: `${n} is as tall as the ceiling (${fmtLen(R.h)}).` });
    if (p.cat === 'Wardrobes') { const clear = Math.min(Math.abs(R.z1 - box.z1), 9); void clear; }
  }
  return out;
}
let warnCache = [];
function refreshWarnings() { warnCache = computeWarnings(); renderWarnings(); }

/* totals */
const totalPrice = () => S.items.reduce((s, it) => s + P(it.pid).price, 0);
function refreshTotals() {
  $('#total').innerHTML = `Rs.<b>${money(totalPrice())}</b>`;
  $('#btn-summary').disabled = !S.items.length;
}

/* units */
function fmtLen(m) {
  if (S.units === 'm') return m.toFixed(2) + ' m';
  const t = Math.round(m * 39.3701); return `${Math.floor(t / 12)}' ${t % 12}"`;
}
const fmtCm = cm => S.units === 'm' ? `${Math.round(cm)} cm` : `${Math.round(cm / 2.54)}"`;

/* ═══════════════ 6c · picking, dragging, orbit ═══════════════ */
function setNDC(e) {
  const r = GL.renderer.domElement.getBoundingClientRect();
  GL.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  GL.ray.setFromCamera(GL.ndc, GL.cam);
}
function pickItem(e) {
  setNDC(e);
  const hits = GL.ray.intersectObjects(GL.itemGroup.children, true).filter(h => !h.object.userData.outline);
  return hits.length ? itemOf(hits[0].object) : null;
}
function pickFeature(e) {
  setNDC(e);
  const objs = GL.refs.feats, hits = GL.ray.intersectObjects(objs, true);
  for (const h of hits) { let o = h.object; while (o && !(o.userData && o.userData.feature)) o = o.parent; if (o) return o.userData.feature; }
  return null;
}
const PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function groundPoint(e) { setNDC(e); const v = new THREE.Vector3(); return GL.ray.ray.intersectPlane(PLANE, v) ? v : null; }

const DRAG = { mode: null, id: null, sx: 0, sy: 0, moved: false, item: null, offx: 0, offz: 0, az: 0, el: 0, px: 0, pz: 0, yaw: 0, pitch: 0, handle: null };
function bindCanvas() {
  const cv = $('#gl');
  cv.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    cv.setPointerCapture(e.pointerId); cv.focus({ preventScroll: true }); closePopovers();
    Object.assign(DRAG, { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, item: null });
    if (S.mode === 'edit') {
      if (S.edit.step === 2) {
        const f = pickFeature(e);
        if (f) { selectFeature(f); const g = groundPoint(e); editPush(); DRAG.mode = 'feat'; DRAG.feat = f; DRAG.g0 = g; DRAG.u0 = f.u; return; }
      }
      DRAG.mode = 'cam'; DRAG.az = CAM.az; DRAG.el = CAM.el; DRAG.px = CAM.px; DRAG.pz = CAM.pz; DRAG.yaw = CAM.yaw; DRAG.pitch = CAM.pitch; return;
    }
    const it = e.button === 0 ? pickItem(e) : null;
    if (it) {
      select(it); const g = groundPoint(e);
      DRAG.mode = 'item'; DRAG.item = it; DRAG.offx = g ? it.x - g.x : 0; DRAG.offz = g ? it.z - g.z : 0; cv.style.cursor = 'grabbing'; return;
    }
    DRAG.mode = 'cam'; DRAG.az = CAM.az; DRAG.el = CAM.el; DRAG.px = CAM.px; DRAG.pz = CAM.pz; DRAG.yaw = CAM.yaw; DRAG.pitch = CAM.pitch;
  });
  cv.addEventListener('pointermove', e => {
    if (DRAG.mode == null || e.pointerId !== DRAG.id) { hoverCursor(e); return; }
    const dx = e.clientX - DRAG.sx, dy = e.clientY - DRAG.sy;
    if (!DRAG.moved && Math.hypot(dx, dy) < 4) return; DRAG.moved = true;
    if (DRAG.mode === 'item') dragItem(e);
    else if (DRAG.mode === 'feat') dragFeature(e);
    else if (DRAG.mode === 'cam') {
      if (S.view === 'dollhouse') { CAM.az = DRAG.az - dx * .4; CAM.el = clamp(DRAG.el + dy * .3, 8, 86); }
      else if (S.view === 'top') { const hh = topViewHeight(), k = hh / GL.vh; CAM.px = DRAG.px - dx * k; CAM.pz = DRAG.pz - dy * k; }
      else { CAM.yaw = clamp(DRAG.yaw - dx * .18, -80, 80); CAM.pitch = clamp(DRAG.pitch - dy * .12, -30, 30); }
      updateCamera(); markDirty(); positionOverlay();
    }
  });
  const end = e => {
    if (e.pointerId !== DRAG.id) return;
    const was = DRAG.mode, moved = DRAG.moved; cv.style.cursor = '';
    if (was === 'item' && moved) afterChange({ keepPanel: true });
    if (was === 'feat' && !moved) S.edit.undo.pop();
    if (was === 'feat' && moved) editCommit();
    if (was === 'cam' && !moved) { if (S.mode === 'design') deselect(); else if (S.mode === 'edit' && S.edit.step === 2) selectFeature(null); }
    if (was === 'item' && !moved) { renderItemFloat(); }
    DRAG.mode = null; DRAG.id = null;
  };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    // Trackpad pinch arrives as many small wheel events with ctrlKey set; a mouse wheel notch is one big event.
    // Scale zoom by the actual delta (and damp it) instead of a fixed step per event.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const dy = clamp(e.deltaY * unit, -60, 60), k = e.ctrlKey ? .0045 : .0012;
    zoomScale(Math.exp(dy * k));
  }, { passive: false });
}
function hoverCursor(e) {
  if (S.mode !== 'design' || DRAG.mode) return;
  $('#gl').style.cursor = pickItem(e) ? 'grab' : '';
}
function dragItem(e) {
  const it = DRAG.item, g = groundPoint(e); if (!g) return;
  const p = P(it.pid), want = clampPos(p, it.rot, g.x + DRAG.offx, g.z + DRAG.offz);
  const tries = [want, { x: want.x, z: it.z }, { x: it.x, z: want.z }];
  for (const t of tries) { const q = clampPos(p, it.rot, t.x, t.z); if (!collides(p, it.rot, q.x, q.z, it)) { it.x = q.x; it.z = q.z; break; } }
  syncNode(it); positionOverlay(); refreshWarnings();
}
function dragFeature(e) {
  const f = DRAG.feat, R = S.room, L = wallLen(f.wall), g = groundPoint(e); if (!g) return;
  const base = (f.wall === 'N' || f.wall === 'S') ? R.x0 : R.z0, along = (f.wall === 'N' || f.wall === 'S') ? g.x : g.z;
  const d0 = (f.wall === 'N' || f.wall === 'S') ? DRAG.g0.x : DRAG.g0.z;
  f.u = clamp(DRAG.u0 + (along - d0), f.w / 2 + .1, L - f.w / 2 - .1); void base;
  buildRoom(); markDirty(); positionOverlay();
}

/* ═══════════════ 7 · render pipeline & overlays ═══════════════ */
const _v = new THREE.Vector3();
function proj(x, y, z) { _v.set(x, y, z).project(GL.cam); return { x: (_v.x + 1) / 2 * GL.vw, y: (1 - _v.y) / 2 * GL.vh, ok: _v.z < 1 }; }
function renderFrame() {
  GL.renderer.render(GL.scene, GL.cam);
  if (S.stripOpen && S.stripDirty && !DRAG.mode) { S.stripDirty = false; renderStrip(); }
  positionOverlay();
}
function positionOverlay() { if (!S.room) return; positionItemFloat(); drawDims(); positionHandles(); }

function renderStrip() {
  const strip = $('#strip'); if (!strip || strip.hidden) return;
  const saveView = S.view, saveCam = GL.cam, cams = GL.inside, w = GL.vw, hh = GL.vh;
  const keep = { fov: cams.fov, aspect: cams.aspect };
  GL.refs.ceil.visible = true; for (const k of WALLS) GL.refs.walls[k].visible = true; GL.lamp.intensity = .55;
  const saveSel = S.sel; if (saveSel && saveSel.node) setOutline(saveSel.node, false);
  cams.fov = 74; cams.aspect = w / hh; cams.updateProjectionMatrix();
  const cvs = $$('canvas', strip);
  WALLS.forEach((k, i) => {
    setInsideCam(cams, k, 0, 0); cams.updateMatrixWorld(); GL.renderer.render(GL.scene, cams);
    const t = cvs[i]; if (!t) return; const g = t.getContext('2d'), ta = t.width / t.height, sa = w / hh;
    let sw = w, sh = hh, sx = 0, sy = 0; if (sa > ta) { sw = hh * ta; sx = (w - sw) / 2; } else { sh = w / ta; sy = (hh - sh) / 2; }
    const k2 = GL.renderer.domElement.width / w; g.drawImage(GL.renderer.domElement, sx * k2, sy * k2, sw * k2, sh * k2, 0, 0, t.width, t.height);
  });
  cams.fov = keep.fov; cams.aspect = keep.aspect; cams.updateProjectionMatrix();
  if (saveSel && saveSel.node) setOutline(saveSel.node, true);
  S.view = saveView; GL.cam = saveCam; updateCamera(); GL.renderer.render(GL.scene, GL.cam);
}
function buildStrip() {
  const strip = $('#strip'); strip.innerHTML = '';
  WALLS.forEach(k => {
    const c = h('canvas', { width: 420, height: 256 });
    strip.append(h('button', { class: S.view === 'inside' && S.insideWall === k ? 'on' : '', title: WALL_NAME[k], onclick: () => { S.insideWall = k; CAM.yaw = 0; CAM.pitch = 0; setView('inside'); buildStrip(); S.stripDirty = true; markDirty(); } }, c, h('span', null, WALL_NAME[k])));
  });
}
function toggleStrip(on) {
  S.stripOpen = on ?? !S.stripOpen; $('#strip').hidden = !S.stripOpen; $('#bb-side').classList.toggle('on', S.stripOpen);
  if (S.stripOpen) { buildStrip(); S.stripDirty = true; markDirty(); }
  $('#zoom').style.bottom = ''; $('#zoom').style.top = '24px'; positionOverlay();
}

function positionItemFloat() {
  const box = $('#itemfloat'), it = S.sel;
  if (!it || !it.node || S.mode !== 'design' || S.view === 'inside' && false) { box.hidden = true; return; }
  box.hidden = false;
  const b = worldBox(it); let minX = 1e9, maxX = -1e9, maxY = -1e9;
  for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const p = proj(x, y, z); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const w = box.offsetWidth || 300, hh = box.offsetHeight || 120, strip = S.stripOpen ? 150 : 0;
  box.style.left = clamp((minX + maxX) / 2, w / 2 + 8, GL.vw - w / 2 - 8) + 'px';
  box.style.top = clamp(maxY - 20, 8, GL.vh - hh - 8 - strip) + 'px';
}
function renderItemFloat() {
  const box = $('#itemfloat'), it = S.sel;
  if (!it) { box.hidden = true; return; }
  const p = P(it.pid), sw = $('#swatches'), pill = $('#pill'), rb = $('#rotbox');
  sw.innerHTML = ''; sw.hidden = S.rotating; rb.hidden = !S.rotating;
  p.variants.forEach((v, i) => sw.append(h('button', { class: 'sw' + (i === it.v ? ' on' : ''), title: v.n, 'aria-label': v.n, onclick: () => setVariant(it, i) }, h('i', { style: `background:${v.sw}` }))));
  const b = (icon, label, fn, on) => h('button', { class: on ? 'on' : '', onclick: fn, title: label, html: ico(icon, 22) + `<span>${label}</span>` });
  pill.innerHTML = '';
  pill.append(b('bagplus', 'Add to bag', () => addToBag([{ pid: it.pid, v: it.v, qty: 1 }])), h('span', { class: 'psep' }),
    b('rotate', 'Rotate', () => { S.rotating = !S.rotating; renderItemFloat(); positionOverlay(); }, S.rotating),
    b('swap', 'Replace', () => { S.itemTab = 'swap'; S.rotating = false; renderItemFloat(); renderPanel(true); }),
    b('goes', 'Goes with', () => { S.itemTab = 'goes'; S.rotating = false; renderItemFloat(); renderPanel(true); }),
    b('copy', 'Make copy', () => copyItem(it)), b('trash', 'Remove', () => removeItem(it)));
  const sl = $('#rotslider'); sl.value = it.rot; $('#rotval').textContent = Math.round(it.rot);
  box.hidden = false; positionOverlay();
}
function bindRotate() {
  const sl = $('#rotslider');
  sl.addEventListener('input', () => {
    if (!S.sel) return; const ok = setRotation(S.sel, +sl.value);
    if (!ok) sl.value = S.sel.rot; $('#rotval').textContent = Math.round(S.sel.rot);
  });
  sl.addEventListener('change', () => { if (S.sel) { sl.value = S.sel.rot; $('#rotval').textContent = Math.round(S.sel.rot); } });
}

/* dimension overlay */
function gapsFor(it) {
  const p = P(it.pid), e = ext(p, it.rot), R = S.room, out = [];
  const box = { x0: it.x - e.hw, x1: it.x + e.hw, z0: it.z - e.hd, z1: it.z + e.hd };
  const others = S.items.filter(o => o !== it && !P(o.pid).rug).map(o => { const f = ext(P(o.pid), o.rot); return { x0: o.x - f.hw, x1: o.x + f.hw, z0: o.z - f.hd, z1: o.z + f.hd }; });
  const dir = (edge, wallPos, ok, axis, sign) => {
    let best = Math.abs(edge - wallPos), to = wallPos;
    for (const o of others) { if (!ok(o)) continue; const far = axis === 'x' ? (sign < 0 ? o.x1 : o.x0) : (sign < 0 ? o.z1 : o.z0); const g = (edge - far) * sign * -1 * -1; const gg = sign < 0 ? edge - far : far - edge; if (gg >= -.001 && gg < best) { best = gg; to = far; } void g; }
    if (best > .03) out.push(axis === 'x' ? { ax: to, az: it.z, bx: edge, bz: it.z, len: best } : { ax: it.x, az: to, bx: it.x, bz: edge, len: best });
  };
  dir(box.x0, R.x0, o => o.z1 > box.z0 && o.z0 < box.z1, 'x', -1); dir(box.x1, R.x1, o => o.z1 > box.z0 && o.z0 < box.z1, 'x', 1);
  dir(box.z0, R.z0, o => o.x1 > box.x0 && o.x0 < box.x1, 'z', -1); dir(box.z1, R.z1, o => o.x1 > box.x0 && o.x0 < box.x1, 'z', 1);
  return out;
}
function drawDims() {
  const svg = $('#dims'), lab = $('#labels'), R = S.room; let s = '', l = '';
  const add = (x, y, t, cls = '') => { l += `<div class="lbl ${cls}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px">${t}</div>`; };
  const line = (a, b, cls = '', ticks = true) => {
    s += `<line class="${cls}" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`;
    if (ticks) { const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1, px = -dy / n * 6, py = dx / n * 6; for (const q of [a, b]) s += `<line class="${cls}" x1="${(q.x - px).toFixed(1)}" y1="${(q.y - py).toFixed(1)}" x2="${(q.x + px).toFixed(1)}" y2="${(q.y + py).toFixed(1)}"/>`; }
  };
  if (S.view !== 'inside') {
    const showRoom = S.view === 'top' || S.measure.room || (S.mode === 'edit' && S.edit && S.edit.step === 1);
    if (showRoom) {
      const o = .45, W = R.x1 - R.x0, D = R.z1 - R.z0, c = roomCenter();
      const seg = [[{ x: R.x0, z: R.z0 - o }, { x: R.x1, z: R.z0 - o }, W], [{ x: R.x0, z: R.z1 + o }, { x: R.x1, z: R.z1 + o }, W], [{ x: R.x0 - o, z: R.z0 }, { x: R.x0 - o, z: R.z1 }, D], [{ x: R.x1 + o, z: R.z0 }, { x: R.x1 + o, z: R.z1 }, D]];
      for (const [a, b, len] of seg) { const pa = proj(a.x, 0, a.z), pb = proj(b.x, 0, b.z); line(pa, pb, ''); add((pa.x + pb.x) / 2, (pa.y + pb.y) / 2, fmtLen(len)); }
      if (S.mode === 'edit' && S.edit.sub === 'ceil') { const p = proj(R.x0, R.h / 2, c.z); add(p.x - 40, p.y, 'Ceiling ' + fmtLen(R.h)); }
    }
    if (S.measure.prod) for (const it of S.items) { const p = P(it.pid); if (p.rug) continue; const q = proj(it.x, p.h / 100 + .05, it.z); add(q.x, q.y - 4, `${fmtCm(p.w)} × ${fmtCm(p.d)} × ${fmtCm(p.h)}`, 'prod'); }
    if (S.measure.space && S.mode === 'design') {
      const list = S.sel ? [S.sel] : S.items.filter(i => !P(i.pid).rug);
      for (const it of list) for (const g of gapsFor(it)) { const a = proj(g.ax, .02, g.az), b = proj(g.bx, .02, g.bz); line(a, b, 'gap'); add((a.x + b.x) / 2, (a.y + b.y) / 2, fmtLen(g.len), 'gap'); }
    }
    if (S.mode === 'edit' && S.edit.feat) {
      const f = S.edit.feat, fg = GL.refs.feats.find(g => g.userData.feature === f);
      if (fg) {
        fg.updateWorldMatrix(true, false);
        const pts = [[-f.w / 2, f.sill || 0], [f.w / 2, f.sill || 0], [f.w / 2, (f.sill || 0) + f.h], [-f.w / 2, (f.sill || 0) + f.h]].map(([x, y]) => { const v = new THREE.Vector3(x, y, .06).applyMatrix4(fg.matrixWorld); return proj(v.x, v.y, v.z); });
        s += `<polygon points="${pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')}" fill="rgba(255,212,0,.12)" stroke="#ffd400" stroke-width="3"/>`;
      }
    }
  }
  svg.innerHTML = s; lab.innerHTML = l;
}
/* edit-mode drag handles (walls / ceiling) */
let FREEZE = null;
function positionHandles() {
  const root = $('#handles');
  if (S.mode !== 'edit' || S.edit.step !== 1) { if (root.firstChild) root.innerHTML = ''; return; }
  const R = S.room, c = roomCenter();
  const specs = S.edit.sub === 'plan'
    ? [['N', c.x, 0, R.z0, 'v'], ['S', c.x, 0, R.z1, 'v'], ['W', R.x0, 0, c.z, 'h'], ['E', R.x1, 0, c.z, 'h']]
    : [['C', R.x0, R.h, c.z, 'v'], ['C2', c.x, R.h, R.z0, 'v']];
  if (root.children.length !== specs.length || root.dataset.sub !== S.edit.sub) {
    root.innerHTML = ''; root.dataset.sub = S.edit.sub;
    specs.forEach(([k, , , , cls]) => { const el = h('button', { class: 'handle ' + cls, 'data-k': k, 'aria-label': k.startsWith('C') ? 'Drag to change ceiling height' : 'Drag to move ' + WALL_NAME[k] }); el.addEventListener('pointerdown', handleDown); root.append(el); });
  }
  specs.forEach(([k, x, y, z], i) => { const p = proj(x, y, z); const el = root.children[i]; el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; });
}
function handleDown(e) {
  e.preventDefault(); e.stopPropagation(); const el = e.currentTarget, k = el.dataset.k; el.setPointerCapture(e.pointerId);
  editPush(); const R0 = JSON.stringify(S.room), y0 = e.clientY, h0 = S.room.h; let moved = false;
  FREEZE = { cx: roomCenter().x, cz: roomCenter().z, hh: topViewHeight() };
  const mv = ev => {
    moved = true; const R = S.room;
    if (k === 'C' || k === 'C2') { R.h = clamp(h0 + (y0 - ev.clientY) * .012, 2.2, 3.8); buildRoom(); setTextCeil(); return; }
    const g = groundPoint(ev); if (!g) return;
    if (k === 'N') R.z0 = clamp(g.z, R.z1 - 12, R.z1 - 2.2); if (k === 'S') R.z1 = clamp(g.z, R.z0 + 2.2, R.z0 + 12);
    if (k === 'W') R.x0 = clamp(g.x, R.x1 - 12, R.x1 - 2.2); if (k === 'E') R.x1 = clamp(g.x, R.x0 + 2.2, R.x0 + 12);
    for (const f of R.feats) { const L = wallLen(f.wall); f.u = clamp(f.u, f.w / 2 + .1, L - f.w / 2 - .1); }
    buildRoom(); updateEditUI();
  };
  const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); FREEZE = null; if (!moved) { S.edit.undo.pop(); } else void R0; updateCamera(); markDirty(); updateEditUI(); };
  el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}

/* ═══════════════ 7b · product thumbnails (offscreen renderer) ═══════════════ */
const TH = { r: null, scene: null, cam: null, cache: new Map(), q: [], busy: false, failed: false };
function thumbInit() {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 240;
    TH.r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
    TH.r.setSize(240, 240, false); TH.r.outputColorSpace = THREE.SRGBColorSpace; TH.r.setClearColor(0x000000, 0);
    TH.scene = new THREE.Scene(); TH.scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc3b0, .95));
    const d = new THREE.DirectionalLight(0xffffff, .75); d.position.set(3, 6, 4); TH.scene.add(d);
    TH.cam = new THREE.PerspectiveCamera(26, 1, .05, 60);
  } catch (e) { TH.failed = true; }
}
function thumbRender(pid, vi) {
  const p = P(pid), g = p.build(Mv(p.variants[vi]), p.w / 100, p.d / 100, p.h / 100);
  TH.scene.add(g); const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  const dir = (p.rug ? new THREE.Vector3(.35, 1.05, .75) : new THREE.Vector3(.62, .46, .9)).normalize(), dist = r / Math.sin(rad(13)) * 1.02;
  TH.cam.position.copy(c).addScaledVector(dir, dist); TH.cam.lookAt(c); TH.r.render(TH.scene, TH.cam);
  const url = TH.r.domElement.toDataURL('image/png'); TH.scene.remove(g); disposeTree(g); return url;
}
function thumb(pid, vi, cb) {
  const key = pid + '|' + vi; if (TH.cache.has(key)) return cb(TH.cache.get(key));
  if (TH.failed) return;
  TH.q.push([pid, vi, cb]); if (!TH.busy) { TH.busy = true; setTimeout(pump, 0); }
}
function pump() {
  const job = TH.q.shift(); if (!job) { TH.busy = false; return; }
  const [pid, vi, cb] = job, key = pid + '|' + vi;
  try { if (!TH.cache.has(key)) TH.cache.set(key, thumbRender(pid, vi)); cb(TH.cache.get(key)); } catch (e) { /* skip */ }
  setTimeout(pump, 0);
}
function thumbImg(pid, vi = 0, cls) {
  const img = h('img', { alt: '', draggable: 'false', class: cls || '' }); const key = pid + '|' + vi;
  if (TH.cache.has(key)) img.src = TH.cache.get(key); else { img.style.visibility = 'hidden'; thumb(pid, vi, u => { img.src = u; img.style.visibility = ''; }); }
  return img;
}

/* ═══════════════ 7c · side panel ═══════════════ */
const panelScroll = {};
function stars(n) { return `<span class="stars" aria-label="${n} out of 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'f' : ''}">★</i>`).join('')}</span>`; }
function renderPanel(keepScroll) {
  const root = $('#panel'); if (!root || !S.room) return;
  const sc = $('.pscroll', root), key = root.dataset.key;
  if (sc && key) panelScroll[key] = sc.scrollTop;
  root.innerHTML = '';
  let k;
  if (S.mode === 'edit') { k = 'wiz' + S.edit.step; renderWizard(root); }
  else if (S.sel) { k = 'item'; renderItemOptions(root); }
  else { k = S.tab; renderTabs(root); }
  root.dataset.key = k;
  const sc2 = $('.pscroll', root); if (sc2) sc2.scrollTop = (keepScroll && k === key) ? (panelScroll[k] || 0) : (k === key ? panelScroll[k] || 0 : 0);
  hydrateIcons(root);
}
function renderTabs(root) {
  const tab = (id, icon, label) => h('button', { class: S.tab === id ? 'on' : '', onclick: () => { S.tab = id; S.menu = null; renderPanel(); } }, h('span', { html: ico(icon, 20) }), label);
  root.append(h('div', { class: 'tabs', role: 'tablist' }, tab('add', 'plus', 'Add'), tab('list', 'list', 'List'), tab('favs', 'heart', 'Favorites')));
  const sc = h('div', { class: 'pscroll' }); root.append(sc);
  if (S.tab === 'add') renderAdd(sc); else if (S.tab === 'list') renderList(sc); else renderFavs(sc);
}
function matches(p) {
  const q = S.query.trim().toLowerCase();
  if (q) return (p.name + ' ' + p.type + ' ' + p.cat + ' ' + p.variants.map(v => v.n).join(' ')).toLowerCase().includes(q);
  if (!p.rooms.includes(S.roomType)) return false;
  return !S.cats || !S.cats.size || S.cats.has(p.cat);
}
function pcard(p, o = {}) {
  const vi = o.vi ?? 0, v = p.variants[vi];
  const card = h('div', { class: 'pcard' });
  const img = h('div', { class: 'pimg' }, thumbImg(p.id, vi));
  const act = h('button', { class: 'padd', 'aria-label': o.swap ? 'Swap with this item' : `Add ${p.name} to room`, title: o.swap ? 'Swap' : 'Add to room', html: ico(o.swap ? 'swap' : 'plus', 22), onclick: e => { e.stopPropagation(); o.onAdd ? o.onAdd(p) : addItem(p.id); } });
  const hb = h('button', { class: 'pheart' + (S.favs.has(p.id) ? ' on' : ''), 'aria-label': 'Favourite', html: ico('heart', 20), onclick: e => { e.stopPropagation(); toggleFav(p.id); hb.classList.toggle('on', S.favs.has(p.id)); } });
  img.append(hb, act); img.addEventListener('dblclick', () => (o.onAdd ? o.onAdd(p) : addItem(p.id)));
  card.append(img, h('div', { class: 'pname' }, p.name), h('div', { class: 'pdesc' }, `${p.type}, ${v.n}, ${p.size}`),
    h('div', { class: 'pprice', html: priceHTML(p.price) }), h('div', { class: 'avail' }, h('i'), 'Delivery availability unknown'), h('div', { class: 'avail' }, h('i'), 'Stock availability unknown'));
  return card;
}
function toggleFav(id) { S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); store.set('favs', [...S.favs]); if (S.tab === 'favs' || S.sel) renderPanel(true); }
function renderAdd(sc) {
  const cfg = CATS[S.roomType];
  sc.append(h('div', { class: 'psec', style: 'padding-bottom:0' },
    h('label', { class: 'search' }, h('span', { html: ico('search', 20) }), h('input', { type: 'search', placeholder: 'Search…', value: S.query, 'aria-label': 'Search products', oninput: e => { S.query = e.target.value; clearTimeout(S._qt); S._qt = setTimeout(() => { renderPanel(true); const i = $('.search input'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 180); } })),
    (() => {
      const wrap = h('div', { class: 'roomtype' });
      const btn = h('button', { class: 'pillf', style: 'background:none;padding:0;font-size:17px;height:auto', 'aria-haspopup': 'listbox', onclick: () => { S.menu = S.menu === 'room' ? null : 'room'; renderPanel(true); } }, cfg.label, h('span', { html: ico('chev', 20) }));
      wrap.append(btn);
      if (S.menu === 'room') wrap.append(h('div', { class: 'menu', role: 'listbox' }, ROOM_ORDER.map(k => h('button', { role: 'option', onclick: () => { S.roomType = k; S.cats = new Set(); S.menu = null; S.query = ''; queueSave(); renderPanel(); } },
        h('span', { class: 'rt-thumb', style: `background:${CATS[k].color}` }, CATS[k].label[0]), CATS[k].label, k === S.roomType ? h('span', { class: 'ck', html: ico('check', 20) }) : null))));
      return wrap;
    })(),
    h('div', { class: 'pills' }, cfg.cats.slice(0, 3).map(c => h('button', { class: 'pillf' + (S.cats && S.cats.size === 1 && S.cats.has(c) ? ' on' : ''), onclick: () => { S.cats = (S.cats && S.cats.size === 1 && S.cats.has(c)) ? new Set() : new Set([c]); renderPanel(); } }, c)),
      (() => {
        const w = h('span', { style: 'position:relative' });
        w.append(h('button', { class: 'pillf' + (S.cats && S.cats.size > 1 ? ' on' : ''), onclick: () => { S.menu = S.menu === 'cats' ? null : 'cats'; renderPanel(true); } }, 'All categories', h('span', { html: ico('chev', 18) })));
        if (S.menu === 'cats') w.append(h('div', { class: 'menu' }, cfg.cats.map(c => h('label', null, h('input', { type: 'checkbox', checked: !!(S.cats && S.cats.has(c)), onchange: e => { S.cats = S.cats || new Set(); e.target.checked ? S.cats.add(c) : S.cats.delete(c); renderPanel(true); } }), c))));
        return w;
      })())));
  if (!S.noticeGone) sc.append(h('div', { class: 'notice' }, h('span', { html: ico('info', 22), style: 'color:var(--blue)' }), h('div', null, h('b', null, 'Final Pricing may differ'), 'Please review pricing details during checkout.'), h('button', { 'aria-label': 'Dismiss', html: ico('close', 16), onclick: () => { S.noticeGone = true; renderPanel(true); } })));
  const list = PRODUCTS.filter(matches);
  if (!list.length) sc.append(h('div', { class: 'empty' }, 'No products match. Try another category or search.'));
  else sc.append(h('div', { class: 'pgrid' }, list.map(p => pcard(p))));
}
function renderFavs(sc) {
  const list = PRODUCTS.filter(p => S.favs.has(p.id));
  if (!list.length) sc.append(h('div', { class: 'empty' }, h('div', { html: ico('heart', 36), style: 'opacity:.4' }), h('p', null, 'No favourites yet. Tap the heart on any product to save it here.')));
  else sc.append(h('div', { class: 'pgrid', style: 'padding-top:20px' }, list.map(p => pcard(p))));
}
function renderList(sc) {
  if (!S.items.length) { sc.append(h('div', { class: 'empty' }, h('div', { html: ico('list', 36), style: 'opacity:.4' }), h('p', null, 'Your room is empty. Add products from the Add tab and they will be listed here with prices.'))); return; }
  const groups = {}; S.items.forEach(it => { (groups[P(it.pid).cat] = groups[P(it.pid).cat] || []).push(it); });
  for (const cat of Object.keys(groups)) {
    const its = groups[cat];
    sc.append(h('div', { class: 'lgroup' }, h('h4', null, cat, h('button', { class: 'pill-btn sm', onclick: () => addToBag(its.map(i => ({ pid: i.pid, v: i.v, qty: 1 }))) }, `Add ${its.length} item${its.length > 1 ? 's' : ''} to bag`)),
      its.map(it => { const p = P(it.pid); return h('div', { class: 'lrow', onclick: () => select(it), role: 'button', tabindex: 0, onkeydown: e => { if (e.key === 'Enter') select(it); } }, thumbImg(p.id, it.v), h('div', null, h('b', null, p.name), h('div', null, `${p.type}, ${p.variants[it.v].n}`)), h('span', { class: 'p', html: priceHTML(p.price) })); })));
    if (cat === 'Beds') sc.append(h('div', { class: 'promo' }, h('b', null, 'Planning to buy a mattress too?'), h('p', { style: 'margin:6px 0' }, 'Our comfort guide helps you choose the right firmness.'), h('a', { href: '#', onclick: e => { e.preventDefault(); toast('Comfort guide is a demo link.'); } }, 'Read the guide')));
  }
  sc.append(h('div', { class: 'sticky' }, h('button', { class: 'cta', onclick: () => addToBag(S.items.map(i => ({ pid: i.pid, v: i.v, qty: 1 }))), html: ico('bagplus', 22) + ' Add all to shopping bag' })));
}
function renderItemOptions(root) {
  const it = S.sel, p = P(it.pid), v = p.variants[it.v];
  root.append(h('div', { class: 'ihead' }, h('button', { class: 'x', 'aria-label': 'Close item options', html: ico('close', 18), onclick: deselect }), h('h3', null, 'Item options')));
  const sc = h('div', { class: 'pscroll' }); root.append(sc);
  const fav = h('button', { class: 'pheart' + (S.favs.has(p.id) ? ' on' : ''), style: 'position:static;opacity:1;width:36px;height:36px', 'aria-label': 'Favourite', html: ico('heart', 22), onclick: () => { toggleFav(p.id); fav.classList.toggle('on', S.favs.has(p.id)); } });
  const pic = h('div', { class: 'pic' }, thumbImg(p.id, it.v),
    h('button', { class: 'padd', style: 'left:6px;right:auto;top:50%;bottom:auto;margin-top:-20px;opacity:1;transform:none;width:32px;height:32px', 'aria-label': 'Previous variant', html: ico('chevl', 18), onclick: () => setVariant(it, (it.v + p.variants.length - 1) % p.variants.length) }),
    h('button', { class: 'padd', style: 'opacity:1;transform:none;width:32px;height:32px;top:50%;bottom:auto;margin-top:-20px', 'aria-label': 'Next variant', html: ico('chevr', 18), onclick: () => setVariant(it, (it.v + 1) % p.variants.length) }));
  sc.append(h('div', { class: 'icard' }, pic, h('div', null, h('div', { style: 'display:flex;justify-content:space-between;align-items:flex-start' }, h('h4', null, p.name), fav),
    h('div', { class: 'd' }, `${p.type}, ${v.n}, ${p.size}`), h('div', { style: 'display:flex;gap:12px;align-items:center' }, h('span', { class: 'pr', html: priceHTML(p.price) }), h('span', { html: stars(p.rating) + ` <span class="muted">(${p.reviews})</span>` })),
    h('button', { class: 'linkbtn', onclick: () => showDetails(p), html: ico('ext', 18) + 'Show More Details' }))));
  sc.append(h('div', { style: 'display:flex;gap:8px;padding:0 24px 12px' }, p.variants.map((vv, i) => { const b = h('button', { class: 'sw' + (i === it.v ? ' on' : ''), style: 'width:40px;height:40px;box-shadow:none;border-color:' + (i === it.v ? '#111' : '#ddd'), title: vv.n, 'aria-label': vv.n, onclick: () => setVariant(it, i) }, h('i', { style: `background:${vv.sw}` })); return b; })));
  const inBag = S.bag.some(l => l.pid === it.pid && l.v === it.v);
  sc.append(h('button', { class: 'cta' + (inBag ? ' added' : ''), onclick: () => addToBag([{ pid: it.pid, v: it.v, qty: 1 }]), html: ico(inBag ? 'check' : 'bagplus', 22) + (inBag ? ' In your bag — add another' : ' Add to bag') }));
  sc.append(h('div', { class: 'sub' }, 'How to get it'), h('div', { class: 'how' }, h('span', null, h('i'), 'Delivery'), h('span', null, h('i'), 'Collect at pick-up point'), h('span', null, h('i'), 'Store pick-up')));
  const open = S.sizeOpen;
  sc.append(h('div', { class: 'acc' }, h('button', { 'aria-expanded': open, onclick: () => { S.sizeOpen = !open; renderPanel(true); } }, h('div', null, h('b', null, 'Size'), h('span', { class: 's' }, p.size)), h('span', { html: ico(open ? 'chev' : 'chevr', 22) })),
    open ? h('div', { class: 'abody' }, `Footprint ${fmtCm(p.w)} wide × ${fmtCm(p.d)} deep, ${fmtCm(p.h)} high. Currently rotated ${Math.round(it.rot)}°.`, h('br'), `Variants: ${p.variants.map(x => x.n).join(' · ')}`) : null));
  sc.append(h('div', { class: 'ptabs', role: 'tablist' },
    ['swap', 'goes'].map(t => h('button', { class: 'pillf' + (S.itemTab === t ? ' on' : ''), role: 'tab', 'aria-selected': S.itemTab === t, onclick: () => { S.itemTab = S.itemTab === t ? 'details' : t; renderPanel(true); } }, t === 'swap' ? 'Swap with similar' : 'Goes well with'))));
  if (S.itemTab === 'swap') {
    const sim = PRODUCTS.filter(q => q.cat === p.cat && q.id !== p.id);
    sc.append(sim.length ? h('div', { class: 'pgrid', role: 'tabpanel' }, sim.map(q => pcard(q, { swap: true, onAdd: x => replaceItem(it, x.id) }))) : h('div', { class: 'empty' }, 'No similar items available.'));
  } else if (S.itemTab === 'goes') {
    const g = (p.goes || []).map(P).filter(Boolean);
    sc.append(g.length ? h('div', { class: 'pgrid', role: 'tabpanel' }, g.map(q => pcard(q))) : h('div', { class: 'empty' }, 'No suggestions for this item.'));
  }
}
function showDetails(p) {
  modal(h('div', null, h('h3', null, p.name), h('p', { class: 'muted' }, `${p.type} · ${p.cat}`),
    h('div', { style: 'display:grid;grid-template-columns:200px 1fr;gap:20px' }, h('div', { style: 'background:#fafafa;border-radius:8px;display:grid;place-items:center' }, thumbImg(p.id, S.sel ? S.sel.v : 0, 'big')),
      h('div', null, h('div', { class: 'pr', style: 'font-size:26px;font-weight:700', html: priceHTML(p.price) }), h('p', null, `Size: ${p.size}`), h('p', null, `Finishes: ${p.variants.map(v => v.n).join(', ')}.`), h('p', null, `Suitable for: ${p.rooms.map(r => CATS[r].label).join(', ')}.`),
        h('p', { class: 'muted' }, 'This is a dummy product built from primitive shapes with procedural textures. Prices are fictional.')))));
}

/* ═══════════════ 7d · bag, summary, feedback, modal, toast ═══════════════ */
function addToBag(lines) {
  for (const l of lines) { const ex = S.bag.find(b => b.pid === l.pid && b.v === l.v); ex ? ex.qty += l.qty : S.bag.push({ pid: l.pid, v: l.v, qty: l.qty }); }
  store.set('bag', S.bag); updateBagCount(); toast(`${lines.length > 1 ? lines.length + ' items' : P(lines[0].pid).name} added to your bag.`, { action: 'View bag', fn: showBag });
  if (S.sel) renderPanel(true);
}
function bagQty() { return S.bag.reduce((s, l) => s + l.qty, 0); }
function updateBagCount() { for (const id of ['bag-count', 'hdr-bag-count']) { const b = $('#' + id); b.textContent = bagQty(); b.hidden = !bagQty(); } }
function modal(content, wide) {
  const root = $('#modal-root'); root.innerHTML = '';
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); };
  const box = h('div', { class: 'modal' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' }, h('button', { class: 'xbtn', 'aria-label': 'Close', html: ico('close', 20), onclick: close }), content);
  const scrim = h('div', { class: 'scrim', onclick: e => { if (e.target === scrim) close(); } }, box); root.append(scrim);
  document.addEventListener('keydown', esc); return close;
}
function showBag() {
  const content = h('div'); let close;
  const draw = () => {
    content.innerHTML = ''; content.append(h('h3', null, 'Shopping bag'));
    if (!S.bag.length) { content.append(h('p', { class: 'muted' }, 'Your bag is empty.')); return; }
    const total = S.bag.reduce((s, l) => s + P(l.pid).price * l.qty, 0);
    content.append(h('table', { class: 'sumtable' }, h('tbody', null, S.bag.map(l => { const p = P(l.pid); return h('tr', null, h('td', null, thumbImg(l.pid, l.v)), h('td', null, h('b', null, p.name), h('div', { class: 'muted' }, `${p.type}, ${p.variants[l.v].n}`)),
      h('td', null, h('span', { class: 'stepper' }, h('button', { 'aria-label': 'Less', html: ico('minus', 14), onclick: () => { l.qty--; if (l.qty < 1) S.bag.splice(S.bag.indexOf(l), 1); store.set('bag', S.bag); updateBagCount(); draw(); } }), l.qty, h('button', { 'aria-label': 'More', html: ico('plus', 14), onclick: () => { l.qty++; store.set('bag', S.bag); updateBagCount(); draw(); } }))),
      h('td', { class: 'r', html: priceHTML(p.price * l.qty) })); }))));
    content.append(h('div', { class: 'sumtotal' }, h('span', null, 'Total'), h('span', { html: priceHTML(total) })), h('div', { class: 'actions' }, h('button', { class: 'pill-btn', onclick: () => { S.bag = []; store.set('bag', S.bag); updateBagCount(); draw(); } }, 'Empty bag'), h('button', { class: 'pill-btn primary', onclick: () => toast('Checkout is not part of this demo.') }, 'Go to checkout')));
  };
  draw(); close = modal(content); void close;
}
function showSummary() {
  const rows = {}; S.items.forEach(it => { const k = it.pid + '|' + it.v; rows[k] = rows[k] || { pid: it.pid, v: it.v, qty: 0 }; rows[k].qty++; });
  const list = Object.values(rows), total = totalPrice();
  const c = modal(h('div', null, h('h3', null, S.title || 'Untitled Design'), h('p', { class: 'muted' }, `${S.items.length} item${S.items.length === 1 ? '' : 's'} · ${fmtLen(S.room.x1 - S.room.x0)} × ${fmtLen(S.room.z1 - S.room.z0)} room`),
    h('table', { class: 'sumtable' }, h('thead', null, h('tr', null, h('th'), h('th', null, 'Product'), h('th', null, 'Qty'), h('th', { class: 'r' }, 'Price'))),
      h('tbody', null, list.map(l => { const p = P(l.pid); return h('tr', null, h('td', null, thumbImg(l.pid, l.v)), h('td', null, h('b', null, p.name), h('div', { class: 'muted' }, `${p.type}, ${p.variants[l.v].n}, ${p.size}`)), h('td', null, l.qty), h('td', { class: 'r', html: priceHTML(p.price * l.qty) })); }))),
    h('div', { class: 'sumtotal' }, h('span', null, 'Subtotal'), h('span', { html: priceHTML(total) })),
    h('div', { class: 'actions' }, h('button', { class: 'pill-btn', onclick: () => c() }, 'Back to design'), h('button', { class: 'pill-btn primary', onclick: () => { addToBag(S.items.map(i => ({ pid: i.pid, v: i.v, qty: 1 }))); c(); showBag(); } }, 'Add all to shopping bag'))), true);
}
function maybeFeedback() {
  if (S.feedbackShown || S.actions < 9) return; S.feedbackShown = true;
  setTimeout(() => {
    let c; c = modal(h('div', null, h('h3', null, 'How is your design experience?'), h('p', { class: 'muted' }, "We'd love to hear any ideas on how this could be better…"),
      h('div', { class: 'emoji' }, ['😞', '🙁', '😐', '🙂', '😀'].map((e, i) => h('button', { 'aria-label': ['Bad', 'Poor', 'Okay', 'Good', 'Great'][i], onclick: () => { c(); toast('Thanks for the feedback!'); } }, e))),
      h('div', { style: 'display:flex;justify-content:space-between;color:var(--muted);font-size:12px;padding:0 12px' }, h('span', null, 'Bad'), h('span', null, 'Good'))));
  }, 600);
}
let toastTimer;
function toast(msg, act) {
  const t = $('#toast'); t.innerHTML = ''; t.append(h('span', null, msg));
  if (act) t.append(h('button', { class: 'link', onclick: () => { t.hidden = true; act.fn(); } }, act.action));
  t.append(h('button', { class: 'x', 'aria-label': 'Dismiss', html: ico('close', 16), onclick: () => { t.hidden = true; } }));
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 6000);
}
const toastAdded = it => toast('Your item has been added, but you might want to move it to a better spot', { action: 'Select it', fn: () => select(it) });

/* warnings drawer */
const TIPS = ['Leave about 60 cm of free floor in front of wardrobes and chests so drawers and doors can open.', 'Keep tall furniture away from doors and windows so they stay usable.', 'Drag an item to move it; use Rotate for any angle, or Move to to snap it to a wall.', 'Use the ruler tool to show distances between furniture and walls.'];
function renderWarnings() {
  const body = $('#warn-body'), badge = $('#warn-count');
  badge.textContent = warnCache.length; badge.hidden = !warnCache.length;
  body.innerHTML = '';
  if (warnCache.length) { body.append(h('h4', null, 'Warnings'), h('ul', null, warnCache.map(w => h('li', { class: 'bad' }, w.text)))); }
  body.append(h('h4', null, 'Tips'), h('ul', null, TIPS.map(t => h('li', null, t))));
}

/* ═══════════════ 8 · bottom bar, views & popovers ═══════════════ */
function setView(v) {
  S.view = v; if (v === 'top') { CAM.px = 0; CAM.pz = 0; }
  updateCamera(); renderBottomBar(); markDirty(); positionOverlay();
}
function renderBottomBar() {
  $('#bb-doll').classList.toggle('on', S.view === 'dollhouse'); $('#bb-top').classList.toggle('on', S.view === 'top');
  $('#bb-side').classList.toggle('on', S.stripOpen || S.view === 'inside');
  $('#bb-move').disabled = !S.sel; $('#bb-goback').hidden = !S.sel;
  const chip = $('#viewchip'); chip.hidden = S.view !== 'inside' || S.mode !== 'design';
  chip.textContent = `Looking at the ${WALL_NAME[S.insideWall].toLowerCase()} — drag to look around`;
  const st = $('#stage'); st.classList.toggle('editing', S.mode === 'edit');
  $('#design-header').hidden = S.mode === 'edit'; $('#edit-header').hidden = S.mode !== 'edit';
  $('#bottombar').style.visibility = S.mode === 'edit' ? 'hidden' : '';
}
function closePopovers() { S.pop = null; const r = $('#popover-root'); if (r) r.innerHTML = ''; }
function openPopover(id, btn, build) {
  if (S.pop === id) { closePopovers(); return; }
  closePopovers(); S.pop = id;
  const pop = h('div', { class: 'pop', role: 'dialog' }); build(pop); $('#popover-root').append(pop); hydrateIcons(pop);
  const sr = $('#stage').getBoundingClientRect(), br = btn.getBoundingClientRect(), mid = br.left - sr.left + br.width / 2;
  pop.style.left = clamp(mid - pop.offsetWidth / 2, 8, Math.max(8, sr.width - pop.offsetWidth - 8)) + 'px';
}
const sw = (on, fn) => { const b = h('button', { class: 'switch', role: 'switch', 'aria-checked': !!on, onclick: () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', v); fn(v); } }); return b; };
function wallPopover(btn) {
  openPopover('wall', btn, pop => {
    pop.append(h('h4', null, 'Wall color'));
    const grid = h('div', { class: 'chips' });
    const draw = () => { grid.innerHTML = ''; grid.append(h('button', { class: 'chip none' + (S.room.wall === DEFAULT_WALL ? ' on' : ''), title: 'Reset to default', 'aria-label': 'Reset wall color', onclick: () => pick(DEFAULT_WALL) }));
      WALL_COLORS.slice(1).forEach(c => grid.append(h('button', { class: 'chip' + (S.room.wall === c ? ' on' : ''), style: `background:${c}`, title: c, 'aria-label': 'Wall color ' + c, onclick: () => pick(c) }))); };
    const pick = c => { S.room.wall = c; buildRoom(); afterChange({ keepPanel: true }); draw(); };
    draw(); pop.append(grid);
  });
}
function measurePopover(btn) {
  openPopover('measure', btn, pop => {
    pop.append(h('h4', null, 'Measurements'),
      ...[['Product dimensions', 'prod'], ['Product spacing', 'space'], ['Room dimensions', 'room']].map(([l, k]) => h('div', { class: 'row' }, l, sw(S.measure[k], v => { S.measure[k] = v; positionOverlay(); markDirty(); }))),
      h('div', { class: 'row' }, 'Unit: ', h('span', { class: 'unitlbl', style: 'font-weight:700;margin-right:auto' }, S.units), sw(S.units === 'ft', v => { S.units = v ? 'ft' : 'm'; $('.unitlbl', pop).textContent = S.units; store.set('units', S.units); positionOverlay(); renderPanel(true); })),
      h('div', { class: 'callout' }, h('div', { style: 'width:64px;height:48px;background:var(--bg2);border-radius:8px;display:grid;place-items:center', html: ico('edit', 28) }), h('div', null, h('strong', null, 'Want to create your own?'), h('button', { class: 'pill-btn sm', style: 'margin-top:6px', onclick: () => { closePopovers(); startBuild(); } }, 'Build a room ', h('span', { html: ico('arrow', 16) })))));
  });
}
function wallMini(k) {
  const c = { N: 'x1="6" y1="6" x2="64" y2="6"', S: 'x1="6" y1="40" x2="64" y2="40"', W: 'x1="6" y1="6" x2="6" y2="40"', E: 'x1="64" y1="6" x2="64" y2="40"' }[k];
  return `<svg viewBox="0 0 70 46"><rect x="6" y="6" width="58" height="34" fill="#f0efeb" stroke="#bbb" stroke-width="2"/><line ${c} stroke="#0058a3" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function movePopover(btn) {
  if (!S.sel) return;
  openPopover('move', btn, pop => {
    pop.append(h('h4', null, 'Move to wall'), h('div', { class: 'walls-pick' }, WALLS.map(k => h('button', { onclick: () => { moveToWall(S.sel, k); closePopovers(); }, html: wallMini(k) + `<span>${WALL_NAME[k]}</span>` }))));
  });
}

/* ═══════════════ 8b · Edit-room wizard ═══════════════ */
function featIcon(st) {
  const door = st.kind === 'door', w = door ? 44 : 50, hh = door ? 62 : 38, x = (56 - w) / 2, y = (70 - hh) / 2;
  let s = `<svg viewBox="0 0 56 70" fill="none" stroke="#222" stroke-width="2"><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#fff"/>`;
  const n = st.leaves, lw = w / n;
  for (let i = 0; i < n; i++) {
    const lx = x + lw * i;
    if (st.mode === 'solid') s += `<rect x="${lx + 4}" y="${y + 5}" width="${lw - 8}" height="${hh * .38}" stroke-width="1.2"/><rect x="${lx + 4}" y="${y + hh * .5}" width="${lw - 8}" height="${hh * .38}" stroke-width="1.2"/>`;
    else { s += `<rect x="${lx + 3}" y="${y + 3}" width="${lw - 6}" height="${hh - 6}" fill="#d9e9f3" stroke-width="1.2"/>`; if (st.mode === 'grid') s += `<path d="M${lx + lw / 2} ${y + 3}v${hh - 6}M${lx + 3} ${y + hh / 2}h${lw - 6}" stroke-width="1"/>`; }
    if (i) s += `<path d="M${lx} ${y}v${hh}"/>`;
  }
  return s + '</svg>';
}
function wizBack() { S.edit.step = Math.max(1, S.edit.step - 1); wizStepChanged(); }
function wizNext() { S.edit.step = Math.min(3, S.edit.step + 1); wizStepChanged(); }
function wizStepChanged() {
  S.edit.feat = null;
  if (S.edit.step === 1) { S.edit.sub = 'plan'; S.view = 'top'; } else { S.view = 'dollhouse'; }
  CAM.px = 0; CAM.pz = 0; updateCamera(); renderPanel(); syncEditHeader(); markDirty(); positionOverlay();
}
function syncEditHeader() {
  const one = S.edit.step === 1; $('#edit-modes').style.visibility = one ? '' : 'hidden';
  $('#mode-plan').classList.toggle('on', S.edit.sub === 'plan'); $('#mode-ceil').classList.toggle('on', S.edit.sub === 'ceil');
  updateEditUI();
}
function updateEditUI() {
  $('#btn-undo').disabled = !S.edit.undo.length; $('#btn-redo').disabled = !S.edit.redo.length;
  const R = S.room, a = $('#dimw'), b = $('#dimd'), c = $('#dimh');
  if (a) { a.textContent = fmtLen(R.x1 - R.x0); b.textContent = fmtLen(R.z1 - R.z0); c.textContent = fmtLen(R.h); const sl = $('#ceilslider'); if (sl) sl.value = R.h; }
}
function setTextCeil() { updateEditUI(); }
function editPush() { S.edit.undo.push(JSON.stringify(S.room)); S.edit.redo = []; if (S.edit.undo.length > 60) S.edit.undo.shift(); }
function editCommit() { updateEditUI(); renderPanel(true); }
function editUndo() { if (!S.edit.undo.length) return; S.edit.redo.push(JSON.stringify(S.room)); S.room = JSON.parse(S.edit.undo.pop()); S.edit.feat = null; buildRoom(); updateEditUI(); renderPanel(true); }
function editRedo() { if (!S.edit.redo.length) return; S.edit.undo.push(JSON.stringify(S.room)); S.room = JSON.parse(S.edit.redo.pop()); S.edit.feat = null; buildRoom(); updateEditUI(); renderPanel(true); }
function selectFeature(f) { S.edit.feat = f; renderPanel(true); positionOverlay(); markDirty(); }
function applyStyle(id) {
  const st = STYLE[id], R = S.room, f = S.edit.feat;
  const targets = f && f.kind === st.kind ? [f] : R.feats.filter(x => x.kind === st.kind);
  if (!targets.length) return toast(`This room has no ${st.kind}s to restyle.`);
  editPush();
  for (const t of targets) { t.style = id; t.w = st.w; t.h = st.h; t.sill = st.sill || 0; const L = wallLen(t.wall); t.u = clamp(t.u, t.w / 2 + .1, L - t.w / 2 - .1); }
  buildRoom(); renderPanel(true); positionOverlay(); updateEditUI();
  if (targets.length > 1) toast(`Applied "${st.name}" to all ${st.kind}s. Select one first to change just that ${st.kind}.`);
}
function enterEdit(step = 1) {
  deselect(); closePopovers(); toggleStrip(false);
  S.edit = { step, sub: 'plan', snap: JSON.stringify(S.room), undo: [], redo: [], feat: null, prevView: S.view === 'inside' ? 'dollhouse' : S.view };
  S.mode = 'edit'; S.view = step === 1 ? 'top' : 'dollhouse'; CAM.px = 0; CAM.pz = 0;
  renderBottomBar(); syncEditHeader(); updateCamera(); renderPanel(); markDirty(); positionOverlay();
}
function exitEdit(commit) {
  if (!commit) { S.room = JSON.parse(S.edit.snap); }
  else {
    for (const it of S.items) { const q = clampPos(P(it.pid), it.rot, it.x, it.z); it.x = q.x; it.z = q.z; }
    const old = S.designId; S.designId = uid(); const d = docs(); delete d[old]; store.set('designs', d);
    history.replaceState(null, '', `#${S.templateId}/${S.designId}`);
  }
  const pv = S.edit.prevView; S.mode = 'design'; S.edit = null; S.view = pv;
  buildRoom(); S.items.forEach(it => syncNode(it)); fitCamera(); updateCamera(); renderBottomBar(); renderPanel(); refreshTotals(); refreshWarnings(); queueSave(); markDirty(); positionOverlay();
  if (commit) toast('Room updated.');
}
function renderWizard(root) {
  const E = S.edit, R = S.room;
  const sc = h('div', { class: 'wiz' }); root.append(sc);
  const foot = h('div', { class: 'wfoot' }); root.append(foot);
  if (E.step === 1) {
    sc.append(h('div', { class: 'step' }, 'Step 1 of 3'), h('h2', null, 'Edit room dimensions'),
      h('p', null, E.sub === 'plan' ? 'Click and drag each wall to adjust the dimensions of your floor plan. Toggle to ceiling height. Click and drag the top of the walls up or down to adjust their height.' : 'Drag the handle at the top of the walls up or down — or use the slider — to set the ceiling height.'),
      h('div', { class: 'illus', html: `<svg viewBox="0 0 220 80" width="100%" height="80"><rect x="70" y="10" width="80" height="60" fill="#fff" stroke="#222" stroke-width="2"/><path d="M30 40h30M45 30l-15 10 15 10M190 40h-30M175 30l15 10-15 10" stroke="#0058a3" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` }),
      h('div', { class: 'featbox' }, h('div', { class: 'row' }, 'Width', h('b', { id: 'dimw' })), h('div', { class: 'row' }, 'Depth', h('b', { id: 'dimd' })), h('div', { class: 'row' }, 'Ceiling height', h('b', { id: 'dimh' })),
        h('input', { id: 'ceilslider', type: 'range', min: 2.2, max: 3.8, step: .05, value: R.h, style: 'width:100%;margin-top:8px', 'aria-label': 'Ceiling height',
          oninput: e => { R.h = +e.target.value; buildRoom(); updateEditUI(); }, onpointerdown: () => editPush(), onchange: () => { updateEditUI(); } })));
    foot.append(h('button', { class: 'pill-btn dark', onclick: wizNext }, 'Next'));
  } else if (E.step === 2) {
    sc.append(h('div', { class: 'step' }, 'Step 2 of 3'), h('h2', null, 'Configure room features'), h('p', null, 'Swap doors and windows. Select them to adjust dimensions and move them to the right position.'));
    if (E.feat) {
      const f = E.feat, L = wallLen(f.wall), step = (key, d, lo, hi) => { editPush(); f[key] = clamp(+(f[key] + d).toFixed(2), lo, hi); f.u = clamp(f.u, f.w / 2 + .1, L - f.w / 2 - .1); buildRoom(); renderPanel(true); positionOverlay(); updateEditUI(); };
      sc.append(h('div', { class: 'featbox' }, h('b', null, `Selected: ${STYLE[f.style].name}`), h('div', { class: 'muted' }, `${WALL_NAME[f.wall]} — drag it in the room to slide it along the wall.`),
        h('div', { class: 'row' }, 'Width', h('span', { class: 'stepper' }, h('button', { 'aria-label': 'Narrower', html: ico('minus', 14), onclick: () => step('w', -.1, .5, Math.min(3, L - .3)) }), fmtLen(f.w), h('button', { 'aria-label': 'Wider', html: ico('plus', 14), onclick: () => step('w', .1, .5, Math.min(3, L - .3)) }))),
        h('div', { class: 'row' }, 'Height', h('span', { class: 'stepper' }, h('button', { 'aria-label': 'Shorter', html: ico('minus', 14), onclick: () => step('h', -.1, .5, S.room.h - (f.sill || 0) - .1) }), fmtLen(f.h), h('button', { 'aria-label': 'Taller', html: ico('plus', 14), onclick: () => step('h', .1, .5, S.room.h - (f.sill || 0) - .1) }))),
        h('button', { class: 'pill-btn sm', onclick: () => selectFeature(null) }, 'Done')));
    } else sc.append(h('div', { class: 'featbox muted' }, 'Tip: click a door or window in the room to select it. With nothing selected, a style applies to every door or window.'));
    const grid = list => h('div', { class: 'optgrid' }, list.map(st => h('button', { class: 'opt' + (E.feat && E.feat.style === st.id ? ' on' : ''), onclick: () => applyStyle(st.id), html: featIcon(st) + `<span>${st.name}</span>` })));
    sc.append(h('h4', null, 'Door styles'), grid(DOORS), h('h4', null, 'Window styles'), grid(WINDOWS));
    foot.append(h('button', { class: 'pill-btn', onclick: wizBack }, 'Go back'), h('button', { class: 'pill-btn dark', onclick: wizNext }, 'Next'));
  } else {
    const fl = FLOOR(R.floor);
    sc.append(h('div', { class: 'step' }, 'Step 3 of 3'), h('h2', null, 'Style the walls and flooring'), h('p', null, 'Choose a wall color and floor material to personalize your room.'),
      h('h4', null, 'Wall color'),
      h('div', { class: 'sgrid' }, WALL_COLORS.map(c => h('button', { class: R.wall === c ? 'on' : '', style: `background:${c}`, title: c, 'aria-label': 'Wall color ' + c, onclick: () => { if (R.wall === c) return; editPush(); R.wall = c; buildRoom(); renderPanel(true); updateEditUI(); } }))),
      h('h4', null, 'Floor style', h('span', { class: 'muted', style: 'font-weight:400' }, ' — ' + fl.name)),
      h('div', { class: 'sgrid floor' }, FLOORS.map(f => { const b = h('button', { class: R.floor === f.id ? 'on' : '', title: f.name, 'aria-label': f.name, onclick: () => { if (R.floor === f.id) return; editPush(); R.floor = f.id; buildRoom(); renderPanel(true); updateEditUI(); } }); b.style.backgroundImage = `url(${getTex(f.kind, f.c, f.c2).image.toDataURL()})`; b.style.backgroundSize = '200%'; return b; })));
    foot.append(h('button', { class: 'pill-btn', onclick: wizBack }, 'Go back'), h('button', { class: 'pill-btn dark', onclick: () => exitEdit(true) }, 'Finish'));
  }
  updateEditUI();
}

/* ═══════════════ 9 · persistence ═══════════════ */
const docs = () => store.get('designs', {});
function currentDoc() {
  return { id: S.designId, templateId: S.templateId, title: S.title, roomType: S.roomType, room: S.room, updated: Date.now(),
    items: S.items.map(i => ({ pid: i.pid, v: i.v, x: +i.x.toFixed(3), z: +i.z.toFixed(3), rot: i.rot })) };
}
function saveNow() { if (!S.designId || !S.room || S.route !== 'designer') return; const d = docs(); d[S.designId] = currentDoc(); store.set('designs', d); }
let saveT; function queueSave() { clearTimeout(saveT); saveT = setTimeout(saveNow, 500); }

/* ═══════════════ 10 · designer lifecycle ═══════════════ */
function startDesign(doc) {
  S.designId = doc.id; S.templateId = doc.templateId; S.title = doc.title || 'Untitled Design'; S.roomType = doc.roomType || 'bedroom'; S.room = JSON.parse(JSON.stringify(doc.room));
  S.mode = 'design'; S.edit = null; S.view = 'dollhouse'; S.sel = null; S.tab = 'add'; S.cats = new Set(); S.query = ''; S.menu = null; S.stripOpen = false; S.rotating = false; S.actions = 0;
  GL.itemGroup.children.slice().forEach(c => { GL.itemGroup.remove(c); disposeTree(c); }); S.items = [];
  for (const d of doc.items || []) { const p = P(d.pid); if (!p) continue; const q = clampPos(p, d.rot || 0, d.x, d.z); const it = { uid: uid(), pid: d.pid, v: d.v || 0, x: q.x, z: q.z, rot: d.rot || 0 }; S.items.push(it); attachItem(it); }
  $('#design-title').value = S.title; toggleStrip(false); closePopovers();
  buildRoom(); fitCamera(); updateCamera(); renderBottomBar(); renderPanel(); refreshTotals(); refreshWarnings(); renderItemFloat(); updateBagCount(); markDirty();
}
function openTemplate(tid, did) {
  const t = TPL(tid), f = FURNISHED.find(x => x.id === tid); let room, items = [], roomType = 'bedroom', title = 'Untitled Design';
  if (t) room = roomFromTemplate(t);
  else if (f) { room = roomFromTemplate(TPL(f.base)); room.wall = WALL_COLORS[f.wall]; room.floor = f.floor; items = f.items.map(([pid, v, x, z, rot]) => ({ pid, v, x, z, rot })); roomType = f.roomType; title = f.name; }
  else if (tid === 'custom') room = { x0: -2.25, x1: 2.25, z0: -1.9, z1: 1.9, h: 2.5, wall: DEFAULT_WALL, floor: 'f1', feats: [feat('S', 'single', 1.2)] };
  else return false;
  startDesign({ id: did || uid(), templateId: tid, title, roomType, room, items }); return true;
}
function startBuild() { go('custom'); setTimeout(() => enterEdit(1), 60); }
function go(tid, did) { location.hash = `#${tid}/${did || uid()}`; }
function route() {
  const hsh = location.hash.replace(/^#\/?/, '');
  if (!hsh) return showHub();
  const [tid, did] = hsh.split('/'), saved = did && docs()[did];
  showDesigner();
  if (S.designId && did === S.designId && S.room) return;
  if (saved) startDesign(saved); else if (!openTemplate(tid, did)) { history.replaceState(null, '', location.pathname); showHub(); }
  else history.replaceState(null, '', `#${S.templateId}/${S.designId}`);
}
function showDesigner() {
  S.route = 'designer'; $('#hub').hidden = true; $('#designer').hidden = false; document.title = 'Design — Interio Kreativ';
  if (!TH.r && !TH.failed) thumbInit(); resize(); markDirty();
}
function showHub() {
  if (S.route === 'designer') saveNow();
  S.route = 'hub'; S.designId = null; $('#hub').hidden = false; $('#designer').hidden = true; document.title = 'Interio Kreativ — Room Designer'; closePopovers(); renderHub(); window.scrollTo(0, 0);
}

/* ═══════════════ 11 · hub ═══════════════ */
function planSVG(R) {
  const W = R.x1 - R.x0, D = R.z1 - R.z0, k = 40, pad = 14, fl = FLOOR(R.floor), id = 'g' + Math.random().toString(36).slice(2, 7);
  let s = `<svg viewBox="0 0 ${W * k + pad * 2} ${D * k + pad * 2}" aria-hidden="true"><defs><pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${fl.c}"/><path d="M0 7h14" stroke="rgba(0,0,0,.12)"/></pattern></defs>`;
  s += `<rect x="${pad}" y="${pad}" width="${W * k}" height="${D * k}" fill="url(#${id})" stroke="#333" stroke-width="5"/>`;
  for (const f of R.feats) {
    const wk = f.w * k, o = { N: [pad + (f.u - f.w / 2) * k, pad, 'translate'], S: [pad + (f.u - f.w / 2) * k, pad + D * k, 'S'], W: [pad, pad + (f.u - f.w / 2) * k, 'W'], E: [pad + W * k, pad + (f.u - f.w / 2) * k, 'E'] }[f.wall];
    const tr = { N: `translate(${o[0]} ${o[1]})`, S: `translate(${o[0]} ${o[1]}) scale(1 -1)`, W: `translate(${o[0]} ${o[1]}) matrix(0 1 1 0 0 0)`, E: `translate(${o[0]} ${o[1]}) matrix(0 1 -1 0 0 0)` }[f.wall];
    s += `<g transform="${tr}"><line x1="0" y1="0" x2="${wk}" y2="0" stroke="#fff" stroke-width="7"/>`;
    if (f.kind === 'door') { const n = STYLE[f.style].leaves >= 2 ? 2 : 1, lw = wk / n; for (let i = 0; i < n; i++) { const x0 = i * lw; s += i % 2 ? `<path d="M${x0 + lw} 0v${lw}M${x0} 0A${lw} ${lw} 0 0 0 ${x0 + lw} ${lw}" fill="none" stroke="#555" stroke-width="1.5"/>` : `<path d="M${x0} 0v${lw}M${x0 + lw} 0A${lw} ${lw} 0 0 1 ${x0} ${lw}" fill="none" stroke="#555" stroke-width="1.5"/>`; } }
    else s += `<line x1="0" y1="-2" x2="${wk}" y2="-2" stroke="#4a90c0" stroke-width="2"/><line x1="0" y1="2" x2="${wk}" y2="2" stroke="#4a90c0" stroke-width="2"/>`;
    s += '</g>';
  }
  return s + '</svg>';
}
function roomCard(name, R, tid, opts = {}) {
  return h('button', { class: 'rcard', onclick: () => opts.onclick ? opts.onclick() : go(tid) }, h('div', { class: 'thumb', html: planSVG(R) }),
    h('div', { class: 'meta' }, opts.small ? h('small', null, opts.small) : h('small', null, `${sqft(R)} sq.ft`), h('strong', null, name), h('span', { class: 'go' }, opts.cta || 'Design this room', h('span', { html: ico('arrow', 18) }))));
}
function renderHub() {
  const ge = $('#grid-empty'), gf = $('#grid-furnished'), gm = $('#mydesigns-grid'); ge.innerHTML = gf.innerHTML = gm.innerHTML = '';
  TEMPLATES.forEach(t => ge.append(roomCard(t.name, roomFromTemplate(t), t.id)));
  FURNISHED.forEach(f => { const t = TPL(f.base), R = roomFromTemplate(t); R.floor = f.floor; gf.append(roomCard(f.name, R, f.id, { small: `${sqft(R)} sq.ft · ${f.items.length} items` })); });
  const all = Object.values(docs()).filter(d => d && d.room).sort((a, b) => b.updated - a.updated);
  $('#mydesigns').hidden = !all.length; $('#saved-hint').textContent = all.length ? `${all.length} saved design${all.length > 1 ? 's' : ''} in this browser` : '';
  all.forEach(d => {
    const c = roomCard(d.title || 'Untitled Design', d.room, d.templateId, { small: `${d.items.length} item${d.items.length === 1 ? '' : 's'} · ${new Date(d.updated).toLocaleDateString()}`, cta: 'Open design', onclick: () => { location.hash = `#${d.templateId}/${d.id}`; } });
    const del = h('button', { class: 'pill-btn sm', style: 'margin:0 14px 14px;align-self:flex-start', onclick: e => { e.stopPropagation(); const m = docs(); delete m[d.id]; store.set('designs', m); renderHub(); } }, 'Delete');
    const wrap = h('div', { class: 'rcard', style: 'padding:0;border:0;box-shadow:none' }); c.style.width = '100%'; wrap.append(c, del); gm.append(wrap);
  });
  drawHero(); hydrateIcons($('#hub'));
}
function drawHero() {
  const cv = $('#hero-canvas'), g = cv.getContext('2d'), w = cv.width, hh = cv.height; g.clearRect(0, 0, w, hh);
  const iso = (x, y, z) => [w / 2 + (x - z) * 46, 210 + (x + z) * 26 - y * 52];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); };
  const box = (x, z, W, D, Hh, top, l, r) => { poly([iso(x, Hh, z), iso(x + W, Hh, z), iso(x + W, Hh, z + D), iso(x, Hh, z + D)], top); poly([iso(x, 0, z + D), iso(x + W, 0, z + D), iso(x + W, Hh, z + D), iso(x, Hh, z + D)], l); poly([iso(x + W, 0, z), iso(x + W, 0, z + D), iso(x + W, Hh, z + D), iso(x + W, Hh, z)], r); };
  poly([iso(0, 0, 0), iso(6, 0, 0), iso(6, 0, 4), iso(0, 0, 4)], '#b98a5a');
  for (let i = 1; i < 12; i++) { g.strokeStyle = 'rgba(0,0,0,.1)'; g.beginPath(); g.moveTo(...iso(i * .5, 0, 0)); g.lineTo(...iso(i * .5, 0, 4)); g.stroke(); }
  poly([iso(0, 0, 0), iso(6, 0, 0), iso(6, 3, 0), iso(0, 3, 0)], '#efede8'); poly([iso(0, 0, 0), iso(0, 0, 4), iso(0, 3, 4), iso(0, 3, 0)], '#e3e0d9');
  poly([iso(1, .9, 0), iso(2.4, .9, 0), iso(2.4, 2.3, 0), iso(1, 2.3, 0)], '#cfe6f2');
  box(3.4, .2, 2, 2.4, .35, '#e9e6df', '#cfcbc2', '#bbb7ae'); box(3.4, .2, 2, .25, 1, '#5b5f66', '#464a50', '#3a3d42'); box(3.7, .5, .6, .4, .5, '#fff', '#e8e8e8', '#ddd'); box(4.7, .5, .6, .4, .5, '#fff', '#e8e8e8', '#ddd');
  box(.3, 2.6, 1.8, .8, .45, '#c9983a', '#a87d2c', '#8e6a24'); box(.3, 2.6, 1.8, .2, .9, '#c9983a', '#a87d2c', '#8e6a24');
  box(4.8, 3, .5, .5, .5, '#c5a06b', '#a8834f', '#8c6c47'); box(5.2, 3.4, .1, .1, 1.4, '#333', '#222', '#111');
}

/* ═══════════════ 12 · wiring ═══════════════ */
function init() {
  S.units = store.get('units', 'ft');
  hydrateIcons(document); initGL(); bindCanvas(); bindRotate();
  $('#btn-sidebar').onclick = () => { S.panelOpen = !S.panelOpen; $('#designer').classList.toggle('panel-closed', !S.panelOpen); $('#btn-sidebar').setAttribute('aria-label', S.panelOpen ? 'Close side panel' : 'Open side panel'); setTimeout(resize, 230); };
  $('#design-title').addEventListener('input', e => { S.title = e.target.value; queueSave(); });
  $('#btn-bag').onclick = $('#hdr-bag').onclick = showBag;
  $('#btn-share').onclick = () => { saveNow(); const url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Link copied. Designs are stored in this browser.'), () => toast('Copy this link: ' + url)); };
  $('#btn-save').onclick = () => { saveNow(); toast('Design saved in this browser.'); };
  $('#btn-summary').onclick = showSummary;
  $('#btn-exit').onclick = () => { saveNow(); location.hash = ''; };
  $('#zoom-in').onclick = () => zoomBy(1); $('#zoom-out').onclick = () => zoomBy(-1);
  $('#bb-doll').onclick = () => { S.stripOpen && toggleStrip(false); setView('dollhouse'); };
  $('#bb-top').onclick = () => { S.stripOpen && toggleStrip(false); setView('top'); };
  $('#bb-side').onclick = () => { closePopovers(); toggleStrip(); renderBottomBar(); };
  $('#bb-move').onclick = e => movePopover(e.currentTarget);
  $('#bb-goback').onclick = deselect;
  $('#bb-wall').onclick = e => wallPopover(e.currentTarget);
  $('#bb-measure').onclick = e => measurePopover(e.currentTarget);
  $('#bb-edit').onclick = () => enterEdit(1);
  $('#btn-undo').onclick = editUndo; $('#btn-redo').onclick = editRedo;
  $('#mode-plan').onclick = () => { S.edit.sub = 'plan'; S.view = 'top'; updateCamera(); syncEditHeader(); renderPanel(true); markDirty(); positionOverlay(); };
  $('#mode-ceil').onclick = () => { S.edit.sub = 'ceil'; S.view = 'dollhouse'; updateCamera(); syncEditHeader(); renderPanel(true); markDirty(); positionOverlay(); };
  $('#btn-edit-cancel').onclick = () => exitEdit(false);
  $('#warn-toggle').onclick = e => { const b = $('#warn-body'); b.hidden = !b.hidden; e.currentTarget.setAttribute('aria-expanded', !b.hidden); };
  document.addEventListener('pointerdown', e => { if (S.pop && !e.target.closest('.pop') && !e.target.closest('#bottombar')) closePopovers(); if (S.menu && !e.target.closest('.menu') && !e.target.closest('.roomtype') && !e.target.closest('.pills')) { S.menu = null; if (S.route === 'designer' && S.mode === 'design' && !S.sel) renderPanel(true); } });
  document.addEventListener('keydown', e => {
    if (S.route !== 'designer' || $('#modal-root').firstChild || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.target.type !== 'range') return;
    if (e.key === 'Escape') { if (S.pop) closePopovers(); else if (S.mode === 'design') deselect(); return; }
    if (S.mode !== 'design' || !S.sel) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeItem(S.sel); }
    const d = e.shiftKey ? .25 : .05, m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
    if (m) { e.preventDefault(); nudge(S.sel, m[0], m[1]); }
  });
  $('#way-quick').onclick = () => $('#rooms-empty').scrollIntoView({ behavior: 'smooth' });
  $('#way-build').onclick = startBuild;
  if (!store.get('cookies', false)) { $('#cookie').hidden = false; $('#cookie-ok').onclick = () => { store.set('cookies', true); $('#cookie').hidden = true; }; $('#cookie-set').onclick = () => { store.set('cookies', true); $('#cookie').hidden = true; toast('Only local storage is used.'); }; }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', saveNow);
  updateBagCount(); route();
  window.__interio = { S, CAM, GL, addItem, select, enterEdit, setView, PRODUCTS, TEMPLATES, P, refreshWarnings, computeWarnings }; // handy for debugging
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
