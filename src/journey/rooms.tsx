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
