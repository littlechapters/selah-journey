# Selah · Journey — Claude handoff

App: **Selah**. This package is the Journey section, including the **locked Notes listen page**.

Repo: https://github.com/littlechapters/selah-journey

Owner: David. Do not rename the product. It is not “Faith Meets Tuesday.”

---

## Locked page (2026-08-31) — Notes rest state

David signed this off: **“This is perfect. Lock this page.”**

Do not redesign the Notes home. Spec: [`src/journey/NOTES_LISTEN_LOCK.md`](src/journey/NOTES_LISTEN_LOCK.md).

Exact UI:

- Glass circular button (lens, not gold orb).
- **Start Recording**
- One-line hint: *Keep your phone where it can hear clearly.*
- Subtext, these line breaks only:

> Tap to record a sermon or a podcast.  
> Selah transcribes as you listen and gathers  
> the key points into clear, thoughtful notes.  
>  
> Save what stays with you.  
> Return to it when you need it.

Recording flow is live, not a black form: waveform, words as they are said, then keep/pass the speaker’s points.

---

## Product constitution (non-negotiable)

- **BSB only** for scripture. Verbatim. No paraphrase of verses.
- Picture stands beside the text. Worlds do not replace reading.
- Do not invent counsel, diagnosis, application, or verses the speaker did not say. Sermon notes extract **their** points.
- No gore, no spectacle. Tenth plague: both faces (Passover covering and the cost) if you ever touch Exodus.
- Language stays Selah: short, plain, no slogans, no emoji in chrome.
- Auth is **off**. Journey is kept on-device (`localStorage` `selah-journey-v3`). Do not add sign-in unless David asks.

---

## Journey map

Three **preview** onboarding screens every visit (`PREVIEW_THRESHOLD_EVERY_VISIT = true` in `experience.tsx`). Flip to `false` before launch. Exact copy:

1. Are you ready to / start your journey? — **Yes, I am.**
2. A spiritual journey is a personal process of self-discovery and inner growth that moves beyond the physical ego to explore deeper questions about existence. — **Continue**
3. Your journey / begins here. — **Begin my journey**

Then **JOURNEY** hub (all caps). **Stay** is first. Rooms are the only primary options. No “Known” list, no “Continue — What you carry” on the hub (that lives inside Paths).

Rooms (bible-style tiles):

| n | Tile | Line |
|---|---|---|
| 01 | PATHS | Four walks |
| 02 | JOURNAL | What is true |
| 03 | FOCUS | One thing |
| 04 | BREATH | Still |
| 05 | NOTES | Listen to what is said |

---

## Notes listen — engineering

**Rest:** `ListenSurface` in `listen.tsx`, hosted by `NotesRoom`.

**Start:** `getUserMedia` → AnalyserNode waveform + ScriptProcessor PCM. SpeechRecognition (`webkit` on Safari) for live captions. `continuous` + restart on `onend`.

**While live:** after ~80 words, `splitSermon` at most 3 times, ≥28s apart. Forming points appear under the caption.

**Stop:** encode 16 kHz WAV (cap 8 minutes). If sitting > ~4s of samples, `transcribeSermon` → `POST https://api.x.ai/v1/stt` with `language=en`, `format=true`. Prefer STT text if it is at least ~60% as long as live words. Then one `splitSermon`. Deck: keep/pass. Save via `addNote(title, body, points)`.

**xAI:** `process.env.XAI_API_KEY` server-only. Chat model `grok-4.5`. Cap spend: user-initiated, max 3 mid-splits + 1 STT + 1 final split per sitting.

**Fallback:** mic denied → hint to write. No SpeechRecognition → words land on stop. STT/split fail → existing error lines, never crash.

Write a line / paste a transcript still exist as secondary paths.

---

## Hub decisions already made (do not revert)

- Title **JOURNEY**, not “Journey”, not “Faith Meets Tuesday”.
- Stay first. Rooms only on the hub.
- Apple/Tesla feel: tactile tiles, not black forms. Notes was the last room still living as a form; it is now the listen surface. Keep it that way.
- Forced 3-question threshold is preview-only for David.

---

## Source layout

```
src/journey/
  NOTES_LISTEN_LOCK.md   ← freeze
  listen.tsx             ← Notes rest + recording
  sermon.ts              ← split + STT
  rooms.tsx              ← NotesRoom, Journal, Focus, Breath
  hub.tsx                ← JOURNEY + Paths room
  experience.tsx
  onboarding.tsx
  glow.tsx
  chrome.tsx
  play.tsx
  walk.tsx
  paths.ts
  store.ts
  journey.css
```

`SOURCE.md` in this repo concatenates those files so nothing is missing if a zip is opened without git.

---

## What not to do

- Do not turn Notes back into “paste a transcript” as the home.
- Do not add Monday.com action items, meeting UI, or a dashboard.
- Do not gold-fill the button. It is glass.
- Do not put the label inside the disc.
- Do not change the five subtext lines or their breaks.
- Do not add accounts, a database, or a different STT vendor.
