/**
 * Stable filename for a piece of recorded Spanish.
 *
 * Keyed by the *text*, not by the card id, for two reasons. Repeated strings —
 * the same phrase taught as an item and used inside a grammar example — collapse
 * to one file instead of being generated and downloaded twice. And a card can be
 * renamed or moved between units without orphaning its audio.
 *
 * The flip side: editing the Spanish of an existing card silently orphans its old
 * clip and needs a new one. The generator reports orphans so they can be deleted.
 */

/**
 * cyrb53 — a well-distributed 53-bit hash. Chosen over a 32-bit hash because at
 * ~450 clips a 32-bit space carries a real (~1 in 40,000) chance of a collision,
 * and a collision here means two different words sharing one recording.
 */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Normalise before hashing so trivial differences do not produce a second file.
 * Case and surrounding whitespace are not audible; accents and punctuation are
 * (they change stress and intonation), so those are kept.
 */
export function normalizeForAudio(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Filename stem for a line of Spanish, without extension. */
export function audioKey(text: string): string {
  return cyrb53(normalizeForAudio(text)).toString(36);
}

/** Path the app requests for a line of Spanish, relative to the app root. */
export function audioPath(text: string): string {
  return `audio/${audioKey(text)}.mp3`;
}
