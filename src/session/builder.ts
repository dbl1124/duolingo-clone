import { allCards, curriculumOrder, getUnit, units } from '../content';
import type { Card } from '../content/types';
import type { MemoryState } from '../srs/fsrs';
import { isNew } from '../srs/fsrs';
import type { ExerciseMode, LadderCapabilities } from './ladder';
import { pickMode } from './ladder';

export interface SessionConfig {
  /** How many prompts to aim for. ~18 fits a 10-minute session comfortably. */
  targetItems: number;
  /** Ceiling on brand-new material per day. */
  dailyNewCap: number;
  now: number;
  caps: LadderCapabilities;
  /** Seed for reproducible interleaving. */
  seed: number;
  /** Bad-day mode: reviews only, heavily shortened, no new material. */
  minimal: boolean;
  /** Open each session with a short recap of the unit last studied. */
  warmup: boolean;
}

export const DEFAULT_SESSION_CONFIG: Omit<SessionConfig, 'now' | 'caps'> = {
  // Roughly 30 seconds per prompt including the teach screens, which lands a
  // typical session between 8 and 12 minutes.
  targetItems: 18,
  // Six new items a day is ~2,000 a year. The limit on a beginner is consolidation,
  // not appetite; piling on new material just inflates tomorrow's review queue.
  dailyNewCap: 6,
  seed: 1,
  minimal: false,
  warmup: true,
};

export const MINIMAL_SESSION_ITEMS = 6;

/** Fraction of a unit that must be introduced before the next unit opens. */
const UNIT_GATE = 0.75;

export type SessionPhase = 'warmup' | 'main';

export interface SessionItem {
  card: Card;
  mode: ExerciseMode;
  isNew: boolean;
  phase: SessionPhase;
}

/** How many questions the opening recap asks. */
export const WARMUP_COUNT = 3;

export type MemoryStates = Record<string, MemoryState | undefined>;

/** Deterministic PRNG so sessions are reproducible and testable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hasBeenIntroduced(state: MemoryState | undefined): boolean {
  return !!state && !isNew(state);
}

/**
 * Which units are open for new material.
 *
 * Unit N opens once unit N-1 is mostly introduced. Without a gate, the "new cards
 * in curriculum order" rule would march straight through unit 1 and into unit 2
 * while unit 1 was still shaky — which is how you end up with 200 half-known words
 * and no usable sentences.
 */
export function openUnitIds(states: MemoryStates): string[] {
  const open: string[] = [];
  for (const unit of units) {
    open.push(unit.id);
    const cards = [...unit.items.map((i) => i.id), ...unit.sentences.map((s) => s.id)];
    const introduced = cards.filter((id) => hasBeenIntroduced(states[id])).length;
    if (introduced / cards.length < UNIT_GATE) break;
  }
  return open;
}

export function dueCards(states: MemoryStates, now: number): Card[] {
  return allCards
    .filter((c) => {
      const s = states[c.id];
      return !!s && !isNew(s) && s.due <= now;
    })
    .sort((a, b) => (states[a.id]!.due ?? 0) - (states[b.id]!.due ?? 0));
}

export function newCandidates(states: MemoryStates): Card[] {
  const open = new Set(openUnitIds(states));
  return allCards
    .filter((c) => open.has(c.unitId) && !hasBeenIntroduced(states[c.id]))
    .sort((a, b) => curriculumOrder(a.id) - curriculumOrder(b.id));
}

/**
 * Round-robin across units, preserving order within each unit.
 *
 * This is interleaving in the Rohrer & Taylor sense: mixing item types within a
 * session beats blocking them, even though blocked practice feels smoother at the
 * time. Reviewing all of ser, then all of estar, teaches you each in isolation;
 * mixing them teaches you to *choose* between them, which is the actual skill.
 */
export function interleaveByUnit<T extends { card: Card }>(items: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.card.unitId);
    if (list) list.push(item);
    else buckets.set(item.card.unitId, [item]);
  }
  const queues = [...buckets.values()];
  const out: T[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        progress = true;
      }
    }
  }
  return out;
}

/** Spread new material evenly through the review queue rather than front-loading it. */
export function spread<T>(base: T[], inserts: T[]): T[] {
  if (inserts.length === 0) return [...base];
  if (base.length === 0) return [...inserts];
  const out: T[] = [];
  const step = base.length / inserts.length;
  let insertIdx = 0;
  for (let i = 0; i < base.length; i++) {
    // A short warm-up of known material before the first new item: starting cold on
    // something unfamiliar is a worse first impression of the session than starting
    // with a win.
    if (insertIdx < inserts.length && i > 0 && i >= Math.round(step * insertIdx)) {
      out.push(inserts[insertIdx]!);
      insertIdx++;
    }
    out.push(base[i]!);
  }
  while (insertIdx < inserts.length) out.push(inserts[insertIdx++]!);
  return out;
}

/**
 * How much new material to allow today.
 *
 * Reviews always win. If the backlog already fills the session, no new cards are
 * introduced at all — the single most important rule in the whole builder. A
 * spaced-repetition app that keeps adding new material while the review queue
 * grows will bury the learner within a month, and every abandoned Anki deck in
 * the world died this way.
 */
export function newAllowance(dueCount: number, cfg: SessionConfig): number {
  if (cfg.minimal) return 0;
  const room = cfg.targetItems - dueCount;
  if (room <= 0) return 0;
  return Math.max(0, Math.min(cfg.dailyNewCap, room));
}

/**
 * The unit the learner was last working in — what "last lesson" means here.
 *
 * Defined as the furthest point reached in the curriculum rather than the most
 * recent timestamp, because the two diverge after a lapse: re-reviewing a unit-1
 * card does not mean unit 1 is where you left off.
 */
export function recentUnitId(states: MemoryStates): string | null {
  let best: { unitId: string; order: number } | null = null;
  for (const card of allCards) {
    if (!hasBeenIntroduced(states[card.id])) continue;
    const order = curriculumOrder(card.id);
    if (!best || order > best.order) best = { unitId: card.unitId, order };
  }
  return best?.unitId ?? null;
}

/**
 * The opening recap: a few questions on the unit last studied.
 *
 * This is not what the scheduler would choose on its own — FSRS would leave these
 * items alone until they were actually due, and asking early yields less stability
 * growth than waiting. The cost is small and bounded (three items), and it buys
 * something the scheduler cannot: a clear sense of what last session actually
 * stuck, before new material lands on top of it.
 *
 * To keep the cost as close to zero as possible, due items are chosen first — those
 * were going to be asked today regardless, so putting them here is free. Not-yet-due
 * items only fill the remainder, weakest memory first.
 */
export function warmupItems(
  states: MemoryStates,
  cfg: SessionConfig,
  retrievabilityOf: (s: MemoryState, now: number) => number,
  count: number = WARMUP_COUNT,
): SessionItem[] {
  if (!cfg.warmup || cfg.minimal || count <= 0) return [];

  const unitId = recentUnitId(states);
  if (!unitId) return [];

  const unit = getUnit(unitId);
  const previous = unit ? units.find((u) => u.n === unit.n - 1) : undefined;

  const eligible = (id: string) => {
    const state = states[id];
    return hasBeenIntroduced(state) ? state! : null;
  };

  const fromUnits = [unitId, previous?.id].filter(Boolean) as string[];
  const pool = allCards
    .filter((c) => fromUnits.includes(c.unitId) && eligible(c.id))
    // Words and short phrases; a full sentence makes a poor quick-fire question.
    .filter((c) => c.kind === 'lex')
    .map((c) => {
      const state = states[c.id]!;
      return {
        card: c,
        due: state.due <= cfg.now,
        recall: retrievabilityOf(state, cfg.now),
        sameUnit: c.unitId === unitId,
      };
    })
    .sort(
      (a, b) =>
        Number(b.sameUnit) - Number(a.sameUnit) ||
        Number(b.due) - Number(a.due) ||
        a.recall - b.recall,
    )
    .slice(0, count);

  // Alternate the two framings the learner asked for: produce ("how do you say…")
  // and recognise ("what does … mean"). Starting on recognise makes the first
  // question of the day the easier of the two.
  return pool.map(({ card }, i) => ({
    card,
    mode: (i % 2 === 0 ? 'recognize' : 'produce') as ExerciseMode,
    isNew: false,
    phase: 'warmup' as const,
  }));
}

export function buildSession(
  states: MemoryStates,
  cfg: SessionConfig,
  retrievabilityOf: (s: MemoryState, now: number) => number = () => 0,
): SessionItem[] {
  const rand = mulberry32(cfg.seed);
  const due = dueCards(states, cfg.now);

  if (cfg.minimal) {
    const picked = interleaveByUnit(
      due.slice(0, MINIMAL_SESSION_ITEMS).map((card) => ({ card })),
    );
    return picked.map(({ card }) => ({
      card,
      mode: pickMode(card, states[card.id], cfg.caps, rand),
      isNew: false,
      phase: 'main' as const,
    }));
  }

  const warmup = warmupItems(states, cfg, retrievabilityOf);
  const warmedUp = new Set(warmup.map((i) => i.card.id));

  const allowance = newAllowance(due.length, cfg);
  const fresh = newCandidates(states).slice(0, allowance);
  // Anything already asked in the recap must not be asked again in the same
  // sitting — a second attempt minutes later measures short-term memory, not
  // retrieval, and would feed the scheduler a flattering grade.
  const reviews = due
    .filter((c) => !warmedUp.has(c.id))
    .slice(0, Math.max(0, cfg.targetItems - fresh.length - warmup.length));

  const reviewItems: SessionItem[] = interleaveByUnit(reviews.map((card) => ({ card }))).map(
    ({ card }) => ({
      card,
      mode: pickMode(card, states[card.id], cfg.caps, rand),
      isNew: false,
      phase: 'main' as const,
    }),
  );

  // New items stay in curriculum order — a sentence must not arrive before the
  // words inside it, and interleaving would break that.
  const newItems: SessionItem[] = fresh.map((card) => ({
    card,
    mode: 'teach' as const,
    isNew: true,
    phase: 'main' as const,
  }));

  return [...warmup, ...spread(reviewItems, newItems)];
}

/** Everything the home screen needs to describe today without building the session. */
export interface SessionForecast {
  due: number;
  newAvailable: number;
  warmup: number;
  total: number;
  estimatedMinutes: number;
}

export function forecast(
  states: MemoryStates,
  cfg: SessionConfig,
  retrievabilityOf: (s: MemoryState, now: number) => number = () => 0,
): SessionForecast {
  const due = dueCards(states, cfg.now).length;
  const warmup = warmupItems(states, cfg, retrievabilityOf).length;
  const allowance = newAllowance(due, cfg);
  const newAvailable = Math.min(allowance, newCandidates(states).length);
  const reviewCount = Math.min(
    Math.max(0, due - warmup),
    Math.max(0, cfg.targetItems - newAvailable - warmup),
  );
  const total = reviewCount + newAvailable + warmup;
  // Teach screens take longer than review prompts; recap questions are quickest.
  const seconds = reviewCount * 25 + newAvailable * 45 + warmup * 15;
  return {
    due,
    newAvailable,
    warmup,
    total,
    estimatedMinutes: Math.max(1, Math.round(seconds / 60)),
  };
}

/** Per-unit progress toward the unit's can-do statement. */
export interface UnitProgress {
  unitId: string;
  title: string;
  canDo: string;
  total: number;
  introduced: number;
  /** Items the learner has produced from scratch, not merely recognised. */
  produced: number;
  /** Sum of current recall probabilities / total — "how much of this unit is live". */
  coverage: number;
}

export function unitProgress(
  states: MemoryStates,
  now: number,
  retrievabilityOf: (s: MemoryState, now: number) => number,
): UnitProgress[] {
  return units.map((unit) => {
    const ids = [...unit.items.map((i) => i.id), ...unit.sentences.map((s) => s.id)];
    let introduced = 0;
    let produced = 0;
    let coverageSum = 0;
    for (const id of ids) {
      const s = states[id];
      if (!s || isNew(s)) continue;
      introduced++;
      if (s.reps >= 2 && s.state !== 'relearning') produced++;
      coverageSum += retrievabilityOf(s, now);
    }
    return {
      unitId: unit.id,
      title: unit.title,
      canDo: unit.canDo,
      total: ids.length,
      introduced,
      produced,
      coverage: ids.length === 0 ? 0 : coverageSum / ids.length,
    };
  });
}

export function unitTitle(unitId: string): string {
  return getUnit(unitId)?.title ?? unitId;
}
