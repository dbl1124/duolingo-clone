import type { Unit } from '../types.ts';

export const unit14: Unit = {
  id: 'u14',
  n: 14,
  title: 'What happened — talking about yesterday',
  canDo: 'Say what you did, where you went and how it was — and ask someone else, which is the question most conversations actually open with.',
  scenario:
    '"How was your trip?" "What did you do yesterday?" "I went to the market and bought too much." Everything that already happened.',

  grammar: [
    {
      id: 'u14.g.preterite',
      title: 'The past tense that does the work',
      summary:
        'Spanish has two past tenses. This one — the **preterite** — is for things that happened and finished. It covers most of what you want to say, and it is built from two sets of endings.',
      body: [
        'For **-ar** verbs, chop off *-ar* and add: **-é, -aste, -ó, -amos, -aron**. *Hablar* → *hablé, hablaste, habló, hablamos, hablaron*.',
        'For **-er** and **-ir** verbs, one set covers both: **-í, -iste, -ió, -imos, -ieron**. *Comer* → *comí, comiste, comió, comimos, comieron*.',
        'Those accent marks are not decoration. *Hablo* is "I speak"; *habló* is "he spoke". The only difference on the page is one mark, and in speech it is the whole difference — the stress moves to the last syllable. Say them out loud until they sound like different words, because they are.',
        'A quirk that saves you effort: for *-ar* and *-ir* verbs the *nosotros* form is identical in both tenses. *Hablamos* is "we speak" and "we spoke". *Vivimos* is "we live" and "we lived". Context does the work, and native speakers do not find this ambiguous.',
        'The other past tense — the imperfect — is for what used to happen or was ongoing. You will want it eventually. You do not need it to tell someone about your day.',
      ],
      examples: [
        { es: 'Hablé con mi amigo.', en: 'I spoke with my friend.', hl: 'Hablé' },
        { es: 'Comí en el mercado.', en: 'I ate at the market.', hl: 'Comí' },
        { es: '¿Qué comió?', en: 'What did he eat?', hl: 'comió' },
        { es: 'Salí temprano.', en: 'I left early.', hl: 'Salí' },
        { es: 'Trabajé mucho ayer.', en: 'I worked a lot yesterday.', hl: 'Trabajé' },
      ],
      hook: 'These endings come almost unchanged from Latin — *cantavi*, *cantavisti* became *canté*, *cantaste*. When you conjugate a Spanish past tense you are using a two-thousand-year-old set of endings that has barely moved.',
      pitfall:
        'Do not build a past tense with a helper verb. There is no Spanish equivalent of "did" — "¿Qué did hacer?" has no translation. The ending carries the tense on its own.',
    },
    {
      id: 'u14.g.irregular-past',
      title: 'Six irregulars worth memorising outright',
      summary:
        'A small group of very common verbs ignores the endings above and takes its own set — with **no accent marks at all**. *Fui, tuve, estuve, hice*. Learn these six as words, not as a rule.',
      body: [
        'The pattern they share: a changed stem, and endings **-e, -iste, -o, -imos, -ieron** with no written accents. *Tener* → **tuve, tuviste, tuvo**. *Estar* → **estuve, estuviste, estuvo**. *Hacer* → **hice, hiciste, hizo**.',
        'The strangest and most useful is *fui*. **Ir** and **ser** share their entire past tense. *Fui a México* is "I went to Mexico". *Fue muy bueno* is "it was very good". Same forms, and nobody is ever confused, because going and being turn up in completely different sentences.',
        'Notice *hizo* is spelled with a **z**. Spanish will not write *ci* where the sound needs to stay the same, so the *c* becomes *z* before *o*. It is a spelling rule, not a new word.',
        'These six make up an enormous share of everything said in the past tense. Learning them by brute force is the efficient move — the rule they follow is not worth the effort of extracting.',
      ],
      examples: [
        { es: 'Fui al mercado.', en: 'I went to the market.', hl: 'Fui' },
        { es: 'Fue muy bueno.', en: 'It was very good.', hl: 'Fue' },
        { es: 'Tuve un problema.', en: 'I had a problem.', hl: 'Tuve' },
        { es: 'Estuve en casa.', en: 'I was at home.', hl: 'Estuve' },
        { es: '¿Qué hizo ayer?', en: 'What did you do yesterday?', hl: 'hizo' },
      ],
      pitfall:
        'No accents on these. Writing "fuí" or "tuvé" is the classic overcorrection — the irregulars are stressed on the stem, so there is nothing to mark.',
    },
    {
      id: 'u14.g.hace-ago',
      title: 'hace — "ago", built backwards',
      summary:
        'To say "two days ago", Spanish says **hace dos días** — literally "it makes two days". The time expression comes after, and *hace* never changes.',
      body: [
        'English puts "ago" at the end; Spanish puts *hace* at the front. *Hace dos días* — two days ago. *Hace una semana* — a week ago. *Hace mucho tiempo* — a long time ago.',
        'The word is the verb *hacer*, "to make", frozen into a fixed expression. Do not try to conjugate it: it is *hace* whether you are talking about yourself or anyone else.',
        'Put it with a past tense and you have a complete report: *Llegué hace dos días* — I arrived two days ago. That single frame handles most of what a traveller needs to say about when.',
        'The same word covers the weather, incidentally: *hace frío*, *hace calor*. Spanish uses "it makes" where English uses "it is".',
      ],
      examples: [
        { es: 'Hace dos días.', en: 'Two days ago.', hl: 'Hace' },
        { es: 'Llegué hace una semana.', en: 'I arrived a week ago.', hl: 'hace una semana' },
        { es: 'Fui hace mucho tiempo.', en: 'I went a long time ago.', hl: 'hace mucho tiempo' },
      ],
      pitfall:
        'Do not put it at the end. "Dos días hace" is not Spanish — the frame runs *hace* first, then the length of time.',
    },
  ],

  items: [
    { id: 'u14.hacer', es: 'hacer', en: 'to do', enAlt: ['to make'], pos: 'verb', rank: 20, note: 'One verb for both, as in French *faire*. Also does the weather: *hace frío*.' },
    { id: 'u14.hago', es: 'hago', en: 'I do', enAlt: ['I make'], pos: 'verb' },
    { id: 'u14.hice', es: 'hice', en: 'I did', enAlt: ['I made'], pos: 'verb' },
    { id: 'u14.hizo', es: 'hizo', en: 'he/she did', enAlt: ['you did (formal)', 'he made'], pos: 'verb', note: 'Spelled with *z* so the sound stays put before *o*.' },
    { id: 'u14.que-hizo', es: '¿qué hizo?', en: 'what did you do?', pos: 'phrase', register: 'formal', note: 'The most common opening question there is. *¿Qué hiciste?* to someone you call *tú*.' },
    { id: 'u14.fui', es: 'fui', en: 'I went', enAlt: ['I was'], pos: 'verb', note: 'Does duty for both *ir* and *ser*. The context always makes it obvious.' },
    { id: 'u14.fue', es: 'fue', en: 'it was', enAlt: ['he went', 'she went', 'he was'], pos: 'verb' },
    { id: 'u14.fuimos', es: 'fuimos', en: 'we went', enAlt: ['we were'], pos: 'verb' },
    { id: 'u14.estuve', es: 'estuve', en: 'I was', pos: 'verb', note: 'From *estar* — a place or a temporary state. *Estuve en el hotel.*' },
    { id: 'u14.estuvo', es: 'estuvo', en: 'he/she was', enAlt: ['it was', 'you were (formal)'], pos: 'verb' },
    { id: 'u14.como-estuvo', es: '¿cómo estuvo?', en: 'how was it?', pos: 'phrase', note: 'What you ask about a meal, a trip, a film. The all-purpose follow-up.' },
    { id: 'u14.tuve', es: 'tuve', en: 'I had', pos: 'verb' },
    { id: 'u14.comi', es: 'comí', en: 'I ate', pos: 'verb', note: 'The accent moves the stress to the end. *Como* is "I eat"; *comí* is "I ate".' },
    { id: 'u14.hable', es: 'hablé', en: 'I spoke', pos: 'verb' },
    { id: 'u14.trabaje', es: 'trabajé', en: 'I worked', pos: 'verb' },
    { id: 'u14.vi', es: 'vi', en: 'I saw', pos: 'verb', note: 'Two letters, no accent. One of the shortest verbs in the language.' },
    { id: 'u14.dije', es: 'dije', en: 'I said', pos: 'verb' },
    { id: 'u14.sali', es: 'salí', en: 'I left', pos: 'verb' },
    { id: 'u14.llegue', es: 'llegué', en: 'I arrived', pos: 'verb', note: 'The *u* is silent — it is there to keep the *g* hard before *é*.' },
    { id: 'u14.me-gusto', es: 'me gustó', en: 'I liked it', pos: 'phrase', literal: 'it pleased me', note: 'Still backwards, now in the past. *¿Le gustó?* — did you like it?' },
    { id: 'u14.ayer', es: 'ayer', en: 'yesterday', pos: 'adv' },
    { id: 'u14.anoche', es: 'anoche', en: 'last night', pos: 'adv', note: 'The night that has already happened. *Esta noche* is tonight, still to come — the two are a day apart and one letter of English away from each other.' },
    { id: 'u14.pasado', es: 'pasado', en: 'last', enAlt: ['past'], pos: 'adj', note: 'Goes after the noun: *la semana pasada*, *el año pasado*.' },
    { id: 'u14.la-semana-pasada', es: 'la semana pasada', en: 'last week', pos: 'phrase' },
    { id: 'u14.el-mes', es: 'el mes', en: 'the month', pos: 'noun', gender: 'm', hook: 'Same root as "month" and "moon" — a month was one cycle of it, in Latin and in English alike.' },
    { id: 'u14.el-ano', es: 'el año', en: 'the year', pos: 'noun', gender: 'm', note: 'The tilde is essential. *Año* is a year; *ano* is not, and the mistake is memorable.' },
    { id: 'u14.hace-ago', es: 'hace', en: 'ago', pos: 'adv', note: 'Goes in front: *hace dos días*, two days ago.' },
    { id: 'u14.ya', es: 'ya', en: 'already', enAlt: ['now'], pos: 'adv', note: 'Enormously common and slippery. *Ya voy* — I am on my way. *Ya está* — that is it, done.' },
    { id: 'u14.todavia', es: 'todavía', en: 'still', enAlt: ['yet'], pos: 'adv', note: '*Todavía no* — not yet.' },
  ],

  sentences: [
    { id: 'u14.s1', es: 'Fui al mercado ayer.', en: 'I went to the market yesterday.', uses: ['u14.fui', 'u6.el-mercado', 'u14.ayer'], cloze: 'Fui al' },
    { id: 'u14.s2', es: 'Fue muy bueno.', en: 'It was very good.', uses: ['u14.fue', 'u12.bueno', 'u3.muy'], cloze: 'Fue' },
    { id: 'u14.s3', es: '¿Qué hizo ayer?', en: 'What did you do yesterday?', uses: ['u14.que-hizo', 'u14.ayer'], cloze: 'hizo' },
    { id: 'u14.s4', es: 'Comí en un restaurante anoche.', en: 'I ate at a restaurant last night.', uses: ['u14.comi', 'u14.anoche'], cloze: 'Comí' },
    { id: 'u14.s5', es: 'Tuve un problema con el hotel.', en: 'I had a problem with the hotel.', uses: ['u14.tuve', 'u10.el-problema', 'u3.el-hotel'], cloze: 'Tuve' },
    { id: 'u14.s6', es: 'Estuve en casa todo el día.', en: 'I was at home all day.', uses: ['u14.estuve', 'u13.la-casa', 'u9.el-dia'], cloze: 'Estuve' },
    { id: 'u14.s7', es: 'Llegué hace dos días.', en: 'I arrived two days ago.', uses: ['u14.llegue', 'u14.hace-ago', 'u5.dos'], cloze: 'hace dos días' },
    { id: 'u14.s8', es: 'Hablé con mi esposa.', en: 'I spoke with my wife.', uses: ['u14.hable', 'u2.esposa', 'u4.con'], cloze: 'Hablé' },
    { id: 'u14.s9', es: 'La semana pasada trabajé mucho.', en: 'Last week I worked a lot.', uses: ['u14.la-semana-pasada', 'u14.trabaje', 'u5.mucho'], cloze: 'La semana pasada' },
    { id: 'u14.s10', es: '¿Cómo estuvo la comida?', en: 'How was the food?', uses: ['u14.como-estuvo', 'u4.la-comida'], cloze: 'estuvo' },
    { id: 'u14.s11', es: 'Me gustó mucho.', en: 'I liked it a lot.', uses: ['u14.me-gusto', 'u5.mucho'], cloze: 'Me gustó' },
    { id: 'u14.s12', es: 'No lo vi.', en: 'I did not see it.', uses: ['u14.vi', 'u11.lo'], cloze: 'vi' },
    { id: 'u14.s13', es: 'Todavía no.', en: 'Not yet.', uses: ['u14.todavia', 'u1.no'], cloze: 'Todavía' },
    { id: 'u14.s14', es: 'Ya pagué la cuenta.', en: 'I already paid the bill.', uses: ['u14.ya', 'u10.pagar', 'u4.la-cuenta'], cloze: 'Ya' },
  ],
};
