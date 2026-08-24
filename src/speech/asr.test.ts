import { describe, expect, it } from 'vitest';
import { scorePronunciation, verdictFor } from './asr';

describe('scorePronunciation', () => {
  it('scores an exact match at 100', () => {
    expect(scorePronunciation('hola', 'hola')).toBe(100);
  });

  it('ignores accents and punctuation in the transcript', () => {
    // Recognition engines are inconsistent about returning accents at all.
    expect(scorePronunciation('como estas', '¿cómo estás?')).toBe(100);
    expect(scorePronunciation('Buenos días.', 'buenos días')).toBe(100);
  });

  it('scores a near miss high enough to pass', () => {
    expect(scorePronunciation('quisiera una servesa', 'quisiera una cerveza')).toBeGreaterThan(82);
  });

  it('scores an unrelated utterance low', () => {
    expect(scorePronunciation('buenas noches', 'tengo hambre')).toBeLessThan(50);
  });

  it('does not penalise a long sentence for a proportionally small error', () => {
    const long = scorePronunciation(
      'no entiendo mas despacio por favo',
      'no entiendo más despacio por favor',
    );
    const short = scorePronunciation('si', 'sí');
    expect(long).toBeGreaterThan(90);
    expect(short).toBe(100);
  });

  it('returns 0 for silence', () => {
    expect(scorePronunciation('', 'hola')).toBe(0);
  });

  it('returns 0 for an empty target rather than dividing by zero', () => {
    expect(scorePronunciation('hola', '')).toBe(0);
  });
});

describe('verdictFor', () => {
  it('is lenient by design — a comprehensible attempt passes', () => {
    expect(verdictFor(100)).toBe('good');
    expect(verdictFor(85)).toBe('good');
    expect(verdictFor(70)).toBe('close');
    expect(verdictFor(30)).toBe('unclear');
  });
});
