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
  spread,
} from './builder';

const T0 = 1_700_000_000_000;
const caps = { canListen: true, canSpeak: true };
const cfg = (over: Partial<SessionConfig> = {}): SessionConfig => ({
  ...DEFAULT_SESSION_CONFIG,
  now: T0,
  caps,
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
