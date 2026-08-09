import { describe, it, expect } from "vitest";
import {
  buildTray,
  buildAssemblyTray,
  pickImpostor,
  pickLookup,
  pickSnipe,
  pickScrambleTable,
  answerOf,
  endingOf,
  drillsWholeForm,
  tableWeakness,
} from "./scheduler.js";
import { GOLD_AT } from "./theme.js";
import { unlockedParadigms, unlockedCells, ALL_PARADIGMS, cellKey } from "./content/index.js";
import { MAX_CHAPTER } from "./theme.js";

const CHAPTERS = Array.from({ length: MAX_CHAPTER }, (_, i) => i + 1);
const gated = (p, chapter) => p.cells.filter((c) => c.chapterMax <= chapter);

describe("chapter gating — the plan's single clearest advantage (§3.4, §7)", () => {
  /* These sweep every gated cell in all 20 units, so they collect violations
     and assert once — asserting inside the hot loop is what makes them slow. */
  it("no chip in any Level-1 tray requires a chapter above the player's", () => {
    const bad = [];
    let trays = 0;
    for (const chapter of CHAPTERS) {
      // every ending the player is allowed to have met by now
      const legal = new Set();
      for (const p of unlockedParadigms(chapter))
        for (const c of gated(p, chapter)) legal.add(drillsWholeForm(p) ? c.form : endingOf(c));

      for (const p of unlockedParadigms(chapter))
        for (const c of gated(p, chapter))
          for (let i = 0; i < 2; i++) {
            const tray = buildTray({ paradigm: p, cell: c, currentChapter: chapter, masteryRecord: null });
            trays++;
            for (const chip of tray)
              if (!legal.has(chip)) bad.push(`chapter ${chapter} ${p.id}:${c.id} → "${chip}"`);
          }
    }
    expect(bad).toEqual([]);
    expect(trays).toBeGreaterThan(1000);
  }, 20000);

  it("no piece in any assembly tray requires a chapter above the player's", () => {
    const bad = [];
    for (const chapter of CHAPTERS) {
      const legal = new Set();
      for (const p of unlockedParadigms(chapter))
        if (!drillsWholeForm(p))
          for (const c of gated(p, chapter))
            for (const pc of c.pieces) if (pc.text !== "") legal.add(pc.role + ":" + pc.text);

      for (const p of unlockedParadigms(chapter)) {
        if (drillsWholeForm(p)) continue;
        for (const c of gated(p, chapter)) {
          const { chips } = buildAssemblyTray({ paradigm: p, cell: c, currentChapter: chapter });
          for (const chip of chips)
            if (!legal.has(chip.role + ":" + chip.text))
              bad.push(`chapter ${chapter} ${p.id}:${c.id} → "${chip.text}" (${chip.role})`);
        }
      }
    }
    expect(bad).toEqual([]);
  }, 20000);

  it("the impostor never shows a form from beyond the chapter gate", () => {
    for (const chapter of CHAPTERS) {
      for (const p of unlockedParadigms(chapter)) {
        const imp = pickImpostor(p, chapter);
        if (!imp) continue;
        const cell = p.cells.find((c) => c.id === imp.cid);
        expect(cell, `${p.id}: impostor targeted a missing cell`).toBeTruthy();
        expect(cell.chapterMax).toBeLessThanOrEqual(chapter);
      }
    }
  });
});

describe("every ask is answerable", () => {
  it("the correct answer is always present in the Level-1 tray", () => {
    const bad = [];
    for (const chapter of CHAPTERS)
      for (const p of unlockedParadigms(chapter))
        for (const c of gated(p, chapter)) {
          const tray = buildTray({ paradigm: p, cell: c, currentChapter: chapter, masteryRecord: null });
          if (!tray.includes(answerOf(p, c))) bad.push(`chapter ${chapter} ${p.id}:${c.id}`);
        }
    expect(bad).toEqual([]);
  }, 20000);

  it("every assembly tray contains each expected piece, in gradeable form", () => {
    const bad = [];
    for (const chapter of CHAPTERS)
      for (const p of unlockedParadigms(chapter)) {
        if (drillsWholeForm(p)) continue;
        for (const c of gated(p, chapter)) {
          const { expected, chips } = buildAssemblyTray({ paradigm: p, cell: c, currentChapter: chapter });
          for (const pc of expected)
            if (!chips.some((ch) => ch.text === pc.text && ch.role === pc.role && !ch.refusal))
              bad.push(`chapter ${chapter} ${p.id}:${c.id} lacks ${pc.role}:${pc.text}`);
        }
      }
    expect(bad).toEqual([]);
  }, 20000);

  it("no tray offers a duplicate chip (which would be ungradeable)", () => {
    const bad = [];
    for (const chapter of CHAPTERS)
      for (const p of unlockedParadigms(chapter))
        for (const c of gated(p, chapter)) {
          const tray = buildTray({ paradigm: p, cell: c, currentChapter: chapter, masteryRecord: null });
          if (new Set(tray).size !== tray.length) bad.push(`chapter ${chapter} ${p.id}:${c.id}`);
        }
    expect(bad).toEqual([]);
  }, 20000);
});

describe("distractors are real neighbours (§ principle 2)", () => {
  it("a recorded confusion is guaranteed back in the tray", () => {
    const chapter = 2;
    const p = unlockedParadigms(chapter).find((x) => x.id === "noun.puella.decl1");
    const cell = p.cells.find((c) => c.id === "as"); // answer am
    // the recorded confusion is the ablative's ā — the macron-only trap itself
    const rec = { confusions: { "ā": 4, ae: 1 } };
    for (let i = 0; i < 20; i++) {
      const tray = buildTray({ paradigm: p, cell, currentChapter: chapter, masteryRecord: rec });
      expect(tray).toContain("ā");
    }
  });

  it("principal-parts and whole-form tables never mix chips with ending tables", () => {
    const chapter = MAX_CHAPTER;
    for (const p of unlockedParadigms(chapter)) {
      const whole = drillsWholeForm(p);
      for (const c of gated(p, chapter)) {
        const tray = buildTray({ paradigm: p, cell: c, currentChapter: chapter, masteryRecord: null });
        for (const chip of tray) {
          // whole-form trays hold whole words; ending trays hold endings
          const looksWhole = ALL_PARADIGMS.some((q) =>
            q.cells.some((qc) => qc.form === chip)
          );
          if (whole) expect(looksWhole).toBe(true);
        }
      }
    }
  });
});

describe("impostor honesty", () => {
  const shownForm = (p, imp) => {
    const cell = p.cells.find((c) => c.id === imp.cid);
    return imp.wholeForm
      ? imp.fakeEnd
      : cell.pieces.filter((x) => x.role !== "ending").map((x) => x.text).join("") + imp.fakeEnd;
  };

  it("an ending-swap impostor is never the target cell's own form (Latin rule)", () => {
    // LATIN DIVERGENCE: genuine-elsewhere fakes are legal (puellā in the
    // nominative is the point). Only a no-op fake is illegal.
    const bad = [];
    for (const chapter of CHAPTERS) {
      for (const p of unlockedParadigms(chapter)) {
        if (drillsWholeForm(p)) continue;
        for (let i = 0; i < 5; i++) {
          const imp = pickImpostor(p, chapter);
          if (!imp) continue;
          const cell = p.cells.find((c) => c.id === imp.cid);
          if (shownForm(p, imp) === cell.form) bad.push(`ch ${chapter}: ${p.id} no-op fake`);
        }
      }
    }
    expect(bad).toEqual([]);
  }, 30000);

  it("macron-only impostors occur on the first declension (Latin spec §2.1)", () => {
    const chapter = 2;
    const p = unlockedParadigms(chapter).find((x) => x.id === "noun.puella.decl1");
    const strip = (x) => x.normalize("NFD").replace(/[̄]/g, "").normalize("NFC");
    let sawMacronOnly = false;
    for (let i = 0; i < 300 && !sawMacronOnly; i++) {
      const imp = pickImpostor(p, chapter);
      if (!imp) continue;
      const cell = p.cells.find((c) => c.id === imp.cid);
      const shown = shownForm(p, imp);
      if (shown !== cell.form && strip(shown) === strip(cell.form)) sawMacronOnly = true;
    }
    expect(sawMacronOnly, "300 draws never produced a macron-only impostor").toBe(true);
  });

  it("deponents draw impossible-active impostors (Latin spec §2.3)", () => {
    // hortor shares laudō's ending pool, so the fake can wear an ACTIVE ending
    // on a deponent stem — hortās, hortat: forms that do not exist in Latin at
    // all. The trap must actually fire, and it must stay answerable (never a
    // genuine form of hortor itself).
    const chapter = 34;
    const p = unlockedParadigms(chapter).find((x) => x.id === "verb.hortor.pres.ind");
    expect(p.isDeponent).toBe(true);
    let sawImpossibleActive = false;
    for (let i = 0; i < 300; i++) {
      const imp = pickImpostor(p, chapter);
      if (!imp) continue;
      const cell = p.cells.find((c) => c.id === imp.cid);
      const shown = shownForm(p, imp);
      // a genuine SIBLING form in the wrong cell is a legal wrong-cell fake;
      // only the target cell's own surface would make the round unanswerable
      expect(shown).not.toBe(cell.form);
      if (/(s|t|mus|tis|nt)$/.test(shown) && !/(ris|tur|mur|min\u012B|ntur|or)$/.test(shown))
        sawImpossibleActive = true;
    }
    expect(sawImpossibleActive, "300 draws never faked an active form on hortor").toBe(true);
  });

  it("a whole-form impostor borrows a sibling's word but never one of its own", () => {
    // The mechanic is 'ἔλυσα where ἔλαβον belongs': the word is real, but wrong
    // for THIS chart. It must not be a form of this chart, or two cells would
    // look equally right and the round would be unanswerable.
    const bad = [];
    for (const chapter of CHAPTERS)
      for (const p of unlockedParadigms(chapter)) {
        if (!drillsWholeForm(p)) continue;
        const own = new Set(p.cells.map((c) => c.form));
        for (let i = 0; i < 5; i++) {
          const imp = pickImpostor(p, chapter);
          if (!imp) continue;
          if (own.has(shownForm(p, imp))) bad.push(`chapter ${chapter}: ${p.id} reused its own form`);
        }
      }
    expect(bad).toEqual([]);
  }, 30000);

  it("the falsified cell never still displays its own correct form", () => {
    const bad = [];
    for (const chapter of CHAPTERS)
      for (const p of unlockedParadigms(chapter))
        for (let i = 0; i < 5; i++) {
          const imp = pickImpostor(p, chapter);
          if (!imp) continue;
          const cell = p.cells.find((c) => c.id === imp.cid);
          if (shownForm(p, imp) === cell.form) bad.push(`${p.id}:${imp.cid} impostor is a no-op`);
        }
    expect(bad).toEqual([]);
  }, 30000);
});

describe("reverse lookup ambiguity (M3)", () => {
  it("an ambiguous form requires every cell that holds it", () => {
    const chapter = 2;
    const p = unlockedParadigms(chapter).find((x) => x.id === "noun.puella.decl1");
    // puellae is genitive sg, dative sg, nominative pl AND vocative pl
    let sawAmbiguous = false;
    for (let i = 0; i < 60; i++) {
      const l = pickLookup(p, chapter, {});
      const holders = p.cells.filter((c) => c.form === l.form).map((c) => c.id);
      expect(new Set(l.required)).toEqual(new Set(holders));
      if (l.form === "puellae") {
        sawAmbiguous = true;
        expect(l.required.sort()).toEqual(["ds", "gs", "np", "vp"]);
      }
    }
    expect(sawAmbiguous, "never drew the ambiguous form in 60 tries").toBe(true);
  });
});

describe("scramble scheduling", () => {
  const gild = (chapter, predicate) => {
    const map = {};
    for (const { paradigm, cell } of unlockedCells(chapter))
      if (predicate(paradigm))
        map[cellKey(paradigm.id, cell.id)] = { level: 3, lastSeenAt: 5000 };
    return map;
  };

  it("never hands back the table just finished", () => {
    for (const chapter of [2, 6, 13, 20]) {
      const just = unlockedParadigms(chapter)[0];
      for (let i = 0; i < 40; i++) {
        const p = pickScrambleTable(chapter, {}, just.id);
        expect(p).toBeTruthy();
        expect(p.id).not.toBe(just.id);
      }
    }
  });

  it("only ever returns a table inside the chapter gate", () => {
    for (const chapter of CHAPTERS)
      for (let i = 0; i < 20; i++) {
        const p = pickScrambleTable(chapter, {}, null);
        expect(p).toBeTruthy();
        expect(p.chapterIntroduced).toBeLessThanOrEqual(chapter);
      }
  });

  it("prefers a table that is weak overall to one that is nearly gold", () => {
    const chapter = 2;
    const [weakTable, strongTable] = unlockedParadigms(chapter);
    // gild everything EXCEPT weakTable, so it is the only weak one left
    const map = gild(chapter, (p) => p.id !== weakTable.id);
    for (let i = 0; i < 30; i++) {
      const p = pickScrambleTable(chapter, map, null);
      expect(p.id).toBe(weakTable.id);
    }
    expect(strongTable).toBeTruthy();
  });

  it("falls back to the least-recently-practised table once all are gold", () => {
    const chapter = 1;
    const map = gild(chapter, () => true);
    const ps = unlockedParadigms(chapter);
    const stale = ps[2];
    // make one table clearly the oldest
    for (const c of stale.cells) map[cellKey(stale.id, c.id)] = { level: 3, lastSeenAt: 1 };
    for (let i = 0; i < 20; i++) {
      expect(pickScrambleTable(chapter, map, null).id).toBe(stale.id);
    }
  });

  it("still returns something when only one table is unlocked", () => {
    // excluding the only candidate must not strand the session
    const chapter = 1;
    const only = unlockedParadigms(chapter)[0];
    const p = pickScrambleTable(chapter, {}, only.id);
    expect(p).toBeTruthy();
  });

  it("interleaves earlier units rather than drilling only the newest", () => {
    const chapter = 4; // dōnum/magnus/sum current; chapters 1–3 earlier
    let earlier = 0;
    const N = 400;
    for (let i = 0; i < N; i++) {
      const p = pickScrambleTable(chapter, {}, null);
      if (p.chapterIntroduced < chapter) earlier++;
    }
    expect(earlier / N).toBeGreaterThan(0.15);
    expect(earlier / N).toBeLessThan(0.45);
  });
});

describe("snipe scheduling", () => {
  it("only ever returns a cell inside the chapter gate", () => {
    for (const chapter of CHAPTERS)
      for (let i = 0; i < 30; i++) {
        const t = pickSnipe(chapter, {});
        expect(t).toBeTruthy();
        expect(t.paradigm.chapterIntroduced).toBeLessThanOrEqual(chapter);
        expect(t.cell.chapterMax).toBeLessThanOrEqual(chapter);
      }
  });

  it("prefers the current chapter roughly 70% of the time when both exist (§3.3)", () => {
    const chapter = 4;
    let current = 0;
    const N = 600;
    for (let i = 0; i < N; i++) {
      const t = pickSnipe(chapter, {});
      if (t.paradigm.chapterIntroduced === chapter) current++;
    }
    expect(current / N).toBeGreaterThan(0.55);
    expect(current / N).toBeLessThan(0.85);
  });

  it("defends gold: with everything gilded it returns the longest-unseen cell", () => {
    const chapter = 1;
    const map = {};
    let oldest = null;
    unlockedCells(chapter).forEach(({ paradigm, cell }, i) => {
      const key = cellKey(paradigm.id, cell.id);
      map[key] = { level: 3, lastSeenAt: 1000 + i };
      if (oldest === null) oldest = key;
    });
    const t = pickSnipe(chapter, map);
    expect(cellKey(t.paradigm.id, t.cell.id)).toBe(oldest);
  });
});

/* tableWeakness is shared by the Scramble scheduler and the Tables panel's
   "weakest first" ordering, so both must mean the same thing by "weak". */
describe("tableWeakness", () => {
  const chapter = 3;
  const p = unlockedParadigms(chapter).find((x) => x.cells.length >= 6);

  const mapAtLevel = (lvl) =>
    Object.fromEntries(p.cells.map((c) => [cellKey(p.id, c.id), { level: lvl }]));

  it("is zero when every gated cell is gilded", () => {
    expect(tableWeakness(p, chapter, mapAtLevel(GOLD_AT))).toBe(0);
  });

  it("is greatest when nothing has been learned", () => {
    const untouched = tableWeakness(p, chapter, {});
    expect(untouched).toBeGreaterThan(0);
    expect(untouched).toBeGreaterThan(tableWeakness(p, chapter, mapAtLevel(1)));
  });

  it("falls monotonically as mastery rises", () => {
    let prev = Infinity;
    for (let lvl = 0; lvl <= GOLD_AT; lvl++) {
      const w = tableWeakness(p, chapter, mapAtLevel(lvl));
      expect(w).toBeLessThan(prev);
      prev = w;
    }
  });

  it("treats a missing record as level 0", () => {
    expect(tableWeakness(p, chapter, {})).toBe(tableWeakness(p, chapter, mapAtLevel(0)));
  });

  it("weights common forms above rare ones", () => {
    // tier 1 cells contribute more than tier 3 cells at the same level
    const tier1 = p.cells.filter((c) => c.freqTier === 1);
    const tier3 = p.cells.filter((c) => c.freqTier === 3);
    if (tier1.length === 0 || tier3.length === 0) return; // not all tables mix tiers
    const only = (cells) =>
      Object.fromEntries(
        p.cells.map((c) => [
          cellKey(p.id, c.id),
          { level: cells.includes(c) ? 0 : GOLD_AT },
        ])
      );
    expect(tableWeakness(p, chapter, only(tier1.slice(0, 1)))).toBeGreaterThan(
      tableWeakness(p, chapter, only(tier3.slice(0, 1)))
    );
  });

  it("never counts cells gated above the current chapter", () => {
    const future = p.cells.filter((c) => c.chapterMax > 1);
    if (future.length === 0) return;
    expect(tableWeakness(p, 1, {})).toBeLessThan(tableWeakness(p, chapter, {}));
  });
});
