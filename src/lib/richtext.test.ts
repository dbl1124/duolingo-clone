import { describe, expect, it } from 'vitest';
import { hasStrayMarkers, parseRich } from './richtext';

describe('parseRich', () => {
  it('leaves plain text alone', () => {
    expect(parseRich('just words')).toEqual([{ kind: 'text', text: 'just words' }]);
  });

  it('parses bold', () => {
    expect(parseRich('use **usted** here')).toEqual([
      { kind: 'text', text: 'use ' },
      { kind: 'bold', text: 'usted' },
      { kind: 'text', text: ' here' },
    ]);
  });

  it('parses italic', () => {
    expect(parseRich('from *sedere*, to sit')).toEqual([
      { kind: 'text', text: 'from ' },
      { kind: 'italic', text: 'sedere' },
      { kind: 'text', text: ', to sit' },
    ]);
  });

  it('does not mistake bold for an empty italic', () => {
    expect(parseRich('**estar**')).toEqual([{ kind: 'bold', text: 'estar' }]);
  });

  it('handles both in one string', () => {
    expect(parseRich('**ser** comes from *sedere*')).toEqual([
      { kind: 'bold', text: 'ser' },
      { kind: 'text', text: ' comes from ' },
      { kind: 'italic', text: 'sedere' },
    ]);
  });

  it('leaves a lone asterisk as text rather than swallowing the rest', () => {
    expect(parseRich('2 * 3')).toEqual([{ kind: 'text', text: '2 * 3' }]);
  });

  it('handles a hyphenated prefix marker like *-ción*', () => {
    expect(parseRich('the *-ción* ending')).toEqual([
      { kind: 'text', text: 'the ' },
      { kind: 'italic', text: '-ción' },
      { kind: 'text', text: ' ending' },
    ]);
  });
});

describe('hasStrayMarkers', () => {
  it('is false for well-formed emphasis', () => {
    expect(hasStrayMarkers('**ser** from *sedere*')).toBe(false);
  });

  it('is true when a marker would reach the reader', () => {
    expect(hasStrayMarkers('unclosed *emphasis here')).toBe(true);
  });
});
