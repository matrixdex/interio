# Interio Kreativ — room designer (recreation of `findings.md`)

A single-page 3D room designer in plain HTML + CSS + JS. No build step, no server needed:
open `app/index.html` directly in a browser (WebGL required).

```
app/
├── index.html          page shell (hub + designer chrome)
├── styles.css          all styling
├── app.js              the whole SPA (state, 3D scene, UI, hub, routing)
└── vendor/three.min.js three.js r152 classic build (MIT) — the only dependency
```

## What it covers (mapped to `findings.md`)

| Spec section | Implemented |
|---|---|
| §2 layout | Left panel (Add / List / Favorites) + 3D canvas, design header, floating zoom, bottom bar, safety-warnings drawer |
| §3 routes | `#templateId/designId` hash; hub at `#`; design snapshots stored in `localStorage` |
| §4.1 Add tab | Search, room-type picker (5 rooms), category pills + "All categories" checkboxes, dismissable pricing notice, product cards with hover "Add to room", toast with **Select it** |
| §4.2 Item options | Variant carousel + swatches, price/rating, Add to bag, how-to-get-it, Size accordion, Swap with similar / Goes well with |
| §4.3 / 4.4 | List tab grouped by category with per-group and "Add all to bag"; Favorites |
| §5 header | Sidebar toggle, editable title, bag, share (copies link), save, live total, Summary, close |
| §6 canvas | Dollhouse (orbit + auto cut-away walls), Top view (pan, dimension labels), Side views strip (4 renders, click to stand inside), Move to wall, Wall colour (13 chips), Measurements (product dimensions / spacing / room dimensions, ft ⇄ m) |
| §6.3 selection | Yellow outline, variant dots, floating pill: Add to bag · Rotate (slider with 0° readout, snaps) · Replace · Goes with · Make copy · Remove. Drag to move with wall clamping + collision; arrow keys nudge, Delete removes |
| §7 Edit room | 3-step wizard: drag walls / ceiling height (undo + redo), 6 door + 2 window styles (select, slide along wall, resize), 12 wall colours + 19 floors; Finish mints a new design id |
| §8 overlays | Cookie banner, feedback modal, pricing notice, summary view, bag |

## Dummy objects & textures

All 31 products are built from primitive shapes (rounded boxes, cylinders, spheres) with
**procedural canvas textures** — no image assets. Each product ships 2–4 finishes that swap
textures: wood grain, plank, herringbone, woven/linen/velvet fabric, leather, brushed metal,
marble, laminate, rattan, plaid, stripes, carpet, concrete, tile, checker and leaf.

Beds (3), wardrobes (2), chests of drawers (2), nightstand, sofas (2), armchair, coffee table,
dining tables (2), chairs, benches, bookcase, toy storage, TV unit, desks, kids chair, rugs (3),
floor lamp, plant, shoe cabinet, console, mirror, coat rack.

## Rooms

Six empty templates (areas match the labels: 172–473 sq.ft), three furnished rooms, and
**Build a room** (starts the Edit-room wizard on a blank 4.5 × 3.8 m room).

Product names and prices are fictional.
