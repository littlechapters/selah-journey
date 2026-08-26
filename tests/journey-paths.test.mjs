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
