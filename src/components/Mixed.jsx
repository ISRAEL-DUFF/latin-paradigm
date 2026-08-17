/* ---------- mixed-script text ----------
   Syntax copy interleaves the language's own words with English: recipes
   ("sī + present indicative"), frame labels ("Purpose clauses — ut / nē +
   subjunctive"), structure notes, tells, teaching lines. The interface face
   (Jost) was never cut for macrons or polytonic accents, and it shows —
   "nē" arrives as "ne¯", "ab/dē/ex" as "ab/de7ex".

   So: any token carrying a non-ASCII character gets the language face, and
   the English around it stays in the interface face. One component, used by
   every surface that can hold language text — this bug appeared three times
   in three different places before it was worth centralising.

   Rule for new surfaces: if content can reach it, render it through Mixed. */
export default function Mixed({ text }) {
  return (
    <>
      {String(text ?? "")
        .split(/(\s+)/)
        .map((tok, i) =>
          /[^\u0000-\u007F]/.test(tok) ? (
            <span key={i} className="gk">
              {tok}
            </span>
          ) : (
            <span key={i}>{tok}</span>
          )
        )}
    </>
  );
}
