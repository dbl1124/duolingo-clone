import { describe, expect, it } from 'vitest';
import { hasStrayMarkers } from '../lib/richtext';
import { allCards, lexItems, lifelines, sentences, units } from './index';

/**
 * These are integrity tests for hand-authored content, not for logic. Every check
 * here corresponds to a way the app would break or mislead at runtime: a cloze with
 * no blank to remove, a highlight that silently fails to highlight, a sentence
 * pointing at a word that does not exist.
 */

describe('curriculum structure', () => {
  it('numbers units sequentially from 1', () => {
    units.forEach((u, i) => expect(u.n).toBe(i + 1));
  });

  it('gives every unit a can-do statement, since that is what progress reports against', () => {
    for (const u of units) {
      expect(u.canDo.length).toBeGreaterThan(10);
      expect(u.scenario.length).toBeGreaterThan(5);
    }
  });

  it('gives every unit at least one grammar note and some content', () => {
    for (const u of units) {
      expect(u.grammar.length).toBeGreaterThan(0);
      expect(u.items.length).toBeGreaterThan(5);
      expect(u.sentences.length).toBeGreaterThan(0);
    }
  });
});

describe('identifiers', () => {
  it('has no duplicate card ids', () => {
    const seen = new Map<string, number>();
    for (const c of allCards) seen.set(c.id, (seen.get(c.id) ?? 0) + 1);
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    expect(dupes).toEqual([]);
  });

  it('has no duplicate grammar note ids', () => {
    const ids = units.flatMap((u) => u.grammar.map((g) => g.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prefixes every word and sentence id with its unit id', () => {
    for (const c of allCards) {
      // Patterns are named for the construction they drill, not the unit they
      // sit in — a frame can outlive being moved between units.
      if (c.kind === 'pattern') continue;
      expect(c.id.startsWith(`${c.unitId}.`)).toBe(true);
    }
  });

  it('names every pattern id with the p. prefix', () => {
    for (const c of allCards) {
      if (c.kind === 'pattern') expect(c.id.startsWith('p.')).toBe(true);
    }
  });
});

describe('lexical items', () => {
  it('always has Spanish and English sides', () => {
    for (const item of lexItems()) {
      expect(item.es.trim().length).toBeGreaterThan(0);
      expect(item.en.trim().length).toBeGreaterThan(0);
    }
  });

  it('does not teach the same Spanish form twice', () => {
    const seen = new Map<string, string[]>();
    for (const item of lexItems()) {
      const key = item.es.toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), item.id]);
    }
    const dupes = [...seen.entries()].filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });

  it('front-loads conversation lifelines into the first unit', () => {
    // The whole point of the lifelines decision: they must be reachable on day one,
    // not sitting in an "emergencies" unit three months away.
    const inUnit1 = lifelines().filter((i) => i.id.startsWith('u1.'));
    expect(inUnit1.length).toBeGreaterThanOrEqual(5);
  });

  it('marks a gender on every noun that has one', () => {
    for (const item of lexItems()) {
      if (item.pos === 'noun') expect(item.gender === 'm' || item.gender === 'f').toBe(true);
    }
  });
});

describe('sentences', () => {
  it('embeds its cloze target verbatim, so there is something to blank out', () => {
    for (const s of sentences()) {
      if (!s.cloze) continue;
      expect(s.es.includes(s.cloze), `${s.id}: "${s.cloze}" not found in "${s.es}"`).toBe(true);
    }
  });

  it('references only lexical items that exist', () => {
    const known = new Set(lexItems().map((i) => i.id));
    for (const s of sentences()) {
      for (const id of s.uses) {
        expect(known.has(id), `${s.id} references unknown item ${id}`).toBe(true);
      }
    }
  });

  it('only references items from its own unit or an earlier one', () => {
    // A sentence must never depend on vocabulary the learner has not reached.
    const unitOf = new Map(units.flatMap((u) => u.items.map((i) => [i.id, u.n] as const)));
    for (const u of units) {
      for (const s of u.sentences) {
        for (const id of s.uses) {
          const n = unitOf.get(id);
          expect(n, `${s.id} references unknown item ${id}`).toBeDefined();
          expect(n!, `${s.id} references ${id} from a later unit`).toBeLessThanOrEqual(u.n);
        }
      }
    }
  });

  it('has both sides filled in', () => {
    for (const s of sentences()) {
      expect(s.es.trim().length).toBeGreaterThan(0);
      expect(s.en.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('grammar notes', () => {
  it('highlights only substrings that actually occur in the example', () => {
    for (const u of units) {
      for (const g of u.grammar) {
        for (const ex of g.examples) {
          if (!ex.hl) continue;
          expect(ex.es.includes(ex.hl), `${g.id}: "${ex.hl}" not in "${ex.es}"`).toBe(true);
        }
      }
    }
  });

  it('keeps the summary short — it is read before every practice block', () => {
    for (const u of units) {
      for (const g of u.grammar) {
        expect(g.summary.length).toBeGreaterThan(20);
        expect(g.summary.length, `${g.id} summary is too long`).toBeLessThan(400);
      }
    }
  });

  it('gives every note worked examples', () => {
    for (const u of units) {
      for (const g of u.grammar) expect(g.examples.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('emphasis markers', () => {
  /**
   * Every string that reaches the reader through RichText. A marker the parser
   * does not understand does not degrade gracefully — it shows up as a literal
   * asterisk in the middle of an explanation.
   */
  function richStrings(): { where: string; text: string }[] {
    const out: { where: string; text: string }[] = [];
    for (const u of units) {
      for (const g of u.grammar) {
        out.push({ where: `${g.id}.summary`, text: g.summary });
        g.body.forEach((p, i) => out.push({ where: `${g.id}.body[${i}]`, text: p }));
        if (g.hook) out.push({ where: `${g.id}.hook`, text: g.hook });
        if (g.pitfall) out.push({ where: `${g.id}.pitfall`, text: g.pitfall });
      }
      if (u.pron) {
        out.push({ where: `${u.pron.id}.summary`, text: u.pron.summary });
        u.pron.body.forEach((p, i) => out.push({ where: `${u.pron!.id}.body[${i}]`, text: p }));
      }
      for (const item of u.items) {
        if (item.hook) out.push({ where: `${item.id}.hook`, text: item.hook });
        if (item.note) out.push({ where: `${item.id}.note`, text: item.note });
      }
    }
    return out;
  }

  it('never leaves an asterisk visible to the reader', () => {
    const stray = richStrings()
      .filter(({ text }) => hasStrayMarkers(text))
      .map(({ where }) => where);
    expect(stray).toEqual([]);
  });
});

describe('pronunciation focuses', () => {
  it('gives every minimal pair a real contrast and two distinct words', () => {
    for (const u of units) {
      if (!u.pron?.pairs) continue;
      for (const p of u.pron.pairs) {
        expect(p.a).not.toBe(p.b);
        expect(p.contrast.length).toBeGreaterThan(0);
        expect(p.aEn.length).toBeGreaterThan(0);
        expect(p.bEn.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('written Spanish', () => {
  /**
   * Checks that catch whole classes of error mechanically. None of them can tell
   * you a translation is wrong — only a reader can — but each one closes a way
   * of being wrong that is easy to introduce and hard to notice.
   */

  /** Every Spanish string a learner ever sees. */
  function everySpanishString(): { where: string; text: string }[] {
    const out: { where: string; text: string }[] = [];
    for (const item of lexItems()) out.push({ where: item.id, text: item.es });
    for (const s of sentences()) out.push({ where: s.id, text: s.es });
    for (const u of units) {
      for (const g of u.grammar) {
        g.examples.forEach((e, i) => out.push({ where: `${g.id}.ex[${i}]`, text: e.es }));
      }
      for (const p of u.pron?.pairs ?? []) {
        out.push({ where: `${u.pron!.id}.a`, text: p.a });
        out.push({ where: `${u.pron!.id}.b`, text: p.b });
      }
    }
    return out;
  }

  it('gives a noun the article its declared gender calls for', () => {
    // A masculine article on an item marked feminine means one of the two is
    // wrong, and the learner is taught a wrong gender either way.
    const bad: string[] = [];
    for (const i of lexItems()) {
      // agua is feminine and takes el, to keep two stressed a-sounds apart. It
      // is the documented exception, not a mistake.
      if (i.es === 'el agua') continue;
      if (/^(el|los|un)\s/.test(i.es) && i.gender === 'f') bad.push(`${i.id} "${i.es}" is marked feminine`);
      if (/^(la|las|una)\s/.test(i.es) && i.gender === 'm') bad.push(`${i.id} "${i.es}" is marked masculine`);
    }
    expect(bad).toEqual([]);
  });

  it('closes every ¿ and ¡ it opens', () => {
    const bad = everySpanishString().filter(({ text }) => {
      const count = (re: RegExp) => (text.match(re) ?? []).length;
      return count(/\?/g) !== count(/¿/g) || count(/!/g) !== count(/¡/g);
    });
    expect(bad.map((b) => `${b.where}: ${b.text}`)).toEqual([]);
  });

  it('never spells the same word two ways unless the pair is a real one', () => {
    /**
     * A missing accent is invisible to every other check here: "esta" and "está"
     * are both words, so nothing flags one standing where the other belongs.
     * What this can catch is the same letters appearing both with and without an
     * accent across the curriculum. Most such pairs are genuine — sé/se are
     * different words — so the real ones are listed and anything new fails,
     * which is the only way a typo of this kind surfaces at all.
     */
    const KNOWN_PAIRS = [
      'como', // cómo (how) / como (I eat, like)
      'esta', // está (is) / esta (this)
      'de', // dé (give) / de (of)
      'se', // sé (I know) / se (reflexive)
      'gusto', // gustó (it pleased) / gusto (pleasure)
      'el', // él (he) / el (the)
      'mi', // mí (me) / mi (my)
      'que', // qué (what) / que (that)
    ];
    const strip = (w: string) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const spellings = new Map<string, Set<string>>();
    for (const { text } of everySpanishString()) {
      for (const word of text.toLowerCase().match(/[a-záéíóúüñ]+/g) ?? []) {
        const key = strip(word);
        if (!spellings.has(key)) spellings.set(key, new Set());
        spellings.get(key)!.add(word);
      }
    }
    const unexpected = [...spellings.entries()]
      .filter(([key, forms]) => forms.size > 1 && !KNOWN_PAIRS.includes(key))
      .map(([, forms]) => [...forms].join(' / '));
    expect(unexpected).toEqual([]);
  });
});

describe('curriculum size', () => {
  it('holds enough material for months of ten-minute sessions', () => {
    // At six new cards a day, this is the point where the review load, not the
    // content, becomes the limit.
    expect(allCards.length).toBeGreaterThan(250);
  });

  it('orders lexical items before the sentences that use them', () => {
    const index = new Map(allCards.map((c, i) => [c.id, i] as const));
    for (const u of units) {
      for (const s of u.sentences) {
        for (const id of s.uses) {
          expect(index.get(id)!, `${s.id} comes before ${id}`).toBeLessThan(index.get(s.id)!);
        }
      }
    }
  });
});
