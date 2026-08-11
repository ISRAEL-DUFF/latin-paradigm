# Corrections & judgment log — Exemplum (Latin)

Family rule: every judgment call, provisional placement, and post-ship error lands here.
A shipped error is a pipeline gap, not a typo.

## Phase 1 scaffold + Chapters 1–4 — 2026-08-08

- Engine copied from Παράδειγμα and adapted: unit→chapter (1–40), accent channel deleted,
  Dexie db "exemplum", font EB Garamond (macron rendering at chip size).
- **Crosscheck normalizer deliberately inverted from Greek: macrons KEPT** (they are the
  checked content). Loose tier strips them for future stem transpositions only.
  Second source: Wiktionary (macron-faithful). 126/126 attested exactly; queue empty.
- **pickImpostor divergence** (see README): genuine-elsewhere fakes legal; only the
  target cell's own surface is illegal. Found because Impostor returned null on puella —
  every candidate fake was genuine somewhere in the table. Positive test added: 300 draws
  must produce a macron-only impostor.
- Verb presents decompose stem+ending with shortening sandhi (laudā+t →(āt→at) laudat;
  moneō's ēō→eō) so assembly/collapse teach the real vowel rules. moneō keeps ē before ō —
  the contrast with laudō is in both tables' notes.
- puellae is a 4-way homograph (gs/ds/np/vp) and the test suite's ambiguity anchor
  (replacing Greek's 2-way ἔλυον); Scramble banks four identical tiles.
- Imperatives: 1-row (2nd person) × sg/pl, wholeForm — the singular IS the bare stem, so
  an ending-drill would be the "tap the empty chip" farce (family-conventions §3.5).
- sum: wholeForm (suppletive). puer: endingless nom/voc (δαίμων precedent).
- Vocative tiers per Latin spec §5.4: tier 2 where distinctive (amīce, fīlī, magne,
  puer-voc), tier 3 elsewhere. fīlī is the -ius wrinkle set piece.
- Test-drill pollution: verification answered a handful of laudō/puella cells; treat any
  early gold there as unearned.
- OPEN (book pass): chapter mapping verification; porta-vs-puella; fīliī/fīlī genitive;
  whether Ch.1 should also carry a dedicated infinitive row (laudāre currently lives in
  the PP tables as part II).

## Phase 2 — Chapters 5–14, 2026-08-08

455 cells / 49 tables: futures + imperfects (laudō/moneō/agō/audiō/capiō, with the ONE
shortening rule — ā/ē/ī shorten before final -m/-t/-nt and before a vowel — decomposed as
sandhi in every tense it touches); pulcher; sum fut/impf; possum (+3-part PP); rēx,
virtūs, corpus; agō system + imperative + PP; hic/ille/iste; audiō + capiō systems + PPs;
ego, tū, is, īdem; the perfect active system (perfect, pluperfect, future perfect of
laudō); suī + ipse; i-stems cīvis, urbs, mare. **581 cells / 63 tables / Ch.1–14 —
581/581 attested exactly, queue empty.**

Pipeline incidents (both caught by the gates, both now rules):
- **Truncated downloads**: curl -m 25 cut the big Wiktionary pages mid-transfer (hic.html
  was 32 KB of ~600; idem lost entirely in a parallel race) → 92 forms queued in clusters.
  Rule: verify `</html>` is present after every fetch; retry with -m 90.
- **Stacked diacritics split tokens**: Wiktionary prints the pronominal genitive as
  illī̆us (macron + combining breve). The Latin token regex lacked a combining-mark
  continuation class, so the token split at the breve and illīus/istīus/ipsīus never
  entered the inventory. Fixed (U+0300–036F in the continuation class); breve stripped
  by normalize as before.

Design decisions:
- wholeForm vs ending-drill by segmentability: hic/is/īdem/ego/tū/suī wholeForm;
  ille/iste/ipse drill endings on stable stems (ill-/ist-/ips-), sharing one ending map —
  iste and ipse are declared pattern-copies of ille (ipse's neuter -um, not -ud).
- Perfect system decomposes on the PERFECT STEM (laudāv+ī / laudāv+erā+m / laudāv+er+ō):
  part III is literally the 1s perfect, and the relinker linked pp.laudo:iii ↔ perf:1s —
  the only membership change to pre-existing content, and it IS the Ch.12 lesson.
- unlockMsg added to pp.laudo:iii; fires on gild (verified live at Ch.12).
- suī: 4 cells, one "sg & pl" column — same forms both numbers; no nominative.
- Possessives (meus/tuus/suus/noster) not tabled — regular 2-1-2, vocabulary not paradigm.
- īdem: the m→n change (eundem/eandem) and the īdem-vs-idem vowel-length gender contrast
  are in the notes.

Verified live: "Where does huius live? (0/3 places — find them all)" (Ch.9 acceptance);
the laudāv- unlock toast (Ch.12 acceptance); all 7 modes pass occlusion at 375px;
chapter reset to 1. Test-drill pollution: pp.laudo gilded during verification (fresh
dev DB — no real founder data exists yet).

OPEN (book pass, Wheelock 7th): all chapterMappingVerified false; Ch.5 vs Ch.15 placement
of -er adjective declension detail; iste full tables vs Wheelock's "like ille" note;
whether Ch.11's īdem belongs there or later; ego/tū enclitic -cum compounds (mēcum) noted
nowhere yet.

## Phase 3 — the passive turn, Ch.15–25, 2026-08-08

274 cells / 29 tables. Numerals ūnus (pronominal -īus)/duo/trēs · fortis + ācer (i-stem
adjectives) · quī (cuius/cui 3-ways; quae 4-way across tables) · present-system passives
of laudō/moneō (Ch.18) and agō/audiō/capiō (Ch.21) · the perfect passive system (Ch.19) ·
quis · frūctus + cornū (4th decl — frūctus/frūctūs macron-as-number) · diēs + rēs (5th —
diēī vs reī vowel-length note) · the four participles + laudāns declined (Ch.23) ·
passive periphrastic (Ch.24) · the six infinitives (Ch.25).
**855 cells / 92 tables / Ch.1–25 — 855/855 attested exactly, queue empty.**

The periphrastic design (the engine finding of this phase):
- Two-word tenses (laudātus sum, laudandus est, laudātus esse, laudātum īrī) are TWO
  pieces: [participle (space included), role "participle"] + [auxiliary, role "ending"].
  The auxiliary rides the ending role deliberately: Level-1 then drills exactly the part
  that varies (scaffold "laudātus —", tray sum/es/est/sumus/estis/sunt), and mastery-2
  assembly is the two-chip "participle → ending" build. ACCEPTANCE CRITERION VERIFIED
  LIVE: ASSEMBLE prompt with laudātus + sum chips, tapped in order, completed.
- The validator's one-ending rule therefore holds unchanged; roles participle/
  participialMorpheme/auxiliary added to ROLES (augment removed).
- The relinker's only touch on old content: pp.laudo:ii (laudāre) ↔ inf:pra — part II
  IS the present infinitive, as Wheelock says. (Phase 2's was pp:iii ↔ perfect 1s.)

Other decisions:
- The shortening rule gains its last member: ā shortens before final -r (laudābar) —
  sandhi-decomposed, note on the imperfect passive.
- laudāns ablative: laudante (absolute) vs laudantī (adjectival) — authored laudante with
  the distinction in the note, Wheelock's own presentation.
- laudātus/laudātūrus/laudandus declensions are declared magnus-pattern copies in the
  participle-system table's note, not tabled — same policy as possessive adjectives.
- Ch.21 authored present passive only for 3rd/4th; their imperfect/future passives are
  backlog (Wheelock groups them here; low marginal value until the founder's book pass).
- Fetch rule paid off again: laudātī queued until the DECLINED participle's own page
  (laudatus) was fetched — conjugation pages print the lemma participle only.

OPEN (book pass): all chapterMappingVerified false; Ch.15 numeral inventory (mīlle/mīlia
not yet authored); quis plural (= relative, noted not tabled); 3rd/4th impf+fut passives;
gerund (Ch.39 material) untouched as planned.

## Phase 4 — the subjunctive and the irregular tail, Ch.26–40, 2026-08-08

Comparison (Ch.26–27) · present/imperfect/perfect/pluperfect subjunctive (Ch.28–30) ·
ferō (Ch.31) · volō/nōlō/mālō (Ch.32) · deponents (Ch.34) · fīō (Ch.36) · eō (Ch.37) ·
supine (Ch.38) · gerund + gerundive (Ch.39). Ch.33/35/40 are syntax-only: titled, empty.
**1,060 cells / 128 tables / Ch.1–40 — 1,060/1,060 attested exactly, queue empty.**

The deponent impostor (the design finding of this phase):
- No engine work was needed to spring the trap. hortor shares the same-kind ending pool
  with every other verb table, so pickImpostor naturally welds ACTIVE endings onto the
  deponent stem — hortāestis, hortāērunt appeared live — forms that cannot exist.
- The one addition: tapImpostorCell reads `paradigm.isDeponent` and swaps the found-it
  message for the lesson ("this verb is deponent … a form like that simply does not
  exist"). ACCEPTANCE CRITERION VERIFIED LIVE at Ch.34: three straight fakes found on
  hortor, deponent explanation displayed on discovery. A positive test pins that
  impossible-active fakes actually occur in 300 draws (and that the fake never spells
  the target cell's own surface — a genuine SIBLING form in the wrong cell is legal).
- isDeponent also rides pp.hortor/pp.sequor; part III is the two-word periphrastic
  (hortātus sum) using Phase 3's participle+auxiliary-as-ending pattern.

Other decisions:
- Subjunctive moodMarkers carry Wheelock's mnemonic vowels (ē/eā/ā/iā, "wE beAt A
  liAr") as their own piece role; every one obeys the same shortening sandhi (laudēm→
  laudem). Imperfect/pluperfect ride tenseMarkers rē/issē ("infinitive + endings").
- Comparatives are consonant stems: fortiōrum/fortiōra explicitly against fortium/fortia,
  ablative fortiōre. Irregular comparison is a lexical wholeForm grid (bonus/malus/
  magnus/parvus/multus × comparative/superlative); plūs noted as a neuter noun.
- nōlō's 2s/3s are two-word cells (nōn vīs, nōn vult) — attested word-by-word by the
  Phase 3 spaced-form rule. mālō's macron is called out against malus.
- ferō/volō/nōlō/mālō/fīō/eō presents are wholeForm (theme-vowel loss is not a
  segmentation the learner should build); eō's imperfect/future ARE segmented (ī+bā+m,
  ī+b+ō — regular machinery on a two-letter stem).
- The gerundive singular is the §2.4 three-chip assembly: laudā + nd (participialMorpheme)
  + magnus-endings, with ānd→and sandhi; gerund is its four-cell no-nominative column.
- Supine: two cells (laudātum/laudātū), freqTier 3.

OPEN (book pass, now the whole of it): all 40 chapters chapterMappingVerified false —
the founder's Wheelock 7th pass is THE remaining content gate; the spec's two-person
rule for irregular-verb tables (ferō/volō/nōlō/mālō/fīō/eō) names the founder as second
verifier. Backlog unchanged: mīlle/mīlia, 3rd/4th impf+fut passives, quis-pl note,
velim/nōlim/mālim subjunctives, gerundive plural (pattern-copy of magnus pl).

## HUD polish + Lookup integrity, 2026-08-10 (founder-reported, both classical apps)

1. **Race clock rebuilt as a first-class HUD element** (was a tiny text-sm
   line): components/DrillHud.jsx `RaceClock` — a 76px draining SVG ring with
   the seconds large in its center; calm blue above 20s, gold through the
   middle third, alarm-red with a pulse under 10s (pulse suppressed under
   prefers-reduced-motion). Best-time and the mode subtitle ride alongside.
2. **LOOKUP answer-key leak closed** (founder: "when a table is fully gilded,
   LOOKUP becomes worthless"). Root cause: gilded cells rendered their forms
   as a trophy inside lookup mode, so a fully gilded table displayed every
   answer. Ruling: reverse lookup tests WHERE a form lives, from memory — no
   form is ever visible until found. Gold now shows as a tinted cell marker
   and border only; the trophy survives, the leak does not. (Cell.jsx lookup
   branch; comment records the founder report.)
3. **IMPOSTOR and LOOKUP instructions promoted to `ModePrompt` banners**
   (same visual rank as the fill/assembly ask banner): mode tag chip, colored
   accent edge, instruction at reading size; the lookup prompt form renders
   at display size in gold; impostor's banner tone tracks the message
   (hunt = red, found = gold, genuine-tap = blue).

Verified live in both apps (gilded-table lookup shows only dots; ring
renders and drains; banners visible). Full suites + builds green.
