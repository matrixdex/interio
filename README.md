# Interio Kitchen Planner

A single-page 3D planner for modular Indian kitchens, in plain HTML + CSS + JS (three.js r152
vendored). No build step and no server: open `index.html`, or publish the repo root on
GitHub Pages. WebGL required.

```
./
├── index.html          page shell (hub + planner chrome)
├── styles.css          all styling
├── app.js              the whole SPA (catalogue, 3D scene, placement rules, UI, hub, routing)
├── vendor/three.min.js three.js r152 classic build (MIT) — the only dependency
├── PLAN.md             prototype plan: deterministic core → tools → generative UI
└── arch/               earlier material: findings.md spec of the room designer, screenshots, LICENSE
```

## What it does

- **Start** from 5 kitchen layouts (straight, L, U, parallel, island) or 4 empty kitchens.
  Every kitchen starts with the Indian essentials: **sink, stove and chimney**.
- **Configure every unit**: width, fronts (doors, drawers, glass, lift-up, open, blind corner),
  sink bowl and material, hob burners and built-in oven, chimney size and style, fridge type,
  tall-unit configuration — plus 8 cabinet finishes. Price follows the configuration.
- **Place naturally**: cabinets snap to walls and to each other; wall cabinets, chimney, loft,
  shelves and the RO purifier hang on walls; microwave, OTG, mixer and gas stove sit on the
  counter and ride along when you move the cabinet under them.
- **Finishes** tab: countertop, handles, wall tiles (pattern + backsplash / dado / full),
  floor and wall paint for the whole kitchen.
- **Kitchen checks**: missing essentials, chimney over the stove at 65–75 cm, sink–hob spacing,
  doors/windows blocked, items on the floor, work triangle.
- Dollhouse, top and side views; measurements; Edit room (walls, ceiling, doors, windows) with
  units following their walls; list, bag and summary with configurations; designs saved in the
  browser.

All units and appliances are dummy objects built from primitives with procedural textures;
prices are indicative. See `PLAN.md` for the generative-UI roadmap.
