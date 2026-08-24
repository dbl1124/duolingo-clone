import type { Filler, Pattern, Realized } from '../content/patterns';

/**
 * Turning a pattern into one concrete sentence.
 *
 * The rule that makes this a construction exercise rather than a vocabulary test:
 * **a filler may only be used if its words are already known**. Generating "Voy a
 * escribir el domingo" for someone who has never met *escribir* teaches nothing —
 * they cannot build it, so they are not practising building, they are guessing.
 *
 * A pattern therefore reveals itself gradually. Early on `ir a` might have three
 * usable infinitives; a month later it has eleven, and the same scheduled item
 * quietly gets harder without anything being rewritten.
 */

export type IsKnown = (cardId: string) => boolean;

/** Fillers whose required cards the learner has all met. */
export function usableFillers(options: Filler[], isKnown: IsKnown): Filler[] {
  return options.filter((f) => f.requires.every(isKnown));
}

export interface Availability {
  available: boolean;
  /** How many distinct sentences can currently be built. */
  reach: number;
  /** Slots with no usable filler yet — why an unavailable pattern is blocked. */
  blockedSlots: string[];
}

/**
 * Whether a pattern can be practised yet, and how much variety it has.
 *
 * Requires more than one possible sentence. A pattern with exactly one expansion
 * is a fixed phrase wearing a costume: the learner would memorise the single
 * output and the frame would never be exercised.
 */
export function patternAvailability(pattern: Pattern, isKnown: IsKnown): Availability {
  const blockedSlots: string[] = [];
  let reach = 1;

  for (const [name, options] of Object.entries(pattern.slots)) {
    const usable = usableFillers(options, isKnown);
    if (usable.length === 0) blockedSlots.push(name);
    reach *= usable.length;
  }

  const anchorsKnown = pattern.requires.every(isKnown);
  return {
    available: anchorsKnown && blockedSlots.length === 0 && reach >= 2,
    reach: blockedSlots.length > 0 ? 0 : reach,
    blockedSlots,
  };
}

/**
 * Build one sentence. Returns null when the pattern is not yet usable.
 *
 * Deterministic for a given `rand`, so a session can be replayed exactly and the
 * tests can enumerate rather than sample.
 */
export function realizePattern(
  pattern: Pattern,
  isKnown: IsKnown,
  rand: () => number,
): Realized | null {
  const pick: Record<string, Filler> = {};

  for (const [name, options] of Object.entries(pattern.slots)) {
    const usable = usableFillers(options, isKnown);
    const chosen = usable[Math.floor(rand() * usable.length)];
    if (!chosen) return null;
    pick[name] = chosen;
  }
  if (!pattern.requires.every(isKnown)) return null;

  const built = pattern.build(pick);
  return {
    es: tidy(built.es),
    en: tidy(built.en),
    esAlt: built.esAlt.map(tidy),
  };
}

/** Collapse the double spaces that optional slots leave behind. */
function tidy(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/\s+([?!.,])/g, '$1').trim();
}

/** Every sentence a pattern can currently produce. Used by the test suite. */
export function expandPattern(pattern: Pattern, isKnown: IsKnown): Realized[] {
  const names = Object.keys(pattern.slots);
  const pools = names.map((n) => usableFillers(pattern.slots[n]!, isKnown));
  if (pools.some((p) => p.length === 0)) return [];

  const out: Realized[] = [];
  const walk = (depth: number, pick: Record<string, Filler>) => {
    if (depth === names.length) {
      const built = pattern.build(pick);
      out.push({ es: tidy(built.es), en: tidy(built.en), esAlt: built.esAlt.map(tidy) });
      return;
    }
    for (const filler of pools[depth]!) {
      walk(depth + 1, { ...pick, [names[depth]!]: filler });
    }
  };
  walk(0, {});
  return out;
}
