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
    for (let y = 0; y < s; y += 2) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .07})` : `rgba(0,0,0,${r() * .05})`; g.fillRect(0, y, s, 1.5); }
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
  granite(g, s, c, c2, r) { g.fillStyle = c; g.fillRect(0, 0, s, s); for (let k = 0; k < 2600; k++) { g.fillStyle = r() < .3 ? c2 : r() < .5 ? shade(c, .25) : shade(c, -.3); g.globalAlpha = .35 + r() * .5; g.beginPath(); g.arc(r() * s, r() * s, .5 + r() * 1.8, 0, 6.3); g.fill(); } g.globalAlpha = 1; noise(g, s, 10, r); },
  quartz(g, s, c, c2, r) { g.fillStyle = c; g.fillRect(0, 0, s, s); for (let k = 0; k < 1800; k++) { g.fillStyle = r() < .5 ? shade(c, -.18) : shade(c, .2); g.fillRect(r() * s, r() * s, 1 + r() * 1.5, 1 + r() * 1.5); } noise(g, s, 5, r); },
  subway(g, s, c, c2, r) { g.fillStyle = c2; g.fillRect(0, 0, s, s); const rows = 8, rh = s / rows, bw = s / 2; for (let i = 0; i < rows; i++) for (let j = -1; j < 3; j++) { const x = j * bw + (i % 2 ? bw / 2 : 0); g.fillStyle = shade(c, (r() - .5) * .06); g.fillRect(x + 1.5, i * rh + 1.5, bw - 3, rh - 3); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 2, i * rh + 2, bw - 4, 2); } },
  hex(g, s, c, c2, r) { g.fillStyle = c2; g.fillRect(0, 0, s, s); const rx = s / 8, R = (s / 6) / 1.5; for (let row = -1; row <= 6; row++) for (let col = -1; col <= 4; col++) { const cx = col * rx * 2 + (row % 2 ? rx : 0), cy = row * (s / 6); g.beginPath(); g.moveTo(cx, cy - R); g.lineTo(cx + rx, cy - R / 2); g.lineTo(cx + rx, cy + R / 2); g.lineTo(cx, cy + R); g.lineTo(cx - rx, cy + R / 2); g.lineTo(cx - rx, cy - R / 2); g.closePath(); g.fillStyle = shade(c, (r() - .5) * .1); g.fill(); g.strokeStyle = c2; g.lineWidth = 3; g.stroke(); } },
  moroccan(g, s, c, c2) { g.fillStyle = c; g.fillRect(0, 0, s, s); const n = 4, w = s / n; g.fillStyle = c2; g.strokeStyle = c2; g.lineWidth = 3; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = i * w, y = j * w; g.beginPath(); g.moveTo(x + w / 2, y + w * .15); g.lineTo(x + w * .85, y + w / 2); g.lineTo(x + w / 2, y + w * .85); g.lineTo(x + w * .15, y + w / 2); g.closePath(); g.fill(); for (const [a, b] of [[0, 0], [w, 0], [0, w], [w, w]]) { g.beginPath(); g.arc(x + a, y + b, w * .28, 0, 6.3); g.stroke(); } } },
  terrazzo(g, s, c, c2, r) { g.fillStyle = c; g.fillRect(0, 0, s, s); const pal = ['#b4653f', '#7d7f84', '#2b2b2d', '#d9c9a8', '#8fa58a']; for (let k = 0; k < 340; k++) { g.fillStyle = pal[(r() * pal.length) | 0]; g.beginPath(); const x = r() * s, y = r() * s, rr = 1.5 + r() * 5; for (let t = 0; t < 5; t++) { const a = t / 5 * 6.28 + r(); g.lineTo(x + Math.cos(a) * rr * (.6 + r() * .6), y + Math.sin(a) * rr * (.6 + r() * .6)); } g.closePath(); g.fill(); } noise(g, s, 6, r); },
  mosaic(g, s, c, c2, r) { g.fillStyle = c2 || '#eee'; g.fillRect(0, 0, s, s); const n = 16, w = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = shade(c, (r() - .5) * .45); g.fillRect(i * w + 1, j * w + 1, w - 2, w - 2); } },
  leaf(g, s, c, c2, r) {
    g.fillStyle = c; g.fillRect(0, 0, s, s);
    for (let k = 0; k < 90; k++) { g.fillStyle = shade(c, (r() - .5) * .5); g.beginPath(); g.ellipse(r() * s, r() * s, 6 + r() * 14, 3 + r() * 6, r() * 3, 0, 6.3); g.fill(); }
  }
};
const SURF = { // roughness / metalness per texture kind
  plank: [.55, 0], wood: [.62, 0], herring: [.55, 0], fabric: [.96, 0], linen: [.95, 0], velvet: [.9, 0], leather: [.5, 0],
  metal: [.35, .75], marble: [.2, 0], laminate: [.45, 0], rattan: [.8, 0], plaid: [.96, 0], stripe: [.96, 0],
  tile: [.3, 0], checker: [.3, 0], granite: [.25, 0], quartz: [.2, 0], subway: [.15, 0], hex: [.3, 0], moroccan: [.35, 0], terrazzo: [.35, 0], mosaic: [.2, 0], carpet: [1, 0], concrete: [.85, 0], leaf: [.8, 0], plain: [.8, 0]
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

/* ═══════════════ 3 · kitchen catalogue — modular units & appliances (dummy 3D objects, procedural textures) ═══════════════ */
/* Local coords: x = width, y = up (0 = bottom of the unit), z = depth. +z is the FRONT, -z the back (against the wall). */
const COUNTER_H = .9, PLINTH = .1, WT = .04, WALL_Y = 1.45, TALL_H = 2.1;
const KCATS = ['Essentials', 'Base cabinets', 'Wall units', 'Tall units', 'Appliances'];

/* cabinet finishes (the "texture" of shutters) */
const FINISHES = [
  { n: 'Frosty white matte', sw: '#eeece7', kind: 'laminate', c: '#eeece7', mult: 1 },
  { n: 'Ivory high-gloss acrylic', sw: '#efe4cc', kind: 'laminate', c: '#efe4cc', mult: 1.35, gloss: true },
  { n: 'Sage green matte', sw: '#8fa58a', kind: 'laminate', c: '#8fa58a', mult: 1.05 },
  { n: 'Navy blue matte', sw: '#2f3e5c', kind: 'laminate', c: '#2f3e5c', mult: 1.05 },
  { n: 'Graphite high-gloss', sw: '#3b3d42', kind: 'laminate', c: '#3b3d42', mult: 1.35, gloss: true },
  { n: 'Terracotta matte', sw: '#b4653f', kind: 'laminate', c: '#b4653f', mult: 1.05 },
  { n: 'Walnut veneer', sw: '#6a4430', kind: 'wood', c: '#6a4430', mult: 1.25 },
  { n: 'Oak veneer', sw: '#c5a06b', kind: 'wood', c: '#c5a06b', mult: 1.2 }
];
const FIN_VARIANTS = () => FINISHES.map(f => ({ n: f.n, sw: f.sw, fin: f }));
const finMat = f => mat(f.kind, f.c, null, f.gloss ? { roughness: .14, metalness: .05 } : f.kind === 'wood' ? null : { roughness: .55 });
const COUNTERS = [
  { id: 'granite-black', n: 'Black galaxy granite', kind: 'granite', c: '#1d1d21', c2: '#c9b27a', rough: .25 },
  { id: 'granite-tan', n: 'Tan brown granite', kind: 'granite', c: '#4a2f25', c2: '#9a7a5e', rough: .25 },
  { id: 'quartz-white', n: 'White quartz', kind: 'quartz', c: '#efeee9', rough: .2 },
  { id: 'quartz-grey', n: 'Concrete grey quartz', kind: 'quartz', c: '#8d8f93', rough: .25 },
  { id: 'marble', n: 'Statuario marble', kind: 'marble', c: '#f1f0ec', rough: .2 },
  { id: 'oak', n: 'Solid oak', kind: 'wood', c: '#b98a5a', rough: .5 },
  { id: 'steel', n: 'Stainless steel', kind: 'metal', c: '#b9bcc0', rough: .35 }
];
const COUNTER = id => COUNTERS.find(c => c.id === id) || COUNTERS[0];
const counterMat = st => { const c = COUNTER(st.counter); return mat(c.kind, c.c, c.c2, { roughness: c.rough, metalness: c.kind === 'metal' ? .6 : 0 }); };
const HANDLES = [['bar', 'Bar handles'], ['knob', 'Knobs'], ['gola', 'Handle-less (gola)'], ['edge', 'Brass edge pulls']];
const TILES = [
  { id: 'subway-white', n: 'White subway', kind: 'subway', c: '#f3f2ee', c2: '#cfcac2' },
  { id: 'subway-sage', n: 'Sage subway', kind: 'subway', c: '#a9b8a1', c2: '#e7e4dc' },
  { id: 'moroccan', n: 'Moroccan blue', kind: 'moroccan', c: '#f1ece2', c2: '#3f6e8c' },
  { id: 'hex-grey', n: 'Grey hexagon', kind: 'hex', c: '#bfc1c3', c2: '#efefec' },
  { id: 'terrazzo', n: 'Terrazzo', kind: 'terrazzo', c: '#eae6df' },
  { id: 'mosaic-blue', n: 'Blue glass mosaic', kind: 'mosaic', c: '#5f93b5', c2: '#e9eef0' },
  { id: 'marble', n: 'Marble slab', kind: 'marble', c: '#efeeea' },
  { id: 'square-white', n: 'White 30×30', kind: 'tile', c: '#f2f2ef', c2: '#c9c9c5' },
  { id: 'kota', n: 'Kota stone', kind: 'concrete', c: '#8fa0a0' }
];
const TILE = id => TILES.find(t => t.id === id) || TILES[0];
const TILE_COVER = [['none', 'No tiles'], ['splash', 'Backsplash'], ['dado', 'Dado (to 2.1 m)'], ['full', 'Floor to ceiling']];
const TILE_SIZE = { plank: 2, herring: 1.6, tile: 1.2, checker: 1.2, subway: .6, hex: .6, moroccan: .8, terrazzo: 1, mosaic: .4, marble: 2.4, granite: 1.2, quartz: 1.2, concrete: 2.4, carpet: 2.4, laminate: 2 };
const DEFAULT_STYLE = { counter: 'granite-black', handle: 'bar', tile: 'subway-white', tileCover: 'splash' };
const styleOf = () => Object.assign({}, DEFAULT_STYLE, S.room && S.room.style);

/* shared materials */
const M_ = {
  carcass: () => mat('laminate', '#ece9e2'), kick: () => flat('#2c2c2e', { roughness: .7 }), steel: () => mat('metal', '#c3c6ca'),
  dark: () => flat('#1d1e20', { roughness: .35 }), blackGlass: () => flat('#101113', { roughness: .08, metalness: .3 }), brass: () => mat('metal', '#c3a35b'),
  chrome: () => flat('#d7dadd', { roughness: .2, metalness: .8 }), led: () => flat('#fff6df', { emissive: '#fff1cc', emissiveIntensity: .9 }), white: () => flat('#f4f4f2', { roughness: .4 })
};

/* ── builder helpers ── */
function addHandle(g, hs, x, y, z, vertical, len = .14) {
  if (hs === 'gola') return;
  if (hs === 'knob') { const k = cyl(.012, .012, .026, M_.steel(), 0, 0, 0, 12); k.position.set(x, y, z + .013); k.rotation.x = Math.PI / 2; g.add(k); return; }
  if (hs === 'edge') { g.add(bx(vertical ? .012 : len, vertical ? len : .012, .022, M_.brass(), x, y - (vertical ? len / 2 : .006), z + .011)); return; }
  g.add(bx(vertical ? .012 : len, vertical ? len : .012, .012, M_.steel(), x, y - (vertical ? len / 2 : .006), z + .024));
}
/* shutters on the front face: W wide, from y0 up H; zf = centre of the shutter thickness */
function fronts(g, W, y0, H, zf, type, F, hs, wall) {
  const gap = .004, T = .018, P = (w, hh, x, y, m = F) => g.add(bx(w - gap, hh - gap, T, m, x, y + gap / 2, zf));
  const doors = (n, glass) => {
    const dw = W / n;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + dw * (i + .5);
      if (glass) { const b = .05; P(b, H, x - dw / 2 + b / 2, y0); P(b, H, x + dw / 2 - b / 2, y0); P(dw - b * 2, b, x, y0); P(dw - b * 2, b, x, y0 + H - b); const gl = new THREE.Mesh(new THREE.PlaneGeometry(dw - b * 2, H - b * 2), glassMat); gl.position.set(x, y0 + H / 2, zf); g.add(gl); }
      else P(dw, H, x, y0);
      const side = n === 1 ? 1 : (i % 2 === 0 ? 1 : -1);
      addHandle(g, hs, x + side * (dw / 2 - .04), wall ? y0 + .17 : y0 + H - .05, zf + T / 2, true);
    }
  };
  const drawers = fr => { let y = y0; fr.forEach(f => { const hh = H * f; P(W, hh, 0, y); addHandle(g, hs, 0, y + hh - .05, zf + T / 2, false, Math.min(.3, W * .45)); y += hh; }); };
  switch (type) {
    case '1door': doors(1); break;
    case '2door': doors(W < .5 ? 1 : 2); break;
    case 'glass': doors(W < .5 ? 1 : 2, true); break;
    case '2drawer': drawers([.55, .45]); break;
    case '3drawer': drawers([.4, .33, .27]); break;
    case '4drawer': drawers([.28, .26, .24, .22]); break;
    case 'lift': P(W, H, 0, y0); addHandle(g, hs, 0, y0 + .06, zf + T / 2, false, Math.min(.4, W * .6)); break;
    case 'blind': { const dw = Math.min(.45, W), bw = W - dw; if (bw > .01) P(bw, H, -W / 2 + bw / 2, y0); P(dw, H, W / 2 - dw / 2, y0); addHandle(g, hs, W / 2 - dw + .04, y0 + H - .05, zf + T / 2, true); break; }
  }
  if (hs === 'gola' && !wall) g.add(bx(W, .028, .012, M_.dark(), 0, y0 + H - .03, zf + .012));
}
function hollow(g, W, H, D, y, side, inner) { // open carcass with one shelf
  g.add(bx(.018, H, D, side, -W / 2 + .009, y, 0), bx(.018, H, D, side, W / 2 - .009, y, 0), bx(W, .018, D, side, 0, y, 0), bx(W, .018, D, side, 0, y + H - .018, 0), bx(W - .036, H, .01, inner, 0, y, -D / 2 + .005), bx(W - .036, .018, D - .02, inner, 0, y + H / 2, .01));
}
function worktop(g, W, D, st, hole) {
  const m = counterMat(st), y = COUNTER_H - WT, z0 = -D / 2, z1 = D / 2 + .02;
  if (!hole) { g.add(bx(W, WT, z1 - z0, m, 0, y, (z0 + z1) / 2)); return; }
  const { x0, x1, hz0, hz1 } = hole;
  g.add(bx(W, WT, hz0 - z0, m, 0, y, (z0 + hz0) / 2), bx(W, WT, z1 - hz1, m, 0, y, (hz1 + z1) / 2));
  if (x0 > -W / 2) g.add(bx(x0 + W / 2, WT, hz1 - hz0, m, (-W / 2 + x0) / 2, y, (hz0 + hz1) / 2));
  if (x1 < W / 2) g.add(bx(W / 2 - x1, WT, hz1 - hz0, m, (x1 + W / 2) / 2, y, (hz0 + hz1) / 2));
}
function baseBody(g, W, D, F, ctx, type) {
  g.add(bx(W - .02, PLINTH, D - .07, M_.kick(), 0, 0, -.035));
  const bodyH = COUNTER_H - WT - PLINTH;
  if (type === 'open') hollow(g, W, bodyH, D - .02, PLINTH, F, M_.carcass());
  else { g.add(bx(W, bodyH, D - .02, M_.carcass(), 0, PLINTH, -.01)); fronts(g, W, PLINTH, bodyH, D / 2 - .011, type, F, ctx.style.handle, false); }
}
function burners(g, n, gw, y, zc) {
  const L = { 2: [[-.13, 0], [.13, 0]], 3: [[-.2, .07], [0, -.08], [.2, .07]], 4: [[-.14, -.1], [.14, -.1], [-.14, .1], [.14, .1]], 5: [[-.22, -.1], [.22, -.1], [-.22, .1], [.22, .1], [0, 0]] }[n] || [];
  const k = gw / .6;
  for (const [bx_, bz] of L) {
    const x = bx_ * k, z = zc + bz;
    g.add(cyl(.06, .06, .012, flat('#2a2a2c', { roughness: .5 }), x, y, z, 20), cyl(.036, .036, .02, M_.brass(), x, y + .012, z, 16));
    g.add(bx(.17, .012, .012, M_.dark(), x, y + .028, z), bx(.012, .012, .17, M_.dark(), x, y + .028, z));
  }
  return L.length;
}
function knobRow(g, n, W, y, z) { for (let i = 0; i < n; i++) { const k = cyl(.018, .018, .02, M_.dark(), 0, 0, 0, 14); k.position.set(-W / 2 + W * (i + .5) / n, y, z); k.rotation.x = Math.PI / 2; g.add(k); } }

/* ── registry ── */
const PRODUCTS = [], PMAP = {};
function product(def) { def.variants.forEach((v, i) => v.i = i); def.opts = def.opts || []; PRODUCTS.push(def); PMAP[def.id] = def; }
const P = id => PMAP[id];
const defCfg = p => Object.fromEntries(p.opts.map(o => [o.key, o.def ?? o.values[0][0]]));
const optLabel = (p, key, val) => { const o = p.opts.find(x => x.key === key), e = o && o.values.find(x => x[0] === val); return e ? e[1] : String(val); };
const WOPT = (list, def) => ({ key: 'w', label: 'Width', values: list.map(w => [w, w + ' cm']), def });
const fin = v => finMat(v.fin);
const colorVariants = list => list.map(([n, sw, kind, c, extra]) => ({ n, sw, kind, c, extra }));
const vMat = v => v.kind === 'flat' ? flat(v.c, v.extra) : mat(v.kind, v.c, null, v.extra);
function dimsOf(p, cfg, R = S.room) {
  cfg = cfg || defCfg(p);
  const d0 = p.dims ? p.dims(cfg) : { w: cfg.w || p.w, d: p.d, h: p.h };
  const y0 = typeof p.y0 === 'function' ? p.y0(R || { h: 2.7 }, cfg) : (p.y0 || 0);
  let h = d0.h / 100; if (p.toCeiling) h = Math.max(.3, (R ? R.h : 2.7) - y0 - .005);
  return { w: d0.w / 100, d: d0.d / 100, h, y0 };
}
const FRONT_BASE = [['2door', '2 doors'], ['1door', '1 door'], ['3drawer', '3 drawers'], ['2drawer', '2 drawers'], ['4drawer', '4 drawers'], ['open', 'Open shelves'], ['blind', 'Blind corner']];
const FRONT_WALL = [['2door', '2 doors'], ['1door', '1 door'], ['glass', 'Glass doors'], ['lift', 'Lift-up flap'], ['open', 'Open shelves']];
const FRONT_EXTRA = { '1door': 0, '2door': 1500, '2drawer': 5500, '3drawer': 8000, '4drawer': 10500, open: -2000, blind: 1200, glass: 2500, lift: 3500 };

/* — essentials — */
product({
  id: 'sink-unit', name: 'SINK UNIT', type: 'Sink base unit', cat: 'Essentials', role: 'sink', essential: 'sink', mount: 'floor', snap: true, counter: true, w: 90, d: 60, h: 90, rating: 4, reviews: 812,
  opts: [WOPT([60, 75, 90, 120], 90), { key: 'bowl', label: 'Sink', values: [['drainer', 'Bowl + drainboard'], ['single', 'Single bowl'], ['double', 'Double bowl']] }, { key: 'sink', label: 'Sink material', values: [['steel', 'Stainless steel'], ['black', 'Black quartz']] }],
  variants: FIN_VARIANTS(), desc: (c, v) => `Sink unit ${c.w} cm, ${optLabel(P('sink-unit'), 'bowl', c.bowl).toLowerCase()}, ${c.sink === 'black' ? 'black quartz' : 'steel'} sink, ${v.n}`,
  price: (c, v) => Math.round((11000 + c.w * 80) * v.fin.mult + { single: 4500, double: 7500, drainer: 6500 }[c.bowl] + (c.sink === 'black' ? 4000 : 0)),
  goes: ['wall-cab', 'ro', 'base-cab'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, F = fin(v);
    baseBody(g, W, D, F, ctx, W < .6 ? '1door' : '2door');
    const sw = Math.min(W - .1, c.bowl === 'single' ? .52 : c.bowl === 'double' ? .82 : .86), hole = { x0: -sw / 2, x1: sw / 2, hz0: -.2, hz1: .24 };
    worktop(g, W, D, ctx.style, hole);
    const inner = c.sink === 'black' ? flat('#2b2b2d', { roughness: .55, side: THREE.BackSide }) : flat('#b8bcc1', { roughness: .32, metalness: .35, side: THREE.BackSide });
    const rim = c.sink === 'black' ? flat('#2b2b2d', { roughness: .5 }) : mat('metal', '#c8cbcf');
    const top = COUNTER_H, depth = .2, hd = hole.hz1 - hole.hz0, cz = (hole.hz0 + hole.hz1) / 2;
    const bowl = (x0, x1) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, depth, hd - .02), inner); b.position.set((x0 + x1) / 2, top - depth / 2 - .001, cz); b.receiveShadow = true; g.add(b); };
    if (c.bowl === 'single') bowl(-sw / 2 + .01, sw / 2 - .01);
    else if (c.bowl === 'double') { bowl(-sw / 2 + .01, -.01); bowl(.01, sw / 2 - .01); }
    else { bowl(-sw / 2 + .01, -sw / 2 + .47); const dbw = sw - .48; g.add(bx(dbw, .006, hd - .02, rim, sw / 2 - .01 - dbw / 2, top - .006, cz)); for (let i = 1; i < 6; i++) g.add(bx(dbw - .04, .003, .006, flat('#8d9196'), sw / 2 - .01 - dbw / 2, top, hole.hz0 + .01 + i * (hd - .02) / 6)); }
    g.add(bx(sw, .004, .015, rim, 0, top, hole.hz0 + .0075), bx(sw, .004, .015, rim, 0, top, hole.hz1 - .0075), bx(.015, .004, hd, rim, -sw / 2 + .0075, top, cz), bx(.015, .004, hd, rim, sw / 2 - .0075, top, cz));
    const fx = c.bowl === 'drainer' ? -sw / 2 + .24 : 0, ch = M_.chrome();
    g.add(cyl(.025, .028, .04, ch, fx, top, -.26, 14), cyl(.012, .012, .3, ch, fx, top + .04, -.26, 10));
    const sp = cyl(.011, .011, .2, ch, 0, 0, 0, 10); sp.rotation.x = Math.PI / 2; sp.position.set(fx, top + .33, -.17); g.add(sp);
    return g;
  }
});
product({
  id: 'hob-unit', name: 'HOB UNIT', type: 'Hob base unit with built-in gas hob', cat: 'Essentials', role: 'stove', essential: 'stove', mount: 'floor', snap: true, counter: true, w: 75, d: 60, h: 90, rating: 4, reviews: 640,
  opts: [WOPT([60, 75, 90], 75), { key: 'burners', label: 'Burners', values: [[4, '4 burners'], [3, '3 burners'], [2, '2 burners'], [5, '5 burners']] }, { key: 'below', label: 'Below the hob', values: [['drawers', 'Deep drawers'], ['oven', 'Built-in oven']] }],
  variants: FIN_VARIANTS(), desc: (c, v) => `Hob unit ${c.w} cm, ${c.burners}-burner glass hob${c.below === 'oven' ? ' + built-in oven' : ''}, ${v.n}`,
  price: (c, v) => Math.round((10500 + c.w * 80) * v.fin.mult + { 2: 8000, 3: 12000, 4: 16000, 5: 22000 }[c.burners] + (c.below === 'oven' ? 32000 : 0)),
  goes: ['chimney', 'base-cab', 'wall-cab'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, F = fin(v), hs = ctx.style.handle;
    g.add(bx(W - .02, PLINTH, D - .07, M_.kick(), 0, 0, -.035));
    const bodyH = COUNTER_H - WT - PLINTH; g.add(bx(W, bodyH, D - .02, M_.carcass(), 0, PLINTH, -.01));
    if (c.below === 'oven') {
      fronts(g, W, PLINTH, .14, D / 2 - .011, '1door', F, hs, false);
      const oy = PLINTH + .15, oh = bodyH - .16; g.add(bx(W - .02, oh, .02, M_.blackGlass(), 0, oy, D / 2 - .01), bx(W - .02, .06, .022, M_.steel(), 0, oy + oh - .06, D / 2 - .009));
      g.add(bx(W * .6, .015, .015, M_.chrome(), 0, oy + oh - .1, D / 2 + .02));
    } else fronts(g, W, PLINTH, bodyH, D / 2 - .011, '2drawer', F, hs, false);
    worktop(g, W, D, ctx.style);
    const gw = Math.min(W - .04, c.burners >= 5 ? .86 : c.burners === 4 ? .6 : c.burners === 2 ? .32 : .72);
    g.add(bx(gw, .008, .52, M_.blackGlass(), 0, COUNTER_H, -.01));
    burners(g, c.burners, gw, COUNTER_H + .008, -.03); knobRow(g, c.burners, gw * .7, COUNTER_H + .02, .22);
    return g;
  }
});
product({
  id: 'gas-stove', name: 'GAS STOVE', type: 'Freestanding glass-top gas stove', cat: 'Essentials', role: 'stove', essential: 'stove', mount: 'counter', w: 70, d: 50, h: 12, rating: 4, reviews: 2300,
  opts: [{ key: 'burners', label: 'Burners', values: [[3, '3 burners'], [2, '2 burners'], [4, '4 burners']] }], dims: c => ({ w: { 2: 60, 3: 70, 4: 75 }[c.burners], d: 50, h: 12 }),
  variants: colorVariants([['Black glass', '#1a1a1c', 'flat', '#1a1a1c', { roughness: .1, metalness: .3 }], ['Steel body', '#c3c6ca', 'metal', '#c3c6ca']]),
  desc: (c, v) => `Gas stove, ${c.burners} burners, ${v.n.toLowerCase()}`, price: c => ({ 2: 3490, 3: 5490, 4: 7490 }[c.burners]), goes: ['chimney'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D; g.add(rbx(W, .08, D, .01, M_.steel(), 0, 0, 0), bx(W - .01, .01, D - .02, vMat(v), 0, .08, 0)); burners(g, c.burners, W - .1, .09, -.02); knobRow(g, c.burners, W * .6, .04, D / 2 + .01); return g; }
});
product({
  id: 'chimney', name: 'CHIMNEY', type: 'Kitchen chimney (exhaust hood)', cat: 'Essentials', role: 'chimney', essential: 'chimney', mount: 'wall', w: 75, d: 50, h: 100, y0: 1.55, toCeiling: true, rating: 4, reviews: 1500,
  opts: [WOPT([60, 75, 90], 75), { key: 'style', label: 'Style', values: [['pyramid', 'Pyramid'], ['tshape', 'Straight T-shape'], ['curved', 'Curved glass'], ['filterless', 'Filterless angled']] }],
  variants: colorVariants([['Stainless steel', '#c3c6ca', 'metal', '#c3c6ca'], ['Black glass', '#1b1c1e', 'flat', '#1b1c1e', { roughness: .12, metalness: .3 }], ['Matte white', '#f1f1ef', 'flat', '#f1f1ef', { roughness: .5 }]]),
  desc: (c, v) => `Chimney ${c.w} cm, ${optLabel(P('chimney'), 'style', c.style).toLowerCase()}, ${v.n.toLowerCase()}, 1200 m³/h suction`,
  price: (c, v) => ({ 60: 13990, 75: 16490, 90: 18990 }[c.w] + { pyramid: 0, tshape: 3000, curved: 6000, filterless: 9000 }[c.style] + (v.i === 1 ? 1500 : 0)), goes: ['hob-unit', 'wall-cab'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, m = vMat(v), bz = -D / 2; let top = .5;
    if (c.style === 'pyramid') { g.add(bx(W, .05, D, m, 0, 0, 0)); const f = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.22, 1, .4, 4, 1), m)); f.rotation.y = Math.PI / 4; f.scale.set(W / 2 / .7071, 1, D / 2 / .7071); f.position.set(0, .25, 0); g.add(f); top = .45; }
    else if (c.style === 'tshape') { g.add(bx(W, .05, D, m, 0, 0, 0), bx(W - .02, .03, .02, M_.blackGlass(), 0, .01, D / 2), bx(.3, .45, .28, m, 0, .05, bz + .14)); }
    else if (c.style === 'curved') { g.add(bx(W, .035, .3, m, 0, 0, bz + .15), bx(.3, .45, .28, m, 0, .035, bz + .14)); const gl = bx(W, .012, D - .02, flat('#202226', { roughness: .05, metalness: .4, transparent: true, opacity: .85 }), 0, 0, 0); gl.rotation.x = -.35; gl.position.set(0, .12, .02); g.add(gl); }
    else { const box = bx(W, .4, .3, m, 0, 0, bz + .15); g.add(box); const pnl = bx(W, .02, .36, M_.blackGlass(), 0, 0, 0); pnl.rotation.x = -.9; pnl.position.set(0, .22, bz + .3); g.add(pnl); top = .4; }
    g.add(bx(.06, .01, .06, M_.led(), -W / 4, -.005, 0), bx(.06, .01, .06, M_.led(), W / 4, -.005, 0));
    g.add(bx(.28, Math.max(.05, ctx.H - top), .24, m, 0, top, bz + .12));
    return g;
  }
});

/* — base cabinets — */
product({
  id: 'base-cab', name: 'BASE CABINET', type: 'Base cabinet with worktop', cat: 'Base cabinets', role: 'base', mount: 'floor', snap: true, counter: true, w: 60, d: 60, h: 90, rating: 4, reviews: 1980,
  opts: [WOPT([30, 45, 60, 75, 90, 120], 60), { key: 'front', label: 'Fronts', values: FRONT_BASE }],
  variants: FIN_VARIANTS(), desc: (c, v) => `Base cabinet ${c.w} cm, ${optLabel(P('base-cab'), 'front', c.front).toLowerCase()}, ${v.n}`,
  price: (c, v) => Math.round((8000 + c.w * 85 + FRONT_EXTRA[c.front]) * v.fin.mult), goes: ['wall-cab', 'microwave', 'mixer'],
  build(c, v, ctx) { const g = new THREE.Group(); baseBody(g, ctx.W, ctx.D, fin(v), ctx, c.front); worktop(g, ctx.W, ctx.D, ctx.style); return g; }
});
product({
  id: 'dishwasher', name: 'DISHWASHER', type: 'Built-under dishwasher', cat: 'Base cabinets', role: 'base', mount: 'floor', snap: true, counter: true, w: 60, d: 60, h: 90, rating: 4, reviews: 410,
  opts: [WOPT([60, 45], 60)], variants: colorVariants([['Steel front', '#c3c6ca', 'metal', '#c3c6ca'], ['Black front', '#222326', 'flat', '#222326', { roughness: .3 }]]),
  desc: (c, v) => `Dishwasher ${c.w} cm, ${c.w === 60 ? '13' : '9'} place settings, ${v.n.toLowerCase()}`, price: c => c.w === 60 ? 38990 : 34990, goes: ['sink-unit'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D; g.add(bx(W - .02, PLINTH, D - .07, M_.kick(), 0, 0, -.035), bx(W, COUNTER_H - WT - PLINTH, D - .02, M_.carcass(), 0, PLINTH, -.01)); g.add(bx(W - .004, .66, .02, vMat(v), 0, PLINTH + .004, D / 2 - .01), bx(W - .004, .08, .022, M_.dark(), 0, PLINTH + .672, D / 2 - .009), bx(W * .7, .014, .014, M_.chrome(), 0, PLINTH + .6, D / 2 + .016)); worktop(g, W, D, ctx.style); return g; }
});

/* — wall units — */
product({
  id: 'wall-cab', name: 'WALL CABINET', type: 'Wall-mounted cabinet', cat: 'Wall units', role: 'wall', mount: 'wall', w: 60, d: 35, h: 70, y0: WALL_Y, rating: 4, reviews: 1430,
  opts: [WOPT([30, 45, 60, 75, 90], 60), { key: 'front', label: 'Fronts', values: FRONT_WALL }, { key: 'hh', label: 'Height', values: [[70, '70 cm'], [60, '60 cm'], [90, '90 cm']] }],
  dims: c => ({ w: c.w, d: 35, h: c.hh }), variants: FIN_VARIANTS(), desc: (c, v) => `Wall cabinet ${c.w}×${c.hh} cm, ${optLabel(P('wall-cab'), 'front', c.front).toLowerCase()}, ${v.n}`,
  price: (c, v) => Math.round((5500 + c.w * 60 + c.hh * 20 + FRONT_EXTRA[c.front]) * v.fin.mult), goes: ['chimney', 'base-cab'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H, F = fin(v);
    if (c.front === 'open') hollow(g, W, H, D, 0, F, M_.carcass());
    else { g.add(bx(W, H, D - .02, M_.carcass(), 0, 0, -.01)); fronts(g, W, 0, H, D / 2 - .011, c.front, F, ctx.style.handle, true); }
    g.add(bx(W - .04, .008, .025, M_.led(), 0, -.008, D / 2 - .08));
    return g;
  }
});
product({
  id: 'loft', name: 'OVERHEAD LOFT', type: 'Loft storage up to the ceiling', cat: 'Wall units', role: 'loft', mount: 'wall', w: 90, d: 60, h: 50, y0: R => Math.max(2.15, R.h - .6), toCeiling: true, rating: 4, reviews: 300,
  opts: [WOPT([60, 90, 120], 90)], variants: FIN_VARIANTS(), desc: (c, v) => `Overhead loft ${c.w} cm, lift-up shutters, ${v.n}`,
  price: (c, v) => Math.round((4500 + c.w * 55) * v.fin.mult), goes: ['wall-cab'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H; g.add(bx(W, H, D - .02, M_.carcass(), 0, 0, -.01)); fronts(g, W, 0, H, D / 2 - .011, W >= .9 ? '2door' : '1door', fin(v), ctx.style.handle === 'gola' ? 'knob' : ctx.style.handle, true); return g; }
});
product({
  id: 'shelf', name: 'OPEN SHELF', type: 'Floating wall shelf with jars', cat: 'Wall units', role: 'shelf', mount: 'wall', w: 90, d: 25, h: 30, y0: 1.5, rating: 4, reviews: 520,
  opts: [WOPT([60, 90, 120], 90)], variants: colorVariants([['Oak', '#c5a06b', 'wood', '#c5a06b'], ['Walnut', '#6a4430', 'wood', '#6a4430'], ['White', '#f1efea', 'laminate', '#f1efea']]),
  desc: (c, v) => `Open shelf ${c.w} cm, ${v.n.toLowerCase()}`, price: c => 1500 + c.w * 30, goes: ['wall-cab'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D, r = rng(Math.round(W * 100)); g.add(bx(W, .03, D, vMat(v), 0, 0, 0)); for (let x = -W / 2 + .08; x < W / 2 - .06; x += .1 + r() * .05) { const jh = .1 + r() * .1; g.add(cyl(.035, .035, jh, r() < .5 ? glassMat : M_.steel(), x, .03, -.02, 14)); } return g; }
});
product({
  id: 'ro', name: 'WATER PURIFIER', type: 'RO + UV water purifier (wall-mounted)', cat: 'Appliances', role: 'ro', mount: 'wall', w: 30, d: 16, h: 46, y0: 1.2, rating: 4, reviews: 3100,
  variants: colorVariants([['White & blue', '#f3f3f1', 'flat', '#f3f3f1', { roughness: .35 }], ['Black', '#1f2023', 'flat', '#1f2023', { roughness: .3 }]]),
  desc: (c, v) => `RO + UV water purifier, 8 L tank, ${v.n.toLowerCase()}`, price: () => 13990, goes: ['sink-unit'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H; g.add(rbx(W, H, D, .03, vMat(v), 0, 0, 0), bx(W * .5, .06, .005, flat('#3d8fd0', { emissive: '#3d8fd0', emissiveIntensity: .4 }), 0, H * .62, D / 2), cyl(.012, .012, .06, M_.chrome(), 0, -.05, D / 2 - .03, 8)); return g; }
});

/* — tall units — */
product({
  id: 'tall', name: 'TALL UNIT', type: 'Tall storage unit', cat: 'Tall units', role: 'tall', mount: 'floor', snap: true, w: 60, d: 60, h: 210, rating: 4, reviews: 700,
  opts: [WOPT([60, 45], 60), { key: 'cfg', label: 'Configuration', values: [['pantry', 'Pantry'], ['oven', 'Oven + microwave'], ['broom', 'Broom cupboard']] }],
  variants: FIN_VARIANTS(), desc: (c, v) => `Tall unit ${c.w} cm, ${optLabel(P('tall'), 'cfg', c.cfg).toLowerCase()}, ${v.n}`,
  price: (c, v) => Math.round((20000 + c.w * 120) * v.fin.mult + (c.cfg === 'oven' ? 46000 : 0)), goes: ['fridge', 'base-cab'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, F = fin(v), hs = ctx.style.handle, z = D / 2 - .011;
    g.add(bx(W - .02, PLINTH, D - .07, M_.kick(), 0, 0, -.035), bx(W, TALL_H - PLINTH, D - .02, M_.carcass(), 0, PLINTH, -.01));
    if (c.cfg === 'pantry') { fronts(g, W, PLINTH, 1.25, z, '2door', F, hs, false); fronts(g, W, PLINTH + 1.25, TALL_H - PLINTH - 1.25, z, '2door', F, hs, true); }
    else if (c.cfg === 'broom') fronts(g, W, PLINTH, TALL_H - PLINTH, z, '1door', F, hs, false);
    else {
      fronts(g, W, PLINTH, .62, z, '2drawer', F, hs, false);
      g.add(bx(W - .02, .58, .02, M_.blackGlass(), 0, .74, D / 2 - .01), bx(W - .02, .06, .022, M_.steel(), 0, 1.26, D / 2 - .009), bx(W * .6, .014, .014, M_.chrome(), 0, 1.2, D / 2 + .02));
      g.add(bx(W - .02, .36, .02, flat('#1b1c1f', { roughness: .1 }), 0, 1.36, D / 2 - .01), bx(W * .55, .24, .004, glassMat, -W * .12, 1.42, D / 2 + .002));
      fronts(g, W, 1.74, TALL_H - 1.74, z, 'lift', F, hs, true);
    }
    return g;
  }
});
product({
  id: 'fridge', name: 'REFRIGERATOR', type: 'Frost-free refrigerator', cat: 'Tall units', role: 'fridge', mount: 'floor', snap: true, w: 70, d: 70, h: 175, rating: 4, reviews: 5200,
  opts: [{ key: 'type', label: 'Type', values: [['double', 'Double door, 340 L'], ['single', 'Single door, 190 L'], ['sxs', 'Side-by-side, 650 L']] }],
  dims: c => ({ single: { w: 60, d: 66, h: 150 }, double: { w: 70, d: 70, h: 175 }, sxs: { w: 91, d: 74, h: 178 } }[c.type]),
  variants: colorVariants([['Inox steel', '#b9bcbf', 'metal', '#b9bcbf'], ['Black matte', '#26272a', 'flat', '#26272a', { roughness: .45 }], ['Wine red', '#7a2430', 'flat', '#7a2430', { roughness: .25 }]]),
  desc: (c, v) => `Refrigerator, ${optLabel(P('fridge'), 'type', c.type).toLowerCase()}, ${v.n.toLowerCase()}`, price: c => ({ single: 16990, double: 27990, sxs: 64990 }[c.type]), goes: ['tall', 'loft'],
  build(c, v, ctx) {
    const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H, m = vMat(v), ch = M_.chrome(), zf = D / 2 - .015;
    g.add(rbx(W, H - .02, D - .04, .02, m, 0, .02, -.02), bx(W - .04, .02, D - .1, M_.dark(), 0, 0, -.03));
    const door = (w, h, x, y) => g.add(rbx(w - .006, h - .006, .03, .008, m, x, y, zf));
    if (c.type === 'single') { door(W, H - .04, 0, .03); g.add(bx(.02, .4, .02, ch, W / 2 - .05, H * .5, zf + .025)); }
    else if (c.type === 'double') { const fh = H * .28; door(W, H - fh - .04, 0, .03); door(W, fh, 0, H - fh - .01); g.add(bx(.02, .45, .02, ch, W / 2 - .05, H * .38, zf + .025), bx(.02, .16, .02, ch, W / 2 - .05, H - fh + .02, zf + .025)); }
    else { door(W / 2, H - .04, -W / 4, .03); door(W / 2, H - .04, W / 4, .03); g.add(bx(.02, .7, .02, ch, -.03, H * .32, zf + .025), bx(.02, .7, .02, ch, .03, H * .32, zf + .025), bx(.2, .3, .01, M_.dark(), -W / 4, H * .55, zf + .016)); }
    return g;
  }
});

/* — counter-top appliances — */
product({
  id: 'microwave', name: 'MICROWAVE', type: 'Convection microwave, 28 L', cat: 'Appliances', role: 'counter-appliance', mount: 'counter', w: 51, d: 40, h: 30, rating: 4, reviews: 4100,
  variants: colorVariants([['Black', '#1c1d20', 'flat', '#1c1d20', { roughness: .3 }], ['Steel', '#c3c6ca', 'metal', '#c3c6ca'], ['White', '#f2f2f0', 'flat', '#f2f2f0', { roughness: .4 }]]),
  desc: (c, v) => `Convection microwave 28 L, ${v.n.toLowerCase()}`, price: () => 11990, goes: ['base-cab'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H; g.add(rbx(W, H, D, .015, vMat(v), 0, 0, 0), bx(W * .66, H * .78, .005, M_.blackGlass(), -W * .13, H * .11, D / 2), bx(W * .2, H * .7, .005, M_.dark(), W * .36, H * .15, D / 2), bx(W * .14, .03, .005, flat('#49c27a', { emissive: '#49c27a', emissiveIntensity: .5 }), W * .36, H * .72, D / 2 + .002)); return g; }
});
product({
  id: 'otg', name: 'OTG OVEN', type: 'Oven-toaster-grill, 30 L', cat: 'Appliances', role: 'counter-appliance', mount: 'counter', w: 52, d: 37, h: 32, rating: 4, reviews: 1900,
  variants: colorVariants([['Steel', '#c3c6ca', 'metal', '#c3c6ca'], ['Black', '#1c1d20', 'flat', '#1c1d20', { roughness: .3 }]]),
  desc: (c, v) => `OTG oven 30 L with rotisserie, ${v.n.toLowerCase()}`, price: () => 7490, goes: ['base-cab'],
  build(c, v, ctx) { const g = new THREE.Group(), W = ctx.W, D = ctx.D, H = ctx.H; g.add(rbx(W, H, D, .012, vMat(v), 0, 0, 0), bx(W * .66, H * .65, .005, flat('#2a2018', { roughness: .1, transparent: true, opacity: .9 }), -W * .12, H * .17, D / 2)); knobRow(g, 3, .05, 0, 0); g.children.slice(-3).forEach((k, i) => k.position.set(W * .36, H * (.25 + i * .22), D / 2 + .01)); return g; }
});
product({
  id: 'mixer', name: 'MIXER GRINDER', type: 'Mixer grinder, 750 W, 3 jars', cat: 'Appliances', role: 'counter-appliance', mount: 'counter', w: 25, d: 25, h: 40, rating: 4, reviews: 8800,
  variants: colorVariants([['White & red', '#f2f2f0', 'flat', '#f2f2f0', { roughness: .4 }], ['Black & steel', '#1f2023', 'flat', '#1f2023', { roughness: .35 }]]),
  desc: (c, v) => `Mixer grinder 750 W with 3 jars, ${v.n.toLowerCase()}`, price: () => 3990, goes: ['base-cab'],
  build(c, v, ctx) { const g = new THREE.Group(); g.add(rbx(.22, .14, .22, .03, vMat(v), 0, 0, 0), cyl(.075, .06, .2, glassMat, 0, .14, 0, 18), cyl(.08, .08, .03, M_.dark(), 0, .34, 0, 18), cyl(.012, .012, .03, flat('#c9473d'), .08, .05, .11, 10)); return g; }
});
product({
  id: 'stool', name: 'BAR STOOL', type: 'Counter-height bar stool', cat: 'Appliances', role: 'stool', mount: 'floor', w: 40, d: 40, h: 75, rating: 4, reviews: 260,
  variants: colorVariants([['Oak & black', '#c5a06b', 'wood', '#c5a06b'], ['Rattan', '#c8a265', 'rattan', '#c8a265'], ['Grey fabric', '#8a8d90', 'fabric', '#8a8d90']]),
  desc: (c, v) => `Bar stool, 65 cm seat height, ${v.n.toLowerCase()}`, price: () => 3490, goes: [],
  build(c, v, ctx) { const g = new THREE.Group(); g.add(cyl(.19, .19, .05, vMat(v), 0, .65, 0, 24)); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, l = cyl(.012, .012, .66, M_.dark(), Math.cos(a) * .13, 0, Math.sin(a) * .13, 8); l.rotation.set(Math.sin(a) * .12, 0, -Math.cos(a) * .12); g.add(l); } g.add(cyl(.15, .15, .01, M_.dark(), 0, .25, 0, 24)); return g; }
});

/* ═══════════════ 4 · rooms, kitchen templates & style tables ═══════════════ */
const WALL_COLORS = ['#f0efeb', '#d1c7bb', '#e2d3c7', '#ad5a22', '#8f5646', '#bccace', '#6a8794', '#929a79', '#87847d', '#9a8678', '#77566d', '#5a766b'];
const DEFAULT_WALL = WALL_COLORS[0];
const FLOORS = [
  ['White vitrified 60×60', 'tile', '#efefec', '#cfcfcb'], ['Ivory vitrified 60×60', 'tile', '#e9e1d0', '#c9bfa9'], ['Grey matte vitrified', 'tile', '#9a9b9d', '#77787a'], ['Anti-skid beige', 'tile', '#cdbb9c', '#a8977a'],
  ['Kota stone', 'concrete', '#8fa0a0'], ['Black granite', 'granite', '#1f1f22', '#7f7a72'], ['Terracotta tile', 'tile', '#b5663f', '#6e3b22'], ['Checkerboard', 'checker', '#efefea', '#2b2b2b'],
  ['Italian marble', 'marble', '#ecebe7'], ['Wood-look tile', 'plank', '#b98a5a'], ['Moroccan cement', 'moroccan', '#efe8da', '#b0563a'], ['Hex cement', 'hex', '#d9d4ca', '#f2efe8'],
  ['Terrazzo', 'terrazzo', '#e6e1d8'], ['Polished concrete', 'concrete', '#8e8e8c'], ['Herringbone wood', 'herring', '#b98a5a']
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
  { id: 'w1', name: 'Glass Window Single', w: 1.0, h: 1.0, leaves: 1, mode: 'grid', sill: 1.05 },
  { id: 'w2', name: 'Glass Window Double', w: 1.5, h: 1.0, leaves: 2, mode: 'grid', sill: 1.05 }
].map(d => Object.assign(d, { kind: 'window' }));
const STYLE = {}; [...DOORS, ...WINDOWS].forEach(s => STYLE[s.id] = s);
const feat = (wall, style, u, extra) => { const s = STYLE[style]; return Object.assign({ id: uid(), wall, style, kind: s.kind, u, w: s.w, h: s.h, sill: s.sill }, extra || {}); };

/* Kitchen templates. Runs list units along a wall from its start (cm from the west end for N/S walls, from the north end for W/E walls).
   ['gap', cm] skips space. extras: [pid, cfg, v, wall, along-centre cm]; free: [pid, cfg, v, x, z, rot] (metres from room centre). */
const B = (front, w, v = 0) => ['base-cab', { w, front }, v];
const WC = (w, front = '2door', v = 0, hh = 70) => ['wall-cab', { w, front, hh }, v];
const KITCHENS = [
  { id: 'k-straight', kind: 'layout', name: 'Straight kitchen', blurb: 'Single wall · fridge, hob and sink in one run', W: 3.2, D: 2.4, ceil: 2.75, wall: 0, floor: 'f0', style: { counter: 'granite-black', tile: 'subway-white', handle: 'bar' }, fin: 0,
    feats: () => [feat('N', 'w1', 2.65), feat('S', 'single', 1.0)],
    runs: [['N', 0, [['fridge', { type: 'double' }, 0], B('3drawer', 60), ['hob-unit', { w: 75, burners: 4 }], B('1door', 45), ['sink-unit', { w: 60, bowl: 'single' }]]],
      ['N', 0, [['loft', { w: 60 }], ['gap', 10], WC(60), ['chimney', { w: 75, style: 'pyramid' }], ['gap', 5]]]],
    extras: [['microwave', {}, 0, 'N', 100]] },
  { id: 'k-l', kind: 'layout', name: 'L-shaped kitchen', blurb: 'Two walls · sink under the window, hob on the long run', W: 3.0, D: 3.0, ceil: 2.75, wall: 1, floor: 'f1', style: { counter: 'quartz-white', tile: 'hex-grey', handle: 'gola' }, fin: 2,
    feats: () => [feat('W', 'w1', 1.05), feat('S', 'single', 2.2)],
    runs: [['N', 0, [B('blind', 90), B('3drawer', 60), ['hob-unit', { w: 75, burners: 4 }], B('2door', 60)]], ['W', 60, [['sink-unit', { w: 90, bowl: 'drainer' }], ['dishwasher', { w: 60 }], ['fridge', { type: 'single' }]]],
      ['N', 0, [WC(90), WC(60, 'glass'), ['chimney', { w: 75, style: 'tshape' }], WC(60)]]],
    extras: [['microwave', {}, 1, 'N', 120], ['ro', {}, 0, 'W', 175]] },
  { id: 'k-u', kind: 'layout', name: 'U-shaped kitchen', blurb: 'Three walls · tall oven unit, lots of counter space', W: 3.2, D: 3.0, ceil: 2.75, wall: 2, floor: 'f3', style: { counter: 'granite-tan', tile: 'moroccan', handle: 'knob' }, fin: 7,
    feats: () => [feat('N', 'w1', 1.35), feat('S', 'single', 1.6)],
    runs: [['N', 0, [B('blind', 90), ['sink-unit', { w: 90, bowl: 'double' }], B('1door', 45), B('blind', 90)]], ['W', 60, [['hob-unit', { w: 75, burners: 4, below: 'oven' }], B('3drawer', 60), ['tall', { w: 60, cfg: 'oven' }]]], ['E', 60, [['fridge', { type: 'double' }, 1], B('2door', 60), B('1door', 45)]],
      ['N', 0, [WC(75), ['gap', 110], WC(45, '1door'), WC(90)]], ['W', 60, [['chimney', { w: 75, style: 'curved' }], WC(60)]], ['E', 130, [WC(60, 'glass'), WC(45, '1door')]]],
    extras: [['mixer', {}, 0, 'E', 160]] },
  { id: 'k-parallel', kind: 'layout', name: 'Parallel kitchen', blurb: 'Galley · wet side and cooking side face each other', W: 2.6, D: 3.6, ceil: 2.75, wall: 7, floor: 'f4', style: { counter: 'granite-black', tile: 'kota', handle: 'bar' }, fin: 3,
    feats: () => [feat('N', 'w1', 1.3), feat('S', 'single', 1.3)],
    runs: [['W', 0, [B('2door', 60), ['sink-unit', { w: 90, bowl: 'drainer' }], B('3drawer', 60), ['dishwasher', { w: 60 }], B('1door', 45)]], ['E', 0, [['tall', { w: 60, cfg: 'pantry' }], B('2door', 60), ['hob-unit', { w: 90, burners: 5 }], B('3drawer', 60), ['fridge', { type: 'double' }, 0]]],
      ['W', 0, [WC(60), WC(90), WC(60, 'glass'), WC(60)]], ['E', 60, [WC(60), ['chimney', { w: 90, style: 'filterless' }], WC(60)]]],
    extras: [['otg', {}, 0, 'E', 90]] },
  { id: 'k-island', kind: 'layout', name: 'Island kitchen', blurb: 'Open plan · sink on the island, breakfast seating', W: 4.2, D: 3.6, ceil: 2.8, wall: 0, floor: 'f8', style: { counter: 'marble', tile: 'terrazzo', handle: 'edge' }, fin: 1,
    feats: () => [feat('W', 'w2', 1.8), feat('E', 'single', 2.8)],
    runs: [['N', 0, [['fridge', { type: 'sxs' }, 0], ['tall', { w: 60, cfg: 'oven' }], B('3drawer', 60), ['hob-unit', { w: 90, burners: 5 }], B('2door', 60), B('4drawer', 45)]],
      ['N', 151, [WC(60), ['chimney', { w: 90, style: 'pyramid' }, 0], WC(60, 'glass'), WC(45)]]],
    free: [['sink-unit', { w: 90, bowl: 'single' }, 1, -.6, .3, 180], ['base-cab', { w: 60, front: '2door' }, 1, .15, .3, 180], ['base-cab', { w: 60, front: '3drawer' }, 1, .75, .3, 180],
      ['stool', {}, 0, -.45, 1.0, 0], ['stool', {}, 0, .2, 1.0, 0], ['stool', {}, 0, .85, 1.0, 0]] },
  { id: 'e-compact', kind: 'empty', name: 'Compact kitchen', blurb: 'Starts with sink, hob and chimney', W: 2.4, D: 2.1, ceil: 2.7, wall: 0, floor: 'f0', fin: 0,
    feats: () => [feat('N', 'w1', 1.65), feat('S', 'single', .7)],
    runs: [['N', 15, [['hob-unit', { w: 60, burners: 3 }], ['gap', 60], ['sink-unit', { w: 60, bowl: 'single' }]]], ['N', 15, [['chimney', { w: 60, style: 'pyramid' }]]]] },
  { id: 'e-standard', kind: 'empty', name: 'Standard kitchen', blurb: 'Starts with sink, hob and chimney', W: 3.0, D: 2.7, ceil: 2.75, wall: 2, floor: 'f1', fin: 0,
    feats: () => [feat('N', 'w1', 2.05), feat('S', 'single', .9)],
    runs: [['N', 40, [['hob-unit', { w: 75, burners: 4 }], ['gap', 45], ['sink-unit', { w: 90, bowl: 'drainer' }]]], ['N', 40, [['chimney', { w: 75, style: 'tshape' }]]]] },
  { id: 'e-large', kind: 'empty', name: 'Large kitchen', blurb: 'Starts with sink, hob and chimney', W: 3.6, D: 3.3, ceil: 2.8, wall: 0, floor: 'f2', fin: 0,
    feats: () => [feat('W', 'w1', 1.6), feat('S', 'single', 2.8)],
    runs: [['N', 120, [['hob-unit', { w: 90, burners: 5 }]]], ['W', 115, [['sink-unit', { w: 90, bowl: 'double' }]]], ['N', 120, [['chimney', { w: 90, style: 'curved' }]]]] },
  { id: 'e-open', kind: 'empty', name: 'Open kitchen', blurb: 'Starts with sink, hob and chimney', W: 4.5, D: 3.6, ceil: 2.8, wall: 5, floor: 'f8', fin: 0,
    feats: () => [feat('N', 'w2', 3.0), feat('E', 'glass', 2.6)],
    runs: [['N', 100, [['hob-unit', { w: 90, burners: 4 }], ['gap', 65], ['sink-unit', { w: 90, bowl: 'drainer' }]]], ['N', 100, [['chimney', { w: 90, style: 'pyramid' }]]]] }
];
const TPL = id => KITCHENS.find(t => t.id === id);
function roomFromTemplate(t) {
  return { x0: -t.W / 2, x1: t.W / 2, z0: -t.D / 2, z1: t.D / 2, h: t.ceil, wall: WALL_COLORS[t.wall], floor: t.floor, feats: t.feats(), style: Object.assign({}, DEFAULT_STYLE, t.style || {}) };
}
const sqft = R => Math.round((R.x1 - R.x0) * (R.z1 - R.z0) * 10.7639);
const WALL_ROT = { N: 0, E: -90, S: 180, W: 90 };
const alongAxis = w => (w === 'N' || w === 'S') ? 'x' : 'z';
const extOf = (d, rot) => { const c = Math.abs(Math.cos(rad(rot))), s = Math.abs(Math.sin(rad(rot))); return { hw: (c * d.w + s * d.d) / 2, hd: (s * d.w + c * d.d) / 2 }; };
/* pure placement against a wall: returns {x, z, rot} with the unit's back flush to the wall, centred at `along` (world coord) */
function placeAgainst(R, d, wall, along) {
  const rot = WALL_ROT[wall], e = extOf(d, rot), ax = alongAxis(wall);
  const lo = ax === 'x' ? R.x0 + e.hw : R.z0 + e.hd, hi = ax === 'x' ? R.x1 - e.hw : R.z1 - e.hd, a = lo > hi ? (lo + hi) / 2 : clamp(along, lo, hi);
  return { x: wall === 'W' ? R.x0 + e.hw : wall === 'E' ? R.x1 - e.hw : a, z: wall === 'N' ? R.z0 + e.hd : wall === 'S' ? R.z1 - e.hd : a, rot };
}
function layoutItems(R, t) {
  const out = [], fv = t.fin || 0;
  for (const [wall, start, list] of t.runs || []) {
    let a = start / 100; const base = alongAxis(wall) === 'x' ? R.x0 : R.z0;
    for (const e of list) {
      if (e[0] === 'gap') { a += e[1] / 100; continue; }
      const [pid, cfg, v] = e, p = P(pid), c = Object.assign(defCfg(p), cfg || {}), d = dimsOf(p, c, R);
      const pos = placeAgainst(R, d, wall, base + a + d.w / 2);
      out.push({ pid, v: v ?? (p.variants[0].fin ? fv : 0), cfg: c, x: pos.x, z: pos.z, rot: pos.rot, wall }); a += d.w;
    }
  }
  for (const [pid, cfg, v, wall, along] of t.extras || []) { const p = P(pid), c = Object.assign(defCfg(p), cfg), d = dimsOf(p, c, R), base = alongAxis(wall) === 'x' ? R.x0 : R.z0, pos = placeAgainst(R, d, wall, base + along / 100); out.push({ pid, v, cfg: c, x: pos.x, z: pos.z, rot: pos.rot, wall }); }
  for (const [pid, cfg, v, x, z, rot] of t.free || []) { const p = P(pid); out.push({ pid, v: v ?? 0, cfg: Object.assign(defCfg(p), cfg), x, z, rot, wall: null }); }
  return out;
}

/* ═══════════════ 5 · state, scene & cameras ═══════════════ */
const S = {
  route: 'hub', mode: 'design', view: 'dollhouse', designId: null, templateId: null, title: 'My kitchen', cat: null,
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
  rebuildRoomItems(); refreshTiles();
  updateCamera(); markDirty();
}

/* ═══════════════ 6b · items: shapes, 3D collisions, wall snapping, placement ═══════════════ */
/* Every item lives on one of three layers: floor units (y0 = 0), counter-top items (y0 = height of the unit below),
   and wall units (fixed y0 on a wall). Collisions are 3D boxes, so a microwave can sit on a cabinet under a wall cabinet. */
const WALL_ORDER = ['N', 'W', 'E', 'S'];
const priceOf = it => { const p = P(it.pid); return p.price(it.cfg || defCfg(p), p.variants[it.v] || p.variants[0]); };
function shapeOf(it, x = it.x, z = it.z, rot = it.rot, cfg = it.cfg) {
  const p = P(it.pid), d = dimsOf(p, cfg), e = extOf(d, rot);
  if (p.mount === 'counter') d.y0 = supportAt(x, z, it);
  return Object.assign(d, e, { x, z, rot });
}
function supportAt(x, z, ignore) {
  let y = 0;
  for (const o of S.items) { if (o === ignore || !P(o.pid).counter) continue; const s = shapeOf(o); if (Math.abs(x - o.x) <= s.hw + .001 && Math.abs(z - o.z) <= s.hd + .001) y = Math.max(y, s.y0 + s.h); }
  return y;
}
const vOverlap = (a, b) => a.y0 < b.y0 + b.h - .005 && b.y0 < a.y0 + a.h - .005;
const overlaps = (a, b) => Math.abs(a.x - b.x) < a.hw + b.hw - .004 && Math.abs(a.z - b.z) < a.hd + b.hd - .004 && vOverlap(a, b);
function hitBy(sh, ignore, skip) { return S.items.find(o => o !== ignore && !(skip && skip.includes(o)) && overlaps(sh, shapeOf(o))) || null; }
const collides = (sh, ignore, skip) => !!hitBy(sh, ignore, skip);
function clampXZ(it, x, z, rot = it.rot, cfg = it.cfg) {
  const R = S.room, e = extOf(dimsOf(P(it.pid), cfg), rot), lo = R.x0 + e.hw, hi = R.x1 - e.hw, lz = R.z0 + e.hd, hz = R.z1 - e.hd;
  return { x: lo > hi ? (R.x0 + R.x1) / 2 : clamp(x, lo, hi), z: lz > hz ? (R.z0 + R.z1) / 2 : clamp(z, lz, hz) };
}
const wallPlace = (it, wall, along, cfg = it.cfg) => { const q = placeAgainst(S.room, dimsOf(P(it.pid), cfg), wall, along); return shapeOf(it, q.x, q.z, q.rot, cfg); };
function wallOf(sh) {
  const R = S.room, t = .012, r = ((Math.round(sh.rot) % 360) + 360) % 360;
  if (r === 0 && Math.abs(sh.z - sh.hd - R.z0) < t) return 'N';
  if (r === 180 && Math.abs(sh.z + sh.hd - R.z1) < t) return 'S';
  if (r === 270 && Math.abs(sh.x + sh.hw - R.x1) < t) return 'E';
  if (r === 90 && Math.abs(sh.x - sh.hw - R.x0) < t) return 'W';
  return null;
}
const alongOf = (sh, ax) => ax === 'x' ? [sh.x - sh.hw, sh.x + sh.hw] : [sh.z - sh.hd, sh.z + sh.hd];
/* door or window this shape intrudes on (touching that wall and overlapping it vertically); strict also blocks the door swing */
function featureHit(sh, strict) {
  const R = S.room, tol = .07;
  for (const f of R.feats) {
    const a = f.u - f.w / 2, b = f.u + f.w / 2, fy0 = f.sill || 0, fy1 = fy0 + f.h, ax = alongAxis(f.wall), base = ax === 'x' ? R.x0 : R.z0, [lo0, hi0] = alongOf(sh, ax), lo = lo0 - base, hi = hi0 - base;
    const gap = { N: sh.z - sh.hd - R.z0, S: R.z1 - (sh.z + sh.hd), W: sh.x - sh.hw - R.x0, E: R.x1 - (sh.x + sh.hw) }[f.wall];
    if (lo >= b - .01 || hi <= a + .01) continue;
    if (gap < tol && sh.y0 < fy1 && sh.y0 + sh.h > fy0) return { f, swing: false };
    if (f.kind === 'door' && gap < f.w * .9 / (STYLE[f.style].leaves > 1 ? 2 : 1) && sh.y0 < 1) return { f, swing: true };
  }
  return null;
}
const touching = (sh, ignore) => S.items.some(o => { if (o === ignore) return false; const s = shapeOf(o); if (!vOverlap(sh, s)) return false; const gx = Math.abs(sh.x - s.x) - sh.hw - s.hw, gz = Math.abs(sh.z - s.z) - sh.hd - s.hd; return (Math.abs(gx) < .012 && gz < -.05) || (Math.abs(gz) < .012 && gx < -.05); });
/* snap the along-wall edges of a unit to the wall ends or to neighbours' edges (within tol) */
function snapAlong(sh, it, ax, tol = .06) {
  const R = S.room, [lo, hi] = alongOf(sh, ax), c = [(ax === 'x' ? R.x0 : R.z0) - lo, (ax === 'x' ? R.x1 : R.z1) - hi];
  for (const o of S.items) {
    if (o === it) continue; const s = shapeOf(o); if (!vOverlap(sh, s)) continue;
    const perp = ax === 'x' ? Math.abs(sh.z - s.z) < sh.hd + s.hd : Math.abs(sh.x - s.x) < sh.hw + s.hw; if (!perp) continue;
    const [olo, ohi] = alongOf(s, ax); c.push(ohi - lo, olo - hi);
  }
  let best = null; for (const d of c) if (Math.abs(d) > 1e-4 && Math.abs(d) < tol && (best == null || Math.abs(d) < Math.abs(best))) best = d;
  if (best == null) return sh;
  const t = shapeOf(it, ax === 'x' ? sh.x + best : sh.x, ax === 'z' ? sh.z + best : sh.z, sh.rot);
  return collides(t, it) ? sh : t;
}
/* best free slot for a new unit: along walls for cabinets/appliances/wall units, on a counter for counter-top items */
function findSlot(tmp, near) {
  const p = P(tmp.pid), R = S.room; let best = null, score = 1e9;
  const consider = (sh, sc) => { if (sc >= score) return; if (collides(sh, tmp) || featureHit(sh, true)) return; best = sh; score = sc; };
  const winOn = (sh, wall) => R.feats.some(f => f.kind === 'window' && f.wall === wall && (() => { const ax = alongAxis(wall), base = ax === 'x' ? R.x0 : R.z0, [lo, hi] = alongOf(sh, ax); return lo - base < f.u + f.w / 2 && hi - base > f.u - f.w / 2; })());
  if (p.mount === 'counter') {
    S.items.filter(o => P(o.pid).counter).forEach((o, i) => {
      const s = shapeOf(o), ax = o.wall ? alongAxis(o.wall) : 'x', [lo, hi] = alongOf(s, ax), busy = P(o.pid).essential ? 40 : 0;
      for (let a = lo + .1; a <= hi - .1 + 1e-6; a += .1) { const sh = o.wall ? wallPlace(tmp, o.wall, a) : shapeOf(tmp, ax === 'x' ? a : o.x, ax === 'z' ? a : o.z, o.rot); if (sh.y0 > .01) consider(sh, busy + i + (near ? Math.hypot(sh.x - near.x, sh.z - near.z) : 0)); }
    });
    if (best) return best;
  }
  if (p.mount === 'wall' || p.snap) {
    if (p.essential === 'chimney') S.items.filter(o => P(o.pid).essential === 'stove' && o.wall).forEach(o => consider(wallPlace(tmp, o.wall, alongAxis(o.wall) === 'x' ? o.x : o.z), -100));
    WALL_ORDER.forEach((w, wi) => {
      const ax = alongAxis(w), lo = ax === 'x' ? R.x0 : R.z0, hi = ax === 'x' ? R.x1 : R.z1;
      for (let a = lo; a <= hi + 1e-6; a += .05) {
        const sh = wallPlace(tmp, w, a);
        let sc = wi * 30 + (a - lo) * 2 + (touching(sh, tmp) ? 0 : 25);
        if (p.mount === 'wall' && p.role !== 'ro' && supportAt(sh.x, sh.z, tmp) < .01) sc += 60;
        if (p.essential === 'sink') sc += winOn(sh, w) ? -80 : 0; else if (p.mount === 'floor' && winOn(sh, w)) sc += 15;
        if (near) sc = Math.hypot(sh.x - near.x, sh.z - near.z) * 10 + (touching(sh, tmp) ? 0 : 5);
        consider(sh, sc);
      }
    });
    if (best) return best;
  }
  const c = near || roomCenter();
  for (let r = 0; r < 14; r += .2) { const n = Math.max(1, Math.round(r * 16)); for (let i = 0; i < n; i++) { const ang = i / n * Math.PI * 2, q = clampXZ(tmp, c.x + Math.cos(ang) * r, c.z + Math.sin(ang) * r, tmp.rot); const sh = shapeOf(tmp, q.x, q.z, tmp.rot); if (!collides(sh, tmp) && !featureHit(sh, true)) return sh; } }
  return null;
}
function applyShape(it, sh) { it.x = sh.x; it.z = sh.z; it.rot = sh.rot; it.wall = wallOf(sh); }
/* after the room changes size, wall-mounted / wall-snapped items follow their wall */
function reflowItems() {
  for (const it of S.items) {
    if (it.wall) { const ax = alongAxis(it.wall); applyShape(it, wallPlace(it, it.wall, ax === 'x' ? it.x : it.z)); }
    else { const q = clampXZ(it, it.x, it.z); it.x = q.x; it.z = q.z; }
  }
}

function makeNode(it) {
  const p = P(it.pid), v = p.variants[it.v] || p.variants[0], sh = shapeOf(it);
  const root = new THREE.Group(); root.add(p.build(it.cfg, v, { W: sh.w, D: sh.d, H: sh.h, style: styleOf(), R: S.room }));
  root.userData.item = it; root.position.set(it.x, sh.y0, it.z); root.rotation.y = rad(it.rot); it.node = root;
  return root;
}
function attachItem(it) { GL.itemGroup.add(makeNode(it)); if (S.sel === it) setOutline(it.node, true); }
function detachItem(it) { if (it.node) { GL.itemGroup.remove(it.node); disposeTree(it.node); it.node = null; } }
function rebuildItem(it) { detachItem(it); attachItem(it); markDirty(); }
function syncNode(it) { if (it.node) { it.node.position.set(it.x, shapeOf(it).y0, it.z); it.node.rotation.y = rad(it.rot); } markDirty(); }
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.BackSide });
function setOutline(root, on) {
  root.traverse(m => { if (m.userData.outline) m.userData.kill = true; });
  const kill = []; root.traverse(m => { if (m.userData.kill) kill.push(m); }); kill.forEach(m => m.parent.remove(m));
  if (!on) return;
  const add = []; root.traverse(m => { if (m.isMesh && !m.userData.outline && m.material !== glassMat) add.push(m); });
  for (const m of add) {
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    const o = new THREE.Mesh(m.geometry, OUTLINE); o.userData.outline = true; o.position.copy(m.position); o.rotation.copy(m.rotation);
    const k = 1 + .018 / Math.max(.05, m.geometry.boundingSphere.radius); o.scale.copy(m.scale).multiplyScalar(k); m.parent.add(o);
  }
}
const itemOf = o => { while (o) { if (o.userData && o.userData.item) return o.userData.item; o = o.parent; } return null; };
function worldBox(it) { return it.node ? new THREE.Box3().setFromObject(it.node) : null; }

/* item operations ─ every mutation funnels through afterChange() */
function afterChange(opts = {}) {
  refreshTotals(); refreshWarnings(); refreshTiles(); positionOverlay(); markDirty(); queueSave();
  if (!opts.quiet) { S.actions++; maybeFeedback(); }
  if (S.stripOpen) S.stripDirty = true;
  if (!opts.keepPanel) renderPanel();
}
function addItem(pid, opts = {}) {
  const p = P(pid); if (!p) return null;
  const it = { uid: uid(), pid, v: opts.v ?? (p.variants[0].fin ? S.room.fin || 0 : 0), cfg: Object.assign(defCfg(p), opts.cfg || {}), x: 0, z: 0, rot: opts.rot || 0, wall: null };
  const sh = findSlot(it);
  if (!sh) { toast(`There's no free space left for the ${p.name.toLowerCase()}.`); return null; }
  applyShape(it, sh); S.items.push(it); attachItem(it);
  if (!opts.silent) { afterChange({ keepPanel: false }); toastAdded(it); }
  return it;
}
function removeItem(it) {
  if (S.sel === it) { S.sel = null; S.rotating = false; }
  S.items = S.items.filter(i => i !== it); detachItem(it);
  S.items.filter(o => P(o.pid).mount === 'counter').forEach(syncNode);
  afterChange(); renderBottomBar();
}
function copyItem(it) {
  const c = { uid: uid(), pid: it.pid, v: it.v, cfg: Object.assign({}, it.cfg), x: it.x, z: it.z, rot: it.rot, wall: null }; let sh = null;
  if (it.wall) {
    const ax = alongAxis(it.wall), s0 = shapeOf(it), half = ax === 'x' ? s0.hw : s0.hd, cur = ax === 'x' ? it.x : it.z;
    for (const a of [cur + 2 * half, cur - 2 * half]) { const s = wallPlace(c, it.wall, a); if (Math.abs((ax === 'x' ? s.x : s.z) - a) < .002 && !collides(s, c) && !featureHit(s, true)) { sh = s; break; } }
  }
  if (!sh) sh = findSlot(c, { x: it.x, z: it.z });
  if (!sh) return toast('No free space for a copy.');
  applyShape(c, sh); S.items.push(c); attachItem(c); select(c); afterChange(); toast('Copy added next to it.');
}
function setVariant(it, vi) { it.v = vi; rebuildItem(it); afterChange({ keepPanel: false }); }
function setCfg(it, key, val) {
  const cfg = Object.assign({}, it.cfg, { [key]: val }); let sh = null;
  if (it.wall) {
    const ax = alongAxis(it.wall), cur = ax === 'x' ? it.x : it.z, old = shapeOf(it), oh = ax === 'x' ? old.hw : old.hd, ne = extOf(dimsOf(P(it.pid), cfg), it.rot), nh = ax === 'x' ? ne.hw : ne.hd;
    for (const a of [cur, cur - oh + nh, cur + oh - nh]) { const s = wallPlace(it, it.wall, a, cfg); if (!collides(s, it) && !featureHit(s, true)) { sh = s; break; } }
  } else { const q = clampXZ(it, it.x, it.z, it.rot, cfg), s = shapeOf(it, q.x, q.z, it.rot, cfg); if (!collides(s, it)) sh = s; }
  if (!sh) { const what = hitBy(shapeOf(it, it.x, it.z, it.rot, cfg), it); toast(`Not enough room for that here${what ? ` — it would hit the ${P(what.pid).name.toLowerCase()}` : ''}.`); renderPanel(true); return; }
  it.cfg = cfg; applyShape(it, sh); rebuildItem(it); afterChange({ keepPanel: false });
}
function replaceItem(it, pid) {
  const p = P(pid), tmp = { uid: it.uid, pid, v: p.variants[0].fin ? (P(it.pid).variants[0].fin ? it.v : 0) : 0, cfg: defCfg(p), x: it.x, z: it.z, rot: it.rot, wall: null };
  if (it.cfg && it.cfg.w && p.opts.some(o => o.key === 'w' && o.values.some(v => v[0] === it.cfg.w))) tmp.cfg.w = it.cfg.w;
  let sh = it.wall ? wallPlace(tmp, it.wall, alongAxis(it.wall) === 'x' ? it.x : it.z) : shapeOf(tmp);
  if (collides(sh, it) || (p.mount === 'wall') !== (P(it.pid).mount === 'wall')) sh = findSlot(Object.assign(tmp, { uid: 'tmp' }), { x: it.x, z: it.z });
  if (!sh || collides(sh, it)) return toast('The replacement would not fit here.');
  detachItem(it); Object.assign(it, { pid, v: tmp.v, cfg: tmp.cfg }); applyShape(it, sh); attachItem(it); S.itemTab = 'details'; afterChange(); toast(`Swapped to ${p.name}.`);
}
let rotToastAt = 0;
function setRotation(it, d) {
  d = ((d + 540) % 360) - 180; for (const s of [0, 90, -90, 180, -180]) if (Math.abs(d - s) < 3.5) d = s === -180 ? 180 : s;
  const q = clampXZ(it, it.x, it.z, d), sh = shapeOf(it, q.x, q.z, d), hit = hitBy(sh, it);
  if (hit) { if (Date.now() - rotToastAt > 2500) { rotToastAt = Date.now(); toast(`Can't turn it that far — it would hit the ${P(hit.pid).name.toLowerCase()}. Move it into open space first.`); } return false; }
  applyShape(it, sh); syncNode(it); afterChange({ keepPanel: true, quiet: true }); return true;
}
function moveToWall(it, wall) {
  const ax = alongAxis(wall), along = ax === 'x' ? it.x : it.z; let sh = null;
  for (let k = 0; k < 160 && !sh; k++) for (const sgn of [1, -1]) { const s = wallPlace(it, wall, along + sgn * k * .05); if (!collides(s, it) && !featureHit(s, true)) { sh = s; break; } }
  if (!sh) return toast(`No free spot along the ${WALL_NAME[wall].toLowerCase()}.`);
  applyShape(it, sh); syncNode(it); afterChange({ keepPanel: true }); renderPanel();
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
  let sh;
  if (it.wall) { const ax = alongAxis(it.wall), d = ax === 'x' ? dx : dz; if (!d) return; sh = wallPlace(it, it.wall, (ax === 'x' ? it.x : it.z) + d); }
  else { const q = clampXZ(it, it.x + dx, it.z + dz); sh = shapeOf(it, q.x, q.z); }
  if (collides(sh, it)) return; applyShape(it, sh); syncNode(it); afterChange({ keepPanel: true, quiet: true });
}

/* kitchen checks: essentials, chimney over stove, doors/windows, counter items, sink–hob spacing, work triangle */
function computeWarnings() {
  const bad = [], ok = [], R = S.room, by = r => S.items.filter(i => P(i.pid).essential === r), nm = it => P(it.pid).name.toLowerCase();
  const sinks = by('sink'), stoves = by('stove'), chims = by('chimney');
  if (!sinks.length) bad.push({ text: 'No sink yet — every kitchen needs one. Add a Sink unit from Essentials.' });
  if (!stoves.length) bad.push({ text: 'No stove yet — add a Hob unit or a Gas stove from Essentials.' });
  if (!chims.length) bad.push({ text: 'No chimney yet — add one above the stove to clear smoke and oil.' });
  for (const c of chims) {
    const cs = shapeOf(c), st = stoves.find(s => { const ss = shapeOf(s); return Math.abs(ss.x - cs.x) < cs.hw && Math.abs(ss.z - cs.z) < cs.hd + .35; });
    if (!st) bad.push({ it: c, text: "The chimney isn't above a stove. Move it over the hob or gas stove." });
    else { const gap = cs.y0 - (shapeOf(st).y0 + shapeOf(st).h); (gap < .6 || gap > .85 ? bad : ok).push({ it: c, text: `Chimney is ${Math.round(gap * 100)} cm above the stove${gap < .6 || gap > .85 ? ' — 65–75 cm is recommended' : ''}.` }); }
  }
  for (const it of S.items) {
    const p = P(it.pid), sh = shapeOf(it), hit = featureHit(sh);
    if (hit) bad.push({ it, text: hit.swing ? `The ${nm(it)} is in the swing of the door on the ${WALL_NAME[hit.f.wall].toLowerCase()}.` : `The ${nm(it)} is blocking a ${hit.f.kind} on the ${WALL_NAME[hit.f.wall].toLowerCase()}.` });
    if (sh.y0 + sh.h > R.h + .01) bad.push({ it, text: `The ${nm(it)} is taller than the ceiling.` });
    if (p.mount === 'counter' && sh.y0 < .01) bad.push({ it, text: `The ${nm(it)} is on the floor — put it on a counter.` });
  }
  for (const s of sinks) for (const t of stoves) {
    if (P(t.pid).mount !== 'floor' || !s.wall || s.wall !== t.wall) continue;
    const ax = alongAxis(s.wall), [a0, a1] = alongOf(shapeOf(s), ax), [b0, b1] = alongOf(shapeOf(t), ax), gap = Math.max(b0 - a1, a0 - b1);
    if (gap < .3) bad.push({ it: t, text: `Only ${Math.max(0, Math.round(gap * 100))} cm of counter between the sink and the hob — leave at least 30 cm to work and to keep water away from the flame.` });
  }
  const fr = S.items.find(i => P(i.pid).role === 'fridge');
  if (sinks[0] && stoves[0] && fr) {
    const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z), per = d(sinks[0], stoves[0]) + d(stoves[0], fr) + d(fr, sinks[0]);
    (per < 3.6 || per > 7.9 ? bad : ok).push({ text: `Work triangle (sink → stove → fridge) is ${per.toFixed(1)} m${per < 3.6 ? ' — a bit cramped; 3.6–7.9 m works best' : per > 7.9 ? ' — lots of walking; 3.6–7.9 m works best' : ' — within the 3.6–7.9 m sweet spot'}.` });
  }
  if (sinks.length && stoves.length && chims.length) ok.unshift({ text: 'Sink, stove and chimney are all in place.' });
  return { bad, ok };
}
let warnCache = [], okCache = [];
function refreshWarnings() { const r = computeWarnings(); warnCache = r.bad; okCache = r.ok; renderWarnings(); }

/* totals */
const totalPrice = () => S.items.reduce((s, it) => s + priceOf(it), 0);
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
/* Zoom sensitivity — lower numbers = gentler. pinch/wheel are per-unit-of-delta gains, caps limit one event, gesture is an exponent on Safari's scale ratio. */
const ZOOM_SENS = { pinch: .0012, pinchCap: 20, wheel: .0007, wheelCap: 40, gesture: .35 };
function setNDC(e) {
  const r = GL.renderer.domElement.getBoundingClientRect();
  GL.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  GL.ray.setFromCamera(GL.ndc, GL.cam);
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
      select(it); const s0 = shapeOf(it), g = new THREE.Vector3();
      DRAG.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -s0.y0); setNDC(e); const okp = GL.ray.ray.intersectPlane(DRAG.plane, g);
      DRAG.mode = 'item'; DRAG.item = it; DRAG.offx = okp ? it.x - g.x : 0; DRAG.offz = okp ? it.z - g.z : 0; DRAG.rot0 = it.rot;
      DRAG.riders = P(it.pid).counter ? S.items.filter(o => o !== it && P(o.pid).mount === 'counter' && Math.abs(o.x - it.x) <= s0.hw && Math.abs(o.z - it.z) <= s0.hd) : null;
      (DRAG.riders || []).forEach(r => { r._ox = r.x - it.x; r._oz = r.z - it.z; r._rot0 = r.rot; });
      cv.style.cursor = 'grabbing'; return;
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
    // Trackpad pinch = many small wheel events with ctrlKey set; a mouse wheel notch = one big event.
    // Zoom by the actual delta, damped, and cap what a single event can do so fast pinches stay controllable.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const pinch = e.ctrlKey, cap = pinch ? ZOOM_SENS.pinchCap : ZOOM_SENS.wheelCap;
    const dy = clamp(e.deltaY * unit, -cap, cap);
    zoomScale(Math.exp(dy * (pinch ? ZOOM_SENS.pinch : ZOOM_SENS.wheel)));
  }, { passive: false });
  // Safari reports trackpad pinch as gesture events instead of wheel events
  let gScale = 1;
  cv.addEventListener('gesturestart', e => { e.preventDefault(); gScale = e.scale || 1; });
  cv.addEventListener('gesturechange', e => { e.preventDefault(); const r = (e.scale || 1) / gScale; gScale = e.scale || 1; zoomScale(Math.pow(1 / r, ZOOM_SENS.gesture)); });
  cv.addEventListener('gestureend', e => e.preventDefault());
}
function hoverCursor(e) {
  if (S.mode !== 'design' || DRAG.mode) return;
  $('#gl').style.cursor = pickItem(e) ? 'grab' : '';
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
function bindRotate() {
  const sl = $('#rotslider');
  sl.addEventListener('input', () => {
    if (!S.sel) return; const ok = setRotation(S.sel, +sl.value);
    if (!ok) sl.value = S.sel.rot; $('#rotval').textContent = Math.round(S.sel.rot);
  });
  sl.addEventListener('change', () => { if (S.sel) { sl.value = S.sel.rot; $('#rotval').textContent = Math.round(S.sel.rot); } });
}

/* dimension overlay */
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
    if (S.measure.prod) for (const it of S.items) { if (it.node && !it.node.visible) continue; const sh = shapeOf(it), q = proj(it.x, sh.y0 + sh.h + .05, it.z); add(q.x, q.y - 4, `${fmtCm(sh.w * 100)} × ${fmtCm(sh.d * 100)} × ${fmtCm(sh.h * 100)}`, 'prod'); }
    if (S.measure.space && S.mode === 'design') {
      const list = S.sel ? [S.sel] : S.items.filter(i => P(i.pid).mount === 'floor');
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
    reflowItems(); buildRoom(); updateEditUI();
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
function toggleFav(id) { S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); store.set('favs', [...S.favs]); if (S.tab === 'favs' || S.sel) renderPanel(true); }

/* ═══════════════ 7d · bag, summary, feedback, modal, toast ═══════════════ */
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
const TIPS = ['Keep the sink, stove and fridge in a work triangle of 3.6–7.9 m.', 'Mount the chimney 65–75 cm above the hob, directly over it.', 'Leave at least 30 cm of counter between the sink and the hob.', 'Drag a cabinet near a wall and it snaps flush; units snap to each other\'s edges.', 'Counter-top appliances ride along when you move the cabinet under them.', 'Use Finishes to change every shutter, the countertop, handles and wall tiles at once.'];

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
function saveNow() { if (!S.designId || !S.room || S.route !== 'designer') return; const d = docs(); d[S.designId] = currentDoc(); store.set('designs', d); }
let saveT; function queueSave() { clearTimeout(saveT); saveT = setTimeout(saveNow, 500); }

/* ═══════════════ 10 · designer lifecycle ═══════════════ */
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

/* ═══════════════ 11b · kitchen planner: drag, tiles, panels, bag, lifecycle, hub ═══════════════ */
function dragItem(e) {
  const it = DRAG.item, p = P(it.pid), R = S.room; setNDC(e);
  const hit = new THREE.Vector3(); if (!GL.ray.ray.intersectPlane(DRAG.plane, hit)) return;
  const tx = hit.x + DRAG.offx, tz = hit.z + DRAG.offz; let sh = null;
  if (p.mount === 'wall' || p.snap) {
    const dist = { N: tz - R.z0, S: R.z1 - tz, W: tx - R.x0, E: R.x1 - tx }, w = WALLS.reduce((a, b) => dist[a] <= dist[b] ? a : b), d = dimsOf(p, it.cfg);
    if (p.mount === 'wall' || dist[w] < d.d / 2 + .3) {
      sh = snapAlong(wallPlace(it, w, alongAxis(w) === 'x' ? tx : tz), it, alongAxis(w));
      if (collides(sh, it, DRAG.riders)) sh = null;
      if (!sh && p.mount === 'wall') return;
    }
  }
  if (!sh) for (const [x, z] of [[tx, tz], [tx, it.z], [it.x, tz]]) { const q = clampXZ(it, x, z), s = shapeOf(it, q.x, q.z); if (!collides(s, it, DRAG.riders)) { sh = s; break; } }
  if (!sh) return;
  applyShape(it, sh); syncNode(it);
  if (DRAG.riders) {
    const a = rad(it.rot - DRAG.rot0), c = Math.cos(a), s = Math.sin(a);
    for (const r of DRAG.riders) { r.x = it.x + r._ox * c + r._oz * s; r.z = it.z - r._ox * s + r._oz * c; r.rot = r._rot0 + (it.rot - DRAG.rot0); r.wall = wallOf(shapeOf(r)); syncNode(r); }
  }
  positionOverlay(); refreshWarnings();
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
  for (const it of S.items) if (it.node) it.node.visible = !(P(it.pid).mount === 'wall' && it.wall && hide[it.wall]);
  refs.ceil.visible = S.view === 'inside';
  GL.lamp.intensity = S.view === 'inside' ? .55 : 0;
  GL.hemi.intensity = S.view === 'inside' ? .6 : .72;
}
function pickItem(e) {
  setNDC(e);
  const hits = GL.ray.intersectObjects(GL.itemGroup.children, true).filter(h => !h.object.userData.outline && h.object.material !== glassMat && (() => { const it = itemOf(h.object); return it && it.node && it.node.visible; })());
  return hits.length ? itemOf(hits[0].object) : null;
}
function floorMaterial(R) {
  const f = FLOOR(R.floor), t = getTex(f.kind, f.c, f.c2).clone(); t.needsUpdate = true;
  const tile = TILE_SIZE[f.kind] || 2;
  t.repeat.set((R.x1 - R.x0) / tile, (R.z1 - R.z0) / tile);
  const [rough, met] = SURF[f.kind] || SURF.plain;
  return new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: met * .2 });
}
function rebuildRoomItems() { for (const it of S.items || []) { const p = P(it.pid); if (p.toCeiling || typeof p.y0 === 'function') rebuildItem(it); else syncNode(it); } }
/* wall tiling: backsplash behind counters, dado, or floor-to-ceiling — cut around doors and windows */
function refreshTiles() {
  const refs = GL.refs; if (!refs || !S.room) return;
  (refs.tiles || []).forEach(m => { if (m.parent) m.parent.remove(m); m.geometry.dispose(); }); refs.tiles = [];
  const R = S.room, st = styleOf(), t = TILE(st.tile); if (st.tileCover === 'none') return markDirty();
  const tmat = mat(t.kind, t.c, t.c2, { roughness: .22 }), size = TILE_SIZE[t.kind] || .6;
  for (const k of WALLS) {
    const L = wallLen(k), g = refs.walls[k]; if (!g) continue;
    let bands;
    if (st.tileCover === 'full') bands = [[0, L, 0, R.h]];
    else if (st.tileCover === 'dado') bands = [[0, L, 0, Math.min(2.1, R.h)]];
    else {
      const ax = alongAxis(k), base = ax === 'x' ? R.x0 : R.z0, merged = [];
      S.items.filter(it => it.wall === k && (P(it.pid).counter || P(it.pid).essential === 'stove')).map(it => alongOf(shapeOf(it), ax).map(a => a - base)).sort((a, b) => a[0] - b[0])
        .forEach(r => { const l = merged[merged.length - 1]; if (l && r[0] <= l[1] + .02) l[1] = Math.max(l[1], r[1]); else merged.push([...r]); });
      bands = merged.map(([a, b]) => [a, b, COUNTER_H, Math.min(WALL_Y + .02, R.h)]);
    }
    if (k === 'E') bands = bands.map(([a, b, y0, y1]) => [L - b, L - a, y0, y1]);
    const pieces = wallPieces(k, L, R.h, R.feats.filter(f => f.wall === k)), tz = k === 'N' ? T_WALL + .004 : -.004;
    for (const [a0, b0, ya, yb] of bands) for (const [pa, pb, py0, py1] of pieces) {
      const a = Math.max(a0, pa), b = Math.min(b0, pb), y0 = Math.max(ya, py0), y1 = Math.min(yb, py1);
      if (b - a < .005 || y1 - y0 < .005) continue;
      const geo = new THREE.BoxGeometry(b - a, y1 - y0, .008); scaleUV(geo, b - a, y1 - y0, .008, size);
      const m = new THREE.Mesh(geo, tmat); m.position.set((a + b) / 2, (y0 + y1) / 2, tz); m.receiveShadow = true; g.add(m); refs.tiles.push(m);
    }
  }
  markDirty();
}
function restyle() { buildRoom(); S.items.forEach(rebuildItem); afterChange({ quiet: true }); }
function gapsFor(it) {
  const sh = shapeOf(it), R = S.room, out = [];
  const others = S.items.filter(o => o !== it).map(shapeOf).filter(s => vOverlap(s, sh)).map(s => ({ x0: s.x - s.hw, x1: s.x + s.hw, z0: s.z - s.hd, z1: s.z + s.hd }));
  const box = { x0: sh.x - sh.hw, x1: sh.x + sh.hw, z0: sh.z - sh.hd, z1: sh.z + sh.hd };
  const dir = (edge, wallPos, ok, axis, sign) => {
    let best = Math.abs(edge - wallPos), to = wallPos;
    for (const o of others) { if (!ok(o)) continue; const far = axis === 'x' ? (sign < 0 ? o.x1 : o.x0) : (sign < 0 ? o.z1 : o.z0), gg = sign < 0 ? edge - far : far - edge; if (gg >= -.001 && gg < best) { best = gg; to = far; } }
    if (best > .03) out.push(axis === 'x' ? { ax: to, az: it.z, bx: edge, bz: it.z, len: best } : { ax: it.x, az: to, bx: it.x, bz: edge, len: best });
  };
  dir(box.x0, R.x0, o => o.z1 > box.z0 && o.z0 < box.z1, 'x', -1); dir(box.x1, R.x1, o => o.z1 > box.z0 && o.z0 < box.z1, 'x', 1);
  dir(box.z0, R.z0, o => o.x1 > box.x0 && o.x0 < box.x1, 'z', -1); dir(box.z1, R.z1, o => o.x1 > box.x0 && o.x0 < box.x1, 'z', 1);
  return out;
}

/* thumbnails reflect configuration + finish */
function thumbRender(pid, vi, cfg) {
  const p = P(pid), c = cfg || defCfg(p), d = dimsOf(p, c); if (p.toCeiling) d.h = Math.min(d.h, .9);
  const g = p.build(c, p.variants[vi] || p.variants[0], { W: d.w, D: d.d, H: d.h, style: styleOf(), R: S.room });
  TH.scene.add(g); const box = new THREE.Box3().setFromObject(g), cc = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  const dir = new THREE.Vector3(.62, .5, .9).normalize(), dist = r / Math.sin(rad(13)) * 1.02;
  TH.cam.position.copy(cc).addScaledVector(dir, dist); TH.cam.lookAt(cc); TH.r.render(TH.scene, TH.cam);
  const url = TH.r.domElement.toDataURL('image/png'); TH.scene.remove(g); disposeTree(g); return url;
}
const thumbKey = (pid, vi, cfg) => { const st = styleOf(); return `${pid}|${vi}|${JSON.stringify(cfg || '')}|${st.counter}|${st.handle}`; };
function thumb(pid, vi, cb, cfg) {
  const key = thumbKey(pid, vi, cfg); if (TH.cache.has(key)) return cb(TH.cache.get(key));
  if (TH.failed) return;
  TH.q.push([pid, vi, cb, cfg, key]); if (!TH.busy) { TH.busy = true; setTimeout(pump, 0); }
}
function pump() {
  const job = TH.q.shift(); if (!job) { TH.busy = false; return; }
  const [pid, vi, cb, cfg, key] = job;
  try { if (!TH.cache.has(key)) TH.cache.set(key, thumbRender(pid, vi, cfg)); cb(TH.cache.get(key)); } catch (e) { console.warn(e); }
  setTimeout(pump, 0);
}
function thumbImg(pid, vi = 0, cls, cfg) {
  const img = h('img', { alt: '', draggable: 'false', class: cls || '' }), key = thumbKey(pid, vi, cfg);
  if (TH.cache.has(key)) img.src = TH.cache.get(key); else { img.style.visibility = 'hidden'; thumb(pid, vi, u => { img.src = u; img.style.visibility = ''; }, cfg); }
  return img;
}
const texURLs = new Map();
const texURL = (kind, c, c2) => { const k = kind + c + (c2 || ''); if (!texURLs.has(k)) texURLs.set(k, getTex(kind, c, c2).image.toDataURL()); return texURLs.get(k); };

/* ── side panel (kitchen) ── */
function renderTabs(root) {
  const tab = (id, icon, label) => h('button', { class: S.tab === id ? 'on' : '', role: 'tab', 'aria-selected': S.tab === id, onclick: () => { S.tab = id; renderPanel(); } }, h('span', { html: ico(icon, 20) }), label);
  root.append(h('div', { class: 'tabs', role: 'tablist' }, tab('add', 'plus', 'Add'), tab('style', 'palette', 'Finishes'), tab('list', 'list', 'List'), tab('favs', 'heart', 'Saved')));
  const sc = h('div', { class: 'pscroll' }); root.append(sc);
  if (S.tab === 'add') renderAdd(sc); else if (S.tab === 'style') renderStyle(sc); else if (S.tab === 'list') renderList(sc); else renderFavs(sc);
}
function matches(p) {
  const q = S.query.trim().toLowerCase();
  if (q) return (p.name + ' ' + p.type + ' ' + p.cat + ' ' + p.variants.map(v => v.n).join(' ') + ' ' + p.opts.map(o => o.values.map(v => v[1]).join(' ')).join(' ')).toLowerCase().includes(q);
  return !S.cat || p.cat === S.cat;
}
function pcard(p, o = {}) {
  const vi = o.vi ?? (p.variants[0].fin ? (S.room && S.room.fin) || 0 : 0), v = p.variants[vi] || p.variants[0], c = defCfg(p);
  const card = h('div', { class: 'pcard' });
  const img = h('div', { class: 'pimg' }, thumbImg(p.id, vi, '', c));
  const act = h('button', { class: 'padd', 'aria-label': o.swap ? `Swap with ${p.name}` : `Add ${p.name} to kitchen`, title: o.swap ? 'Swap' : 'Add to kitchen', html: ico(o.swap ? 'swap' : 'plus', 22), onclick: e => { e.stopPropagation(); o.onAdd ? o.onAdd(p) : addItem(p.id); } });
  const hb = h('button', { class: 'pheart' + (S.favs.has(p.id) ? ' on' : ''), 'aria-label': 'Save for later', html: ico('heart', 20), onclick: e => { e.stopPropagation(); toggleFav(p.id); hb.classList.toggle('on', S.favs.has(p.id)); } });
  img.append(hb, act); img.addEventListener('dblclick', () => (o.onAdd ? o.onAdd(p) : addItem(p.id)));
  card.append(img, h('div', { class: 'pname' }, p.name, p.essential ? h('span', { class: 'tag' }, 'Essential') : null), h('div', { class: 'pdesc' }, p.desc(c, v)),
    h('div', { class: 'pprice', html: (p.opts.length ? '<span class="from">from </span>' : '') + priceHTML(p.price(c, v)) }), h('div', { class: 'avail' }, h('i'), p.mount === 'counter' || p.role === 'fridge' ? 'Home delivery' : 'Made to measure · installed'));
  return card;
}
function renderAdd(sc) {
  sc.append(h('div', { class: 'psec', style: 'padding-bottom:0' },
    h('label', { class: 'search' }, h('span', { html: ico('search', 20) }), h('input', { type: 'search', placeholder: 'Search cabinets, appliances…', value: S.query, 'aria-label': 'Search products', oninput: e => { S.query = e.target.value; clearTimeout(S._qt); S._qt = setTimeout(() => { renderPanel(true); const i = $('.search input'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 180); } })),
    h('div', { class: 'roomtype' }, 'Kitchen', h('span', { class: 'muted', style: 'font-weight:400;font-size:13px' }, '· modular units & appliances')),
    h('div', { class: 'pills' }, ['All', ...KCATS].map(c => h('button', { class: 'pillf' + ((c === 'All' ? !S.cat : S.cat === c) ? ' on' : ''), onclick: () => { S.cat = c === 'All' ? null : c; renderPanel(); } }, c)))));
  if (!S.noticeGone) sc.append(h('div', { class: 'notice' }, h('span', { html: ico('info', 22), style: 'color:var(--blue)' }), h('div', null, h('b', null, 'Every unit is configurable'), 'Add a unit, then pick its width, fronts and finish in Item options. Final pricing may differ at checkout.'), h('button', { 'aria-label': 'Dismiss', html: ico('close', 16), onclick: () => { S.noticeGone = true; renderPanel(true); } })));
  const list = PRODUCTS.filter(matches);
  if (!list.length) sc.append(h('div', { class: 'empty' }, 'No products match. Try another category or search.'));
  else sc.append(h('div', { class: 'pgrid' }, list.map(p => pcard(p))));
}
function renderFavs(sc) {
  const list = PRODUCTS.filter(p => S.favs.has(p.id));
  if (!list.length) sc.append(h('div', { class: 'empty' }, h('div', { html: ico('heart', 36), style: 'opacity:.4' }), h('p', null, 'Nothing saved yet. Tap the heart on any unit to keep it here.')));
  else sc.append(h('div', { class: 'pgrid', style: 'padding-top:20px' }, list.map(p => pcard(p))));
}
function texBtn(label, url, on, fn) { const b = h('button', { class: 'texbtn' + (on ? ' on' : ''), title: label, 'aria-label': label, 'aria-pressed': !!on, onclick: fn }, h('i', { style: `background-image:url(${url})` }), h('span', null, label)); return b; }
function renderStyle(sc) {
  const st = styleOf(), R = S.room, set = (k, v) => { R.style = Object.assign(styleOf(), { [k]: v }); TH.cache.clear(); restyle(); };
  const sec = (title, sub, ...kids) => h('div', { class: 'stsec' }, h('h4', null, title, sub ? h('span', { class: 'muted' }, ' — ' + sub) : null), ...kids);
  const finIdx = R.fin || 0;
  sc.append(
    sec('Cabinet finish', FINISHES[finIdx].n, h('div', { class: 'swrow' }, FINISHES.map((f, i) => h('button', { class: 'sw' + (i === finIdx ? ' on' : ''), title: f.n, 'aria-label': 'Cabinet finish ' + f.n, onclick: () => { R.fin = i; S.items.forEach(it => { if (P(it.pid).variants[0].fin) it.v = i; }); TH.cache.clear(); restyle(); } }, h('i', { style: `background:${f.sw}` })))),
      h('p', { class: 'hint' }, 'Applies to every cabinet. Change a single unit from its Item options.')),
    sec('Countertop', COUNTER(st.counter).n, h('div', { class: 'texgrid' }, COUNTERS.map(c => texBtn(c.n, texURL(c.kind, c.c, c.c2), st.counter === c.id, () => set('counter', c.id))))),
    sec('Handles', null, h('div', { class: 'pills' }, HANDLES.map(([id, n]) => h('button', { class: 'pillf' + (st.handle === id ? ' on' : ''), onclick: () => set('handle', id) }, n)))),
    sec('Wall tiles', TILE(st.tile).n, h('div', { class: 'pills' }, TILE_COVER.map(([id, n]) => h('button', { class: 'pillf' + (st.tileCover === id ? ' on' : ''), onclick: () => set('tileCover', id) }, n))),
      h('div', { class: 'texgrid' }, TILES.map(t => texBtn(t.n, texURL(t.kind, t.c, t.c2), st.tile === t.id, () => set('tile', t.id))))),
    sec('Floor', FLOOR(R.floor).name, h('div', { class: 'texgrid' }, FLOORS.map(f => texBtn(f.name, texURL(f.kind, f.c, f.c2), R.floor === f.id, () => { R.floor = f.id; restyle(); })))),
    sec('Wall paint', null, h('div', { class: 'chips', style: 'grid-template-columns:repeat(6,36px)' }, WALL_COLORS.map(c => h('button', { class: 'chip' + (R.wall === c ? ' on' : ''), style: `background:${c};width:36px;height:36px`, 'aria-label': 'Wall paint ' + c, onclick: () => { R.wall = c; restyle(); } })))));
}
function renderList(sc) {
  if (!S.items.length) { sc.append(h('div', { class: 'empty' }, h('div', { html: ico('list', 36), style: 'opacity:.4' }), h('p', null, 'Your kitchen is empty. Add units from the Add tab and they will be listed here with prices.'))); return; }
  const groups = {}; S.items.forEach(it => { (groups[P(it.pid).cat] = groups[P(it.pid).cat] || []).push(it); });
  for (const cat of KCATS.filter(c => groups[c])) {
    const its = groups[cat], sub = its.reduce((s, i) => s + priceOf(i), 0);
    sc.append(h('div', { class: 'lgroup' }, h('h4', null, h('span', null, cat, h('span', { class: 'muted', style: 'font-weight:400;font-size:13px', html: ' · ' + priceHTML(sub) })), h('button', { class: 'pill-btn sm', onclick: () => addToBag(its.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, qty: 1 }))) }, `Add ${its.length} to bag`)),
      its.map(it => { const p = P(it.pid), v = p.variants[it.v] || p.variants[0]; return h('div', { class: 'lrow', onclick: () => select(it), role: 'button', tabindex: 0, onkeydown: e => { if (e.key === 'Enter') select(it); } }, thumbImg(p.id, it.v, '', it.cfg), h('div', null, h('b', null, p.name), h('div', null, p.desc(it.cfg, v))), h('span', { class: 'p', html: priceHTML(priceOf(it)) })); })));
  }
  sc.append(h('div', { class: 'sticky' }, h('button', { class: 'cta', onclick: () => addToBag(S.items.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, qty: 1 }))), html: ico('bagplus', 22) + ' Add all to shopping bag' })));
}
const SWAP_GROUP = { base: 'base', sink: 'sink', stove: 'stove', chimney: 'chimney', wall: 'wallu', loft: 'wallu', shelf: 'wallu', tall: 'tall', fridge: 'fridge', 'counter-appliance': 'counter', ro: 'ro', stool: 'stool' };
function renderItemOptions(root) {
  const it = S.sel, p = P(it.pid), v = p.variants[it.v] || p.variants[0], sh = shapeOf(it);
  root.append(h('div', { class: 'ihead' }, h('button', { class: 'x', 'aria-label': 'Close item options', html: ico('close', 18), onclick: deselect }), h('h3', null, 'Item options')));
  const sc = h('div', { class: 'pscroll' }); root.append(sc);
  const fav = h('button', { class: 'pheart' + (S.favs.has(p.id) ? ' on' : ''), style: 'position:static;opacity:1;width:36px;height:36px', 'aria-label': 'Save for later', html: ico('heart', 22), onclick: () => { toggleFav(p.id); fav.classList.toggle('on', S.favs.has(p.id)); } });
  sc.append(h('div', { class: 'icard' }, h('div', { class: 'pic' }, thumbImg(p.id, it.v, '', it.cfg)), h('div', null, h('div', { style: 'display:flex;justify-content:space-between;align-items:flex-start' }, h('h4', null, p.name, p.essential ? h('span', { class: 'tag' }, 'Essential') : null), fav),
    h('div', { class: 'd' }, p.desc(it.cfg, v)), h('div', { style: 'display:flex;gap:12px;align-items:center;flex-wrap:wrap' }, h('span', { class: 'pr', html: priceHTML(priceOf(it)) }), h('span', { html: stars(p.rating) + ` <span class="muted">(${p.reviews})</span>` })),
    h('button', { class: 'linkbtn', onclick: () => showDetails(p), html: ico('ext', 18) + 'Show More Details' }))));
  for (const o of p.opts) sc.append(h('div', { class: 'cfgsec' }, h('div', { class: 'sub' }, o.label), h('div', { class: 'pills', style: 'padding:2px 24px 4px' }, o.values.map(([val, lab]) => h('button', { class: 'pillf' + (it.cfg[o.key] === val ? ' on' : ''), 'aria-pressed': it.cfg[o.key] === val, onclick: () => setCfg(it, o.key, val) }, lab)))));
  sc.append(h('div', { class: 'cfgsec' }, h('div', { class: 'sub' }, v.fin ? 'Finish' : 'Colour', h('span', { class: 'muted', style: 'font-weight:400' }, ' — ' + v.n)),
    h('div', { class: 'swrow', style: 'padding:4px 24px 8px' }, p.variants.map((vv, i) => h('button', { class: 'sw sm' + (i === it.v ? ' on' : ''), title: vv.n, 'aria-label': vv.n, onclick: () => setVariant(it, i) }, h('i', { style: `background:${vv.sw}` }))))));
  const inBag = S.bag.some(l => l.pid === it.pid && l.v === it.v && JSON.stringify(l.cfg) === JSON.stringify(it.cfg));
  sc.append(h('button', { class: 'cta' + (inBag ? ' added' : ''), onclick: () => addToBag([{ pid: it.pid, v: it.v, cfg: it.cfg, qty: 1 }]), html: ico(inBag ? 'check' : 'bagplus', 22) + (inBag ? ' In your bag — add another' : ' Add to bag') }));
  sc.append(h('div', { class: 'sub' }, 'How to get it'), h('div', { class: 'how' }, h('span', null, h('i'), 'Delivery'), h('span', null, h('i'), p.mount === 'counter' ? 'Store pick-up' : 'Installation included'), h('span', null, h('i'), 'Site measurement visit')));
  const open = S.sizeOpen, mountTxt = p.mount === 'wall' ? `Mounted ${fmtLen(sh.y0)} above the floor${it.wall ? ` on the ${WALL_NAME[it.wall].toLowerCase()}` : ''}.` : p.mount === 'counter' ? (sh.y0 > .01 ? 'Sits on the counter.' : 'Not on a counter yet.') : it.wall ? `Against the ${WALL_NAME[it.wall].toLowerCase()}.` : 'Free-standing (island or loose).';
  sc.append(h('div', { class: 'acc' }, h('button', { 'aria-expanded': !!open, onclick: () => { S.sizeOpen = !open; renderPanel(true); } }, h('div', null, h('b', null, 'Size'), h('span', { class: 's' }, `${Math.round(sh.w * 100)}×${Math.round(sh.d * 100)}×${Math.round(sh.h * 100)} cm`)), h('span', { html: ico(open ? 'chev' : 'chevr', 22) })),
    open ? h('div', { class: 'abody' }, `${fmtCm(sh.w * 100)} wide × ${fmtCm(sh.d * 100)} deep × ${fmtCm(sh.h * 100)} high. ${mountTxt}`) : null));
  sc.append(h('div', { class: 'ptabs', role: 'tablist' }, ['swap', 'goes'].map(t => h('button', { class: 'pillf' + (S.itemTab === t ? ' on' : ''), role: 'tab', 'aria-selected': S.itemTab === t, onclick: () => { S.itemTab = S.itemTab === t ? 'details' : t; renderPanel(true); } }, t === 'swap' ? 'Swap with similar' : 'Goes well with'))));
  if (S.itemTab === 'swap') {
    const sim = PRODUCTS.filter(q => q.id !== p.id && SWAP_GROUP[q.role] === SWAP_GROUP[p.role]);
    sc.append(sim.length ? h('div', { class: 'pgrid', role: 'tabpanel' }, sim.map(q => pcard(q, { swap: true, onAdd: x => replaceItem(it, x.id) }))) : h('div', { class: 'empty' }, 'No alternatives for this unit — try changing its options above instead.'));
  } else if (S.itemTab === 'goes') {
    const g = (p.goes || []).map(P).filter(Boolean);
    sc.append(g.length ? h('div', { class: 'pgrid', role: 'tabpanel' }, g.map(q => pcard(q))) : h('div', { class: 'empty' }, 'No suggestions for this unit.'));
  }
}
function showDetails(p) {
  const it = S.sel && S.sel.pid === p.id ? S.sel : null, c = it ? it.cfg : defCfg(p), v = p.variants[it ? it.v : 0];
  modal(h('div', null, h('h3', null, p.name), h('p', { class: 'muted' }, `${p.type} · ${p.cat}`),
    h('div', { style: 'display:grid;grid-template-columns:200px 1fr;gap:20px' }, h('div', { style: 'background:#fafafa;border-radius:8px;display:grid;place-items:center' }, thumbImg(p.id, it ? it.v : 0, 'big', c)),
      h('div', null, h('div', { class: 'pr', style: 'font-size:26px;font-weight:700', html: priceHTML(p.price(c, v)) }), h('p', null, p.desc(c, v) + '.'),
        p.opts.length ? h('p', null, 'Options: ' + p.opts.map(o => `${o.label.toLowerCase()} (${o.values.map(x => x[1]).join(', ')})`).join('; ') + '.') : null,
        h('p', null, `Finishes: ${p.variants.map(x => x.n).join(', ')}.`),
        h('p', { class: 'muted' }, 'Dummy product built from primitive shapes with procedural textures. Prices are indicative.')))));
}
function renderItemFloat() {
  const box = $('#itemfloat'), it = S.sel;
  if (!it) { box.hidden = true; return; }
  const p = P(it.pid), sw = $('#swatches'), pill = $('#pill'), rb = $('#rotbox');
  sw.innerHTML = ''; sw.hidden = S.rotating; rb.hidden = !S.rotating;
  p.variants.forEach((v, i) => sw.append(h('button', { class: 'sw' + (p.variants.length > 4 ? ' sm' : '') + (i === it.v ? ' on' : ''), title: v.n, 'aria-label': v.n, onclick: () => setVariant(it, i) }, h('i', { style: `background:${v.sw}` }))));
  const b = (icon, label, fn, on) => h('button', { class: on ? 'on' : '', onclick: fn, title: label, html: ico(icon, 22) + `<span>${label}</span>` });
  pill.innerHTML = '';
  pill.append(b('bagplus', 'Add to bag', () => addToBag([{ pid: it.pid, v: it.v, cfg: it.cfg, qty: 1 }])), h('span', { class: 'psep' }),
    p.mount === 'wall' ? null : b('rotate', 'Rotate', () => { S.rotating = !S.rotating; renderItemFloat(); positionOverlay(); }, S.rotating),
    b('swap', 'Replace', () => { S.itemTab = 'swap'; S.rotating = false; renderItemFloat(); renderPanel(true); }),
    b('goes', 'Goes with', () => { S.itemTab = 'goes'; S.rotating = false; renderItemFloat(); renderPanel(true); }),
    b('copy', 'Make copy', () => copyItem(it)), b('trash', 'Remove', () => removeItem(it)));
  const sl = $('#rotslider'); sl.value = it.rot; $('#rotval').textContent = Math.round(it.rot);
  box.hidden = false; positionOverlay();
}

/* ── bag & summary (lines carry the configuration) ── */
const lineKey = l => `${l.pid}|${l.v}|${JSON.stringify(l.cfg || {})}`;
const linePrice = l => { const p = P(l.pid); return p.price(l.cfg || defCfg(p), p.variants[l.v] || p.variants[0]); };
const lineDesc = l => { const p = P(l.pid); return p.desc(l.cfg || defCfg(p), p.variants[l.v] || p.variants[0]); };
function addToBag(lines) {
  for (const l of lines) { const ex = S.bag.find(b => lineKey(b) === lineKey(l)); ex ? ex.qty += l.qty : S.bag.push({ pid: l.pid, v: l.v, cfg: l.cfg, qty: l.qty }); }
  store.set('bag', S.bag); updateBagCount(); toast(`${lines.length > 1 ? lines.length + ' items' : P(lines[0].pid).name} added to your bag.`, { action: 'View bag', fn: showBag });
  if (S.sel) renderPanel(true);
}
function showBag() {
  S.bag = S.bag.filter(l => P(l.pid));
  const content = h('div');
  const draw = () => {
    content.innerHTML = ''; content.append(h('h3', null, 'Shopping bag'));
    if (!S.bag.length) { content.append(h('p', { class: 'muted' }, 'Your bag is empty.')); return; }
    const total = S.bag.reduce((s, l) => s + linePrice(l) * l.qty, 0);
    content.append(h('table', { class: 'sumtable' }, h('tbody', null, S.bag.map(l => { const p = P(l.pid); return h('tr', null, h('td', null, thumbImg(l.pid, l.v, '', l.cfg)), h('td', null, h('b', null, p.name), h('div', { class: 'muted' }, lineDesc(l))),
      h('td', null, h('span', { class: 'stepper' }, h('button', { 'aria-label': 'Less', html: ico('minus', 14), onclick: () => { l.qty--; if (l.qty < 1) S.bag.splice(S.bag.indexOf(l), 1); store.set('bag', S.bag); updateBagCount(); draw(); } }), l.qty, h('button', { 'aria-label': 'More', html: ico('plus', 14), onclick: () => { l.qty++; store.set('bag', S.bag); updateBagCount(); draw(); } }))),
      h('td', { class: 'r', html: priceHTML(linePrice(l) * l.qty) })); }))));
    content.append(h('div', { class: 'sumtotal' }, h('span', null, 'Total'), h('span', { html: priceHTML(total) })), h('div', { class: 'actions' }, h('button', { class: 'pill-btn', onclick: () => { S.bag = []; store.set('bag', S.bag); updateBagCount(); draw(); } }, 'Empty bag'), h('button', { class: 'pill-btn primary', onclick: () => toast('Checkout is not part of this demo.') }, 'Book a measurement visit')));
  };
  draw(); modal(content);
}
function showSummary() {
  const rows = {}; S.items.forEach(it => { const l = { pid: it.pid, v: it.v, cfg: it.cfg }, k = lineKey(l); rows[k] = rows[k] || Object.assign(l, { qty: 0 }); rows[k].qty++; });
  const list = Object.values(rows).sort((a, b) => KCATS.indexOf(P(a.pid).cat) - KCATS.indexOf(P(b.pid).cat)), total = totalPrice(), st = styleOf();
  const c = modal(h('div', null, h('h3', null, S.title || 'My kitchen'), h('p', { class: 'muted' }, `${S.items.length} item${S.items.length === 1 ? '' : 's'} · ${fmtLen(S.room.x1 - S.room.x0)} × ${fmtLen(S.room.z1 - S.room.z0)} · ${COUNTER(st.counter).n} counter · ${TILE(st.tile).n} tiles (${TILE_COVER.find(t => t[0] === st.tileCover)[1].toLowerCase()})`),
    h('table', { class: 'sumtable' }, h('thead', null, h('tr', null, h('th'), h('th', null, 'Unit'), h('th', null, 'Qty'), h('th', { class: 'r' }, 'Price'))),
      h('tbody', null, list.map(l => { const p = P(l.pid); return h('tr', null, h('td', null, thumbImg(l.pid, l.v, '', l.cfg)), h('td', null, h('b', null, p.name), h('div', { class: 'muted' }, lineDesc(l))), h('td', null, l.qty), h('td', { class: 'r', html: priceHTML(linePrice(l) * l.qty) })); }))),
    h('div', { class: 'sumtotal' }, h('span', null, 'Subtotal'), h('span', { html: priceHTML(total) })),
    warnCache.length ? h('p', { style: 'color:#b3261e;margin:4px 8px' }, `${warnCache.length} thing${warnCache.length > 1 ? 's' : ''} to check before ordering — see Safety warnings & tips.`) : null,
    h('div', { class: 'actions' }, h('button', { class: 'pill-btn', onclick: () => c() }, 'Back to design'), h('button', { class: 'pill-btn primary', onclick: () => { addToBag(S.items.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, qty: 1 }))); c(); showBag(); } }, 'Add all to shopping bag'))), true);
}
function renderWarnings() {
  const body = $('#warn-body'), badge = $('#warn-count');
  badge.textContent = warnCache.length; badge.hidden = !warnCache.length;
  body.innerHTML = '';
  if (warnCache.length) body.append(h('h4', null, 'Needs attention'), h('ul', null, warnCache.map(w => h('li', { class: 'bad' }, w.text))));
  if (okCache.length) body.append(h('h4', null, 'Looks good'), h('ul', null, okCache.map(w => h('li', { class: 'good' }, w.text))));
  body.append(h('h4', null, 'Tips'), h('ul', null, TIPS.map(t => h('li', null, t))));
}

/* ── edit-room integration ── */
function enterEdit(step = 1) {
  deselect(); closePopovers(); toggleStrip(false);
  S.edit = { step, sub: 'plan', snap: JSON.stringify(S.room), itemsSnap: JSON.stringify(S.items.map(i => [i.x, i.z, i.rot, i.wall])), undo: [], redo: [], feat: null, prevView: S.view === 'inside' ? 'dollhouse' : S.view };
  S.mode = 'edit'; S.view = step === 1 ? 'top' : 'dollhouse'; CAM.px = 0; CAM.pz = 0;
  renderBottomBar(); syncEditHeader(); updateCamera(); renderPanel(); markDirty(); positionOverlay();
}
function exitEdit(commit) {
  if (!commit) { S.room = JSON.parse(S.edit.snap); JSON.parse(S.edit.itemsSnap).forEach((s, i) => { const it = S.items[i]; if (it) [it.x, it.z, it.rot, it.wall] = s; }); }
  else {
    reflowItems(); const old = S.designId; S.designId = uid(); const d = docs(); delete d[old]; store.set('designs', d);
    history.replaceState(null, '', `#${S.templateId}/${S.designId}`);
  }
  const pv = S.edit.prevView; S.mode = 'design'; S.edit = null; S.view = pv;
  buildRoom(); fitCamera(); updateCamera(); renderBottomBar(); renderPanel(); refreshTotals(); refreshWarnings(); queueSave(); markDirty(); positionOverlay();
  if (commit) toast('Kitchen updated.');
}
function editUndo() { if (!S.edit.undo.length) return; S.edit.redo.push(JSON.stringify(S.room)); S.room = JSON.parse(S.edit.undo.pop()); S.edit.feat = null; reflowItems(); buildRoom(); updateEditUI(); renderPanel(true); }
function editRedo() { if (!S.edit.redo.length) return; S.edit.undo.push(JSON.stringify(S.room)); S.room = JSON.parse(S.edit.redo.pop()); S.edit.feat = null; reflowItems(); buildRoom(); updateEditUI(); renderPanel(true); }

/* ── persistence & lifecycle ── */
function currentDoc() {
  return { id: S.designId, templateId: S.templateId, title: S.title, room: S.room, updated: Date.now(), kitchen: 1,
    items: S.items.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, x: +i.x.toFixed(3), z: +i.z.toFixed(3), rot: i.rot, wall: i.wall })) };
}
function startDesign(doc) {
  S.designId = doc.id; S.templateId = doc.templateId; S.title = doc.title || 'My kitchen'; S.room = JSON.parse(JSON.stringify(doc.room));
  S.room.style = Object.assign({}, DEFAULT_STYLE, S.room.style || {}); S.room.fin = S.room.fin || 0;
  S.mode = 'design'; S.edit = null; S.view = 'dollhouse'; S.sel = null; S.tab = 'add'; S.cat = null; S.query = ''; S.menu = null; S.stripOpen = false; S.rotating = false; S.actions = 0;
  GL.itemGroup.children.slice().forEach(c => { GL.itemGroup.remove(c); disposeTree(c); }); S.items = [];
  for (const d of doc.items || []) { const p = P(d.pid); if (!p) continue; const it = { uid: uid(), pid: d.pid, v: d.v || 0, cfg: Object.assign(defCfg(p), d.cfg || {}), x: d.x, z: d.z, rot: d.rot || 0, wall: d.wall ?? null }; S.items.push(it); attachItem(it); }
  $('#design-title').value = S.title; toggleStrip(false); closePopovers();
  buildRoom(); fitCamera(); updateCamera(); renderBottomBar(); renderPanel(); refreshTotals(); refreshWarnings(); renderItemFloat(); updateBagCount(); markDirty();
}
function openTemplate(tid, did) {
  const t = TPL(tid) || (tid === 'custom' ? TPL('e-standard') : null); if (!t) return false;
  const room = roomFromTemplate(t); room.fin = t.fin || 0;
  startDesign({ id: did || uid(), templateId: tid, title: t.kind === 'layout' && tid !== 'custom' ? t.name : 'My kitchen', room, items: layoutItems(room, t) }); return true;
}

/* ── hub ── */
function planSVG(R, items) {
  const W = R.x1 - R.x0, D = R.z1 - R.z0, k = 40, pad = 14, fl = FLOOR(R.floor), id = 'g' + Math.random().toString(36).slice(2, 7);
  let s = `<svg viewBox="0 0 ${W * k + pad * 2} ${D * k + pad * 2}" aria-hidden="true"><defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${fl.c}"/><path d="M0 0h12M0 0v12" stroke="rgba(0,0,0,.1)"/></pattern></defs>`;
  s += `<rect x="${pad}" y="${pad}" width="${W * k}" height="${D * k}" fill="url(#${id})"/>`;
  const rect = (it, d, fill, stroke, dash) => { const e = extOf(d, it.rot); return `<rect x="${(pad + (it.x - e.hw - R.x0) * k).toFixed(1)}" y="${(pad + (it.z - e.hd - R.z0) * k).toFixed(1)}" width="${(e.hw * 2 * k).toFixed(1)}" height="${(e.hd * 2 * k).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"${dash ? ' stroke-dasharray="3 2"' : ''}/>`; };
  for (const it of items || []) {
    const p = P(it.pid); if (!p || p.mount !== 'floor') continue; const d = dimsOf(p, it.cfg, R);
    if (p.role === 'stool') { s += `<circle cx="${pad + (it.x - R.x0) * k}" cy="${pad + (it.z - R.z0) * k}" r="${d.w * k / 2}" fill="#c9b79a" stroke="#8a7a60"/>`; continue; }
    s += rect(it, d, p.essential === 'sink' ? '#a9cbe0' : p.essential === 'stove' ? '#55565a' : p.role === 'fridge' || p.role === 'tall' ? '#c3cad2' : '#e2ddd3', '#7d766b');
  }
  for (const it of items || []) { const p = P(it.pid); if (p && p.essential === 'chimney') s += rect(it, dimsOf(p, it.cfg, R), 'none', '#c4362b', true); }
  s += `<rect x="${pad}" y="${pad}" width="${W * k}" height="${D * k}" fill="none" stroke="#333" stroke-width="5"/>`;
  for (const f of R.feats) {
    const wk = f.w * k, o = { N: [pad + (f.u - f.w / 2) * k, pad], S: [pad + (f.u - f.w / 2) * k, pad + D * k], W: [pad, pad + (f.u - f.w / 2) * k], E: [pad + W * k, pad + (f.u - f.w / 2) * k] }[f.wall];
    const tr = { N: `translate(${o[0]} ${o[1]})`, S: `translate(${o[0]} ${o[1]}) scale(1 -1)`, W: `translate(${o[0]} ${o[1]}) matrix(0 1 1 0 0 0)`, E: `translate(${o[0]} ${o[1]}) matrix(0 1 -1 0 0 0)` }[f.wall];
    s += `<g transform="${tr}"><line x1="0" y1="0" x2="${wk}" y2="0" stroke="#fff" stroke-width="7"/>`;
    if (f.kind === 'door') { const n = STYLE[f.style].leaves >= 2 ? 2 : 1, lw = wk / n; for (let i = 0; i < n; i++) { const x0 = i * lw; s += i % 2 ? `<path d="M${x0 + lw} 0v${lw}M${x0} 0A${lw} ${lw} 0 0 0 ${x0 + lw} ${lw}" fill="none" stroke="#555" stroke-width="1.5"/>` : `<path d="M${x0} 0v${lw}M${x0 + lw} 0A${lw} ${lw} 0 0 1 ${x0} ${lw}" fill="none" stroke="#555" stroke-width="1.5"/>`; } }
    else s += `<line x1="0" y1="-2" x2="${wk}" y2="-2" stroke="#4a90c0" stroke-width="2"/><line x1="0" y1="2" x2="${wk}" y2="2" stroke="#4a90c0" stroke-width="2"/>`;
    s += '</g>';
  }
  return s + '</svg>';
}
function roomCard(name, R, tid, opts = {}) {
  return h('button', { class: 'rcard', onclick: () => opts.onclick ? opts.onclick() : go(tid) }, h('div', { class: 'thumb', html: planSVG(R, opts.items) }),
    h('div', { class: 'meta' }, h('small', null, opts.small || `${sqft(R)} sq.ft`), h('strong', null, name), opts.blurb ? h('span', { class: 'muted', style: 'font-size:13px' }, opts.blurb) : null, h('span', { class: 'go' }, opts.cta || 'Design this kitchen', h('span', { html: ico('arrow', 18) }))));
}
function renderHub() {
  const ge = $('#grid-empty'), gf = $('#grid-furnished'), gm = $('#mydesigns-grid'); ge.innerHTML = gf.innerHTML = gm.innerHTML = '';
  KITCHENS.forEach(t => { const R = roomFromTemplate(t), items = layoutItems(R, t); (t.kind === 'layout' ? gf : ge).append(roomCard(t.name, R, t.id, { items, blurb: t.blurb, small: `${fmtHub(R)} · ${sqft(R)} sq.ft` })); });
  const all = Object.values(docs()).filter(d => d && d.room && d.kitchen).sort((a, b) => b.updated - a.updated);
  $('#mydesigns').hidden = !all.length; $('#saved-hint').textContent = all.length ? `${all.length} saved kitchen${all.length > 1 ? 's' : ''} in this browser` : '';
  all.forEach(d => {
    const c = roomCard(d.title || 'My kitchen', d.room, d.templateId, { items: d.items, small: `${d.items.length} item${d.items.length === 1 ? '' : 's'} · ${new Date(d.updated).toLocaleDateString()}`, cta: 'Open design', onclick: () => { location.hash = `#${d.templateId}/${d.id}`; } });
    const del = h('button', { class: 'pill-btn sm', style: 'margin:0 14px 14px;align-self:flex-start', onclick: e => { e.stopPropagation(); const m = docs(); delete m[d.id]; store.set('designs', m); renderHub(); } }, 'Delete');
    const wrap = h('div', { class: 'rcard', style: 'padding:0;border:0;box-shadow:none' }); c.style.width = '100%'; wrap.append(c, del); gm.append(wrap);
  });
  drawHero(); hydrateIcons($('#hub'));
}
const fmtHub = R => `${(R.x1 - R.x0).toFixed(1)} × ${(R.z1 - R.z0).toFixed(1)} m`;
function drawHero() {
  const cv = $('#hero-canvas'), g = cv.getContext('2d'), w = cv.width; g.clearRect(0, 0, w, cv.height);
  const iso = (x, y, z) => [w / 2 + (x - z) * 46, 210 + (x + z) * 26 - y * 52];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); };
  const box = (x, y, z, W, Hh, D, top, l, r) => { poly([iso(x, y + Hh, z), iso(x + W, y + Hh, z), iso(x + W, y + Hh, z + D), iso(x, y + Hh, z + D)], top); poly([iso(x, y, z + D), iso(x + W, y, z + D), iso(x + W, y + Hh, z + D), iso(x, y + Hh, z + D)], l); poly([iso(x + W, y, z), iso(x + W, y, z + D), iso(x + W, y + Hh, z + D), iso(x + W, y + Hh, z)], r); };
  poly([iso(0, 0, 0), iso(6, 0, 0), iso(6, 0, 4), iso(0, 0, 4)], '#e9e1d0');
  for (let i = 1; i < 10; i++) { g.strokeStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.moveTo(...iso(i * .6, 0, 0)); g.lineTo(...iso(i * .6, 0, 4)); g.stroke(); g.beginPath(); g.moveTo(...iso(0, 0, i * .45)); g.lineTo(...iso(6, 0, i * .45)); g.stroke(); }
  poly([iso(0, 0, 0), iso(6, 0, 0), iso(6, 3, 0), iso(0, 3, 0)], '#efede8'); poly([iso(0, 0, 0), iso(0, 0, 4), iso(0, 3, 4), iso(0, 3, 0)], '#e3e0d9');
  poly([iso(.2, 1.05, 0), iso(5.8, 1.05, 0), iso(5.8, 1.7, 0), iso(.2, 1.7, 0)], '#dfe7e2');
  poly([iso(3.4, 1.85, 0), iso(4.6, 1.85, 0), iso(4.6, 2.85, 0), iso(3.4, 2.85, 0)], '#cfe6f2');
  box(.2, 0, 0, 5.6, .95, 1.1, '#2a2a2e', '#8fa58a', '#7d9378'); box(.2, .95, 0, 5.6, .08, 1.18, '#1f1f22', '#333', '#2a2a2a');
  box(1.6, 1.03, .25, 1.1, .02, .8, '#0f0f10', '#0f0f10', '#0f0f10');
  box(.2, 1.85, 0, 1.2, 1.2, .62, '#7d9378', '#8fa58a', '#7d9378'); box(4.8, 1.85, 0, 1, 1.2, .62, '#7d9378', '#8fa58a', '#7d9378');
  box(1.75, 1.9, 0, .8, .25, .8, '#b9bcc0', '#c8cbcf', '#a9acb0'); box(2.0, 2.15, 0, .3, .85, .3, '#b9bcc0', '#c8cbcf', '#a9acb0');
  box(3.7, 1.03, .15, .6, .02, .55, '#b8bcc1', '#9a9ea3', '#9a9ea3');
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
  $('#way-quick').onclick = () => $('#rooms-furnished').scrollIntoView({ behavior: 'smooth' });
  $('#way-build').onclick = startBuild;
  if (!store.get('cookies', false)) { $('#cookie').hidden = false; $('#cookie-ok').onclick = () => { store.set('cookies', true); $('#cookie').hidden = true; }; $('#cookie-set').onclick = () => { store.set('cookies', true); $('#cookie').hidden = true; toast('Only local storage is used.'); }; }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', saveNow);
  updateBagCount(); route();
  window.__interio = { S, CAM, GL, addItem, select, enterEdit, setView, PRODUCTS, KITCHENS, P, refreshWarnings, computeWarnings, shapeOf, priceOf }; // handy for debugging
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
