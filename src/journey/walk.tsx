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
