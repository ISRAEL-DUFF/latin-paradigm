import chapter01 from "./chapter01.json";
import chapter02 from "./chapter02.json";
import chapter03 from "./chapter03.json";
import chapter04 from "./chapter04.json";
import chapter05 from "./chapter05.json";
import chapter06 from "./chapter06.json";
import chapter07 from "./chapter07.json";
import chapter08 from "./chapter08.json";
import chapter09 from "./chapter09.json";
import chapter10 from "./chapter10.json";
import chapter11 from "./chapter11.json";
import chapter12 from "./chapter12.json";
import chapter13 from "./chapter13.json";
import chapter14 from "./chapter14.json";
import chapter15 from "./chapter15.json";
import chapter16 from "./chapter16.json";
import chapter17 from "./chapter17.json";
import chapter18 from "./chapter18.json";
import chapter19 from "./chapter19.json";
import chapter20 from "./chapter20.json";
import chapter21 from "./chapter21.json";
import chapter22 from "./chapter22.json";
import chapter23 from "./chapter23.json";
import chapter24 from "./chapter24.json";
import chapter25 from "./chapter25.json";
import chapter26 from "./chapter26.json";
import chapter27 from "./chapter27.json";
import chapter28 from "./chapter28.json";
import chapter29 from "./chapter29.json";
import chapter30 from "./chapter30.json";
import chapter31 from "./chapter31.json";
import chapter32 from "./chapter32.json";
import chapter33 from "./chapter33.json";
import chapter34 from "./chapter34.json";
import chapter35 from "./chapter35.json";
import chapter36 from "./chapter36.json";
import chapter37 from "./chapter37.json";
import chapter38 from "./chapter38.json";
import chapter39 from "./chapter39.json";
import chapter40 from "./chapter40.json";

/* One JSON file per Wheelock chapter (7th edition — see README). Each file:
   { chapter, title, chapterMappingVerified, paradigms[] }.
   The gate: nothing above currentChapter is ever shown or drilled. */
const CHAPTERS = [chapter01, chapter02, chapter03, chapter04, chapter05, chapter06, chapter07, chapter08, chapter09, chapter10, chapter11, chapter12, chapter13, chapter14, chapter15, chapter16, chapter17, chapter18, chapter19, chapter20, chapter21, chapter22, chapter23, chapter24, chapter25, chapter26, chapter27, chapter28, chapter29, chapter30, chapter31, chapter32, chapter33, chapter34, chapter35, chapter36, chapter37, chapter38, chapter39, chapter40];

export const ALL_PARADIGMS = CHAPTERS.flatMap((c) => c.paradigms);

export function unlockedParadigms(currentChapter) {
  return ALL_PARADIGMS.filter((p) => p.chapterIntroduced <= currentChapter);
}

export function unlockedCells(currentChapter) {
  return unlockedParadigms(currentChapter).flatMap((paradigm) =>
    paradigm.cells
      .filter((c) => c.chapterMax <= currentChapter)
      .map((cell) => ({ paradigm, cell }))
  );
}

export function paradigmsIntroducedAt(chapter) {
  return ALL_PARADIGMS.filter((p) => p.chapterIntroduced === chapter);
}

export function chapterTitle(chapter) {
  return CHAPTERS.find((c) => c.chapter === chapter)?.title ?? "";
}

export const SHIPPED_CHAPTERS = CHAPTERS.map((c) => c.chapter);
export const MAX_SHIPPED_CHAPTER = Math.max(...SHIPPED_CHAPTERS);

export const cellKey = (paradigmId, cellId) => `${paradigmId}:${cellId}`;
