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

## Success beats — silent-correct audit, 2026-08-10 (founder-reported)

Founder: "in LOOKUP the user gets feedback when wrong but not when right —
the system just moves to the next question." Correct, and the asymmetry was
the bug: rich feedback for failure, silence for success.

**LOOKUP now speaks in all three states**, and names the cell so the
confirmation carries the lesson rather than just a verdict:
- complete → gold banner, "✓ τέχναις — dative plural. Right." (+ the fast
  bonus inline: "ταχύς!" / "celeriter!"), the found form POPS into its cell
  (`.lookup-hit` scale-in), and the round holds 1.9s (was 1.4s silent).
- partial (homographs) → blue banner, "✓ 1 of 2 — nominative plural. Where
  else does ὁδοί live?" — progress is now felt, not just counted.
- wrong → red banner, "✗ Not there — that cell holds the nominative
  singular." (was: a red cell and no words, while IMPOSTOR spoke on both).

**The audit found one more instance of the same class:** the streak and
fast-bonus signals — the app's only "you did well" voice — rendered as
`text-xs` right-aligned grey text, the smallest type on screen. Promoted to
`SuccessRibbon`: pill-shaped, mode-colored, arriving with a pop (keyed on the
streak value so each increment re-animates).

Modes checked and found already speaking on success (no change): FILL and
SNIPE (CorrectFlash split-form animation in the cell), IMPOSTOR ("Found it —
watch it correct itself"), the accent finishing move ("ὀρθῶς — the accent is
yours too"), SCRAMBLE and RACE (both end in the RoundEnd screen), and
assembly (step chips tick to ✓ as each morpheme lands).

Verified live in both apps across all three lookup states; the beat banner
carries the 4px gold accent edge and the found cell pops. Suites green
(Greek 101, Latin 95), builds clean.

## Syntax section — phase S1 (the Latin pilot), 2026-08-10

Spec approved same day; five of six decisions settled (Latin pilot,
interleave inside the section, progress separate, build before the book
pass). **6 frame tables / 27 cells / 27 cited examples / 17 authored fakes.**

Shipped:
- **The two-door rule holds in code, not just in intent.** MORPHOLOGY |
  SYNTAX switch under the top bar, morphology default, door persisted. The
  only morphology-side edits: the switch itself, a `hidden` guard on the
  drill body, and TopBar dropping its table-breadcrumb/mode-pill/gild-rule
  in the syntax room (offering morphology controls there was a real bug
  found in live play). PROVEN SEPARATE: after a syntax session the dev DB
  held 4 records in `syntaxMastery` and **0** in `mastery`; a test asserts a
  fully-gilded morphology map moves syntax progress not at all, and another
  asserts the syntax modules never import the morphology scheduler.
- Dexie v2 adds `syntaxMastery` / `syntaxStudied` — additive migration,
  morphology stores untouched.
- Five modes live: READ (sentence refraction — signals gold, the drilled
  mood/tense blue), FILL (recipe trays of confusable neighbours), ASSEMBLE
  (ordered recipe chips), IMPOSTOR (authored swaps only), IDENTIFY (a cold
  cited sentence → which construction).
- `validate-syntax.mjs` joins `npm run validate`. It caught two real content
  bugs on first run: indirect statement's examples had no signal piece (the
  fix is linguistically right — the head verb of saying IS what triggers
  acc+inf, so *Dīcit* is the signal that lights up), and a fake referenced
  "result-neg" where the cell is "res-neg".

Design notes:
- `TIER_WEIGHT` is restated inside the syntax scheduler rather than imported
  from morphology's — the section must not depend on that module. Same
  numbers, deliberately duplicated.
- **The locked-frame path is unreachable by construction.** The validator
  enforces `requires.chapterIntroduced ≤ taughtAt`, and only frames at or
  below the player's chapter are shown, so a frame can never appear before
  its morphology. The lock UI (🔒 + a link into the paradigm) stays as a
  guard for future content; it is not a state S1 can enter, and it is
  honestly untested in live play.

ACCEPTANCE (spec §9) — verified live at Chapter 33:
✓ the conditions grid drillable in all five modes
✓ an impostor round planting cum + INDICATIVE in a circumstantial clause,
  teaching on discovery ("faciēbat is INDICATIVE — that flattens the clause
  to a plain time-stamp and loses the circumstantial colour")
✓ morphology regression: 95 morphology tests still pass, 109 total
✓ the section is findable and enterable unprompted

FOUNDER: every one of the 27 examples carries a Wheelock citation and needs
your pass alongside the paradigm content. They are pattern sentences built
on the chapter's own material, not quotations — verify wording and mark
`sourceVerified: true` per frame table.

## Syntax section — phase S2, the rest of the Latin inventory, 2026-08-10

Twelve new frame tables complete spec §6. **Latin syntax now: 18 tables /
62 cells / 62 cited examples / 36 authored fakes**, chapters 20–40.

Constructions: indirect questions (30, the mood flip), jussive noun clauses
(36, with the iubeō acc+inf exception as its trap), fear clauses (40, the
inverted negatives), relative of characteristic (38), gerund/gerundive
purpose (39), ablative absolute (24), passive periphrastic with its dative
of agent (24), independent subjunctives (28). Case-use inventories, per the
spec's "case-use rows ARE cells" ruling: ablative (8 uses), genitive (4),
dative (4).

**Two content-model defects surfaced by a live tray, both now structural:**

1. **ALL-CAPS emphasis in recipes produced near-duplicate chips.** A tray
   showed "pluperfect subjunctive" beside "PLUPERFECT subjunctive" — the
   same answer twice to the eye, one marked wrong. Emphasis belongs in the
   tell, not the recipe; all recipe slots normalized to lowercase, and a
   test now fails any tray containing two chips that differ only in case.

2. **Some frames cannot host a recipe drill at all.** A diagnostic across
   all 18 tables found 10 with repeating recipe answers. Two different
   causes, and they need different answers:
   - Where the rows share a MOOD but differ by PARTICLE (purpose ut/nē,
     fear nē/ut), the drill was asking about the identical part. New
     `discriminatorRole()` computes what actually tells a table's rows
     apart and drills THAT — verified live: fear now offers nē vs ut.
   - Where rows differ by MEANING alone (the case-use inventories, cum's
     three subjunctive senses, result's ut…nōn, and the single-cell
     ablative absolute), no recipe slot can discriminate. Those tables now
     declare `drillModes: ["read","impostor","identify"]` — the frame
     analogue of morphology's `drillClass`. The validator ENFORCES the
     rule: declaring fill/assemble without a discriminator is an error,
     which is how the one-cell ablative absolute was caught.

The UI honours the declaration — a case-use table shows only the three modes
it can host, and switching to it from FILL drops you into READ rather than
stranding you in a mode the table cannot answer.

Also fixed here (same defect class as the S3 font leak): **structure notes,
tells, translations and beat text now render language tokens in the language
font.** "ab/dē/ex" was displaying as "ab/de7ex" in Jost. The `Mixed` renderer
covers all prose surfaces in both apps.

Gates: Latin 116 tests, Greek 119, both validators, both builds. Dev DB reset.

FOUNDER: S2 adds 35 more cited examples to your Wheelock pass (62 total
across 18 tables). The case-use tables are the ones most worth your eye —
their row inventories are judgement calls about what Wheelock groups where.

### Syntax chrome refactor — founder-reported, 2026-08-10

Founder: "the syntax UI houses many UI problems we already solved for
morphology — all the buttons and selections show up on the page." Correct,
and the diagnosis was exact. At Chapter 40 the section rendered **18 frame
chips across three wrapped rows plus five mode chips plus a progress line**
before any content — roughly a third of the screen spent on navigation that
morphology had long since moved into sheets.

I built a second, worse navigation instead of reusing the solved one. Fixed
by adopting morphology's chrome wholesale:
- The frame lives in the **TopBar breadcrumb** and opens a **Frames sheet**
  (new `FramesPanel`, container-agnostic like `TablesPanel`: grouped by
  chapter, gold counts, active frame marked).
- The mode lives in the **mode pill** and opens a **How-to-drill-syntax
  sheet** (new `SyntaxModesPanel`) — which has room to say WHY a mode is
  absent on a case-use table, instead of silently hiding it.
- Wide screens get a **frames rail**, mirroring the tables rail.
- `syntaxTableId` / `syntaxMode` lifted into App, exactly where morphology's
  paradigm and mode already live; SyntaxSection now renders content only, and
  one effect owns round-arming.

Three defects surfaced while doing it:
1. **"genitive + + noun"** — recipe pieces carried their own leading "+"
   while the renderer also joined with "+". Stripped in content.
2. **The font bug, third sighting** ("ut / ne¯+ subjunctive" in frame
   labels). Stopped patching call sites: `Mixed` is now a shared component
   with a stated rule — *if content can reach a surface, render it through
   Mixed* — and it is applied to labels, notes, tells, translations, beats,
   blurbs and the breadcrumb.
3. The leak guards only covered four files, so the newly ported chrome was
   unguarded. Widened to include TopBar and all three new components — and
   it immediately caught **"CH. 8" in the Greek top bar** (my port map had no
   rule for "CH.") plus a comment in Latin's TopBar reading "twins can cross
   units", a leftover from the original Greek→Latin copy long before syntax.

Gates: Latin 116, Greek 119, both validators, both builds. Verified live on a
375px viewport in both apps.

## Dark-mode legibility — live-user report, 2026-08-10

Founder, from deployed use: "the texts are hard to read on dark mode… can the
text color be sharper?" Measured rather than guessed, against the actual
panel grounds.

**Where it actually was.** The primaries were never the problem — marble
13.28:1, gold 9.00:1, aegean 7.21:1, all AAA. The fault was `faint`, at
**5.18:1** while carrying **~44 text sites per app**, nearly all of them at
12px. WCAG's 4.5:1 floor is written for ~16px body text; at 12px it buys you
a pass and a squint. `wrong` was similar at 4.51:1 — and it is the colour the
app uses to tell you something went wrong.

**What changed** (hue and saturation preserved; only value moves, so the
palette's character is intact):
- faint  #8b8fa3 → #a9aec7   5.18 → 7.57
- wrong  #c96a5e → #eb7c6e   4.51 → 6.04
- marble #e9e6da → #efece0  13.28 → 14.03 (free, since it was being touched)

line, goldDeep and aegeanDeep stay exactly as they were: they are borders and
fills, never text, and lifting them would flatten the depth the panels rely on.

**Colour was only half of it.** Light strokes on a dark field bloom
(irradiation), which smears the glyph edge and reads as "fuzzy" no matter the
contrast. Added explicit grayscale smoothing on `html`
(`-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`,
`text-rendering: optimizeLegibility`) to kill the sub-pixel colour fringing,
and bumped small text (`text-xs`, 11px, 10px) from weight 400 to **450** —
enough to hold a stem against the bloom, not enough to read as emphasis.

Verified in the running app by sampling live DOM nodes: every small-text
sample now computes ≥7.39:1 at weight 450, smoothing confirmed active. Worst
case anywhere — faint on the lightest panel (panelUp) — is 6.76:1, still
comfortably above AA.

The palette header in theme.js was marked "locked from v0, do not change";
that note is now replaced with this reasoning, since a live-user readability
report outranks it.
