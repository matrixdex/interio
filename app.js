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
  ext: '<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>', spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>', list: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>'
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

/* No hard-coded layouts: rooms and kitchens are generated by the AI designer (section 13).
   A plain empty room is the only built-in starting point, for drawing a kitchen by hand. */
function emptyRoom() {
  return { x0: -1.5, x1: 1.5, z0: -1.35, z1: 1.35, h: 2.75, wall: DEFAULT_WALL, floor: 'f0', fin: 0, feats: [feat('N', 'w1', 1.5), feat('S', 'single', .8)], style: Object.assign({}, DEFAULT_STYLE) };
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
  r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.setClearColor(0xdcd6cb, 1);
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
const PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function groundPoint(e) { setNDC(e); const v = new THREE.Vector3(); return GL.ray.ray.intersectPlane(PLANE, v) ? v : null; }

const DRAG = { mode: null, id: null, sx: 0, sy: 0, moved: false, item: null, offx: 0, offz: 0, az: 0, el: 0, px: 0, pz: 0, yaw: 0, pitch: 0, handle: null };

/* ═══════════════ 6d · control layer: touch + trackpad first ═══════════════
   One finger / one pointer: drag a unit, drag a door or window along its wall, or orbit (dollhouse) / pan (top).
   Two fingers: pinch = zoom, move = pan, twist = orbit. Trackpad: pinch = zoom, two-finger scroll = orbit / pan.
   Mouse wheel = zoom. Catalogue cards can be dragged onto the room. */
const PTR = new Map(); // active pointers on the canvas
let GESTURE = null;
function bindCanvas() {
  const cv = $('#gl');
  cv.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already-released pointer */ } cv.focus({ preventScroll: true }); closePopovers();
    PTR.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (PTR.size === 2) { startGesture(); return; }
    if (PTR.size > 2) return;
    Object.assign(DRAG, { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, item: null, feat: null, featDesign: false });
    const camDrag = () => { DRAG.mode = 'cam'; DRAG.az = CAM.az; DRAG.el = CAM.el; DRAG.px = CAM.px; DRAG.pz = CAM.pz; DRAG.yaw = CAM.yaw; DRAG.pitch = CAM.pitch; };
    if (S.mode === 'edit') {
      if (S.edit.step === 2) { const f = pickFeature(e); if (f) { selectFeature(f); editPush(); startFeatDrag(e, f); return; } }
      return camDrag();
    }
    const it = e.button === 0 ? pickItem(e) : null;
    if (it) {
      select(it); const s0 = shapeOf(it), g = new THREE.Vector3();
      DRAG.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -s0.y0); setNDC(e); const okp = GL.ray.ray.intersectPlane(DRAG.plane, g);
      DRAG.mode = 'item'; DRAG.item = it; DRAG.offx = okp ? it.x - g.x : 0; DRAG.offz = okp ? it.z - g.z : 0; DRAG.rot0 = it.rot; DRAG.start = { x: it.x, z: it.z, rot: it.rot, wall: it.wall };
      DRAG.riders = P(it.pid).counter ? S.items.filter(o => o !== it && P(o.pid).mount === 'counter' && Math.abs(o.x - it.x) <= s0.hw && Math.abs(o.z - it.z) <= s0.hd) : null;
      (DRAG.riders || []).forEach(r => { r._ox = r.x - it.x; r._oz = r.z - it.z; r._rot0 = r.rot; });
      cv.style.cursor = 'grabbing'; return;
    }
    const f = e.button === 0 && S.view !== 'inside' ? pickFeature(e) : null;
    if (f) { TB.undo.push(JSON.stringify(currentDoc())); TB.redo = []; DRAG.featDesign = true; startFeatDrag(e, f); return; }
    camDrag();
  });
  cv.addEventListener('pointermove', e => {
    if (PTR.has(e.pointerId)) PTR.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (GESTURE) { moveGesture(); return; }
    if (DRAG.mode == null || e.pointerId !== DRAG.id) { hoverCursor(e); return; }
    const dx = e.clientX - DRAG.sx, dy = e.clientY - DRAG.sy;
    if (!DRAG.moved && Math.hypot(dx, dy) < (e.pointerType === 'touch' ? 8 : 4)) return; DRAG.moved = true;
    if (DRAG.mode === 'item') dragItem(e);
    else if (DRAG.mode === 'feat') dragFeature(e);
    else if (DRAG.mode === 'cam') {
      if (S.view === 'dollhouse') { CAM.az = DRAG.az - dx * .4; CAM.el = clamp(DRAG.el + dy * .3, 8, 86); }
      else if (S.view === 'top') { const k = topViewHeight() / GL.vh; CAM.px = DRAG.px - dx * k; CAM.pz = DRAG.pz - dy * k; }
      else { CAM.yaw = clamp(DRAG.yaw - dx * .18, -80, 80); CAM.pitch = clamp(DRAG.pitch - dy * .12, -30, 30); }
      updateCamera(); markDirty(); positionOverlay();
    }
  });
  const end = e => {
    PTR.delete(e.pointerId);
    if (GESTURE) { if (PTR.size < 2) { GESTURE = null; DRAG.mode = null; DRAG.id = null; } return; }
    if (e.pointerId !== DRAG.id) return;
    const was = DRAG.mode, moved = DRAG.moved; cv.style.cursor = '';
    if (was === 'item' && moved) afterChange({ keepPanel: true });
    if (was === 'feat') {
      if (DRAG.featDesign) { if (moved) { refreshWarnings(); afterChange({ keepPanel: true, quiet: true }); } else TB.undo.pop(); }
      else { if (!moved) S.edit.undo.pop(); else editCommit(); }
      DRAG.feat = null; positionOverlay();
    }
    if (was === 'cam' && !moved) { if (S.mode === 'design') deselect(); else if (S.mode === 'edit' && S.edit.step === 2) selectFeature(null); }
    if (was === 'item' && !moved) renderItemFloat();
    DRAG.mode = null; DRAG.id = null;
  };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    if (e.ctrlKey) { // trackpad pinch (and ctrl+wheel)
      const dy = clamp(e.deltaY * unit, -ZOOM_SENS.pinchCap, ZOOM_SENS.pinchCap); zoomScale(Math.exp(dy * ZOOM_SENS.pinch)); return;
    }
    const trackpad = e.deltaMode === 0 && (e.deltaX !== 0 || !Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 40);
    if (trackpad) { // two-finger scroll: orbit in 3D, pan in plan, look around inside
      const dx = clamp(e.deltaX, -60, 60), dy = clamp(e.deltaY, -60, 60);
      if (S.view === 'dollhouse') { CAM.az += dx * .22; CAM.el = clamp(CAM.el + dy * .15, 8, 86); }
      else if (S.view === 'top') { const k = topViewHeight() / GL.vh; CAM.px += dx * k; CAM.pz += dy * k; }
      else { CAM.yaw = clamp(CAM.yaw - dx * .12, -80, 80); CAM.pitch = clamp(CAM.pitch - dy * .08, -30, 30); }
      updateCamera(); markDirty(); positionOverlay(); return;
    }
    const dy = clamp(e.deltaY * unit, -ZOOM_SENS.wheelCap, ZOOM_SENS.wheelCap); zoomScale(Math.exp(dy * ZOOM_SENS.wheel));
  }, { passive: false });
  let gScale = 1; // Safari trackpad pinch
  cv.addEventListener('gesturestart', e => { e.preventDefault(); gScale = e.scale || 1; });
  cv.addEventListener('gesturechange', e => { e.preventDefault(); const r = (e.scale || 1) / gScale; gScale = e.scale || 1; zoomScale(Math.pow(1 / r, ZOOM_SENS.gesture)); });
  cv.addEventListener('gestureend', e => e.preventDefault());
}
/* two-finger gestures */
function gestureState() { const [a, b] = [...PTR.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, ang: Math.atan2(b.y - a.y, b.x - a.x) }; }
function startGesture() {
  if (DRAG.mode === 'item' && DRAG.item && DRAG.start) { const it = DRAG.item; Object.assign(it, DRAG.start); syncNode(it); (DRAG.riders || []).forEach(r => { r.x = it.x + r._ox; r.z = it.z + r._oz; r.rot = r._rot0; syncNode(r); }); }
  if (DRAG.mode === 'feat' && DRAG.feat) { DRAG.feat.u = DRAG.u0; buildRoom(); DRAG.feat = null; }
  DRAG.mode = 'gesture'; GESTURE = gestureState();
}
function moveGesture() {
  const g = gestureState(), p = GESTURE;
  zoomScale(clamp(p.d / g.d, .8, 1.25));
  const dx = g.mx - p.mx, dy = g.my - p.my;
  if (S.view === 'top') { const k = topViewHeight() / GL.vh; CAM.px -= dx * k; CAM.pz -= dy * k; }
  else if (S.view === 'dollhouse') {
    const k = CAM.dist / GL.vh * .9, az = rad(CAM.az);
    CAM.px -= (dx * Math.cos(az) + dy * Math.sin(az) * .6) * k; CAM.pz -= (-dx * Math.sin(az) + dy * Math.cos(az) * .6) * k;
    let da = g.ang - p.ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; CAM.az -= deg(da);
  } else { CAM.yaw = clamp(CAM.yaw - dx * .18, -80, 80); CAM.pitch = clamp(CAM.pitch - dy * .12, -30, 30); }
  GESTURE = g; updateCamera(); markDirty(); positionOverlay();
}
function hoverCursor(e) {
  if (S.mode !== 'design' || DRAG.mode || e.pointerType !== 'mouse') return;
  $('#gl').style.cursor = pickItem(e) ? 'grab' : (S.view !== 'inside' && pickFeature(e) ? 'ew-resize' : '');
}
/* doors & windows slide along their wall — in the planner and in Edit room */
function pickFeature(e) {
  setNDC(e);
  const hits = GL.ray.intersectObjects(GL.refs.feats, true);
  for (const h of hits) { let o = h.object, vis = true; while (o) { if (o.visible === false) vis = false; if (o.userData && o.userData.feature) break; o = o.parent; } if (o && vis) return o.userData.feature; }
  return null;
}
function startFeatDrag(e, f) {
  const R = S.room, L = wallLen(f.wall), others = R.feats.filter(g => g !== f && g.wall === f.wall);
  DRAG.mode = 'feat'; DRAG.feat = f; DRAG.g0 = groundPoint(e); DRAG.u0 = f.u;
  DRAG.lo = Math.max(f.w / 2 + .05, ...others.filter(g => g.u < f.u).map(g => g.u + g.w / 2 + f.w / 2 + .02));
  DRAG.hi = Math.min(L - f.w / 2 - .05, ...others.filter(g => g.u > f.u).map(g => g.u - g.w / 2 - f.w / 2 - .02));
  $('#gl').style.cursor = 'ew-resize';
}
function dragFeature(e) {
  const f = DRAG.feat, g = groundPoint(e); if (!g || !DRAG.g0) return;
  const ax = alongAxis(f.wall), d = ax === 'x' ? g.x - DRAG.g0.x : g.z - DRAG.g0.z;
  const u = clamp(Math.round((DRAG.u0 + d) * 100) / 100, DRAG.lo, DRAG.hi); if (u === f.u) return;
  f.u = u; buildRoom(); markDirty(); positionOverlay();
}
/* one placement rule for dragging a unit and for dropping a new one: snap to the nearest wall when close, else free */
function placeShape(it, tx, tz, skip) {
  const p = P(it.pid), R = S.room; let sh = null;
  if (p.mount === 'wall' || p.snap) {
    const dist = { N: tz - R.z0, S: R.z1 - tz, W: tx - R.x0, E: R.x1 - tx }, w = WALLS.reduce((a, b) => dist[a] <= dist[b] ? a : b), d = dimsOf(p, it.cfg);
    if (p.mount === 'wall' || dist[w] < d.d / 2 + .3) {
      sh = snapAlong(wallPlace(it, w, alongAxis(w) === 'x' ? tx : tz), it, alongAxis(w));
      if (collides(sh, it, skip) || (p.mount === 'wall' && featureHit(sh, true))) sh = null;
      if (!sh && p.mount === 'wall') return null;
    }
  }
  if (!sh) for (const [x, z] of [[tx, tz], [tx, it.z], [it.x, tz]]) { const q = clampXZ(it, x, z), s = shapeOf(it, q.x, q.z); if (!collides(s, it, skip)) { sh = s; break; } }
  return sh;
}
function dragItem(e) {
  const it = DRAG.item; setNDC(e);
  const hit = new THREE.Vector3(); if (!GL.ray.ray.intersectPlane(DRAG.plane, hit)) return;
  const sh = placeShape(it, hit.x + DRAG.offx, hit.z + DRAG.offz, DRAG.riders); if (!sh) return;
  applyShape(it, sh); syncNode(it);
  if (DRAG.riders) { const a = rad(it.rot - DRAG.rot0), c = Math.cos(a), s = Math.sin(a); for (const r of DRAG.riders) { r.x = it.x + r._ox * c + r._oz * s; r.z = it.z - r._ox * s + r._oz * c; r.rot = r._rot0 + (it.rot - DRAG.rot0); r.wall = wallOf(shapeOf(r)); syncNode(r); } }
  positionOverlay(); refreshWarnings();
}
/* drag a catalogue card onto the room (mouse, pen and touch — touch drags start on the + button) */
function startCardDrag(e, p) {
  if (e.button !== 0 || S.mode !== 'design') return;
  const sx = e.clientX, sy = e.clientY; let ghost = null;
  const overCanvas = ev => { const r = $('#gl').getBoundingClientRect(), el = document.elementFromPoint(ev.clientX, ev.clientY); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom && el && (el.id === 'gl' || el.closest('#view') && !el.closest('#textbot, #zoom, #itemfloat, #warn')); };
  const move = ev => {
    if (!ghost) { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return; ghost = h('div', { class: 'drag-ghost', 'aria-hidden': 'true' }, thumbImg(p.id, p.variants[0].fin ? S.room.fin || 0 : 0, '', defCfg(p)), h('span', null, p.name)); document.body.append(ghost); document.body.classList.add('dragging'); }
    ev.preventDefault(); ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; ghost.classList.toggle('ok', !!overCanvas(ev));
  };
  const cleanup = () => { if (ghost) ghost.remove(); document.body.classList.remove('dragging'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cleanup); };
  const up = ev => { const dropped = ghost && overCanvas(ev); cleanup(); if (dropped) { dropProduct(p, ev); e.target.dataset.dragged = '1'; setTimeout(() => delete e.target.dataset.dragged, 50); } };
  window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cleanup);
}
function dropProduct(p, ev) {
  const g = groundPoint(ev); if (!g) return;
  const it = { uid: uid(), pid: p.id, v: p.variants[0].fin ? S.room.fin || 0 : 0, cfg: defCfg(p), x: g.x, z: g.z, rot: 0, wall: null };
  const sh = placeShape(it, g.x, g.z) || findSlot(it, { x: g.x, z: g.z });
  if (!sh) return toast(`No room for the ${p.name.toLowerCase()} there.`);
  applyShape(it, sh); S.items.push(it); attachItem(it); select(it); afterChange({ keepPanel: false });
  toast(`Added the ${p.name.toLowerCase()} where you dropped it.`);
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
    if (S.view === 'top' && S.mode === 'design') for (const it of S.items) {
      const sh = shapeOf(it), p = P(it.pid), wallish = p.mount === 'wall', y = wallish ? 0 : sh.y0 + sh.h;
      const pts = [[sh.x - sh.hw, sh.z - sh.hd], [sh.x + sh.hw, sh.z - sh.hd], [sh.x + sh.hw, sh.z + sh.hd], [sh.x - sh.hw, sh.z + sh.hd]].map(([x, z]) => proj(x, y, z));
      s += `<polygon class="plan${wallish ? ' wallu' : ''}${it === S.sel ? ' sel' : ''}" points="${pts.map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ')}"/>`;
    }
    if (S.measure.prod) for (const it of S.items) { if (it.node && !it.node.visible) continue; const sh = shapeOf(it), q = proj(it.x, sh.y0 + sh.h + .05, it.z); add(q.x, q.y - 4, `${fmtCm(sh.w * 100)} × ${fmtCm(sh.d * 100)} × ${fmtCm(sh.h * 100)}`, 'prod'); }
    if (S.measure.space && S.mode === 'design') {
      const list = S.sel ? [S.sel] : S.items.filter(i => P(i.pid).mount === 'floor');
      for (const it of list) for (const g of gapsFor(it)) { const a = proj(g.ax, .02, g.az), b = proj(g.bx, .02, g.bz); line(a, b, 'gap'); add((a.x + b.x) / 2, (a.y + b.y) / 2, fmtLen(g.len), 'gap'); }
    }
    if (DRAG.mode === 'feat' && DRAG.feat) {
      const f = DRAG.feat, fg = GL.refs.feats.find(g => g.userData.feature === f);
      if (fg) { fg.updateWorldMatrix(true, false); const v = new THREE.Vector3(0, (f.sill || 0) + f.h + .12, .06).applyMatrix4(fg.matrixWorld), q = proj(v.x, v.y, v.z), L = wallLen(f.wall), from = { N: 'west', S: 'west', W: 'north', E: 'north' }[f.wall];
        add(clamp(q.x, 175, Math.max(175, GL.vw - 175)), clamp(q.y, 20, GL.vh - 20), `${f.kind} · ${Math.round((f.u - f.w / 2) * 100)} cm from the ${from} corner · ${Math.round((L - f.u - f.w / 2) * 100)} cm to the other`, 'prod'); }
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
function modal(content, wide, onClose) {
  const root = $('#modal-root'); root.innerHTML = '';
  let done = false; const close = () => { if (done) return; done = true; root.innerHTML = ''; document.removeEventListener('keydown', esc); if (onClose) onClose(); };
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
  S.route = 'designer'; $('#hub').hidden = true; $('#designer').hidden = false; document.title = 'Studio — Interio';
  if (!TH.r && !TH.failed) thumbInit(); resize(); markDirty();
}
function showHub() {
  if (S.route === 'designer') saveNow();
  S.route = 'hub'; S.designId = null; $('#hub').hidden = false; $('#designer').hidden = true; document.title = 'Interio'; closePopovers(); renderHub(); window.scrollTo(0, 0);
}

/* ═══════════════ 11 · hub ═══════════════ */

/* ═══════════════ 11b · kitchen planner: drag, tiles, panels, bag, lifecycle, hub ═══════════════ */
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
  // plan (top) view reads like a drawing: wall-mounted units are lifted out (drawn dashed in the overlay) so the worktop shows
  for (const it of S.items) if (it.node) it.node.visible = !(P(it.pid).mount === 'wall' && ((it.wall && hide[it.wall]) || (S.view === 'top' && S.mode === 'design')));
  refs.ceil.visible = S.view === 'inside';
  GL.lamp.intensity = S.view === 'inside' ? .55 : 0;
  GL.hemi.intensity = S.view === 'inside' ? .6 : S.view === 'top' ? .5 : .72;
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
  root.append(h('div', { class: 'tabs', role: 'tablist' }, tab('ai', 'spark', 'AI'), tab('add', 'plus', 'Add'), tab('style', 'palette', 'Finishes'), tab('list', 'list', 'List'), tab('favs', 'heart', 'Saved')));
  const sc = h('div', { class: 'pscroll' }); root.append(sc);
  if (S.tab === 'ai') renderAITab(sc); else if (S.tab === 'add') renderAdd(sc); else if (S.tab === 'style') renderStyle(sc); else if (S.tab === 'list') renderList(sc); else renderFavs(sc);
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
  const act = h('button', { class: 'padd', 'aria-label': o.swap ? `Swap with ${p.name}` : `Add ${p.name} to kitchen — or drag it into the room`, title: o.swap ? 'Swap' : 'Add to kitchen (or drag into the room)', html: ico(o.swap ? 'swap' : 'plus', 22), onclick: e => { e.stopPropagation(); if (e.currentTarget.dataset.dragged) return; o.onAdd ? o.onAdd(p) : addItem(p.id); } });
  if (!o.swap) { act.addEventListener('pointerdown', e => { e.stopPropagation(); startCardDrag(e, p); }); img.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && e.target.closest('.pheart, .padd') == null) startCardDrag(e, p); }); }
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
  return { id: S.designId, templateId: S.templateId, title: S.title, room: S.room, updated: Date.now(), kitchen: 1, ai: S.ai || null,
    items: S.items.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, x: +i.x.toFixed(3), z: +i.z.toFixed(3), rot: i.rot, wall: i.wall, purpose: i.purpose || '' })) };
}
function startDesign(doc) {
  S.designId = doc.id; S.templateId = doc.templateId; S.title = doc.title || 'My kitchen'; S.room = JSON.parse(JSON.stringify(doc.room));
  S.room.style = Object.assign({}, DEFAULT_STYLE, S.room.style || {}); S.room.fin = S.room.fin || 0;
  S.ai = doc.ai || null; S.aiUndo = [];
  S.mode = 'design'; S.edit = null; S.view = 'dollhouse'; S.sel = null; S.tab = 'ai'; S.cat = null; S.query = ''; S.menu = null; S.stripOpen = false; S.rotating = false; S.actions = 0;
  GL.itemGroup.children.slice().forEach(c => { GL.itemGroup.remove(c); disposeTree(c); }); S.items = [];
  for (const d of doc.items || []) { const p = P(d.pid); if (!p) continue; const it = { uid: uid(), pid: d.pid, v: d.v || 0, cfg: Object.assign(defCfg(p), d.cfg || {}), x: d.x, z: d.z, rot: d.rot || 0, wall: d.wall ?? null, purpose: d.purpose || '' }; S.items.push(it); attachItem(it); }
  $('#design-title').value = S.title; toggleStrip(false); closePopovers();
  buildRoom(); fitCamera(); updateCamera(); renderBottomBar(); renderPanel(); refreshTotals(); refreshWarnings(); renderItemFloat(); updateBagCount(); markDirty();
}
function openTemplate(tid, did) {
  if (tid !== 'custom') return false;
  startDesign({ id: did || uid(), templateId: 'custom', title: 'My kitchen', room: emptyRoom(), items: [] }); return true;
}

/* ── hub ── */
function planSVG(R, items) {
  const W = R.x1 - R.x0, D = R.z1 - R.z0, k = 40, pad = 14, fl = FLOOR(R.floor), id = 'g' + Math.random().toString(36).slice(2, 7);
  let s = `<svg viewBox="0 0 ${W * k + pad * 2} ${D * k + pad * 2}" aria-hidden="true"><defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f7f4ee"/><path d="M0 0h12M0 0v12" stroke="rgba(20,20,18,.07)"/></pattern></defs>`;
  s += `<rect x="${pad}" y="${pad}" width="${W * k}" height="${D * k}" fill="url(#${id})"/>`;
  const rect = (it, d, fill, stroke, dash) => { const e = extOf(d, it.rot); return `<rect x="${(pad + (it.x - e.hw - R.x0) * k).toFixed(1)}" y="${(pad + (it.z - e.hd - R.z0) * k).toFixed(1)}" width="${(e.hw * 2 * k).toFixed(1)}" height="${(e.hd * 2 * k).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"${dash ? ' stroke-dasharray="3 2"' : ''}/>`; };
  for (const it of items || []) {
    const p = P(it.pid); if (!p || p.mount !== 'floor') continue; const d = dimsOf(p, it.cfg, R);
    if (p.role === 'stool') { s += `<circle cx="${pad + (it.x - R.x0) * k}" cy="${pad + (it.z - R.z0) * k}" r="${d.w * k / 2}" fill="#f2eee7" stroke="#141412" stroke-width=".8"/>`; continue; }
    s += rect(it, d, p.essential === 'sink' ? '#d9dde0' : p.essential === 'stove' ? '#141412' : p.role === 'fridge' || p.role === 'tall' ? '#cfc7b8' : '#ebe5da', '#141412');
  }
  for (const it of items || []) { const p = P(it.pid); if (p && p.essential === 'chimney') s += rect(it, dimsOf(p, it.cfg, R), 'none', '#a8834f', true); }
  s += `<rect x="${pad}" y="${pad}" width="${W * k}" height="${D * k}" fill="none" stroke="#141412" stroke-width="4"/>`;
  for (const f of R.feats) {
    const wk = f.w * k, o = { N: [pad + (f.u - f.w / 2) * k, pad], S: [pad + (f.u - f.w / 2) * k, pad + D * k], W: [pad, pad + (f.u - f.w / 2) * k], E: [pad + W * k, pad + (f.u - f.w / 2) * k] }[f.wall];
    const tr = { N: `translate(${o[0]} ${o[1]})`, S: `translate(${o[0]} ${o[1]}) scale(1 -1)`, W: `translate(${o[0]} ${o[1]}) matrix(0 1 1 0 0 0)`, E: `translate(${o[0]} ${o[1]}) matrix(0 1 -1 0 0 0)` }[f.wall];
    s += `<g transform="${tr}"><line x1="0" y1="0" x2="${wk}" y2="0" stroke="#f7f4ee" stroke-width="6"/>`;
    if (f.kind === 'door') { const n = STYLE[f.style].leaves >= 2 ? 2 : 1, lw = wk / n; for (let i = 0; i < n; i++) { const x0 = i * lw; s += i % 2 ? `<path d="M${x0 + lw} 0v${lw}M${x0} 0A${lw} ${lw} 0 0 0 ${x0 + lw} ${lw}" fill="none" stroke="#141412" stroke-width=".8"/>` : `<path d="M${x0} 0v${lw}M${x0 + lw} 0A${lw} ${lw} 0 0 1 ${x0} ${lw}" fill="none" stroke="#141412" stroke-width=".8"/>`; } }
    else s += `<line x1="0" y1="-2" x2="${wk}" y2="-2" stroke="#a8834f" stroke-width="1.4"/><line x1="0" y1="2" x2="${wk}" y2="2" stroke="#a8834f" stroke-width="1.4"/>`;
    s += '</g>';
  }
  return s + '</svg>';
}
function roomCard(name, R, tid, opts = {}) {
  return h('button', { class: 'rcard', onclick: () => opts.onclick ? opts.onclick() : go(tid) }, h('div', { class: 'thumb', html: planSVG(R, opts.items) }),
    h('div', { class: 'meta' }, h('small', null, opts.small || `${sqft(R)} sq.ft`), h('strong', null, name), opts.blurb ? h('span', { class: 'muted', style: 'font-size:13px' }, opts.blurb) : null, h('span', { class: 'go' }, opts.cta || 'Design this kitchen', h('span', { html: ico('arrow', 18) }))));
}
const savedDocs = () => Object.values(docs()).filter(d => d && d.room && d.kitchen).sort((a, b) => b.updated - a.updated);
function updateHubFoot() { const b = $('#open-saved'), n = savedDocs().length; if (!b) return; b.hidden = !n; $('#saved-count').textContent = n; }
function updateClaudePill() { const p = $('#hdr-ai'); if (!p) return; const on = aiReady(); p.classList.toggle('on', on); p.title = on ? `Claude · ${AI_MODE_NAME[aiMode()]}` : 'Connect Claude for new designs'; }
function renderHub() { renderBrief(); renderResults(); updateHubFoot(); updateClaudePill(); hydrateIcons($('#hub')); }
const fmtHub = R => `${(R.x1 - R.x0).toFixed(1)} × ${(R.z1 - R.z0).toFixed(1)} m`;
/* hero: an axonometric drawing of a kitchen being "printed" module by module — each one rises from its footprint
   under a brass print line, then gets its part code. Loops; static (fully printed) when motion is reduced. */
const HERO = { raf: 0, t0: 0 };
const HERO_MODS = [ // x, z, w, d, h, y0, kind, code   (metres; back run along x at z=0, return run along z at x=0)
  [0, 0, .6, .6, 2.1, 0, 'tall', 'TALL60'], [.6, 0, .6, .6, .86, 0, 'drawers', 'B60·3DR'], [1.2, 0, .75, .6, .86, 0, 'hob', 'HOB75·5'],
  [1.95, 0, .45, .6, .86, 0, 'door', 'B45·1D'], [2.4, 0, .9, .6, .86, 0, 'sink', 'SINK90'], [3.3, 0, .6, .6, .86, 0, 'drawers', 'B60·2DR'],
  [0, .6, .6, .6, .86, 0, 'door', 'B60·2D'], [0, 1.2, .6, .7, 1.75, 0, 'fridge', 'FRIDGE·2D'],
  [1.27, 0, .6, .42, .5, 1.62, 'chimney', 'CHIM60'], [1.95, 0, .45, .35, .7, 1.45, 'wall', 'W45'], [3.3, 0, .6, .35, .7, 1.45, 'wall', 'W60'], [.6, 0, .6, .35, .7, 1.45, 'wall', 'W60']
];
function drawHero() {
  const cv = $('#hero-canvas'); if (!cv) return;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  cancelAnimationFrame(HERO.raf); HERO.t0 = performance.now();
  const frame = now => {
    if (!cv.isConnected || $('#hub').hidden) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), cw = cv.clientWidth || 640, ch = cv.clientHeight || 420;
    if (cv.width !== Math.round(cw * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch);
    const css = getComputedStyle(document.documentElement), INK = css.getPropertyValue('--ink').trim() || '#141412', BRASS = css.getPropertyValue('--brass').trim() || '#a8834f';
    const k = Math.min(cw / 6.3, ch / 6.6), ox = cw / 2 - .69 * k, oy = ch / 2 - .2 * k; // fits the 4.2 × 2.6 × 2.45 m drawing plus its labels
    const iso = (x, y, z) => [ox + (x - z) * k * .866, oy + (x + z) * k * .5 - y * k];
    const path = (pts, fill, stroke = INK, lw = .8) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...iso(...p)) : g.moveTo(...iso(...p))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
    const seg = (a, b, stroke = INK, lw = .6) => { g.beginPath(); g.moveTo(...iso(...a)); g.lineTo(...iso(...b)); g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); };
    // blueprint floor grid (10 cm module, 60 cm major)
    g.globalAlpha = .55; for (let i = 0; i <= 42; i++) { const x = i * .1; seg([x, 0, 0], [x, 0, 2.6], INK, i % 6 ? .15 : .4); } for (let i = 0; i <= 26; i++) { const z = i * .1; seg([0, 0, z], [4.2, 0, z], INK, i % 6 ? .15 : .4); } g.globalAlpha = 1;
    // back and side walls as hairline elevations
    path([[0, 0, 0], [4.2, 0, 0], [4.2, 2.45, 0], [0, 2.45, 0]], 'rgba(255,255,255,.35)', INK, .5); path([[0, 0, 0], [0, 0, 2.6], [0, 2.45, 2.6], [0, 2.45, 0]], 'rgba(255,255,255,.2)', INK, .5);
    const el = (now - HERO.t0) / 1000, t = reduce ? 1e9 : HERO.loop ? el % 11 : Math.min(el, 9), step = .55; // prints once and rests; loops only while Claude works
    const floorRank = HERO_MODS.map((m, i) => [m, i]).filter(([m]) => !m[5]).sort((a, b) => iso(a[0][0] + a[0][2] / 2, 0, a[0][1] + a[0][3] / 2)[0] - iso(b[0][0] + b[0][2] / 2, 0, b[0][1] + b[0][3] / 2)[0]).map(([, i]) => i);
    const order = HERO_MODS.map((m, i) => [m, i]).sort((a, b) => (a[0][0] + a[0][1]) - (b[0][0] + b[0][1]) || a[0][5] - b[0][5]);
    for (const [[x, z, w, d, hgt, y0, kind, code], i] of order) {
      const p = clamp((t - .4 - i * step) / .7, 0, 1), e = 1 - Math.pow(1 - p, 3); if (p <= 0) { if (!y0) path([[x, 0, z], [x + w, 0, z], [x + w, 0, z + d], [x, 0, z + d]], null, BRASS, .6); continue; }
      const H = hgt * e, y1 = y0 + H, front = { tall: '#e9e4da', drawers: '#e9e4da', door: '#e9e4da', hob: '#e9e4da', sink: '#e9e4da', fridge: '#d9dcdc', chimney: '#cfd2d4', wall: '#ece8e0' }[kind];
      path([[x, y1, z + d], [x + w, y1, z + d], [x + w, y0, z + d], [x, y0, z + d]], front);            // front
      path([[x + w, y1, z], [x + w, y1, z + d], [x + w, y0, z + d], [x + w, y0, z]], '#cdc6b9');         // side
      path([[x, y1, z], [x + w, y1, z], [x + w, y1, z + d], [x, y1, z + d]], kind === 'hob' ? '#1d1d1c' : '#f6f3ee'); // top
      if (p >= 1) { // details once printed
        if (kind === 'drawers') for (const f of [.33, .62]) seg([x + .02, y0 + hgt * f, z + d], [x + w - .02, y0 + hgt * f, z + d], INK, .5);
        if (kind === 'door' || kind === 'tall' || kind === 'fridge' || kind === 'wall') seg([x + w / 2, y0 + .04, z + d], [x + w / 2, y0 + hgt - .04, z + d], INK, .5);
        if (kind === 'sink') path([[x + .1, y1, z + .1], [x + w - .1, y1, z + .1], [x + w - .1, y1, z + d - .12], [x + .1, y1, z + d - .12]], '#c9ccce', INK, .5);
        if (kind === 'hob') for (const [bx, bz] of [[.2, .18], [.55, .18], [.2, .42], [.55, .42], [.375, .3]]) { const [cx, cy] = iso(x + bx, y1, z + bz); g.beginPath(); g.ellipse(cx, cy, k * .07, k * .04, 0, 0, Math.PI * 2); g.strokeStyle = '#8b8b88'; g.lineWidth = .8; g.stroke(); }
        // part code with a leader line
        if (y0) continue; // label floor modules only (wall units sit above them)
        const top = iso(x + w / 2, y0 + hgt, z + d / 2), lx = top[0], rank = floorRank.indexOf(i), ly = iso(0, 2.75, 0)[1] - 18 + (rank % 3) * 13;
        g.globalAlpha = clamp((t - .4 - i * step - .7) / .4, 0, 1);
        g.strokeStyle = INK; g.lineWidth = .5; g.beginPath(); g.moveTo(lx, top[1] - 2); g.lineTo(lx, ly + 4); g.stroke();
        g.fillStyle = INK; g.font = '500 9px "JetBrains Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.fillText(code, lx, ly);
        g.globalAlpha = 1;
      } else { // the print line
        seg([x - .03, y1, z + d], [x + w + .03, y1, z + d], BRASS, 1.6); seg([x + w, y1, z - .03], [x + w, y1, z + d + .03], BRASS, 1.6);
      }
    }
    if (!reduce && (HERO.loop || el < 9.2)) HERO.raf = requestAnimationFrame(frame);
  };
  HERO.raf = requestAnimationFrame(frame);
}
/* hub · the System: every module, its part code (the KDL token) and its sizes — the kitchen as a kit of parts */
const SYSTEM_MODS = [['base-cab', 'B', 'b30–b120 · .1d .2d .2dr .3dr .4dr .open .blind'], ['sink-unit', 'SINK', 'sink60–sink120 · .single .double .drainer'], ['hob-unit', 'HOB', 'hob60–hob90 · .2–.5 burners · .oven'],
  ['tall', 'TALL', 'tall45 tall60 · .pantry .oven .broom'], ['fridge', 'FRIDGE', 'fridge · .single .double .sxs'], ['dishwasher', 'DW', 'dw45 dw60'], ['chimney', 'CHIM', 'placed by the system over every hob'], ['wall-cab', 'W', 'placed by the system over base runs'],
  ['loft', 'LOFT', 'ADD loft · above tall units'], ['microwave', 'MW', 'ADD microwave · finds free worktop'], ['ro', 'RO', 'ADD ro · hung beside the sink'], ['stool', 'STOOL', 'ADD stools3 · behind the island']];
function renderSystem() {
  const grid = $('#system-grid'); if (!grid || grid.childElementCount) return;
  if (!TH.r && !TH.failed) thumbInit();
  SYSTEM_MODS.forEach(([pid, code, syn], i) => { const p = P(pid); if (!p) return; const d = dimsOf(p, defCfg(p));
    grid.append(h('div', { class: 'mod' }, h('span', { class: 'mod-no' }, String(i + 1).padStart(2, '0')), h('div', { class: 'mod-pic' }, thumbImg(pid, 0, '', defCfg(p))),
      h('b', { class: 'mod-code' }, code), h('span', { class: 'mod-name' }, p.name.toLowerCase()), h('span', { class: 'mod-dim' }, `${Math.round(d.w * 100)} × ${Math.round(d.d * 100)} × ${Math.round(d.h * 100)}`), h('span', { class: 'mod-syn' }, syn))); });
  const g = (window.INTERIO_GALLERY || [])[1], spec = $('#kdl-spec');
  if (g && spec) { try { const doc = kdlToDoc(g.kdl, {}); spec.innerHTML = ''; const n = g.kdl.trim().split('\n').length, word = ['', '', '', '', '', '', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen'][n] || n; const hd = $('.kdl-caption h3'); if (hd) hd.textContent = `${word} lines make a kitchen`; spec.append(h('pre', { class: 'kdl-code' }, g.kdl.split('\n').map((l, i) => h('span', null, h('i', null, String(i + 1).padStart(2, '0')), l))), h('div', { class: 'kdl-plan', html: planSVG(doc.room, doc.items) })); } catch (e) { /* ignore */ } }
}

/* ═══════════════ 13 · AI designer — Claude generates rooms, layouts and whole kitchen designs ═══════════════
   Only the catalogue (products, options, finishes, prices) and the physics of placement are deterministic.
   Claude returns a design spec (JSON, schema-constrained); realizeDesign() turns it into a room + placed units,
   nudging small overlaps and reporting anything it couldn't place. Users then edit by hand or ask Claude for changes. */
/* Models newer than Claude Opus 4.7 / Claude Sonnet 5 are listed but disabled: they need a newer Claude Code than this
   setup can run (Opus 5.5 needs Claude Code 2.1.280+). Flip `enabled` when that changes. */
const AI_MODELS = [
  ['claude-opus-4-7', 'Claude Opus 4.7 — best available here', true], ['claude-sonnet-5', 'Claude Sonnet 5 — faster', true], ['default', "Claude Code's default model (bridge only)", true],
  ['claude-fable-5-1', 'Claude Fable 5.1', false], ['claude-opus-5-5', 'Claude Opus 5.5', false], ['claude-opus-5', 'Claude Opus 5', false], ['claude-opus-4-8', 'Claude Opus 4.8', false], ['claude-sonnet-5-5', 'Claude Sonnet 5.5', false], ['claude-haiku-5-5', 'Claude Haiku 5.5', false]
];
const modelOK = id => AI_MODELS.some(([m, , on]) => m === id && on);
const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5']; // models that accept fallbacks: "default"
const AI_EFFORTS = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['xhigh', 'Extra high']];
const AI = { cfg: Object.assign({ mode: '', key: '', proxy: '', model: 'claude-opus-4-7', effort: 'medium' }, store.get('ai', {})), ctrl: null, busy: false, sys: null, schemas: null };
if (!modelOK(AI.cfg.model)) AI.cfg.model = 'claude-opus-4-7'; // a saved model that is no longer selectable
/* three ways to reach Claude: 'api' (your API key), 'bridge' (local Claude Code bridge or a key-holding proxy), 'manual' (copy & paste with any Claude chat) */
const aiMode = () => AI.cfg.mode || (AI.cfg.proxy ? 'bridge' : AI.cfg.key ? 'api' : '');
const aiReady = () => aiMode() === 'manual' || (aiMode() === 'bridge' && !!AI.cfg.proxy) || (aiMode() === 'api' && !!AI.cfg.key);
const AI_MODE_NAME = { api: 'API key', bridge: 'Claude Code bridge', manual: 'Copy & paste with Claude' };
function aiClient() {
  const A = window.Anthropic; if (!A) throw new Error('The Claude SDK did not load (vendor/anthropic-sdk.min.js).');
  return aiMode() === 'bridge' ? new A({ apiKey: 'not-used-by-bridge', baseURL: AI.cfg.proxy.replace(/\/+$/, ''), dangerouslyAllowBrowser: true, maxRetries: 0, timeout: 20 * 60 * 1000 })
    : new A({ apiKey: AI.cfg.key, dangerouslyAllowBrowser: true });
}
function aiErrorText(e) {
  const A = window.Anthropic || {};
  if (e && (e.name === 'AbortError' || (A.APIUserAbortError && e instanceof A.APIUserAbortError))) return 'Cancelled.';
  if (A.AuthenticationError && e instanceof A.AuthenticationError) return 'Claude rejected the API key — check it in AI settings.';
  if (A.PermissionDeniedError && e instanceof A.PermissionDeniedError) return "This key doesn't have access to that model — pick another in AI settings.";
  if (A.NotFoundError && e instanceof A.NotFoundError) return 'Model not found — pick another model in AI settings.';
  if (aiMode() === 'bridge' && A.APIError && e instanceof A.APIError && e.message) return e.message.replace(/^\d{3}\s+/, '').replace(/^\{.*"message":"([^"]+)".*$/, '$1');
  if (A.RateLimitError && e instanceof A.RateLimitError) return 'Rate limited by the Claude API — wait a moment and try again.';
  if (A.BadRequestError && e instanceof A.BadRequestError) return 'Claude rejected the request: ' + e.message;
  if (A.APIConnectionError && e instanceof A.APIConnectionError) return "Couldn't reach Claude — check your internet connection or proxy URL.";
  if (A.APIError && e instanceof A.APIError) return `Claude API error ${e.status ?? ''}: ${e.message}`;
  return (e && e.message) || String(e);
}

/* ── what Claude knows: the deterministic catalogue + conventions (stable → prompt-cached) ── */

/* ── the call: streamed, schema-constrained, cached system prompt, refusal fallback ── */

/* ── manual mode: the user carries the exact prompt to a Claude chat and pastes the JSON back ── */

/* ── spec → room + placed units (the deterministic "physics" step) ── */
function realizeDesign(dz, post) {
  const issues = [], room0 = dz.room || {}, st = dz.style || {};
  const W = clamp((room0.width_cm || 300) / 100, 1.8, 12), D = clamp((room0.depth_cm || 270) / 100, 1.5, 12), Hc = clamp((room0.ceiling_cm || 275) / 100, 2.3, 3.8);
  const fin = clamp(Math.round(st.cabinet_finish || 0), 0, FINISHES.length - 1);
  const R = { x0: -W / 2, x1: W / 2, z0: -D / 2, z1: D / 2, h: Hc, wall: WALL_COLORS.includes(room0.wall_paint) ? room0.wall_paint : DEFAULT_WALL, floor: FLOORS.some(f => f.id === room0.floor) ? room0.floor : 'f0', feats: [], fin,
    style: { counter: COUNTERS.some(c => c.id === st.countertop) ? st.countertop : DEFAULT_STYLE.counter, handle: HANDLES.some(x => x[0] === st.handles) ? st.handles : DEFAULT_STYLE.handle, tile: TILES.some(t => t.id === st.wall_tile) ? st.wall_tile : DEFAULT_STYLE.tile, tileCover: TILE_COVER.some(t => t[0] === st.tile_coverage) ? st.tile_coverage : DEFAULT_STYLE.tileCover } };
  const len = w => (w === 'N' || w === 'S') ? W : D;
  for (const o of room0.openings || []) {
    const s = STYLE[o.type]; if (!s || !WALLS.includes(o.wall)) continue;
    const f = feat(o.wall, o.type, 0); if (o.width_cm) f.w = clamp(o.width_cm / 100, .5, Math.min(3, len(o.wall) - .2));
    f.u = clamp((o.center_cm || 0) / 100, f.w / 2 + .05, len(o.wall) - f.w / 2 - .05);
    if (R.feats.some(g => g.wall === f.wall && Math.abs(g.u - f.u) < (g.w + f.w) / 2 + .05)) { issues.push(`Dropped a ${s.kind} on the ${WALL_NAME[o.wall].toLowerCase()} that overlapped another opening.`); continue; }
    R.feats.push(f);
  }
  const save = [S.room, S.items]; S.room = R; S.items = [];
  try {
    const list = (dz.items || []).map((it, i) => ({ it, i, p: P(it.product) })), order = x => !x.p ? 3 : x.p.mount === 'counter' ? 2 : x.p.mount === 'wall' ? 1 : 0;
    list.sort((a, b) => order(a) - order(b) || a.i - b.i);
    for (const { it, p } of list) {
      if (!p) { issues.push(`Skipped an unknown product "${it.product}".`); continue; }
      const nm = p.name.toLowerCase(), cfg = defCfg(p);
      for (const o of p.opts) { const v = it.options ? it.options[o.key] : null; if (v == null) continue; if (o.values.some(x => x[0] === v)) cfg[o.key] = v; else issues.push(`The ${nm}'s ${o.label.toLowerCase()} "${v}" isn't available — used ${optLabel(p, o.key, cfg[o.key])}.`); }
      const v = Number.isInteger(it.finish) && it.finish >= 0 && it.finish < p.variants.length ? it.finish : (p.variants[0].fin ? fin : 0);
      const tmp = { uid: uid(), pid: p.id, v, cfg, x: 0, z: 0, rot: 0, wall: null, purpose: it.purpose || '' }, pl = it.placement || {}, d = dimsOf(p, cfg);
      let sh = null, planned = null;
      if ((pl.mode === 'wall' || pl.mode === 'counter') && WALLS.includes(pl.wall)) {
        const base = alongAxis(pl.wall) === 'x' ? R.x0 : R.z0, start = (pl.start_cm || 0) / 100;
        if (start + d.w > len(pl.wall) + .02) issues.push(`The ${nm} ran past the end of the ${WALL_NAME[pl.wall].toLowerCase()} and was pulled back.`);
        sh = wallPlace(tmp, pl.wall, base + start + d.w / 2); planned = sh;
      } else if (pl.mode === 'free' && pl.x_cm != null && pl.z_cm != null) {
        const rot = Math.round((pl.rotation_deg || 0) / 90) * 90, q = clampXZ(tmp, R.x0 + pl.x_cm / 100, R.z0 + pl.z_cm / 100, rot);
        sh = shapeOf(tmp, q.x, q.z, ((rot + 540) % 360) - 180); planned = sh;
      } else sh = findSlot(tmp);
      if (sh && (collides(sh, tmp) || featureHit(sh, true))) {
        const why = collides(sh, tmp) ? `overlapped the ${P(hitBy(sh, tmp).pid).name.toLowerCase()}` : 'blocked a door or window';
        let fixed = null;
        if (wallOf(sh)) { const w = wallOf(sh), ax = alongAxis(w), a0 = ax === 'x' ? sh.x : sh.z; for (let k = 1; k <= 30 && !fixed; k++) for (const sg of [1, -1]) { const s2 = wallPlace(tmp, w, a0 + sg * k * .05); if (!collides(s2, tmp) && !featureHit(s2, true)) { fixed = s2; break; } } }
        else for (let r = .05; r <= 1 && !fixed; r += .05) for (let a = 0; a < 16; a++) { const q = clampXZ(tmp, sh.x + Math.cos(a / 16 * 6.283) * r, sh.z + Math.sin(a / 16 * 6.283) * r, sh.rot), s2 = shapeOf(tmp, q.x, q.z, sh.rot); if (!collides(s2, tmp) && !featureHit(s2, true)) { fixed = s2; break; } }
        if (fixed) issues.push(`The ${nm} ${why}, so it was moved ${Math.round(Math.hypot(fixed.x - sh.x, fixed.z - sh.z) * 100)} cm.`);
        else issues.push(`The ${nm} ${why} and there was no room nearby, so it was left out.`);
        sh = fixed;
      }
      if (!sh) continue;
      void planned; applyShape(tmp, sh);
      if (p.mount === 'counter' && shapeOf(tmp).y0 < .01) issues.push(`The ${nm} isn't on a worktop.`);
      S.items.push(tmp);
    }
    if (post) post();
    return { room: R, items: S.items.map(i => ({ pid: i.pid, v: i.v, cfg: i.cfg, x: i.x, z: i.z, rot: i.rot, wall: i.wall, purpose: i.purpose })), issues };
  } finally { S.room = save[0]; S.items = save[1]; }
}
/* current state → the same spec format (so Claude sees the user's manual edits) */
function docFromDesign(dz, real, extra = {}) {
  return Object.assign({ id: uid(), templateId: 'ai', title: dz.name || 'AI kitchen', room: real.room, items: real.items, kitchen: 1, updated: Date.now(),
    ai: { concept: dz.concept || '', highlights: dz.highlights || [], notes: dz.notes || [], layout_type: dz.layout_type || 'other', issues: real.issues } }, extra);
}
const docPrice = doc => doc.items.reduce((s, i) => { const p = P(i.pid); return p ? s + p.price(i.cfg, p.variants[i.v] || p.variants[0]) : s; }, 0);

/* ── progress UI shared by the hub and the planner ── */
function aiProgress() {
  const stat = h('span', { class: 'ai-stat' }), stop = h('button', { class: 'icon-btn sm', 'aria-label': 'Stop', title: 'Stop', html: ico('close', 16), onclick: () => aiCancelAll() });
  const el = h('div', { class: 'ai-progress', role: 'status' }, h('span', { class: 'ai-spin', 'aria-hidden': 'true' }), stat, stop), t0 = Date.now();
  const tick = () => { stat.textContent = aiMode() === 'manual' ? 'Waiting for the reply' : `Designing · ${Math.round((Date.now() - t0) / 1000)} s`; if (el.isConnected || Date.now() - t0 < 1500) setTimeout(tick, 500); };
  tick(); if (aiMode() === 'manual') stop.hidden = true;
  return { el, update() {} };
}

/* ── settings ── */
function showAISettings(onSaved) {
  const c = Object.assign({}, AI.cfg, { mode: aiMode() || 'bridge' }), msg = h('p', { class: 'ai-msg', role: 'status' });
  const key = h('input', { type: 'password', class: 'field', value: c.key, placeholder: 'sk-ant-…', autocomplete: 'off', 'aria-label': 'Anthropic API key' });
  const proxy = h('input', { type: 'url', class: 'field', value: c.proxy || 'http://127.0.0.1:8787', 'aria-label': 'Bridge or proxy URL' });
  const model = h('select', { class: 'field', 'aria-label': 'Model' }, h('optgroup', { label: 'Available' }, AI_MODELS.filter(m => m[2]).map(([id, n]) => h('option', { value: id, selected: id === c.model }, n))),
    h('optgroup', { label: 'Needs a newer Claude Code' }, AI_MODELS.filter(m => !m[2]).map(([id, n]) => h('option', { value: id, disabled: true, title: 'Not available with your Claude Code version' }, n + ' — unavailable'))));
  const effort = h('select', { class: 'field', 'aria-label': 'Effort' }, AI_EFFORTS.map(([id, n]) => h('option', { value: id, selected: id === c.effort }, n)));
  const read = () => ({ mode: c.mode, key: key.value.trim(), proxy: proxy.value.trim(), model: model.value, effort: effort.value });
  const panes = {
    bridge: h('div', null, h('p', null, 'Use your Claude subscription through ', h('b', null, 'Claude Code'), ' on this computer — no API key. Start the bridge in a terminal, from the repo folder:'),
      h('pre', { class: 'cmd' }, 'node bridge/claude-code-bridge.mjs'),
      h('p', { class: 'hint' }, `If you open the planner from a website (not a local file), add its address: --origin ${location.origin === 'null' ? 'https://you.github.io' : location.origin}. The same field also takes the URL of the Cloudflare proxy in proxy/.`),
      h('label', { class: 'lab' }, 'Bridge or proxy URL', proxy)),
    api: h('div', null, h('p', null, 'Call the Claude API directly with your Anthropic API key.'), h('label', { class: 'lab' }, 'Anthropic API key', key),
      h('p', { class: 'hint' }, 'Stored only in this browser and sent straight to api.anthropic.com.')),
    manual: h('div', null, h('p', null, 'No setup: the planner shows the exact prompt, you send it to Claude in ', h('b', null, 'claude.ai'), ' (or Claude Code) and paste the JSON reply back. Slower, but works with any Claude plan.'))
  };
  const seg = h('div', { class: 'seg3', role: 'tablist' });
  const draw = () => { seg.innerHTML = ''; ['bridge', 'api', 'manual'].forEach(m => seg.append(h('button', { class: c.mode === m ? 'on' : '', role: 'tab', 'aria-selected': c.mode === m, onclick: () => { c.mode = m; draw(); } }, AI_MODE_NAME[m]))); Object.entries(panes).forEach(([m, el]) => el.hidden = m !== c.mode); test.hidden = c.mode === 'manual'; msg.textContent = ''; };
  const test = h('button', { class: 'pill-btn', onclick: async () => { const old = AI.cfg; AI.cfg = Object.assign({}, old, read()); msg.textContent = 'Testing…'; msg.className = 'ai-msg'; try { const m = await aiClient().models.retrieve(AI.cfg.model === 'default' ? 'default' : AI.cfg.model); msg.textContent = `Connected — ${m.display_name || m.id}.`; msg.className = 'ai-msg ok'; } catch (e) { msg.textContent = aiErrorText(e) + (c.mode === 'bridge' ? ' Is the bridge running?' : ''); msg.className = 'ai-msg bad'; } AI.cfg = old; } }, 'Test connection');
  let close;
  close = modal(h('div', null, h('h3', null, 'Connect the AI designer'), seg, panes.bridge, panes.api, panes.manual,
    h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px' }, h('label', { class: 'lab' }, 'Model', model), h('label', { class: 'lab' }, 'Thinking effort', effort)),
    msg, h('div', { class: 'actions' }, test,
      h('button', { class: 'pill-btn primary', onclick: () => { AI.cfg = Object.assign(AI.cfg, read()); store.set('ai', AI.cfg); close(); toast(aiReady() ? `AI designer: ${AI_MODE_NAME[aiMode()]}.` : 'AI settings saved.'); if (onSaved) onSaved(); } }, 'Save'))));
  draw();
}

/* ── hub: brief → generated proposals ── */
/* ── hub: one screen — a brief where every field is optional, one button, and the designs ── */
const BRIEF_DEFAULT = { widthFt: '', depthFt: '', ceilingFt: '', layout: 'any', people: '', cooking: '', budget: '', must: [], mood: '', openings: '', extra: '', count: 3 };
const MUSTS = [['pantry', 'Tall pantry'], ['oven', 'Built-in oven'], ['dishwasher', 'Dishwasher'], ['loft', 'Loft storage'], ['ro', 'RO purifier'], ['microwave', 'Microwave'], ['seating', 'Breakfast seating'], ['bigfridge', 'Double-door fridge']];
const MOODS = [['Warm wood & white quartz', '#9a6a3c', '#f3efe6'], ['All-white minimal', '#f7f6f2', '#d6d2ca'], ['Sage green & brass', '#7d9378', '#b08d57'], ['Navy & marble', '#25334b', '#e9e6e0'], ['Dark & dramatic', '#1d1d1f', '#5a5a5c'], ['Colourful Moroccan', '#c4552f', '#2f6f73']];
const LAYOUTS = [['straight', 'Straight', 'M5 5h22v6H5z'], ['L-shaped', 'L', 'M5 5h22v6H11v16H5z'], ['U-shaped', 'U', 'M5 5h22v22h-6V11H11v16H5z'], ['parallel', 'Galley', 'M5 5h22v6H5zM5 21h22v6H5z'], ['island', 'Island', 'M5 5h22v6H5zM10 18h12v6H10z']];
const glyph = d => `<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="4" fill="none" stroke="currentColor" stroke-opacity=".28"/><path d="${d}" fill="currentColor"/></svg>`;
const briefUsed = b => Object.keys(BRIEF_DEFAULT).some(k => k !== 'count' && (Array.isArray(b[k]) ? b[k].length : String(b[k] ?? '') !== String(BRIEF_DEFAULT[k])));
function renderBrief() {
  const root = $('#ai-brief'); if (!root) return;
  const b = Object.assign({}, BRIEF_DEFAULT, store.get('brief', {})); if (!Array.isArray(b.must)) b.must = [];
  const clear = h('button', { type: 'button', class: 'aux', onclick: () => { store.set('brief', {}); renderBrief(); } }, 'Clear');
  const save = () => { store.set('brief', b); clear.hidden = !briefUsed(b); };
  const row = (label, ...kids) => h('div', { class: 'f-row' }, h('span', { class: 'f-lab' }, label), h('div', { class: 'f-ctl' }, ...kids));
  const num = (k, ph, aria) => h('input', { class: 'f-num', value: b[k] ?? '', placeholder: ph, inputmode: 'decimal', autocomplete: 'off', 'aria-label': aria, oninput: e => { b[k] = e.target.value.replace(/[^\d.]/g, ''); save(); } });
  const seg = (k, opts, aria, cls = '') => {
    const g = h('div', { class: 'seg ' + cls, role: 'radiogroup', 'aria-label': aria });
    const sync = () => [...g.children].forEach((x, i) => { const on = b[k] === opts[i][0]; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    opts.forEach(([v, label, d]) => g.append(h('button', { type: 'button', role: 'radio', class: 'seg-opt', title: label, onclick: () => { b[k] = b[k] === v ? BRIEF_DEFAULT[k] : v; save(); sync(); } }, d ? h('span', { class: 'glyph', html: glyph(d) }) : null, h('span', null, label))));
    sync(); return g;
  };
  const ppl = h('output', { class: 'step-val' }, b.people || '–');
  const step = d => h('button', { type: 'button', class: 'step-btn', 'aria-label': d > 0 ? 'More people' : 'Fewer people', html: ico(d > 0 ? 'plus' : 'minus', 16), onclick: () => { const n = (+b.people || (d > 0 ? 0 : 1)) + d; b.people = n < 1 ? '' : String(Math.min(12, n)); ppl.textContent = b.people || '–'; save(); } });
  const chips = h('div', { class: 'chips2' }, MUSTS.map(([id, n]) => h('button', { type: 'button', class: 'chip2' + (b.must.includes(id) ? ' on' : ''), 'aria-pressed': b.must.includes(id), onclick: e => { b.must = b.must.includes(id) ? b.must.filter(x => x !== id) : [...b.must, id]; save(); e.currentTarget.classList.toggle('on'); e.currentTarget.setAttribute('aria-pressed', b.must.includes(id)); } }, n)));
  const moodName = h('span', { class: 'f-hint' }, b.mood);
  const sws = h('div', { class: 'sws' }, MOODS.map(([n, c1, c2]) => h('button', { type: 'button', class: 'sw2' + (b.mood === n ? ' on' : ''), title: n, 'aria-label': n, 'aria-pressed': b.mood === n, style: `--c1:${c1};--c2:${c2}`, onclick: e => { b.mood = b.mood === n ? '' : n; save(); [...sws.children].forEach(x => { const on = x.title === b.mood; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); moodName.textContent = b.mood; } })));
  const notes = h('textarea', { class: 'f-notes', rows: 2, placeholder: 'Doors, windows, anything else', 'aria-label': 'Notes', oninput: e => { b.extra = e.target.value; save(); } }, b.extra || b.openings || '');
  root.innerHTML = '';
  root.append(h('div', { class: 'f-rows' },
      row('Room', h('div', { class: 'dims' }, num('widthFt', 'Width', 'Width in feet'), h('i', null, '×'), num('depthFt', 'Depth', 'Depth in feet'), h('i', null, '×'), num('ceilingFt', 'Height', 'Ceiling height in feet'), h('span', { class: 'unit' }, 'ft'))),
      row('Layout', seg('layout', LAYOUTS, 'Layout', 'glyphs')),
      row('Cooking', seg('cooking', [['light', 'Light'], ['moderate', 'Regular'], ['heavy', 'Heavy']], 'Cooking')),
      row('People', h('div', { class: 'stepper2' }, step(-1), ppl, step(1))),
      row('Budget', h('div', { class: 'dims' }, h('span', { class: 'unit' }, '₹'), num('budget', 'Any', 'Budget in lakh'), h('span', { class: 'unit' }, 'lakh'))),
      row('Must-haves', chips),
      row('Look', sws, moodName),
      row('Notes', notes)),
    h('div', { class: 'f-go' },
      h('button', { type: 'button', class: 'cta-gen', onclick: () => generateProposals(b) }, h('span', { html: ico('spark', 18) }), 'Generate AI kitchen design'),
      h('div', { class: 'f-aux' }, h('button', { type: 'button', class: 'aux', id: 'way-build', onclick: startBuild }, 'Empty room'), clear)));
  clear.hidden = !briefUsed(b);
}
function openDoc(doc) { const d = docs(), copy = JSON.parse(JSON.stringify(doc)); copy.id = uid(); copy.updated = Date.now(); d[copy.id] = copy; store.set('designs', d); location.hash = `#ai/${copy.id}`; }

/* ── planner: the AI tab (explain, ask for changes, undo) ── */

/* ═══════════════ 13b · KDL — the compact Kitchen Design Language Claude writes (≈10 lines instead of ≈2.5k tokens of JSON) ═══════════════
   Principle: the less the model has to say, the less it can vary and the faster it answers. Claude decides only what needs
   judgement — room, openings, layout, the order of floor units, style. A deterministic control layer adds the rest:
   chimney over every hob, wall cabinets over base units (never over windows), lofts, counter appliances, stools. */
const KDL_FRONT = { '1d': '1door', '2d': '2door', '2dr': '2drawer', '3dr': '3drawer', '4dr': '4drawer', open: 'open', blind: 'blind' };
const KDL_TYPES = ['straight', 'L-shaped', 'U-shaped', 'parallel', 'island', 'peninsula'];
function kdlPrice(pid, cfg) { const p = P(pid); return Math.round(p.price(Object.assign(defCfg(p), cfg || {}), p.variants[0]) / 1000) + 'k'; }
function kdlSystem() {
  if (AI.kdlSys) return AI.kdlSys;
  const ids = a => a.join(' ');
  AI.kdlSys = `You design modular kitchens for Indian homes. Answer ONLY in KDL lines (no prose, no code fences).

KDL
NAME <2-4 words>
TYPE <${KDL_TYPES.join('|')}>
IDEA <one sentence>
HI <short highlight>            (2-4 lines)
ROOM <width> <depth> <ceiling>  cm. width = west→east, depth = north→south
DOOR <N|E|S|W> <centre>         centre in cm from the wall's start
WINDOW <N|E|S|W> <centre> [double]
STYLE <finish> <countertop> <handles> <tile> <cover> <floor> [<chimney>]
RUN <N|E|S|W> <start>: <unit> <unit> ...
ISLAND <x> <z> <N|E|S|W>: <unit> ...   centre x z in cm from the NW corner; N|E|S|W = the side people cook from
ADD <microwave|otg|mixer|ro|loft|stools2|stools3>...

Walls start: N and S at the west end, W and E at the north end. A RUN lists floor units back-to-back from <start>.
Units (width cm): b<30|45|60|75|90|120>[.2d|1d|2dr|3dr|4dr|open|blind]  sink<60|75|90|120>[.drainer|single|double]
hob<60|75|90>[.2|3|4|5][.oven]  dw<60|45>  tall<60|45>.<pantry|oven|broom>  fridge.<single(60)|double(70)|sxs(91)>  gap<cm>
Base units are 60 deep. Chimney, wall cabinets and loft are added automatically above the RUNs.

Rules
- Must have one sink and one hob. Sink under a window when there is one. ≥45 cm of counter between sink and hob.
- Each RUN must fit its wall (start + sum of widths ≤ wall length). Where two RUNs meet at a corner, the second starts at 60.
- Keep 100 cm clear in front of doors; no units across a door. Fridge/tall units never under a window.
- Parallel: the two RUNs go on the two long walls facing each other, never the door wall. Aisles 100-120 cm (parallel runs, islands). Heavy cooking → hob .4/.5 and a 3dr next to it. Work triangle sink-hob-fridge 3.6-7.9 m.
- Budget in lakh (1 lakh = 100k). Approx ₹: b60 ${kdlPrice('base-cab')} sink90 ${kdlPrice('sink-unit')} hob75 ${kdlPrice('hob-unit')} chimney ${kdlPrice('chimney')} wall-cabinet60 ${kdlPrice('wall-cab')} fridge.double ${kdlPrice('fridge', { type: 'double' })} fridge.sxs ${kdlPrice('fridge', { type: 'sxs' })} tall.oven ${kdlPrice('tall', { cfg: 'oven' })} dw ${kdlPrice('dishwasher')} microwave ${kdlPrice('microwave')}.

STYLE values
finish 0-7: ${FINISHES.map((f, i) => i + ' ' + f.n).join(', ')}
countertop: ${ids(COUNTERS.map(c => c.id))}
handles: ${ids(HANDLES.map(h => h[0]))}
tile: ${ids(TILES.map(t => t.id))}
cover: ${ids(TILE_COVER.map(t => t[0]))}
floor: ${FLOORS.map(f => f.id + ' ' + f.name.split(' ')[0].toLowerCase()).join(', ')}
chimney: pyramid tshape curved filterless

Example
NAME Sage Tadka Corner
TYPE L-shaped
IDEA Sage L with the sink under the west window and the hob on the long north run.
HI 5-burner hob with chimney
HI Sink under the window
ROOM 300 270 275
DOOR S 230
WINDOW W 130
STYLE 2 quartz-white gola subway-sage splash f1 curved
RUN N 0: b90.blind b60.3dr hob75.5 b60.2d fridge.double
RUN W 60: sink90.drainer dw60 b45.1d
ADD microwave ro`;
  return AI.kdlSys;
}
function kdlBrief(b, variant) {
  const ft = v => Math.round(parseFloat(v) * 30.48), H = ft(b.ceilingFt || 9);
  const room = b.widthFt && b.depthFt ? `ROOM ${ft(b.widthFt)} ${ft(b.depthFt)} ${H} (N and S walls ${ft(b.widthFt)} cm long, W and E walls ${ft(b.depthFt)} cm)`
    : b.widthFt || b.depthFt ? `about ${ft(b.widthFt || b.depthFt)} cm on one side; choose the other; ceiling ${H}` : `your choice: a realistic urban Indian kitchen, ceiling ${H}`;
  const must = (b.must || []).map(m => (MUSTS.find(x => x[0] === m) || [m, m])[1].toLowerCase()).join(', ');
  const who = [b.people ? `${b.people} people` : '', { heavy: 'heavy Indian cooking daily', moderate: 'regular cooking', light: 'light cooking' }[b.cooking] || ''].filter(Boolean).join(', ');
  return [`Room: ${room}.`, b.openings ? `Openings: ${b.openings}.` : '', b.layout && b.layout !== 'any' ? `Layout: ${b.layout}.` : '', who ? who + '.' : '', b.budget ? `Budget ₹${b.budget} lakh.` : '',
    must ? `Must have: ${must}.` : '', b.mood ? `Look: ${b.mood}.` : '', b.extra ? `Also: ${b.extra}` : '', variant ? `Variant: ${variant}` : ''].filter(Boolean).join('\n');
}

/* parse KDL (tolerant: unknown lines are ignored and reported) */
function parseKDL(text) {
  const d = { name: '', type: 'other', idea: '', hi: [], notes: [], room: null, openings: [], style: {}, runs: [], islands: [], adds: [], warnings: [] };
  const lines = String(text || '').replace(/```[a-z]*|```/gi, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  for (const line of lines) {
    const m = line.match(/^([A-Za-z]+)\s*(.*)$/); if (!m) continue;
    const kw = m[1].toUpperCase(), rest = m[2].trim();
    if (kw === 'NAME') d.name = rest.slice(0, 60);
    else if (kw === 'TYPE') d.type = KDL_TYPES.find(t => t.toLowerCase() === rest.toLowerCase()) || 'other';
    else if (kw === 'IDEA') d.idea = rest;
    else if (kw === 'HI') { if (d.hi.length < 5) d.hi.push(rest); }
    else if (kw === 'NOTE') d.notes.push(rest);
    else if (kw === 'ROOM') { const [w, dp, c] = rest.split(/\s+/).map(num); if (w && dp) d.room = { w, d: dp, h: c || 275 }; }
    else if (kw === 'DOOR' || kw === 'WINDOW') { const [wall, c, x] = rest.split(/\s+/); if (WALLS.includes((wall || '').toUpperCase()) && num(c) != null) d.openings.push({ kind: kw.toLowerCase(), wall: wall.toUpperCase(), c: num(c), double: /double/i.test(x || '') }); }
    else if (kw === 'STYLE') { const t = rest.split(/\s+/); d.style = { finish: num(t[0]), counter: t[1], handle: t[2], tile: t[3], cover: t[4], floor: t[5], chimney: t[6] }; }
    else if (kw === 'RUN') { const mm = rest.match(/^([NESW])\s+(-?\d+(?:\.\d+)?)\s*:\s*(.+)$/i); if (mm) d.runs.push({ wall: mm[1].toUpperCase(), start: +mm[2], units: mm[3].split(/\s+/) }); else d.warnings.push('Ignored a RUN line: ' + line); }
    else if (kw === 'ISLAND') { const mm = rest.match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(?:faces?\s+)?([NESW])\s*:\s*(.+)$/i); if (mm) d.islands.push({ x: +mm[1], z: +mm[2], faces: mm[3].toUpperCase(), units: mm[4].split(/\s+/) }); else d.warnings.push('Ignored an ISLAND line: ' + line); }
    else if (kw === 'ADD') d.adds.push(...rest.toLowerCase().split(/[\s,]+/).filter(Boolean));
  }
  if (!d.room) throw new Error('The design had no ROOM line.');
  if (!d.runs.length && !d.islands.length) throw new Error('The design had no units (RUN lines).');
  return d;
}
/* one KDL unit token → { pid, cfg, gapCm } */
function kdlUnit(tok) {
  const t = tok.toLowerCase(), parts = t.split('.'), head = parts[0], opt = parts.slice(1), w = parseInt(head.replace(/^\D+/, ''), 10);
  if (head.startsWith('gap')) return { gap: w || 0 };
  if (/^b\d/.test(head)) return { pid: 'base-cab', cfg: { w, front: KDL_FRONT[opt[0]] || (w <= 45 ? '1door' : '2door') } };
  if (head.startsWith('sink')) return { pid: 'sink-unit', cfg: { w: w || 90, bowl: ['drainer', 'single', 'double'].find(x => opt.includes(x)) || 'drainer', sink: opt.includes('black') ? 'black' : 'steel' } };
  if (head.startsWith('hob')) return { pid: 'hob-unit', cfg: { w: w || 75, burners: +(opt.find(x => /^[2-5]$/.test(x)) || 4), below: opt.includes('oven') ? 'oven' : 'drawers' } };
  if (head.startsWith('dw')) return { pid: 'dishwasher', cfg: { w: w || 60 } };
  if (head.startsWith('tall')) return { pid: 'tall', cfg: { w: w || 60, cfg: ['pantry', 'oven', 'broom'].find(x => opt.includes(x)) || 'pantry' } };
  if (head.startsWith('fridge')) return { pid: 'fridge', cfg: { type: ['single', 'double', 'sxs'].find(x => opt.includes(x)) || 'double' } };
  return null;
}

/* control layer · run fitter: pack a RUN into the free stretches of its wall. Door keep-outs (same wall, and doors on the
   neighbouring wall that swing into this run's corner) are excluded. If the run is too long: drop gaps, trim flexible
   base-cabinet widths, then drop plain base cabinets / dishwasher / tall units — sink, hob and fridge stay. Finally hob,
   fridge and tall units are shuffled out from under windows (a chimney or a tall box can't go there). */
const ADJ = { N: ['E', 'W'], S: ['E', 'W'], E: ['N', 'S'], W: ['N', 'S'] }, ESSENTIAL_TOK = /^(sink|hob|fridge)/i, FLEX_W = [120, 90, 75, 60, 45, 30], DROP_ORDER = ['base-cab', 'dishwasher', 'tall'], NOT_UNDER_WINDOW = ['hob-unit', 'fridge', 'tall'];
function runKeepOut(wall, d) {
  const W = d.room.w, D = d.room.d, L = (wall === 'N' || wall === 'S') ? W : D, out = [];
  for (const o of d.openings.filter(o => o.kind === 'door')) {
    const hw = 45;
    if (o.wall === wall) { out.push([o.c - hw - 10, o.c + hw + 10]); continue; }
    const strip = { E: [W - 76, W], W: [0, 76], N: [0, 76], S: [D - 76, D] }[wall]; // deep enough for a 74 cm side-by-side fridge
    const perp = (wall === 'N' || wall === 'S') ? (o.wall === 'W' || o.wall === 'E') : (o.wall === 'N' || o.wall === 'S');
    if (!perp || o.c + hw <= strip[0] || o.c - hw >= strip[1]) continue;
    const reach = 90 + 10; // a 90 cm leaf sweeps ~90 cm into the room
    out.push((o.wall === 'N' || o.wall === 'W') ? [0, reach] : [L - reach, L]);
  }
  return out.sort((a, b) => a[0] - b[0]);
}
function packRun(units, segs) {
  const out = [], miss = []; let si = 0, cur = segs.length ? segs[0][0] : 0;
  for (const u of units) {
    if (u.gap != null) { cur += u.gap; continue; }
    while (si < segs.length && Math.max(cur, segs[si][0]) + u.w > segs[si][1] + .5) { si++; if (si < segs.length) cur = segs[si][0]; }
    if (si >= segs.length) { miss.push(u); continue; }
    cur = Math.max(cur, segs[si][0]); out.push({ u, pid: u.pid, cfg: u.cfg, start: cur }); cur += u.w;
  }
  return { out, miss };
}
function fitRun(run, d, issues) {
  const L = (run.wall === 'N' || run.wall === 'S') ? d.room.w : d.room.d, wn = WALL_NAME[run.wall].toLowerCase();
  const segs = []; let a = Math.max(0, run.start);
  for (const [d0, d1] of runKeepOut(run.wall, d).concat(run.keep || []).sort((x, y) => x[0] - y[0])) { if (d1 <= a) continue; if (d0 > a) segs.push([a, Math.min(d0, L)]); a = Math.max(a, d1); }
  if (a < L) segs.push([a, L]);
  const wins = d.openings.filter(o => o.kind === 'window' && o.wall === run.wall).map(o => { const hw = o.double ? 75 : 50; return [o.c - hw, o.c + hw]; });
  // a window on a neighbouring wall, close to the shared corner, also rules out a hob (its chimney) or a tall box in that corner
  { const W = d.room.w, D = d.room.d, L0 = (run.wall === 'N' || run.wall === 'S') ? W : D;
    for (const o of d.openings.filter(o => o.kind === 'window' && o.wall !== run.wall)) {
      const perp = (run.wall === 'N' || run.wall === 'S') ? (o.wall === 'W' || o.wall === 'E') : (o.wall === 'N' || o.wall === 'S'); if (!perp) continue;
      const hw = o.double ? 75 : 50, strip = { E: [W - 62, W], W: [0, 62], N: [0, 62], S: [D - 62, D] }[run.wall];
      if (o.c + hw <= strip[0] || o.c - hw >= strip[1]) continue;
      wins.push((o.wall === 'N' || o.wall === 'W') ? [0, 62] : [L0 - 62, L0]);
    } }
  const units = run.units.map(tok => { const u = kdlUnit(tok); if (!u) issues.push(`Didn't recognise the unit "${tok}".`); else u.tok = tok; return u; }).filter(Boolean)
    .map(u => u.gap != null ? u : Object.assign(u, (dd => ({ w: Math.round(dd.w * 100), dp: Math.round(dd.d * 100) }))(dimsOf(P(u.pid), Object.assign(defCfg(P(u.pid)), u.cfg)))));
  const room = () => segs.reduce((s, [x, y]) => s + (y - x), 0), need = () => units.reduce((s, u) => s + (u.gap != null ? u.gap : u.w), 0);
  const trimOne = () => {
    const g = units.findIndex(u => u.gap != null); if (g >= 0) { units.splice(g, 1); return true; }
    const b = units.filter(u => u.pid === 'base-cab' && FLEX_W.indexOf(u.cfg.w) < FLEX_W.length - 1).sort((x, y) => y.w - x.w)[0];
    if (b) { b.cfg.w = FLEX_W[Math.max(0, FLEX_W.indexOf(b.cfg.w)) + 1]; b.w = b.cfg.w; return true; }
    return false;
  };
  let trimmed = false; const dropped = [];
  while (need() > room() && trimOne()) trimmed = true;
  let res = packRun(units, segs);
  while (res.miss.length) {
    if (trimOne()) { trimmed = true; res = packRun(units, segs); continue; }
    let k = -1; for (const pid of DROP_ORDER) { k = units.map(u => u.pid).lastIndexOf(pid); if (k >= 0) break; }
    if (k < 0) break;
    dropped.push(units.splice(k, 1)[0]); res = packRun(units, segs);
  }
  // keep hob / fridge / tall units out from under windows by moving them along the run
  const bad = r => r.miss.length * 10 + r.out.filter(p => NOT_UNDER_WINDOW.includes(p.pid) && wins.some(([w0, w1]) => p.start < w1 - 1 && p.start + p.u.w > w0 + 1)).length;
  if (wins.length && bad(res) > 0) { // whole arrangements first: window-sensitive units all at the start, or all at the end
    const nu = units.filter(u => NOT_UNDER_WINDOW.includes(u.pid)), rest = units.filter(u => !NOT_UNDER_WINDOW.includes(u.pid));
    for (const t of [nu.concat(rest), rest.concat(nu), rest.concat(nu.slice().reverse()), nu.slice().reverse().concat(rest)]) { const r = packRun(t, segs); if (bad(r) < bad(res)) { units.splice(0, units.length, ...t); res = r; } }
  }
  for (let pass = 0; pass < 3 && wins.length && bad(res) > 0; pass++) {
    let best = null;
    units.forEach((u, i) => { if (!NOT_UNDER_WINDOW.includes(u.pid)) return;
      for (let j = 0; j < units.length; j++) { if (j === i) continue; const t = units.slice(); t.splice(j, 0, t.splice(i, 1)[0]); const r = packRun(t, segs); if (!best || bad(r) < best.s) best = { s: bad(r), t, r }; } });
    if (!best || best.s >= bad(res)) break;
    units.splice(0, units.length, ...best.t); res = best.r;
  }
  // still under a window: slide that unit (and the ones after it in the same free stretch) into the stretch's slack
  for (const p of res.out) {
    if (!NOT_UNDER_WINDOW.includes(p.pid) || !wins.some(([w0, w1]) => p.start < w1 - 1 && p.start + p.u.w > w0 + 1)) continue;
    const seg = segs.find(([x, y]) => p.start >= x - .5 && p.start < y), tail = res.out.filter(q => q.start >= p.start && q.start < seg[1]);
    const slack = seg[1] - Math.max(...tail.map(q => q.start + q.u.w));
    if (slack > 0 && !wins.some(([w0, w1]) => p.start + slack < w1 - 1 && p.start + slack + p.u.w > w0 + 1)) tail.forEach(q => { q.start += slack; });
  }
  if (trimmed) issues.push(`Trimmed cabinet widths so the ${wn} run fits.`);
  if (dropped.length) issues.push(`Left out ${dropped.length} unit${dropped.length > 1 ? 's' : ''} (${[...new Set(dropped.map(u => P(u.pid).name.toLowerCase()))].join(', ')}) that didn't fit on the ${wn}.`);
  const placed = res.out.map(({ pid, cfg, start, u }) => ({ pid, cfg, start, w: u.w, dp: u.dp }));
  placed.miss = res.miss.map(u => u.tok); placed.dropped = dropped.length;
  placed.under = res.out.filter(p => NOT_UNDER_WINDOW.includes(p.pid) && wins.some(([w0, w1]) => p.start < w1 - 1 && p.start + p.u.w > w0 + 1)).map(p => p.u.tok);
  for (const u of res.miss) if (!ESSENTIAL_TOK.test(u.tok)) issues.push(`No room left on the ${wn} for the ${P(u.pid).name.toLowerCase()}.`);
  return placed;
}
/* KDL → room + placed units, via the same physics as everything else (realizeDesign), plus the control layer */
function realizeKDL(d) {
  const st = d.style || {}, fin = Number.isInteger(st.finish) ? clamp(st.finish, 0, FINISHES.length - 1) : 0, issues = [...d.warnings];
  const optVals = {}; PRODUCTS.forEach(p => p.opts.forEach(o => { optVals[o.key] = null; }));
  const mk = (pid, cfg, placement, finish) => ({ product: pid, purpose: '', finish: finish ?? (P(pid).variants[0].fin ? fin : 0), options: Object.assign({}, optVals, cfg), placement: Object.assign({ mode: 'wall', wall: null, start_cm: null, x_cm: null, z_cm: null, rotation_deg: null }, placement) });
  const items = [];
  // a hob needs a chimney, and a chimney needs a wall: hobs on an island move to the longest RUN (a base cabinet takes their place)
  for (const isl of d.islands) isl.units.forEach((t, i) => { if (/^hob/i.test(t) && d.runs.length) { d.runs.slice().sort((a, b) => b.units.length - a.units.length)[0].units.push(t); isl.units[i] = 'b60.3dr'; issues.push('Moved the hob from the island to a wall so it can have a chimney.'); } });
  // corners: a run on a neighbouring wall that already reaches a shared corner reserves it (as deep as its corner unit)
  const cornerAt = (wall, other) => ({ N: { W: 'start', E: 'end' }, S: { W: 'start', E: 'end' }, W: { N: 'start', S: 'end' }, E: { N: 'start', S: 'end' } })[wall][other];
  const wallL = w => (w === 'N' || w === 'S') ? d.room.w : d.room.d;
  const cornerKeep = (run, others) => {
    const keep = [];
    for (const [orun, ofit] of others) {
      if (!ADJ[run.wall].includes(orun.wall) || !ofit) continue;
      const end = cornerAt(orun.wall, run.wall), oL = wallL(orun.wall);
      const at = ofit.filter(p => end === 'start' ? p.start < 62 : p.start + p.w > oL - 62); if (!at.length) continue;
      const deep = Math.max(...at.map(p => p.dp || 60)) + 2, mine = cornerAt(run.wall, orun.wall), L = wallL(run.wall);
      keep.push(mine === 'start' ? [0, deep] : [L - deep, L]);
    }
    return keep;
  };
  const fits = [];
  d.runs.forEach((run, k) => { run.keep = cornerKeep(run, d.runs.slice(0, k).map((r, j) => [r, fits[j]])); fits.push(fitRun(run, d, issues)); });
  const othersOf = run => d.runs.map((r, j) => [r, fits[j]]).filter(([r]) => r !== run);
  // a sink, hob or fridge that didn't fit goes to the wall where it costs least: another RUN, or an empty wall
  // (a hob, fridge or tall unit stuck under a window is moved the same way, if another wall takes it cleanly)
  for (let r = 0; r < d.runs.length; r++) for (const tok of fits[r].under.filter(t => !fits[r].miss.includes(t))) {
    const used = d.runs.map(x => x.wall), empty = WALLS.filter(w => !used.includes(w)).map(w => ({ wall: w, start: used.some(u => ADJ[w].includes(u)) ? 60 : 0, units: [], fresh: true }));
    for (const cand of d.runs.filter((_, k) => k !== r).concat(empty)) {
      const trial = Object.assign({}, cand, { units: cand.units.concat(tok) }); trial.keep = cornerKeep(trial, othersOf(cand)); const out = fitRun(trial, d, []);
      if (out.miss.length || out.under.length || out.dropped) continue;
      const rest = Object.assign({}, d.runs[r], { units: d.runs[r].units.filter((t, i, a) => i !== a.indexOf(tok)) }), outR = fitRun(rest, d, []);
      d.runs[r] = rest; fits[r] = outR;
      if (cand.fresh) { delete trial.fresh; d.runs.push(trial); fits.push(out); } else { const k = d.runs.indexOf(cand); d.runs[k] = trial; fits[k] = out; }
      issues.push(`Moved the ${P(kdlUnit(tok).pid).name.toLowerCase()} to the ${WALL_NAME[cand.wall].toLowerCase()} to keep it clear of the window.`); break;
    }
  }
  for (let r = 0; r < d.runs.length; r++) for (const tok of fits[r].miss) {
    const used = d.runs.map(x => x.wall), empty = WALLS.filter(w => !used.includes(w)).map(w => ({ wall: w, start: used.some(u => ADJ[w].includes(u)) ? 60 : 0, units: [], fresh: true }));
    let best = null;
    for (const cand of d.runs.filter((_, k) => k !== r).concat(empty)) {
      const trial = Object.assign({}, cand, { units: cand.units.concat(tok) }); trial.keep = cornerKeep(trial, othersOf(cand)); const tmp = [], out = fitRun(trial, d, tmp), cost = (out.miss.length ? 100 : 0) + out.under.length * 40 + out.dropped * 3 + (cand.fresh ? 2 : 0);
      if (!best || cost < best.cost) best = { cost, cand, trial, out, tmp };
    }
    if (best && !best.out.miss.length) {
      issues.push(`Moved the ${P(kdlUnit(tok).pid).name.toLowerCase()} to the ${WALL_NAME[best.cand.wall].toLowerCase()} — it didn't fit on the ${WALL_NAME[d.runs[r].wall].toLowerCase()}.`);
      if (best.cand.fresh) { delete best.trial.fresh; d.runs.push(best.trial); fits.push(best.out); } else { const k = d.runs.indexOf(best.cand); d.runs[k] = best.trial; fits[k] = best.out; }
      issues.push(...best.tmp.filter(m => !issues.includes(m)));
    } else issues.push(`No room anywhere for the ${P(kdlUnit(tok).pid).name.toLowerCase()}.`);
  }
  d.runs.forEach((run, k) => { for (const pl of fits[k]) items.push(mk(pl.pid, pl.cfg, { mode: 'wall', wall: run.wall, start_cm: pl.start })); });
  for (const isl of d.islands) {
    const units = isl.units.map(kdlUnit).filter(u => u && u.pid), widths = units.map(u => Math.round(dimsOf(P(u.pid), Object.assign(defCfg(P(u.pid)), u.cfg)).w * 100));
    const total = widths.reduce((a, b) => a + b, 0), alongX = isl.faces === 'N' || isl.faces === 'S', rot = { S: 0, N: 180, E: 90, W: -90 }[isl.faces];
    let cur = -total / 2;
    units.forEach((u, i) => { const c = cur + widths[i] / 2; items.push(mk(u.pid, u.cfg, { mode: 'free', x_cm: alongX ? isl.x + c : isl.x, z_cm: alongX ? isl.z : isl.z + c, rotation_deg: rot })); cur += widths[i]; });
  }
  const spec = {
    name: d.name, layout_type: d.type, concept: d.idea, highlights: d.hi, notes: d.notes,
    room: { width_cm: d.room.w, depth_cm: d.room.d, ceiling_cm: d.room.h, wall_paint: DEFAULT_WALL, floor: FLOORS.some(f => f.id === st.floor) ? st.floor : 'f0',
      openings: d.openings.map(o => ({ type: o.kind === 'door' ? 'single' : (o.double ? 'w2' : 'w1'), wall: o.wall, center_cm: o.c, width_cm: null })) },
    style: { countertop: COUNTERS.some(c => c.id === st.counter) ? st.counter : DEFAULT_STYLE.counter, handles: HANDLES.some(h => h[0] === st.handle) ? st.handle : DEFAULT_STYLE.handle,
      wall_tile: TILES.some(t => t.id === st.tile) ? st.tile : DEFAULT_STYLE.tile, tile_coverage: TILE_COVER.some(t => t[0] === st.cover) ? st.cover : DEFAULT_STYLE.tileCover, cabinet_finish: fin },
    items
  };
  const chimStyle = ['pyramid', 'tshape', 'curved', 'filterless'].includes(st.chimney) ? st.chimney : 'pyramid';
  const real = realizeDesign(spec, () => controlLayer({ adds: d.adds, chimStyle, fin, issues }));
  real.issues = issues.concat(real.issues);
  return { spec, real };
}
/* the deterministic control layer (runs inside realizeDesign's scene context) */
function controlLayer({ adds, chimStyle, fin, issues }) {
  const R0 = S.room, outside = sh => sh.x - sh.hw < R0.x0 - .005 || sh.x + sh.hw > R0.x1 + .005 || sh.z - sh.hd < R0.z0 - .005 || sh.z + sh.hd > R0.z1 + .005;
  const place = (pid, cfg, sh, why) => { if (!sh || outside(sh) || collides(sh, sh._tmp) || featureHit(sh, true)) return false; const it = sh._tmp; applyShape(it, sh); S.items.push(it); void why; return true; };
  const tmpItem = (pid, cfg, v) => ({ uid: uid(), pid, v: v ?? (P(pid).variants[0].fin ? fin : 0), cfg: Object.assign(defCfg(P(pid)), cfg), x: 0, z: 0, rot: 0, wall: null, purpose: '' });
  const at = (it, wall, a0) => { const d = dimsOf(P(it.pid), it.cfg), ax = alongAxis(wall), base = ax === 'x' ? S.room.x0 : S.room.z0; const sh = wallPlace(it, wall, base + a0 + d.w / 2); sh._tmp = it; return sh; };
  // 0 · safety net: a sink, hob or fridge the runs could not hold is placed wherever the planner's own slot finder allows
  for (const [pid, ess] of [['sink-unit', 'sink'], ['hob-unit', 'stove'], ['fridge', 'fridge']]) {
    if (S.items.some(i => (P(i.pid).essential || P(i.pid).role) === ess)) continue;
    const want = (spec0 => spec0 ? spec0.options : {})(null), it = tmpItem(pid, want), sh = findSlot(it, null);
    if (sh && !featureHit(sh, true)) { sh._tmp = it; if (place(pid, null, sh)) { issues.push(`Placed the ${P(pid).name.toLowerCase()} where there was room — the design's own spot didn't work.`); continue; } }
    issues.push(`There is no room for the ${P(pid).name.toLowerCase()} in this room.`);
  }
  const floor = S.items.filter(i => i.wall && P(i.pid).mount === 'floor');
  // 1 · a chimney over every hob, same width when possible
  const chimneyOver = hob => {
    const s = shapeOf(hob), ax = alongAxis(hob.wall), base = ax === 'x' ? S.room.x0 : S.room.z0, [a0, a1] = alongOf(s, ax), w = [90, 75, 60].find(x => x <= Math.round((a1 - a0) * 100) + 1) || 60;
    const it = tmpItem('chimney', { w, style: chimStyle }), off = ((a1 - a0) - w / 100) / 2;
    return place('chimney', null, at(it, hob.wall, a0 - base + off));
  };
  for (const hob of floor.filter(i => P(i.pid).essential === 'stove')) {
    if (chimneyOver(hob)) continue;
    // no chimney possible here (a window, usually): the hob trades places with a base cabinet of a hob width elsewhere —
    // same footprint, so nothing else moves — and the chimney goes over the new spot
    const cabs = floor.filter(c => (c.pid === 'base-cab' || c.pid === 'dishwasher') && [60, 75, 90].includes(c.cfg.w || 60)).sort((a, b) => Math.hypot(a.x - hob.x, a.z - hob.z) - Math.hypot(b.x - hob.x, b.z - hob.z));
    let moved = false;
    for (const cab of cabs) {
      const keep = [hob.pid, hob.cfg, cab.pid, cab.cfg], hw = hob.cfg.w || 75;
      hob.pid = 'base-cab'; hob.cfg = Object.assign(defCfg(P('base-cab')), { w: hw, front: '3drawer' });
      cab.pid = 'hob-unit'; cab.cfg = Object.assign(defCfg(P('hob-unit')), keep[1], { w: keep[3].w || 60 });
      if (chimneyOver(cab)) { moved = true; issues.push(`Swapped the hob with a base cabinet on the ${WALL_NAME[cab.wall].toLowerCase()} so it can have a chimney.`); break; }
      [hob.pid, hob.cfg, cab.pid, cab.cfg] = keep;
    }
    if (!moved) issues.push('No room for a chimney above the hob — a window or cabinet is in the way.');
  }
  // 2 · wall cabinets above base units (skipped over windows and where they would clash)
  for (const u of floor.filter(i => P(i.pid).counter && P(i.pid).essential !== 'stove')) {
    const s = shapeOf(u), ax = alongAxis(u.wall), base = ax === 'x' ? S.room.x0 : S.room.z0, [a0, a1] = alongOf(s, ax);
    let cur = a0 - base, left = Math.round((a1 - a0) * 100);
    while (left >= 30) { const w = [90, 75, 60, 45, 30].find(x => x <= left); const it = tmpItem('wall-cab', { w, front: w <= 45 ? '1door' : '2door', hh: 70 }); place('wall-cab', null, at(it, u.wall, cur)); cur += w / 100; left -= w; }
  }
  // 3 · lofts above fridges and tall units (when asked for)
  if (adds.includes('loft')) for (const u of floor.filter(i => ['fridge', 'tall'].includes(P(i.pid).role))) {
    const s = shapeOf(u), ax = alongAxis(u.wall), base = ax === 'x' ? S.room.x0 : S.room.z0, [a0, a1] = alongOf(s, ax), w = [120, 90, 60].find(x => x <= Math.round((a1 - a0) * 100) + 1);
    if (w) place('loft', null, at(tmpItem('loft', { w }), u.wall, a0 - base));
  }
  // 4 · counter appliances, purifier, stools
  const near = pid => { const i = S.items.find(x => x.pid === pid || P(x.pid).essential === pid); return i ? { x: i.x, z: i.z } : null; };
  for (const a of adds) {
    if (['microwave', 'otg', 'mixer'].includes(a)) { const it = tmpItem(a, {}); const sh = findSlot(it, a === 'mixer' ? near('stove') : null); if (sh) { sh._tmp = it; place(a, null, sh); } else issues.push(`No free worktop for the ${a}.`); }
    else if (a === 'ro') { const it = tmpItem('ro', {}); const sh = findSlot(it, near('sink')); if (sh) { sh._tmp = it; place('ro', null, sh); } }
    else if (/^stools?\d*$/.test(a)) {
      const n = clamp(parseInt(a.replace(/\D/g, ''), 10) || 3, 1, 6), isl = S.items.filter(i => !i.wall && P(i.pid).counter);
      if (!isl.length) { issues.push('Stools need an island or peninsula — skipped.'); continue; }
      const xs = isl.map(i => shapeOf(i)), x0 = Math.min(...xs.map(s => s.x - s.hw)), x1 = Math.max(...xs.map(s => s.x + s.hw)), z0 = Math.min(...xs.map(s => s.z - s.hd)), z1 = Math.max(...xs.map(s => s.z + s.hd));
      const faces = isl[0].rot, back = faces === 180 ? 1 : faces === 0 ? -1 : 0, alongX = faces === 0 || faces === 180;
      for (let k = 0; k < n; k++) {
        const t = (k + .5) / n, it = tmpItem('stool', {}), x = alongX ? x0 + (x1 - x0) * t : (faces === 90 ? x0 - .35 : x1 + .35), z = alongX ? (back > 0 ? z1 + .35 : z0 - .35) : z0 + (z1 - z0) * t;
        const sh = shapeOf(it, x, z, 0); sh._tmp = it; place('stool', null, sh);
      }
    }
  }
}

/* ── one text call for every connection (API key · Claude Code bridge · copy & paste) ── */
async function aiText(system, user, onProgress, opt = {}) {
  if (window.__interioMockAI) return window.__interioMockAI(system, user, onProgress, opt); // test hook
  if (aiMode() === 'manual') return aiManualText(system, user, opt.title || 'Send this to Claude');
  if (AI.cfg.model === 'default' && aiMode() !== 'bridge') throw new Error("“Claude Code's default model” only works with the Claude Code bridge — pick a model in AI settings.");
  const client = aiClient(), ctrl = new AbortController(); (AI.ctrls = AI.ctrls || new Set()).add(ctrl);
  const body = { model: AI.cfg.model, max_tokens: opt.maxTokens || 2048, thinking: { type: 'adaptive' }, output_config: { effort: opt.effort || 'low' },
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  if (FALLBACK_MODELS.includes(AI.cfg.model) && aiMode() === 'api') { body.betas = ['server-side-fallback-2026-07-01']; body.fallbacks = 'default'; }
  try {
    const stream = client.beta.messages.stream(body, { signal: ctrl.signal });
    let chars = 0; stream.on('text', t => { chars += t.length; onProgress && onProgress({ chars }); });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request.');
    if (msg.stop_reason === 'max_tokens') throw new Error('The answer was cut off — try a simpler request.');
    return msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  } finally { AI.ctrls.delete(ctrl); }
}
const aiCancelAll = () => { (AI.ctrls || new Set()).forEach(c => c.abort()); };
function aiManualText(system, user, title) {
  return new Promise((resolve, reject) => {
    const prompt = `${system}\n\n---\n${user}`, err = h('p', { class: 'ai-msg bad', role: 'alert' });
    const reply = h('textarea', { class: 'field mono', rows: 6, placeholder: "Paste Claude's reply here", 'aria-label': "Claude's reply" });
    const pre = h('textarea', { class: 'field mono', rows: 4, readonly: true, 'aria-label': 'Prompt to send' }, prompt);
    const copyBtn = h('button', { class: 'pill-btn primary', onclick: () => { (navigator.clipboard ? navigator.clipboard.writeText(prompt) : Promise.reject()).then(() => { copyBtn.textContent = 'Copied ✓'; }, () => { pre.focus(); pre.select(); copyBtn.textContent = 'Press Ctrl/⌘+C'; }); } }, 'Copy prompt');
    let settled = false;
    const close = modal(h('div', null, h('h3', null, title),
      h('ol', { class: 'steps' }, h('li', null, `Copy the prompt (${(prompt.length / 1000).toFixed(1)}k characters).`), h('li', null, 'Send it in a new chat at ', h('a', { href: 'https://claude.ai/new', target: '_blank', rel: 'noopener' }, 'claude.ai'), ' or in Claude Code.'), h('li', null, 'Paste the whole reply below.')),
      h('div', { style: 'margin:8px 0' }, copyBtn), pre, reply, err,
      h('div', { class: 'actions' }, h('button', { class: 'pill-btn', onclick: () => close() }, 'Cancel'),
        h('button', { class: 'pill-btn primary', onclick: () => { if (!reply.value.trim()) { err.textContent = 'Paste the reply first.'; return; } settled = true; close(); resolve(reply.value); } }, 'Use this reply'))), true,
      () => { if (!settled) { settled = true; const e = new Error('Cancelled.'); e.name = 'AbortError'; reject(e); } });
  });
}

/* ── generation: instant match from the pre-generated gallery, then parallel Claude designs, cached by brief ── */
const VARIANTS = ['Follow the brief closely.', 'Try a different layout type from the obvious one.', 'Keep it budget-conscious and compact.'];
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(36); };
/* the free path: the collection (KDL designs stored in the repo) re-fitted to the brief's room — no AI call at all.
   ROOM takes the brief's size, openings and islands scale with it, and the control layer re-fits every run to the new walls. */
function galleryMatches(b) {
  const g = window.INTERIO_GALLERY || [];
  const wantW = b.widthFt ? parseFloat(b.widthFt) * 30.48 : null, wantD = b.depthFt ? parseFloat(b.depthFt) * 30.48 : null;
  const score = e => (b.layout !== 'any' && e.type !== b.layout ? 400 : 0) + (wantW ? Math.abs(e.w - wantW) : 0) + (wantD ? Math.abs(e.d - wantD) : 0) + (e.must && b.must.filter(m => !e.must.includes(m)).length * 40);
  const sc = new Map(g.map(e => [e, score(e) + Math.random() * 30])); return g.slice().sort((x, y) => sc.get(x) - sc.get(y));
}
const galleryMatch = b => galleryMatches(b)[0] || null;
function kdlRefit(kdl, b) {
  const m = kdl.match(/^ROOM\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/m); if (!m || !b.widthFt || !b.depthFt) return kdl;
  const W = Math.round(parseFloat(b.widthFt) * 30.48), D = Math.round(parseFloat(b.depthFt) * 30.48), H = Math.round(parseFloat(b.ceilingFt || 9) * 30.48);
  if (!(W > 150 && D > 150)) return kdl;
  const sx = W / +m[1], sz = D / +m[2];
  return kdl.split('\n').map(l => {
    if (/^ROOM\b/.test(l)) return `ROOM ${W} ${D} ${H}`;
    let q = l.match(/^(DOOR|WINDOW)\s+([NESW])\s+(\d+(?:\.\d+)?)(.*)$/); if (q) return `${q[1]} ${q[2]} ${Math.round(+q[3] * (/[NS]/.test(q[2]) ? sx : sz))}${q[4]}`;
    q = l.match(/^ISLAND\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(.*)$/); if (q) return `ISLAND ${Math.round(+q[1] * sx)} ${Math.round(+q[2] * sz)}${q[3]}`;
    return l;
  }).join('\n');
}
function composeFromCollection(b, n) {
  const out = [];
  for (const e of galleryMatches(b)) { if (out.length >= n) break; try { out.push(kdlToDoc(kdlRefit(e.kdl, b), { brief: b, collection: true })); } catch (err) { /* skip */ } }
  return out;
}
function kdlToDoc(text, extra) {
  const d = parseKDL(text), { spec, real } = realizeKDL(d);
  const doc = docFromDesign(spec, real, extra); doc.ai.kdl = text.trim(); return doc;
}
async function generateProposals(b) {
  const st = $('#ai-brief-status'); st.innerHTML = '';
  if (!aiReady()) { // free: compose from the collection, fitted to this room
    const results = composeFromCollection(b, 3); store.set('gen', { at: Date.now(), results, free: true }); renderResults(); return;
  }
  if (AI.busy) return; AI.busy = true;
  const n = aiMode() === 'manual' ? 1 : 3, pg = aiProgress(); st.append(pg.el);
  const results = [], t0 = Date.now();
  const publish = () => { store.set('gen', { at: Date.now(), results }); renderResults(); };
  HERO.loop = true; publish(); // clears the stage: the drawing prints while Claude works
  const m = galleryMatch(b);
  if (m) { try { results.push(kdlToDoc(kdlRefit(m.kdl, b), { brief: b, instant: true })); publish(); } catch (e) { /* bad gallery entry */ } }
  const jobs = VARIANTS.slice(0, n).map(async (variant, i) => {
    const text = await aiText(kdlSystem(), kdlBrief(b, n > 1 ? variant : ''), i === 0 ? pg.update : null, { effort: 'low', maxTokens: 1500 });
    const doc = kdlToDoc(text, { brief: b, secs: Math.round((Date.now() - t0) / 1000) });
    const at = results.findIndex(r => r.instant); if (at >= 0) results.splice(at, 1);
    results.push(doc); publish();
  });
  const settled = await Promise.allSettled(jobs); AI.busy = false; HERO.loop = false; st.innerHTML = '';
  const fails = settled.filter(s => s.status === 'rejected').map(s => aiErrorText(s.reason));
  if (fails.length && !(fails.length === n && /cancel/i.test(fails[0]))) st.append(h('div', { class: 'ai-error', role: 'alert' }, fails.length === n ? fails[0] : `${n - fails.length} of ${n} designs arrived. ${fails[0]}`));
  renderResults();
}
/* results: cards arrive with a critically damped spring; only new cards animate */
const SEEN = new Set();
function kitchenCard(doc, onOpen, i = 0, extra) {
  const fresh = !SEEN.has(doc.id); SEEN.add(doc.id);
  return h('div', { class: 'kcard' + (fresh ? ' enter' : ''), style: `--i:${i}` },
    h('button', { class: 'kc-hit', 'aria-label': `Open ${doc.title}`, onclick: onOpen },
      h('div', { class: 'kc-plan', html: planSVG(doc.room, doc.items) }),
      h('div', { class: 'kc-meta' }, h('strong', null, doc.title), h('span', null, `${fmtHub(doc.room)} · ${priceHTML(docPrice(doc)).replace(/<[^>]+>/g, '')}`))),
    doc.collection || doc.instant ? h('i', { class: 'kc-tag', title: 'From the collection. Connect Claude for new designs.' }, 'Collection') : null, extra || null);
}
function renderResults() {
  const sec = $('#ai-results'), grid = $('#ai-results-grid'), fig = $('#hero-fig'), gen = store.get('gen', null), has = !!(gen && gen.results && gen.results.length);
  if (!sec) return;
  sec.hidden = !has; fig.hidden = has; grid.innerHTML = '';
  if (!has) { drawHero(); return; }
  gen.results.forEach((doc, i) => grid.append(kitchenCard(doc, () => openDoc(doc), i)));
}
function renderGallery() { /* the collection lives in a sheet now (footer → Collection) */ }
function openCollection(trigger) {
  let close; const g = h('div', { class: 'sheet-grid' });
  (window.INTERIO_GALLERY || []).forEach((e, i) => { try { const doc = kdlToDoc(e.kdl, { gallery: true }); g.append(kitchenCard(doc, () => { close(); openDoc(doc); }, i)); } catch (err) { /* skip a bad entry */ } });
  close = openSheet('Collection', g, trigger);
}
function openSaved(trigger) {
  let close; const g = h('div', { class: 'sheet-grid' });
  savedDocs().forEach((d, i) => {
    const del = h('button', { class: 'kc-del', 'aria-label': `Delete ${d.title || 'kitchen'}`, title: 'Delete', html: ico('trash', 16), onclick: () => { const m = docs(); delete m[d.id]; store.set('designs', m); card.remove(); updateHubFoot(); if (!savedDocs().length) close(); } });
    const card = kitchenCard(Object.assign({}, d, { title: d.title || 'My kitchen' }), () => { close(); location.hash = `#${d.templateId}/${d.id}`; }, i, del); g.append(card);
  });
  close = openSheet('Saved', g, trigger);
}

/* ── a sheet: rises from its trigger, can be grabbed mid-flight and flicked away (velocity-projected), returns the same way ── */
const projectMomentum = (v, d = .998) => (v / 1000) * d / (1 - d);
const rubberband = (o, dim, c = .55) => (o * dim * c) / (dim + c * Math.abs(o));
function openSheet(title, body, trigger) {
  const root = $('#modal-root'); root.innerHTML = '';
  const grab = h('div', { class: 'sheet-grab', 'aria-hidden': 'true' }), head = h('div', { class: 'sheet-head' }, h('h3', null, title), h('button', { class: 'icon-btn', 'aria-label': 'Close', html: ico('close', 20), onclick: () => close() }));
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1' }, grab, head, h('div', { class: 'sheet-body' }, body)), scrim = h('div', { class: 'sheet-scrim' });
  root.append(scrim, sheet);
  if (trigger) { const r = trigger.getBoundingClientRect(), s = sheet.getBoundingClientRect(); sheet.style.transformOrigin = `${clamp(r.left + r.width / 2 - s.left, 0, s.width)}px 100%`; }
  const H = () => sheet.offsetHeight + 24, now = () => new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 || 0; // the presentation value, mid-animation included
  const set = (y, anim) => { const e = anim ? 'var(--spring-sheet-d) var(--spring-sheet)' : '0s'; sheet.style.transition = `transform ${e}`; sheet.style.transform = `translateY(${y}px)`; scrim.style.transition = `opacity ${anim ? '.3s' : '0s'}`; scrim.style.opacity = String(clamp(1 - Math.max(0, y) / H(), 0, 1)); };
  let closing = false, drag = null;
  const esc = e => { if (e.key === 'Escape') close(); };
  const close = () => { closing = true; set(H(), true); setTimeout(() => { if (closing) { root.innerHTML = ''; document.removeEventListener('keydown', esc); if (trigger) trigger.focus({ preventScroll: true }); } }, 380); };
  set(H(), false); requestAnimationFrame(() => requestAnimationFrame(() => { set(0, true); sheet.focus({ preventScroll: true }); }));
  document.addEventListener('keydown', esc); scrim.addEventListener('click', close);
  const down = e => { if (e.target.closest('button')) return; closing = false; const y0 = now(); set(y0, false); drag = { id: e.pointerId, sy: e.clientY, y0, hist: [[e.clientY, performance.now()]] }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ } };
  const move = e => { if (!drag || e.pointerId !== drag.id) return; let y = drag.y0 + e.clientY - drag.sy; if (y < 0) y = -rubberband(-y, H()); set(y, false); drag.hist.push([e.clientY, performance.now()]); if (drag.hist.length > 6) drag.hist.shift(); };
  const up = () => { if (!drag) return; const [a, z] = [drag.hist[0], drag.hist[drag.hist.length - 1]], v = (z[0] - a[0]) / Math.max(1, z[1] - a[1]) * 1000; drag = null; if (now() + projectMomentum(v) > H() * .45) close(); else set(0, true); };
  for (const el of [grab, head]) { el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); }
  return close;
}
/* Apple's two-parameter spring (damping ratio, response) → a CSS linear() easing and its settle time */
function springEase(damping, response) {
  const w = 2 * Math.PI / response, z = damping, wd = w * Math.sqrt(Math.max(1e-6, 1 - z * z));
  const x = t => z >= 1 ? 1 - (1 + w * t) * Math.exp(-w * t) : 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  let T = .1; while (T < 2.5 && !(Math.abs(1 - x(T)) < .002 && Math.abs(1 - x(T + .08)) < .002)) T += .01;
  const pts = []; for (let i = 0; i <= 48; i++) pts.push(+x(T * i / 48).toFixed(4)); pts[pts.length - 1] = 1;
  return { ease: `linear(${pts.join(', ')})`, dur: Math.round(T * 1000) + 'ms' };
}
function installSprings() {
  if (!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'))) return; // falls back to the cubic-bezier defaults in CSS
  const st = document.documentElement.style;
  for (const [name, d, r] of [['spring', 1, .4], ['spring-sheet', .8, .3], ['spring-bounce', .8, .4]]) { const s = springEase(d, r); st.setProperty('--' + name, s.ease); st.setProperty('--' + name + '-d', s.dur); }
}


/* ── planner AI tab: what the AI designed, regenerate, and how to steer it by typing ── */
function renderAITab(sc) {
  const ai = S.ai || {}, box = h('div', { class: 'psec aitab' }); sc.append(box);
  if (S.ai) box.append(h('div', { class: 'ai-card' }, h('small', { class: 'muted' }, `AI design · ${ai.layout_type || ''}`), h('h3', null, S.title), ai.concept ? h('p', null, ai.concept) : null,
    ai.highlights && ai.highlights.length ? h('ul', { class: 'hl' }, ai.highlights.map(x => h('li', null, x))) : null,
    ai.issues && ai.issues.length ? h('details', { class: 'ai-issues' }, h('summary', null, `${ai.issues.length} placement adjustment${ai.issues.length > 1 ? 's' : ''} by the planner`), h('ul', null, ai.issues.map(x => h('li', null, x)))) : null,
    ai.kdl ? h('details', null, h('summary', null, 'Design source (KDL)'), h('pre', { class: 'cmd' }, ai.kdl)) : null));
  else box.append(h('div', { class: 'ai-card' }, h('h3', null, 'Steer the design by typing'), h('p', null, 'Use the command bar at the bottom of the 3D view. Precise commands run instantly; anything else is interpreted by Claude.')));
  box.append(h('div', { class: 'ai-card' }, h('b', null, 'Try typing'), h('ul', { class: 'hl' }, ['move the window 50 cm left', 'move the east wall out 30 cm', 'room 12x10 ft', 'lower the window 10 cm', 'make the hob 90 with 5 burners', 'add a tall pantry on the east wall', 'countertop marble, tiles moroccan dado', 'undo'].map(x => h('li', null, h('button', { class: 'linkish', onclick: () => { $('#tb-input').value = x; $('#tb-input').focus(); } }, x))))));
  box.append(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
    aiReady() ? h('button', { class: 'pill-btn primary', onclick: () => tbDesign('A fresh design for this room in the same spirit.') }, S.items.length ? 'Design this room again' : 'Design this room with AI') : h('button', { class: 'pill-btn primary', onclick: () => showAISettings(() => renderPanel(true)) }, 'Connect Claude'),
    h('button', { class: 'pill-btn', onclick: () => showAISettings(() => renderPanel(true)) }, 'AI settings')));
}

/* ═══════════════ 14 · Textbot — type to control the planner ═══════════════
   Three tiers: (1) a deterministic grammar turns precise text into canonical commands instantly; (2) anything else goes to
   Claude with a tiny prompt (the command grammar + a scene summary) and must come back as canonical commands or NONE;
   (3) one executor runs the commands, with undo. Outside its vocabulary it answers "Doesn't look like anything to me." */
const TB = { log: [], undo: [], redo: [], busy: false };
const WALL_WORD = { north: 'N', south: 'S', east: 'E', west: 'W', back: 'N', front: 'S', right: 'E', left: 'W' };
const ROLE_WORDS = [[/fridge|refrigerator/, 'fridge'], [/\bsink/, 'sink-unit'], [/\bhob|stove|cooktop|burner/, 'stove'], [/chimney|hood|exhaust/, 'chimney'], [/microwave/, 'microwave'], [/\botg\b|toaster|oven toaster/, 'otg'],
  [/mixer|grinder/, 'mixer'], [/purifier|\bro\b|water filter/, 'ro'], [/dishwasher/, 'dishwasher'], [/pantry|tall unit|tall cabinet|oven tower|\btall\b|broom unit/, 'tall'], [/\bloft/, 'loft'], [/shelf/, 'shelf'], [/stool/, 'stool'],
  [/wall cabinet|wall unit|upper cabinet/, 'wall-cab'], [/base cabinet|base unit|drawer unit|cabinet/, 'base-cab'], [/island/, 'island']];
const COLOR_WORDS = { white: 0, frosty: 0, ivory: 1, cream: 1, sage: 2, green: 2, navy: 3, blue: 3, graphite: 4, grey: 4, gray: 4, black: 4, terracotta: 5, orange: 5, walnut: 6, brown: 6, oak: 7, wood: 7 };
const PAINT_WORDS = { white: 0, beige: 1, cream: 2, orange: 3, terracotta: 3, rust: 4, red: 4, 'light blue': 5, 'sky': 5, blue: 6, slate: 6, sage: 7, green: 7, grey: 8, gray: 8, taupe: 9, mauve: 10, purple: 10, teal: 11 };

/* ── helpers: quantities, references, directions ── */
function tbQty(s, bareUnit = 'cm') {
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*(cm|centimet\w*|mm|m\b|met(?:er|re)s?|ft|feet|foot|'|in\b|inch(?:es)?|")?/i); if (!m) return null;
  const v = parseFloat(m[1]), u = (m[2] || bareUnit).toLowerCase();
  return /^mm/.test(u) ? v / 10 : /^(m|met)/.test(u) ? v * 100 : /^(ft|feet|foot|')/.test(u) ? v * 30.48 : /^(in|inch|")/.test(u) ? v * 2.54 : v;
}
const tbWall = s => { const m = s.match(/\b(north|south|east|west|back|front|left|right)\b\s*(?:wall|side)/) || s.match(/\b(north|south|east|west)\b/); return m ? WALL_WORD[m[1]] : (s.match(/\b([nesw])\s*wall\b/) || [])[1]?.toUpperCase() || null; };
const tbOrdinal = s => { const m = s.match(/#\s*(\d+)|\b(\d+)(?:st|nd|rd|th)\b|\b(first|second|third|fourth)\b|\b(?:window|door|cabinet|unit|stool)\s+(\d)\b(?!\s*(?:cm|mm|m\b|met|ft|feet|foot|in\b|inch|"|'|%))/); if (!m) return null; return +(m[1] || m[2] || m[4]) || ({ first: 1, second: 2, third: 3, fourth: 4 }[m[3]]); };
function tbFeat(s, kind) {
  const list = S.room.feats.filter(f => !kind || f.kind === kind), w = tbWall(s), n = tbOrdinal(s);
  const cand = w ? list.filter(f => f.wall === w) : list;
  if (n) return list[n - 1] || null; if (cand.length === 1) return cand[0]; if (!cand.length) return null;
  throw new Error(`There are ${cand.length} ${kind}s — say which (e.g. "${kind} on the ${WALL_NAME[cand[0].wall].toLowerCase()}" or "${kind} 2").`);
}
const roleOf = it => { const p = P(it.pid); return p.essential === 'stove' ? 'stove' : p.id; };
function tbUnits(s) { for (const [re, role] of ROLE_WORDS) if (re.test(s)) { if (role === 'island') return { role, list: S.items.filter(i => !i.wall && P(i.pid).counter) }; return { role, list: S.items.filter(i => roleOf(i) === role || (role === 'base-cab' && i.pid === 'base-cab')) }; } return null; }
function tbUnit(s) {
  if (/\b(it|this|that|selected)\b/.test(s) && S.sel) return S.sel;
  const u = tbUnits(s); if (!u) return null; let list = u.list; const w = tbWall(s), n = tbOrdinal(s);
  if (w) list = list.filter(i => i.wall === w); if (n) return list[n - 1] || null; if (list.length === 1) return list[0];
  if (!list.length) throw new Error(`There's no ${u.role.replace('-', ' ')}${w ? ' on the ' + WALL_NAME[w].toLowerCase() : ''}.`);
  if (S.sel && list.includes(S.sel)) return S.sel;
  return list[0];
}
/* +1 = along the wall from its start (N/S: west→east, W/E: north→south); left/right as seen facing that wall from inside */
function tbAlong(wall, s) {
  if (/\b(down|along) the wall\b/.test(s)) return 1; if (/\bup the wall\b/.test(s)) return -1;
  if (/\bright\b/.test(s)) return { N: 1, S: -1, E: 1, W: -1 }[wall]; if (/\bleft\b/.test(s)) return { N: -1, S: 1, E: -1, W: 1 }[wall];
  if (/\beast/.test(s)) return 1; if (/\bwest/.test(s)) return -1; if (/\bsouth/.test(s)) return 1; if (/\bnorth/.test(s)) return -1;
  return null;
}
const refOf = (x, kind) => kind ? `${kind}#${S.room.feats.filter(f => f.kind === kind).indexOf(x) + 1}` : `${roleOf(x)}#${S.items.filter(i => roleOf(i) === roleOf(x)).indexOf(x) + 1}`;

/* ── tier 1: natural text → canonical commands (or null) ── */
/* precise-but-human typing: fix the handful of words the grammar depends on (one edit away), e.g. "rihgt" → "right" */
const TB_WORDS = ['right', 'left', 'north', 'south', 'east', 'west', 'window', 'door', 'wall', 'move', 'room', 'size', 'increase', 'decrease', 'lower', 'raise', 'width', 'depth', 'ceiling', 'fridge', 'sink', 'counter', 'countertop', 'remove', 'bigger', 'smaller'];
const TB_REAL = new Set('with light night eight might sight tight fight bright best rest test nest vest last vast past cast easy tall ball call fall hall mall well will more mode love side site wide lift power tower lover broom roof zoom boom look poor link pink wink sing silk bridge mouth youth sizes sized moved wells walls rooms doors windows sinks lowered raised widths ceilings counters fridges right. left. move. what were wear went want ward word walk wait doom deer dear heat seat neat east. west.'.split(' '));
function tbFix(w) {
  if (w.length < 4 || TB_WORDS.includes(w) || TB_REAL.has(w)) return w;
  const near = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; if (a.length === b.length) { const d = [...a].map((c, i) => c !== b[i] ? i : -1).filter(i => i >= 0); return d.length === 1 || (d.length === 2 && d[1] === d[0] + 1 && a[d[0]] === b[d[1]] && a[d[1]] === b[d[0]]); }
    const [l, sh] = a.length > b.length ? [a, b] : [b, a]; for (let i = 0; i < l.length; i++) if (l.slice(0, i) + l.slice(i + 1) === sh) return true; return false; };
  return TB_WORDS.find(t => near(w, t)) || w;
}
function tbParse(raw) {
  const s = ' ' + raw.toLowerCase().replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().replace(/[a-z]+/g, tbFix) + ' ';
  if (/^\s*(undo|go back|revert)\b/.test(s)) return ['UNDO']; if (/^\s*redo\b/.test(s)) return ['REDO'];
  if (/\b(how much|price|cost|total)\b/.test(s)) return ['ASK price']; if (/\b(warnings?|problems?|checks?|issues?)\b/.test(s) && /\b(any|what|show|list|check)\b/.test(s)) return ['ASK checks'];
  if (/\bhow (big|large)|room size\?|dimensions\?/.test(s)) return ['ASK size'];
  if (/\b(top|plan) view\b|\bfrom above\b/.test(s)) return ['VIEW top']; if (/\bdoll ?house|3d view\b/.test(s)) return ['VIEW dollhouse'];
  if (/\b(look at|view|face|inside)\b.*\bwall\b/.test(s) && tbWall(s)) return ['VIEW inside ' + tbWall(s)];
  if (/\bzoom in\b/.test(s)) return ['ZOOM in']; if (/\bzoom out\b/.test(s)) return ['ZOOM out'];
  if (/\b(show|hide|turn (on|off))\b.*\b(measure|dimension)/.test(s)) return [`MEASURE ${/\b(hide|off)\b/.test(s) ? 'off' : 'on'}`];
  if (/\b(design|generate|redesign|start over|new layout|make me)\b/.test(s) && /\b(kitchen|layout|design|it)\b/.test(s)) return ['DESIGN ' + raw.trim()];
  // style
  const styleHit = (re, key, table) => { if (!re.test(s)) return null; for (const [id, words] of table) if (words.some(w => s.includes(w))) return `STYLE ${key} ${id}`; return null; };
  const st = styleHit(/\b(counter|countertop|worktop|top)\b/, 'counter', [['marble', ['marble', 'statuario']], ['quartz-grey', ['grey quartz', 'gray quartz', 'concrete']], ['quartz-white', ['quartz', 'white']], ['granite-tan', ['tan', 'brown granite']], ['granite-black', ['granite', 'black']], ['oak', ['oak', 'wood']], ['steel', ['steel', 'metal']]])
    || styleHit(/\bhandle/, 'handles', [['gola', ['gola', 'handleless', 'handle-less', 'no handle']], ['knob', ['knob']], ['edge', ['brass', 'edge']], ['bar', ['bar']]])
    || (/\b(tile|tiles|backsplash|splash|dado)\b/.test(s) ? (() => {
      const out = []; const t = TILES.find(t => t.n.toLowerCase().split(' ').some(w => w.length > 3 && s.includes(' ' + w)) || s.includes(t.id)); if (t) out.push('STYLE tile ' + t.id);
      if (/\bno tiles?\b/.test(s)) out.push('STYLE cover none'); else if (/\bdado\b/.test(s)) out.push('STYLE cover dado'); else if (/\bfull|floor to ceiling\b/.test(s)) out.push('STYLE cover full'); else if (/\bbacksplash|splash\b/.test(s) && !t) out.push('STYLE cover splash');
      return out.length ? out.join('\n') : null; })() : null)
    || (/\bfloor(ing)?\b/.test(s) ? (() => { const f = FLOORS.find(f => f.name.toLowerCase().split(/[ -]/).some(w => w.length > 3 && s.includes(w))); return f ? 'STYLE floor ' + f.id : null; })() : null)
    || (/\b(paint|wall colou?r)\b|\bwalls? (in|to)\b/.test(s) && !/\b(move|push|pull)\b/.test(s) ? (() => { const k = Object.keys(PAINT_WORDS).find(w => s.includes(w)); return k != null ? 'STYLE paint ' + PAINT_WORDS[k] : null; })() : null)
    || (/\b(finish|shutters?|cabinets?|kitchen)\b/.test(s) && /\b(make|change|paint|switch|use|in)\b/.test(s) && !tbUnits(s.replace(/cabinets?|kitchen/g, '')) ? (() => { const k = Object.keys(COLOR_WORDS).find(w => new RegExp('\\b' + w + '\\b').test(s)); return k != null ? 'STYLE finish ' + COLOR_WORDS[k] : null; })() : null);
  if (st) return st.split('\n');
  // room size / ceiling / walls
  if (/\bceiling\b/.test(s)) { const q = tbQty(s, 'cm'); if (q == null) return null; return [/\b(raise|higher|up|increase|taller)\b/.test(s) && !/\bto\b/.test(s) ? `ROOM ceiling +${q}` : /\b(lower|down|decrease)\b/.test(s) && !/\bto\b/.test(s) ? `ROOM ceiling -${q}` : `ROOM ceiling ${q > 10 ? q : q * 100}`]; }
  if (/\b(room|kitchen)\b/.test(s) && /(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|m|cm|')?/.test(s)) { const m = s.match(/(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|m|cm|')?/); const u = m[3] || (+m[1] <= 12 ? 'm' : 'cm'); return [`ROOM size ${Math.round(tbQty(m[1] + u))} ${Math.round(tbQty(m[2] + u))}`]; }
  if (/\b(room|kitchen)\b/.test(s) && /\b(bigger|larger|increase|grow|expand|smaller|shrink|decrease|reduce|wider|narrower|deeper|shallower|longer|shorter)\b/.test(s)) {
    const q = tbQty(s) ?? 30, neg = /\b(smaller|shrink|decrease|reduce|narrower|shallower|shorter)\b/.test(s) ? -1 : 1;
    if (/\b(wider|narrower|width)\b/.test(s)) return [`ROOM width ${neg > 0 ? '+' : '-'}${q}`]; if (/\b(deeper|shallower|depth|longer|shorter)\b/.test(s)) return [`ROOM depth ${neg > 0 ? '+' : '-'}${q}`];
    return [`ROOM width ${neg > 0 ? '+' : '-'}${q}`, `ROOM depth ${neg > 0 ? '+' : '-'}${q}`];
  }
  if (/\b(room|kitchen)?\s*(width|depth)\b/.test(s) && /\d/.test(s) && !/\b(window|door)\b/.test(s)) { const q = tbQty(s, 'cm'); return [`ROOM ${/width/.test(s) ? 'width' : 'depth'} ${/\bby\b/.test(s) || /[+-]\s*\d/.test(s) ? (/-\s*\d|\b(reduce|decrease|less)\b/.test(s) ? '-' : '+') : ''}${Math.abs(q)}`]; }
  if (/\bwall\b/.test(s) && /\b(move|push|pull|shift|slide|extend)\b/.test(s) && !/\b(window|door|cabinet|unit)\b/.test(s)) {
    let w = tbWall(s); const q = tbQty(s) ?? 30;
    const dir = /\bright\b/.test(s) ? 'E' : /\bleft\b/.test(s) ? 'W' : /\b(back|north|up)\b/.test(s) ? 'N' : /\b(forward|south|down)\b/.test(s) ? 'S' : null;
    if (!w) w = dir; if (!w) return null;
    const out = { N: 'N', S: 'S', E: 'E', W: 'W' }[w], outward = dir ? (dir === out) : !/\b(in|inward|pull)\b/.test(s);
    return [`WALL ${w} ${outward ? '+' : '-'}${q}`];
  }
  // openings
  for (const kind of ['window', 'door']) {
    if (!new RegExp('\\b' + kind + 's?\\b').test(s)) continue;
    if (/\b(add|new|another|put a|insert)\b/.test(s)) { const w = tbWall(s); if (!w) return null; const q = tbQty(s.replace(/\b\d+(st|nd|rd|th)\b/, '')); return [`OPEN add ${kind} ${w} ${q != null ? Math.round(q) : 'mid'}${/\bdouble\b/.test(s) ? ' double' : ''}`]; }
    const f = tbFeat(s, kind); if (!f) return null; const ref = refOf(f, kind);
    if (/\b(remove|delete|close up|get rid)\b/.test(s)) return [`OPEN ${ref} remove`];
    if (/\b(wider|narrower|width|bigger|smaller)\b/.test(s)) { const q = tbQty(s) ?? 20; return [/\bwidth\b/.test(s) && /\bto\b|\d+\s*(cm|m)\s*wide/.test(s) ? `OPEN ${ref} width ${q}` : `OPEN ${ref} width ${/\b(narrower|smaller)\b/.test(s) ? '-' : '+'}${q}`]; }
    const toWall = s.match(/\b(?:to|onto|on) (?:the )?(north|south|east|west|back|front|left|right) (?:wall|side)/);
    if (toWall && /\b(move|put|place|shift)\b/.test(s)) { const q = s.match(/\bat (-?\d+(?:\.\d+)?\s*\w*)/); return [`OPEN ${ref} to ${WALL_WORD[toWall[1]]} ${q ? Math.round(tbQty(q[1])) : 'mid'}`]; }
    if (kind === 'window' && /\b(lower|raise|higher|up|down)\b/.test(s) && !/\b(the wall|along)\b/.test(s)) { const q = tbQty(s) ?? 10; return [`OPEN ${ref} sill ${/\b(lower|down)\b/.test(s) ? '-' : '+'}${q}`]; }
    if (/\b(move|shift|slide|push|nudge|put)\b/.test(s)) { const sg = tbAlong(f.wall, s); if (sg == null) return null; const q = tbQty(s) ?? 30; return [`OPEN ${ref} shift ${sg > 0 ? '+' : '-'}${q}`]; }
    return null;
  }
  // units
  if (/\b(add|put|place|insert|include|need|want)\b/.test(s) && tbUnits(s)) {
    const u = tbUnits(s); const pid = { stove: 'hob-unit', island: null }[u.role] ?? u.role; if (!pid || !P(pid)) return null;
    const w = tbWall(s), opts = [];
    if (pid === 'tall') opts.push(/\boven\b/.test(s) ? 'cfg=oven' : /\bbroom\b/.test(s) ? 'cfg=broom' : 'cfg=pantry');
    const wq = s.match(/\b(30|45|60|75|90|120)\s*(cm)?\b/); if (wq && P(pid).opts.some(o => o.key === 'w')) opts.push('w=' + wq[1]);
    const n = Math.min(6, +(s.match(/\b(\d)\s+stools?\b/) || [])[1] || 1);
    return Array.from({ length: n }, () => `UNIT add ${pid}${w ? ' ' + w : ''}${opts.length ? ' ' + opts.join(' ') : ''}`);
  }
  const it = (() => { try { return tbUnit(s); } catch (e) { if (/\b(move|remove|delete|make|rotate|turn|set|change|swap|shift)\b/.test(s)) throw e; return null; } })();
  if (it) {
    const ref = refOf(it), p = P(it.pid);
    if (/\b(remove|delete|get rid|take out|drop)\b/.test(s)) return [`UNIT ${ref} remove`];
    if (/\b(rotate|turn)\b/.test(s)) { const q = tbQty(s, 'deg'); return [`UNIT ${ref} rotate ${/\b(around|180)\b/.test(s) ? 180 : q != null ? q : 90}`]; }
    const toWall = s.match(/\b(?:to|onto|on|against) (?:the )?(north|south|east|west|back|front|left|right) (?:wall|side)/);
    if (toWall) return [`UNIT ${ref} to ${WALL_WORD[toWall[1]]}`];
    if (/\b(move|shift|slide|push|nudge)\b/.test(s)) {
      const q = tbQty(s) ?? 30;
      if (it.wall) { const sg = tbAlong(it.wall, s); if (sg == null) return null; return [`UNIT ${ref} shift ${sg > 0 ? '+' : '-'}${q}`]; }
      const dx = /\bright|east\b/.test(s) ? q : /\bleft|west\b/.test(s) ? -q : 0, dz = /\b(down|forward|south|toward me)\b/.test(s) ? q : /\b(up|back|north|away)\b/.test(s) ? -q : 0;
      if (!dx && !dz) return null; return [`UNIT ${ref} move ${Math.round(dx)} ${Math.round(dz)}`];
    }
    const out = [];
    const wq = s.match(/\b(30|45|60|75|90|120)\s*(cm)?\b/); if (wq && p.opts.some(o => o.key === 'w')) out.push(`UNIT ${ref} set w ${wq[1]}`);
    const bq = s.match(/\b([2-5])[ -]?burners?\b/); if (bq && p.opts.some(o => o.key === 'burners')) out.push(`UNIT ${ref} set burners ${bq[1]}`);
    for (const o of p.opts) for (const [v, lab] of o.values) { if (o.key === 'w' || o.key === 'burners') continue; const words = lab.toLowerCase().split(/[ ,+]+/).filter(x => x.length > 3); if (typeof v === 'string' && (s.includes(' ' + v + ' ') || (words.length && words.every(x => s.includes(x))))) out.push(`UNIT ${ref} set ${o.key} ${v}`); }
    const vi = p.variants.findIndex(v => v.n.toLowerCase().split(/[ -]/).some(w => w.length > 3 && new RegExp('\\b' + w + '\\b').test(s)));
    if (vi >= 0 && /\b(make|colour|color|finish|in|change)\b/.test(s)) out.push(`UNIT ${ref} finish ${vi}`);
    if (out.length) return [...new Set(out)];
  }
  return null;
}

/* ── tier 2: Claude translates anything else into canonical commands ── */
function tbSystem() {
  return `You translate a homeowner's message into commands for a kitchen planner. Output ONLY command lines, one per line. If the message is not about changing or viewing this kitchen, or cannot be expressed with these commands, output: NONE <short reason>.

Commands (cm; walls N E S W; positions along a wall are measured from its start: N/S from the west end, W/E from the north end):
ROOM width <cm|+cm|-cm> · ROOM depth <...> · ROOM ceiling <...> · ROOM size <width> <depth>
WALL <N|E|S|W> <+cm outward|-cm inward>
OPEN <ref> shift <±cm along the wall> · OPEN <ref> to <wall> <cm|mid> · OPEN <ref> sill <±cm> · OPEN <ref> width <cm|±cm> · OPEN <ref> remove
OPEN add <window|door> <wall> <cm|mid> [double]
UNIT <ref> shift <±cm along its wall> · UNIT <ref> move <dx cm east> <dz cm south> · UNIT <ref> to <wall> [<cm>] · UNIT <ref> rotate <deg> · UNIT <ref> remove
UNIT <ref> set <option> <value> · UNIT <ref> finish <index>
UNIT add <product> [<wall>] [w=<cm>] [<option>=<value>]
STYLE counter|handles|tile|cover|floor <id> · STYLE finish <0-7> · STYLE paint <0-11>
VIEW top|dollhouse|inside <wall> · ZOOM in|out · MEASURE on|off · UNDO · REDO · ASK price|size|checks
DESIGN <brief>   (only when the user asks for a whole new kitchen)

Products: ${PRODUCTS.map(p => p.id).join(' ')}. Options: ${PRODUCTS.filter(p => p.opts.length).map(p => `${p.id}(${p.opts.map(o => o.key + ':' + o.values.map(v => v[0]).join('/')).join(' ')})`).join(' ')}.
Style ids — counter: ${COUNTERS.map(c => c.id).join(' ')}; handles: ${HANDLES.map(h => h[0]).join(' ')}; tile: ${TILES.map(t => t.id).join(' ')}; cover: ${TILE_COVER.map(t => t[0]).join(' ')}; floor: ${FLOORS.map(f => f.id + '=' + f.name.toLowerCase()).join(', ')}; finish: ${FINISHES.map((f, i) => i + '=' + f.n.toLowerCase()).join(', ')}.
"left/right" of something on a wall = as seen facing that wall from inside the room (N wall: right = +; S: right = −; E: right = +; W: right = −).`;
}
function tbScene() {
  const R = S.room, W = Math.round((R.x1 - R.x0) * 100), D = Math.round((R.z1 - R.z0) * 100);
  const feats = R.feats.map(f => `${refOf(f, f.kind)} ${f.wall} centre ${Math.round(f.u * 100)} width ${Math.round(f.w * 100)}${f.kind === 'window' ? ' sill ' + Math.round((f.sill || 0) * 100) : ''}`).join('; ');
  const units = S.items.map(it => { const sh = shapeOf(it); if (it.wall) { const ax = alongAxis(it.wall), b = ax === 'x' ? R.x0 : R.z0, [a0, a1] = alongOf(sh, ax); return `${refOf(it)} ${it.wall} ${Math.round((a0 - b) * 100)}-${Math.round((a1 - b) * 100)}`; } return `${refOf(it)} free at ${Math.round((it.x - R.x0) * 100)},${Math.round((it.z - R.z0) * 100)}`; }).join('; ');
  return `Room ${W}×${D}, ceiling ${Math.round(R.h * 100)}. Openings: ${feats || 'none'}. Units: ${units || 'none'}.${S.sel ? ' Selected: ' + refOf(S.sel) + '.' : ''}`;
}

/* ── tier 3: execute canonical commands ── */
function tbRef(ref) {
  const m = String(ref).match(/^([a-z-]+)#(\d+)$/); if (!m) throw new Error(`Unknown reference "${ref}".`);
  if (m[1] === 'window' || m[1] === 'door') { const f = S.room.feats.filter(f => f.kind === m[1])[+m[2] - 1]; if (!f) throw new Error(`There's no ${m[1]} ${m[2]}.`); return { feat: f }; }
  const it = S.items.filter(i => roleOf(i) === m[1])[+m[2] - 1]; if (!it) throw new Error(`There's no ${m[1].replace('-', ' ')} ${m[2]}.`); return { item: it };
}
const rel = (cur, v) => /^[+-]/.test(v) ? cur + parseFloat(v) : parseFloat(v);
const nm = it => P(it.pid).name.toLowerCase();
function tbFeatFits(f, L) { if (f.u - f.w / 2 < .05 || f.u + f.w / 2 > L - .05) throw new Error(`That would push the ${f.kind} past the end of the wall.`); if (S.room.feats.some(g => g !== f && g.wall === f.wall && Math.abs(g.u - f.u) < (g.w + f.w) / 2 + .02)) throw new Error(`That would overlap another opening on the ${WALL_NAME[f.wall].toLowerCase()}.`); }
function tbExec(cmd) {
  const t = cmd.trim().split(/\s+/), op = (t[0] || '').toUpperCase(), R = S.room;
  if (op === 'NONE') { const e = new Error(t.slice(1).join(' ')); e.none = true; throw e; }
  if (op === 'ASK') { if (t[1] === 'price') return `The kitchen comes to ${priceHTML(totalPrice()).replace(/<[^>]+>/g, '')} for ${S.items.length} units.`; if (t[1] === 'size') return `The room is ${fmtLen(R.x1 - R.x0)} × ${fmtLen(R.z1 - R.z0)}, ceiling ${fmtLen(R.h)}.`; return warnCache.length ? 'Needs attention: ' + warnCache.map(w => w.text).join(' ') : 'All kitchen checks pass.'; }
  if (op === 'VIEW') { if (t[1] === 'inside') { S.insideWall = WALLS.includes(t[2]) ? t[2] : 'N'; CAM.yaw = 0; CAM.pitch = 0; setView('inside'); } else setView(t[1] === 'top' ? 'top' : 'dollhouse'); return `Switched to ${t[1] === 'inside' ? 'looking at the ' + WALL_NAME[S.insideWall].toLowerCase() : t[1] + ' view'}.`; }
  if (op === 'ZOOM') { zoomBy(t[1] === 'out' ? -1 : 1); zoomBy(t[1] === 'out' ? -1 : 1); return `Zoomed ${t[1]}.`; }
  if (op === 'MEASURE') { const on = t[1] !== 'off'; S.measure.room = S.measure.prod = on; positionOverlay(); markDirty(); return `Measurements ${on ? 'on' : 'off'}.`; }
  if (op === 'STYLE') {
    const k = t[1], v = t[2], stl = Object.assign(styleOf(), {});
    if (k === 'finish') { const i = clamp(parseInt(v, 10), 0, FINISHES.length - 1); R.fin = i; S.items.forEach(it => { if (P(it.pid).variants[0].fin) it.v = i; }); TH.cache.clear(); restyle(); return `Cabinet finish → ${FINISHES[i].n}.`; }
    if (k === 'paint') { const i = clamp(parseInt(v, 10), 0, WALL_COLORS.length - 1); R.wall = WALL_COLORS[i]; restyle(); return 'Wall paint changed.'; }
    if (k === 'floor') { const f = FLOORS.find(f => f.id === v); if (!f) throw new Error(`Unknown floor "${v}".`); R.floor = f.id; restyle(); return `Floor → ${f.name}.`; }
    const map = { counter: ['counter', COUNTERS.map(c => c.id), id => COUNTER(id).n], handles: ['handle', HANDLES.map(h => h[0]), id => HANDLES.find(h => h[0] === id)[1]], tile: ['tile', TILES.map(t => t.id), id => TILE(id).n], cover: ['tileCover', TILE_COVER.map(t => t[0]), id => TILE_COVER.find(t => t[0] === id)[1]] }[k];
    if (!map || !map[1].includes(v)) throw new Error(`Unknown ${k} "${v}".`);
    stl[map[0]] = v; R.style = stl; TH.cache.clear(); restyle(); return `${k[0].toUpperCase() + k.slice(1)} → ${map[2](v)}.`;
  }
  if (op === 'ROOM' || op === 'WALL') {
    const W0 = R.x1 - R.x0, D0 = R.z1 - R.z0; let dW = 0, dD = 0, side = { W: 'E', D: 'S' };
    if (op === 'ROOM') {
      if (t[1] === 'ceiling') { R.h = clamp(rel(R.h * 100, t[2]) / 100, 2.3, 3.8); buildRoom(); return `Ceiling → ${fmtLen(R.h)}.`; }
      if (t[1] === 'size') { dW = clamp(+t[2] / 100, 1.8, 12) - W0; dD = clamp(+t[3] / 100, 1.5, 12) - D0; }
      else if (t[1] === 'width') dW = clamp(rel(W0 * 100, t[2]) / 100, 1.8, 12) - W0; else if (t[1] === 'depth') dD = clamp(rel(D0 * 100, t[2]) / 100, 1.5, 12) - D0; else throw new Error('Unknown room command.');
    } else {
      const w = t[1], d = parseFloat(t[2]) / 100; if (!WALLS.includes(w) || !isFinite(d)) throw new Error('Unknown wall command.');
      if (w === 'E' || w === 'W') { dW = clamp(W0 + d, 1.8, 12) - W0; side.W = w; } else { dD = clamp(D0 + d, 1.5, 12) - D0; side.D = w; }
    }
    if (side.W === 'W') { R.x0 -= dW; R.feats.forEach(f => { if (f.wall === 'N' || f.wall === 'S') f.u += dW; }); } else R.x1 += dW;
    if (side.D === 'N') { R.z0 -= dD; R.feats.forEach(f => { if (f.wall === 'W' || f.wall === 'E') f.u += dD; }); } else R.z1 += dD;
    R.feats.forEach(f => { const L = wallLen(f.wall); f.u = clamp(f.u, f.w / 2 + .05, L - f.w / 2 - .05); });
    reflowItems(); buildRoom(); fitCamera(); updateCamera();
    return `Room is now ${fmtLen(R.x1 - R.x0)} × ${fmtLen(R.z1 - R.z0)}${op === 'WALL' ? ` (moved the ${WALL_NAME[t[1]].toLowerCase()} ${Math.abs(parseFloat(t[2]))} cm ${parseFloat(t[2]) > 0 ? 'out' : 'in'})` : ''}.`;
  }
  if (op === 'OPEN') {
    if (t[1] === 'add') {
      const kind = t[2], wall = t[3]; if (!['window', 'door'].includes(kind) || !WALLS.includes(wall)) throw new Error('Say which wall the new opening goes on.');
      const f = feat(wall, kind === 'door' ? 'single' : (t.includes('double') ? 'w2' : 'w1'), 0), L = wallLen(wall); f.u = t[4] && t[4] !== 'mid' ? +t[4] / 100 : L / 2; tbFeatFits(f, L);
      R.feats.push(f); buildRoom(); return `Added a ${kind} on the ${WALL_NAME[wall].toLowerCase()}, centred ${Math.round(f.u * 100)} cm from its start.`;
    }
    const { feat: f } = tbRef(t[1]); if (!f) throw new Error('That is not a door or window.'); const L = wallLen(f.wall), before = JSON.stringify(f);
    try {
      if (t[2] === 'remove') { if (f.kind === 'door' && R.feats.filter(g => g.kind === 'door').length < 2) throw new Error('A kitchen needs at least one door.'); R.feats.splice(R.feats.indexOf(f), 1); buildRoom(); return `Removed the ${f.kind} on the ${WALL_NAME[f.wall].toLowerCase()}.`; }
      if (t[2] === 'shift') { f.u += parseFloat(t[3]) / 100; tbFeatFits(f, L); buildRoom(); return `Moved the ${f.kind} ${Math.abs(parseFloat(t[3]))} cm along the ${WALL_NAME[f.wall].toLowerCase()} — centre now ${Math.round(f.u * 100)} cm from its start.`; }
      if (t[2] === 'to') { if (!WALLS.includes(t[3])) throw new Error('Unknown wall.'); f.wall = t[3]; const L2 = wallLen(f.wall); f.u = t[4] && t[4] !== 'mid' ? +t[4] / 100 : L2 / 2; tbFeatFits(f, L2); buildRoom(); return `Moved the ${f.kind} to the ${WALL_NAME[f.wall].toLowerCase()}.`; }
      if (t[2] === 'sill') { if (f.kind !== 'window') throw new Error('Only windows have a sill.'); f.sill = clamp((f.sill * 100 + parseFloat(t[3])) / 100, .3, R.h - f.h - .1); buildRoom(); return `Window sill now ${Math.round(f.sill * 100)} cm above the floor.`; }
      if (t[2] === 'width') { f.w = clamp(rel(f.w * 100, t[3]) / 100, .5, Math.min(3, L - .2)); tbFeatFits(f, L); buildRoom(); return `The ${f.kind} is now ${Math.round(f.w * 100)} cm wide.`; }
    } catch (e) { Object.assign(f, JSON.parse(before)); buildRoom(); throw e; }
    throw new Error('Unknown opening command.');
  }
  if (op === 'UNIT') {
    if (t[1] === 'add') {
      const pid = t[2]; if (!P(pid)) throw new Error(`Unknown product "${pid}".`);
      const cfg = {}; let wall = null; t.slice(3).forEach(x => { if (WALLS.includes(x)) wall = x; const kv = x.split('='); if (kv.length === 2) cfg[kv[0]] = isNaN(+kv[1]) ? kv[1] : +kv[1]; });
      const it = addItem(pid, { cfg, silent: true }); if (!it) throw new Error(`No free space for the ${P(pid).name.toLowerCase()}.`);
      if (wall && it.wall !== wall && (P(pid).mount !== 'counter')) moveToWall(it, wall);
      afterChange({ quiet: true }); return `Added a ${P(pid).name.toLowerCase()}${it.wall ? ' on the ' + WALL_NAME[it.wall].toLowerCase() : ''}.`;
    }
    const { item: it } = tbRef(t[1]); if (!it) throw new Error('That is not a unit.');
    if (t[2] === 'remove') { removeItem(it); return `Removed the ${nm(it)}.`; }
    if (t[2] === 'rotate') { if (!setRotation(it, it.rot + parseFloat(t[3] || 90))) throw new Error(`The ${nm(it)} can't turn there — it would hit something.`); return `Rotated the ${nm(it)} ${parseFloat(t[3] || 90)}°.`; }
    if (t[2] === 'finish') { const i = parseInt(t[3], 10); if (!P(it.pid).variants[i]) throw new Error('Unknown finish.'); setVariant(it, i); return `The ${nm(it)} is now ${P(it.pid).variants[i].n}.`; }
    if (t[2] === 'set') { const o = P(it.pid).opts.find(o => o.key === t[3]); if (!o) throw new Error(`The ${nm(it)} has no "${t[3]}" option.`); const v = o.values.find(v => String(v[0]) === t[4]); if (!v) throw new Error(`"${t[4]}" isn't available for the ${nm(it)}.`); const old = JSON.stringify(it.cfg); setCfg(it, o.key, v[0]); if (JSON.stringify(it.cfg) === old && it.cfg[o.key] !== v[0]) throw new Error('Not enough room for that here.'); return `The ${nm(it)} → ${o.label.toLowerCase()} ${v[1]}.`; }
    if (t[2] === 'to') { if (!WALLS.includes(t[3])) throw new Error('Unknown wall.'); moveToWall(it, t[3]); if (t[4]) { const d = shapeOf(it), ax = alongAxis(t[3]), b = ax === 'x' ? R.x0 : R.z0, sh = wallPlace(it, t[3], b + +t[4] / 100 + (ax === 'x' ? d.hw : d.hd)); if (!collides(sh, it)) { applyShape(it, sh); syncNode(it); afterChange({ quiet: true }); } } return `Moved the ${nm(it)} to the ${WALL_NAME[t[3]].toLowerCase()}.`; }
    if (t[2] === 'shift') { if (!it.wall) throw new Error(`The ${nm(it)} isn't on a wall — say "move it left/right".`); const x0 = it.x, z0 = it.z; nudge(it, alongAxis(it.wall) === 'x' ? parseFloat(t[3]) / 100 : 0, alongAxis(it.wall) === 'z' ? parseFloat(t[3]) / 100 : 0); if (it.x === x0 && it.z === z0) { const nb = tbSwap(it, Math.sign(parseFloat(t[3]))); if (nb) return `Swapped the ${nm(it)} with the ${nm(nb)} next to it.`; throw new Error(`The ${nm(it)} can't move there — something is in the way.`); } return `Moved the ${nm(it)} ${Math.abs(parseFloat(t[3]))} cm along the ${WALL_NAME[it.wall].toLowerCase()}.`; }
    if (t[2] === 'move') { const x0 = it.x, z0 = it.z; nudge(it, parseFloat(t[3]) / 100, parseFloat(t[4] || 0) / 100); if (it.x === x0 && it.z === z0) throw new Error(`The ${nm(it)} can't move there — something is in the way.`); return `Moved the ${nm(it)}.`; }
    throw new Error('Unknown unit command.');
  }
  if (op === 'UNDO' || op === 'REDO') { const from = op === 'UNDO' ? TB.undo : TB.redo, to = op === 'UNDO' ? TB.redo : TB.undo; if (!from.length) throw new Error(`Nothing to ${op.toLowerCase()}.`); to.push(JSON.stringify(currentDoc())); tbRestore(JSON.parse(from.pop())); return op === 'UNDO' ? 'Undone.' : 'Redone.'; }
  throw new Error(`Unknown command "${op}".`);
}
/* "move the fridge left" in a packed run means "swap it with its neighbour": exchange two touching floor units on the same
   wall, carrying the wall cabinets / chimney / loft above each one along with it */
function tbSwap(it, sign) {
  if (!it.wall || !sign) return null; const ax = alongAxis(it.wall), s = shapeOf(it), [lo, hi] = alongOf(s, ax);
  const nb = S.items.filter(o => o !== it && o.wall === it.wall && vOverlap(s, shapeOf(o))).map(o => ({ o, r: alongOf(shapeOf(o), ax) }))
    .find(x => sign > 0 ? Math.abs(x.r[0] - hi) < .03 : Math.abs(x.r[1] - lo) < .03);
  if (!nb) return null;
  const tops = (u, [l, r]) => S.items.filter(o => o !== it && o !== nb.o && o.wall === u.wall && !vOverlap(shapeOf(u), shapeOf(o)) && (([a0, a1]) => a0 >= l - .02 && a1 <= r + .02)(alongOf(shapeOf(o), ax)));
  const start = Math.min(lo, nb.r[0]), wIt = hi - lo, wNb = nb.r[1] - nb.r[0];
  const dIt = sign > 0 ? start + wNb - lo : start - lo, dNb = sign > 0 ? start - nb.r[0] : start + wIt - nb.r[0];
  const moves = [it, ...tops(it, [lo, hi])].map(o => [o, dIt]).concat([nb.o, ...tops(nb.o, nb.r)].map(o => [o, dNb]));
  const moved = moves.map(m => m[0]), shapes = moves.map(([o, d]) => wallPlace(o, o.wall, (ax === 'x' ? o.x : o.z) + d));
  if (shapes.some((sh, i) => collides(sh, moved[i], moved) || (P(moved[i].pid).mount === 'floor' && featureHit(sh, true)) || shapes.some((o, j) => j !== i && overlaps(sh, o)))) return null;
  moves.forEach(([o], i) => { applyShape(o, shapes[i]); syncNode(o); }); afterChange({ keepPanel: true, quiet: true }); return nb.o;
}
function tbRestore(doc) { const view = S.view, cam = Object.assign({}, CAM); startDesign(doc); S.view = view; Object.assign(CAM, cam); updateCamera(); renderBottomBar(); markDirty(); }

/* ── the loop: parse → (Claude) → execute → receipts ── */
async function tbSubmit(text) {
  text = text.trim(); if (!text || TB.busy) return;
  if (TB.log[TB.log.length - 1] !== text) { TB.log.push(text); if (TB.log.length > 50) TB.log.shift(); }
  tbSay('user', text);
  let cmds = null, via = 'grammar';
  try { cmds = tbParse(text); } catch (e) { return tbSay('bot', e.message, 'bad'); }
  if (!cmds && aiReady() && aiMode() !== 'manual') {
    TB.busy = true; const pend = tbSay('bot', 'Interpreting with Claude…', 'pending'); const t0 = Date.now();
    try { const out = await aiText(tbSystem(), `${tbScene()}\n\nMessage: ${text}`, null, { effort: 'low', maxTokens: 400 }); cmds = out.split(/\r?\n/).map(l => l.replace(/^[-*\d.)\s]+/, '').trim()).filter(l => /^[A-Z]{3,}/.test(l)); via = `Claude, ${((Date.now() - t0) / 1000).toFixed(0)} s`; }
    catch (e) { pend.remove(); TB.busy = false; return tbSay('bot', aiErrorText(e), 'bad'); }
    pend.remove(); TB.busy = false;
  }
  if (!cmds || !cmds.length || (cmds.length === 1 && /^NONE\b/.test(cmds[0]))) {
    const why = cmds && cmds[0] ? cmds[0].replace(/^NONE\s*/, '') : '';
    return tbSay('bot', 'Doesn’t look like anything to me.' + (why ? ` (${why})` : ''), 'none', ['move the window 30 cm left', 'make the room 330 by 280', 'countertop marble', 'add a microwave']);
  }
  const design = cmds.find(c => /^DESIGN\b/.test(c));
  if (design) return tbDesign(design.replace(/^DESIGN\s*/, '') || text);
  const mutates = cmds.some(c => !/^(UNDO|REDO|ASK|VIEW|ZOOM|MEASURE|NONE)\b/.test(c)), before = mutates ? JSON.stringify(currentDoc()) : null;
  const done = [], failed = [];
  for (const c of cmds) { try { done.push(tbExec(c)); } catch (e) { failed.push(e.none ? 'Doesn’t look like anything to me.' : e.message); } }
  if (mutates && done.length) { TB.undo.push(before); TB.redo = []; if (TB.undo.length > 30) TB.undo.shift(); }
  afterChange({ quiet: true, keepPanel: !S.sel });
  tbSay('bot', [...done.map(x => '✓ ' + x), ...failed.map(x => '✗ ' + x)].join('\n'), failed.length && !done.length ? 'bad' : '', null, via, cmds);
}
async function tbDesign(brief) {
  if (!aiReady()) return tbSay('bot', 'Connect Claude in AI settings to generate a new design.', 'bad');
  TB.busy = true; const pend = tbSay('bot', 'Designing a new kitchen for this room…', 'pending'), t0 = Date.now(), R = S.room;
  const room = `Room: ${Math.round((R.x1 - R.x0) * 100)}×${Math.round((R.z1 - R.z0) * 100)} cm, ceiling ${Math.round(R.h * 100)}. Keep these openings: ${R.feats.map(f => `${f.kind.toUpperCase()} ${f.wall} ${Math.round(f.u * 100)}${f.style === 'w2' ? ' double' : ''}`).join(', ') || 'none'}.`;
  try {
    const text = await aiText(kdlSystem(), `${room}\nRequest: ${brief}`, null, { effort: 'low', maxTokens: 1500 }), doc = kdlToDoc(text, {});
    TB.undo.push(JSON.stringify(currentDoc())); doc.id = S.designId; tbRestore(doc); S.tab = 'ai'; renderPanel(); queueSave();
    pend.remove(); tbSay('bot', `✓ New design “${doc.title}” in ${((Date.now() - t0) / 1000).toFixed(0)} s. Say “undo” to go back.`);
  } catch (e) { pend.remove(); tbSay('bot', aiErrorText(e), 'bad'); }
  TB.busy = false;
}

/* ── UI: a dock over the 3D view ── */
function tbSay(who, text, cls = '', chips, via, cmds) {
  const log = $('#tb-log'); if (!log) return h('div');
  const el = h('div', { class: `tb-msg ${who} ${cls}` }, h('div', { class: 'tb-text' }, text));
  if (via || cmds) el.append(h('div', { class: 'tb-meta' }, via ? `via ${via}` : '', cmds ? h('code', { title: 'Commands that ran' }, cmds.join(' · ')) : null));
  if (chips) el.append(h('div', { class: 'tb-chips' }, chips.map(c => h('button', { class: 'pillf sm', onclick: () => { $('#tb-input').value = c; $('#tb-input').focus(); } }, c))));
  log.append(el); while (log.children.length > 12) log.firstChild.remove(); log.scrollTop = log.scrollHeight; $('#textbot').classList.add('open'); return el;
}
function initTextbot() {
  const dock = h('form', { id: 'textbot', class: 'textbot', role: 'region', 'aria-label': 'Text commands', onsubmit: e => { e.preventDefault(); const i = $('#tb-input'); const v = i.value; i.value = ''; tbSubmit(v); } },
    h('div', { id: 'tb-log', class: 'tb-log', 'aria-live': 'polite' }),
    h('div', { class: 'tb-bar' }, h('button', { type: 'button', class: 'tb-toggle', 'aria-label': 'Show or hide the conversation', onclick: () => $('#textbot').classList.toggle('open'), html: ico('list', 18) }),
      h('input', { id: 'tb-input', class: 'tb-input', autocomplete: 'off', enterkeyhint: 'send', placeholder: 'Type a command — “move the window 50 cm left”, “room 12x10 ft”, “add a tall pantry”', 'aria-label': 'Type a command' }),
      h('button', { type: 'submit', class: 'tb-send', 'aria-label': 'Send', html: ico('arrow', 18) })));
  $('#view').append(dock);
  dock.addEventListener('pointerdown', e => e.stopPropagation());
  // ↑ / ↓ walk back through what you typed (precise commands are often repeated with a new number)
  let hi = -1; $('#tb-input').addEventListener('keydown', e => {
    const past = TB.log; if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') { if (e.key.length === 1) hi = -1; return; } if (!past.length) return;
    e.preventDefault(); hi = e.key === 'ArrowUp' ? Math.min(past.length - 1, hi + 1) : Math.max(-1, hi - 1); e.target.value = hi < 0 ? '' : past[past.length - 1 - hi];
  });
  document.addEventListener('keydown', e => { if (e.key === '/' && S.route === 'designer' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#tb-input').focus(); } });
}

/* ═══════════════ 12 · wiring ═══════════════ */
function init() {
  S.units = store.get('units', 'ft');
  hydrateIcons(document); installSprings(); initGL(); bindCanvas(); bindRotate(); initTextbot();
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
  $('#open-saved').onclick = e => openSaved(e.currentTarget); $('#open-collection').onclick = e => openCollection(e.currentTarget);
  $('#hdr-ai').onclick = () => showAISettings(() => { updateClaudePill(); if (S.route !== 'hub') renderPanel(true); });
  if (!store.get('cookies', false)) { $('#cookie').hidden = false; $('#cookie-ok').onclick = () => { store.set('cookies', true); $('#cookie').hidden = true; };  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', saveNow);
  updateBagCount(); route();
  window.__interio = { S, CAM, GL, AI, TB, addItem, select, enterEdit, setView, PRODUCTS, P, refreshWarnings, computeWarnings, shapeOf, priceOf, realizeDesign, parseKDL, realizeKDL, kdlSystem, kdlBrief, kdlToDoc, tbParse, tbExec, tbSubmit, tbSystem, tbScene, overlaps, featureHit, kdlRefit, composeFromCollection, fitRun }; // handy for debugging
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
