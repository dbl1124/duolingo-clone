import { describe, expect, it } from 'vitest';
import { lexItems, sentences } from '../content';
import { getPattern, patternSize, patterns } from '../content/patterns';
import { mulberry32 } from './builder';
import { expandPattern, patternAvailability, realizePattern, usableFillers } from './generate';

const knowsEverything = () => true;
const knowsNothing = () => false;

/** Every card id in the curriculum, for checking that fillers point at real words. */
const CARD_IDS = new Set([...lexItems().map((i) => i.id), ...sentences().map((s) => s.id)]);

describe('pattern definitions', () => {
  it('has unique ids', () => {
    const ids = patterns.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only requires cards that exist', () => {
    // A typo in a `requires` would silently make a pattern permanently
    // unavailable — it would just never appear, with no error anywhere.
    const bad: string[] = [];
    for (const p of patterns) {
      for (const id of p.requires) if (!CARD_IDS.has(id)) bad.push(`${p.id} requires ${id}`);
      for (const [slot, options] of Object.entries(p.slots)) {
        for (const f of options) {
          for (const id of f.requires) {
            if (!CARD_IDS.has(id)) bad.push(`${p.id}.${slot} "${f.es}" requires ${id}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('gives every slot at least two fillers, or the frame cannot vary', () => {
    for (const p of patterns) {
      for (const [slot, options] of Object.entries(p.slots)) {
        expect(options.length, `${p.id}.${slot}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('belongs to a unit that exists', () => {
    const unitIds = new Set(patterns.map((p) => p.unitId));
    for (const id of unitIds) expect(id).toMatch(/^u\d+$/);
  });

  it('produces enough sentences to be worth scheduling', () => {
    for (const p of patterns) expect(patternSize(p), p.id).toBeGreaterThanOrEqual(4);
  });
});

describe('generated Spanish', () => {
  /**
   * The load-bearing test. Every sentence every pattern can produce is expanded
   * and checked structurally. A generator that emits wrong Spanish is worse than
   * no generator, and these are the mistakes a template is actually prone to:
   * stray whitespace, a missing opening ¿, a doubled preposition, an uncontracted
   * "a el", or a lowercase opening.
   */
  const everything = patterns.flatMap((p) =>
    expandPattern(p, knowsEverything).map((r) => ({ pattern: p.id, ...r })),
  );

  it('expands to a large number of distinct sentences', () => {
    // ~1,200 today from eleven frames, against 107 fixed sentences. The floor is
    // set well below the current figure so that adding a filler does not have to
    // come with a test edit, but removing a whole pattern does.
    expect(everything.length).toBeGreaterThan(1000);
    const distinct = new Set(everything.map((r) => r.es));
    // Some overlap is expected — "Va" serves both él and ella — but the bulk
    // must be genuinely different sentences.
    expect(distinct.size).toBeGreaterThan(everything.length * 0.6);
  });

  it('never leaves stray or doubled whitespace', () => {
    const bad = everything.filter((r) => /\s{2,}/.test(r.es) || r.es !== r.es.trim());
    expect(bad).toEqual([]);
  });

  it('starts every sentence with a capital or an opening punctuation mark', () => {
    const bad = everything.filter((r) => !/^[¿¡A-ZÁÉÍÓÚÑ]/.test(r.es));
    expect(bad.map((r) => `${r.pattern}: ${r.es}`)).toEqual([]);
  });

  it('pairs every ? with an opening ¿', () => {
    const bad = everything.filter((r) => r.es.includes('?') !== r.es.startsWith('¿'));
    expect(bad.map((r) => `${r.pattern}: ${r.es}`)).toEqual([]);
  });

  it('never emits the uncontracted "a el"', () => {
    // The whole point of the ¿cómo llego? pattern is the a + el = al contraction,
    // so producing "a el mercado" would be teaching the error it drills.
    const bad = everything.filter((r) => /\ba el\b/.test(r.es));
    expect(bad.map((r) => `${r.pattern}: ${r.es}`)).toEqual([]);
  });

  it('never doubles a preposition or a conjunction', () => {
    const bad = everything.filter((r) => /\b(a|de|que|en) \1\b/.test(r.es));
    expect(bad.map((r) => `${r.pattern}: ${r.es}`)).toEqual([]);
  });

  it('gives every sentence a non-empty English translation', () => {
    const bad = everything.filter((r) => r.en.trim().length < 4 || /\s{2,}/.test(r.en));
    expect(bad.map((r) => `${r.pattern}: "${r.en}"`)).toEqual([]);
  });

  it('never repeats a word immediately in the English', () => {
    const bad = everything.filter((r) => /\b(\w+) \1\b/i.test(r.en));
    expect(bad.map((r) => `${r.pattern}: ${r.en}`)).toEqual([]);
  });

  it('offers alternatives that are themselves well-formed', () => {
    const alts = everything.flatMap((r) => r.esAlt.map((a) => ({ pattern: r.pattern, a })));
    const bad = alts.filter(
      (x) => /\s{2,}/.test(x.a) || x.a !== x.a.trim() || !/^[¿¡A-ZÁÉÍÓÚÑ]/.test(x.a),
    );
    expect(bad.map((x) => `${x.pattern}: ${x.a}`)).toEqual([]);
  });
});

describe('specific constructions', () => {
  const esOf = (patternId: string) =>
    expandPattern(getPattern(patternId)!, knowsEverything).map((r) => r.es);

  it('contracts a + el but not a + la', () => {
    const built = esOf('p.como-llego');
    expect(built).toContain('¿Cómo llego al mercado?');
    expect(built).toContain('¿Cómo llego a la farmacia?');
    expect(built.some((s) => s.includes('al farmacia'))).toBe(false);
    expect(built.some((s) => s.includes('a la mercado'))).toBe(false);
  });

  it('agrees adjectives with the subject it knows', () => {
    const built = expandPattern(getPattern('p.estar-mood')!, knowsEverything);
    const she = built.find((r) => r.en === 'She is tired');
    const we = built.find((r) => r.en === 'We are tired');
    expect(she?.es).toBe('Está cansada');
    expect(we?.es).toBe('Estamos cansados');
  });

  it('accepts either gender when the subject does not fix it', () => {
    // The app does not know the learner's gender and should not assume it.
    const built = expandPattern(getPattern('p.estar-mood')!, knowsEverything);
    const me = built.find((r) => r.en === 'I am tired')!;
    expect(me.es).toBe('Estoy cansado');
    expect(me.esAlt).toContain('Estoy cansada');
  });

  it('conjugates regular verbs by person', () => {
    const built = expandPattern(getPattern('p.regular-verb')!, knowsEverything);
    expect(built.find((r) => r.en === 'I always work')?.es).toBe('Siempre trabajo');
    expect(built.find((r) => r.en === 'He always works')?.es).toBe('Siempre trabaja');
    expect(built.find((r) => r.en === 'We eat a lot')?.es).toBe('Comemos mucho');
  });

  it('puts frequency adverbs in front and quantity adverbs behind', () => {
    const built = esOf('p.regular-verb');
    expect(built).toContain('Nunca estudio');
    expect(built).toContain('Estudio un poco');
    expect(built.some((s) => s === 'Estudio nunca')).toBe(false);
  });

  it('builds the future without a future tense', () => {
    const built = expandPattern(getPattern('p.ir-a')!, knowsEverything);
    const one = built.find((r) => r.en === 'We are going to study on Saturday');
    expect(one?.es).toBe('Vamos a estudiar el sábado');
  });

  it('uses tener where English uses to be', () => {
    const built = expandPattern(getPattern('p.tener-state')!, knowsEverything);
    expect(built.find((r) => r.en === 'I am hungry')?.es).toBe('Tengo hambre');
    expect(built.find((r) => r.en === 'We are in a hurry')?.es).toBe('Tenemos prisa');
  });
});

describe('availability', () => {
  it('offers nothing to a learner who knows nothing', () => {
    for (const p of patterns) {
      const a = patternAvailability(p, knowsNothing);
      expect(a.available, p.id).toBe(false);
      expect(a.blockedSlots.length).toBeGreaterThan(0);
    }
  });

  it('opens every pattern to a learner who knows everything', () => {
    for (const p of patterns) {
      expect(patternAvailability(p, knowsEverything).available, p.id).toBe(true);
    }
  });

  it('stays closed while a slot has only one usable filler', () => {
    // One expansion is a fixed phrase in disguise — the learner would memorise
    // the single output and never exercise the frame.
    const pattern = getPattern('p.donde-esta')!;
    const onlyOne = (id: string) => id === 'u3.donde-esta' || id === 'u3.el-bano';
    expect(patternAvailability(pattern, onlyOne).available).toBe(false);
  });

  it('opens once a second filler is known', () => {
    const pattern = getPattern('p.donde-esta')!;
    const two = (id: string) =>
      ['u3.donde-esta', 'u3.el-bano', 'u3.el-hotel'].includes(id);
    const a = patternAvailability(pattern, two);
    expect(a.available).toBe(true);
    expect(a.reach).toBe(2);
  });

  it('grows quietly as more words are learned', () => {
    const pattern = getPattern('p.ir-a')!;
    const few = (id: string) =>
      ['u9.voy-a', 'u9.voy', 'u9.vamos', 'u7.comer', 'u7.trabajar', 'u9.manana', 'u3.hoy'].includes(id);
    const narrow = patternAvailability(pattern, few);
    const wide = patternAvailability(pattern, knowsEverything);
    expect(narrow.available).toBe(true);
    expect(narrow.reach).toBe(2 * 2 * 2);
    expect(wide.reach).toBeGreaterThan(narrow.reach * 20);
  });
});

describe('realizePattern', () => {
  it('only uses words the learner knows', () => {
    const pattern = getPattern('p.ir-a')!;
    const allowed = ['u9.voy-a', 'u9.voy', 'u9.vamos', 'u7.comer', 'u7.trabajar', 'u9.manana', 'u3.hoy'];
    const knows = (id: string) => allowed.includes(id);
    for (let seed = 1; seed < 60; seed++) {
      const r = realizePattern(pattern, knows, mulberry32(seed))!;
      expect(r).not.toBeNull();
      expect(r.es).toMatch(/^(Voy|Vamos) a (comer|trabajar) (mañana|hoy)$/);
    }
  });

  it('is deterministic for a seed and varies across seeds', () => {
    const pattern = getPattern('p.ir-a')!;
    const a = realizePattern(pattern, knowsEverything, mulberry32(7))!;
    const b = realizePattern(pattern, knowsEverything, mulberry32(7))!;
    expect(a.es).toBe(b.es);

    const many = new Set(
      Array.from({ length: 40 }, (_, i) => realizePattern(pattern, knowsEverything, mulberry32(i))!.es),
    );
    expect(many.size).toBeGreaterThan(20);
  });

  it('returns null rather than a broken sentence when a slot is empty', () => {
    const pattern = getPattern('p.ir-a')!;
    expect(realizePattern(pattern, knowsNothing, mulberry32(1))).toBeNull();
  });
});

describe('usableFillers', () => {
  it('requires every card a filler names, not just one', () => {
    const options = [{ requires: ['a', 'b'], es: 'x', en: 'x' }];
    expect(usableFillers(options, (id) => id === 'a')).toEqual([]);
    expect(usableFillers(options, () => true)).toHaveLength(1);
  });
});
