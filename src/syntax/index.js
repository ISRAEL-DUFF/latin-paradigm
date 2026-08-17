import cond from "./frames/cond.json";
import cum from "./frames/cum.json";
import purpose from "./frames/purpose.json";
import result from "./frames/result.json";
import indstat from "./frames/indstat.json";
import seq from "./frames/seq.json";
import indquest from "./frames/indquest.json";
import jussive from "./frames/jussive.json";
import fear from "./frames/fear.json";
import relchar from "./frames/relchar.json";
import gerpurp from "./frames/gerpurp.json";
import datspecial from "./frames/datspecial.json";
import ablabs from "./frames/ablabs.json";
import periph from "./frames/periph.json";
import indepsubj from "./frames/indepsubj.json";
import ablative from "./frames/ablative.json";
import genitive from "./frames/genitive.json";
import dative from "./frames/dative.json";
import { ALL_PARADIGMS } from "../content/index.js";

/* The SYNTAX section's content spine (syntax-section-spec §3, §4).
   Keyed to Wheelock chapters like the morphology side, gated by the SAME
   currentChapter — one gate, two doors. Nothing here is imported by the
   morphology modules: the dependency runs one way only. */
export const FRAME_TABLES = [indstat, purpose, result, seq, cum, cond, indquest, jussive, fear, relchar, gerpurp, datspecial, ablabs, periph, indepsubj, ablative, genitive, dative].sort(
  (a, b) => a.taughtAt - b.taughtAt
);

export const frameKey = (tableId, cellId) => `${tableId}:${cellId}`;

export function framesAt(chapter) {
  return FRAME_TABLES.filter((t) => t.taughtAt <= chapter);
}
export const MAX_FRAME_CHAPTER = Math.max(...FRAME_TABLES.map((t) => t.taughtAt));

/** A frame cell may wait on morphology the player has not been shown yet
    (spec §3, the one-direction dependency). Read-only: we look at the
    morphology content, never at its mastery, and never write to it. */
export function missingRequirements(cell, chapter) {
  return (cell.requires ?? []).filter((pid) => {
    const p = ALL_PARADIGMS.find((x) => x.id === pid);
    return !p || p.chapterIntroduced > chapter;
  });
}
export function requirementLabel(pid) {
  const p = ALL_PARADIGMS.find((x) => x.id === pid);
  return p ? { label: p.label, chapter: p.chapterIntroduced, id: pid } : { label: pid, chapter: null, id: pid };
}

/** Every cell of a table that the current chapter can actually drill. */
export function drillableCells(table, chapter) {
  return table.cells.filter((c) => missingRequirements(c, chapter).length === 0);
}

/** Flat inventory for IDENTIFY's chip pool and the progress panel. */
export function allDrillableCells(chapter) {
  return framesAt(chapter).flatMap((t) =>
    drillableCells(t, chapter).map((c) => ({ table: t, cell: c }))
  );
}
