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
