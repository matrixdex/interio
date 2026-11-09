# Sprint 4 — "Fast, touchable, typeable"

**Sprint goal:** a design arrives in ≤ 30 s, not 100 s. The room can be steered by touch, trackpad and typed text.
There is a written design for a textbot meta-application.

## Backlog and outcome

| ID | User story | Points | Status |
|---|---|---|---|
| S4-1 | As a homeowner I see a kitchen design in ≤ 30 s after I submit my brief. | 8 | ✅ Done: 3 designs in **6.7 s** end-to-end (bridge, Claude Code 2.1.112, Opus 4.7). Instant gallery match at **0.6 s**. |
| S4-2 | As a touch/trackpad user I can pinch to zoom, two-finger orbit/pan, and drag doors and windows along walls. | 5 | ✅ Done |
| S4-3 | As a user I can drag a product from the catalogue straight into the room. | 3 | ✅ Done |
| S4-4 | As a user I can type commands ("move wall to the right", "move window 50 cm down the wall") and they are executed. | 8 | ✅ Done: grammar tier, Claude tier, undo and redo |
| S4-5 | As a product owner I have a design for a textbot that works across apps (Interio, ONITO, Slack, Jira). | 5 | ✅ Done: `docs/TEXTBOT.md` |
| S4-6 | Generated designs never lose the sink, hob, chimney or fridge. | 5 | ✅ Done: control layer; 11/11 test designs keep all four |

Velocity: **34 points** committed, 34 done.

## Spikes

- **SPIKE-1 · Where do the 100 s go?**
  - Measured `claude -p` overhead: **≈ 2.4 s** fixed.
  - The rest was model work: about 2.5k tokens of JSON output, medium effort, and 2 turns forced by `--json-schema`.
  - Conclusion: cut what the model has to *generate*, not the transport.
- **SPIKE-2 · Generate less.**
  - Replaced JSON with **KDL**, a Kitchen Design Language of about 10 short lines.
  - Low effort and 3 designs in parallel.
  - Result per design: **≈ 5–10 s**, about 3k input tokens (cached system prompt) and **≈ 190–290 output tokens**.
  - System prompt **≈ 15k → 2.9k characters**.
- **SPIKE-3 · Train or fine-tune a local model** — *rejected*.
  - It needs a training set, GPU time and a serving story.
  - SPIKE-2 already beats the target by 4×, and a gallery of cached designs gives a 0 s first paint.
  - Revisit only if offline use becomes a requirement.

## What was built

1. **KDL + control layer.**
   - Claude writes intent: walls, the order of units and the style.
   - Deterministic code does the geometry:
     - **Run fitter**: excludes door swings, including doors on the neighbouring wall at a corner.
     - Trims cabinet widths, then drops plain cabinets. It never drops the sink, hob or fridge.
     - Moves a sink, hob or fridge that doesn't fit to the next-best wall.
     - Keeps the hob, fridge and tall units out from under windows (shuffle, slide, or move to another wall).
     - Moves an island hob to a wall so it can have a chimney.
     - Automatic chimney, wall cabinets, lofts, appliances and stools.
   - Less to generate means less variance.
2. **Instant designs.**
   - `designs/gallery.js` holds 8 pre-generated kitchens (straight, L, U, parallel, island, compact) stored in the repo.
   - The closest one shows instantly while Claude works.
   - Briefs are cached by hash in the browser.
3. **Control layer for touch and trackpad.**
   - Pointer map: two-finger pinch zoom, twist orbit and pan.
   - Trackpad heuristics: pinch (ctrl+wheel) zooms, two-finger scroll orbits or pans, a mouse wheel zooms.
   - Safari gesture events.
   - Door and window drag in design mode, clamped to neighbours, with a live "cm from the corner" label.
   - Catalogue drag and drop: the `+` handle for touch, the image for mouse or pen.
4. **Textbot** (the dock at the bottom of the 3D view; `/` to focus, ↑ for history).
   - Grammar tier with typo tolerance on its own vocabulary.
   - Claude tier: prompt ≈ 2.7k characters plus a ≈ 0.4k scene summary; outputs commands or `NONE`.
   - Executor with receipts, undo and redo.
   - "Move the fridge left" in a packed run swaps it with its neighbour, carrying the wall cabinets above.
   - Anything else: *"Doesn't look like anything to me."*
5. **Bridge hardening.** Concurrency cap (3 parallel `claude -p`), kill on client disconnect, strips the
   partial-messages env var.

## Demo script (sprint review)

1. Hub → **Instant designs** → open "Sage L Kitchen" (0 s).
2. Type: `move the window 50 cm left` · `move window 50cm down the wall` · `move wall to the right` · `increase room size by 50cm`
   · `lower the window 10 cm` · `countertop marble` · `move the fridge left` · `undo` · `tell me a joke` (refused).
3. Pinch on a trackpad or touch screen; two-finger scroll to orbit. In top view, drag the window along its wall.
4. Drag a sink from the Add tab into the room.
5. Start the bridge (`node bridge/claude-code-bridge.mjs`), set an 11×9 ft brief, then **Design**. The instant match
   appears, then 3 Claude designs at ≈ 6 s.

## Definition of done — evidence

- Playwright end-to-end runs (headless Chromium), with no page errors:
  - hub and gallery;
  - gallery → 3D;
  - 22 textbot commands (grammar);
  - 4 free-text commands through the real bridge (Claude tier, 2.4–5.1 s each);
  - 3-design generation through the real bridge (6.7 s);
  - CDP multi-touch pinch and twist; trackpad wheel orbit and ctrl-wheel zoom;
  - window drag (130 → 157 cm);
  - catalogue drag and drop (+1 unit).
- All 8 gallery designs and 3 earlier test designs re-validated: sink, hob, chimney and fridge present.

## Retrospective

- **Went well:** measuring first (SPIKE-1) pointed at output size, not transport. KDL plus deterministic repair gave
  a 15× speed-up, and the layouts are *better* because the geometry is no longer the model's job.
- **Went badly:**
  - The first gallery batch exposed control-layer gaps: hob under a window, an island hob with no chimney,
    corner-door clashes, and the hob dropped on short walls. They are fixed, but they should have been caught by a
    property test earlier.
  - Synthetic `PointerEvent`s can't be pointer-captured, so the first gesture test gave a false negative.
    Real input (CDP touch, the Playwright mouse) is the rule from now on.
- **Bugs found and fixed in testing:**
  - "window 50 cm" was parsed as "window #50".
  - Undo restored the snapshot it had just taken (a no-op).
  - The drag label was clipped at the canvas edge.
- **Action items:** add a KDL property test (random briefs → invariants); keep the gallery regenerated whenever the
  catalogue changes.

## Next sprint — candidate backlog

- Top view: contrast for white counters on light floors (pre-existing; not a regression).
- Textbot: manifest file extracted from `app.js` (`textbot/interio.yaml`) so the grammar, prompt and help are generated
  from one source, as in `docs/TEXTBOT.md` §1.1.
- ONITO textbot proof of concept (report add/list/predict with attachments) on its Angular frontend.
- Hob ↔ fridge swaps (the chimney and loft collide today; the receipt says so).
- A one-command "re-generate gallery" script (`node tools/gallery.mjs`) using the bridge.
