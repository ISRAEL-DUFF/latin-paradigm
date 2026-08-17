#!/usr/bin/env node
/* Syntax-section content CI (syntax-section-spec §4). The morphology
   validator is untouched; this is its sibling, run by the same `npm run
   validate` gate. */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRAMES = join(HERE, "..", "src", "syntax", "frames");
const CONTENT = join(HERE, "..", "src", "content");
const ROLES = new Set(["signal", "verb", "plain"]);

/* the morphology inventory, read-only — `requires` must name real tables */
const paradigms = new Map();
for (const f of readdirSync(CONTENT).filter((x) => /^chapter\d\d\.json$/.test(x))) {
  for (const p of JSON.parse(readFileSync(join(CONTENT, f), "utf8")).paradigms ?? [])
    paradigms.set(p.id, p);
}

const errors = [];
const err = (m) => errors.push(m);
const files = readdirSync(FRAMES).filter((f) => f.endsWith(".json")).sort();
const tableIds = new Set();
let cellCount = 0, exCount = 0, fakeCount = 0, uncheckedFakes = 0;

const tables = files.map((f) => JSON.parse(readFileSync(join(FRAMES, f), "utf8")));
for (const t of tables) {
  if (tableIds.has(t.id)) err(`${t.id}: duplicate table id`);
  tableIds.add(t.id);
  if (!t.label || !t.short) err(`${t.id}: missing label/short`);
  if (typeof t.taughtAt !== "number") err(`${t.id}: taughtAt must be a chapter number`);
  if (!t.notes) err(`${t.id}: a frame table must carry its structure note`);
  if (typeof t.sourceVerified !== "boolean") err(`${t.id}: missing sourceVerified flag`);
  if (!t.layout?.rowLabels?.length || !t.layout?.colLabels?.length) err(`${t.id}: missing layout`);

  /* A recipe drill only works if something in the recipe TELLS THE ROWS
     APART. Declaring "fill" on a table whose rows share every recipe slot
     would ask the same question in each row. */
  const roleVals = (role) => (t.cells ?? []).map((c) => c.recipe?.find((r) => r.role === role)?.t);
  const discriminates = ["verb", "signal"].some((role) => {
    const vals = roleVals(role);
    return vals.every(Boolean) && new Set(vals).size > 1;
  });
  const modes = t.drillModes ?? ["read", "fill", "assemble", "impostor", "identify"];
  for (const m of modes)
    if (!["read", "fill", "assemble", "impostor", "identify"].includes(m))
      err(`${t.id}: unknown drill mode "${m}"`);
  if (!discriminates && (modes.includes("fill") || modes.includes("assemble")))
    err(`${t.id}: declares a recipe drill, but no recipe slot tells its rows apart — set drillModes without fill/assemble`);

  const seen = new Set(), pos = new Set();
  for (const c of t.cells ?? []) {
    cellCount++;
    const key = `${t.id}:${c.id}`;
    if (seen.has(c.id)) err(`${key}: duplicate cell id`);
    seen.add(c.id);
    if (pos.has(`${c.r},${c.c}`)) err(`${key}: duplicate grid position`);
    pos.add(`${c.r},${c.c}`);
    if (c.r >= t.layout.rowLabels.length || c.c >= t.layout.colLabels.length)
      err(`${key}: sits outside the declared layout`);
    if (!c.tell) err(`${key}: every frame cell needs its one-line tell`);
    if (![1, 2, 3].includes(c.freqTier)) err(`${key}: bad freqTier`);
    if (!c.recipe?.length) err(`${key}: empty recipe`);
    for (const chip of c.recipe ?? [])
      if (!ROLES.has(chip.role)) err(`${key}: bad recipe role "${chip.role}"`);
    if (!c.recipe?.some((chip) => chip.role === "verb"))
      err(`${key}: a recipe must name the mood/tense slot it drills (role "verb")`);

    /* the one-direction morphology gate */
    for (const pid of c.requires ?? []) {
      const p = paradigms.get(pid);
      if (!p) err(`${key}: requires "${pid}", which is not a morphology paradigm`);
      else if (p.chapterIntroduced > t.taughtAt)
        err(`${key}: requires ${pid} (ch.${p.chapterIntroduced}) but the frame is taught at ch.${t.taughtAt}`);
    }

    if (!c.examples?.length) err(`${key}: needs at least one cited example`);
    for (const e of c.examples ?? []) {
      exCount++;
      if (!e.translation) err(`${key}:${e.id}: every example must carry a translation`);
      if (!e.source) err(`${key}:${e.id}: every example must carry its source citation`);
      if (!e.pieces?.length) err(`${key}:${e.id}: example has no pieces`);
      for (const pc of e.pieces ?? [])
        if (!ROLES.has(pc.role)) err(`${key}:${e.id}: bad piece role "${pc.role}"`);
      if (!e.pieces?.some((pc) => pc.role === "signal"))
        err(`${key}:${e.id}: no signal piece — nothing would light up in READ`);

      for (const f of e.fakes ?? []) {
        fakeCount++;
        if (!f.checked) uncheckedFakes++;
        if (typeof f.pieceIdx !== "number" || !e.pieces[f.pieceIdx])
          err(`${key}:${e.id}: fake points at piece ${f.pieceIdx}, which does not exist`);
        if (!f.t) err(`${key}:${e.id}: fake has no replacement text`);
        if (f.t === e.pieces[f.pieceIdx]?.t)
          err(`${key}:${e.id}: fake is identical to the genuine piece — unanswerable round`);
        if (!f.teaches) err(`${key}:${e.id}: a fake must teach on discovery (missing "teaches")`);
        if (f.fromCell && f.fromCell !== "n/a" && !(t.cells ?? []).some((x) => x.id === f.fromCell)
            && !tables.some((tt) => (tt.cells ?? []).some((x) => x.id === f.fromCell)))
          err(`${key}:${e.id}: fake claims to come from "${f.fromCell}", which is no frame cell`);
      }
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} syntax-content error(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `✓ Syntax content valid — ${tables.length} frame table(s), ${cellCount} cell(s), ` +
  `${exCount} cited example(s), ${fakeCount} authored fake(s)` +
  (uncheckedFakes ? ` (${uncheckedFakes} awaiting human check — not served)` : "")
);
