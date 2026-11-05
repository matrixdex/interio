# Prototype plan — generative-UI kitchen planner

Goal: a kitchen planner for Indian homes where the 3D room, drag/rotate and the
catalogue stay deterministic, and an AI layer **generates the interface around them**:
briefs, layout proposals, fix-it cards, comparisons, budget tools and the quote.

Principle (from A2UI / json-render / MCP Apps): *the model chooses presentation, never the
facts.* Geometry, collisions, prices, catalogue options and kitchen rules live in app code.
The model can only (a) call validated scene tools and (b) emit UI specs built from a small,
approved component catalogue. Every generated surface has a plain-text fallback.

---

## Phase 0 — Kitchen-only deterministic core ✅ (this commit)

The "truth layer" generative UI will sit on.

- **Kitchen-only planner.** Room types removed; hub offers 5 layouts (straight, L, U,
  parallel, island) and 4 empty kitchens. Every template starts with the three Indian
  essentials: **sink, stove (hob unit or gas stove), chimney**.
- **Catalogue with an option schema** (`opts` on each product): base cabinet (width
  30–120, 7 front types), sink unit (width, bowl type, sink material), hob unit (width,
  2–5 burners, drawers or built-in oven), chimney (width, 4 styles), wall cabinet (width,
  height, 5 front types), loft, open shelf, tall unit (pantry / oven+microwave / broom),
  refrigerator (single / double / side-by-side), dishwasher, microwave, OTG, mixer
  grinder, RO purifier, bar stool, freestanding gas stove. 8 cabinet finishes.
- **Three placement layers** with 3D collisions: floor units, counter-top items (sit on the
  unit below and ride along when it moves), wall units (fixed height on a wall).
- **Wall snapping**: cabinets snap flush to walls and to neighbours' edges; wall units slide
  along walls; units follow their wall when the room is resized.
- **Kitchen-wide finishes**: cabinet finish, countertop (granite, quartz, marble, oak,
  steel), handles (bar, knob, gola, brass edge), wall tiles (9 patterns × backsplash /
  dado / full) cut around doors and windows, floor (15 kitchen floors), wall paint.
- **Rule engine** (`computeWarnings`): missing essentials, chimney not over a stove or at
  the wrong height (65–75 cm), sink–hob spacing (≥ 30 cm), door/window blocking and door
  swing, counter items on the floor, ceiling clearance, work triangle (3.6–7.9 m).
- Price is computed from configuration × finish; bag and summary carry configurations.

## Phase 0.5 — Generated layouts ✅

Hard-coded templates are gone. Claude returns a whole design as schema-constrained JSON
(room, openings, units with options/finish/placement, style). `realizeDesign()` is the
deterministic step that places it (walls, snapping, 3D collisions, door/window checks), repairs
small overlaps and reports what it changed. Proposals render as cards; the planner's AI tab
sends the current design (with manual edits) plus failing checks for revisions, with undo.

## Phase 1 — Tool layer (model ↔ scene)

Expose the deterministic operations as JSON tools. Each tool validates through the same
code the mouse uses and returns `{ ok, state_delta, warnings }`.

| Tool | Wraps |
|---|---|
| `get_kitchen()` | room, features, items (pid, cfg, finish, wall, along), style, totals, warnings |
| `add_unit(pid, cfg, finish?, wall?, along?)` | `findSlot` / `wallPlace` + collision + feature checks |
| `configure(uid, key, value)` | `setCfg` (refuses with the blocking item's name) |
| `move(uid, wall, along)` / `remove(uid)` | `moveToWall`, `removeItem` |
| `set_style(key, value)` | countertop, handles, tiles, cover, floor, paint, cabinet finish |
| `check()` | `computeWarnings` (+ optional rule packs, e.g. Vastu) |
| `price()` | totals by category |

Runtime: a small serverless proxy (Cloudflare Worker / Vercel function) holds the Claude API
key; GitHub Pages keeps serving the static app. No key in the client. The planner keeps
working with AI unavailable.

## Phase 2 — Generative UI component catalogue + renderer

Declarative, A2UI-style flat JSON (`root` + `elements` map), validated before render,
drawn with the app's existing styles. Start with 8–10 components:

`BriefForm` · `LayoutOptionCard` (reuses `planSVG` + price + key specs) · `PlanThumb` ·
`FixItCard` (problem, why, 1–3 actions) · `ComparisonGrid` · `PriceBreakdown` ·
`BudgetSlider` · `ChecklistCard` · `ConfirmBar` (Apply / Undo) · `ExplainerText`.

Actions in a spec reference tool calls (e.g. `{"tool":"configure","args":{...}}`); the
renderer runs them through Phase 1 tools, never arbitrary code. Edits patch surfaces in
place instead of regenerating them.

## Phase 3 — Flows (the visible upgrade over the baseline)

1. **Brief → proposals.** "4 people, heavy Indian cooking (tadka, deep-fry), ₹3–4 lakh,
   L-shaped, want a tall pantry and RO" → 2–3 `LayoutOptionCard`s with price and
   trade-offs → **Apply** runs the tool calls. Domain defaults the model should reach for:
   ≥ 1200 m³/h chimney for heavy frying, 4-burner hob, drawers near the hob for masala,
   loft for bulk storage, RO near the sink.
2. **Fix-it instead of passive warnings.** Each rule violation becomes a `FixItCard`
   ("Sink is 10 cm from the hob → [Insert 45 cm drawer unit] [Swap sides]").
3. **Real comparisons.** "Swap with similar" becomes a generated `ComparisonGrid` (size,
   price, fits-here, style match) for the selected unit's role.
4. **Budget tool.** `BudgetSlider` proposes finish / appliance downgrades or upgrades with
   live price deltas.
5. **Quote.** Generated client-ready summary (views, item list with configurations, finish
   board, notes) shareable as a page / PDF.
6. **Optional rule packs.** e.g. Vastu (stove in the south-east, sink north-east) surfaced
   as a toggle and a checklist, not hard constraints.

## Phase 4 — Evaluation

Spec validity rate (target > 98 % before fallback), tool-call success, time-to-first-card,
task success on 10 scripted briefs (fits room, no warnings, within budget), and side-by-side
user preference vs. the baseline panels.

## Guardrails

- Direct manipulation (drag, rotate, orbit, zoom) never waits on the model.
- The model never writes geometry, prices or rules; it proposes tool calls that may be refused.
- Generated UI uses only catalogue components; invalid spec → retry once → text fallback.
- Every applied change is undoable (one undo entry per generated action).
