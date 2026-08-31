# LOCKED — Notes listen page

**Do not restyle this rest state.** David signed it off 2026-08-31.

Route: Journey hub → NOTES (`room === "notes"`, home mode of `NotesRoom`).

Surface: [`listen.tsx`](listen.tsx) + listen styles in [`journey.css`](journey.css) (`.jny-press*`, `.jny-listen-copy`).

## What is frozen

1. **Glass disc** — frosted circular lens (not gold, not a dark metal puck, not a play triangle). Halo, glass fill, fresnel edge, top sheen, spark, inner rim. Label sits under the disc, not inside it.
2. **Primary label** — serif: `Start Recording`
3. **Hint** — one line, smaller sans, slight air under the label (not an inch, not flush):
   `Keep your phone where it can hear clearly.`
4. **Subtext** — these exact line breaks, centered, `display:block` + `white-space:nowrap` on each span:

```
Tap to record a sermon or a podcast.
Selah transcribes as you listen and gathers
the key points into clear, thoughtful notes.

Save what stays with you.
Return to it when you need it.
```

5. Quiet links under the copy: **Write a line** / **Paste a transcript**. Kept notes list below if any.
6. Hub tile for Notes: name `Notes`, line `Listen to what is said`.

## How it works (do not swap for a form)

- Center glass is the only primary action. Press → mic + live waveform + live words.
- Live captions: Web Speech API.
- On stop: WAV (16 kHz) → `transcribeSermon` (xAI STT) when the sitting is long enough; else the live words stand.
- `splitSermon` (grok-4.5) breaks the speaker’s own points. No counsel, diagnosis, application, or invented action items.
- Points go to the existing keep/pass deck, then `addNote` in the Journey store (`localStorage`, key `selah-journey-v3`). No accounts.

## Copy you must not “improve”

Do not rewrite the five subtext lines. Do not put “Press to listen” back. Do not put the label inside the glass.

## Files

| File | Role |
|---|---|
| `src/journey/listen.tsx` | Rest + recording session |
| `src/journey/sermon.ts` | `splitSermon`, `transcribeSermon` |
| `src/journey/rooms.tsx` | `NotesRoom` hosts ListenSurface, write/paste, deck, kept pages |
| `src/journey/journey.css` | `.jny-press*`, `.jny-listen-copy`, waveform |
| `src/journey/hub.tsx` | NOTES tile |
| `src/journey/store.ts` | `notes: NoteEntry[]` |
| `src/journey/experience.tsx` | Preview still shows the 3 threshold screens every visit |
