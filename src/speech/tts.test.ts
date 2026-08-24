import { describe, expect, it } from 'vitest';
import { normalizeLang, pickVoice, rankSpanishVoices, regionLabel, scoreVoice } from './tts';

/** Minimal stand-in — only the fields the ranking actually reads. */
function voice(name: string, lang: string, localService = true): SpeechSynthesisVoice {
  return {
    name,
    lang,
    localService,
    voiceURI: `${name}::${lang}`,
    default: false,
  } as SpeechSynthesisVoice;
}

// Names taken from voices that really ship on iOS, Android and desktop Chrome.
const MX_COMPACT = voice('Paulina (Compact)', 'es-MX');
const MX_ENHANCED = voice('Paulina (Enhanced)', 'es-MX');
const ES_ENHANCED = voice('Mónica (Enhanced)', 'es-ES');
const ES_COMPACT = voice('Mónica (Compact)', 'es-ES');
const GOOGLE_US = voice('Google español de Estados Unidos', 'es-US');
const MS_NATURAL = voice('Microsoft Dalia Online (Natural) - Spanish (Mexico)', 'es-MX', false);
const ENGLISH = voice('Samantha', 'en-US');
const FRENCH = voice('Amélie', 'fr-CA');

describe('normalizeLang', () => {
  it('handles the underscore form some engines report', () => {
    expect(normalizeLang('es_MX')).toBe('es-mx');
    expect(normalizeLang('es-ES')).toBe('es-es');
  });
});

describe('scoreVoice', () => {
  it('excludes anything that is not Spanish', () => {
    expect(scoreVoice(ENGLISH)).toBe(-Infinity);
    expect(scoreVoice(FRENCH)).toBe(-Infinity);
  });

  it('prefers Mexican over Castilian, all else equal', () => {
    expect(scoreVoice(MX_COMPACT)).toBeGreaterThan(scoreVoice(ES_COMPACT));
  });

  it('penalises the robotic compact synthesisers', () => {
    expect(scoreVoice(MX_ENHANCED)).toBeGreaterThan(scoreVoice(MX_COMPACT));
  });

  it('values engine quality above region', () => {
    // The whole point of the rewrite: an enhanced Castilian voice teaches better
    // than a robotic Mexican one, because the gap between a neural engine and a
    // formant synthesiser dwarfs the gap between Spanish varieties.
    expect(scoreVoice(ES_ENHANCED)).toBeGreaterThan(scoreVoice(MX_COMPACT));
  });

  it('recognises Google and Microsoft neural voices', () => {
    expect(scoreVoice(GOOGLE_US)).toBeGreaterThan(scoreVoice(ES_COMPACT));
    expect(scoreVoice(MS_NATURAL)).toBeGreaterThan(scoreVoice(MX_COMPACT));
  });

  it('nudges toward on-device voices so offline keeps working', () => {
    const local = voice('Paulina', 'es-MX', true);
    const remote = voice('Paulina', 'es-MX', false);
    expect(scoreVoice(local)).toBeGreaterThan(scoreVoice(remote));
  });

  it('gives an unknown Spanish region a usable middling score', () => {
    expect(scoreVoice(voice('Someone', 'es-XX'))).toBeGreaterThan(0);
  });
});

describe('rankSpanishVoices', () => {
  it('drops non-Spanish voices entirely', () => {
    const ranked = rankSpanishVoices([ENGLISH, FRENCH, MX_COMPACT]);
    expect(ranked.map((v) => v.name)).toEqual(['Paulina (Compact)']);
  });

  it('puts the best voice first', () => {
    const ranked = rankSpanishVoices([ES_COMPACT, MX_COMPACT, MX_ENHANCED, ES_ENHANCED]);
    expect(ranked[0]!.name).toBe('Paulina (Enhanced)');
  });

  it('flags enhanced voices and network voices for the picker', () => {
    const ranked = rankSpanishVoices([MS_NATURAL, MX_COMPACT]);
    const natural = ranked.find((v) => v.name.includes('Dalia'))!;
    expect(natural.enhanced).toBe(true);
    expect(natural.local).toBe(false);
    expect(ranked.find((v) => v.name.includes('Compact'))!.enhanced).toBe(false);
  });

  it('labels the region readably', () => {
    expect(regionLabel('es-MX')).toBe('Mexico');
    expect(regionLabel('es_ES')).toBe('Spain');
    expect(regionLabel('es-419')).toBe('Latin America');
  });

  it('is stable when scores tie', () => {
    const a = voice('Bravo', 'es-MX');
    const b = voice('Alfa', 'es-MX');
    expect(rankSpanishVoices([a, b]).map((v) => v.name)).toEqual(['Alfa', 'Bravo']);
  });

  it('returns nothing when the device has no Spanish voices', () => {
    expect(rankSpanishVoices([ENGLISH])).toEqual([]);
  });
});

describe('pickVoice', () => {
  const all = [ENGLISH, ES_COMPACT, MX_COMPACT, MX_ENHANCED];

  it('picks the highest-scoring voice by default', () => {
    expect(pickVoice(all)?.name).toBe('Paulina (Enhanced)');
  });

  it('honours a pinned voice even when it scores lower', () => {
    expect(pickVoice(all, ES_COMPACT.voiceURI)?.name).toBe('Mónica (Compact)');
  });

  it('falls back to the best available when the pinned voice is gone', () => {
    // Happens when a voice is uninstalled, or the backup is restored on another
    // device. Going silent would be the worst possible failure here.
    expect(pickVoice(all, 'Nonexistent::es-MX')?.name).toBe('Paulina (Enhanced)');
  });

  it('returns null rather than an English voice when no Spanish exists', () => {
    expect(pickVoice([ENGLISH])).toBeNull();
  });
});
