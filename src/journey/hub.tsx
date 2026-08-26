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
