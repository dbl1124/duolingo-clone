import { describe, expect, it } from 'vitest';
import { allCards, units } from '../content';
import type { MemoryState } from '../srs/fsrs';
import { DAY_IN_MS, Grade, newCard, review } from '../srs/fsrs';
import {
  DEFAULT_SESSION_CONFIG,
  MINIMAL_SESSION_ITEMS,
  type MemoryStates,
  type SessionConfig,
  buildSession,
  dueCards,
  forecast,
  interleaveByUnit,
  newAllowance,
  newCandidates,
  openUnitIds,
  recentUnitId,
  spread,
  warmupItems,
  WARMUP_COUNT,
} from './builder';
import { currentRetrievability } from '../srs/fsrs';

const T0 = 1_700_000_000_000;
const caps = { canListen: true, canSpeak: true };
const cfg = (over: Partial<SessionConfig> = {}): SessionConfig => ({
  ...DEFAULT_SESSION_CONFIG,
  now: T0,
  caps,
  // Off by default here so the existing count assertions stay about the main
  // queue; the recap has its own describe block below.
  warmup: false,
  ...over,
});

/** A card that was learned and is now due. */
function overdue(daysAgo: number): MemoryState {
  const learned = review(newCard(T0 - daysAgo * DAY_IN_MS), Grade.Good, T0 - daysAgo * DAY_IN_MS);
  return { ...learned, due: T0 - daysAgo * DAY_IN_MS };
}

/** A card that was learned and is not due yet. */
function notDue(): MemoryState {
  const learned = review(newCard(T0), Grade.Good, T0);
  return { ...learned, due: T0 + 30 * DAY_IN_MS };
}

function statesFor(ids: string[], make: (i: number) => MemoryState): MemoryStates {
  const out: MemoryStates = {};
  ids.forEach((id, i) => (out[id] = make(i)));
  return out;
}

describe('unit gating', () => {
  it('opens only the first unit to a brand-new learner', () => {
    expect(openUnitIds({})).toEqual(['u1']);
  });

  it('opens the next unit once the current one is mostly introduced', () => {
    const u1 = units[0]!;
    const ids = [...u1.items.map((i) => i.id), ...u1.sentences.map((s) => s.id)];
    const states = statesFor(ids, () => notDue());
    expect(openUnitIds(states)).toEqual(['u1', 'u2']);
  });

  it('does not open the next unit on partial progress', () => {
    const u1 = units[0]!;
    const ids = [...u1.items.map((i) => i.id), ...u1.sentences.map((s) => s.id)];
    const half = ids.slice(0, Math.floor(ids.length / 2));
    expect(openUnitIds(statesFor(half, () => notDue()))).toEqual(['u1']);
  });

  it('only ever offers new cards from open units', () => {
    const candidates = newCandidates({});
    expect(candidates.every((c) => c.unitId === 'u1')).toBe(true);
  });
});

describe('new-material allowance', () => {
  it('offers a full day of new material when nothing is due', () => {
    expect(newAllowance(0, cfg())).toBe(DEFAULT_SESSION_CONFIG.dailyNewCap);
  });

  it('stops introducing new material once reviews fill the session', () => {
    // The rule that keeps a missed week from compounding into an unusable backlog.
    expect(newAllowance(DEFAULT_SESSION_CONFIG.targetItems, cfg())).toBe(0);
    expect(newAllowance(200, cfg())).toBe(0);
  });

  it('tapers new material as the review load grows', () => {
    const target = DEFAULT_SESSION_CONFIG.targetItems;
    const a = newAllowance(target - 2, cfg());
    const b = newAllowance(target - 10, cfg());
    expect(a).toBeLessThan(b);
    expect(a).toBe(2);
  });

  it('offers nothing new in minimal mode', () => {
    expect(newAllowance(0, cfg({ minimal: true }))).toBe(0);
  });
});

describe('due selection', () => {
  it('ignores cards that are not yet due', () => {
    const states = statesFor([allCards[0]!.id, allCards[1]!.id], () => notDue());
    expect(dueCards(states, T0)).toEqual([]);
  });

  it('puts the most overdue card first', () => {
    const states: MemoryStates = {
      [allCards[0]!.id]: overdue(1),
      [allCards[1]!.id]: overdue(9),
      [allCards[2]!.id]: overdue(4),
    };
    expect(dueCards(states, T0).map((c) => c.id)).toEqual([
      allCards[1]!.id,
      allCards[2]!.id,
      allCards[0]!.id,
    ]);
  });

  it('never treats an unseen card as due', () => {
    expect(dueCards({}, T0)).toEqual([]);
  });
});

describe('interleaving', () => {
  it('alternates across units instead of blocking them', () => {
    const items = [
      { card: { unitId: 'u1', id: 'a' } },
      { card: { unitId: 'u1', id: 'b' } },
      { card: { unitId: 'u2', id: 'c' } },
      { card: { unitId: 'u2', id: 'd' } },
    ] as never[];
    const out = interleaveByUnit(items) as unknown as { card: { unitId: string; id: string } }[];
    expect(out.map((i) => i.card.id)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('preserves order within a unit', () => {
    const items = [
      { card: { unitId: 'u1', id: 'a' } },
      { card: { unitId: 'u1', id: 'b' } },
      { card: { unitId: 'u1', id: 'c' } },
    ] as never[];
    const out = interleaveByUnit(items) as unknown as { card: { id: string } }[];
    expect(out.map((i) => i.card.id)).toEqual(['a', 'b', 'c']);
  });

  it('handles an empty list', () => {
    expect(interleaveByUnit([])).toEqual([]);
  });
});

describe('spreading new material', () => {
  it('distributes inserts through the base instead of front-loading them', () => {
    const out = spread<number | string>([1, 2, 3, 4, 5, 6], ['a', 'b']);
    expect(out).toHaveLength(8);
    expect(out.indexOf('a')).toBeGreaterThan(0);
    expect(out.indexOf('b')).toBeGreaterThan(out.indexOf('a'));
  });

  it('opens with known material rather than a cold new item', () => {
    const out = spread<number | string>([1, 2, 3, 4], ['a']);
    expect(out[0]).toBe(1);
  });

  it('handles either side being empty', () => {
    expect(spread<number | string>([], ['a', 'b'])).toEqual(['a', 'b']);
    expect(spread<number | string>([1, 2], [])).toEqual([1, 2]);
  });
});

describe('buildSession', () => {
  it('gives a brand-new learner exactly one day of new material, all in teach mode', () => {
    const session = buildSession({}, cfg());
    expect(session).toHaveLength(DEFAULT_SESSION_CONFIG.dailyNewCap);
    expect(session.every((i) => i.isNew && i.mode === 'teach')).toBe(true);
  });

  it('introduces new material in curriculum order', () => {
    const session = buildSession({}, cfg());
    const order = allCards.map((c) => c.id);
    const picked = session.map((i) => order.indexOf(i.card.id));
    expect(picked).toEqual([...picked].sort((a, b) => a - b));
  });

  it('never exceeds the target length', () => {
    const states = statesFor(
      allCards.slice(0, 60).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const session = buildSession(states, cfg());
    expect(session.length).toBeLessThanOrEqual(DEFAULT_SESSION_CONFIG.targetItems);
  });

  it('drops new material entirely when the backlog is large', () => {
    const states = statesFor(
      allCards.slice(0, 60).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const session = buildSession(states, cfg());
    expect(session.some((i) => i.isNew)).toBe(false);
  });

  it('mixes reviews and new material when there is room for both', () => {
    const states = statesFor(
      allCards.slice(0, 4).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const session = buildSession(states, cfg());
    expect(session.some((i) => i.isNew)).toBe(true);
    expect(session.some((i) => !i.isNew)).toBe(true);
  });

  it('caps a minimal session and includes no new material', () => {
    const states = statesFor(
      allCards.slice(0, 40).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const session = buildSession(states, cfg({ minimal: true }));
    expect(session).toHaveLength(MINIMAL_SESSION_ITEMS);
    expect(session.some((i) => i.isNew)).toBe(false);
  });

  it('returns an empty session when there is nothing due and nothing new left', () => {
    const states = statesFor(
      allCards.map((c) => c.id),
      () => notDue(),
    );
    expect(buildSession(states, cfg())).toEqual([]);
  });

  it('is reproducible for a given seed', () => {
    const states = statesFor(
      allCards.slice(0, 30).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const a = buildSession(states, cfg({ seed: 7 }));
    const b = buildSession(states, cfg({ seed: 7 }));
    expect(a.map((i) => `${i.card.id}:${i.mode}`)).toEqual(b.map((i) => `${i.card.id}:${i.mode}`));
  });

  it('never asks a brand-new learner to speak or produce before teaching', () => {
    const session = buildSession({}, cfg());
    expect(session.every((i) => i.mode === 'teach')).toBe(true);
  });
});

describe('forecast', () => {
  it('reports an honest count and time estimate for a new learner', () => {
    const f = forecast({}, cfg());
    expect(f.due).toBe(0);
    expect(f.newAvailable).toBe(DEFAULT_SESSION_CONFIG.dailyNewCap);
    expect(f.total).toBe(DEFAULT_SESSION_CONFIG.dailyNewCap);
    expect(f.estimatedMinutes).toBeGreaterThan(0);
    expect(f.estimatedMinutes).toBeLessThan(15);
  });

  it('keeps the estimate near ten minutes even with a big backlog', () => {
    // The session is capped, so a backlog lengthens the schedule, never the sitting.
    const states = statesFor(
      allCards.map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const f = forecast(states, cfg());
    expect(f.due).toBeGreaterThan(100);
    expect(f.estimatedMinutes).toBeLessThanOrEqual(12);
  });

  it('reports zero work when nothing is due', () => {
    const states = statesFor(
      allCards.map((c) => c.id),
      () => notDue(),
    );
    expect(forecast(states, cfg()).total).toBe(0);
  });
});

describe('opening recap', () => {
  const u1 = units[0]!;
  const u2 = units[1]!;
  const u1Ids = [...u1.items.map((i) => i.id), ...u1.sentences.map((s) => s.id)];
  const warm = (over: Partial<SessionConfig> = {}) => cfg({ warmup: true, ...over });

  it('has nothing to recap for a brand-new learner', () => {
    expect(recentUnitId({})).toBeNull();
    expect(warmupItems({}, warm(), currentRetrievability)).toEqual([]);
  });

  it('recaps the unit the learner reached, not the one they last touched', () => {
    // Re-reviewing an old card does not mean that is where you left off, so this
    // tracks curriculum position rather than the most recent timestamp.
    const states = statesFor(u1Ids, () => notDue());
    states[u2.items[0]!.id] = notDue();
    expect(recentUnitId(states)).toBe('u2');
  });

  it('asks WARMUP_COUNT questions once there is material', () => {
    const items = warmupItems(statesFor(u1Ids, () => notDue()), warm(), currentRetrievability);
    expect(items).toHaveLength(WARMUP_COUNT);
    expect(items.every((i) => i.phase === 'warmup')).toBe(true);
  });

  it('uses only the two framings asked for, starting with the easier one', () => {
    const items = warmupItems(statesFor(u1Ids, () => notDue()), warm(), currentRetrievability);
    expect(items.map((i) => i.mode)).toEqual(['recognize', 'produce', 'recognize']);
  });

  it('never quizzes a word that has not been taught', () => {
    const items = warmupItems(statesFor(u1Ids.slice(0, 8), () => notDue()), warm(), currentRetrievability);
    expect(items.every((i) => u1Ids.slice(0, 8).includes(i.card.id))).toBe(true);
  });

  it('prefers cards that are already due, so the recap is mostly free', () => {
    // Due cards were going to be asked today anyway. Pulling a not-yet-due card
    // forward costs a little scheduling value, so it is the last resort.
    const states: MemoryStates = {};
    u1Ids.forEach((id) => (states[id] = notDue()));
    const dueOnes = u1.items.slice(0, 2).map((i) => i.id);
    dueOnes.forEach((id, i) => (states[id] = overdue(i + 3)));
    const picked = warmupItems(states, warm(), currentRetrievability).map((i) => i.card.id);
    for (const id of dueOnes) expect(picked).toContain(id);
  });

  it('quizzes words and phrases, never whole sentences', () => {
    const items = warmupItems(statesFor(u1Ids, () => notDue()), warm(), currentRetrievability);
    expect(items.every((i) => i.card.kind === 'lex')).toBe(true);
  });

  it('is skipped when switched off, and on a bad day', () => {
    const states = statesFor(u1Ids, () => notDue());
    expect(warmupItems(states, cfg({ warmup: false }), currentRetrievability)).toEqual([]);
    expect(warmupItems(states, warm({ minimal: true }), currentRetrievability)).toEqual([]);
  });

  it('puts the recap first and never repeats it later in the session', () => {
    const states = statesFor(u1Ids, (i) => overdue(i + 1));
    const session = buildSession(states, warm(), currentRetrievability);
    const recap = session.filter((i) => i.phase === 'warmup');
    expect(recap).toHaveLength(WARMUP_COUNT);
    expect(session.slice(0, WARMUP_COUNT).every((i) => i.phase === 'warmup')).toBe(true);

    // Asking the same card twice in one sitting measures short-term memory and
    // would hand the scheduler a flattering grade.
    const ids = session.map((i) => i.card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('still respects the session length cap with a recap in front', () => {
    const states = statesFor(
      allCards.slice(0, 60).map((c) => c.id),
      (i) => overdue(i + 1),
    );
    const session = buildSession(states, warm(), currentRetrievability);
    expect(session.length).toBeLessThanOrEqual(DEFAULT_SESSION_CONFIG.targetItems);
  });

  it('reports the recap in the forecast', () => {
    const states = statesFor(u1Ids, () => notDue());
    const f = forecast(states, warm(), currentRetrievability);
    expect(f.warmup).toBe(WARMUP_COUNT);
    expect(f.total).toBeGreaterThanOrEqual(WARMUP_COUNT);
  });
});
