import { C } from "../theme.js";
import { tableModes } from "../syntax/scheduler.js";
import Mixed from "./Mixed.jsx";

/* ---------- the syntax modes panel ----------
   ModesPanel's sibling: a sheet has room for the sentence a chip never had.
   It also says WHY a mode is missing — a case-use inventory hosts no recipe
   drill, and silently hiding the option would look like a bug. */
const SYNTAX_MODES = [
  { id: "read", label: "READ", blurb: "Tap an example — the construction's tells light up gold.",
    hint: "Zero pressure. The structure note sits underneath." },
  { id: "fill", label: "FILL", blurb: "The grid decays to type names. Rebuild each recipe.",
    hint: "The tray holds the neighbouring frames' answers — the ones you actually confuse." },
  { id: "assemble", label: "ASSEMBLE", blurb: "Build the recipe from chips, in order.",
    hint: "Choosing is easier than constructing; this is the stronger memory act." },
  { id: "impostor", label: "IMPOSTOR", blurb: "One element in the sentence is wrong. Tap it.",
    hint: "Every fake is a real form from a neighbouring frame — never invented Latin." },
  { id: "identify", label: "IDENTIFY", blurb: "A cited sentence, cold. Which construction is it?",
    hint: "The section's parse: recognition with nothing to lean on." },
];

export default function SyntaxModesPanel({ mode, table, onPick }) {
  const allowed = table ? tableModes(table) : SYNTAX_MODES.map((m) => m.id);
  return (
    <div>
      {SYNTAX_MODES.map((m) => {
        const on = mode === m.id;
        const ok = allowed.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => ok && onPick(m.id)}
            disabled={!ok}
            className="w-full flex items-start gap-3 py-3 text-left"
            style={{ borderBottom: `1px solid ${C.line}`, opacity: ok ? 1 : 0.45 }}
          >
            <span
              className="text-xs shrink-0 pt-0.5"
              style={{ color: on ? C.aegean : C.faint, letterSpacing: "0.12em", width: 84 }}
            >
              {m.label}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm" style={{ color: on ? C.aegean : C.marble }}>
                <Mixed text={m.blurb} />
              </span>
              <span className="block text-xs mt-0.5" style={{ color: C.faint }}>
                <Mixed text={ok ? m.hint : "Not for this table — its rows differ by meaning, not by a different recipe."} />
              </span>
            </span>
            {on && <span style={{ color: C.aegean }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
