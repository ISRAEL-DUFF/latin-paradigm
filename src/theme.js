/* Night stele + aegean + gold-leaf.
   SHARPENED 2026-08-10 on a founder report from live users: "the texts are
   hard to read on dark mode". Measured against the panel ground rather than
   guessed — the primaries were already AAA (marble 13.3:1, gold 9.0:1,
   aegean 7.2:1), but `faint` sat at 5.18:1 while carrying ~44 text sites,
   most of them at 12px, where WCAG's 4.5:1 floor (written for ~16px) is not
   enough. Lifts preserve each hue and saturation; only value moves.
     faint  #8b8fa3 -> #a9aec7   5.18 -> 7.57
     wrong  #c96a5e -> #eb7c6e   4.51 -> 6.04
     marble #e9e6da -> #efece0  13.28 -> 14.03
   line/goldDeep/aegeanDeep stay put: they are borders and fills, never text. */
export const C = {
  ink: "#12141c",
  panel: "#1a1e2b",
  panelUp: "#222738",
  line: "#2e3450",
  marble: "#efece0",
  faint: "#a9aec7",
  aegean: "#6fb3d8",
  aegeanDeep: "#2c5a78",
  gold: "#d9bc72",
  goldDeep: "#8a6f33",
  wrong: "#eb7c6e",
};

export const GOLD_AT = 3; // mastery level at which a cell gilds
export const FAST_MS = 2500; // "celeriter" speed-bonus threshold
export const MAX_CHAPTER = 40;
