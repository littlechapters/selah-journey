"use client";

/**
 * LOCKED rest state (2026-08-31). See NOTES_LISTEN_LOCK.md.
 * Glass disc · Start Recording · one-line hint · five subtext lines.
 * A sitting of a sermon or a podcast becomes a live recording, then
 * points the speaker actually said — not a meeting tool, not counsel.
 */

import { useEffect, useRef, useState } from "react";
import { Back, tap } from "./chrome";
import { splitSermon, transcribeSermon } from "./sermon";

const TARGET_RATE = 16000;
const MAX_SECONDS = 8 * 60;
const MIN_SPLIT = 80;

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechResult) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechResult = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

function SpeechCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function downsample(input: Float32Array, from: number, to: number) {
  if (from === to) return input;
  const ratio = from / to;
  const n = Math.floor(input.length / ratio);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = input[Math.floor(i * ratio)] ?? 0;
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buf);
  const ascii = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  const chunk = 0x2000;
  let s = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ListenSurface({
  onBack,
  onBroken,
  onWrite,
  onPaste,
  kept,
}: {
  onBack: () => void;
  onBroken: (title: string, body: string, points: string[]) => void;
  onWrite: () => void;
  onPaste: () => void;
  kept: { id: string; title: string; at: number; onOpen: () => void }[];
}) {
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState<"off" | "hearing" | "settling" | "breaking">("off");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [points, setPoints] = useState<string[]>([]);
  const [heading, setHeading] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const samples = useRef<Float32Array[]>([]);
  const sampleCount = useRef(0);
  const inputRate = useRef(TARGET_RATE);
  const liveRef = useRef(false);
  const recRef = useRef<SpeechRec | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const startedAt = useRef(0);
  const splits = useRef(0);
  const lastSplitAt = useRef(0);

  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    liveRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioRef.current && audioRef.current.state !== "closed") void audioRef.current.close();
    audioRef.current = null;
    cancelAnimationFrame(rafRef.current);
  };

  const maybeSplit = async (text: string, force = false) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!force && words < MIN_SPLIT) return;
    if (!force && splits.current >= 3) return;
    if (!force && Date.now() - lastSplitAt.current < 28000) return;
    lastSplitAt.current = Date.now();
    splits.current += 1;
    try {
      const result = await splitSermon({ data: { text } });
      if (!result.ok) return;
      setPoints(result.points);
      setHeading(result.title);
    } catch {
      /* live split is a gift, not a requirement */
    }
  };

  const start = async () => {
    setError("");
    setFinalText("");
    setInterim("");
    setPoints([]);
    setHeading("");
    setElapsed(0);
    samples.current = [];
    sampleCount.current = 0;
    splits.current = 0;
    lastSplitAt.current = 0;
    tap();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
    } catch {
      setError("This device is not letting us hear. You can still write what stayed.");
      return;
    }
    streamRef.current = stream;

    const ctx = new AudioContext();
    audioRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    inputRate.current = ctx.sampleRate;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.55;
    src.connect(analyser);

    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    src.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);
    proc.onaudioprocess = (ev) => {
      if (!liveRef.current) return;
      if (sampleCount.current / inputRate.current > MAX_SECONDS) return;
      const chan = ev.inputBuffer.getChannelData(0);
      samples.current.push(new Float32Array(chan));
      sampleCount.current += chan.length;
    };

    const bars = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      const el = canvas.current;
      if (!el || !liveRef.current) return;
      analyser.getByteFrequencyData(bars);
      const w = el.width;
      const h = el.height;
      const g = el.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, w, h);
      const n = 56;
      const gap = 3 * (window.devicePixelRatio || 1);
      const bw = (w - gap * (n - 1)) / n;
      const mid = h / 2;
      for (let i = 0; i < n; i++) {
        const v = (bars[Math.floor((i / n) * bars.length)] ?? 0) / 255;
        const amp = Math.max(3, v * (h * 0.46));
        const x = i * (bw + gap);
        g.fillStyle = `rgba(243, 232, 210, ${0.28 + v * 0.72})`;
        const y = mid - amp;
        const hh = amp * 2;
        if (typeof g.roundRect === "function") {
          g.beginPath();
          g.roundRect(x, y, bw, hh, Math.min(bw / 2, 3));
          g.fill();
        } else {
          g.fillRect(x, y, bw, hh);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const Ctor = SpeechCtor();
    if (Ctor) {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (ev) => {
        let fin = "";
        let inter = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const row = ev.results[i];
          if (!row) continue;
          if (row.isFinal) fin += row[0].transcript;
          else inter += row[0].transcript;
        }
        if (fin) {
          setFinalText((prev) => {
            const next = `${prev} ${fin}`.replace(/\s+/g, " ").trim();
            void maybeSplit(next);
            return next;
          });
        }
        setInterim(inter);
      };
      rec.onend = () => {
        if (liveRef.current) {
          try {
            rec.start();
          } catch {
            /* already running */
          }
        }
      };
      rec.onerror = (ev) => {
        if (ev.error === "not-allowed") setError("This device is not letting us hear.");
      };
      recRef.current = rec;
      try {
        rec.start();
      } catch {
        /* some browsers throw if started twice */
      }
    }

    startedAt.current = Date.now();
    liveRef.current = true;
    setLive(true);
    setBusy("hearing");
    draw();
  };

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
    return () => window.clearInterval(id);
  }, [live]);

  const stop = async () => {
    if (!liveRef.current) return;
    liveRef.current = false;
    setLive(false);
    recRef.current?.stop();
    recRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(rafRef.current);

    const chunks = samples.current;
    samples.current = [];
    if (audioRef.current && audioRef.current.state !== "closed") void audioRef.current.close();
    audioRef.current = null;

    const spoken = `${finalText} ${interim}`.replace(/\s+/g, " ").trim();
    setInterim("");
    let body = spoken;

    const total = chunks.reduce((n, c) => n + c.length, 0);
    if (total > TARGET_RATE * 4) {
      setBusy("settling");
      const merged = new Float32Array(total);
      let o = 0;
      for (const c of chunks) {
        merged.set(c, o);
        o += c.length;
      }
      const down = downsample(merged, inputRate.current, TARGET_RATE);
      const wav = encodeWav(down, TARGET_RATE);
      try {
        const result = await transcribeSermon({ data: { wav: toBase64(wav) } });
        if (result.ok && result.text.length > body.length * 0.6) body = result.text;
      } catch {
        /* live words still stand */
      }
    }

    if (body.length < 40) {
      setBusy("off");
      setFinalText(body);
      setError(body ? "A little more of what was said is needed." : "Nothing was heard yet.");
      return;
    }

    setBusy("breaking");
    setFinalText(body);
    try {
      const result = await splitSermon({ data: { text: body } });
      if (!result.ok) {
        setError(result.error);
        setBusy("off");
        return;
      }
      onBroken(result.title, body, result.points);
    } catch {
      setError("The notes could not be broken up just now.");
    }
    setBusy("off");
  };

  const hearing = live || busy === "hearing";
  const working = busy === "settling" || busy === "breaking";

  return (
    <div className="jny jny-full">
      <div className="jny-stage jny-threshold jny-listen-stage">
        <Back onClick={hearing || working ? () => void stop() : onBack}>{hearing || working ? "Stop" : "Back"}</Back>
        <p className="jny-kicker">{hearing ? "Listening" : working ? "Keeping" : "Notes"}</p>

        <div className="jny-listen-core">
          {hearing ? (
            <>
              <div className="jny-rec-head">
                <i className="jny-rec-dot" aria-hidden="true" />
                <span>{clock(elapsed)}</span>
              </div>
              <button type="button" className="jny-wave-wrap" onClick={() => void stop()} aria-label="Stop listening">
                <canvas ref={canvas} className="jny-wave" width={640} height={160} />
              </button>
              <p className="jny-wave-hint">Tap to stop</p>
            </>
          ) : working ? (
            <p className="jny-listen">{busy === "settling" ? "Settling the words…" : "Breaking into points…"}</p>
          ) : (
            <button type="button" className="jny-press" onClick={() => void start()}>
              <span className="jny-press-halo" aria-hidden="true" />
              <span className="jny-press-disc" aria-hidden="true">
                <span className="jny-press-glass" />
                <span className="jny-press-edge" />
                <span className="jny-press-sheen" />
                <span className="jny-press-spark" />
                <span className="jny-press-rim" />
              </span>
              <strong>Start Recording</strong>
              <em>Keep your phone where it can hear clearly.</em>
            </button>
          )}
        </div>

        {!hearing && !working ? (
          <div className="jny-listen-copy">
            <p>
              <span>Tap to record a sermon or a podcast.</span>
              <span>Selah transcribes as you listen and gathers</span>
              <span>the key points into clear, thoughtful notes.</span>
            </p>
            <p>
              <span>Save what stays with you.</span>
              <span>Return to it when you need it.</span>
            </p>
          </div>
        ) : null}

        {(finalText || interim) && (hearing || error) ? (
          <p className="jny-caption">
            {finalText} {interim ? <em>{interim}</em> : null}
          </p>
        ) : null}

        {points.length && hearing ? (
          <ol className="jny-forming">
            {heading ? <p className="jny-forming-title">{heading}</p> : null}
            {points.slice(0, 6).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        ) : null}

        {error ? <p className="jny-note">{error}</p> : null}

        {!hearing && !working ? (
          <>
            <div className="jny-quiet-row">
              <button type="button" className="jny-text-link" onClick={onWrite}>
                Write a line
              </button>
              <button type="button" className="jny-text-link" onClick={onPaste}>
                Paste a transcript
              </button>
            </div>
            {kept.length ? (
              <div className="jny-scroll jny-listen-kept">
                <div className="jny-section">
                  <h2>Kept</h2>
                  <span>{kept.length}</span>
                </div>
                {kept.map((n) => (
                  <button key={n.id} type="button" className="jny-kept-row" onClick={n.onOpen}>
                    <time>
                      {new Date(n.at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                    </time>
                    <p>{n.title}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
