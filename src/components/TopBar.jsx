import { C } from "../theme.js";
import Mixed from "./Mixed.jsx";

/* ---------- the top bar ----------
   Replaces ~514px of stacked chrome with 48px. Everything it holds is a way
   OUT to a sheet; nothing here is touched per-answer.

   The breadcrumb rule: **it names what is on the board right now.** Not the
   table you last picked — Snipe moves you between tables and the bar has to
   follow, or it lies. Twin is the one mode where the honest answer is two
   tables, so it shows two.

   The gild rule beneath follows the same rule, and is deliberately table-local:
   it moves while you play, which a global 21/508 never visibly does. */
export default function TopBar({
  chapter, tables, mode, wide, onOpenTables, onOpenModes, onOpenSettings,
  door = "morphology", syntaxTable, syntaxMode, onOpenFrames, onOpenSyntaxModes,
}) {
  /* In the SYNTAX room the bar keeps the chapter (one gate serves both doors)
     and the settings key, but drops the table breadcrumb and the mode pill —
     those drive morphology, and offering them here would hand the user
     controls that belong to the other room. */
  const syntaxDoor = door === "syntax";
  const twin = tables.length === 2;
  /* On a wide screen the Tables rail is permanently open beside the board, so
     the breadcrumb is a label rather than a way in — it still says where you
     are, but offering to open what is already open would be noise. */
  const crumbOpens = !wide;

  return (
    <div data-test="top-bar" className="sticky top-0 w-full" style={{ zIndex: 40 }}>
      <div
        className="w-full flex items-center gap-3 px-3"
        style={{ height: 48, background: C.panel, borderBottom: `1px solid ${C.line}` }}
      >
        <button
          onClick={onOpenSettings}
          aria-label="progress and syllabus"
          className="text-lg leading-none shrink-0 px-1"
          style={{ color: C.faint }}
        >
          ☰
        </button>

        {/* min-w-0 is load-bearing: without it a long Greek label refuses to
            shrink and pushes the mode pill off the bar. */}
        <button
          onClick={syntaxDoor ? (crumbOpens ? onOpenFrames : undefined) : (crumbOpens ? onOpenTables : undefined)}
          className="flex-1 min-w-0 flex items-baseline gap-2 text-left"
          aria-label={syntaxDoor ? "choose frame" : "choose table"}
          style={{ cursor: crumbOpens ? "pointer" : "default" }}
        >
          {/* In Twin the chapter label is dropped — twins can cross chapters, so it
              would be ambiguous. Each table's chapter stays in its own header. */}
          {!twin && (
            <span
              className="text-xs shrink-0"
              style={{ color: C.faint, letterSpacing: "0.14em" }}
            >
              CH. {chapter}
            </span>
          )}
          {syntaxDoor && (
            <span className="text-base truncate" style={{ color: C.marble, minWidth: 0 }}>
              <Mixed text={syntaxTable?.short ?? "Syntax"} />
            </span>
          )}
          {!syntaxDoor && tables.map((t, i) => (
            <span key={t.id} className="flex items-baseline gap-2 min-w-0">
              {i > 0 && (
                <span className="shrink-0" style={{ color: C.aegean }}>
                  ⇄
                </span>
              )}
              <span
                className="gk text-base truncate"
                style={{ color: C.marble, minWidth: 0 }}
                title={t.short}
              >
                {t.short}
              </span>
            </span>
          ))}
          {crumbOpens && (
            <span className="shrink-0 text-xs" style={{ color: C.aegean }}>
              ▾
            </span>
          )}
        </button>

        <button
          data-test="mode-pill"
          onClick={syntaxDoor ? onOpenSyntaxModes : onOpenModes}
          className="shrink-0 px-3 py-1 rounded-full text-xs"
          style={{
            background: C.aegeanDeep,
            border: `1px solid ${C.aegean}`,
            color: "#fff",
            letterSpacing: "0.08em",
          }}
        >
          {(syntaxDoor ? syntaxMode : mode).toUpperCase()}
        </button>
      </div>

      {!syntaxDoor && <GildRule tables={tables} />}
    </div>
  );
}

/* One segment per table on the board, so Twin reads as two independent
   progressions rather than one averaged bar that hides a weak half. */
function GildRule({ tables }) {
  return (
    <div className="w-full flex" style={{ height: 2, background: C.line }}>
      {tables.map((t) => {
        const pct = t.total > 0 ? (t.gold / t.total) * 100 : 0;
        return (
          <div key={t.id} className="relative h-full" style={{ width: `${100 / tables.length}%` }}>
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
