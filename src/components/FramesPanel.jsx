import { C, GOLD_AT } from "../theme.js";
import { frameKey, drillableCells } from "../syntax/index.js";
import { frameLevel } from "../syntax/scheduler.js";
import Mixed from "./Mixed.jsx";

/* ---------- the frames panel ----------
   The syntax section's answer to TablesPanel, and container-agnostic for the
   same reason: it renders inside the bottom sheet on a phone and inside the
   rail on a wide screen, with only the box around it changing.

   Eighteen frames do not belong as chips on the board — that was the first
   draft, and it buried the actual drill under three rows of navigation. */
export default function FramesPanel({ tables, activeId, chapter, mastery, onPick }) {
  let lastChapter = null;
  return (
    <div>
      {tables.map((t) => {
        const cells = drillableCells(t, chapter);
        const gold = cells.filter((c) => frameLevel(mastery, t.id, c.id) >= GOLD_AT).length;
        const done = cells.length > 0 && gold === cells.length;
        const header = t.taughtAt !== lastChapter ? (lastChapter = t.taughtAt) : null;
        return (
          <div key={t.id}>
            {header !== null && (
              <div
                className="text-xs pt-3 pb-1"
                style={{ color: C.faint, letterSpacing: "0.14em" }}
              >
                CHAPTER {t.taughtAt}
              </div>
            )}
            <button
              onClick={() => onPick(t.id)}
              className="w-full flex items-baseline gap-3 py-2.5 text-left"
              style={{ borderBottom: `1px solid ${C.line}` }}
            >
              <span
                className="text-base flex-1 min-w-0 truncate"
                style={{ color: activeId === t.id ? C.aegean : C.marble }}
              >
                <Mixed text={t.label} />
              </span>
              <span
                className="text-xs shrink-0"
                style={{ color: done ? C.gold : C.faint }}
              >
                {gold}/{cells.length}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
