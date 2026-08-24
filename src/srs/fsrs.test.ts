import { describe, expect, it } from 'vitest';
import {
  DAY_IN_MS,
  DEFAULT_CONFIG,
  DEFAULT_WEIGHTS,
  Grade,
  currentRetrievability,
  intervalDays,
  newCard,
  previewIntervals,
  retrievability,
  review,
} from './fsrs';

const T0 = 1_700_000_000_000;
const days = (n: number) => n * DAY_IN_MS;

describe('forgetting curve', () => {
  it('is calibrated so that recall is exactly 90% when elapsed time equals stability', () => {
    // This is the definition of stability, and it is what makes the interval
    // formula collapse to "interval = stability" at 0.9 requested retention.
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 10);
    expect(retrievability(3.5, 3.5)).toBeCloseTo(0.9, 10);
  });

  it('decays monotonically with elapsed time', () => {
    const r = [1, 5, 10, 30, 90].map((t) => retrievability(t, 10));
    for (let i = 1; i < r.length; i++) expect(r[i]!).toBeLessThan(r[i - 1]!);
  });

  it('has a fat tail — a 10-day-stable memory is still well above zero after 90 days', () => {
    expect(retrievability(90, 10)).toBeGreaterThan(0.3);
  });

  it('reports full recall for an item reviewed just now', () => {
    expect(retrievability(0, 5)).toBe(1);
  });
});

describe('interval', () => {
  it('equals stability at 90% requested retention', () => {
    expect(intervalDays(10)).toBe(10);
    expect(intervalDays(37)).toBe(37);
  });

  it('shortens when a higher retention is demanded', () => {
    const strict = { ...DEFAULT_CONFIG, requestRetention: 0.97 };
    expect(intervalDays(30, strict)).toBeLessThan(intervalDays(30));
  });

  it('respects the maximum interval', () => {
    expect(intervalDays(100_000)).toBe(DEFAULT_CONFIG.maximumInterval);
  });

  it('never returns less than a day', () => {
    expect(intervalDays(0.001)).toBe(1);
  });
});

describe('first review of a new card', () => {
  it('seeds stability from the published weight for that grade', () => {
    for (const grade of [Grade.Again, Grade.Hard, Grade.Good, Grade.Easy]) {
      const s = review(newCard(T0), grade, T0).stability;
      expect(s).toBeCloseTo(DEFAULT_WEIGHTS[grade - 1]!, 10);
    }
  });

  it('gives a harder first grade a higher difficulty', () => {
    const again = review(newCard(T0), Grade.Again, T0).difficulty;
    const easy = review(newCard(T0), Grade.Easy, T0).difficulty;
    expect(again).toBeGreaterThan(easy);
  });

  it('keeps difficulty inside 1..10 for every grade', () => {
    for (const grade of [Grade.Again, Grade.Hard, Grade.Good, Grade.Easy]) {
      const d = review(newCard(T0), grade, T0).difficulty;
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(10);
    }
  });

  it('counts the repetition', () => {
    expect(review(newCard(T0), Grade.Good, T0).reps).toBe(1);
  });
});

describe('successful review', () => {
  it('increases stability', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const second = review(first, Grade.Good, T0 + days(4));
    expect(second.stability).toBeGreaterThan(first.stability);
  });

  it('grows stability more when the review was harder to recall', () => {
    // Reviewing late means lower retrievability at review time, which the model
    // rewards — this is the spacing effect falling out of the formula rather than
    // being bolted on. Recalling something you had nearly forgotten is worth more.
    const base = review(newCard(T0), Grade.Good, T0);
    const early = review(base, Grade.Good, T0 + days(1));
    const late = review(base, Grade.Good, T0 + days(10));
    expect(late.stability).toBeGreaterThan(early.stability);
  });

  it('orders intervals by grade: Hard < Good < Easy', () => {
    const base = review(newCard(T0), Grade.Good, T0);
    const at = T0 + days(4);
    const hard = review(base, Grade.Hard, at).due;
    const good = review(base, Grade.Good, at).due;
    const easy = review(base, Grade.Easy, at).due;
    expect(hard).toBeLessThan(good);
    expect(good).toBeLessThan(easy);
  });

  it('moves the card into the review state', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    expect(review(first, Grade.Good, T0 + days(4)).state).toBe('review');
  });
});

describe('lapse', () => {
  it('never raises stability', () => {
    const mature = review(review(newCard(T0), Grade.Easy, T0), Grade.Good, T0 + days(20));
    const lapsed = review(mature, Grade.Again, T0 + days(60));
    expect(lapsed.stability).toBeLessThanOrEqual(mature.stability);
  });

  it('counts the lapse and enters relearning', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const lapsed = review(first, Grade.Again, T0 + days(4));
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.state).toBe('relearning');
  });

  it('brings the card back inside the same session, not tomorrow', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const at = T0 + days(4);
    const lapsed = review(first, Grade.Again, at);
    const waitMinutes = (lapsed.due - at) / 60_000;
    expect(waitMinutes).toBe(DEFAULT_CONFIG.relearnDelayMinutes);
  });

  it('raises difficulty', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const lapsed = review(first, Grade.Again, T0 + days(4));
    expect(lapsed.difficulty).toBeGreaterThan(first.difficulty);
  });
});

describe('same-day repeat', () => {
  it('uses the short-term formula and still moves stability upward on a good grade', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const again = review(first, Grade.Good, T0 + 60_000 * 10);
    expect(again.stability).toBeGreaterThan(first.stability);
  });

  it('does not inflate stability the way a full-day gap would', () => {
    const first = review(newCard(T0), Grade.Good, T0);
    const sameDay = review(first, Grade.Good, T0 + 60_000 * 10);
    const nextWeek = review(first, Grade.Good, T0 + days(7));
    expect(sameDay.stability).toBeLessThan(nextWeek.stability);
  });
});

describe('long-run behaviour', () => {
  it('reaches month-plus intervals after a handful of good reviews', () => {
    let state = newCard(T0);
    let now = T0;
    for (let i = 0; i < 5; i++) {
      state = review(state, Grade.Good, now);
      now = state.due;
    }
    expect(intervalDays(state.stability)).toBeGreaterThan(30);
  });

  it('keeps a repeatedly-failed card on a short leash', () => {
    let state = newCard(T0);
    let now = T0;
    for (let i = 0; i < 6; i++) {
      state = review(state, Grade.Good, now);
      now = state.due;
      state = review(state, Grade.Again, now);
      now = state.due;
    }
    expect(state.difficulty).toBeGreaterThan(7);
    expect(intervalDays(state.stability)).toBeLessThan(10);
  });
});

describe('reporting helpers', () => {
  it('previews an interval for every button', () => {
    const preview = previewIntervals(newCard(T0), T0);
    expect(preview[3]).toBeGreaterThan(0);
    expect(preview[4]).toBeGreaterThan(preview[3]);
  });

  it('reports zero recall for a card never seen', () => {
    expect(currentRetrievability(newCard(T0), T0)).toBe(0);
  });

  it('reports ~90% recall for a card reviewed exactly one stability ago', () => {
    const state = review(newCard(T0), Grade.Good, T0);
    const at = T0 + days(state.stability);
    expect(currentRetrievability(state, at)).toBeCloseTo(0.9, 6);
  });
});
