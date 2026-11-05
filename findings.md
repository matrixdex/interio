# IKEA Kreativ — Recreation Spec

A reconstruction guide for the IKEA Kreativ room designer, based on hands-on exploration of
`https://www.ikea.com/in/en/home-design/room/?roomType=generic`. The goal is to give another
agent enough structural detail to rebuild the application without needing to re-browse the site.

---

## 1. App at a glance

IKEA Kreativ is a **web-based 3D room designer** that lets a shopper:

1. Drop into a pre-built room (or build their own from scratch).
2. Browse the IKEA furniture catalog and drop 3D models into the room.
3. Select any placed object and move / rotate / replace / copy / remove it.
4. Edit the room itself: wall dimensions, ceiling height, doors, windows, wall color, flooring.
5. Toggle between **Dollhouse** (3D isometric), **Top view** (plan), and **Side views**
   (photorealistic rendered walls).
6. See the running cart total update live, then push the composition to the IKEA shopping bag.

The experience behaves like a lightweight CAD tool wrapped in an e-commerce chrome.

---

## 2. Top-level layout

Viewport is split into two main regions, with a persistent IKEA site banner above.

```
┌───────────────────────────────────────────────────────────────────┐
│  IKEA global header (lang/country · promo · logo · nav · search) │
├──────────────────────────┬────────────────────────────────────────┤
│                          │  Design header (sidebar toggle,        │
│                          │  Untitled Design ✎, cart, share,       │
│                          │  save, Rs.{total} Summary →,  ✕)       │
│  LEFT SIDE PANEL         ├────────────────────────────────────────┤
│  (tabs: Add / List /     │                                        │
│   Favorites)             │                                        │
│                          │          3D ROOM CANVAS                │
│                          │          (dollhouse/top/side)          │
│                          │                                        │
│                          │                        ┌──┐            │
│                          │                        │+ │ zoom       │
│                          │                        │– │            │
│                          │                        └──┘            │
│                          │                                        │
│                          ├────────────────────────────────────────┤
│                          │ Dollhouse · Top view · Side views ·    │
│                          │ Move to · 🎨 Wall color · 📏 Measure · │
│                          │ ✎ Edit room                            │
└──────────────────────────┴────────────────────────────────────────┘
```

- Left panel width is fixed (~400 px on desktop); it has a close/open toggle in the design header
  (`Close side panel` button).
- Canvas fills remaining space; bottom bar always visible along the canvas.
- Right-edge collapsible drawer labeled **Safety warnings & tips** (empty by default).
- A floating **Floating action buttons** region sits near the canvas (zoom, etc.).

---

## 3. Entry URL and routes

- Room designer: `/in/en/home-design/room/?roomType=generic#{roomTemplateId}/{designId}`
  - `roomType` query: `generic` (shown), plus likely matches the room-type browse categories
    (`living-room`, `bedroom`, `childrens-room`, `dining-room`, `hallway`).
  - Hash fragment appears to be `{templateUUID}/{designUUID}`. The second UUID changes after
    edits (e.g. after Edit room → Finish), suggesting a new design snapshot is stored per edit.
- Room editor: `/in/en/home-design/room-editor/?roomType=generic`
- Home landing: `/in/en/home-design/`

The hash fragments look like opaque IDs used for persistence/sharing of a design.

---

## 4. Left side panel

Three tabs across the top, underlined-selected style:

| Tab | Purpose |
|-----|---------|
| **Add** (default) | Browse catalog, drop items into room |
| **List** | See every item currently in the room, grouped by category, with per-item price |
| **Favorites** | Hearted items |

### 4.1 Add tab

- Search field (`Search...`) with search icon.
- Room-type selector button (e.g. **Bedroom ▾**). Opens a list with:
  - Living room
  - Bedroom (currently selected — shown with checkmark, card has thumbnail + label)
  - Children's room
  - Dining room
  - Hallway
- Pill filter row: `Beds` · `Wardrobes` · `Chest of drawers` · `All categories ▾`.
  The pill set is tied to the current room type; **All categories** opens a checkbox menu of
  these same subcategories.
- Dismissable info card: *"Final Pricing may differ — Please review pricing details during checkout."*
- Vertical card grid of products. Each card:
  - Product image (hover reveals a circular **Add to room ⊕** overlay).
  - Heart (favorite) toggle not shown on card but available on detail panel.
  - Product name (e.g. `SLATTUM`), description (`Upholstered bed frame, Vissle dark grey, 63x78 3/4 "`), price (`Rs.11,990`).
  - Delivery / stock availability chips (`Delivery availability unknown`, `Stock availability unknown`
    for logged-out, no-postcode state).
  - Low/Med/High rating bars repeat per card (looks like an availability visualization or
    aggregated indicator; shows as `Low Med High` text in the DOM across all cards).

**Behavior:** Clicking **Add to room** on a card drops the item into the room at a default spot
and shows a toast: *"Your item has been added, but you might want to move it to a better spot"*
with a **Select it** CTA.

### 4.2 Item-options panel (when an object is selected)

When the user selects a placed item (via Select it toast or clicking it on the canvas), the
side panel swaps from browse → **Item options**:

- Close (✕) button top-left, title "Item options".
- Product card with arrow carousel (◀ ▶) over product image, heart button.
- Product name, description, price, star rating + review count.
- Link: **Show More Details** (opens product page in a new tab).
- Primary CTA: **Add to bag** (blue pill with cart icon).
- "How to get it" row: Delivery · Collect at pick-up point · Store pick-up (with status dots).
- Size accordion (e.g. `Size 160×200 cm ▸`).
- "Replace with similar" tabs leading into a "Swap with similar" tabpanel (recommendations grid).

### 4.3 List tab

- Grouped by category (e.g. `Bedding`) with an **Add {n} items to bag** per-group CTA.
- Each row: thumbnail · product name · description · price.
- Marketing card inline (e.g. "Planning to buy a mattress too?" with link to comfort guide).
- Sticky bottom CTA: **Add all to shopping bag** (blue pill).

### 4.4 Favorites tab

Standard list of hearted items (not opened in this session; follows the same card pattern as Add).

---

## 5. Design-header toolbar (top-right over canvas)

Left-to-right:

1. **Sidebar toggle** (collapses the left panel).
2. **Untitled Design** — editable `textbox`, click to rename (this is the design's title).
3. **Shopping bag** icon.
4. **Share this design** icon.
5. **Save options** icon (floppy disk).
6. **Rs.{total}  Summary →** — pill button; click opens a full-screen summary route
   (observed to error with "Something went wrong — Refresh Page" sometimes, so the summary view
   is a separate heavy view).
7. **✕ Cancel** — exit design and return to the hub.

---

## 6. Canvas floating controls

### 6.1 Right-side zoom
- Floating pill in top-right of canvas: `+` (Zoom in) and `–` (Zoom out). Buttons disable when
  at min/max zoom.

### 6.2 Bottom view/edit bar
Pill-group of segmented toggles + utility buttons, all horizontally laid out:

| Button | Behavior |
|---|---|
| **Dollhouse** | 3D isometric, default. Can orbit (no dedicated rotate UI observed; likely drag canvas). |
| **Top view** | Orthographic plan view with room dimension labels on all four walls (e.g. `28' 3"`, `16' 9"`). |
| **Side views ▾** | Shows a scrollable strip of 4 **photorealistic rendered** views (one per wall). Dropdown lets you pick which wall. |
| **Move to** (disabled unless an object is selected) | Opens a target-wall picker; useful for teleporting selected furniture to a specific wall/position. |
| **🎨 Wall color** | Quick popover: 13 color chips (null/clear + 12 colors). Change wall color without opening full Edit room flow. |
| **📏 Show measurement options** | Popover with: `Product dimensions` · `Product spacing` · `Room dimensions` toggles, plus `Unit: ft` switch. Also contains a "Want to create your own — Build a room" callout with a thumbnail + **Build a room →** button. |
| **✎ Edit room** | Launches the 3-step room editor (section 7). |

When an object is selected the bar also shows **Go back** (deselect) on the right side.

### 6.3 Selected-object contextual toolbar (floating dark pill on canvas)

When an object is selected it is outlined in **yellow**, color-variant swatches appear on the object
itself (clickable dots that cycle the variant), and a dark floating pill appears beneath it:

| Icon | Label | Behavior |
|------|-------|----------|
| 🛍 | **Add to bag** | Adds that item to the IKEA cart. |
| ↻ | **Rotate** | Click once to enter rotate mode — a horizontal slider track with tick marks and a 0° indicator appears above the pill; drag to rotate freely. |
| ⇄ | **Replace** | Opens "Swap with similar" in the side panel. |
| ⊞ | **Goes with** | Suggest compatible add-ons. |
| 🗐 | **Make copy** | Duplicates the item in place. |
| 🗑 | **Remove** | Deletes from design. |

Objects are moved by **dragging** them directly on the canvas (snap/collision handled by the engine).

---

## 7. Edit-room flow (3-step wizard)

Navigating via **Edit room** replaces the right side with the 3D canvas and the left side with a
wizard. A separate Cancel button and Undo/Redo (↶ ↷) sit at the top.

### Step 1 of 3 — Edit room dimensions
- Copy: "Click and drag each wall to adjust the dimensions of your floor plan. Toggle to ceiling
  height. Click and drag the top of the walls up or down to adjust their height."
- Two top-centre pills over the canvas: **Floor plan** (default) · **Ceiling height**.
- Canvas shows an orthographic plan with handles on each wall and dimension labels on all four
  sides (ft/in).
- Illustration showing a wall with left/right drag arrows.
- CTA: **Next**.

### Step 2 of 3 — Configure room features
- Copy: "Swap doors and windows. Select them to adjust dimensions and move them to the right position."
- Two sections:
  - **Door styles** (6 options): Single Panel Door · Glass Door · French Double Door · Double Panel Door · Bifold Panel Double Door · Glass Double Door.
  - **Window styles** (2+ options observed): Glass Window Single · Glass Window Double.
- Each option is a card with illustration + label; click to apply.
- CTAs: **Go back** · **Next**.

### Step 3 of 3 — Style the walls and flooring
- Copy: "Choose a wall color and floor material to personalize your room."
- **Wall color** — 12 color swatches in a 6×2 grid. Default white is pre-selected (ringed).
  Approximate palette: off-white, warm beige, cream, terracotta orange, rust brown, light blue,
  slate blue, sage green, warm grey, taupe, mauve/purple, dark teal.
- **Floor style** — labeled with the current pick (e.g. "Natural oak") above a grid of 19 swatches.
- CTAs: **Go back** · **Finish**.

Completing step 3 returns to the design view; the URL's design UUID changes (new snapshot).

---

## 8. Overlays / peripheral UI

- **Cookie banner** (first visit): "You are in control of your own cookies" with **Ok** and
  **Cookies settings** buttons.
- **Toast** after adding: "Your item has been added, but you might want to move it to a better
  spot" with `Select it` link and dismiss (✕).
- **Feedback modal** — randomly triggered after an interaction: "How is your design experience?"
  with 5 emoji ratings (Bad → Good) and a close (✕).
- **Pricing disclaimer card** inside Add tab, dismissable.
- **Error view** — when a sub-view fails, shows "Something went wrong — Please try again in a few
  minutes. [Refresh Page]".

---

## 9. State / data model (inferred)

A plausible shape for the design document:

```ts
Design {
  id: UUID                          // second part of URL hash
  templateId: UUID                  // first part of URL hash, the starting room template
  title: string                     // "Untitled Design" default, editable
  room: {
    floorPlan: Polygon2D            // wall segments with lengths (default rectangle ~28'3"×16'9")
    ceilingHeight: number           // in current unit
    walls: Wall[] {
      color: HexColor | null
      features: (Door | Window)[] {
        style: enum of 6 doors / 2 windows
        position: number            // offset along wall
        width: number
        height: number
      }
    }
    floor: { material: enum of 19 floor styles }  // default "Natural oak"
  }
  items: PlacedItem[] {
    productId: string               // IKEA article number (e.g. KLEPPSTAD, SLATTUM)
    variant: string                 // color/finish variant id
    position: Vec3                  // x,y,z in metres (y typically 0 for floor items)
    rotation: number                // degrees around vertical axis
    scale?: Vec3
  }
  totals: {
    currency: "INR"
    subtotal: number                // drives "Rs.{total}"
  }
}
```

Catalog item shape (from the Add panel):
```ts
Product {
  articleName: string               // "SLATTUM"
  description: string               // "Upholstered bed frame, Vissle dark grey, 63x78 3/4 \""
  price: number
  currency: "INR"
  rating: number                    // 0..5
  reviewCount: number
  imageUrl: string
  variants: Variant[] { id, swatchColor, thumbnailUrl }
  modelUrl: string                  // GLB/USDZ for 3D canvas
  dimensions: { w, d, h, unit }
  category: "Beds" | "Wardrobes" | "Chest of drawers" | …
  roomTypes: ("bedroom" | "living-room" | …)[]
  availability: { delivery: enum, stock: enum, pickup: enum }
  productPageUrl: string
}
```

---

## 10. Technology recommendations for recreation

The IKEA site uses WebGL (Three.js / Babylon style) for the 3D canvas with pre-rendered IBL
lighting for the side-views (photorealistic strip). A faithful recreation stack:

- **Frontend framework:** React (the DOM shows `ProductSummaryCard__thumbnailOverlay`,
  `DesignSidepanel DesignSidepanel_open` style BEM-ish class names consistent with a React app).
- **State:** Redux / Zustand — design doc + current selection + view mode.
- **3D engine:** Three.js with `@react-three/fiber` + `@react-three/drei` (`OrbitControls`,
  `TransformControls` for the move/rotate affordance, `DragControls` for drag-to-move,
  `AccumulativeShadows` for the dollhouse lighting look).
- **Models:** glTF/GLB per product; procedurally generated room geometry from the floor polygon.
- **Side views:** either pre-rendered through a cloud render farm (likely how IKEA does it, since
  they look photoreal) or real-time with a baked-lighting PBR pipeline. For a recreation, a
  high-quality ortho camera per wall with soft shadows is good enough.
- **Routing:** React Router with the hash-based design ID so sharing a URL loads a design.
- **Persistence:** POST design doc JSON to a backend; receive a UUID that becomes the hash.
- **UI kit:** IKEA uses their own Skapa design system (typography class `typography-label-s`,
  button class `btn btn--primary-inverse` seen in the DOM). Recreate with Tailwind + a small
  component library. Primary brand colour is IKEA blue (#0058A3), with black pill CTAs for
  secondary actions.

---

## 11. Key interaction flows to implement

1. **Open empty room** — load template from `roomType` + template UUID; render dollhouse view.
2. **Browse → Add** — click card → drop item at origin → emit toast → optionally select it.
3. **Select → modify** — click item → side panel switches to Item Options → floating pill appears.
4. **Rotate** — click Rotate → show slider → drag to rotate, live-update 3D transform.
5. **Move** — drag item on floor plane (XZ movement, collision with walls).
6. **Replace** — open similar items in side panel; picking one swaps the mesh in place.
7. **Make copy / Remove** — mutate items array.
8. **Edit room wizard** — 3 steps, each a sub-view; on Finish, persist new room geometry and
   mint a new design UUID (updates URL hash).
9. **View modes** — Dollhouse ↔ Top view ↔ Side views (strip of 4 renders).
10. **Measurement overlay** — toggle dimension labels on walls / between products / for room.
11. **Save / Share** — save = POST design; share = copy URL with design UUID.
12. **Summary / cart** — flatten items into IKEA cart line items and redirect to /shoppingcart.

---

## 12. Minor behavioral quirks observed

- The **Zoom in** button disables once fully zoomed in (and vice versa for Zoom out); no slider.
- **Move to** button is disabled until an item is selected.
- Rotate's first click opens the slider; the item is not actually rotated by the click itself
  (a slider interaction is required).
- "Go back" button in the bottom bar is the deselect action when an item is selected; it is not a
  history/undo.
- **Undo / Redo** (↶ ↷) exist only inside the Edit-room wizard, not in the main designer.
- The side panel contains a stray repeating `Low Med High` text blob (rendered 40+ times);
  looks like an accessibility fallback for a visual rating bar component.
- Room type pills always target the currently-selected room type's category list (changing room
  type changes the available categories).
- Price updates immediately on add/remove.

---

## 13. Reference screenshots captured

Saved alongside this file for visual reference:

- `ikea-01-initial.png` — initial dollhouse view, empty room, Add tab.
- `ikea-02-bed-added.png` — after adding SLATTUM, toast visible.
- `ikea-03-selected.png` — selected bed, Item options panel, floating toolbar.
- `ikea-05-rotated-result.png` / `ikea-06-rotated2.png` — rotate slider UI.
- `ikea-07-topview.png` — top view with bed in room.
- `ikea-08-dollhouse.png` — dollhouse view after top view.
- `ikea-09-editroom.png` — Edit room step 1 (dimensions).
- `ikea-10-editroom-step2.png` / `ikea-11-fullpage-step2.png` — step 2 doors & windows.
- `ikea-12-editroom-step3.png` — step 3 wall colors + floor styles.
- `ikea-14-measurement.png` — measurement options popover.
- `ikea-15-wallcolor.png` — quick wall-color palette popover.
- `ikea-16-sideviews.png` — side-views photorealistic strip.
- `ikea-17-allcats.png` — All categories dropdown (Bedroom scope).
- `ikea-18-roomtypes.png` — room type selector (Living room / Bedroom / Children's room …).
- `ikea-19-list.png` — List tab with placed items.
- `ikea-20-summary.png` — summary error view (observed when Summary endpoint failed).
