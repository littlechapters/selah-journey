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
