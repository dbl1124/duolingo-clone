import { describe, expect, it } from 'vitest';
import { checkAnswer, closestAccepted, editDistance, missedOnlyAccents, normalize } from './answer';

describe('normalize', () => {
  it('strips accents', () => {
    expect(normalize('cómo estás')).toBe('como estas');
    expect(normalize('adiós')).toBe('adios');
    expect(normalize('mañana')).toBe('manana');
  });

  it('strips Spanish question and exclamation marks', () => {
    expect(normalize('¿Cómo se llama?')).toBe('como se llama');
    expect(normalize('¡Ayuda!')).toBe('ayuda');
  });

  it('collapses whitespace and case', () => {
    expect(normalize('  Buenos   DÍAS  ')).toBe('buenos dias');
  });

  it('leaves an already-clean string alone', () => {
    expect(normalize('hola')).toBe('hola');
  });
});

describe('editDistance', () => {
  it('is zero for identical strings', () => {
    expect(editDistance('hola', 'hola')).toBe(0);
  });

  it('counts single edits', () => {
    expect(editDistance('hola', 'hla')).toBe(1);
    expect(editDistance('', 'hola')).toBe(4);
  });

  it('charges only one edit for an adjacent transposition', () => {
    expect(editDistance('gracias', 'gracais')).toBe(1);
    expect(editDistance('dias', 'dais')).toBe(1);
  });
});

describe('checkAnswer', () => {
  it('accepts an exact match', () => {
    expect(checkAnswer('hola', ['hola'])).toBe('correct');
  });

  it('accepts an answer typed without accents', () => {
    // The whole point: this is right, and a phone keyboard should not make it wrong.
    expect(checkAnswer('como estas', ['¿cómo estás?'])).toBe('correct');
    expect(checkAnswer('adios', ['adiós'])).toBe('correct');
    expect(checkAnswer('manana', ['mañana'])).toBe('correct');
  });

  it('accepts an answer missing Spanish punctuation', () => {
    expect(checkAnswer('cómo se llama', ['¿cómo se llama?'])).toBe('correct');
  });

  it('accepts any listed alternative', () => {
    expect(checkAnswer('thanks', ['thank you', 'thanks'])).toBe('correct');
  });

  it('treats a one-character slip in a long word as close, not wrong', () => {
    expect(checkAnswer('gracais', ['gracias'])).toBe('close');
    expect(checkAnswer('buenos dais', ['buenos días'])).toBe('close');
  });

  it('does not extend typo tolerance to very short words', () => {
    // With three-letter words, one edit is usually a different word, not a slip.
    expect(checkAnswer('sin', ['sí'])).toBe('wrong');
    expect(checkAnswer('no', ['yo'])).toBe('wrong');
  });

  it('rejects an actually wrong answer', () => {
    expect(checkAnswer('adios', ['hola'])).toBe('wrong');
    expect(checkAnswer('tengo hambre', ['tengo sed'])).toBe('wrong');
  });

  it('rejects an empty answer', () => {
    expect(checkAnswer('', ['hola'])).toBe('wrong');
    expect(checkAnswer('   ', ['hola'])).toBe('wrong');
  });

  it('prefers the best verdict across alternatives', () => {
    expect(checkAnswer('gracias', ['thank you', 'gracias'])).toBe('correct');
  });
});

describe('closestAccepted', () => {
  it('picks the alternative the learner was aiming at', () => {
    expect(closestAccepted('thanks', ['thank you', 'thanks'])).toBe('thanks');
    expect(closestAccepted('buenos dais', ['buenos días', 'buenas tardes'])).toBe('buenos días');
  });

  it('falls back to the first option for an empty input', () => {
    expect(closestAccepted('', ['hola', 'buenos días'])).toBe('hola');
  });
});

describe('missedOnlyAccents', () => {
  it('flags a correct answer that skipped the accents', () => {
    expect(missedOnlyAccents('como estas', ['¿cómo estás?'])).toBe(true);
    expect(missedOnlyAccents('manana', ['mañana'])).toBe(true);
  });

  it('does not flag a fully correct answer', () => {
    expect(missedOnlyAccents('mañana', ['mañana'])).toBe(false);
    expect(missedOnlyAccents('hola', ['hola'])).toBe(false);
  });

  it('does not flag a wrong answer', () => {
    expect(missedOnlyAccents('adios', ['hola'])).toBe(false);
  });
});
