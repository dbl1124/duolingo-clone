/**
 * Answer checking.
 *
 * Two decisions here shape how the app feels more than any UI choice.
 *
 * **Accents are optional on input.** Typing á, ñ or ¿ on a phone keyboard means
 * long-pressing keys mid-sentence. Penalising that measures thumb dexterity, not
 * Spanish. The accented form is always shown back afterwards, so the correct
 * spelling is still taught — it just is not a gate.
 *
 * **A typo is not a lapse.** A single slipped character grades as Hard, not Again.
 * Marking "gracais" as a failure would hand the scheduler a false signal and drag
 * a known word back to a one-day interval. The scheduler is only as good as the
 * grades it receives, so the grading has to reflect knowledge rather than typing.
 */

export type Verdict = 'correct' | 'close' | 'wrong';

const PUNCTUATION = /[¿?¡!.,;:"'()\-–—]/g;

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      // Strip every combining diacritic, ñ included. Singling out ñ would be
      // defensible on meaning (año / ano) but it needs a long-press on a phone
      // keyboard exactly like á does, and a rule that is optional for one accent
      // and mandatory for another is a rule nobody can hold in their head.
      // `missedOnlyAccents` surfaces the correct spelling instead.
      .replace(/[̀-ͯ]/g, '')
      .replace(PUNCTUATION, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Damerau-Levenshtein distance (optimal string alignment).
 *
 * Plain Levenshtein charges 2 for a transposition, which is wrong for our purpose:
 * swapping two adjacent letters is the single commonest typing slip, especially
 * thumb-typing. "gracais" for "gracias" is one finger landing early, not two
 * separate errors, and it should not cost a word its interval.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const n = b.length;
  let twoAgo: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const curr = new Array<number>(n + 1);
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, twoAgo[j - 2]! + 1);
      }
      curr[j] = best;
    }
    twoAgo = prev;
    prev = curr;
  }
  return prev[n]!;
}

/** How far off a typo may be before it stops counting as a typo. */
function typoTolerance(target: string): number {
  if (target.length <= 4) return 0;
  if (target.length <= 8) return 1;
  if (target.length <= 20) return 2;
  return 3;
}

/**
 * Grade a free-text answer against every accepted form.
 * Returns the best verdict across all of them.
 */
export function checkAnswer(input: string, accepted: string[]): Verdict {
  const given = normalize(input);
  if (given.length === 0) return 'wrong';

  let best: Verdict = 'wrong';
  for (const candidate of accepted) {
    const target = normalize(candidate);
    if (given === target) return 'correct';
    if (editDistance(given, target) <= typoTolerance(target)) best = 'close';
  }
  return best;
}

/**
 * Which accepted form the learner was aiming at, so feedback can show the right
 * spelling rather than always the first listed alternative.
 */
export function closestAccepted(input: string, accepted: string[]): string {
  const given = normalize(input);
  let best = accepted[0] ?? '';
  let bestDistance = Infinity;
  for (const candidate of accepted) {
    const d = editDistance(given, normalize(candidate));
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return best;
}

/** True when the answer was right but missing accents — worth pointing out gently. */
export function missedOnlyAccents(input: string, accepted: string[]): boolean {
  if (checkAnswer(input, accepted) !== 'correct') return false;
  const raw = input.toLowerCase().replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim();
  return !accepted.some(
    (c) => c.toLowerCase().replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim() === raw,
  );
}
