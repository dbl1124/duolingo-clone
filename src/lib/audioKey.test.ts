import { describe, expect, it } from 'vitest';
import { audioKey, audioPath, normalizeForAudio } from './audioKey';
import { lexItems, sentences, units } from '../content';

describe('normalizeForAudio', () => {
  it('ignores case and surrounding whitespace, which are not audible', () => {
    expect(normalizeForAudio('  Hola  ')).toBe('hola');
    expect(normalizeForAudio('Buenos   días')).toBe('buenos días');
  });

  it('keeps accents and punctuation, which are', () => {
    // Accents change stress and ¿ changes intonation, so these are different
    // recordings and must not collapse to one file.
    expect(audioKey('esta')).not.toBe(audioKey('está'));
    expect(audioKey('como se llama')).not.toBe(audioKey('¿cómo se llama?'));
  });
});

describe('audioKey', () => {
  it('is stable across calls', () => {
    expect(audioKey('gracias')).toBe(audioKey('gracias'));
  });

  it('collapses the same line taught in two places to one file', () => {
    expect(audioKey('¿Puede ayudarme, por favor?')).toBe(audioKey('¿puede ayudarme, por favor?'));
  });

  it('builds a path under audio/', () => {
    expect(audioPath('hola')).toBe(`audio/${audioKey('hola')}.mp3`);
  });

  it('does not collide across the whole curriculum', () => {
    // A collision means two different words sharing one recording, which would be
    // silently wrong rather than broken — worth an explicit guard.
    const texts = new Set<string>();
    for (const i of lexItems()) texts.add(i.es);
    for (const s of sentences()) texts.add(s.es);
    for (const u of units) {
      for (const g of u.grammar) for (const ex of g.examples) texts.add(ex.es);
      for (const p of u.pron?.pairs ?? []) {
        texts.add(p.a);
        texts.add(p.b);
      }
    }
    const byKey = new Map<string, Set<string>>();
    for (const t of texts) {
      const k = audioKey(t);
      byKey.set(k, (byKey.get(k) ?? new Set()).add(normalizeForAudio(t)));
    }
    const collisions = [...byKey.entries()].filter(([, v]) => v.size > 1);
    expect(collisions).toEqual([]);
  });
});
