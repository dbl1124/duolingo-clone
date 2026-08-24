import type { Unit } from '../types.ts';

export const unit05: Unit = {
  id: 'u5',
  n: 5,
  title: 'Numbers, money, and the time',
  canDo: 'Understand a price, count, and ask or tell the time.',
  scenario: 'Paying for something, catching a bus, agreeing when to meet.',

  grammar: [
    {
      id: 'u5.g.numbers',
      title: 'Numbers: memorise sixteen, derive the rest',
      summary:
        'Learn 0–15 as raw vocabulary. From 16 up, the numbers are built from parts you already know, so the memorisation load collapses.',
      body: [
        '**16 to 19** are "ten and six" fused into one word: *dieciséis, diecisiete, dieciocho, diecinueve*. You can see *diez y seis* inside *dieciséis* if you look.',
        '**21 to 29** do the same trick with twenty: *veintiuno, veintidós, veintitrés*… one word, and the accent moves around a little.',
        '**31 upward** stops fusing and spells it out with **y**: *treinta y uno*, *cuarenta y dos*, *noventa y nueve*. Three separate words, every time, all the way to 99.',
        'The tens are their own small set: *diez, veinte, treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa, cien*. Note *cincuenta* (50) and *sesenta* (60) sound alike at speed — this is exactly the kind of contrast that gets lost over a noisy counter, so ask people to repeat rather than guessing.',
        'One irregularity worth catching now: *uno* drops its -o before a masculine noun. "Un taco", not "uno taco". Before a feminine noun it becomes *una*.',
      ],
      examples: [
        { es: 'dieciséis', en: '16 (ten-and-six)', hl: 'dieci' },
        { es: 'veintitrés', en: '23', hl: 'veinti' },
        { es: 'treinta y cuatro', en: '34', hl: 'y' },
        { es: 'ciento cincuenta pesos', en: '150 pesos', hl: 'ciento' },
      ],
      hook: '*Cien* becomes *ciento* when something follows it — 100 exactly is *cien*, but 150 is *ciento cincuenta*. Both give us "century", "percent", "centipede".',
      pitfall:
        'Mexican prices run into the hundreds and thousands routinely, so a coffee might be "cuarenta y cinco pesos". Do not panic at big numbers — they are just tens plus units.',
    },
    {
      id: 'u5.g.time',
      title: 'Telling time: "es la una" but "son las dos"',
      summary:
        'One o\'clock is singular (*es la una*); every other hour is plural (*son las dos, son las tres*). Minutes past use **y**, minutes to use **menos**.',
      body: [
        'The verb agrees with the hour because you are literally saying "it is one hour" versus "they are two hours". One is singular; two and up are plural. English hides this, Spanish does not.',
        'Past the hour: **y**. *Son las tres y diez* — three-ten. *Son las tres y cuarto* — quarter past three. *Son las tres y media* — half past three.',
        'Before the hour: **menos**. *Son las cuatro menos cuarto* — quarter to four. In Mexico you will also hear the plainer *un cuarto para las cuatro*, which is more common in everyday speech.',
        'For scheduling, **a la una** / **a las dos** means "at one" / "at two". And *de la mañana / de la tarde / de la noche* replaces a.m. and p.m.',
      ],
      examples: [
        { es: '¿Qué hora es?', en: 'What time is it?', hl: '¿Qué hora es?' },
        { es: 'Es la una.', en: 'It is one o\'clock.', hl: 'Es la' },
        { es: 'Son las dos y media.', en: 'It is half past two.', hl: 'Son las' },
        { es: 'Son las ocho de la mañana.', en: 'It is eight in the morning.', hl: 'de la mañana' },
        { es: 'A las tres, por favor.', en: 'At three, please.', hl: 'A las' },
      ],
      pitfall:
        '*Media* is "half" (media hora). *Medio día* is noon. Do not confuse *media* with *medio* — the ending follows the gender of what it is halving.',
    },
  ],

  items: [
    { id: 'u5.cero', es: 'cero', en: 'zero', pos: 'num' },
    { id: 'u5.uno', es: 'uno', en: 'one', pos: 'num', note: 'Becomes *un* before a masculine noun, *una* before a feminine one.' },
    { id: 'u5.dos', es: 'dos', en: 'two', pos: 'num', hook: 'Root of "duo", "dual", "duet".' },
    { id: 'u5.tres', es: 'tres', en: 'three', pos: 'num', hook: 'Root of "trio", "triple".' },
    { id: 'u5.cuatro', es: 'cuatro', en: 'four', pos: 'num', hook: 'Root of "quart", "quadrant".' },
    { id: 'u5.cinco', es: 'cinco', en: 'five', pos: 'num', hook: 'Root of "cinco de mayo", and the *quin-* of "quintet".' },
    { id: 'u5.seis', es: 'seis', en: 'six', pos: 'num' },
    { id: 'u5.siete', es: 'siete', en: 'seven', pos: 'num' },
    { id: 'u5.ocho', es: 'ocho', en: 'eight', pos: 'num', hook: 'Root of "octopus", "octave".' },
    { id: 'u5.nueve', es: 'nueve', en: 'nine', pos: 'num', hook: 'Root of "November" — the ninth month of the old Roman calendar.' },
    { id: 'u5.diez', es: 'diez', en: 'ten', pos: 'num', hook: 'Root of "decimal", "decade".' },
    { id: 'u5.once', es: 'once', en: 'eleven', pos: 'num', note: 'Not the English word "once". Say "OHN-say".' },
    { id: 'u5.doce', es: 'doce', en: 'twelve', pos: 'num', hook: 'Root of "dozen".' },
    { id: 'u5.trece', es: 'trece', en: 'thirteen', pos: 'num' },
    { id: 'u5.catorce', es: 'catorce', en: 'fourteen', pos: 'num' },
    { id: 'u5.quince', es: 'quince', en: 'fifteen', pos: 'num', note: 'A girl\'s 15th birthday party is a *quinceañera* — this number carries cultural weight.' },
    { id: 'u5.veinte', es: 'veinte', en: 'twenty', pos: 'num' },
    { id: 'u5.treinta', es: 'treinta', en: 'thirty', pos: 'num' },
    { id: 'u5.cuarenta', es: 'cuarenta', en: 'forty', pos: 'num' },
    { id: 'u5.cincuenta', es: 'cincuenta', en: 'fifty', pos: 'num', note: 'Easily confused with *sesenta* at speed.' },
    { id: 'u5.sesenta', es: 'sesenta', en: 'sixty', pos: 'num' },
    { id: 'u5.cien', es: 'cien', en: 'one hundred', pos: 'num', note: 'Exactly 100. Becomes *ciento* when a smaller number follows.' },
    { id: 'u5.mil', es: 'mil', en: 'one thousand', pos: 'num', hook: 'Root of "mile" (a thousand paces), "millennium", "millimetre".' },
    { id: 'u5.el-peso', es: 'el peso', en: 'the peso', pos: 'noun', gender: 'm', hook: 'Literally "weight" — from when coins were valued by weighing them. Same root as "pensive": to weigh a thought.' },
    { id: 'u5.cuanto-es', es: '¿cuánto es?', en: 'how much is it?', pos: 'phrase', note: 'For a total. *¿Cuánto cuesta?* is for one item.' },
    { id: 'u5.la-tarjeta', es: 'la tarjeta', en: 'the card', pos: 'noun', gender: 'f', note: '"¿Aceptan tarjeta?" — do you take cards?' },
    { id: 'u5.que-hora-es', es: '¿qué hora es?', en: 'what time is it?', pos: 'phrase', hook: '*Hora* is the root of "hour" and "horoscope". The h is silent: "OH-ra".' },
    { id: 'u5.y-media', es: 'y media', en: 'half past', pos: 'phrase', literal: 'and half' },
    { id: 'u5.y-cuarto', es: 'y cuarto', en: 'quarter past', pos: 'phrase', literal: 'and quarter' },
    { id: 'u5.la-manana', es: 'la mañana', en: 'the morning', pos: 'noun', gender: 'f', note: 'With the ñ. *Mañana* also means "tomorrow" — same word, context decides.' },
    { id: 'u5.mucho', es: 'mucho', en: 'a lot', enAlt: ['much', 'many'], pos: 'adv', rank: 48 },
  ],

  sentences: [
    { id: 'u5.s1', es: '¿Cuánto es?', en: 'How much is it?', uses: ['u5.cuanto-es'], cloze: '¿Cuánto es?' },
    { id: 'u5.s2', es: 'Son cuarenta pesos.', en: 'It is forty pesos.', uses: ['u5.cuarenta', 'u5.el-peso'], cloze: 'cuarenta' },
    { id: 'u5.s3', es: '¿Qué hora es?', en: 'What time is it?', uses: ['u5.que-hora-es'], cloze: '¿Qué hora es?' },
    { id: 'u5.s4', es: 'Son las dos y media.', en: 'It is half past two.', uses: ['u5.dos', 'u5.y-media'], cloze: 'y media' },
    { id: 'u5.s5', es: 'Es la una.', en: 'It is one o\'clock.', uses: ['u5.uno'], cloze: 'Es la una' },
    { id: 'u5.s6', es: 'Ciento cincuenta pesos, por favor.', en: 'One hundred and fifty pesos, please.', uses: ['u5.cien', 'u5.cincuenta', 'u5.el-peso'], cloze: 'Ciento cincuenta' },
    { id: 'u5.s7', es: '¿Aceptan tarjeta?', en: 'Do you take cards?', uses: ['u5.la-tarjeta'], cloze: 'tarjeta' },
    { id: 'u5.s8', es: 'Son las ocho de la mañana.', en: 'It is eight in the morning.', uses: ['u5.ocho', 'u5.la-manana'], cloze: 'de la mañana' },
    { id: 'u5.s9', es: 'Quisiera dos, por favor.', en: 'I would like two, please.', uses: ['u5.dos'], cloze: 'dos' },
    { id: 'u5.s10', es: 'Muchas gracias.', en: 'Thank you very much.', uses: ['u5.mucho'], cloze: 'Muchas' },
  ],
};
