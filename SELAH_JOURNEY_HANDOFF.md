# Selah · Journey — handoff for Claude

Paste this first. Then open the files in `src/journey/`. They are the source of truth. Do not rebuild from a summary. Do not invent a second Journey.

You are continuing **Journey**, a section of **Selah**, a Christian mobile-first iOS-feeling app.

Thesis of Selah: *If God is the creator of mathematics, light, cells, music, and the intelligibility that makes AI possible, then frontier intelligence can be placed in service of beholding creation until wonder becomes worship.*

Journey is not Behold (the 3D solar system). Journey is not Bible / Psalm 139. Journey is not Immerse / Genesis. Journey is the living journal: a place to stay with what you are carrying.

---

## What the owner asked for, in order

This is the conversation. Treat later decisions as overrides of earlier ones.

### Original brief
Build Journey tonight, not a wall of text. Tesla first-turn-on energy. Three black onboarding screens first, then a living journal hub containing:

1. Paths (guided walks)
2. Journaling
3. Habits / Focus (one thing)
4. Breathwork
5. Sermon / podcast notes, with AI splitting later

Paywall later. Do not rush. Do not simplify. Compete with multi-million-dollar apps (Haptic, One Year, 222). iOS quality. One thing per screen. Leave anytime. Track growth without streaks.

A prior Claude pass had already written a constitution, four paths, both-faces patterns, and ~40/40 tests. That constitution is still law. The first Grok pass of Journey was a skeleton and was rejected.

### Rejection of the skeleton
- Do **not** name it “Faith Meets Tuesday.”
- Onboarding screen 2 must be **exactly** the ChatGPT mockup copy (see locked copy below). An earlier rewrite of that screen was wrong.
- Hub must look like the Bible section: square tiles, 2-col, numbers, titles. Tiles: Paths, Journal, Focus, Breath, Notes — not Genesis / Exodus.
- “This is not interactive. It is still a black screen with fields. Haptic and One Year designed real interactions page by page. We need to feel known through selection, not forms.”
- “Do not return me another workflow that looks like what was already built.”
- Massive design and interactive updates. Playful micro-interactions. Values saved to the user’s profile. Apple + Tesla spent a year. Figma iOS kits, Apple HIG.

### Focus the rooms, tiles later
“We can build the tiles later, let’s focus on the rooms. They need real touch interactions — not another black form.” Interiors: 222 full-bleed (one question + chips), Haptic orb, One Year dated pages, stacked choices, swipe, canvas particles.

### Hub cleanup (current)
The Stay tile grid is the strongest surface. On the hub:

- Title is **JOURNEY** (all caps).
- **Stay** with the five room tiles is the first and only primary content.
- Remove **Known** (the pill list of patterns) from the hub. It clustered the feed.
- Remove **Continue · What you carry** from the hub. Continue lives **inside Paths**, at the top of that room, when a walk is in progress.
- Rooms are the only primary options on the hub.

### Preview-only: always show the three screens
For the owner only, until launch: **every time you open Journey, play the three onboarding screens**, even if they have already finished them. Rooms and kept writing persist. Flag:

```
PREVIEW_THRESHOLD_EVERY_VISIT = true
```

in `src/journey/experience.tsx`. Flip to `false` before launch so returning people go straight to the hub.

### Loading
The live preview has felt slow because the rest of Selah is heavy 3D (Behold / Sinai / Creation) and Journey was being compiled with it. Journey is now lazy-loaded via `deferPage` in `src/routes/journey.tsx`. Do not statically import three.js into Journey. If the owner says it is still slow, fix Journey’s own first paint (GSAP, onboarding, CSS) without pulling cosmos/house/creation back in.

---

## Locked copy

### Onboarding — exact, do not rewrite

**Screen 1**
- Are you ready to
- start your journey?   ← glow, display size
- CTA: Yes, I am.

**Screen 2** (verbatim; glow on lines 3 and 6)
- A spiritual journey is
- a personal process of
- self-discovery and inner growth     ← glow
- that moves beyond the physical ego
- to explore deeper questions
- about existence.                    ← glow
- CTA: Continue

**Screen 3**
- Your journey
- begins here.   ← glow, display size, do not wrap “begins here.”
- CTA: Begin my journey

Word-stagger + glow via GSAP in `glow.tsx` (no Club SplitText). One screen at a time. Full-bleed black. Pinned cream CTA. Dock hidden (`.jny-immersive` / `.jny-full`).

### Hub
- Title: `JOURNEY`
- Section: `Stay` / `5 ROOMS`
- Tiles in order:
  - 01 PATHS — Paths — Four walks
  - 02 JOURNAL — Journal — What is true
  - 03 FOCUS — Focus — One thing
  - 04 BREATH — Breath — Still
  - 05 NOTES — Notes — A sermon kept

### Paths
Offered, never assigned. Leave whenever you like. Come back to the same place.

Four walks, ten stations each:

| id | kicker | title |
|---|---|---|
| `what-you-carry` | Path one | What you carry |
| `never-enough` | Path two | Never enough |
| `good-version` | Path three | The good version |
| `under-the-anger` | Path four | Under the anger |

Station kinds: `read` · `patterns` · `write` · `sort` · `letter` · `scripture` · `mirror` · `carry`.

### Journal language (222, not therapy)
Hour-aware question: “What is true this morning / this hour / this evening / tonight?”
Openings: “I am carrying” · “I noticed” · “I am grateful” · “I cannot name it yet”
Tones (colour wash, **not** mood ratings): still · warm · dawn · garden
Dated One Year pages. Swipe between kept pages.

### Focus
One thing. Kinds: a passage · someone I am holding · something in creation · a question I am carrying.
No streaks. Nothing is counted.

### Breath
Haptic-style sit. Duration sheet. Orb + particle field. Sit / Return. Nothing is counted.

### Notes
Two destinations (keep a line / split a sermon). AI `splitSermon` extracts the speaker’s own points. No added counsel, diagnosis, application, or verses they did not say.

---

## Constitution (non-negotiable)

Enforced by `tests/journey-paths.test.mjs`. If a test fails, the copy is wrong.

1. **I-first patterns.** Every pattern label starts with “I ”.
2. **Both faces.** Every pattern has a *cost* and a *gift*. Never only the wound.
3. **No diagnosis, therapy, treatment, cure, symptom.**
4. **No streaks, scores, badges, “you missed”, “keep it up”, “well done”, daily goals.**
5. **Skip is always allowed.** The path still works.
6. **Scripture is BSB, verbatim**, reference ends with `· BSB`.
7. **Sourced psychology only**, and every sourced note carries a caveat / qualification.
8. **Do not claim** “stored in the body”, polyvagal, inner child, rewire, “your nervous system is…”.
9. **Everything written stays on this device.** localStorage key `selah-journey-v3`. No account. Export and erase exist.
10. **Leave anytime.** One station per screen. Progressive disclosure (“Why this is here”).
11. **Offered, never assigned.** Paths are not prescribed by a quiz.

Voice: honest, specific, I-language, no church-voice filler, no life-coach. God is present; the user is not being fixed.

---

## Stack

- TanStack Start + React 19 + Vite, mobile-first
- Route: `/journey` → `src/routes/journey.tsx` lazy-loads `JourneyExperience`
- Zustand + localStorage `selah-journey-v3`
- GSAP (word stagger, glow, tile enter). No Club plugins.
- Tailwind v4 tokens in `src/styles.css` plus Journey’s own `journey.css`
- Black `#000` / `#0b0c0a`, cream ink `#e8e4d8`, Instrument Serif + Inter
- Dock: Home · Bible · Immerse · Journey. Hidden during onboarding, walks, and immersive rooms via `useImmersive`
- Auth is off. Do not add sign-in.
- Sermon split: `createServerFn` → xAI `grok-4.5` when `XAI_API_KEY` exists

---

## File map

```
src/routes/journey.tsx      lazy route, black fallback
src/lib/defer-page.tsx      client-only lazy helper (do not SSR WebGL into this)
src/journey/experience.tsx  gate: threshold → onboard → walk → room → hub
src/journey/onboarding.tsx  three screens, exact copy
src/journey/glow.tsx        GSAP word stagger + glow
src/journey/hub.tsx         JOURNEY + Stay tiles; PathsRoom + Continue
src/journey/walk.tsx        one station per screen
src/journey/play.tsx        PatternDeck, swipe, FlipCard, SortBoard, WordVerse, CarryDeck, Dual, Openings
src/journey/rooms.tsx       Journal, Focus, Breath (orb + canvas), Notes (AI split)
src/journey/chrome.tsx      Stage, Back, Cta, Choice, Sheet, useDrag, useImmersive, tap haptic
src/journey/store.ts        persist, rooms, progress, journal, notes, export/erase
src/journey/paths.ts        four paths, patterns, stations, BSB verses
src/journey/sermon.ts       splitSermon server function
src/journey/journey.css     surfaces, tiles, orb, sheets, washes
tests/journey-paths.test.mjs  constitution
```

---

## Current flow

1. Open Journey → (preview) always the three threshold screens.
2. Begin my journey → hub: **JOURNEY** / Stay / five tiles. Nothing else.
3. Paths → stacked doors. If a walk is in progress, a **Continue** choice sits on top.
4. A walk is one station per screen: read, pattern deck (This is me / Pass + swipe), write with openings, sort into buckets, letter, scripture word-light, mirror (both faces), carry.
5. Journal → dated page or ask → chips → tone orbs → paper. Swipe kept pages.
6. Focus → stacked kinds → living card of the one thing.
7. Breath → duration sheet → sit with orb and motes.
8. Notes → keep a line, or paste a sermon and split into keep/pass points.

Dock remains on the hub. Immersive rooms hide it.

---

## Design bar (what “done” looks like)

- Not a form. Not a settings page. Not a black field with a keyboard.
- One question, large. Choices you *want* to tap. Keep / pass. Flip. Swipe. Colour wash.
- 44pt targets. Press scale. Safe area. Pinned CTA on threshold screens.
- The person should feel known and accepted by what they select, not assessed.
- If it could live in a Typeform, it is wrong.

Inspiration the owner pointed at: Haptic (orb, sit, duration sheet), One Year (dated pages), 222 (full-bleed question + chips), Apple HIG / iOS UI kits, YouVersion-style square tiles for the hub only.

---

## Do not

- Rename it Faith Meets Tuesday.
- Rewrite onboarding screen 2.
- Put Known pills or Continue on the hub.
- Add streaks, scores, reminders-as-guilt, mood diagnosis, therapy voice.
- Paraphrase BSB verses.
- Import `@react-three/fiber` / drei / three into Journey.
- Add accounts, a feed, or a social layer.
- “Improve” copy by making it nicer or more Christian-ese.
- Generate ten pages in three minutes. Finish a room.

---

## Open on purpose

- Paywall later.
- Hub tiles can still be pushed further visually; rooms were the priority.
- AI sermon split exists; audio splitting does not.
- `PREVIEW_THRESHOLD_EVERY_VISIT` must go false at launch.
- The owner may still want more tactile depth in rooms (Haptic/222 level). Raise the rooms, do not clutter the hub.

---

## How to run the constitution

```
node --experimental-strip-types --test tests/journey-paths.test.mjs
```

All ten tests must stay green.

---

## Owner

Building Selah as a problems-company product: software you stay with, not content you consume. Journey is the place a person is known. Keep it quiet, specific, and unfinished in the right ways.
