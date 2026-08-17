import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  FRAME_TABLES, framesAt, frameKey, missingRequirements, drillableCells, allDrillableCells,
} from "./syntax/index.js";
import {
  buildRecipeTray, buildAssemblyChips, pickFrameTarget, pickFrameImpostor,
  pickIdentify, frameFillOrder, syntaxProgress, recipeAnswer, frameLevel, tableModes,
} from "./syntax/scheduler.js";
import { ALL_PARADIGMS } from "./content/index.js";

const CH = 33; // the whole S1 inventory is in reach here

describe("frame content (syntax-section-spec §4)", () => {
  it("every cell carries a tell, a recipe with a verb slot, and a cited example", () => {
    for (const t of FRAME_TABLES)
      for (const c of t.cells) {
        expect(c.tell, `${t.id}:${c.id}`).toBeTruthy();
        expect(c.recipe.some((r) => r.role === "verb"), `${t.id}:${c.id}`).toBe(true);
        expect(c.examples.length).toBeGreaterThan(0);
        for (const e of c.examples) {
          expect(e.translation, `${t.id}:${c.id}:${e.id}`).toBeTruthy();
          expect(e.source, `${t.id}:${c.id}:${e.id}`).toBeTruthy();
          expect(e.pieces.some((p) => p.role === "signal")).toBe(true);
        }
      }
  });

  it("no frame outruns its morphology — requires never exceed taughtAt", () => {
    /* This is what makes a locked frame unreachable in practice: content is
       authored so the paradigm always arrives first. The lock UI stays as a
       guard for future content, not as a state S1 can enter. */
    for (const t of FRAME_TABLES)
      for (const c of t.cells)
        for (const pid of c.requires ?? []) {
          const p = ALL_PARADIGMS.find((x) => x.id === pid);
          expect(p, `${t.id}:${c.id} requires unknown ${pid}`).toBeTruthy();
          expect(p.chapterIntroduced).toBeLessThanOrEqual(t.taughtAt);
        }
  });

  it("every frame in reach is drillable at its own chapter", () => {
    for (const t of FRAME_TABLES)
      expect(drillableCells(t, t.taughtAt).length).toBe(t.cells.length);
  });

  it("impostor fakes are authored, checked, and never equal the genuine piece", () => {
    for (const t of FRAME_TABLES)
      for (const c of t.cells)
        for (const e of c.examples)
          for (const f of e.fakes ?? []) {
            expect(f.checked, `${t.id}:${c.id}:${e.id}`).toBe(true);
            expect(f.teaches).toBeTruthy();
            expect(f.t).not.toBe(e.pieces[f.pieceIdx].t);
          }
  });
});

describe("frame scheduling", () => {
  it("the fill tray seats the answer exactly once, for every table that hosts FILL", () => {
    for (const t of framesAt(CH)) {
      if (!tableModes(t).includes("fill")) continue;
      for (const cell of t.cells) {
        const tray = buildRecipeTray({ table: t, cell, chapter: CH, masteryRecord: null });
        expect(tray.filter((x) => x === recipeAnswer(cell, t)).length, `${t.id}:${cell.id}`).toBe(1);
      }
    }
  });

  it("no tray offers two chips that differ only in case", () => {
    /* "PLUPERFECT subjunctive" beside "pluperfect subjunctive" looked like
       the same answer twice — founder saw it in a live tray, 2026-08-10. */
    for (const t of framesAt(CH)) {
      if (!tableModes(t).includes("fill")) continue;
      for (const cell of t.cells) {
        const tray = buildRecipeTray({ table: t, cell, chapter: CH, masteryRecord: null });
        const lower = tray.map((x) => x.toLowerCase());
        expect(new Set(lower).size, `${t.id}:${cell.id} → ${tray.join(" | ")}`).toBe(tray.length);
      }
    }
  });

  it("a table hosting FILL always has something that tells its rows apart", () => {
    for (const t of FRAME_TABLES) {
      if (!tableModes(t).includes("fill")) continue;
      const answers = t.cells.map((c) => recipeAnswer(c, t));
      expect(new Set(answers).size, `${t.id} asks the same question in every row`).toBeGreaterThan(1);
    }
  });

  it("assembly chips contain the whole recipe in order plus decoys", () => {
    for (const t of framesAt(CH))
      for (const cell of t.cells) {
        const { expected, chips } = buildAssemblyChips({ table: t, cell, chapter: CH });
        expect(expected).toEqual(cell.recipe.map((r) => r.t));
        for (const e of expected) expect(chips).toContain(e);
      }
  });

  it("targets stay inside the chapter horizon", () => {
    for (let i = 0; i < 50; i++) {
      const pick = pickFrameTarget({ masteryMap: {}, chapter: 29 });
      expect(pick.table.taughtAt).toBeLessThanOrEqual(29);
    }
  });

  it("weakest-first reaches a lone ungilded cell", () => {
    const t = FRAME_TABLES.find((x) => x.id === "cond");
    const m = {};
    for (const tt of framesAt(CH))
      for (const c of tt.cells)
        if (!(tt.id === t.id && c.id === "pastcf-p"))
          m[frameKey(tt.id, c.id)] = { level: 3, lastSeenAt: Date.now() };
    let saw = 0;
    for (let i = 0; i < 80; i++) {
      const pick = pickFrameTarget({ masteryMap: m, chapter: CH });
      if (pick.table.id === t.id && pick.cell.id === "pastcf-p") saw++;
    }
    expect(saw).toBeGreaterThan(0);
  });

  it("impostor only ever serves checked fakes", () => {
    for (let i = 0; i < 60; i++) {
      const imp = pickFrameImpostor({ masteryMap: {}, chapter: CH });
      expect(imp).toBeTruthy();
      expect(imp.fake.checked).toBe(true);
      expect(imp.example.pieces[imp.fake.pieceIdx]).toBeTruthy();
    }
  });

  it("identify offers every frame in reach as an option", () => {
    const q = pickIdentify({ masteryMap: {}, chapter: CH });
    expect(q.options.sort()).toEqual(framesAt(CH).map((t) => t.id).sort());
  });

  it("fill order covers each drillable cell once", () => {
    for (const t of framesAt(CH)) {
      const order = frameFillOrder(t, CH, {});
      expect(order.length).toBe(t.cells.length);
      expect(new Set(order.map((c) => c.id)).size).toBe(t.cells.length);
    }
  });
});

describe("the two-door rule (spec §3)", () => {
  it("syntax progress counts syntax only", () => {
    const inv = allDrillableCells(CH);
    const m = { [frameKey(inv[0].table.id, inv[0].cell.id)]: { level: 3, lastSeenAt: Date.now() } };
    const p = syntaxProgress({ masteryMap: m, chapter: CH });
    expect(p.gilded).toBe(1);
    expect(p.total).toBe(inv.length);
  });

  it("morphology gold is invisible to syntax", () => {
    /* a morphology-shaped mastery map must move nothing here */
    const morph = {};
    for (const p of ALL_PARADIGMS) for (const c of p.cells) morph[`${p.id}:${c.id}`] = { level: 3, lastSeenAt: Date.now() };
    expect(syntaxProgress({ masteryMap: morph, chapter: CH }).gilded).toBe(0);
    expect(frameLevel(morph, "cond", "sp-p")).toBe(0);
  });

  it("the syntax modules never import the morphology scheduler", () => {
    for (const f of ["src/syntax/index.js", "src/syntax/scheduler.js"]) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
      expect(src, f).not.toMatch(/from\s+["'][./]*scheduler\.js["']/);
      expect(src, f).not.toMatch(/from\s+["'][./]*grading\.js["']/);
    }
  });
});

describe("the full inventory is reachable (S2)", () => {
  it("all 18 frames are in reach by the last chapter", () => {
    expect(framesAt(40).length).toBe(FRAME_TABLES.length);
    expect(FRAME_TABLES.length).toBe(18);
  });

  it("the impostor picker can serve every frame that has a fake", () => {
    /* With 18 frames the picker is weighted-random across the whole
       inventory, so a UI hunt for one frame is slow — this proves the reach
       directly. */
    const withFakes = new Set(
      FRAME_TABLES.filter((t) =>
        t.cells.some((c) => c.examples.some((e) => (e.fakes ?? []).some((f) => f.checked)))
      ).map((t) => t.id)
    );
    const seen = new Set();
    for (let i = 0; i < 6000; i++) {
      const imp = pickFrameImpostor({ masteryMap: {}, chapter: 40 });
      if (imp) seen.add(imp.table.id);
    }
    for (const id of withFakes) expect(seen, `${id} never drawn`).toContain(id);
  });

  it("case-use frames drill like any other frame", () => {
    for (const id of ["ablative", "genitive", "dative"]) {
      const t = FRAME_TABLES.find((x) => x.id === id);
      expect(t, id).toBeTruthy();
      for (const c of t.cells) {
        const tray = buildRecipeTray({ table: t, cell: c, chapter: 40, masteryRecord: null });
        expect(tray.filter((x) => x === recipeAnswer(c)).length, `${id}:${c.id}`).toBe(1);
      }
    }
  });
});

describe("no cross-language leakage from the shared engine", () => {
  /* The mirror of Greek's guard: S1's files are the ones that get ported onward, so
     they must never pick up the sibling's vocabulary on a round trip. */
  const FILES = [
    "src/syntax/index.js",
    "src/syntax/scheduler.js",
    "src/components/SyntaxSection.jsx",
    "src/components/FramesPanel.jsx",
    "src/components/SyntaxModesPanel.jsx",
    "src/components/Mixed.jsx",
    "src/components/TopBar.jsx",
    "scripts/validate-syntax.mjs",
  ];
  it("the syntax section never names Hansen & Quinn", () => {
    for (const f of FILES) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
      expect(src, `${f} mentions Hansen & Quinn`).not.toMatch(/Hansen & Quinn/i);
      expect(src, `${f} says "unit"`).not.toMatch(/\bunits?\b/i);
    }
  });
  it("every example cites Wheelock", () => {
    for (const t of FRAME_TABLES)
      for (const c of t.cells)
        for (const e of c.examples)
          expect(e.source, `${t.id}:${c.id}:${e.id}`).not.toMatch(/Hansen & Quinn/i);
  });
});
