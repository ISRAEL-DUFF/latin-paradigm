# Exemplum — Latin paradigm mastery

A paradigm-mastery game for **Latin**, keyed chapter-by-chapter to **Wheelock's Latin,
7th edition**. Sibling of Παράδειγμα (Greek): independent codebase, shared family
conventions (see `../family-conventions.md`, copied spirit-for-spirit).

**Current coverage:** Chapters 1–40 (all of Wheelock) · 128 tables · 1,060 cells — every
form attested against Wiktionary's macron-faithful inflection tables (1,060/1,060 exact,
queue empty). Chapters 33, 35 and 40 introduce syntax only and ship as titled entries
with no new tables.

## The one big delta from Greek

**Macrons are the form.** puella and puellā differ by nothing else; a chip reading "ā"
and a chip reading "a" are different chips, offered side by side from Chapter 2. There is
no accent finishing move (Latin stress is predictable and untested) — that channel is
deleted, not ported.

### Documented engine divergence (family-conventions requires this note)

`pickImpostor` drops the Greek rule "a fake must never spell a genuine form elsewhere."
In Latin's syncretism-dense declensions every neighbour-ending swap IS genuine somewhere
(puellae fills four cells), so the Greek rule made Impostor return null on the entire
first declension. The Latin rule: the only illegal fake is one identical to the target
cell's own surface. puellā planted in the nominative — the spec's flagship macron
impostor — is legal and encouraged (Latin spec §2.1).

## Gates

```
npm run validate    structural + morphological content check
npm run crosscheck  every form vs resources/ (Wiktionary pages; macron-KEEPING compare)
npm test            94 tests over the pure modules
```
Plus the browser occlusion script (`scripts/measure-layout.js`) — jsdom cannot see layout.

## Provisional flags awaiting the founder's book pass (Wheelock 7th)

- `chapterMappingVerified: false` on all four chapters — placement follows the working
  map in `../extensions/latin-spec.md` §3, not yet the book's own ToC.
- Model-word choices: puella (some editions paradigm porta), amīcus/puer, magnus.
- fīlius genitive authored as fīliī (regular), vocative fīlī; older gen. fīlī noted.
- Imperatives drill wholeForm (2-cell tables; laudā's "ending" would be empty).
