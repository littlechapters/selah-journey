# SOURCE.md — every Journey file, verbatim, as of 2026-08-26 15:55 CDT
This is the full current code. Individual files in this repo are identical.
Do not rebuild from a summary. Do not invent a second Journey.


========================================================================
FILE: src/routes/journey.tsx
BYTES: 409
LINES: 13
========================================================================

import { createFileRoute } from "@tanstack/react-router";
import { deferPage } from "@/lib/defer-page";

const JourneyExperience = deferPage(
  () => import("@/journey/experience").then((m) => ({ default: m.JourneyExperience })),
  <div className="h-dvh w-full bg-black" />,
);

export const Route = createFileRoute("/journey")({ component: Journey });

function Journey() {
  return <JourneyExperience />;
}


========================================================================
FILE: src/lib/defer-page.tsx
BYTES: 582
LINES: 18
========================================================================

"use client";

import { type ComponentType, type ReactNode, Suspense, lazy, useEffect, useState } from "react";

/** Load a heavy page after first paint so SSR/dev never compile every 3D world up front. */
export function deferPage(load: () => Promise<{ default: ComponentType<any> }>, fallback: ReactNode) {
  const Lazy = lazy(load);
  return function Deferred() {
    const [on, setOn] = useState(false);
    useEffect(() => setOn(true), []);
    if (!on) return <>{fallback}</>;
    return (
      <Suspense fallback={fallback}>
        <Lazy />
      </Suspense>
    );
  };
}


========================================================================
FILE: src/journey/experience.tsx
BYTES: 1240
LINES: 33
========================================================================

"use client";

import { useEffect, useState } from "react";
import "./journey.css";
import { Onboarding } from "./onboarding";
import { Hub, PathsRoom } from "./hub";
import { Walk } from "./walk";
import { BreathRoom, FocusRoom, JournalRoom, NotesRoom } from "./rooms";
import { useJourney } from "./store";

/** Preview only. Flip to false before launch so returning people go straight to the hub. */
const PREVIEW_THRESHOLD_EVERY_VISIT = true;

export function JourneyExperience() {
  const [ready, setReady] = useState(false);
  const [threshold, setThreshold] = useState(PREVIEW_THRESHOLD_EVERY_VISIT);
  const onboarded = useJourney((s) => s.onboarded);
  const room = useJourney((s) => s.room);
  const walking = useJourney((s) => s.walking);

  useEffect(() => setReady(true), []);
  if (!ready) return <div className="jny" />;
  if (threshold || !onboarded) {
    return <Onboarding onDone={() => setThreshold(false)} />;
  }
  if (walking) return <Walk pathId={walking} />;
  if (room === "paths") return <PathsRoom />;
  if (room === "journal") return <JournalRoom />;
  if (room === "focus") return <FocusRoom />;
  if (room === "breath") return <BreathRoom />;
  if (room === "notes") return <NotesRoom />;
  return <Hub />;
}


========================================================================
FILE: src/journey/onboarding.tsx
BYTES: 2060
LINES: 73
========================================================================

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GlowCopy, type GlowLine } from "./glow";
import { Cta, useImmersive } from "./chrome";
import { useJourney } from "./store";

const SCREENS: { lines: GlowLine[]; cta: string }[] = [
  {
    lines: [
      { text: "Are you ready to", quiet: true },
      { text: "start your journey?", glow: true, display: true },
    ],
    cta: "Yes, I am.",
  },
  {
    lines: [
      { text: "A spiritual journey is" },
      { text: "a personal process of" },
      { text: "self-discovery and inner growth", glow: true },
      { text: "that moves beyond the physical ego" },
      { text: "to explore deeper questions" },
      { text: "about existence.", glow: true },
    ],
    cta: "Continue",
  },
  {
    lines: [
      { text: "Your journey", quiet: true },
      { text: "begins here.", glow: true, display: true },
    ],
    cta: "Begin my journey",
  },
];

export function Onboarding({ onDone }: { onDone?: () => void }) {
  const finish = useJourney((s) => s.finishOnboard);
  const [i, setI] = useState(0);
  const ctaRef = useRef<HTMLDivElement>(null);
  const screen = SCREENS[i];
  useImmersive(true);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.85, ease: "power3.out" });
  }, [i]);

  const next = () => {
    if (i >= SCREENS.length - 1) {
      finish();
      onDone?.();
    } else setI(i + 1);
  };

  return (
    <div className="jny jny-full" role="region" aria-label="Begin the journey">
      <div className="jny-stage jny-threshold">
        <div className="jny-center" key={i}>
          <GlowCopy lines={screen.lines} />
        </div>
        <div ref={ctaRef} className="jny-cta-slot">
          <Cta hold onClick={next}>
            {screen.cta}
          </Cta>
        </div>
      </div>
    </div>
  );
}


========================================================================
FILE: src/journey/glow.tsx
BYTES: 2064
LINES: 73
========================================================================

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type GlowLine = {
  text: string;
  glow?: boolean;
  quiet?: boolean;
  display?: boolean;
};

export function GlowCopy({ lines, align = "left" }: { lines: GlowLine[]; align?: "left" | "center" }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("span[data-w]");
    const lit = el.querySelectorAll<HTMLElement>("span.glow");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0, y: 14, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.95,
          stagger: 0.055,
          ease: "power3.out",
        },
      );
      if (lit.length) {
        gsap.fromTo(
          lit,
          { textShadow: "0 0 0 rgba(255,255,255,0)" },
          {
            textShadow: "0 0 10px rgba(255,255,255,0.95), 0 0 28px rgba(255,255,255,0.7), 0 0 56px rgba(255,255,255,0.32)",
            duration: 1.4,
            delay: 0.45,
            ease: "power2.out",
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [lines]);

  return (
    <p ref={root} className={`jny-copy${align === "center" ? " center" : ""}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={`jny-line${line.glow ? " glow-line" : ""}${line.quiet ? " quiet" : ""}${line.display ? " display" : ""}`}
        >
          {i > 0 ? <br /> : null}
          {line.text.split(" ").map((word, j, arr) => (
            <span key={j} data-w className={line.glow ? "glow" : undefined}>
              {word}
              {j < arr.length - 1 ? "\u00a0" : ""}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}


========================================================================
FILE: src/journey/hub.tsx
BYTES: 4909
LINES: 147
========================================================================

"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { PATHS } from "./paths";
import { Back, Choice, Choices, Stage, tap, useImmersive } from "./chrome";
import { useJourney, type Room } from "./store";

const ROOMS: { id: Room; n: string; title: string; name: string; line: string; art: string }[] = [
  { id: "paths", n: "01", title: "PATHS", name: "Paths", line: "Four walks", art: "ticks" },
  { id: "journal", n: "02", title: "JOURNAL", name: "Journal", line: "What is true", art: "rules" },
  { id: "focus", n: "03", title: "FOCUS", name: "Focus", line: "One thing", art: "dot" },
  { id: "breath", n: "04", title: "BREATH", name: "Breath", line: "Still", art: "orb" },
  { id: "notes", n: "05", title: "NOTES", name: "Notes", line: "A sermon kept", art: "quote" },
];

function TileArt({ art }: { art: string }) {
  if (art === "ticks") return <span className="jny-art ticks" aria-hidden="true" />;
  if (art === "rules") return <span className="jny-art rules" aria-hidden="true" />;
  if (art === "dot") return <span className="jny-art dot" aria-hidden="true" />;
  if (art === "orb") return <span className="jny-art orb" aria-hidden="true" />;
  return (
    <span className="jny-art quote" aria-hidden="true">
      “
    </span>
  );
}

function useResume() {
  const progress = useJourney((s) => s.progress);
  return useMemo(() => {
    for (const p of PATHS) {
      const at = progress[p.id];
      if (!at) continue;
      if ((at.station ?? 0) > 0 || (at.tapped?.length ?? 0) > 0) {
        return { path: p, at };
      }
    }
    return null;
  }, [progress]);
}

export function Hub() {
  const setRoom = useJourney((s) => s.setRoom);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const tiles = el.querySelectorAll(".jny-tile");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(
      tiles,
      { opacity: 0, y: 16, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.06, ease: "power3.out" },
    );
  }, []);

  return (
    <Stage className="jny-hub">
      <h1 className="jny-display">JOURNEY</h1>

      <div className="jny-section">
        <h2>Stay</h2>
        <span>5 rooms</span>
      </div>

      <div className="jny-bible-grid" ref={grid}>
        {ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            className="jny-tile"
            onClick={() => {
              tap();
              setRoom(r.id);
            }}
          >
            <span className="jny-tile-face">
              <span className="jny-tile-num">{r.n}</span>
              <TileArt art={r.art} />
              <span className="jny-tile-name">{r.title}</span>
            </span>
            <span className="jny-tile-meta">
              <strong>{r.name}</strong>
              <span>{r.line}</span>
            </span>
          </button>
        ))}
      </div>
    </Stage>
  );
}

export function PathsRoom() {
  const setRoom = useJourney((s) => s.setRoom);
  const start = useJourney((s) => s.startWalk);
  const progress = useJourney((s) => s.progress);
  const resume = useResume();

  useImmersive(true);

  return (
    <div className="jny jny-full">
      <div className="jny-stage jny-threshold">
        <Back onClick={() => setRoom("hub")}>Back</Back>
        <p className="jny-kicker">Paths</p>
        <h1 className="jny-title">Offered, never assigned.</h1>
        <p className="jny-sub">Leave whenever you like. Come back to the same place.</p>
        <div className="jny-scroll">
          <Choices>
            {resume ? (
              <Choice
                kicker="Continue"
                title={resume.path.title}
                line={
                  resume.at.carrying
                    ? "Carrying what it was for"
                    : `Where you left off · ${resume.at.station + 1} of ${resume.path.stations.length}`
                }
                on
                onClick={() => start(resume.path.id)}
              />
            ) : null}
            {PATHS.map((p) => {
              const at = progress[p.id];
              const resumed = (at?.station ?? 0) > 0 || (at?.tapped?.length ?? 0) > 0;
              const carried = p.patterns.find((x) => x.id === at?.carrying);
              if (resume && p.id === resume.path.id) return null;
              return (
                <Choice
                  key={p.id}
                  kicker={carried ? "Carrying" : resumed ? "Return" : p.kicker}
                  title={p.title}
                  line={p.about}
                  on={resumed}
                  onClick={() => start(p.id)}
                />
              );
            })}
          </Choices>
        </div>
      </div>
    </div>
  );
}


========================================================================
FILE: src/journey/walk.tsx
BYTES: 8173
LINES: 249
========================================================================

"use client";

import { useEffect, useState } from "react";
import { pathById, type Station } from "./paths";
import { Back, Cta, Kicker, Reveal, tap, useImmersive } from "./chrome";
import { useJourney } from "./store";
import {
  CarryDeck,
  FlipCard,
  Openings,
  PatternDeck,
  ReadReveal,
  SortBoard,
  WordVerse,
} from "./play";

export function Walk({ pathId }: { pathId: string }) {
  const path = pathById(pathId);
  const leave = useJourney((s) => s.leaveWalk);
  const patch = useJourney((s) => s.patchProgress);
  const saved = useJourney((s) => s.progress[pathId]);
  const stationI = saved?.station ?? 0;
  const tapped = saved?.tapped ?? [];
  const sorted = saved?.sorted ?? {};
  const letter = saved?.letter ?? "";
  const origin = saved?.origin ?? "";
  const carrying = saved?.carrying;
  const [piece, setPiece] = useState(0);
  const [why, setWhy] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [draft, setDraft] = useState("");

  useImmersive(true);

  useEffect(() => {
    setPiece(0);
    setWhy(false);
    setFlipped(false);
    const station = path?.stations[Math.min(stationI, (path?.stations.length ?? 1) - 1)];
    if (station?.kind === "letter") setDraft(letter);
    else if (station?.kind === "write") setDraft(origin);
    else setDraft("");
  }, [stationI, pathId, path, letter, origin]);

  if (!path) return null;

  const station = path.stations[Math.min(stationI, path.stations.length - 1)];
  const last = stationI >= path.stations.length - 1;
  const chosen = path.patterns.filter((p) => tapped.includes(p.id));
  const verses = station.scriptures ?? (station.scripture ? [station.scripture] : []);
  const sortItems = chosen;
  const mirrorItems = chosen;
  const ownCta = station.kind !== "patterns";

  const innerLast = (() => {
    if (station.kind === "sort" && sortItems.length) return piece >= sortItems.length - 1;
    if (station.kind === "mirror" && mirrorItems.length) return piece >= mirrorItems.length - 1;
    if (station.kind === "scripture" && verses.length) return piece >= verses.length - 1;
    return true;
  })();

  const go = (delta: number) => {
    const n = Math.max(0, Math.min(path.stations.length - 1, stationI + delta));
    if (station.kind === "write") patch(pathId, { origin: draft, station: n });
    else if (station.kind === "letter") patch(pathId, { letter: draft, station: n });
    else patch(pathId, { station: n });
  };

  const advance = () => {
    tap();
    if (!innerLast) {
      setPiece((p) => p + 1);
      setWhy(false);
      setFlipped(false);
      return;
    }
    if (last) leave();
    else go(1);
  };

  const retreat = () => {
    if (piece > 0) {
      setPiece((p) => p - 1);
      setWhy(false);
      setFlipped(false);
      return;
    }
    if (stationI > 0) go(-1);
  };

  const toggle = (id: string) => {
    const next = tapped.includes(id) ? tapped.filter((x) => x !== id) : [...tapped, id];
    patch(pathId, { tapped: next });
  };

  const verse = verses[Math.min(piece, Math.max(verses.length - 1, 0))];
  const notes = station.notes ?? [];

  return (
    <div className="jny jny-full">
      <div className="jny-stage jny-threshold">
        <div className="jny-top">
          <Back onClick={leave}>Leave</Back>
          <span className="jny-count">
            {stationI + 1} of {path.stations.length}
          </span>
        </div>
        <div className="jny-thread" aria-hidden="true">
          {path.stations.map((s, i) => (
            <i key={s.id} className={i <= stationI ? "on" : undefined} />
          ))}
        </div>
        <Kicker>{station.kicker}</Kicker>
        <Reveal text={station.title} />

        {station.kind === "read" && <ReadReveal station={station} />}

        {station.kind === "patterns" && (
          <PatternDeck patterns={path.patterns} tapped={tapped} onToggle={toggle} onDone={advance} />
        )}

        {(station.kind === "write" || station.kind === "letter") && (
          <WriteStation station={station} draft={draft} setDraft={setDraft} />
        )}

        {station.kind === "sort" && (
          <SortBoard
            items={sortItems}
            buckets={station.buckets ?? []}
            sorted={sorted}
            index={piece}
            onSort={(id, bucket) => {
              patch(pathId, { sorted: { ...sorted, [id]: bucket } });
              if (piece < sortItems.length - 1) {
                window.setTimeout(() => {
                  setPiece((p) => p + 1);
                }, 280);
              }
            }}
          />
        )}

        {station.kind === "scripture" && verse && (
          <div className="jny-scroll">
            {station.body ? <p className="jny-body">{station.body}</p> : null}
            <WordVerse verse={verse} />
            {station.reading ? <p className="jny-reading">{station.reading}</p> : null}
            {notes.length > 0 && (
              <button type="button" className="jny-why" onClick={() => setWhy((v) => !v)}>
                {why ? "Hide this" : "Why this is here"}
              </button>
            )}
            {why &&
              notes.map((n) => (
                <div key={n.source} className="jny-sheet-card">
                  <p>{n.text}</p>
                  <p className="jny-caveat">{n.source}</p>
                  <p className="jny-caveat">{n.caveat}</p>
                </div>
              ))}
          </div>
        )}

        {station.kind === "mirror" && (
          <div className="jny-scroll">
            {station.body ? <p className="jny-body">{station.body}</p> : null}
            {mirrorItems.length ? (
              <FlipCard
                pattern={mirrorItems[Math.min(piece, mirrorItems.length - 1)]}
                flipped={flipped}
                onFlip={() => {
                  tap();
                  setFlipped((v) => !v);
                }}
              />
            ) : (
              <p className="jny-body">Nothing was tapped. You can go back, or continue.</p>
            )}
            {station.reading ? <p className="jny-reading">{station.reading}</p> : null}
          </div>
        )}

        {station.kind === "carry" && (
          <div className="jny-scroll">
            {station.body ? <p className="jny-body">{station.body}</p> : null}
            <CarryDeck
              items={chosen.length ? chosen : path.patterns}
              carrying={carrying}
              onCarry={(id) => patch(pathId, { carrying: id })}
            />
            {station.scripture ? <WordVerse verse={station.scripture} /> : null}
            {station.reading ? <p className="jny-reading">{station.reading}</p> : null}
            {station.note ? <p className="jny-note">{station.note}</p> : null}
          </div>
        )}

        {ownCta ? (
          <div className="jny-nav">
            {stationI > 0 || piece > 0 ? <Back onClick={retreat}>Back</Back> : null}
            <Cta onClick={advance}>{last && innerLast ? "Return" : "Continue"}</Cta>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WriteStation({
  station,
  draft,
  setDraft,
}: {
  station: Station;
  draft: string;
  setDraft: (v: string) => void;
}) {
  const [paper, setPaper] = useState(Boolean(draft.trim()));
  useEffect(() => {
    setPaper(Boolean(draft.trim()));
  }, [station.id]);

  return (
    <div className="jny-scroll">
      {station.body ? <p className="jny-body">{station.body}</p> : null}
      {station.prompt ? <p className="jny-body">{station.prompt}</p> : null}
      {!paper && station.openings ? (
        <Openings
          openings={station.openings}
          onPick={(o) => {
            setDraft(`${o} `);
            setPaper(true);
          }}
        />
      ) : (
        <textarea
          className="jny-paper"
          value={draft}
          placeholder={station.placeholder || "Begin here."}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
      {!paper && station.openings ? (
        <button type="button" className="jny-text-link" onClick={() => setPaper(true)}>
          Write without an opening
        </button>
      ) : null}
    </div>
  );
}


========================================================================
FILE: src/journey/play.tsx
BYTES: 8490
LINES: 321
========================================================================

"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Pattern, Station, Verse } from "./paths";
import { Choice, Choices, Cta, tap, useDrag } from "./chrome";

export function Dual({
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="jny-dual">
      <button
        type="button"
        className="jny-cta"
        onClick={() => {
          tap();
          onPrimary();
        }}
      >
        {primary}
      </button>
      <button
        type="button"
        className="jny-cta ghost"
        onClick={() => {
          tap();
          onSecondary();
        }}
      >
        {secondary}
      </button>
    </div>
  );
}

export function PatternDeck({
  patterns,
  tapped,
  onToggle,
  onDone,
}: {
  patterns: Pattern[];
  tapped: string[];
  onToggle: (id: string) => void;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState<"keep" | "pass" | null>(null);
  const done = i >= patterns.length;
  const current = patterns[i];
  const kept = patterns.filter((p) => tapped.includes(p.id));

  useEffect(() => {
    setI(0);
  }, [patterns]);

  const choose = (keep: boolean) => {
    if (!current || leaving) return;
    if (keep && !tapped.includes(current.id)) onToggle(current.id);
    if (!keep && tapped.includes(current.id)) onToggle(current.id);
    try {
      navigator.vibrate?.(keep ? 12 : 6);
    } catch {
      /* no haptic */
    }
    setLeaving(keep ? "keep" : "pass");
    window.setTimeout(() => {
      setLeaving(null);
      setI((n) => n + 1);
    }, 280);
  };

  const { dx, bind } = useDrag((dir) => {
    if (dir === "right") choose(true);
    else choose(false);
  });

  if (done) {
    return (
      <div className="jny-scroll">
        <p className="jny-kicker">Kept</p>
        <h1 className="jny-title">Here is what sounded like you</h1>
        {kept.length === 0 ? (
          <p className="jny-body">Nothing was kept. That is allowed. You can go back, or continue.</p>
        ) : (
          <Choices>
            {kept.map((p, n) => (
              <Choice
                key={p.id}
                kicker={String(n + 1).padStart(2, "0")}
                title={p.label}
                on
                onClick={() => onToggle(p.id)}
              />
            ))}
          </Choices>
        )}
        <p className="jny-note">Tap one to put it back. Nothing is counted.</p>
        <Cta onClick={onDone}>Continue</Cta>
      </div>
    );
  }

  const lean = !leaving && Math.abs(dx) > 24 ? (dx > 0 ? " lean-keep" : " lean-pass") : "";

  return (
    <>
      <div className="jny-tray" aria-live="polite">
        {kept.length ? (
          kept.map((p) => (
            <span key={p.id} className="jny-pill">
              {p.label.replace(/^I /, "")}
            </span>
          ))
        ) : (
          <span className="jny-tray-empty">Swipe right if this is you. Left to pass.</span>
        )}
      </div>
      <div className="jny-deck">
        <article
          className={`jny-play-card${leaving === "keep" ? " keep" : leaving === "pass" ? " pass" : ""}${dx ? " drag" : ""}${lean}`}
          key={current.id}
          style={leaving ? undefined : { transform: `translateX(${dx}px) rotate(${dx / 28}deg)` }}
          {...bind}
        >
          <small>
            {i + 1} of {patterns.length}
          </small>
          <h2>{current.label}</h2>
        </article>
      </div>
      <Dual primary="This is me" secondary="Pass" onPrimary={() => choose(true)} onSecondary={() => choose(false)} />
      <button type="button" className="jny-text-link" onClick={onDone}>
        Continue with these
      </button>
    </>
  );
}

export function SortBoard({
  items,
  buckets,
  sorted,
  index,
  onSort,
}: {
  items: Pattern[];
  buckets: { id: string; label: string }[];
  sorted: Record<string, string>;
  index: number;
  onSort: (id: string, bucket: string) => void;
}) {
  const item = items[index];
  if (!item) return <p className="jny-body">Nothing was tapped. You can go back, or continue.</p>;
  const chosen = sorted[item.id];
  return (
    <div className="jny-scroll">
      <article className="jny-play-card compact">
        <small>
          {index + 1} of {items.length}
        </small>
        <h2>{item.label}</h2>
      </article>
      <Choices>
        {buckets.map((b) => (
          <Choice key={b.id} title={b.label} on={chosen === b.id} onClick={() => onSort(item.id, b.id)} />
        ))}
      </Choices>
    </div>
  );
}

export function FlipCard({ pattern, flipped, onFlip }: { pattern: Pattern; flipped: boolean; onFlip: () => void }) {
  return (
    <button type="button" className={`jny-flip${flipped ? " on" : ""}`} onClick={onFlip} aria-label="Turn the card">
      <span className="jny-flip-inner">
        <span className="jny-face">
          <small>What it costs</small>
          <strong>{pattern.label}</strong>
          <p>{pattern.cost}</p>
          <em>Tap to turn</em>
        </span>
        <span className="jny-face back">
          <small>What it was for</small>
          <strong>{pattern.label}</strong>
          <p>{pattern.gift}</p>
        </span>
      </span>
    </button>
  );
}

export function CarryDeck({
  items,
  carrying,
  onCarry,
}: {
  items: Pattern[];
  carrying?: string;
  onCarry: (id: string) => void;
}) {
  const [i, setI] = useState(0);
  const current = items[i];
  if (!current) return <p className="jny-body">Nothing was tapped. You can go back, or continue.</p>;
  const on = carrying === current.id;

  const { dx, bind } = useDrag((dir) => {
    if (dir === "left") setI((n) => (n + 1) % items.length);
    else setI((n) => (n - 1 + items.length) % items.length);
  });

  return (
    <>
      <article
        className={`jny-play-card${on ? " keep" : ""}${dx ? " drag" : ""}`}
        style={{ transform: `translateX(${dx}px)` }}
        {...bind}
      >
        <small>
          {i + 1} of {items.length}
        </small>
        <h2>{current.gift}</h2>
      </article>
      <Dual
        primary={on ? "Carrying this" : "Carry this"}
        secondary="Another"
        onPrimary={() => onCarry(current.id)}
        onSecondary={() => setI((n) => (n + 1) % items.length)}
      />
    </>
  );
}

export function Openings({
  openings,
  onPick,
}: {
  openings: string[];
  onPick: (opening: string) => void;
}) {
  return (
    <Choices>
      {openings.map((o, i) => (
        <Choice key={o} kicker={String(i + 1).padStart(2, "0")} title={o} onClick={() => onPick(o)} />
      ))}
    </Choices>
  );
}

export function VerseCard({ verse, children }: { verse: Verse; children?: ReactNode }) {
  return (
    <blockquote className="jny-verse">
      <p>“{verse.text}”</p>
      <cite>{verse.reference}</cite>
      {children}
    </blockquote>
  );
}

export function WordVerse({ verse }: { verse: Verse }) {
  const [lit, setLit] = useState<Set<number>>(() => new Set());
  const words = verse.text.split(/\s+/);

  useEffect(() => {
    setLit(new Set());
  }, [verse.text, verse.reference]);

  return (
    <blockquote className="jny-verse living">
      <p>
        {words.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            className={`jny-word${lit.has(i) ? " on" : ""}`}
            onClick={() => {
              tap();
              setLit((s) => {
                const next = new Set(s);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              });
            }}
          >
            {word}
          </button>
        ))}
      </p>
      <cite>{verse.reference}</cite>
      <em>Tap a word to keep it lit.</em>
    </blockquote>
  );
}

export function ReadReveal({ station }: { station: Station }) {
  const [open, setOpen] = useState(0);
  const bits = [station.body, station.reading].filter(Boolean) as string[];
  return (
    <div className="jny-scroll">
      {bits.slice(0, Math.max(1, open + 1)).map((b, i) => (
        <p key={i} className={i === 0 ? "jny-body" : "jny-reading"}>
          {b}
        </p>
      ))}
      {open < bits.length - 1 ? (
        <button type="button" className="jny-text-link" onClick={() => setOpen((n) => n + 1)}>
          Stay with this
        </button>
      ) : null}
    </div>
  );
}


========================================================================
FILE: src/journey/rooms.tsx
BYTES: 22561
LINES: 707
========================================================================

"use client";

import { useEffect, useRef, useState } from "react";
import { Back, Choice, Choices, Cta, Reveal, Sheet, tap, useDrag, useImmersive } from "./chrome";
import { Dual } from "./play";
import { FOCUS_KINDS, TONES, useJourney, type FocusKind, type JournalTone } from "./store";
import { splitSermon } from "./sermon";

const OPENINGS = ["I am carrying", "I noticed", "I am grateful", "I cannot name it yet"];

function questionForHour() {
  const h = new Date().getHours();
  if (h < 5 || h >= 21) return "What is true tonight?";
  if (h < 12) return "What is true this morning?";
  if (h < 17) return "What is true this hour?";
  return "What is true this evening?";
}

function formatDay(at: number) {
  const d = new Date(at);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    rest: d.toLocaleDateString(undefined, { month: "long", day: "numeric" }),
  };
}

export function JournalRoom() {
  const entries = useJourney((s) => s.journal);
  const add = useJourney((s) => s.addJournal);
  const remove = useJourney((s) => s.removeJournal);
  const setRoom = useJourney((s) => s.setRoom);
  const [phase, setPhase] = useState<"page" | "ask" | "tone" | "write">(entries.length ? "page" : "ask");
  const [index, setIndex] = useState(0);
  const [opening, setOpening] = useState("");
  const [picked, setPicked] = useState("");
  const [tone, setTone] = useState<JournalTone>("still");
  const [text, setText] = useState("");
  const question = questionForHour();

  useImmersive(true);

  const page = entries[Math.min(index, Math.max(entries.length - 1, 0))];
  const wash = phase === "page" ? page?.tone : tone;

  const { dx, bind } = useDrag((dir) => {
    if (phase !== "page" || entries.length < 2) return;
    if (dir === "left") setIndex((n) => Math.min(entries.length - 1, n + 1));
    else setIndex((n) => Math.max(0, n - 1));
  });

  const beginWrite = () => {
    tap();
    setOpening("");
    setPicked("");
    setTone("still");
    setText("");
    setPhase("ask");
  };

  const pickOpening = (value: string) => {
    tap();
    setPicked(value);
    window.setTimeout(() => {
      setOpening(value);
      setPhase("tone");
    }, 220);
  };

  const pickTone = (id: JournalTone) => {
    tap();
    setTone(id);
    window.setTimeout(() => {
      setText(opening && opening !== "I cannot name it yet" ? `${opening} ` : "");
      setPhase("write");
    }, 420);
  };

  const keep = () => {
    const body = text.trim();
    if (!body) return;
    add(body, tone);
    setIndex(0);
    setPhase("page");
    tap();
  };

  if (phase === "ask") {
    return (
      <div className="jny jny-full" data-tone={tone}>
        <div className="jny-stage jny-threshold">
          <Back onClick={() => (entries.length ? setPhase("page") : setRoom("hub"))}>Back</Back>
          <p className="jny-kicker">Journal</p>
          <Reveal text={question} />
          <p className="jny-sub">Not a performance. A page that will still be here tomorrow.</p>
          <div className="jny-chips">
            {OPENINGS.map((o) => (
              <button
                key={o}
                type="button"
                className={`jny-chip${picked === o ? " on" : ""}`}
                onClick={() => pickOpening(o)}
              >
                {o}
              </button>
            ))}
            <button type="button" className="jny-chip" onClick={() => pickOpening("")}>
              Write freely
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "tone") {
    return (
      <div className="jny jny-full" data-tone={tone}>
        <div className="jny-stage jny-threshold">
          <Back onClick={() => setPhase("ask")}>Back</Back>
          <p className="jny-kicker">A colour for the page</p>
          <Reveal text="Stay with the hour." />
          <p className="jny-sub">The colour is not a mood. It is only a light on the paper.</p>
          <div className="jny-orbs" role="group" aria-label="A colour for the page">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`jny-orb-tone ${t.id}${tone === t.id ? " on" : ""}`}
                onClick={() => pickTone(t.id)}
              >
                <i aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "write") {
    return (
      <div className="jny jny-full" data-tone={tone}>
        <div className="jny-stage jny-threshold">
          <Back onClick={() => setPhase("tone")}>Back</Back>
          <p className="jny-kicker">{question}</p>
          <textarea
            className="jny-paper tall"
            value={text}
            placeholder="Begin here."
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <Cta hold disabled={!text.trim()} onClick={keep}>
            Keep this
          </Cta>
        </div>
      </div>
    );
  }

  const day = page ? formatDay(page.at) : null;

  return (
    <div className="jny jny-full" data-tone={wash}>
      <div className="jny-stage jny-threshold">
        <Back onClick={() => setRoom("hub")}>Back</Back>
        {page && day ? (
          <>
            <time className="jny-date">
              <em>{day.weekday}</em>
              <strong>{day.rest}</strong>
            </time>
            <p
              className="jny-page"
              style={dx ? { transform: `translateX(${dx * 0.12}px)` } : undefined}
              {...bind}
            >
              {page.text}
            </p>
            {entries.length > 1 ? (
              <div className="jny-dots" aria-hidden="true">
                {entries.slice(0, 8).map((e, i) => (
                  <i key={e.id} className={i === index ? "on" : undefined} />
                ))}
              </div>
            ) : null}
            <div className="jny-cta-slot">
              <button type="button" className="jny-text-link" onClick={() => remove(page.id)}>
                Remove
              </button>
              <Cta hold onClick={beginWrite}>
                Write
              </Cta>
            </div>
          </>
        ) : (
          <>
            <p className="jny-body">Nothing kept yet.</p>
            <Cta hold onClick={beginWrite}>
              Write
            </Cta>
          </>
        )}
      </div>
    </div>
  );
}

export function FocusRoom() {
  const focus = useJourney((s) => s.focus);
  const focusKind = useJourney((s) => s.focusKind);
  const setFocus = useJourney((s) => s.setFocus);
  const setRoom = useJourney((s) => s.setRoom);
  const [phase, setPhase] = useState<"live" | "pick" | "write">(focus ? "live" : "pick");
  const [kind, setKind] = useState<FocusKind | null>(focusKind ?? null);
  const [picked, setPicked] = useState<FocusKind | null>(null);
  const [text, setText] = useState(focus ?? "");

  useImmersive(true);

  const pick = (id: FocusKind) => {
    tap();
    setPicked(id);
    window.setTimeout(() => {
      setKind(id);
      setPhase("write");
    }, 220);
  };

  const stay = () => {
    if (!text.trim() || !kind) return;
    setFocus(text.trim(), kind);
    tap();
    setPhase("live");
  };

  if (phase === "live" && focus) {
    const kindLine = FOCUS_KINDS.find((k) => k.id === focusKind)?.title;
    return (
      <div className="jny jny-full">
        <div className="jny-stage jny-threshold">
          <Back onClick={() => setRoom("hub")}>Return</Back>
          <div className="jny-live">
            <span className="jny-live-dot" aria-hidden="true" />
            <h1>{focus}</h1>
            <p>{kindLine ? `${kindLine} · in front of you` : "In front of you."}</p>
          </div>
          <Dual
            primary="Return"
            secondary="Change"
            onPrimary={() => setRoom("hub")}
            onSecondary={() => {
              setPhase("pick");
              setPicked(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (phase === "write" && kind) {
    const meta = FOCUS_KINDS.find((k) => k.id === kind);
    return (
      <div className="jny jny-full">
        <div className="jny-stage jny-threshold">
          <Back onClick={() => setPhase("pick")}>Back</Back>
          <p className="jny-kicker">{meta?.title}</p>
          <Reveal text="Stay with this." />
          <p className="jny-sub">{meta?.line}</p>
          <input
            className="jny-field line"
            value={text}
            placeholder="Name it in a sentence."
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <Cta hold disabled={!text.trim()} onClick={stay}>
            Stay with this
          </Cta>
        </div>
      </div>
    );
  }

  return (
    <div className="jny jny-full">
      <div className="jny-stage jny-threshold">
        <Back onClick={() => setRoom("hub")}>Back</Back>
        <p className="jny-kicker">Focus</p>
        <Reveal text="One thing." />
        <p className="jny-sub">Not a list. Stay with it until it has somewhere to live.</p>
        <div className="jny-scroll">
          <Choices>
            {FOCUS_KINDS.map((k) => (
              <Choice
                key={k.id}
                kicker={k.title}
                title={k.line}
                on={picked === k.id}
                onClick={() => pick(k.id)}
              />
            ))}
          </Choices>
        </div>
      </div>
    </div>
  );
}

function BreathField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const born = performance.now();
    const motes = Array.from({ length: 56 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      s: 0.03 + Math.random() * 0.1,
      a: 0.12 + Math.random() * 0.22,
      p: Math.random() * Math.PI * 2,
    }));
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    const tick = (now: number) => {
      const t = (now - born) / 1000;
      ctx.clearRect(0, 0, w, h);
      const breathe = reduced ? 0.65 : 0.5 + 0.5 * Math.sin((t * Math.PI) / 4);
      for (const m of motes) {
        const x = ((m.x + (reduced ? 0 : t * m.s * 0.015)) % 1 + 1) % 1;
        const y = ((m.y + Math.sin(t * 0.28 + m.p) * 0.018) % 1 + 1) % 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(243, 241, 236, ${m.a * (0.4 + breathe * 0.6)})`;
        ctx.arc(x * w, y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas className="jny-motes" ref={ref} aria-hidden="true" />;
}

export function BreathRoom() {
  const setRoom = useJourney((s) => s.setRoom);
  const [sitting, setSitting] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [elapsed, setElapsed] = useState(0);
  const [goal, setGoal] = useState(0);

  useImmersive(true);

  useEffect(() => {
    if (!sitting) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = Date.now() - start;
      setElapsed(t);
      const cycle = t % 8000;
      setPhase(cycle < 4000 ? "in" : "out");
    }, 200);
    return () => window.clearInterval(id);
  }, [sitting]);

  const shown = sitting && (goal ? elapsed > goal : elapsed > 24_000);

  const sit = (ms: number) => {
    tap();
    setGoal(ms);
    setElapsed(0);
    setSitting(true);
    setSheet(false);
  };

  return (
    <div className="jny jny-full">
      <BreathField />
      <div className="jny-stage jny-threshold">
        <Back onClick={() => setRoom("hub")}>Return</Back>
        <button
          type="button"
          className="jny-orb-wrap"
          onClick={() => {
            tap();
            setSheet(true);
          }}
          aria-label="Choose how long to sit"
        >
          <span className="jny-orb" />
          <span className="jny-phase">{phase === "in" ? "In" : "Out"}</span>
        </button>
        {shown ? (
          <>
            <p className="jny-reading jny-center-copy">The Spirit already knows how to pray.</p>
            <blockquote className="jny-verse">
              <p>
                “In the same way, the Spirit helps us in our weakness. For we do not know how we ought to pray, but the
                Spirit Himself intercedes for us with groans too deep for words.”
              </p>
              <cite>Romans 8:26 · BSB</cite>
            </blockquote>
          </>
        ) : (
          <p className="jny-note jny-center-copy">
            {sitting ? "Stay as long as you like. Nothing is counted." : "Tap the light. Sit with this."}
          </p>
        )}
        {!sitting ? (
          <Dual primary="Sit with this" secondary="Return" onPrimary={() => sit(0)} onSecondary={() => setRoom("hub")} />
        ) : (
          <Cta hold onClick={() => setSheet(true)}>
            How long
          </Cta>
        )}
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Sit">
        <Choices>
          <Choice title="A minute" line="Then the verse, if you are still here." onClick={() => sit(60_000)} />
          <Choice title="A little longer" line="Three minutes. Leave whenever you like." onClick={() => sit(180_000)} />
          <Choice title="Stay" line="No clock. The verse will come when it is time." onClick={() => sit(0)} />
        </Choices>
      </Sheet>
    </div>
  );
}

export function NotesRoom() {
  const notes = useJourney((s) => s.notes);
  const add = useJourney((s) => s.addNote);
  const remove = useJourney((s) => s.removeNote);
  const setRoom = useJourney((s) => s.setRoom);
  const [mode, setMode] = useState<"home" | "write" | "split" | "deck" | "page">("home");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [points, setPoints] = useState<{ text: string; keep: boolean }[]>([]);
  const [pi, setPi] = useState(0);
  const [leaving, setLeaving] = useState<"keep" | "pass" | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useImmersive(true);

  const reset = () => {
    setTitle("");
    setBody("");
    setPoints([]);
    setPi(0);
    setLeaving(null);
    setError("");
    setMode("home");
  };

  const keepPoints = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await splitSermon({ data: { text: body } });
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      setPoints(result.points.map((text) => ({ text, keep: true })));
      setPi(0);
      setMode("deck");
    } catch {
      setError("The notes could not be broken up just now.");
    }
    setBusy(false);
  };

  const save = () => {
    const kept = points.filter((p) => p.keep).map((p) => p.text);
    const text = kept.length ? kept.map((p, i) => `${i + 1}. ${p}`).join("\n") : body.trim();
    if (!text) return;
    add(title.trim() || "Kept", text, kept.length ? kept : undefined);
    reset();
    tap();
  };

  const saveLine = () => {
    if (!body.trim()) return;
    add(title.trim() || "The line that stayed", body.trim());
    reset();
    tap();
  };

  const choosePoint = (keep: boolean) => {
    const current = points[pi];
    if (!current || leaving) return;
    tap();
    setPoints((all) => all.map((x, j) => (j === pi ? { ...x, keep } : x)));
    setLeaving(keep ? "keep" : "pass");
    window.setTimeout(() => {
      setLeaving(null);
      setPi((n) => n + 1);
    }, 280);
  };

  const { dx, bind } = useDrag((dir) => {
    if (mode !== "deck") return;
    if (dir === "right") choosePoint(true);
    else choosePoint(false);
  });

  if (mode === "write" || mode === "split") {
    return (
      <div className="jny jny-full">
        <div className="jny-stage jny-threshold">
          <Back onClick={reset}>Back</Back>
          <p className="jny-kicker">{mode === "split" ? "A sermon" : "A line"}</p>
          <Reveal text={mode === "split" ? "What was said." : "The line that stayed."} />
          <p className="jny-sub">
            {mode === "split"
              ? "Paste what was said. We will break it into points you can keep or pass."
              : "Who was speaking, and the sentence that would not leave."}
          </p>
          <input
            className="jny-field line"
            value={title}
            placeholder="Who was speaking"
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="jny-paper tall"
            value={body}
            placeholder={mode === "split" ? "Paste the notes or a transcript." : "The line that stayed."}
            onChange={(e) => setBody(e.target.value)}
          />
          {error ? <p className="jny-note">{error}</p> : null}
          {busy ? <p className="jny-listen">Listening…</p> : null}
          {mode === "split" ? (
            <Cta hold disabled={busy || body.trim().length < 40} onClick={() => void keepPoints()}>
              Break into points
            </Cta>
          ) : (
            <Cta hold disabled={!body.trim()} onClick={saveLine}>
              Keep this
            </Cta>
          )}
        </div>
      </div>
    );
  }

  if (mode === "deck") {
    const current = points[pi];
    const done = pi >= points.length;
    const kept = points.filter((p) => p.keep);

    if (done) {
      return (
        <div className="jny jny-full">
          <div className="jny-stage jny-threshold">
            <Back onClick={reset}>Back</Back>
            <p className="jny-kicker">Kept</p>
            <Reveal text="Here is what stayed." />
            <div className="jny-scroll">
              {kept.length ? (
                kept.map((p, i) => (
                  <article key={`${p.text}-${i}`} className="jny-sheet-card">
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <p>{p.text}</p>
                  </article>
                ))
              ) : (
                <p className="jny-body">Nothing was kept. That is allowed.</p>
              )}
            </div>
            <Cta hold disabled={!kept.length} onClick={save}>
              Keep these
            </Cta>
          </div>
        </div>
      );
    }

    const lean = !leaving && Math.abs(dx) > 24 ? (dx > 0 ? " lean-keep" : " lean-pass") : "";

    return (
      <div className="jny jny-full">
        <div className="jny-stage jny-threshold">
          <Back onClick={reset}>Back</Back>
          <p className="jny-kicker">
            {pi + 1} of {points.length}
          </p>
          <div className="jny-deck">
            <article
              className={`jny-play-card${leaving === "keep" ? " keep" : leaving === "pass" ? " pass" : ""}${dx ? " drag" : ""}${lean}`}
              style={leaving ? undefined : { transform: `translateX(${dx}px) rotate(${dx / 28}deg)` }}
              {...bind}
            >
              <small>{current.keep ? "A point" : "A point"}</small>
              <h2>{current.text}</h2>
            </article>
          </div>
          <Dual primary="Keep" secondary="Pass" onPrimary={() => choosePoint(true)} onSecondary={() => choosePoint(false)} />
        </div>
      </div>
    );
  }

  const open = notes.find((n) => n.id === openId);

  if (mode === "page" && open) {
    const day = formatDay(open.at);
    return (
      <div className="jny jny-full">
        <div className="jny-stage jny-threshold">
          <Back
            onClick={() => {
              setOpenId(null);
              setMode("home");
            }}
          >
            Back
          </Back>
          <time className="jny-date">
            <em>{day.weekday}</em>
            <strong>{open.title}</strong>
          </time>
          <div className="jny-page">
            <p>{open.body}</p>
          </div>
          <button type="button" className="jny-text-link" onClick={() => remove(open.id)}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jny jny-full">
      <div className="jny-stage jny-threshold">
        <Back onClick={() => setRoom("hub")}>Back</Back>
        <p className="jny-kicker">Notes</p>
        <Reveal text="What stayed?" />
        <div className="jny-scroll">
          <button type="button" className="jny-dest" onClick={() => setMode("write")}>
            <small>Keep</small>
            <h2>The line that stayed</h2>
            <p>Who was speaking, and the sentence that would not leave.</p>
          </button>
          <button type="button" className="jny-dest" onClick={() => setMode("split")}>
            <small>A sermon</small>
            <h2>Break into points</h2>
            <p>Paste what was said. Keep or pass each one.</p>
          </button>
          {notes.length ? (
            <>
              <div className="jny-section">
                <h2>Kept</h2>
                <span>{notes.length}</span>
              </div>
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="jny-kept-row"
                  onClick={() => {
                    tap();
                    setOpenId(n.id);
                    setMode("page");
                  }}
                >
                  <time>{formatDay(n.at).rest}</time>
                  <p>{n.title}</p>
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}


========================================================================
FILE: src/journey/chrome.tsx
BYTES: 5112
LINES: 224
========================================================================

"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";

export function tap() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* no haptic on this device */
  }
}

export function Stage({
  children,
  immersive,
  className = "",
}: {
  children: ReactNode;
  immersive?: boolean;
  className?: string;
}) {
  return (
    <div className={`jny${immersive ? " jny-full" : ""} ${className}`.trim()}>
      <div className="jny-stage">{children}</div>
    </div>
  );
}

export function Back({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="jny-back" onClick={onClick}>
      {children}
    </button>
  );
}

export function Cta({
  children,
  onClick,
  disabled,
  hold,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hold?: boolean;
}) {
  return (
    <button type="button" className={`jny-cta${hold ? " hold" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="jny-kicker">{children}</p>;
}

export function Reveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const root = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = el.querySelectorAll("span[data-w]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    const tween = gsap.fromTo(
      words,
      { opacity: 0, y: 10, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.7,
        stagger: 0.045,
        delay,
        ease: "power3.out",
      },
    );
    return () => {
      tween.kill();
    };
  }, [text, delay]);

  const parts = text.split(" ");
  return (
    <h1 ref={root} className={className ?? "jny-title"}>
      {parts.map((word, i) => (
        <span key={`${word}-${i}`} data-w>
          {word}
          {i < parts.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </h1>
  );
}

export function useImmersive(on: boolean) {
  useEffect(() => {
    if (!on) return;
    document.body.classList.add("jny-immersive");
    return () => document.body.classList.remove("jny-immersive");
  }, [on]);
}

export function useDrag(onFlick: (dir: "left" | "right") => void, threshold = 64) {
  const origin = useRef({ x: 0, y: 0 });
  const live = useRef({ x: 0, y: 0 });
  const [dx, setDx] = useState(0);
  const active = useRef(false);
  const cb = useRef(onFlick);
  cb.current = onFlick;

  const bind = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      active.current = true;
      origin.current = { x: e.clientX, y: e.clientY };
      live.current = { x: 0, y: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!active.current) return;
      const x = e.clientX - origin.current.x;
      const y = e.clientY - origin.current.y;
      live.current = { x, y };
      if (Math.abs(x) > Math.abs(y)) setDx(x);
    },
    onPointerUp: () => {
      if (!active.current) return;
      active.current = false;
      const { x, y } = live.current;
      live.current = { x: 0, y: 0 };
      setDx(0);
      if (Math.abs(x) < threshold || Math.abs(x) < Math.abs(y)) return;
      cb.current(x > 0 ? "right" : "left");
    },
    onPointerCancel: () => {
      active.current = false;
      setDx(0);
    },
  };

  return { dx, bind };
}

export function Choices({ children }: { children: ReactNode }) {
  return <div className="jny-choices">{children}</div>;
}

export function Choice({
  kicker,
  title,
  line,
  onClick,
  on,
}: {
  kicker?: string;
  title: string;
  line?: string;
  onClick: () => void;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      className={`jny-choice${on ? " on" : ""}`}
      onClick={() => {
        tap();
        onClick();
      }}
    >
      {kicker ? <small>{kicker}</small> : null}
      <strong>{title}</strong>
      {line ? <span>{line}</span> : null}
    </button>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mount, setMount] = useState(open);

  useEffect(() => {
    if (open) {
      setMount(true);
      return;
    }
    const t = window.setTimeout(() => setMount(false), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mount) return null;

  return (
    <div className={`jny-sheet-root${open ? " open" : ""}`}>
      <button type="button" className="jny-sheet-back" aria-label="Close" onClick={onClose} />
      <div className="jny-sheet" role="dialog" aria-modal="true">
        {title ? <p className="jny-kicker">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}


========================================================================
FILE: src/journey/store.ts
BYTES: 7303
LINES: 216
========================================================================

import { create } from "zustand";

const KEY = "selah-journey-v3";

export type Room = "hub" | "paths" | "journal" | "focus" | "breath" | "notes";

export type FocusKind = "scripture" | "intercession" | "creation" | "question";

export type JournalTone = "still" | "warm" | "dawn" | "garden";

export const FOCUS_KINDS: { id: FocusKind; label: string; title: string; line: string }[] = [
  { id: "scripture", label: "a passage", title: "Passage", line: "A verse to stay with" },
  { id: "intercession", label: "someone I am holding", title: "Someone", line: "A person in front of you" },
  { id: "creation", label: "something in creation", title: "Creation", line: "A thing God made" },
  { id: "question", label: "a question I am carrying", title: "Question", line: "Something unfinished" },
];

export const TONES: { id: JournalTone; label: string }[] = [
  { id: "still", label: "Still" },
  { id: "warm", label: "Warm" },
  { id: "dawn", label: "Dawn" },
  { id: "garden", label: "Garden" },
];

export type PathProgress = {
  station: number;
  tapped: string[];
  chosen?: string;
  origin?: string;
  letter?: string;
  sorted?: Record<string, string>;
  carrying?: string;
};

export type JournalEntry = { id: string; at: number; text: string; tone: JournalTone };
export type NoteEntry = { id: string; at: number; title: string; body: string; points?: string[] };

type Saved = {
  onboarded: boolean;
  focus?: string;
  focusKind?: FocusKind;
  journal: JournalEntry[];
  notes: NoteEntry[];
  progress: Record<string, PathProgress>;
};

function emptySaved(): Saved {
  return { onboarded: false, journal: [], notes: [], progress: {} };
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySaved();
    const p = JSON.parse(raw) as Saved;
    const progress: Record<string, PathProgress> = {};
    if (p.progress && typeof p.progress === "object") {
      for (const [id, value] of Object.entries(p.progress)) {
        if (!value || typeof value !== "object") continue;
        progress[id] = {
          station: Number(value.station) || 0,
          tapped: Array.isArray(value.tapped) ? value.tapped.map(String) : [],
          chosen: value.chosen,
          origin: value.origin,
          letter: value.letter,
          sorted: value.sorted && typeof value.sorted === "object" ? value.sorted : undefined,
          carrying: value.carrying,
        };
      }
    }
    return {
      onboarded: Boolean(p.onboarded),
      focus: typeof p.focus === "string" ? p.focus : undefined,
      focusKind: p.focusKind,
      journal: Array.isArray(p.journal)
        ? p.journal.map((e) => ({
            id: String(e.id),
            at: Number(e.at) || Date.now(),
            text: String(e.text ?? ""),
            tone: (e.tone as JournalTone) || "still",
          }))
        : [],
      notes: Array.isArray(p.notes) ? p.notes : [],
      progress,
    };
  } catch {
    return emptySaved();
  }
}

function snapshot(s: Saved): Saved {
  return {
    onboarded: s.onboarded,
    focus: s.focus,
    focusKind: s.focusKind,
    journal: s.journal,
    notes: s.notes,
    progress: s.progress,
  };
}

function persist(s: Saved) {
  localStorage.setItem(KEY, JSON.stringify(snapshot(s)));
}

type State = Saved & {
  room: Room;
  walking: string | null;
  setRoom: (r: Room) => void;
  finishOnboard: () => void;
  startWalk: (id: string) => void;
  leaveWalk: () => void;
  patchProgress: (id: string, patch: Partial<PathProgress>) => void;
  setFocus: (v: string, kind?: FocusKind) => void;
  addJournal: (text: string, tone: JournalTone) => void;
  removeJournal: (id: string) => void;
  addNote: (title: string, body: string, points?: string[]) => void;
  removeNote: (id: string) => void;
  exportKept: () => string;
  eraseKept: () => void;
};

const emptyProgress = (): PathProgress => ({ station: 0, tapped: [] });

export const useJourney = create<State>((set, get) => {
  const saved = typeof window === "undefined" ? emptySaved() : load();
  return {
    ...saved,
    room: "hub",
    walking: null,
    setRoom: (room) => set({ room, walking: null }),
    finishOnboard: () => {
      persist({ ...get(), onboarded: true });
      set({ onboarded: true, room: "hub" });
    },
    startWalk: (id) => {
      const progress = { ...get().progress };
      if (!progress[id]) progress[id] = emptyProgress();
      persist({ ...get(), progress });
      set({ walking: id, progress, room: "paths" });
    },
    leaveWalk: () => set({ walking: null, room: "paths" }),
    patchProgress: (id, patch) => {
      const cur = get().progress[id] ?? emptyProgress();
      const next: PathProgress = {
        station: patch.station ?? cur.station,
        tapped: patch.tapped ?? cur.tapped,
        chosen: patch.chosen ?? cur.chosen,
        origin: patch.origin ?? cur.origin,
        letter: patch.letter ?? cur.letter,
        sorted: patch.sorted ?? cur.sorted,
        carrying: patch.carrying ?? cur.carrying,
      };
      const progress = { ...get().progress, [id]: next };
      persist({ ...get(), progress });
      set({ progress });
    },
    setFocus: (focus, focusKind) => {
      persist({ ...get(), focus, focusKind: focusKind ?? get().focusKind });
      set({ focus, focusKind: focusKind ?? get().focusKind });
    },
    addJournal: (text, tone) => {
      const journal = [{ id: crypto.randomUUID(), at: Date.now(), text, tone }, ...get().journal];
      persist({ ...get(), journal });
      set({ journal });
    },
    removeJournal: (id) => {
      const journal = get().journal.filter((e) => e.id !== id);
      persist({ ...get(), journal });
      set({ journal });
    },
    addNote: (title, body, points) => {
      const notes = [{ id: crypto.randomUUID(), at: Date.now(), title, body, points }, ...get().notes];
      persist({ ...get(), notes });
      set({ notes });
    },
    removeNote: (id) => {
      const notes = get().notes.filter((n) => n.id !== id);
      persist({ ...get(), notes });
      set({ notes });
    },
    exportKept: () => {
      const s = snapshot(get());
      const lines: string[] = ["Selah · Journey", "Kept on this device.", ""];
      if (s.focus) {
        const kind = FOCUS_KINDS.find((k) => k.id === s.focusKind)?.label;
        lines.push("Focus", kind ? `${s.focus} · ${kind}` : s.focus, "");
      }
      if (s.journal.length) {
        lines.push("Journal");
        for (const e of s.journal) {
          lines.push(new Date(e.at).toISOString().slice(0, 10));
          lines.push(e.text, "");
        }
      }
      if (s.notes.length) {
        lines.push("Notes");
        for (const n of s.notes) {
          lines.push(n.title);
          lines.push(n.body, "");
        }
      }
      for (const [id, p] of Object.entries(s.progress)) {
        if (p.origin) lines.push(`Origin · ${id}`, p.origin, "");
        if (p.letter) lines.push(`Letter · ${id}`, p.letter, "");
      }
      lines.push("", "```json", JSON.stringify(s, null, 2), "```");
      return lines.join("\n");
    },
    eraseKept: () => {
      const next: Saved = { onboarded: get().onboarded, journal: [], notes: [], progress: {} };
      persist(next);
      set({ ...next, focus: undefined, focusKind: undefined, walking: null, room: "hub" });
    },
  };
});


========================================================================
FILE: src/journey/paths.ts
BYTES: 31213
LINES: 812
========================================================================

export type Pattern = { id: string; label: string; cost: string; gift: string };

export type Note = { text: string; source: string; url?: string; caveat: string };

export type Verse = {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  excerpt?: boolean;
};

export type StationKind = "read" | "patterns" | "write" | "sort" | "letter" | "scripture" | "mirror" | "carry";

export type Station = {
  id: string;
  kind: StationKind;
  kicker: string;
  title: string;
  body?: string;
  reading?: string;
  note?: string;
  prompt?: string;
  placeholder?: string;
  openings?: string[];
  buckets?: { id: string; label: string }[];
  notes?: Note[];
  scripture?: Verse;
  scriptures?: Verse[];
};

export type Path = {
  id: string;
  kicker: string;
  title: string;
  about: string;
  shape: string;
  patterns: Pattern[];
  stations: Station[];
};

const CARRY: Pattern[] = [
  {
    id: "sorry",
    label: "I apologise when nothing is wrong",
    cost: "You take the blame before anyone has offered it, and people start to believe you.",
    gift: "You notice the room. Very few people can feel a mood change as fast as you can.",
  },
  {
    id: "quiet",
    label: "I go quiet when I am hurt",
    cost: "The people who love you are left guessing, and guessing wrong.",
    gift: "You do not say the thing that cannot be taken back. That is a rarer discipline than it looks.",
  },
  {
    id: "alone",
    label: "I would rather do it myself than ask",
    cost: "You carry things that were never meant to be carried alone, and you are tired.",
    gift: "You are genuinely capable. People rely on you because you have earned it.",
  },
  {
    id: "peace",
    label: "I keep the peace even when it costs me",
    cost: "The peace is real for everyone but you.",
    gift: "You can hold a room together. Households have survived on people like you.",
  },
  {
    id: "loud",
    label: "I get loud before I get honest",
    cost: "The volume arrives before the meaning, so the meaning gets missed.",
    gift: "You do not go numb. Something in you still refuses to accept what is wrong.",
  },
  {
    id: "responsible",
    label: "I am the responsible one, always",
    cost: "Nobody thinks to ask how you are, because you have never once shown them they should.",
    gift: "You are the reason several things did not fall apart. You may never be told that.",
  },
  {
    id: "trouble",
    label: "I assume I am about to be in trouble",
    cost: "You brace for a blow that mostly is not coming, and bracing is exhausting.",
    gift: "You prepare. You are almost never caught out.",
  },
  {
    id: "cared",
    label: "I find it hard to be looked after",
    cost: "You keep people at the distance you can manage, and then feel the distance.",
    gift: "You give easily and without keeping score. That is not nothing.",
  },
  {
    id: "joke",
    label: "I make a joke when it gets close",
    cost: "The moment passes, and the thing you almost said goes back down.",
    gift: "You can make a heavy room breathe. People feel better near you and cannot say why.",
  },
  {
    id: "worst",
    label: "I plan for the worst so it cannot surprise me",
    cost: "You live through the bad version once in advance, whether or not it ever arrives.",
    gift: "When it does arrive, you are the one who already knows what to do.",
  },
];

const ENOUGH: Pattern[] = [
  {
    id: "finish-line",
    label: "I move the finish line as soon as I reach it",
    cost: "You never actually arrive. The moment you land, the ground moves, and the win belongs to nobody.",
    gift: "You are hard to satisfy, and it is part of why your work is good. Most people stop long before you do.",
  },
  {
    id: "compliment",
    label: "I cannot take a compliment",
    cost: "You wave away the one thing that might have fed you, and eventually people stop offering it.",
    gift: "You are not living off applause. Praise does not steer you the way it steers other people.",
  },
  {
    id: "resting-work",
    label: "I work when I am meant to be resting",
    cost: "Nothing gets all of you. Not the work, and not the evening.",
    gift: "When something matters you do not put it down. People have been carried by that and never knew.",
  },
  {
    id: "compare",
    label: "I measure myself against whoever is doing better",
    cost: "You pick the one person ahead of you and hand them your whole day.",
    gift: "You can recognise something excellent when it is in front of you. Plenty of people cannot.",
  },
  {
    id: "apologise-rest",
    label: "I apologise for resting",
    cost: "Even the break costs you something, so the tiredness never fully goes.",
    gift: "You feel your responsibilities rather than shrugging at them. That is rarer than it sounds.",
  },
  {
    id: "behind",
    label: "I feel behind and I cannot say behind what",
    cost: "You are running a race with no finish line and no other runners, and somehow still losing it.",
    gift: "Something in you refuses to drift. You have a sense of what your life could be.",
  },
  {
    id: "harsh",
    label: "I talk to myself more harshly than I would talk to anyone I love",
    cost: "The voice you live with is one you would never use on a friend.",
    gift: "You hold a high line. It is why the work is careful.",
  },
  {
    id: "prove",
    label: "I need to prove I deserve to be here",
    cost: "The proving never ends, because the jury never sits down.",
    gift: "You do not take a seat for granted. That has kept you honest.",
  },
];

const VERSION: Pattern[] = [
  {
    id: "perform",
    label: "I become who the room needs",
    cost: "You leave the room and cannot remember which one of you stayed.",
    gift: "You can read a room faster than most people can enter it.",
  },
  {
    id: "edit",
    label: "I edit the story before I tell it",
    cost: "The true version never gets said, so nobody can meet it.",
    gift: "You know the weight of words. You do not spend them carelessly.",
  },
  {
    id: "fine",
    label: "I say I am fine before anyone has asked",
    cost: "The people who would have helped are sent home at the door.",
    gift: "You do not make your pain other people’s homework.",
  },
  {
    id: "mirror-them",
    label: "I match whoever I am with",
    cost: "You are very good company and very hard to find.",
    gift: "People feel met by you. That is a real gift.",
  },
  {
    id: "hide-mess",
    label: "I hide the mess until it is presentable",
    cost: "Help arrives after the worst of it, if it arrives at all.",
    gift: "You have a sense of dignity. You will not make a spectacle of what hurts.",
  },
  {
    id: "almost",
    label: "I let people close, almost",
    cost: "Intimacy stops one room short of the one you actually live in.",
    gift: "You know what it costs to be known. You do not offer that lightly.",
  },
  {
    id: "image",
    label: "I keep a version of myself that cannot fail in public",
    cost: "The real one does all the failing in private, alone.",
    gift: "You can hold a standard when a room needs one.",
  },
  {
    id: "agree",
    label: "I agree out loud and disagree later, alone",
    cost: "Your actual mind never gets a seat at the table.",
    gift: "You do not start fires you cannot put out.",
  },
];

const ANGER: Pattern[] = [
  {
    id: "snap",
    label: "I snap at the people who are safest",
    cost: "The ones who stayed get the version nobody else is allowed to see.",
    gift: "With them, the guard comes down. That is not nothing.",
  },
  {
    id: "replay",
    label: "I replay the conversation until I win it",
    cost: "The day is spent twice, and the second time nobody is there.",
    gift: "You take what was said seriously. You do not shrug off a wound.",
  },
  {
    id: "shut",
    label: "I shut the door rather than say I am angry",
    cost: "The anger goes into the walls, and the house feels it anyway.",
    gift: "You would rather go quiet than say the thing that cannot come back.",
  },
  {
    id: "right",
    label: "I need to be right before I can be soft",
    cost: "Softness is held hostage until the case is closed.",
    gift: "You care about what is true. That is a form of love.",
  },
  {
    id: "body",
    label: "I feel it in my chest before I have a word for it",
    cost: "The word arrives late, after someone has already been hurt.",
    gift: "Your body tells the truth faster than your manners do.",
  },
  {
    id: "protect",
    label: "I get angry when someone I love is dismissed",
    cost: "The room meets the heat and misses the loyalty underneath it.",
    gift: "You will not stand by. People have been defended by that.",
  },
  {
    id: "small",
    label: "I go small, then I go sharp",
    cost: "Nobody sees the small part. They only meet the edge.",
    gift: "You tried to make yourself less first. That is not cruelty. That is a hope.",
  },
  {
    id: "old",
    label: "I am angry about something older than this afternoon",
    cost: "Today’s person is paying a bill they did not write.",
    gift: "You have not forgotten what was unjust. Forgetting is not the same as peace.",
  },
];

const WALK_SHAPE = "Ten short stops. Leave whenever you like. Come back to the same place.";

export const PATHS: Path[] = [
  {
    id: "what-you-carry",
    kicker: "Path one",
    title: "What you carry",
    about: "Some of it you chose. A lot of it was handed to you before you could decide anything.",
    shape: WALK_SHAPE,
    patterns: CARRY,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "This is not a test",
        body: "Nothing here is scored and nothing is added up. You can skip any question and the path still works. Everything you write stays on this device — Selah has nowhere to send it.",
        reading: "You are not here to be fixed. You are here to look at something honestly, with Someone who already sees it.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these sound like you?",
        body: "Not the worst of you. Just the ordinary, automatic things — the ones you do before you have decided to.",
        note: "Tap as many or as few as you like. Nothing is counted, and you can change them any time.",
      },
      {
        id: "where",
        kind: "write",
        kicker: "Trace it",
        title: "Where did you learn it?",
        body: "Pick one of the ones you tapped. Not the biggest — just one you can see clearly.",
        prompt: "Who did you first see doing this, or when did doing it keep you safe?",
        placeholder: "In my house, being quiet was…",
      },
      {
        id: "handed-down",
        kind: "scripture",
        kicker: "Why it travels",
        title: "You learned it before anyone taught you",
        body: "Two things are true here, and it helps to have both.",
        notes: [
          {
            text: "Children copy what they see, and they keep it even when they are not using it. In one study, children who watched an adult be told off for something copied it less — until someone gave them a reason to. Then they did it just as well as everybody else. They had known how the whole time.",
            source: "Bandura A. Influence of models’ reinforcement contingencies on the acquisition of imitative responses. Journal of Personality and Social Psychology 1(6), 589–595, 1965",
            url: "https://doi.org/10.1037/h0022070",
            caveat: "Nursery-age children in a laboratory, copying an adult minutes later. It shows that watching teaches. It does not show that childhood decides an adult.",
          },
        ],
        scripture: {
          text: "You shall not bow down to them or worship them; for I, the LORD your God, am a jealous God, visiting the iniquity of the fathers on their children to the third and fourth generations of those who hate Me,",
          reference: "Exodus 20:5 · BSB",
          book: "EXO",
          chapter: 20,
          verse: 5,
        },
        reading: "Naming that something was handed to you is not blaming anyone. It is telling the truth about where it came from.",
      },
      {
        id: "not-a-sentence",
        kind: "scripture",
        kicker: "And also this",
        title: "It is not a sentence",
        body: "Ezekiel is answering people who were quoting a proverb at him — that the parents ate sour grapes and the children's teeth were set on edge. He will not have it.",
        scripture: {
          text: "The soul who sins is the one who will die. A son will not bear the iniquity of his father, and a father will not bear the iniquity of his son.",
          reference: "Ezekiel 18:20 · BSB",
          book: "EZK",
          chapter: 18,
          verse: 20,
          excerpt: true,
        },
        reading: "What you were handed is real. It is not your verdict.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these still earn their keep?",
        body: "Here are the ones you tapped. Some protected you once and have outstayed their welcome. Put each one where it belongs today.",
        buckets: [
          { id: "keep", label: "Still mine" },
          { id: "was", label: "Kept me safe once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
        note: "There is no right answer, and nothing here is final.",
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter you will not send",
        body: "To whoever you learned it from. They will never read this — that is the point. You can be unfair. You can also be kind. Both are allowed.",
        prompt: "Dear",
        openings: [
          "I know you were doing your best, and",
          "I have never said this to you, but",
          "Something you did stayed with me.",
          "I am not angry any more. I used to be.",
          "Thank you for",
          "I wish you had",
        ],
      },
      {
        id: "formed",
        kind: "scripture",
        kicker: "Underneath all of it",
        title: "Someone was there first",
        body: "Before anything was handed to you, something else was already true.",
        scriptures: [
          {
            text: "For You formed my inmost being; You knit me together in my mother’s womb.",
            reference: "Psalm 139:13 · BSB",
            book: "PSA",
            chapter: 139,
            verse: 13,
          },
          {
            text: "The LORD is near to the brokenhearted; He saves the contrite in spirit.",
            reference: "Psalm 34:18 · BSB",
            book: "PSA",
            chapter: 34,
            verse: 18,
          },
        ],
        reading: "Whatever your house taught you about yourself, it was not the first thing said about you.",
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what you are carrying",
        body: "Everything you tapped, with both of its faces. The left is what it takes from you. The right is what it was doing for you.",
        reading: "You do not have to put any of it down today. Seeing both hands at once is enough for one walk.",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        body: "Not all of it. One. You can change it whenever you like, and nothing follows up with you about it.",
        note: "Whichever you choose, Selah will show you what it is for rather than what it costs.",
        scripture: {
          text: "being confident of this, that He who began a good work in you will carry it on to completion until the day of Christ Jesus.",
          reference: "Philippians 1:6 · BSB",
          book: "PHP",
          chapter: 1,
          verse: 6,
        },
        reading: "You are not being asked to fix it. Only to keep it where you can see it.",
      },
    ],
  },
  {
    id: "never-enough",
    kicker: "Path two",
    title: "Never enough",
    about: "The tiredness of earning your place: where the line is, who keeps moving it, and what was never for sale.",
    shape: WALK_SHAPE,
    patterns: ENOUGH,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Nothing here is being marked",
        body: "There is no finish line in this one. Nothing is counted. You can skip any part of it and the walk still works.",
        reading: "You do not have to arrive at anything today. You are allowed to simply look at how hard you have been working.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these do you recognise?",
        body: "Not the worst day. The ordinary machinery.",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "enough",
        kind: "write",
        kicker: "Trace it",
        title: "What would be enough?",
        prompt: "If the line stopped moving, what would you finally let yourself have?",
        placeholder: "I think I would…",
      },
      {
        id: "moving-line",
        kind: "scripture",
        kicker: "Why the line moves",
        title: "The finish line is a feeling, not a place",
        body: "When the worth of a day is staked on doing well, a success does not settle you. It raises the bar for the next one. The relief is brief because the standard moved with you.",
        notes: [
          {
            text: "When a person stakes their worth on achievement, doing well does not quiet them for long. The next pass mark is simply higher. Kindness toward yourself, by contrast, is associated with trying again after a failure rather than freezing.",
            source: "Crocker J, Knight KM. Contingencies of self-worth. Current Directions in Psychological Science 14(4), 200–203, 2005",
            url: "https://doi.org/10.1111/j.0963-7214.2005.00364.x",
            caveat: "This is a review of how people stake self-worth on domains like achievement. It does not name what is wrong with anyone, and it is not a method. Caring about your work is not the same as this pattern.",
          },
        ],
        scripture: {
          text: "In vain you rise early and stay up late, toiling for bread to eat— for He gives sleep to His beloved.",
          reference: "Psalm 127:2 · BSB",
          book: "PSA",
          chapter: 127,
          verse: 2,
        },
        reading: "The place was given. It was never a wage.",
      },
      {
        id: "grace",
        kind: "scripture",
        kicker: "It was never a wage",
        title: "It was never a wage",
        body: "The work did not purchase this. It never could.",
        scripture: {
          text: "For it is by grace you have been saved through faith, and this not from yourselves; it is the gift of God, not by works, so that no one can boast.",
          reference: "Ephesians 2:8–9 · BSB",
          book: "EPH",
          chapter: 2,
          verse: 8,
          verseEnd: 9,
        },
        notes: [
          {
            text: "People who treat themselves with ordinary kindness tend to try again after they fail, rather than freeze. That is not the same as thinking they are wonderful.",
            source: "Neff KD. Self-compassion, self-esteem, and well-being. Social and Personality Psychology Compass 5(1), 1–12, 2011",
            url: "https://doi.org/10.1111/j.1751-9004.2010.00330.x",
            caveat: "Most of this literature is self-report and cross-sectional. Kindness to yourself is associated with trying again. It is not a method, and it is not a verdict on anyone who finds it hard.",
          },
        ],
        reading: "The place was given. It was not earned, which means it cannot be lost by missing a line you drew yourself.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these still earn their keep?",
        buckets: [
          { id: "keep", label: "Still mine" },
          { id: "was", label: "Kept me moving" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter to whoever you are trying to satisfy",
        openings: [
          "I have been working for you for a long time.",
          "I do not know if you would even notice.",
          "I am tired of proving this.",
          "I wanted you to see me.",
        ],
      },
      {
        id: "rest",
        kind: "scripture",
        kicker: "Underneath",
        title: "He already knows what you are made of",
        scriptures: [
          {
            text: "Come to Me, all you who are weary and burdened, and I will give you rest.",
            reference: "Matthew 11:28 · BSB",
            book: "MAT",
            chapter: 11,
            verse: 28,
          },
          {
            text: "For He knows our frame; He is mindful that we are dust.",
            reference: "Psalm 103:14 · BSB",
            book: "PSA",
            chapter: 103,
            verse: 14,
          },
        ],
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what has been keeping you moving",
        reading: "You do not have to put any of it down today.",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "Come to Me, all you who are weary and burdened, and I will give you rest.",
          reference: "Matthew 11:28 · BSB",
          book: "MAT",
          chapter: 11,
          verse: 28,
        },
      },
    ],
  },
  {
    id: "good-version",
    kicker: "Path three",
    title: "The good version",
    about: "The gap between who they see and who you know you are — and the God who already knows both.",
    shape: WALK_SHAPE,
    patterns: VERSION,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Everybody does this",
        body: "A public self is not a lie by itself. It becomes a problem when it is the only self that is allowed to exist.",
        reading: "You are not on trial for having a face you show the room.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these do you recognise?",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "where",
        kind: "write",
        kicker: "Trace it",
        title: "Which room do you adjust in?",
        prompt: "Where does the good version take over?",
        placeholder: "At work, I become…",
      },
      {
        id: "audience",
        kind: "read",
        kicker: "Why it happens",
        title: "The face you show the room",
        body: "Most people keep a version of themselves for the room. That is not automatically a lie. It becomes a problem when it is the only version that is allowed to exist.",
        notes: [
          {
            text: "People manage what others see of them — they edit, they time it, they keep some things back. The finding is ordinary, not a verdict on anyone who does it.",
            source: "Leary MR, Kowalski RM. Impression management: a literature review and two-component model. Psychological Bulletin 107(1), 34–47, 1990",
            url: "https://doi.org/10.1037/0033-2909.107.1.34",
            caveat: "This is a review of how people present themselves in social life. It does not say anyone is false, and it cannot measure a person from a screen.",
          },
        ],
        reading: "A public self is not the crime. A private self with nowhere to go is the cost.",
      },
      {
        id: "known",
        kind: "scripture",
        kicker: "Already known",
        title: "Already known, and still here",
        scripture: {
          text: "O LORD, You have searched me and known me.",
          reference: "Psalm 139:1 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 1,
          excerpt: true,
        },
        reading: "The version you hide is not hidden from Him. He stayed.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "Which of these is simply privacy?",
        buckets: [
          { id: "keep", label: "Just privacy" },
          { id: "was", label: "Kept me safe once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter to the good version",
        openings: [
          "You have worked very hard.",
          "I built you because",
          "I am tired of being you in every room.",
          "Thank you for getting me through.",
        ],
      },
      {
        id: "formed",
        kind: "scripture",
        kicker: "Underneath",
        title: "Someone was there first",
        body: "Before the good version learned its lines, something else was already true.",
        scripture: {
          text: "For You formed my inmost being; You knit me together in my mother’s womb.",
          reference: "Psalm 139:13 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 13,
        },
        reading: "The version you hide is not hidden from Him. He stayed.",
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what you have been carrying",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "O LORD, You have searched me and known me.",
          reference: "Psalm 139:1 · BSB",
          book: "PSA",
          chapter: 139,
          verse: 1,
          excerpt: true,
        },
      },
    ],
  },
  {
    id: "under-the-anger",
    kicker: "Path four",
    title: "Under the anger",
    about: "What got there before the anger did — and what the anger has been trying to protect.",
    shape: WALK_SHAPE,
    patterns: ANGER,
    stations: [
      {
        id: "before",
        kind: "read",
        kicker: "Before we start",
        title: "Nobody is in trouble",
        body: "Anger is not the enemy in this walk. It is a signal. We are asking what it arrived to say.",
        reading: "You will not be asked to be less. You will be asked to look underneath.",
      },
      {
        id: "familiar",
        kind: "patterns",
        kicker: "Notice",
        title: "Which of these sound like you?",
        note: "Tap as many or as few as you like.",
      },
      {
        id: "under",
        kind: "write",
        kicker: "Trace it",
        title: "What was there first?",
        prompt: "Before the heat — what was the thing it was standing in front of?",
        placeholder: "Underneath it, I think I was…",
      },
      {
        id: "signal",
        kind: "read",
        kicker: "Why it arrives",
        title: "Anger is usually late, not first",
        body: "Anger often shows up after something else — a slight, a threat, a loss of standing. It can be just. It can also be a cover. This walk does not decide which. It only asks what was standing in front of it.",
        notes: [
          {
            text: "In ordinary life, people report anger as a response to being wronged or blocked, not as a mood that arrives from nowhere. It can be made milder when a person has another way to say the thing — and it can also be the only honest word in the room.",
            source: "Averill JR. Studies on anger and aggression: implications for theories of emotion. American Psychologist 38(11), 1145–1160, 1983",
            url: "https://doi.org/10.1037/0003-066X.38.11.1145",
            caveat: "This is a study of how people report anger in ordinary life, not a rule about your household. The walk does not tell you to be less.",
          },
        ],
        reading: "You will not be asked to be less. You will be asked to look underneath.",
      },
      {
        id: "slow",
        kind: "scripture",
        kicker: "The other way",
        title: "Slow to anger is not the same as none",
        scripture: {
          text: "The LORD is compassionate and gracious, slow to anger, abounding in loving devotion.",
          reference: "Psalm 103:8 · BSB",
          book: "PSA",
          chapter: 103,
          verse: 8,
        },
        reading: "He is slow. He is not absent. Your anger can be heard without being allowed to run the house.",
      },
      {
        id: "listen",
        kind: "scripture",
        kicker: "The other speed",
        title: "Quick to listen is not the same as small",
        body: "The instruction is an order of operations. Listen. Then speak. Then, if it is still needed, the heat.",
        scripture: {
          text: "My beloved brothers, understand this: Everyone should be quick to listen, slow to speak, and slow to anger,",
          reference: "James 1:19 · BSB",
          book: "JAS",
          chapter: 1,
          verse: 19,
        },
        reading: "Slow is not silence. Slow is a chance for the first thing to get a word in.",
      },
      {
        id: "sort",
        kind: "sort",
        kicker: "Sort it",
        title: "What is the anger doing?",
        buckets: [
          { id: "keep", label: "Telling the truth" },
          { id: "was", label: "Protected me once" },
          { id: "costs", label: "Costs me now" },
          { id: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "letter",
        kind: "letter",
        kicker: "Say it once",
        title: "A letter you will not send",
        openings: [
          "I am angry because",
          "Underneath this I am sad about",
          "I wanted you to",
          "I have been carrying this a long time.",
        ],
      },
      {
        id: "mirror",
        kind: "mirror",
        kicker: "Both hands",
        title: "Here is what the anger has been carrying",
      },
      {
        id: "carry",
        kind: "carry",
        kicker: "Carry",
        title: "One thing to keep in front of you",
        scripture: {
          text: "Be angry, yet do not sin. Do not let the sun set upon your anger,",
          reference: "Ephesians 4:26 · BSB",
          book: "EPH",
          chapter: 4,
          verse: 26,
        },
      },
    ],
  },
];

export const PATTERNS = PATHS.flatMap((p) => p.patterns);

export function pathById(id: string) {
  return PATHS.find((p) => p.id === id);
}


========================================================================
FILE: src/journey/sermon.ts
BYTES: 2478
LINES: 58
========================================================================

import { createServerFn } from "@tanstack/react-start";

type SplitOk = { ok: true; points: string[] };
type SplitErr = { ok: false; error: string };
export type SplitResult = SplitOk | SplitErr;

export const splitSermon = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => {
    const text = typeof input?.text === "string" ? input.text.trim() : "";
    return { text };
  })
  .handler(async ({ data }): Promise<SplitResult> => {
    const text = data.text;
    if (text.length < 40) return { ok: false, error: "A little more of the sermon is needed." };
    if (text.length > 12000) return { ok: false, error: "Keep it to one sitting of notes." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Breaking a recording into points is not available here yet." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 900,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You extract the speaker's own points from a sermon or Christian podcast. Return JSON only: {\"points\":[\"...\"]}. 4 to 12 short points. Use the speaker's language. Do not add counsel, diagnosis, application, or verses they did not say. Do not moralise.",
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: "The notes could not be broken up just now." };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false, error: "Nothing clear enough to keep yet." };
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1)) as { points?: unknown };
      const points = Array.isArray(parsed.points)
        ? parsed.points.map((p) => String(p).trim()).filter((p) => p.length > 0).slice(0, 12)
        : [];
      if (!points.length) return { ok: false, error: "Nothing clear enough to keep yet." };
      return { ok: true, points };
    } catch {
      return { ok: false, error: "Nothing clear enough to keep yet." };
    }
  });


========================================================================
FILE: src/journey/journey.css
BYTES: 26762
LINES: 1330
========================================================================

.jny {
  --jny-ink: var(--color-fg);
  --jny-dim: color-mix(in oklab, var(--color-fg) 58%, transparent);
  --jny-faint: color-mix(in oklab, var(--color-fg) 34%, transparent);
  --jny-line: color-mix(in oklab, var(--color-fg) 12%, transparent);
  --jny-face: #161614;
  --jny-cta: #f3f1ec;
  --jny-cta-ink: #111110;
  --jny-glow: 0 0 10px rgba(255, 255, 255, 0.95), 0 0 28px rgba(255, 255, 255, 0.7),
    0 0 56px rgba(255, 255, 255, 0.32), 0 0 90px rgba(255, 255, 255, 0.12);
  --jny-pad: 1.35rem;
  --jny-radius: 1.15rem;
  position: relative;
  min-height: 100dvh;
  background: #000;
  color: var(--jny-ink);
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: calc(6.4rem + env(safe-area-inset-bottom));
  -webkit-font-smoothing: antialiased;
  transition: background 450ms var(--ease-smooth-out, ease);
}

.jny-full {
  padding-bottom: env(safe-area-inset-bottom);
  height: 100dvh;
  overflow: hidden;
}

.jny-stage {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: calc(1.15rem + env(safe-area-inset-top)) var(--jny-pad) 1.35rem;
}

.jny:not(.jny-full) .jny-stage {
  padding-top: calc(2.5rem + env(safe-area-inset-top));
}

.jny-threshold {
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
}

.jny-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.jny-copy {
  margin: 0;
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 1.28rem;
  line-height: 1.48;
  letter-spacing: -0.028em;
  color: var(--jny-dim);
  text-wrap: unset;
}
.jny-copy.center {
  text-align: center;
}
.jny-line {
  display: inline;
}
.jny-line.quiet {
  color: var(--jny-ink);
  font-size: 1.28rem;
}
.jny-line.glow-line {
  color: #fff;
}
.jny-line.glow-line.display {
  font-size: clamp(1.7rem, 7.2vw, 2.12rem);
  line-height: 1.18;
  letter-spacing: -0.038em;
  white-space: nowrap;
}
.jny-copy .glow {
  color: #fff;
  text-shadow: var(--jny-glow);
  font-weight: 500;
}

.jny-cta {
  width: 100%;
  min-height: 3.35rem;
  margin-top: 1.1rem;
  border: 0;
  border-radius: 999px;
  background: var(--jny-cta);
  color: var(--jny-cta-ink);
  font: 400 1.02rem/1 var(--font-sans);
  letter-spacing: -0.015em;
  flex-shrink: 0;
  transition: transform 150ms var(--ease-smooth-out, ease), opacity 150ms ease;
}
.jny-cta:disabled {
  opacity: 0.38;
}
.jny-cta:active:not(:disabled) {
  transform: scale(0.96);
}
.jny-cta.hold {
  margin-top: 0;
}
.jny-cta.ghost {
  background: transparent;
  color: var(--jny-ink);
  border: 1px solid color-mix(in oklab, var(--color-fg) 18%, transparent);
}
.jny-cta-slot {
  flex-shrink: 0;
  width: 100%;
  margin-top: auto;
  padding-top: 0.4rem;
}

.jny-brand {
  margin: 0;
  font: 600 0.62rem/1 var(--font-sans);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--jny-faint);
  text-align: center;
}

.jny-display {
  margin: 0;
  font-family: var(--font-sans);
  font-size: clamp(2.05rem, 9vw, 2.45rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-transform: uppercase;
}

.jny-hub .jny-section {
  margin-top: 1.15rem;
}

.jny-kicker {
  margin: 0 0 0.55rem;
  font: 500 0.68rem/1 var(--font-sans);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--jny-dim);
}

.jny-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.85rem, 7.6vw, 2.45rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.08;
  text-wrap: unset;
}

.jny-lede,
.jny-sub {
  margin: 0.55rem 0 0;
  max-width: 22rem;
  color: var(--jny-dim);
  font: 400 0.95rem/1.5 var(--font-sans);
}

.jny-back {
  align-self: flex-start;
  min-height: 44px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--jny-dim);
  font: 500 0.92rem/1 var(--font-sans);
}

.jny-section {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 1.7rem 0 0.85rem;
}
.jny-section h2 {
  margin: 0;
  font: 600 1.15rem/1 var(--font-sans);
  letter-spacing: -0.02em;
}
.jny-section span {
  font: 500 0.68rem/1 var(--font-sans);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--jny-faint);
}

.jny-bible-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.05rem 0.7rem;
}
.jny-bible-grid.tight {
  gap: 0.7rem;
}

.jny-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: transform 150ms var(--ease-smooth-out, ease);
}
.jny-tile:active {
  transform: scale(0.96);
}
.jny-tile-face {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--jny-radius);
  background: var(--jny-face);
  overflow: hidden;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid color-mix(in oklab, var(--color-fg) 6%, transparent);
  transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}
.jny-tile.on .jny-tile-face,
.jny-tile.marked .jny-tile-face {
  background: #f3f1ec;
  color: #111110;
  border-color: transparent;
  box-shadow: 0 0 28px rgba(255, 255, 255, 0.12);
}
.jny-tile.on .jny-tile-num,
.jny-tile.marked .jny-tile-num {
  color: rgba(17, 17, 16, 0.45);
}
.jny-tile-num {
  position: absolute;
  top: 0.75rem;
  left: 0.85rem;
  font: 500 0.68rem/1 var(--font-sans);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--jny-faint);
}
.jny-tile-name {
  position: relative;
  z-index: 1;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.15;
}
.jny-tile-face.gift .jny-tile-name,
.jny-tile-face.open .jny-tile-name {
  text-transform: none;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 0.92rem;
  line-height: 1.25;
}
.jny-tile-face.bucket {
  justify-content: center;
  align-items: center;
  text-align: center;
  aspect-ratio: 1.15;
}
.jny-tile-meta {
  margin-top: 0.5rem;
  padding: 0 0.15rem;
}
.jny-tile-meta strong {
  display: block;
  font: 500 0.95rem/1.25 var(--font-sans);
}
.jny-tile-meta span {
  display: block;
  margin-top: 0.15rem;
  font: 500 0.62rem/1.3 var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--jny-faint);
}

.jny-art {
  position: absolute;
  inset: 22% 16% 38%;
  pointer-events: none;
  opacity: 0.5;
}
.jny-art.ticks {
  background: repeating-linear-gradient(
    90deg,
    color-mix(in oklab, var(--color-fg) 35%, transparent) 0 2px,
    transparent 2px 12%
  );
  inset: 36% 16% 52%;
  height: 2px;
  opacity: 0.7;
}
.jny-art.rules {
  background: repeating-linear-gradient(
    180deg,
    transparent 0 22%,
    color-mix(in oklab, var(--color-fg) 22%, transparent) 22% calc(22% + 1px)
  );
  inset: 24% 18% 42%;
}
.jny-art.dot {
  inset: auto;
  left: 50%;
  top: 46%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.7);
  transform: translate(-50%, -50%);
}
.jny-art.orb {
  inset: auto;
  left: 50%;
  top: 44%;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.05) 70%);
  box-shadow: 0 0 24px rgba(255, 255, 255, 0.18);
}
.jny-art.quote {
  inset: auto;
  left: 0.85rem;
  bottom: 2.4rem;
  font-family: var(--font-serif);
  font-size: 2.6rem;
  line-height: 1;
  opacity: 0.35;
  position: absolute;
}

.jny-continue {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  margin-top: 1.25rem;
  border: 0;
  border-radius: 1.15rem;
  padding: 0.95rem 1.05rem;
  background: #1a1916;
  color: inherit;
  text-align: left;
  min-height: 4.4rem;
  transition: transform 150ms ease;
}
.jny-continue:active {
  transform: scale(0.98);
}
.jny-continue strong {
  display: block;
  font: 500 0.98rem/1.25 var(--font-sans);
}
.jny-continue small {
  display: block;
  margin-top: 0.2rem;
  color: var(--jny-dim);
  font: 400 0.82rem/1.35 var(--font-sans);
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.jny-continue em {
  font-style: normal;
  color: var(--jny-faint);
  font-size: 1.4rem;
}

.jny-known {
  margin-top: 1.2rem;
}
.jny-known p {
  margin: 0 0 0.45rem;
  font: 500 0.65rem/1 var(--font-sans);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--jny-faint);
}

.jny-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-height: 1.6rem;
  margin: 0.35rem 0 0.5rem;
}
.jny-tray-empty {
  color: var(--jny-faint);
  font: 400 0.82rem/1.4 var(--font-sans);
}
.jny-pill {
  border-radius: 999px;
  padding: 0.28rem 0.65rem;
  background: #f3f1ec;
  color: #111110;
  font: 500 0.7rem/1.2 var(--font-sans);
}

.jny-deck {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 0;
}
.jny-play-card {
  width: 100%;
  border-radius: 1.5rem;
  padding: 1.5rem 1.35rem 1.4rem;
  min-height: 15.5rem;
  background: var(--jny-face);
  border: 1px solid color-mix(in oklab, var(--color-fg) 8%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  touch-action: none;
  user-select: none;
  transition: transform 280ms var(--ease-smooth-out, ease), opacity 280ms ease, background 200ms ease, color 200ms ease;
}
.jny-play-card.compact {
  min-height: 7.5rem;
  margin-bottom: 0.9rem;
  touch-action: auto;
}
.jny-play-card.keep,
.jny-play-card.lean-keep {
  background: #f3f1ec;
  color: #111110;
}
.jny-play-card.keep {
  transform: translateY(-12px) scale(1.02);
}
.jny-play-card.pass,
.jny-play-card.lean-pass {
  opacity: 0.55;
}
.jny-play-card.pass {
  transform: translateY(16px);
  opacity: 0;
}
.jny-play-card.drag {
  transition: none;
}
.jny-play-card small {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.65rem/1 var(--font-sans);
  color: var(--jny-faint);
}
.jny-play-card.keep small,
.jny-play-card.lean-keep small {
  color: rgba(17, 17, 16, 0.5);
}
.jny-play-card h2 {
  margin: 0.7rem 0 0;
  font-family: var(--font-serif);
  font-size: clamp(1.55rem, 6.4vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.jny-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-top: 1rem;
  flex-shrink: 0;
}
.jny-dual .jny-cta {
  margin-top: 0;
}

.jny-text-link {
  align-self: center;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--jny-dim);
  font: 500 0.88rem/1 var(--font-sans);
  margin-top: 0.15rem;
}
.jny-cta-slot .jny-text-link {
  align-self: flex-start;
}

.jny-flip {
  display: block;
  width: 100%;
  min-height: 16.5rem;
  margin-top: 1rem;
  border: 0;
  padding: 0;
  background: transparent;
  perspective: 1200px;
  color: inherit;
  text-align: left;
}
.jny-flip-inner {
  position: relative;
  width: 100%;
  min-height: 16.5rem;
  transform-style: preserve-3d;
  transition: transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
}
.jny-flip.on .jny-flip-inner {
  transform: rotateY(180deg);
}
.jny-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 1.5rem;
  padding: 1.35rem 1.3rem;
  background: var(--jny-face);
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in oklab, var(--color-fg) 8%, transparent);
}
.jny-face.back {
  transform: rotateY(180deg);
  background: #f3f1ec;
  color: #111110;
}
.jny-face small {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.65rem/1 var(--font-sans);
  color: var(--jny-faint);
}
.jny-face.back small {
  color: rgba(17, 17, 16, 0.5);
}
.jny-face strong {
  display: block;
  margin-top: 0.55rem;
  font: 500 0.95rem/1.3 var(--font-sans);
}
.jny-face p {
  margin: 0.7rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.28rem;
  line-height: 1.35;
}
.jny-face em {
  margin-top: auto;
  font-style: normal;
  color: var(--jny-faint);
  font-size: 0.78rem;
}

.jny-paper,
.jny-field {
  width: 100%;
  margin-top: 1rem;
  border: 0;
  border-bottom: 1px solid color-mix(in oklab, var(--color-fg) 18%, transparent);
  padding: 0.85rem 0;
  background: transparent;
  color: var(--jny-ink);
  font: 400 1.15rem/1.5 var(--font-serif);
  resize: none;
  min-height: 8rem;
}
.jny-field.line {
  min-height: unset;
  font-family: var(--font-sans);
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}
.jny-paper.tall {
  flex: 1;
  min-height: 10rem;
}
.jny-paper:focus,
.jny-field:focus {
  outline: none;
  border-bottom-color: #fff;
}

.jny-tones {
  display: flex;
  gap: 0.7rem;
  margin-top: 1.1rem;
}
.jny-tone {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 1px solid color-mix(in oklab, var(--color-fg) 22%, transparent);
  padding: 0;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.jny-tone:active {
  transform: scale(0.92);
}
.jny-tone.on {
  box-shadow: 0 0 0 2px #000, 0 0 0 4px #f3f1ec;
}
.jny-tone.still {
  background: #1a1a1a;
}
.jny-tone.warm {
  background: #3a2a1c;
}
.jny-tone.dawn {
  background: #1b2a3a;
}
.jny-tone.garden {
  background: #1c2a20;
}

.jny[data-tone="warm"] {
  background: #120e0a;
}
.jny[data-tone="dawn"] {
  background: #0a0e14;
}
.jny[data-tone="garden"] {
  background: #0c120e;
}

.jny-tile-face.warm {
  background: #2a1e14;
}
.jny-tile-face.dawn {
  background: #15202c;
}
.jny-tile-face.garden {
  background: #16241b;
}
.jny-tile-face.still {
  background: #161614;
}
.jny-tile-face.add {
  background: color-mix(in oklab, var(--jny-face) 80%, #fff 4%);
  border-style: dashed;
}

.jny-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.jny-count {
  font: 500 0.78rem/1 var(--font-sans);
  letter-spacing: 0.08em;
  color: var(--jny-dim);
  font-variant-numeric: tabular-nums;
}

.jny-thread {
  display: flex;
  gap: 0.28rem;
  margin: 0.45rem 0 1rem;
}
.jny-thread i {
  display: block;
  height: 2px;
  flex: 1;
  background: color-mix(in oklab, var(--color-fg) 12%, transparent);
}
.jny-thread i.on {
  background: #fff;
}

.jny-body {
  margin: 0.75rem 0 0;
  color: var(--jny-dim);
  font: 400 0.98rem/1.5 var(--font-sans);
}
.jny-reading {
  margin: 1rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.22rem;
  line-height: 1.35;
}
.jny-verse {
  margin: 1.15rem 0 0;
}
.jny-verse p {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.22rem;
  line-height: 1.4;
}
.jny-verse cite {
  display: block;
  margin-top: 0.5rem;
  font-style: normal;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.65rem/1 var(--font-sans);
  color: var(--jny-dim);
}
.jny-verse.living em {
  display: block;
  margin-top: 0.7rem;
  font-style: normal;
  color: var(--jny-faint);
  font: 400 0.78rem/1.4 var(--font-sans);
}

.jny-word {
  display: inline;
  margin: 0 0.12em 0 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: color-mix(in oklab, var(--color-fg) 38%, transparent);
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  transition: color 250ms ease, text-shadow 250ms ease;
}
.jny-word.on {
  color: #fff;
  text-shadow: var(--jny-glow);
}

.jny-why {
  margin-top: 1rem;
  border: 0;
  padding: 0;
  min-height: 44px;
  background: transparent;
  color: var(--jny-dim);
  font: 500 0.88rem/1 var(--font-sans);
  text-align: left;
}

.jny-sheet-card {
  margin-top: 1rem;
  border-radius: 1.15rem;
  padding: 1.1rem 1.05rem;
  background: #141412;
  border: 1px solid color-mix(in oklab, var(--color-fg) 8%, transparent);
}
.jny-sheet-card time,
.jny-sheet-card small {
  display: block;
  color: var(--jny-dim);
  font: 500 0.68rem/1 var(--font-sans);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.jny-sheet-card p {
  margin: 0.55rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.4;
}

.jny-caveat,
.jny-note {
  margin: 0.7rem 0 0;
  color: var(--jny-faint);
  font: 400 0.78rem/1.45 var(--font-sans);
}

.jny-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.jny-nav {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.1rem;
  align-items: center;
  flex-shrink: 0;
}
.jny-nav .jny-cta {
  margin-top: 0;
  flex: 1;
}

.jny-center-copy {
  text-align: center;
}

.jny-orb-wrap {
  position: relative;
  width: min(70vw, 18rem);
  aspect-ratio: 1;
  margin: auto;
  display: grid;
  place-items: center;
  z-index: 1;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  appearance: none;
  -webkit-appearance: none;
}
.jny-orb {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 32%,
    rgba(255, 255, 255, 0.62),
    rgba(255, 255, 255, 0.16) 42%,
    rgba(255, 255, 255, 0.04) 68%,
    transparent 72%
  );
  box-shadow: 0 0 48px rgba(255, 255, 255, 0.22), 0 0 120px rgba(255, 255, 255, 0.12);
  animation: jnyBreathe 8s ease-in-out infinite;
}
.jny-phase {
  position: relative;
  z-index: 1;
  font-family: var(--font-serif);
  font-size: 1.35rem;
  letter-spacing: 0.04em;
}

.jny-choices {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 1.1rem;
  width: 100%;
}

.jny-choice {
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 1.25rem;
  padding: 0.92rem 1.1rem;
  min-height: 3.9rem;
  background: var(--jny-face);
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.22rem;
  animation: jnyRise 420ms var(--ease-smooth-out, ease) both;
  transition: background 200ms ease, color 200ms ease, transform 150ms ease;
}
.jny-choice:nth-child(1) {
  animation-delay: 40ms;
}
.jny-choice:nth-child(2) {
  animation-delay: 90ms;
}
.jny-choice:nth-child(3) {
  animation-delay: 140ms;
}
.jny-choice:nth-child(4) {
  animation-delay: 190ms;
}
.jny-choice:nth-child(5) {
  animation-delay: 240ms;
}
.jny-choice:active {
  transform: scale(0.96);
}
.jny-choice.on {
  background: #f3f1ec;
  color: #111110;
}
.jny-choice small {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.62rem/1 var(--font-sans);
  color: var(--jny-faint);
}
.jny-choice.on small {
  color: rgba(17, 17, 16, 0.48);
}
.jny-choice strong {
  display: block;
  font: 500 1.05rem/1.25 var(--font-sans);
  letter-spacing: -0.02em;
}
.jny-choice span {
  display: block;
  color: var(--jny-dim);
  font: 400 0.82rem/1.35 var(--font-sans);
}
.jny-choice.on span {
  color: rgba(17, 17, 16, 0.55);
}

.jny-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1.4rem;
}
.jny-chip {
  border: 1px solid color-mix(in oklab, var(--color-fg) 18%, transparent);
  border-radius: 999px;
  padding: 0.82rem 1.15rem;
  min-height: 48px;
  background: transparent;
  color: inherit;
  font: 500 0.98rem/1 var(--font-sans);
  letter-spacing: -0.015em;
  transition: background 200ms ease, color 200ms ease, transform 150ms ease, border-color 200ms ease;
}
.jny-chip:active {
  transform: scale(0.96);
}
.jny-chip.on {
  background: #f3f1ec;
  color: #111110;
  border-color: transparent;
}

.jny-orbs {
  display: flex;
  justify-content: space-between;
  gap: 0.55rem;
  margin-top: auto;
  padding: 1.4rem 0.2rem 0.4rem;
}
.jny-orb-tone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  border: 0;
  padding: 0.4rem 0;
  background: transparent;
  color: var(--jny-dim);
  font: 500 0.68rem/1 var(--font-sans);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  min-height: 44px;
  transition: color 200ms ease, transform 150ms ease;
}
.jny-orb-tone i {
  display: block;
  width: 3.15rem;
  height: 3.15rem;
  border-radius: 50%;
  border: 1px solid color-mix(in oklab, var(--color-fg) 22%, transparent);
  transition: transform 200ms var(--ease-smooth-out, ease), box-shadow 200ms ease;
}
.jny-orb-tone:active i {
  transform: scale(0.92);
}
.jny-orb-tone.on {
  color: var(--jny-ink);
}
.jny-orb-tone.on i {
  transform: scale(1.08);
  box-shadow: 0 0 0 2px #000, 0 0 0 4px #f3f1ec, 0 0 28px rgba(255, 255, 255, 0.18);
}
.jny-orb-tone.still i {
  background: #1a1a1a;
}
.jny-orb-tone.warm i {
  background: #5a3d28;
}
.jny-orb-tone.dawn i {
  background: #2a4258;
}
.jny-orb-tone.garden i {
  background: #2a4634;
}

.jny-date {
  display: block;
  margin-top: 0.7rem;
}
.jny-date em {
  display: block;
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 10vw, 3.1rem);
  font-style: normal;
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 0.95;
}
.jny-date strong {
  display: block;
  margin-top: 0.4rem;
  font: 500 0.72rem/1 var(--font-sans);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--jny-dim);
}

.jny-page {
  flex: 0 0 auto;
  min-height: 0;
  overflow-y: auto;
  touch-action: pan-y;
  padding: 0;
  display: block;
  margin: 0.9rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.38rem;
  line-height: 1.45;
  max-height: 40dvh;
}
.jny-page p {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.jny-dots {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  margin: 0.8rem 0 0.6rem;
  min-height: 10px;
}
.jny-dots i {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in oklab, var(--color-fg) 22%, transparent);
  transition: background 200ms ease, transform 200ms ease;
}
.jny-dots i.on {
  background: #fff;
  transform: scale(1.2);
}

.jny-live {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 0;
}
.jny-live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.8);
  animation: jnyBreathe 8s ease-in-out infinite;
}
.jny-live h1 {
  margin: 1.35rem 0 0;
  max-width: 18rem;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 8vw, 2.4rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.jny-live p {
  margin: 0.85rem 0 0;
  color: var(--jny-dim);
  font: 400 0.92rem/1.4 var(--font-sans);
}

.jny-dest {
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 1.5rem;
  padding: 1.35rem 1.25rem 1.25rem;
  min-height: 9.2rem;
  background: var(--jny-face);
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 0.7rem;
  animation: jnyRise 420ms var(--ease-smooth-out, ease) both;
  transition: transform 150ms ease, background 200ms ease;
}
.jny-dest:nth-of-type(1) {
  animation-delay: 60ms;
}
.jny-dest:nth-of-type(2) {
  animation-delay: 140ms;
}
.jny-dest:active {
  transform: scale(0.96);
}
.jny-dest small {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.62rem/1 var(--font-sans);
  color: var(--jny-faint);
}
.jny-dest h2 {
  margin: 0.45rem 0 0;
  font-family: var(--font-serif);
  font-size: clamp(1.45rem, 6vw, 1.8rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.15;
}
.jny-dest p {
  margin: 0.4rem 0 0;
  color: var(--jny-dim);
  font: 400 0.85rem/1.4 var(--font-sans);
}

.jny-kept-row {
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--jny-line);
  padding: 1rem 0;
  background: transparent;
  color: inherit;
  transition: opacity 150ms ease;
}
.jny-kept-row:active {
  opacity: 0.7;
}
.jny-kept-row time {
  display: block;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font: 500 0.62rem/1 var(--font-sans);
  color: var(--jny-faint);
}
.jny-kept-row p {
  margin: 0.35rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.12rem;
  line-height: 1.35;
}

.jny-sheet-root {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
}
.jny-sheet-root.open {
  pointer-events: auto;
}
.jny-sheet-back {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 250ms ease;
}
.jny-sheet-root.open .jny-sheet-back {
  opacity: 1;
}
.jny-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #141412;
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.25rem 1.2rem calc(1.25rem + env(safe-area-inset-bottom));
  transform: translateY(110%);
  transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: auto;
}
.jny-sheet-root.open .jny-sheet {
  transform: translateY(0);
}
.jny-sheet .jny-choices {
  margin-top: 0.7rem;
}

.jny-motes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.jny-point-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 1rem;
}
.jny-point {
  text-align: left;
  border: 1px solid color-mix(in oklab, var(--color-fg) 10%, transparent);
  border-radius: 1.05rem;
  padding: 0.9rem 1rem;
  background: var(--jny-face);
  color: inherit;
  transition: background 150ms ease, color 150ms ease;
}
.jny-point.on {
  background: #f3f1ec;
  color: #111110;
  border-color: transparent;
}
.jny-point small {
  display: block;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font: 500 0.62rem/1 var(--font-sans);
  opacity: 0.55;
}
.jny-point p {
  margin: 0.35rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.35;
}

.jny-listen {
  margin-top: 1rem;
  font: 400 0.92rem/1.4 var(--font-sans);
  color: var(--jny-dim);
  background: linear-gradient(
    90deg,
    color-mix(in oklab, var(--color-fg) 35%, transparent) 0%,
    #fff 45%,
    color-mix(in oklab, var(--color-fg) 35%, transparent) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: jnyShimmer 1.6s linear infinite;
}

@keyframes jnyRise {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}

@keyframes jnyShimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}

body.jny-immersive .dock,
body.jny-immersive nav[aria-label="Primary"] {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .jny-orb,
  .jny-live-dot {
    animation: none;
  }
  .jny-cta,
  .jny-tile,
  .jny-play-card,
  .jny-flip-inner,
  .jny-choice,
  .jny-dest,
  .jny-sheet,
  .jny-sheet-back,
  .jny-chip,
  .jny-word {
    transition: none;
    animation: none;
  }
  .jny-listen {
    animation: none;
    color: var(--jny-dim);
    background: none;
  }
}
@keyframes jnyBreathe {
  0%,
  100% {
    transform: scale(0.82);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (min-width: 720px) {
  .jny-stage {
    max-width: 28rem;
    margin: 0 auto;
  }
}


========================================================================
FILE: src/styles.css
BYTES: 8709
LINES: 411
========================================================================

@import "tailwindcss";

@theme {
  --color-bg: #0b0c0a;
  --color-surface: #141512;
  --color-fg: #e8e4d8;
  --color-muted: #9a9486;
  --color-faint: #6a655c;
  --color-primary: #c4bdb0;
  --color-border: #2a2924;
  --color-quote: #c9b8a0;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  --radius: 0.75rem;
  --motion-quick: 150ms;
  --motion-fast: 250ms;
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--color-bg);
    color: var(--color-fg);
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  h1,
  h2,
  h3 {
    text-wrap: balance;
  }
  p {
    text-wrap: pretty;
  }
}

.atmosphere-wash {
  background: radial-gradient(
    120% 80% at 50% 0%,
    color-mix(in oklab, var(--color-fg) 8%, transparent),
    transparent 55%
  );
}

.atmosphere-shaft {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--color-fg) 10%, transparent),
    transparent 70%
  );
  filter: blur(48px);
  opacity: 0.7;
}

@keyframes selah-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.9;
  }
}

.selah-breathe {
  animation: selah-breathe 8s var(--ease-smooth-out) infinite;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.known {
  position: fixed;
  inset: 0;
  height: 100dvh;
  overflow: hidden;
  background: #05070b;
  color: #e8e4d8;
  -webkit-tap-highlight-color: transparent;
}

.known-canvas {
  position: absolute !important;
  inset: 0;
  pointer-events: none;
}

.known-scroller {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}
.known-scroller::-webkit-scrollbar { display: none; }

.known-section {
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.known-hud {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.known-scrim {
  position: absolute;
  inset: 0 0 auto;
  height: 42%;
  background: linear-gradient(180deg, rgba(5, 7, 11, 0.9) 0%, rgba(5, 7, 11, 0.5) 58%, rgba(5, 7, 11, 0) 100%);
}

.creation .known-scrim {
  height: 62%;
  background: linear-gradient(180deg, rgba(5, 7, 11, 0.94) 0%, rgba(5, 7, 11, 0.62) 52%, rgba(5, 7, 11, 0) 100%);
}

.creation[data-day="day1"] .known-scrim {
  height: 52%;
  background: linear-gradient(180deg, rgba(4, 5, 10, 0.88) 0%, rgba(4, 5, 10, 0.42) 58%, rgba(4, 5, 10, 0) 100%);
}

.creation[data-day="wings"] .known-scrim {
  height: 40%;
  background: linear-gradient(180deg, rgba(7, 8, 12, 0.94) 0%, rgba(7, 8, 12, 0.4) 70%, rgba(7, 8, 12, 0) 100%);
}

.creation[data-day="house"] .known-scrim {
  height: 48%;
  background: linear-gradient(180deg, rgba(12, 11, 16, 0.94) 0%, rgba(12, 11, 16, 0.45) 62%, rgba(12, 11, 16, 0) 100%);
}

.book-slide {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: #07080c;
  color: #e8e4d8;
  padding-bottom: calc(5.5rem + env(safe-area-inset-bottom));
}

.book-slide-head {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding-top: calc(0.75rem + env(safe-area-inset-top));
  padding-left: max(1.25rem, env(safe-area-inset-left));
  padding-right: max(1.25rem, env(safe-area-inset-right));
}

.book-slide-body {
  margin: 0.55rem 0 0;
  max-width: 22rem;
  color: #c8c2b6;
  font: 400 14px/1.45 var(--font-sans);
}

.book-slide .known-reading {
  margin-top: 0.7rem;
}

.book-slide .known-scripture {
  margin-top: 0.85rem;
}

.book-slide-frame {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  margin: 0.85rem 1.15rem 0.35rem;
  border-radius: 1.05rem;
  overflow: hidden;
  background: #07080c;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.book-slide-frame canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}


.known-head {
  position: relative;
  padding-top: calc(0.75rem + env(safe-area-inset-top));
  padding-left: max(1.25rem, env(safe-area-inset-left));
  padding-right: max(1.25rem, env(safe-area-inset-right));
}

.known-close {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  border: 0;
  padding: 0;
  margin: -0.4rem 0 0.2rem;
  background: transparent;
  color: #e8e4d8;
  font: 500 15px/1 var(--font-sans);
  cursor: pointer;
}

.known-kicker {
  margin: 0;
  color: rgba(196, 189, 176, 0.85);
  font: 500 10px/1.4 var(--font-sans);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.known-title {
  margin: 0.6rem 0 0;
  max-width: 20rem;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 7.6vw, 2.6rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.08;
  outline: none;
}

.known-body {
  margin: 0.7rem 0 0;
  max-width: 21rem;
  color: #c8c2b6;
  font: 13px/1.5 var(--font-sans);
}

.known-reading {
  margin: 0.8rem 0 0;
  max-width: 20rem;
  font-family: var(--font-serif);
  font-size: clamp(1.15rem, 4.6vw, 1.45rem);
  line-height: 1.25;
  color: #f0dcc0;
}

.known-scripture {
  margin: 0.9rem 0 0;
  max-width: 21rem;
}
.known-scripture p {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.5;
  color: #efe9dc;
}
.known-scripture cite {
  display: block;
  margin-top: 0.3rem;
  color: rgba(196, 189, 176, 0.8);
  font: 500 10px/1 var(--font-sans);
  font-style: normal;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.known-still {
  margin: 1rem 0 0;
  max-width: 21rem;
  color: #d7e4f5;
  font: 13px/1.5 var(--font-sans);
  opacity: 0.85;
  transition: opacity 900ms ease;
}
.known-still-off { opacity: 0; }

.known-foot {
  pointer-events: none;
  position: relative;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 0 max(1rem, env(safe-area-inset-right)) calc(5.75rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}
.known-foot > button,
.known-thread-stops { pointer-events: auto; }

body.world-deep .known-foot {
  padding-bottom: calc(1.4rem + env(safe-area-inset-bottom));
}

.known-source {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #9a9486;
  font: 500 11px/1 var(--font-sans);
  letter-spacing: 0.06em;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  cursor: pointer;
}

.known-thread {
  width: min(100%, 18rem);
  position: relative;
}
.known-thread svg { display: block; width: 100%; height: 8px; overflow: visible; }
.known-thread line { stroke: rgba(232, 228, 216, 0.22); stroke-width: 1; }
.known-thread .known-thread-tick { stroke: rgba(232, 228, 216, 0.45); }
.known-thread .known-thread-lit { fill: rgba(232, 228, 216, 0.9); }
.known-thread circle { fill: #e8e4d8; }
.known-thread-stops {
  position: absolute;
  inset: -20px 0;
  display: flex;
}
.known-thread-stops button {
  flex: 1;
  min-height: 44px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.known-evidence { position: absolute; inset: 0; z-index: 20; }
.known-evidence-scrim {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(5, 7, 11, 0.55);
}
.known-evidence-sheet {
  position: absolute;
  inset: auto 0 0;
  max-height: 78dvh;
  overflow-y: auto;
  border-radius: 1.4rem 1.4rem 0 0;
  padding: 1rem max(1.25rem, env(safe-area-inset-right)) calc(1.5rem + env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  background: #141512;
  color: #e8e4d8;
}
.known-evidence-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}
.known-evidence-head p {
  margin: 0;
  color: #9a9486;
  font: 500 10px/1 var(--font-sans);
  letter-spacing: 0.25em;
  text-transform: uppercase;
}
.known-evidence-head button {
  min-height: 44px;
  min-width: 44px;
  border: 0;
  background: transparent;
  color: #e8e4d8;
  font: 500 15px/1 var(--font-sans);
  cursor: pointer;
}
.known-evidence-law {
  margin: 1.2rem 0 0;
  color: #8d877a;
  font: 13px/1.5 var(--font-sans);
}

body.world-deep nav[aria-label="Primary"] {
  opacity: 0;
  pointer-events: none;
}

.claim-list { list-style: none; margin: 0; padding: 0; }

@media (prefers-reduced-motion: reduce) {
  .atmosphere-shaft {
    filter: none;
  }
  .selah-breathe {
    animation: none;
    opacity: 0.7;
  }
}



========================================================================
FILE: src/components/dock.tsx
BYTES: 1619
LINES: 42
========================================================================

import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock, Home, Orbit } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/bible", label: "Bible", icon: BookOpen },
  { to: "/immerse", label: "Immerse", icon: Orbit },
  { to: "/journey", label: "Journey", icon: Clock },
] as const;

export function Dock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/source" || pathname === "/handoff") return null;

  return (
    <nav
      aria-label="Primary"
      className="dock pointer-events-auto fixed bottom-4 left-1/2 z-30 w-[min(92vw,26rem)] -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-2 py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4 items-center">
        {TABS.map((tab) => {
          const on = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex justify-center">
              <Link
                to={tab.to}
                className={`flex min-h-12 min-w-[4.4rem] flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] tracking-wide transition-colors duration-150 ${
                  on ? "bg-white/10 text-fg" : "text-muted"
                }`}
                aria-current={on ? "page" : undefined}
              >
                <Icon className="size-[18px]" strokeWidth={1.6} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


========================================================================
FILE: src/routes/__root.tsx
BYTES: 2131
LINES: 63
========================================================================

import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Atmosphere } from "@/components/atmosphere";
import { Dock } from "@/components/dock";
import { StayHydrate } from "@/components/stay-hydrate";
import appCss from "../styles.css?url";

const APP_NAME = "Selah";

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fullBleed = pathname === "/" || pathname === "/immerse" || pathname === "/bible" || pathname === "/journey" || pathname === "/house";
  return (
    <>
      {fullBleed ? null : <Atmosphere />}
      <Outlet />
      <Dock />
    </>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0c0a" },
      {
        name: "description",
        content: "Beholding creation until wonder becomes worship.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg font-sans">
        <PreviewHostBridge />
        <AuthProvider>
          <StayHydrate />
          <Shell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});


========================================================================
FILE: src/routes/bible.tsx
BYTES: 2064
LINES: 46
========================================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

export const Route = createFileRoute("/bible")({ component: Bible });

function Bible() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#070605] text-fg">
      <div className="px-5 pt-14">
        <h1 className="font-sans text-[2.15rem] font-semibold tracking-tight text-fg">Psalm 139</h1>
        <p className="mt-3 text-[15px] text-muted">You Have Searched Me and Known Me</p>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface/80 px-4 py-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border">
            <Play className="size-5 fill-fg text-fg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-fg">Listen</p>
              <p className="text-xs text-faint">0:00 · 2:27</p>
            </div>
            <div className="mt-2 h-px w-full bg-fg/20" />
            <p className="mt-2 text-[11px] leading-relaxed text-faint">
              Read by Bob Souer · Public domain · verse timing aligned by Selah
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 px-5 text-[15px] text-muted">You Have Searched Me and Known Me</p>

      <section className="mt-6 flex flex-1 flex-col justify-end bg-[#1c1612] px-6 pb-32 pt-16">
        <p className="font-serif text-[2.35rem] leading-[1.15] text-[#efe6d6]">
          O LORD, You have searched me and known me.
        </p>
        <p className="mt-10 text-right text-[11px] tracking-[0.22em] text-faint uppercase">Psalm 139:1</p>
        <Link
          to="/immerse"
          className="mt-10 inline-flex min-h-12 w-fit items-center rounded-full border border-[#efe6d6]/25 px-5 text-[11px] tracking-[0.22em] text-[#efe6d6] uppercase"
        >
          Enter this verse ↑
        </Link>
      </section>
    </main>
  );
}


========================================================================
FILE: package.json
BYTES: 3413
LINES: 101
========================================================================

{
  "name": "app-builder-workspace",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "overrides": {
    "nf3": "0.3.17"
  },
  "scripts": {
    "dev": "node scripts/with-app-env.mjs vite dev --host 0.0.0.0 --port 8080",
    "build": "node scripts/with-app-env.mjs vite build && npm run db:migrate",
    "db:migrate": "node scripts/migrate.mjs",
    "build:dev": "node scripts/with-app-env.mjs vite build --mode development",
    "preview": "node scripts/with-app-env.mjs vite preview",
    "typecheck": "tsc --noEmit",
    "check:auth": "node scripts/check-auth-invariant.mjs",
    "test": "node --test 'scripts/**/*.test.mjs'",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@electric-sql/pglite": "^0.5.4",
    "@hookform/resolvers": "^5.7.0",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "@react-three/postprocessing": "^3.0.5",
    "@tailwindcss/vite": "^4.3.0",
    "@tanstack/react-query": "^5.101.0",
    "@tanstack/react-router": "^1.170.0",
    "@tanstack/react-start": "^1.168.0",
    "@tanstack/react-table": "^8.21.0",
    "@tanstack/router-plugin": "^1.168.0",
    "better-auth": "~1.6.30",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.0.0",
    "gsap": "^3.15.0",
    "kysely": "^0.28.5",
    "lucide-react": "^0.510.0",
    "pg": "^8.16.3",
    "postprocessing": "^6.39.4",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.54.0",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.13.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.3.0",
    "three": "^0.185.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "zod": "^4.4.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.0",
    "@types/node": "^22.16.5",
    "@types/pg": "^8.11.10",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@types/three": "^0.185.4",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.20.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lightningcss": "^1.28.0",
    "nitro": "3.0.260610-beta",
    "playwright": "^1.62.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.2.0"
  }
}


========================================================================
FILE: tsconfig.json
BYTES: 602
LINES: 21
========================================================================

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    // `src/lib/db.ts` imports scripts/migration-plan.mjs; checkJs types the
    // implementation itself instead of a hand-written declaration beside it.
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "server"]
}


========================================================================
FILE: vite.config.ts
BYTES: 7327
LINES: 209
========================================================================

import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// @ts-expect-error JS plugin alongside the TS vite config
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";
// @ts-expect-error JS plugin alongside the TS vite config
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

/** The files `src/lib/db.ts` globs — same directory, same non-recursive scope. */
function hasGlobbedMigrations(root: string): boolean {
  try {
    return readdirSync(join(root, "migrations")).some(isMigrationFile);
  } catch {
    return false;
  }
}

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 *
 * Vite awaiting the hook puts this on time-to-first-render, so an app with no
 * migrations — no schema to apply — skips it entirely rather than paying for a
 * PGLite instance it never queries.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      if (!hasGlobbedMigrations(server.config.root)) return;
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/**
 * Live-preview OAuth popup — handled HERE so the agent never has to create a
 * `/auth/popup` route (and cannot break it by scaffolding a React page that
 * paints the full app shell in the popup).
 *
 * `signIn` (client.ts) opens `/auth/popup?providerId=…` in a top-level window.
 * This middleware runs before TanStack Start, calls `handleAuthPopupRequest`,
 * and returns the 302 / completion HTML. Deployed apps do not use the popup
 * (full-page OAuth redirect), so `apply: "serve"` is enough.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      // Register immediately (not in a returned post-hook) so we run BEFORE
      // TanStack Start / the SPA HTML fallback. A model-authored
      // `src/routes/auth/popup.tsx` React page must never win this path.
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          // Ensure Host is the public preview host so Better Auth's dynamic
          // baseURL / redirect_uri match the popup origin.
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          // Preserve multiple Set-Cookie headers (OAuth state + session).
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// The dev server starts once `src/router.tsx` and `src/routes/` exist — see
// AGENTS.md § "First scaffold".
export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    watch: {
      ignored: [
        "**/attachments/**",
        "**/artifacts/**",
        "**/screenshots/**",
        "**/.vercel/**",
        "**/public/cosmos/**",
        "**/public/sinai/**",
        "**/public/knit/**",
        "**/public/creation/**",
        "**/public/house/**",
        "**/public/handoff/**",
        "**/public/cell/**",
      ],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "postprocessing",
      "gsap",
      "zustand",
    ],
  },
  plugins: [
    pgliteBootstrapPlugin(),
    // Before tanstackStart so /auth/popup never falls through to the SPA.
    authPopupPlugin(),
    // Dev-only /__app-env, read by scripts/check-auth-invariant.mjs.
    appEnvPlugin(),
    // PWA head + ?install=1 tutorial page; runs before Start/Nitro.
    grokPwaPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: "vercel",
            // Auto-registers server/middleware/* (the PWA install page +
            // manifest + head-tag middleware). Nitro v3 defaults serverDir to
            // false, so removing this silently unwires /?install=1 on deploys.
            serverDir: "./server",
          }),
        ]
      : []),
    viteReact(),
  ],
}));


========================================================================
FILE: tests/journey-paths.test.mjs
BYTES: 7216
LINES: 163
========================================================================

/**
 * The guided paths, and the promises their content has to keep.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { PATHS, PATTERNS } = await import("../src/journey/paths.ts");

test("a pattern is never a diagnosis, and always carries both of its faces", () => {
  for (const path of PATHS) {
    assert.ok(path.patterns?.length >= 8, `${path.id}: too few patterns to be recognisable to most people`);
    const ids = path.patterns.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length, `${path.id}: two patterns share an id`);
  }
  for (const pattern of PATTERNS) {
    assert.ok(pattern.label.startsWith("I "), `${pattern.id}: a pattern is said in the first person`);
    assert.ok(pattern.cost && pattern.cost.length > 20, `${pattern.id}: needs what it costs`);
    assert.ok(pattern.gift && pattern.gift.length > 20, `${pattern.id}: needs what it is for`);
  }
});

test("a path's patterns belong to that path", () => {
  for (const path of PATHS) {
    const own = new Set(path.patterns.map((p) => p.id));
    const station = path.stations.find((s) => s.kind === "patterns");
    assert.ok(station, `${path.id}: has patterns but no station offering them`);
    for (const kind of ["sort", "mirror", "carry"]) {
      if (!path.stations.some((s) => s.kind === kind)) continue;
      assert.ok(own.size > 0, `${path.id}: a ${kind} station with no patterns of its own`);
    }
  }
});

function readerFacing() {
  const out = [];
  for (const path of PATHS) {
    out.push(path.title, path.about, path.shape, path.kicker);
    for (const station of path.stations) {
      out.push(station.kicker, station.title, station.body, station.note, station.prompt, station.placeholder, station.reading);
      out.push(...(station.openings ?? []));
      out.push(...(station.buckets ?? []).map((b) => b.label));
      for (const n of station.notes ?? []) out.push(n.text, n.caveat);
    }
  }
  for (const p of PATTERNS) out.push(p.label, p.cost, p.gift);
  return out.filter(Boolean).join(" \n ").toLowerCase();
}

test("nothing a reader sees counts days, scores them, or says they are behind", () => {
  const forbidden = [
    "streak", "every day", "daily goal", "keep it up", "you missed",
    "you are behind", "on track", "your score", "level up", "badge", "reward",
    "well done", "congratulations",
  ];
  const text = readerFacing();
  for (const phrase of forbidden) {
    assert.ok(!text.includes(phrase), `a reader is shown "${phrase}", which the constitution forbids`);
  }
});

test("a path never claims to treat anyone", () => {
  const claims = ["diagnos", "your therapy", "we will heal", "cure you", "treatment", "symptom"];
  const text = readerFacing();
  for (const claim of claims) {
    assert.ok(!text.includes(claim), `a reader is shown "${claim}", which this has no business claiming`);
  }
});

test("every station can be passed, and the path still ends somewhere", () => {
  for (const path of PATHS) {
    assert.ok(path.stations.length >= 10, `${path.id}: too short to be a walk`);
    const ids = path.stations.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${path.id}: two stations share an id`);
    const patternsAt = path.stations.findIndex((s) => s.kind === "patterns");
    for (const kind of ["sort", "mirror"]) {
      const at = path.stations.findIndex((s) => s.kind === kind);
      if (at === -1) continue;
      assert.ok(patternsAt !== -1, `${path.id}: a ${kind} station with nothing to work on`);
      assert.ok(at > patternsAt, `${path.id}: ${kind} comes before anything has been tapped`);
    }
    for (const station of path.stations) {
      assert.ok(station.kicker && station.title, `${path.id}/${station.id}: needs a kicker and a title`);
      if (station.kind === "sort") assert.ok(station.buckets?.length, `${station.id}: sort needs buckets`);
      if (station.kind === "letter") assert.ok(station.openings?.length, `${station.id}: the blank first line needs help`);
    }
  }
});

test("anything asserted as psychology names a source", () => {
  for (const path of PATHS) {
    for (const station of path.stations) {
      for (const note of station.notes ?? []) {
        assert.ok(note.text && note.text.length > 30, `${station.id}: a note with nothing in it`);
        assert.ok(
          note.source && note.source.length > 25,
          `${station.id}: "${note.text.slice(0, 40)}…" is asserted with no source`,
        );
        if (note.url) assert.match(note.url, /^https:\/\//, `${station.id}: source URL must be https`);
      }
    }
  }
});

test("the claims this genre gets wrong are not made", () => {
  const unsupported = [
    "stored in the body", "the body keeps", "polyvagal", "ventral vagal",
    "inner child", "earned secure", "rewire", "reprogram", "your nervous system is",
    "set by age", "the first three years determine",
  ];
  const text = readerFacing();
  for (const phrase of unsupported) {
    assert.ok(!text.includes(phrase), `a reader is shown "${phrase}", which was checked and is not supported`);
  }
});

test("a sourced note always carries its qualification", () => {
  for (const path of PATHS) {
    for (const station of path.stations) {
      for (const note of station.notes ?? []) {
        assert.ok(
          note.caveat && note.caveat.length > 40,
          `${station.id}: "${note.text.slice(0, 40)}…" is shown with no qualification`,
        );
      }
    }
  }
});

test("scripture shown names its verse and the BSB", () => {
  for (const path of PATHS) {
    for (const station of path.stations) {
      const verses = [...(station.scripture ? [station.scripture] : []), ...(station.scriptures ?? [])];
      for (const sc of verses) {
        assert.ok(sc.text && sc.text.length > 20, `${path.id}/${station.id}: empty verse`);
        assert.ok(sc.reference.includes(`${sc.chapter}:${sc.verse}`), `${sc.reference} does not name its verse`);
        if (sc.verseEnd) {
          assert.ok(
            sc.reference.includes(`${sc.verse}\u2013${sc.verseEnd}`),
            `${sc.reference} shows two verses but names one`,
          );
        }
        assert.match(sc.reference, /· BSB$/, `${sc.reference} does not name its translation`);
      }
    }
  }
});

test("every field a walk stores is read back", () => {
  const types = readFileSync(join(root, "src/journey/paths.ts"), "utf8");
  const store = readFileSync(join(root, "src/journey/store.ts"), "utf8");
  const fields = ["station", "tapped", "chosen", "origin", "letter", "sorted", "carrying"];
  const block = /export type PathProgress = \{([\s\S]*?)\n\};/.exec(store);
  assert.ok(block, "PathProgress is not where this test expects it");
  for (const field of fields) {
    assert.ok(new RegExp(`\\b${field}\\b`).test(block[1]), `PathProgress missing ${field}`);
    assert.ok(new RegExp(`\\b${field}\\b`).test(store), `store never reads PathProgress.${field}`);
  }
  assert.ok(types.includes("export type Pattern"), "paths still own the content model");
});
