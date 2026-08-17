import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, GOLD_AT, FAST_MS } from "../theme.js";
import {
  FRAME_TABLES, framesAt, frameKey, missingRequirements, requirementLabel,
  drillableCells,
} from "../syntax/index.js";
import {
  frameLevel, buildRecipeTray, buildAssemblyChips, pickFrameTarget,
  pickFrameImpostor, pickIdentify, frameFillOrder, syntaxProgress, recipeAnswer, shuffle,
  tableModes,
} from "../syntax/scheduler.js";
import {
  loadSyntaxMastery, applySyntaxDecay, recordSyntaxAnswer,
  loadSyntaxStudied, markSyntaxStudied,
} from "../db.js";
import { ModePrompt, SuccessRibbon } from "./DrillHud.jsx";
import Mixed from "./Mixed.jsx";

/* ============================================================
   THE SYNTAX SECTION (syntax-section-spec)
   A separate room behind its own door. It shares the engine's RULES with
   morphology — gold at 3, decay, weakest-first, 70/30 — but none of its
   state: own Dexie tables, own gold counter, own progress. Morphology does
   not import anything from here, and nothing here writes to morphology.
   ============================================================ */

const MODES = ["read", "fill", "assemble", "impostor", "identify"];
const MODE_BLURB = {
  read: "Tap an example — the construction's tells light up gold.",
  fill: "The grid decays to type names. Rebuild the recipes.",
  assemble: "Build the recipe from chips, in order.",
  impostor: "One element in the sentence is wrong. Tap it.",
  identify: "A sentence, cold. Which construction is it?",
};

/** Sentence rendering: signals gold, the drilled verb-slot teal, rest parchment. */
function Sentence({ pieces, swap, size = "text-xl", reveal = true }) {
  return (
    <span className={`gk ${size}`} style={{ lineHeight: 1.6 }}>
      {pieces.map((p, i) => {
        const text = swap && swap.pieceIdx === i ? swap.t : p.t;
        const color =
          p.role === "signal" ? C.gold : p.role === "verb" ? C.aegean : C.marble;
        return (
          <span key={i} style={{ color: reveal ? color : C.marble }}>
            {text}
            {i < pieces.length - 1 && !/^[,.;:]/.test(pieces[i + 1]?.t ?? "") ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

export default function SyntaxSection({
  chapter, tableId, mode, onPickTable, onPickMode, onProgress, onOpenParadigm,
}) {
  const [mastery, setMastery] = useState({});
  const [studied, setStudied] = useState({});
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState(null); // READ: cell id
  const [target, setTarget] = useState(null); // FILL/ASSEMBLE: {table, cell}
  const [tray, setTray] = useState([]);
  const [asm, setAsm] = useState(null); // {expected, chips, placed}
  const [imp, setImp] = useState(null); // {table, cell, example, fake}
  const [ident, setIdent] = useState(null);
  const [beat, setBeat] = useState(null); // {tone, icon, text}
  const [streak, setStreak] = useState(0);
  const [fastFlash, setFastFlash] = useState(false);
  const [solved, setSolved] = useState({}); // FILL: cellId -> true
  const t0 = useRef(Date.now());
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const available = useMemo(() => framesAt(chapter), [chapter]);
  const table = useMemo(
    () => available.find((t) => t.id === tableId) ?? available[0] ?? null,
    [available, tableId]
  );
  const progress = useMemo(
    () => syntaxProgress({ masteryMap: mastery, chapter }),
    [mastery, chapter]
  );

  useEffect(() => {
    (async () => {
      await applySyntaxDecay();
      const [m, s] = await Promise.all([loadSyntaxMastery(), loadSyntaxStudied()]);
      setMastery(m); setStudied(s); setReady(true);
    })();
  }, []);

  const commit = useCallback(async ({ table: t, cell, correct, fast, wrongChip }) => {
    const key = frameKey(t.id, cell.id);
    const rec = await recordSyntaxAnswer({
      key, correct, fast, latencyMs: Date.now() - t0.current, wrongChip,
    });
    setMastery((m) => ({ ...m, [key]: rec }));
    if (correct) {
      setStreak((s) => s + 1);
      if (fast) { setFastFlash(true); later(() => setFastFlash(false), 900); }
    } else setStreak(0);
    return rec;
  }, []);

  /* ---------- round setup per mode ---------- */
  const armFill = useCallback((t = table, already = {}) => {
    if (!t) return;
    const order = frameFillOrder(t, chapter, mastery).filter((c) => !already[c.id]);
    if (!order.length) {
      setTarget(null);
      setBeat({ tone: "gold", icon: "✓", text: "Every recipe in this table rebuilt." });
      return;
    }
    const cell = order[0];
    setTarget({ table: t, cell });
    setTray(buildRecipeTray({
      table: t, cell, chapter, masteryRecord: mastery[frameKey(t.id, cell.id)],
    }));
    t0.current = Date.now();
  }, [table, chapter, mastery]);

  const armAssemble = useCallback(() => {
    const pick = pickFrameTarget({ masteryMap: mastery, chapter, mode: "assemble" });
    if (!pick) return;
    setTarget(pick);
    setAsm({ ...buildAssemblyChips({ ...pick, chapter }), placed: [] });
    t0.current = Date.now();
  }, [mastery, chapter]);

  const armImpostor = useCallback(() => {
    const pick = pickFrameImpostor({ masteryMap: mastery, chapter });
    setImp(pick);
    setBeat(pick
      ? { tone: "wrong", icon: "", text: "One element in this sentence is wrong. Tap it." }
      : { tone: "aegean", icon: "", text: "No checked fakes in reach yet." });
    t0.current = Date.now();
  }, [mastery, chapter]);

  const armIdentify = useCallback(() => {
    const pick = pickIdentify({ masteryMap: mastery, chapter });
    setIdent(pick);
    setBeat(null);
    t0.current = Date.now();
  }, [mastery, chapter]);

  /* One effect owns round-arming, because mode and table are now App's state
     — a click handler cannot see the change that is about to happen. */
  useEffect(() => {
    if (!ready || !table) return;
    setBeat(null); setSolved({}); setTarget(null);
    setAsm(null); setImp(null); setIdent(null); setFocus(null);
    if (mode === "fill") armFill(table, {});
    if (mode === "assemble") armAssemble();
    if (mode === "impostor") armImpostor();
    if (mode === "identify") armIdentify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mode, table?.id]);

  /* the section's own gold count belongs in the chrome, not on the board */
  useEffect(() => { onProgress?.(progress); }, [progress, onProgress]);

  /* ---------- answers ---------- */
  const answerFill = async (chip) => {
    if (!target) return;
    const { table: t, cell } = target;
    const ok = chip === recipeAnswer(cell, t);
    const fast = Date.now() - t0.current < FAST_MS;
    await commit({ table: t, cell, correct: ok, fast, wrongChip: ok ? undefined : chip });
    if (ok) {
      const next = { ...solved, [cell.id]: true };
      setSolved(next);
      setBeat({ tone: "gold", icon: "✓", text: `${cell.tell}${fast ? " · celeriter!" : ""}` });
      later(() => { setBeat(null); armFill(t, next); }, 1700);
    } else {
      setBeat({ tone: "wrong", icon: "✗", text: `Not that one — ${chip} belongs to a different frame.` });
      later(() => setBeat(null), 1600);
    }
  };

  const tapAssembly = async (chip) => {
    if (!asm || !target) return;
    const idx = asm.placed.length;
    if (chip !== asm.expected[idx]) {
      setBeat({ tone: "wrong", icon: "✗", text: `Not next — the recipe wants ${asm.expected[idx]}.` });
      later(() => setBeat(null), 1500);
      await commit({ ...target, correct: false, fast: false, wrongChip: chip });
      return;
    }
    const placed = [...asm.placed, chip];
    setAsm({ ...asm, placed });
    if (placed.length === asm.expected.length) {
      const fast = Date.now() - t0.current < FAST_MS * 2;
      await commit({ ...target, correct: true, fast });
      setBeat({ tone: "gold", icon: "✓", text: `${target.cell.tell}${fast ? " · celeriter!" : ""}` });
      later(() => { setBeat(null); armAssemble(); }, 2000);
    }
  };

  const tapImpostorPiece = async (i) => {
    if (!imp) return;
    if (i === imp.fake.pieceIdx) {
      await commit({ table: imp.table, cell: imp.cell, correct: true, fast: false });
      setBeat({ tone: "gold", icon: "✓", text: `Found it. ${imp.fake.teaches}` });
      later(() => { setBeat(null); armImpostor(); }, 3800);
    } else {
      await commit({
        table: imp.table, cell: imp.cell, correct: false, fast: false,
        wrongChip: imp.example.pieces[i]?.t,
      });
      setBeat({ tone: "wrong", icon: "✗", text: "That element is genuine. Look again." });
      later(() => setBeat(null), 1500);
    }
  };

  const answerIdentify = async (tid) => {
    if (!ident) return;
    const ok = tid === ident.table.id;
    const fast = Date.now() - t0.current < FAST_MS;
    await commit({ table: ident.table, cell: ident.cell, correct: ok, fast, wrongChip: ok ? undefined : tid });
    setBeat(ok
      ? { tone: "gold", icon: "✓", text: `${ident.table.label} — ${ident.cell.tell}` }
      : { tone: "wrong", icon: "✗", text: `No — this is ${ident.table.label}. ${ident.cell.tell}` });
    later(() => { setBeat(null); armIdentify(); }, ok ? 2600 : 3200);
  };

  if (!ready) return <div className="p-6 text-sm" style={{ color: C.faint }}>Opening the syntax section…</div>;
  if (!available.length)
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <ModePrompt tag="SYNTAX" tone="aegean" sub="The first frames arrive with Wheelock's Chapter 25 (indirect statement).">
          Nothing here yet at Chapter {chapter}.
        </ModePrompt>
      </div>
    );

  const cellAt = (r, c) => table?.cells.find((x) => x.r === r && x.c === c);

  return (
    <div className="w-full flex flex-col items-center px-4 pb-24">
      {/* the beat / instruction banner — first-class, like the morphology HUD */}
      {beat ? (
        <ModePrompt tag={mode.toUpperCase()} tone={beat.tone}>
          {beat.icon && <span className="mr-1">{beat.icon}</span>}
          <Mixed text={beat.text} />
        </ModePrompt>
      ) : (
        <ModePrompt tag={mode.toUpperCase()} tone="aegean" sub={table?.notes ? <Mixed text={table.notes} /> : undefined}>
          {mode === "fill" && target
            ? <>Rebuild: <span style={{ color: C.gold }}>{table.layout.rowLabels[target.cell.r]}</span>
                {table.layout.colLabels.length > 1 && <> · {table.layout.colLabels[target.cell.c]}</>}</>
            : mode === "assemble" && target
              ? <>Build the recipe for <span style={{ color: C.gold }}>{target.table.short}: {target.table.layout.rowLabels[target.cell.r]}</span></>
              : mode === "identify"
                ? "Which construction is this?"
                : MODE_BLURB[mode]}
        </ModePrompt>
      )}

      <SuccessRibbon streak={streak} fast={fastFlash} fastLabel="celeriter!" />

      {/* ---------- READ / FILL: the frame grid ---------- */}
      {(mode === "read" || mode === "fill") && table && (
        <div className="w-full max-w-2xl rounded-2xl p-4 mt-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="text-base mb-3">{table.label}</div>
          <div className="grid gap-2"
            style={{ gridTemplateColumns: `minmax(7rem,1.3fr) repeat(${table.layout.colLabels.length}, 1fr)` }}>
            <div />
            {table.layout.colLabels.map((cl, i) => (
              <div key={i} className="text-[11px] tracking-widest pb-1" style={{ color: C.faint }}>
                {cl.toUpperCase()}
              </div>
            ))}
            {table.layout.rowLabels.map((rl, r) => (
              <FrameRow key={r} rl={rl} r={r} table={table} chapter={chapter} mode={mode}
                cellAt={cellAt} mastery={mastery} focus={focus} setFocus={setFocus}
                target={target} solved={solved} onOpenParadigm={onOpenParadigm} />
            ))}
          </div>

          {/* READ: the focused cell's example, refracted */}
          {mode === "read" && focus && (() => {
            const c = table.cells.find((x) => x.id === focus);
            const missing = missingRequirements(c, chapter);
            const e = c.examples[0];
            return (
              <div className="mt-4 rounded-xl p-4" style={{ background: C.panelUp }}>
                <div className="text-sm mb-2" style={{ color: C.aegean }}><Mixed text={c.tell} /></div>
                <Sentence pieces={e.pieces} />
                <div className="text-sm mt-2" style={{ color: C.marble }}>“<Mixed text={e.translation} />”</div>
                <div className="text-xs mt-1" style={{ color: C.faint }}>
                  {e.source} · <span style={{ color: C.gold }}>gold = the tell</span> ·{" "}
                  <span style={{ color: C.aegean }}>blue = the mood/tense that names it</span>
                </div>
                {missing.length > 0 && (
                  <div className="text-xs mt-2" style={{ color: C.wrong }}>
                    Waiting on {missing.map((pid) => requirementLabel(pid).label).join(", ")} —
                    this frame unlocks when that morphology does.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------- ASSEMBLE ---------- */}
      {mode === "assemble" && asm && target && (
        <div className="w-full max-w-2xl rounded-2xl p-4 mt-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="flex flex-wrap gap-2 mb-4 min-h-[46px] items-center">
            {asm.expected.map((slot, i) => (
              <span key={i} className="rounded-lg px-3 py-2 text-sm"
                style={{
                  border: `1.5px ${asm.placed[i] ? "solid" : "dashed"} ${asm.placed[i] ? C.aegean : C.line}`,
                  color: asm.placed[i] ? C.marble : C.line,
                }}>
                {asm.placed[i] ? <Mixed text={asm.placed[i]} /> : "—"}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {asm.chips.map((chip, i) => (
              <button key={i} onClick={() => tapAssembly(chip)}
                disabled={asm.placed.includes(chip)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: asm.placed.includes(chip) ? "transparent" : C.panelUp,
                  border: `1px solid ${asm.placed.includes(chip) ? "transparent" : C.line}`,
                  color: asm.placed.includes(chip) ? C.line : C.marble,
                }}>
                <Mixed text={chip} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- IMPOSTOR ---------- */}
      {mode === "impostor" && imp && (
        <div className="w-full max-w-2xl rounded-2xl p-5 mt-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="text-xs mb-3" style={{ color: C.faint }}>{imp.table.label}</div>
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
            {imp.example.pieces.map((p, i) => {
              const shown = i === imp.fake.pieceIdx ? imp.fake.t : p.t;
              return (
                <button key={i} onClick={() => tapImpostorPiece(i)}
                  className="gk text-xl rounded px-1"
                  style={{ color: p.role === "signal" ? C.gold : C.marble, border: "1px solid transparent" }}>
                  {shown}
                </button>
              );
            })}
          </div>
          <div className="text-xs mt-3" style={{ color: C.faint }}>{imp.example.source}</div>
        </div>
      )}

      {/* ---------- IDENTIFY ---------- */}
      {mode === "identify" && ident && (
        <div className="w-full max-w-2xl rounded-2xl p-5 mt-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="mb-4">
            <Sentence pieces={ident.example.pieces} reveal={false} size="text-2xl" />
            <div className="text-sm mt-2" style={{ color: C.faint }}>“<Mixed text={ident.example.translation} />”</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ident.options.map((tid) => {
              const t = FRAME_TABLES.find((x) => x.id === tid);
              return (
                <button key={tid} onClick={() => answerIdentify(tid)}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ background: C.panelUp, border: `1px solid ${C.line}` }}>
                  {t.short}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FILL tray */}
      {mode === "fill" && target && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4"
          style={{ background: `linear-gradient(transparent, ${C.ink} 30%)` }}>
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2 justify-center">
            {tray.map((chip, i) => (
              <button key={i} onClick={() => answerFill(chip)}
                className="rounded-xl px-4 py-2.5 text-sm"
                style={{ background: C.panelUp, border: `1px solid ${C.line}`, color: C.marble }}>
                <Mixed text={chip} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FrameRow({ rl, r, table, chapter, mode, cellAt, mastery, focus, setFocus, target, solved, onOpenParadigm }) {
  return (
    <>
      <div className="text-xs self-center pe-2" style={{ color: C.faint }}>{rl}</div>
      {table.layout.colLabels.map((_, c) => {
        const cell = cellAt(r, c);
        if (!cell) return <div key={c} />;
        const missing = missingRequirements(cell, chapter);
        const locked = missing.length > 0;
        const lvl = frameLevel(mastery, table.id, cell.id);
        const isTarget = mode === "fill" && target?.cell.id === cell.id;
        const hide = mode === "fill" && !solved[cell.id];
        return (
          <button key={c}
            onClick={() => {
              if (locked && onOpenParadigm) return onOpenParadigm(missing[0]);
              if (mode === "read") setFocus(focus === cell.id ? null : cell.id);
            }}
            className="rounded-xl px-3 py-2.5 text-left"
            style={{
              background: lvl >= GOLD_AT ? "#241d12" : C.panelUp,
              border: `1.5px solid ${isTarget ? C.aegean : lvl >= GOLD_AT ? C.goldDeep : C.line}`,
              opacity: locked ? 0.5 : 1,
            }}>
            {locked ? (
              <span className="text-xs" style={{ color: C.faint }}>
                🔒 needs {requirementLabel(missing[0]).label}
              </span>
            ) : hide && !isTarget ? (
              <span className="text-xs tracking-wide" style={{ color: C.faint }}>—</span>
            ) : (
              <span className="text-sm" style={{ color: isTarget && hide ? C.aegean : C.marble }}>
                {isTarget && hide ? "?" : <Mixed text={cell.recipe.map((x) => x.t).join(" + ")} />}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
