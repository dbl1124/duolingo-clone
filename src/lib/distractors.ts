import { allCards, englishOf } from '../content';
import type { Card } from '../content/types';

/**
 * Wrong options for multiple-choice prompts.
 *
 * Distractors are drawn from the *same unit* wherever possible, because a choice
 * between "hello" and "the airport" tests nothing — the learner picks correctly by
 * elimination without knowing the word. Plausible near-neighbours force actual
 * retrieval, which is the only reason this exercise type earns its place at all.
 *
 * It is still the weakest rung on the ladder, and the ladder moves items off it
 * after a couple of successful reviews.
 */
export function distractors(target: Card, count: number, rand: () => number): string[] {
  const answer = englishOf(target);
  const seen = new Set([answer.toLowerCase()]);

  const pool = (cards: Card[]) =>
    cards.filter((c) => {
      if (c.id === target.id || c.kind !== target.kind) return false;
      const en = englishOf(c);
      if (seen.has(en.toLowerCase())) return false;
      return true;
    });

  const sameUnit = pool(allCards.filter((c) => c.unitId === target.unitId));
  const anywhere = pool(allCards);

  const out: string[] = [];
  for (const source of [sameUnit, anywhere]) {
    const remaining = [...source];
    while (out.length < count && remaining.length > 0) {
      const [picked] = remaining.splice(Math.floor(rand() * remaining.length), 1);
      if (!picked) break;
      const en = englishOf(picked);
      if (seen.has(en.toLowerCase())) continue;
      seen.add(en.toLowerCase());
      out.push(en);
    }
    if (out.length >= count) break;
  }
  return out;
}

/** The answer plus its distractors, in a stable shuffled order. */
export function choicesFor(target: Card, count: number, rand: () => number): string[] {
  const options = [englishOf(target), ...distractors(target, count - 1, rand)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  return options;
}
