import { FRAME_TABLES, framesAt, drillableCells, allDrillableCells, frameKey } from "./index.js";
import { GOLD_AT } from "../theme.js";
import { decayedLevel } from "../db.js";

/* The family's frequency weights, restated here rather than imported from
   the morphology scheduler: the syntax section must not depend on that
   module (spec §3 — the dependency runs one way, through content and the
   shared theme only). Same numbers, deliberately duplicated. */
const TIER_WEIGHT = { 1: 1, 2: 0.5, 3: 0.15 };

/* Syntax scheduling. Same family rules as morphology — weakest-first, 70/30
   interleave, neighbor-only distractors — but applied STRICTLY INSIDE the
   section's walls (founder decision 2026-08-10). Nothing here reads or
   writes morphology mastery. */

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function frameLevel(map, tableId, cellId, now = Date.now()) {
  const rec = map?.[frameKey(tableId, cellId)];
  if (!rec) return 0;
  return decayedLevel(rec.level, rec.lastSeenAt, now);
}

/** FILL tray: the recipe's verb-slot answers from neighbouring frames.
    A recipe chip like "imperfect subjunctive" is the answer; the
    distractors are the OTHER mood/tense recipes in reach — the whole point
    of the drill is that they are confusable. */
export function buildRecipeTray({ table, cell, chapter, masteryRecord, size = 5 }) {
  const answer = recipeAnswer(cell, table);
  const siblings = table.cells.filter((c) => c.id !== cell.id).map((c) => recipeAnswer(c, table));
  const cousins = framesAt(chapter)
    .filter((t) => t.id !== table.id)
    .flatMap((t) => t.cells.map((c) => recipeAnswer(c, t)));
  const tray = [answer];
  const confused = Object.entries(masteryRecord?.confusions ?? {}).sort((a, b) => b[1] - a[1])[0];
  if (confused && confused[0] !== answer) tray.push(confused[0]);
  for (const s of [...shuffle([...new Set(siblings)]), ...shuffle([...new Set(cousins)])]) {
    if (tray.length >= size) break;
    if (!s || tray.includes(s)) continue;
    tray.push(s);
  }
  return shuffle(tray);
}

/** WHICH part of a recipe actually distinguishes this table's rows.
    Usually the mood/tense slot — but in a particle-contrast frame (purpose
    ut/nē, fear nē/ut) every row has the same mood and the SIGNAL carries the
    lesson. Drilling the identical part would ask the same question in every
    row, so the discriminator is computed from the content itself. */
export function discriminatorRole(table) {
  for (const role of ["verb", "signal"]) {
    const vals = table.cells.map((c) => c.recipe.find((r) => r.role === role)?.t);
    if (vals.every(Boolean) && new Set(vals).size > 1) return role;
  }
  return null; // rows differ by meaning alone — not a recipe drill
}

/** The chip a FILL round is asking for, given its table's discriminator. */
export function recipeAnswer(cell, table) {
  const role = table ? discriminatorRole(table) : "verb";
  const part = cell.recipe.find((r) => r.role === (role ?? "verb"));
  return part ? part.t : cell.recipe.map((r) => r.t).join(" + ");
}

/** Content declares which mechanics suit it (default: all five). */
export const DEFAULT_MODES = ["read", "fill", "assemble", "impostor", "identify"];
export function tableModes(table) {
  const declared = table.drillModes ?? DEFAULT_MODES;
  // a table with no discriminator cannot host a recipe drill, whatever it says
  return discriminatorRole(table) ? declared : declared.filter((m) => m !== "fill" && m !== "assemble");
}

/** ASSEMBLE: the whole recipe as ordered chips, with neighbour decoys. */
export function buildAssemblyChips({ table, cell, chapter }) {
  const correct = cell.recipe.map((r) => r.t);
  const decoys = framesAt(chapter)
    .flatMap((t) => t.cells)
    .filter((c) => c.id !== cell.id)
    .flatMap((c) => c.recipe.map((r) => r.t))
    .filter((t) => !correct.includes(t));
  return { expected: correct, chips: shuffle([...new Set([...correct, ...shuffle(decoys).slice(0, 3)])]) };
}

/** Weakest-first with the family's 70/30 split — current chapter's frames
    against everything earlier, all inside syntax. */
export function pickFrameTarget({ masteryMap, chapter, mode = "assemble", now = Date.now() }) {
  const inv = allDrillableCells(chapter).filter((x) => tableModes(x.table).includes(mode));
  if (!inv.length) return null;
  const current = inv.filter((x) => x.table.taughtAt === chapter);
  const earlier = inv.filter((x) => x.table.taughtAt < chapter);
  const useCurrent = current.length && (Math.random() < 0.7 || !earlier.length);
  const pool = useCurrent ? current : earlier.length ? earlier : current;
  const scored = pool.map((x) => ({
    ...x,
    w: TIER_WEIGHT[x.cell.freqTier] * (GOLD_AT - frameLevel(masteryMap, x.table.id, x.cell.id, now) + 0.25),
  }));
  scored.sort((a, b) => b.w - a.w);
  const top = scored.slice(0, Math.max(3, Math.ceil(scored.length / 4)));
  const total = top.reduce((s, x) => s + x.w, 0);
  let roll = Math.random() * total;
  for (const x of top) { roll -= x.w; if (roll <= 0) return { table: x.table, cell: x.cell }; }
  return { table: top[0].table, cell: top[0].cell };
}

/** IMPOSTOR: an example sentence with ONE authored swap. Fakes are content,
    never generated — the app must not invent Latin (spec §5). */
export function pickFrameImpostor({ masteryMap, chapter }) {
  const withFakes = allDrillableCells(chapter).flatMap(({ table, cell }) =>
    cell.examples.flatMap((example) =>
      (example.fakes ?? [])
        .filter((f) => f.checked)
        .map((f) => ({ table, cell, example, fake: f }))
    )
  );
  if (!withFakes.length) return null;
  const scored = withFakes.map((x) => ({
    ...x,
    w: TIER_WEIGHT[x.cell.freqTier] * (GOLD_AT - frameLevel(masteryMap, x.table.id, x.cell.id) + 0.25),
  }));
  const total = scored.reduce((s, x) => s + x.w, 0);
  let roll = Math.random() * total;
  for (const x of scored) { roll -= x.w; if (roll <= 0) return x; }
  return scored[0];
}

/** IDENTIFY: show a cited example cold, ask which frame it is. Every table
    whose cells could spell this example counts as valid (the homograph rule,
    inherited from morphology). */
export function pickIdentify({ masteryMap, chapter }) {
  const inv = allDrillableCells(chapter).filter((x) => x.cell.examples.length);
  if (!inv.length) return null;
  const scored = inv.map((x) => ({
    ...x,
    w: TIER_WEIGHT[x.cell.freqTier] * (GOLD_AT - frameLevel(masteryMap, x.table.id, x.cell.id) + 0.25),
  }));
  const total = scored.reduce((s, x) => s + x.w, 0);
  let roll = Math.random() * total;
  let pick = scored[0];
  for (const x of scored) { roll -= x.w; if (roll <= 0) { pick = x; break; } }
  const example = pick.cell.examples[Math.floor(Math.random() * pick.cell.examples.length)];
  const options = shuffle(framesAt(chapter).map((t) => t.id));
  return { table: pick.table, cell: pick.cell, example, options };
}

/** Fill order inside one table: weakest first, tier-weighted. */
export function frameFillOrder(table, chapter, masteryMap, now = Date.now()) {
  return drillableCells(table, chapter)
    .map((c) => ({ c, w: TIER_WEIGHT[c.freqTier] * (GOLD_AT - frameLevel(masteryMap, table.id, c.id, now) + 0.25) }))
    .sort((a, b) => b.w - a.w)
    .map((x) => x.c);
}

/** Section progress — its own counter, never mixed into the headline. */
export function syntaxProgress({ masteryMap, chapter }) {
  const inv = allDrillableCells(chapter);
  const gilded = inv.filter((x) => frameLevel(masteryMap, x.table.id, x.cell.id) >= GOLD_AT).length;
  const locked = framesAt(chapter).reduce(
    (n, t) => n + (t.cells.length - drillableCells(t, chapter).length), 0
  );
  return { gilded, total: inv.length, locked, tables: framesAt(chapter).length };
}
