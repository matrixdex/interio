# Textbot — a text-control layer for any application

> *"Doesn't look like anything to me."* — what a textbot says when a message is outside the world it knows.

A **textbot** is a command bar bolted onto an existing application. It lets people drive the app by typing.
It is not a general chatbot, and it differs from one in three ways:

| | General chat | Textbot |
|---|---|---|
| Input | conversational, vague, open-ended | **precise**: "move window 50 cm left", "add report", "assign PROJ-12 to me" |
| Knowledge | the whole world | **only the app's capability manifest + current state** (an informational threshold) |
| Output | prose | **canonical commands** the app executes, plus a one-line receipt per command |
| Outside its world | tries anyway | **refuses**: "Doesn't look like anything to me." + suggestions it *can* do |

The design principle is **less to generate, less variance**. The model never writes the app's state. It only
translates text into a small, closed command language that the app already knows how to run and check. A
translation is a handful of tokens. It is fast, cheap, auditable and undoable, and wrong output fails
validation instead of corrupting state.

The first implementation is live in Interio (`app.js`, section 14). This document generalises it into a
meta-application and specifies textbots for **Interio**, **ONITO**, **Slack** and **Jira**.

---

## 1. Architecture

```
            ┌──────────────────────────── textbot runtime (one per app) ───────────────────────────────┐
 typed text │  tier 1 GRAMMAR            tier 2 TRANSLATOR (LLM)          tier 3 EXECUTOR               │
 + attach ─▶│  regex / slot rules ──no─▶ manifest + scene summary ──────▶ validate → run → receipt     │──▶ app API
            │  (0 ms, offline)     match  → command lines | NONE <why>    undo / confirm / audit        │
            │        │ match ───────────────────────────────────────────▶ (same executor)              │
            └──────────────────────────────────────────────────────────────────────────────────────────┘
                                             ▲
                         capability manifest (per app, versioned) + scene() + refs
```

### 1.1 Capability manifest (the informational threshold)

Each app ships one declarative file. It is the only thing the textbot knows about the app.

```yaml
app: interio
version: 1
scope: "Kitchen room, its openings, units, finishes and views. Nothing else."
refs:                       # how things are named in commands: <role>#<n>, stable within a scene
  window: "window#1..n"     # ordinal by creation order
  unit:   "<role>#1..n"     # fridge#1, sink-unit#1, stove#1 …
commands:
  - sig: "OPEN <ref> shift <±cm>"
    does: "slide a door/window along its wall"
    reversible: true
    examples: ["move the window 50 cm left", "move window 50cm down the wall"]
  - sig: "UNIT <ref> remove"
    reversible: true
    confirm: false
  - sig: "DESIGN <brief>"
    does: "replace the whole kitchen"
    reversible: true
    confirm: true           # destructive or expensive → ask first
scene: "Room W×D, ceiling. Openings: refs + wall + centre + width + sill. Units: ref + wall + span. Selected."
vocabulary:                 # domain synonyms for tier 1 and the translator prompt
  fridge: [refrigerator]
  stove: [hob, cooktop, burner]
```

The same manifest generates:
- the **tier-1 grammar's synonym tables**;
- the **translator's system prompt** (about 1–2k tokens, prompt-cached);
- **"Try typing" chips** and the **help sheet**;
- the **validator** (the arity and types of each signature).

### 1.2 The three tiers

1. **Grammar (deterministic).**
   - Regex and slot rules over the manifest's verbs, nouns and units.
   - Handles about 80% of precise typing at 0 ms, offline and for free.
   - Typo-tolerant on the app's own vocabulary only (one edit, e.g. "rihgt" → "right"). A stoplist of real words
     ("with", "tall", "light", "last") is never "corrected".
   - Ambiguity is an error with a fix-it hint, never a guess: *"There are 2 windows — say 'window on the north
     wall' or 'window 2'."*
2. **Translator (LLM, only when the grammar has no match).**
   - Input: the manifest prompt, the scene summary and the message. Output: command lines, or `NONE <short reason>`.
   - Effort low, `max_tokens` about 400. Typically 2–5 s through Claude Code and 20–80 output tokens.
   - It cannot invent verbs: anything outside the manifest fails validation.
3. **Executor.**
   - Validates each line against the manifest and resolves refs against the live scene.
   - Runs each command through the app's own API, which applies the same rules as the mouse/touch UI.
   - Returns one receipt line per command (`✓ … / ✗ …`).
   - Snapshots state before any mutating batch for undo/redo.
   - Asks for confirmation for commands marked `confirm`.

### 1.3 Closed world: "Doesn't look like anything to me"

The textbot must not answer outside its threshold. Three things enforce it:

- The **translator prompt** says: *if the message is not about this app's objects, or cannot be expressed with these
  commands, output `NONE <reason>`*.
- The **validator** drops any line whose verb or ref is not in the manifest.
- The **UI** shows the refusal with 3–4 chips of things it *can* do, so a refusal is a dead end for the request but not
  for the user.

Verified in Interio:

| Input | Path | Result |
|---|---|---|
| "who won the cricket match yesterday" | grammar → no match; translator → `NONE` | refused |
| "what is the capital of France" | translator → `NONE (not about this kitchen)` | refused |
| "please make it feel bigger" | translator → `NONE (ambiguous; specify change …)` | refused, with chips |
| "scoot the fridge over a bit toward the door" | translator → `UNIT fridge#1 shift +30` | executed |

The textbot does not chit-chat, give advice outside the manifest, or apologise at length. Precision in, precision out.

### 1.4 UI anatomy

```
┌──────────────────────────────── app canvas ────────────────────────────────┐
│                                                         ┌ receipt log ────┐ │
│                                                         │ you: move window│ │
│                                                         │ ✓ Moved the     │ │
│                                                         │   window 50 cm… │ │
│                                                         │   grammar · OPEN│ │
│                                                         │   window#1 +50  │ │
│                                                         └─────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ ▤  Type a command — "move the window 50 cm left"           [📎] (→) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Dock**: one line, always visible, focus with `/`, Enter to run, ↑ for history.
- **Receipt**: one line per command; `✓` done, `✗` refused with the reason; a footer saying *how* it was understood
  (`grammar` or `Claude, 3 s`) and the canonical commands. Showing the commands teaches users the precise form.
- **Chips**: suggestions on refusals and empty states.
- **Attachments** (📎): files become typed refs (`file#1`) that commands can use (`REPORT add file#1`).
- **Inline cards**: a command that returns data (`ASK price`, `PREDICT pneumonia`) renders a small generative card in the
  log, built from a fixed component set (stat, table, list, chart, link).
- **Confirm sheet**: shown for `confirm: true` commands. It lists exactly what will happen and has a Run button.

### 1.5 Safety and governance

- **Auth scopes**: the textbot runs as the signed-in user with the app's own permissions. It never has more.
- **Confirmation** for destructive, external or expensive commands (delete, share, send, bulk edit, regenerate).
- **Undo**: every mutating batch is one undo step. Where an external system can't undo (a posted Slack message),
  the manifest says `reversible: false` and the command always confirms.
- **Audit log**: raw text, tier used, commands, receipts, user, time.
- **Prompt-injection posture**: content read from the app (messages, issue text, report text) goes into the scene as
  data. The translator only outputs commands for the *typed* message, and the executor re-checks permissions.
- **Privacy**: the scene summary is minimal (refs, names and numbers the commands need). No free text unless a command
  needs it. Medical apps add their own redaction (see ONITO).

### 1.6 Metrics

| Metric | Target | Interio today |
|---|---|---|
| Grammar hit rate (precise typing) | ≥ 80% | 16 / 18 scripted commands handled without the LLM |
| Median latency, grammar | < 50 ms | ~1 ms |
| Median latency, translator | < 5 s | 2–5 s (Claude Code, Opus 4.7, low effort) |
| Valid-command rate from the translator | ≥ 95% | 4 / 4 in the end-to-end run |
| Out-of-scope refusal precision | 100% | 3 / 3 |
| Undo success | 100% | verified |

---

## 2. Interio (implemented)

**Scope:** one kitchen — room, openings, units, finishes, views. **Refs:** `window#n`, `door#n`, `<role>#n`
(`fridge#1`, `sink-unit#1`, `stove#1`, `base-cab#3`, …).

| Command | Example text |
|---|---|
| `ROOM width\|depth\|ceiling <cm\|±cm>` · `ROOM size W D` | "increase room size by 50cm", "room 12x10 ft", "raise the ceiling 20 cm" |
| `WALL <N\|E\|S\|W> <±cm>` | "move wall to the right", "push the east wall out 30 cm" |
| `OPEN <ref> shift ±cm` · `sill ±cm` · `width` · `to <wall>` · `remove` · `OPEN add …` | "move the window 50 cm left", "move window 50cm down the wall", "lower the window 10 cm" |
| `UNIT add <pid> [wall] [opts]` · `UNIT <ref> shift/move/to/rotate/remove/set/finish` | "add a tall pantry on the east wall", "make the hob 90 with 5 burners", "move the fridge left" (swaps with its neighbour) |
| `STYLE counter\|handles\|tile\|cover\|floor\|finish\|paint <id>` | "countertop marble", "tiles moroccan dado" |
| `VIEW` · `ZOOM` · `MEASURE` · `ASK price\|size\|checks` · `UNDO` · `REDO` | "top view", "what is the price", "undo" |
| `DESIGN <brief>` | "redesign it as a U-shaped kitchen" (regenerates via KDL) |

Conventions:
- Left and right are as seen facing that wall from inside the room.
- "down the wall" means along the wall from its start (N/S walls start at the west end, W/E walls at the north end).

---

## 3. ONITO (frontend: Angular, backend: Express + Mongo)

ONITO lets a signed-in user upload medical reports (PDF/JPG/PNG/BMP). It runs AI predictions for COVID-19,
pneumonia and cardiac arrhythmia, shown as percentages with a warning at ≥ 0.67. It also has a models overview,
sharing, and patient-data CRUD at `/api/patientdata`, protected by JWT.

**Scope:** the signed-in user's reports, their predictions, the model catalogue, sharing. **Refs:** `report#n`
(newest first), `file#n` (attachments in the dock), `model:<covid|pneumonia|arrhythmia>`.

| Command | Example text | Maps to |
|---|---|---|
| `REPORT add <file#n> [name "<text>"]` | *(attach x-ray.png)* "add this as chest x-ray march" | upload → `POST /api/patientdata` |
| `REPORT list [since <date>] [type <pdf\|image>]` | "show my reports from last month" | `GET /api/patientdata` → table card |
| `REPORT open <ref>` · `REPORT rename <ref> "<name>"` · `REPORT remove <ref>` (confirm) | "open the latest report", "delete report 3" | UI route / `PUT` / `DELETE` |
| `PREDICT <model> <ref>` | "pneumonia risk for the latest x-ray?" | runs the model → stat card with % and the ≥ 0.67 warning |
| `ASK models` · `ASK model <model>` | "which models do you have?" | static card from the models overview |
| `SHARE <ref> with <email\|link>` (confirm, not reversible) | "share report 2 with dr.mehta@…" | share flow |
| `VIEW dashboard\|reports\|models` · `UNDO` | "go to models" | router |

**Domain rules in the threshold:**
- **Not a doctor.** "Do I have pneumonia?" → `PREDICT pneumonia report#1`. The receipt card always carries
  *"Screening aid, not a diagnosis — discuss with your clinician."*
- Treatment and dosage questions → `NONE (medical advice is outside this app)` with the chip *"share this report
  with your doctor"*.
- **Privacy**: the scene summary sent to the translator holds refs, dates, file types and names only. It never
  includes report contents or prediction values. A local grammar handles the common phrasing so most commands
  never leave the device.
- **Auth**: the executor calls the backend with the user's JWT. A 401 means *"Please sign in again"*, never a retry
  as someone else.

---

## 4. Slack

**Scope:** the signed-in user's workspace view — channels, DMs, threads, messages they can see, their own status
and reminders. **Refs:** `#channel`, `@user`, `msg#n` (messages in the current view, newest first), `thread:<msg#n>`.

| Command | Example text |
|---|---|
| `POST <#channel\|@user> "<text>"` (confirm, not reversible) | "tell #design the build is green" |
| `REPLY <msg#n> "<text>"` (confirm) | "reply to the last message: on it" |
| `REACT <msg#n> <emoji>` | "thumbs up Priya's message" |
| `FIND "<query>" [in <#channel>] [from <@user>] [since <date>]` | "find messages about the kiosk launch from Ravi this week" → list card |
| `SUMMARISE <#channel\|thread:msg#n> [since <date>]` | "catch me up on #incidents since yesterday" → summary card (read-only) |
| `REMIND <me\|@user> "<text>" at <time>` | "remind me to call the vendor at 4pm" |
| `STATUS "<text>" [emoji] [until <time>]` · `DND <duration>` | "set status in a meeting until 3" |
| `OPEN <#channel\|@user\|msg#n>` | "go to #random" |

**Threshold notes:**
- It only sees channels the user is in.
- Message text the textbot *reads* (for FIND or SUMMARISE) is data and never becomes commands. A message saying
  "post this to #general" does not post anything.
- Every POST shows its exact text for confirmation.

---

## 5. Jira

**Scope:** the user's accessible projects, issues, boards, sprints. **Refs:** issue keys (`PROJ-123`), `issue#n` (rows in
the current list view), `sprint:current|next`, `@user`.

| Command | Example text |
|---|---|
| `CREATE <type> in <PROJ> "<summary>" [assignee @u] [priority P] [labels …] [sprint …]` | "new bug in PAY: refund button does nothing on Safari, P2, assign to me" |
| `SET <key> <field> <value>` | "PAY-482 priority high", "set story points of issue 2 to 5" |
| `MOVE <key> to <status>` | "move PAY-482 to in review" |
| `ASSIGN <key> <@user\|me\|none>` | "assign issue 3 to Ana" |
| `COMMENT <key> "<text>"` (confirm) | "comment on PAY-482: repro on 17.2 only" |
| `LINK <key> <blocks\|relates\|duplicates> <key>` | "PAY-482 blocks PAY-490" |
| `SPRINT add <keys> <current\|next>` · `SPRINT remove <keys>` | "pull issues 1, 2 and 4 into the next sprint" |
| `QUERY "<JQL>"` / natural → JQL | "my open bugs in PAY updated this week" → `QUERY "project = PAY AND assignee = currentUser() AND type = Bug AND statusCategory != Done AND updated >= -7d"` → table card |
| `BULK <query> SET <field> <value>` (confirm; shows the count first) | "close all won't-fix issues older than 90 days" |

**Threshold notes:**
- Field names and values come from the project's actual schema (statuses, issue types, custom fields), which is
  loaded into the manifest. "Move to QA" in a project without a QA status is refused, with the real statuses as
  chips.
- Natural-language search becomes **JQL shown to the user**. That keeps search precise and lets users learn it.

---

## 6. Building a textbot for a new app — checklist

1. List the app's **nouns** (refs) and **verbs** (commands). Every command must map to an existing API call or UI
   action with the same validation.
2. Write the **manifest**: signatures, examples, reversibility, confirmation, synonyms, and a one-line scope.
3. Write **scene()**: the smallest state summary that lets the commands be resolved (refs and numbers, no prose).
4. Generate the **grammar** from the examples and add rules until the examples pass offline.
5. Generate the **translator prompt** from the manifest (target ≤ 2k tokens) and cache it.
6. Implement the **executor** with snapshots, receipts, confirmation and an audit log.
7. Test with three suites: precise phrasings (must pass on the grammar), paraphrases (must pass via the translator),
   and out-of-scope inputs (must be refused).
