import Dexie from "dexie";
import { GOLD_AT } from "./theme.js";

/* Local-first, single user. Every record carries a UUID + updatedAt so a sync
   layer can be added later without schema changes (build plan §3.1). */
export const db = new Dexie("exemplum");
db.version(1).stores({
  mastery: "cellKey", // level, attempts, correct, meanLatencyMs, lastSeenAt, confusions
  meta: "key", // currentChapter, lastUnlockShownFor
  studied: "paradigmId", // has the study phase been shown for this table
});
/* v2 — the SYNTAX section (syntax-section-spec §3, two-door rule). Its own
   tables, deliberately: syntax gold never mixes with morphology gold, and
   clearing one section leaves the other intact. Additive migration only;
   morphology stores are untouched by this version. */
db.version(2).stores({
  syntaxMastery: "frameKey", // "tableId:cellId" — same 0–3 ladder, own space
  syntaxStudied: "tableId",
});

/* ---------- time decay (build plan §3.3) ----------
   Gold older than 4 days dulls to 2; older than 10 days, to 1. */
export const DECAY_TO_2_MS = 4 * 24 * 60 * 60 * 1000;
export const DECAY_TO_1_MS = 10 * 24 * 60 * 60 * 1000;

export function decayedLevel(level, lastSeenAt, now = Date.now()) {
  if (level >= GOLD_AT && lastSeenAt) {
    const age = now - lastSeenAt;
    if (age > DECAY_TO_1_MS) return 1;
    if (age > DECAY_TO_2_MS) return 2;
  }
  return level;
}

/** Run once at app start: write decayed levels back so the dulled gold is real. */
export async function applyDecay(now = Date.now()) {
  const all = await db.mastery.toArray();
  const changed = [];
  for (const rec of all) {
    const lvl = decayedLevel(rec.level, rec.lastSeenAt, now);
    if (lvl !== rec.level) changed.push({ ...rec, level: lvl, updatedAt: now });
  }
  if (changed.length) await db.mastery.bulkPut(changed);
  return changed.length;
}

/** Load the full mastery map: cellKey -> record. */
export async function loadMastery() {
  const all = await db.mastery.toArray();
  return Object.fromEntries(all.map((r) => [r.cellKey, r]));
}

const EWMA_ALPHA = 0.3;

/** Record one answer; returns the updated record. */
export async function recordAnswer({ key, correct, fast, latencyMs, wrongChip }) {
  const now = Date.now();
  const rec = (await db.mastery.get(key)) ?? {
    cellKey: key,
    id: crypto.randomUUID(),
    level: 0,
    attempts: 0,
    correct: 0,
    meanLatencyMs: latencyMs,
    lastSeenAt: 0,
    confusions: {},
  };
  rec.attempts += 1;
  if (correct) {
    rec.correct += 1;
    rec.level = Math.min(GOLD_AT, rec.level + (fast ? 2 : 1));
  } else {
    rec.level = Math.max(0, rec.level - 1);
    if (wrongChip)
      rec.confusions[wrongChip] = (rec.confusions[wrongChip] || 0) + 1;
  }
  rec.meanLatencyMs =
    rec.meanLatencyMs * (1 - EWMA_ALPHA) + latencyMs * EWMA_ALPHA;
  rec.lastSeenAt = now;
  rec.updatedAt = now;
  await db.mastery.put(rec);
  return rec;
}

/** M5: accents are a separate score channel — they never touch form mastery. */
export async function recordAccent(key, correct) {
  const rec = await db.mastery.get(key);
  if (!rec) return null;
  rec.accentAttempts = (rec.accentAttempts || 0) + 1;
  if (correct) rec.accentCorrect = (rec.accentCorrect || 0) + 1;
  rec.updatedAt = Date.now();
  await db.mastery.put(rec);
  return rec;
}

/* ---------- syntax section (own space; mirrors the morphology helpers) ---------- */
export async function loadSyntaxMastery() {
  const all = await db.syntaxMastery.toArray();
  return Object.fromEntries(all.map((r) => [r.frameKey, r]));
}
export async function applySyntaxDecay(now = Date.now()) {
  const all = await db.syntaxMastery.toArray();
  const changed = [];
  for (const rec of all) {
    const lvl = decayedLevel(rec.level, rec.lastSeenAt, now);
    if (lvl !== rec.level) changed.push({ ...rec, level: lvl, updatedAt: now });
  }
  if (changed.length) await db.syntaxMastery.bulkPut(changed);
  return changed.length;
}
export async function recordSyntaxAnswer({ key, correct, fast, latencyMs, wrongChip }) {
  const now = Date.now();
  const rec = (await db.syntaxMastery.get(key)) ?? {
    frameKey: key, id: crypto.randomUUID(), level: 0, attempts: 0, correct: 0,
    meanLatencyMs: latencyMs, lastSeenAt: 0, confusions: {},
  };
  rec.attempts += 1;
  if (correct) {
    rec.correct += 1;
    rec.level = Math.min(GOLD_AT, rec.level + (fast ? 2 : 1));
  } else {
    rec.level = Math.max(0, rec.level - 1);
    if (wrongChip) rec.confusions[wrongChip] = (rec.confusions[wrongChip] || 0) + 1;
  }
  rec.meanLatencyMs = rec.meanLatencyMs * 0.7 + latencyMs * 0.3;
  rec.lastSeenAt = now;
  rec.updatedAt = now;
  await db.syntaxMastery.put(rec);
  return rec;
}
export async function loadSyntaxStudied() {
  const all = await db.syntaxStudied.toArray();
  return Object.fromEntries(all.map((r) => [r.tableId, true]));
}
export async function markSyntaxStudied(tableId) {
  await db.syntaxStudied.put({ tableId, id: crypto.randomUUID(), updatedAt: Date.now() });
}

/* ---------- meta ---------- */
export async function getMeta(key, fallback) {
  const row = await db.meta.get(key);
  return row ? row.value : fallback;
}
export async function setMeta(key, value) {
  await db.meta.put({ key, value, id: crypto.randomUUID(), updatedAt: Date.now() });
}

/* ---------- studied flags ---------- */
export async function loadStudied() {
  const all = await db.studied.toArray();
  return Object.fromEntries(all.map((r) => [r.paradigmId, true]));
}
export async function markStudied(paradigmId) {
  await db.studied.put({ paradigmId, id: crypto.randomUUID(), updatedAt: Date.now() });
}
