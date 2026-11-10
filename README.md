# Interio

A 3D studio for modular Indian kitchens in plain HTML + CSS + JS. There's no build step and no server: open
`index.html`, or publish the repo root on GitHub Pages.

On a desktop the app is one screen. On the left is a short brief where every field is optional, with
**Generate AI kitchen design** at the bottom; designs appear on the right, and you click one to open it in 3D.
Saved kitchens, the collection, and two help pages (`how-it-works.html`, `how-to-use.html`) are linked in the footer.

## Free by default

Interio works without any AI connection or paid API:

- **Compose from the collection.** The commission form turns the closest pre-made designs in `designs/gallery.js`
  into your room. The room takes your size, openings scale with it, and the control layer refits every run to the
  new walls. Instant, free, offline.
- **Typed commands** run on a built-in grammar, with no AI.
- **Copy & paste with Claude** (AI settings) works with a free claude.ai account. The planner shows the prompt,
  and you paste the few KDL lines back.
- **Claude Code bridge** uses your own subscription, on your own machine only.

The pre-made collection grows by generating KDL designs once (with your own Claude Code) and committing them. That's
content you publish, not a service other people use through your account.

## Connecting Claude

Open **AI settings** (top right) and pick one of three connections:

1. **Claude Code bridge — use your Claude subscription, no API key.** With Claude Code installed
   and logged in, run from the repo folder:

   ```bash
   node bridge/claude-code-bridge.mjs
   ```

   Keep it running and choose *Claude Code bridge* with URL `http://127.0.0.1:8787`. Each request
   runs `claude -p` headless (no tools, no session) with the app's short system prompt, on the model
   you pick, at low effort; up to 3 run in parallel (`--parallel N`). If you open the planner from a website rather than the local file,
   add its address: `--origin https://<you>.github.io`. If your Claude Code can't run the model you pick
   in the app, choose *Claude Code's default model* there, or start the bridge with a fixed model:
   `--model opus` (alias for the newest Opus your Claude Code knows) or e.g. `--model claude-opus-4-7`. The bridge binds to 127.0.0.1 and is for
   your own use — don't expose it to others. (Windows: run it in WSL.)
2. **API key** — calls the Claude API directly; the key is stored only in that browser.
   For a public site, deploy `proxy/cloudflare-worker.js` and use its URL in the bridge/proxy field.
3. **Copy & paste with Claude** — no setup: the planner shows the exact prompt; send it in claude.ai
   or Claude Code and paste the reply (a few KDL lines) back.

Models newer than your Claude Code supports are listed but disabled. API requests stream, cache the
system prompt and use low effort.

## Speed: why a design takes ~6 s, not 100 s

Claude does not write the scene. It writes **KDL**, a Kitchen Design Language: about 10 lines, ≈ 200 output tokens:

```
NAME Sage L Kitchen
TYPE L-shaped
ROOM 305 274 274
DOOR S 255
WINDOW W 130
STYLE 2 quartz-white gola subway-sage splash f1 curved
RUN N 0: b60.3dr hob75.5 b60.2d b45.1d fridge.double
RUN W 60: sink90.drainer dw60 b45.1d
ADD microwave ro
```

A deterministic **control layer** turns that into geometry:
- It fits each run to its wall, avoiding door swings (including doors on the neighbouring wall at a corner).
- It trims, then drops, plain cabinets. It never drops the sink, hob or fridge; it moves them to the next-best wall instead.
- It keeps the hob, fridge and tall units out from under windows.
- It adds the chimney, wall cabinets, lofts, appliances and stools.

Designs run in parallel and are cached by brief. Measured end-to-end through the bridge (Claude Code 2.1.112,
Opus 4.7): **3 designs in 6.7 s**. See `docs/SPRINT-REVIEW.md`.

**Instant designs:** `designs/gallery.js` holds pre-generated KDL kitchens. They appear on the hub, and the closest
one is shown immediately while Claude works. To add more, generate KDL with the same prompt (AI tab → *Design
source (KDL)* shows the format) and append `{ type, w, d, must, kdl }` entries.

## Typing commands (textbot)

The bar at the bottom of the 3D view runs precise commands instantly and offline. Press `/` to focus it and ↑ for
history. Examples:

- `move the window 50 cm left` · `move window 50cm down the wall` · `lower the window 10 cm`
- `move wall to the right` · `increase room size by 50cm` · `room 12x10 ft` · `raise the ceiling 20 cm`
- `add a tall pantry on the east wall` · `make the hob 90 with 5 burners` · `move the fridge left` · `countertop marble`
- `top view` · `what is the price` · `undo` · `redo`

Anything the grammar doesn't match goes to Claude, if connected, with a tiny prompt. Claude can only answer
with the planner's own commands or `NONE`. Off-topic input gets *"Doesn't look like anything to me."*
Design: `docs/TEXTBOT.md`, which also specifies textbots for ONITO, Slack and Jira.

## Tests

```bash
node tests/kdl-property.test.js 300 1     # 300 random rooms + designs, seed 1
```

Each case generates a random room, door, window and deliberately overfull KDL runs, realizes it in the real app
(headless Chromium via Playwright), and checks:
- the sink, hob and fridge are always placed;
- every hob has a chimney;
- no overlaps, and nothing outside the room or in a doorway.

Current result: sink, fridge, overlaps, bounds and doorways hold in all of 2,400 cases. "Hob without chimney" fails
in about 0.4%, all in rooms whose runs are badly overfilled and whose only free walls are under windows.

## Touch and trackpad

- Pinch to zoom; two fingers to orbit (twist) and pan.
- Trackpad: two-finger scroll orbits (pans in top view); pinch zooms.
- Drag a door or window along its wall, with a live distance label.
- Drag units to move them; drag a catalogue card (or its **+** on touch) into the room.

```
./
├── index.html          page shell (hub + planner chrome)
├── styles.css          all styling
├── app.js              the whole SPA (catalogue, 3D scene, placement rules, UI, hub, routing)
├── vendor/three.min.js three.js r152 classic build (MIT)
├── vendor/anthropic-sdk.min.js  @anthropic-ai/sdk 1.5.0 (MIT), browser bundle
├── bridge/claude-code-bridge.mjs  local bridge: the app → Claude Code (your subscription)
├── how-it-works.html  help page: brief → KDL → control layer → studio
├── how-to-use.html    help page: controls, typing, saving
├── designs/gallery.js  pre-generated KDL kitchens (instant designs)
├── docs/TEXTBOT.md     textbot meta-application design (Interio, ONITO, Slack, Jira)
├── docs/SPRINT-REVIEW.md  sprint 4 review: speed, controls, textbot
├── proxy/cloudflare-worker.js   optional key-holding proxy for public deployments
├── PLAN.md             prototype plan: deterministic core → tools → generative UI
└── arch/               earlier material: findings.md spec of the room designer, screenshots, LICENSE
```

## What it does

- **Describe your kitchen** (size, layout preference, cooking style, household, budget in lakh,
  must-haves, look, doors/windows) → Claude generates 1–3 genuinely different designs: the room,
  openings, every unit with its options and finish, countertop, tiles, floor and paint.
- **Realization**: the control layer places the design with its own collision and door/window rules
  and lists every adjustment it made.
- **AI tab** in the planner: the design's concept, highlights, adjustments and KDL source; "Design
  this room again"; and the textbot for changes — every change can be undone.
- Or start from an empty room and draw it yourself.
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
