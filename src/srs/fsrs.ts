/**
 * FSRS-5 (Free Spaced Repetition Scheduler).
 *
 * Why this and not SM-2 (the Anki/SuperMemo classic): SM-2 tracks a single
 * "ease factor" and multiplies intervals by it. FSRS models memory with two
 * separate quantities — **stability** (how long the memory lasts) and
 * **difficulty** (how hard this particular item is for you) — and schedules
 * each review at the moment your predicted recall probability crosses a target.
 * That target is the knob: at 0.90 you are asked right as you are about to
 * start forgetting, which is where the spacing effect is strongest.
 *
 * The three-parameter power forgetting curve is:
 *
 *     R(t, S) = (1 + FACTOR · t / S) ^ DECAY
 *
 * with DECAY = -0.5. It fits real review logs substantially better than the
 * exponential curve SM-2 implicitly assumes, mostly because real forgetting has
 * a fat tail — you retain things far longer than an exponential predicts.
 *
 * Weights are the published FSRS-5 defaults, fitted across a very large corpus
 * of review histories. They can be re-fitted per user from their own logs; we
 * store every review (see `store/db.ts`) so that stays possible later.
 */

export type Grade = 1 | 2 | 3 | 4;

export const Grade = {
  Again: 1 as Grade,
  Hard: 2 as Grade,
  Good: 3 as Grade,
  Easy: 4 as Grade,
} as const;

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface MemoryState {
  /** Days until recall probability falls to 90%. The core quantity. */
  stability: number;
  /** 1–10. Intrinsic difficulty of this item for this learner. */
  difficulty: number;
  /** Epoch ms when this card next comes up. */
  due: number;
  /** Epoch ms of the last review, or null if never reviewed. */
  lastReview: number | null;
  reps: number;
  lapses: number;
  state: CardState;
}

export const DECAY = -0.5;
/** Derived so that R = 0.9 exactly when t = S. */
export const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;

/** Published FSRS-5 default weights. */
export const DEFAULT_WEIGHTS: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
  1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];

const MIN_STABILITY = 0.01;
const MAX_STABILITY = 36500;
const DAY_MS = 86_400_000;

export interface SchedulerConfig {
  weights: readonly number[];
  /** Target recall probability at review time. Higher = more reviews per day. */
  requestRetention: number;
  /** Maximum interval in days. */
  maximumInterval: number;
  /** How long a lapsed card waits before coming back, in minutes. */
  relearnDelayMinutes: number;
}

export const DEFAULT_CONFIG: SchedulerConfig = {
  weights: DEFAULT_WEIGHTS,
  // 0.90 is the sweet spot for a daily learner: high enough that material stays
  // usable, low enough that the review queue does not outgrow a 10-minute session.
  requestRetention: 0.9,
  maximumInterval: 365 * 3,
  relearnDelayMinutes: 10,
};

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

function w(cfg: SchedulerConfig, i: number): number {
  const v = cfg.weights[i];
  if (v === undefined) throw new Error(`FSRS weight ${i} is missing`);
  return v;
}

/**
 * Probability of recalling an item `elapsedDays` after its last review.
 * Returns 1 for a card that has never been reviewed.
 */
export function retrievability(elapsedDays: number, stability: number): number {
  if (elapsedDays <= 0) return 1;
  const s = Math.max(stability, MIN_STABILITY);
  return Math.pow(1 + (FACTOR * elapsedDays) / s, DECAY);
}

/** Days to wait so that recall probability decays to exactly `requestRetention`. */
export function intervalDays(stability: number, cfg: SchedulerConfig = DEFAULT_CONFIG): number {
  const raw = (stability / FACTOR) * (Math.pow(cfg.requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, cfg.maximumInterval);
}

function initialStability(cfg: SchedulerConfig, grade: Grade): number {
  return clamp(w(cfg, grade - 1), MIN_STABILITY, MAX_STABILITY);
}

function initialDifficulty(cfg: SchedulerConfig, grade: Grade): number {
  return clamp(w(cfg, 4) - Math.exp(w(cfg, 5) * (grade - 1)) + 1, 1, 10);
}

function nextDifficulty(cfg: SchedulerConfig, difficulty: number, grade: Grade): number {
  // Linear damping: the closer D already is to 10, the less a bad grade moves it.
  const delta = -w(cfg, 6) * (grade - 3);
  const damped = difficulty + delta * ((10 - difficulty) / 9);
  // Mean reversion toward the difficulty of an "easy" first answer, which stops
  // difficulty from ratcheting upward forever on a card you keep half-missing.
  const reverted = w(cfg, 7) * initialDifficulty(cfg, Grade.Easy) + (1 - w(cfg, 7)) * damped;
  return clamp(reverted, 1, 10);
}

function nextStabilityOnRecall(
  cfg: SchedulerConfig,
  stability: number,
  difficulty: number,
  r: number,
  grade: Grade,
): number {
  const hardPenalty = grade === Grade.Hard ? w(cfg, 15) : 1;
  const easyBonus = grade === Grade.Easy ? w(cfg, 16) : 1;
  const growth =
    Math.exp(w(cfg, 8)) *
    (11 - difficulty) *
    Math.pow(stability, -w(cfg, 9)) *
    (Math.exp(w(cfg, 10) * (1 - r)) - 1) *
    hardPenalty *
    easyBonus;
  return clamp(stability * (1 + growth), MIN_STABILITY, MAX_STABILITY);
}

function nextStabilityOnLapse(
  cfg: SchedulerConfig,
  stability: number,
  difficulty: number,
  r: number,
): number {
  const sFail =
    w(cfg, 11) *
    Math.pow(difficulty, -w(cfg, 12)) *
    (Math.pow(stability + 1, w(cfg, 13)) - 1) *
    Math.exp(w(cfg, 14) * (1 - r));
  // FSRS-5 clamps post-lapse stability to never exceed the pre-lapse value.
  return clamp(Math.min(sFail, stability), MIN_STABILITY, MAX_STABILITY);
}

/** Same-day re-review. Short-term memory behaves differently from long-term. */
function shortTermStability(cfg: SchedulerConfig, stability: number, grade: Grade): number {
  return clamp(
    stability * Math.exp(w(cfg, 17) * (grade - 3 + w(cfg, 18))),
    MIN_STABILITY,
    MAX_STABILITY,
  );
}

export function newCard(now: number): MemoryState {
  return {
    stability: 0,
    difficulty: 0,
    due: now,
    lastReview: null,
    reps: 0,
    lapses: 0,
    state: 'new',
  };
}

export function isNew(state: MemoryState): boolean {
  return state.state === 'new' || state.lastReview === null;
}

/**
 * Apply a grade and return the updated memory state.
 *
 * Pure: same inputs always give the same output, which is what makes the
 * scheduler testable without mocking the clock.
 */
export function review(
  state: MemoryState,
  grade: Grade,
  now: number,
  cfg: SchedulerConfig = DEFAULT_CONFIG,
): MemoryState {
  const first = isNew(state);
  const elapsedDays = first ? 0 : Math.max(0, (now - (state.lastReview ?? now)) / DAY_MS);

  let stability: number;
  let difficulty: number;

  if (first) {
    stability = initialStability(cfg, grade);
    difficulty = initialDifficulty(cfg, grade);
  } else {
    difficulty = nextDifficulty(cfg, state.difficulty, grade);
    const r = retrievability(elapsedDays, state.stability);

    if (elapsedDays < 1) {
      // Reviewed again the same day — the long-term formulas do not apply.
      stability = shortTermStability(cfg, state.stability, grade);
    } else if (grade === Grade.Again) {
      stability = nextStabilityOnLapse(cfg, state.stability, difficulty, r);
    } else {
      stability = nextStabilityOnRecall(cfg, state.stability, difficulty, r, grade);
    }
  }

  const lapsed = grade === Grade.Again;
  const nextState: CardState = lapsed ? 'relearning' : first ? 'learning' : 'review';

  // A missed card comes back within the same sitting rather than tomorrow. That is
  // the "supported" half of challenging-but-supported: you get another shot while
  // the correction is still fresh, instead of banking the failure for a day.
  const due = lapsed
    ? now + cfg.relearnDelayMinutes * 60_000
    : now + intervalDays(stability, cfg) * DAY_MS;

  return {
    stability,
    difficulty,
    due,
    lastReview: now,
    reps: state.reps + 1,
    lapses: state.lapses + (lapsed ? 1 : 0),
    state: nextState,
  };
}

/** What each button would schedule, for showing the learner their options. */
export function previewIntervals(
  state: MemoryState,
  now: number,
  cfg: SchedulerConfig = DEFAULT_CONFIG,
): Record<Grade, number> {
  const g = (grade: Grade) => {
    const next = review(state, grade, now, cfg);
    return Math.max(0, (next.due - now) / DAY_MS);
  };
  return { 1: g(1), 2: g(2), 3: g(3), 4: g(4) };
}

/** Current recall probability, for progress reporting. */
export function currentRetrievability(state: MemoryState, now: number): number {
  if (isNew(state)) return 0;
  const elapsed = Math.max(0, (now - (state.lastReview ?? now)) / DAY_MS);
  return retrievability(elapsed, state.stability);
}

export const DAY_IN_MS = DAY_MS;
