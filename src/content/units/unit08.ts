import type { Unit } from '../types';

export const unit08: Unit = {
  id: 'u8',
  n: 8,
  title: 'tener — what you have, and what you are',
  canDo: 'Say your age, say you are hungry, cold, or in a hurry, and say what you have to do.',
  scenario: 'Everyday small talk, and telling someone what you need.',

  grammar: [
    {
      id: 'u8.g.tener',
      title: 'Spanish "has" hunger where English "is" hungry',
      summary:
        'A whole family of everyday states use **tener** (to have) where English uses "to be". You do not *are* hungry — you *have* hunger.',
      body: [
        'The forms: **tengo, tienes, tiene, tenemos, tienen**. Note the e→ie shift in every form except *nosotros* — that is a stem change, and it is a pattern you will meet in dozens of verbs.',
        'The idioms are the point. *Tener hambre* (hunger), *tener sed* (thirst), *tener frío* (cold), *tener calor* (heat), *tener sueño* (sleepiness), *tener prisa* (hurry), *tener miedo* (fear), *tener razón* (to be right).',
        'Age works this way too: **tengo cuarenta y siete años** — "I have forty-seven years". Never *soy 47*, which would be saying you *are* the number itself.',
        'Because these are nouns, not adjectives, they take *mucho* rather than *muy*: "tengo mucha hambre", never "tengo muy hambre". You have *much hunger*, not *very hunger*. English does the same thing when it says "I have a lot of hunger" rather than "a very hunger" — the logic is identical, just applied to a different word.',
        '**Tener que + infinitive** is your way to say "I have to": *tengo que ir* (I have to go), *tengo que trabajar* (I have to work). The *que* is mandatory.',
      ],
      examples: [
        { es: 'Tengo cuarenta y siete años.', en: 'I am forty-seven years old.', hl: 'Tengo' },
        { es: 'Tengo mucha hambre.', en: 'I am very hungry.', hl: 'mucha hambre' },
        { es: 'Tenemos prisa.', en: 'We are in a hurry.', hl: 'prisa' },
        { es: 'Tengo que ir al hotel.', en: 'I have to go to the hotel.', hl: 'Tengo que' },
        { es: 'Usted tiene razón.', en: 'You are right.', hl: 'tiene razón' },
      ],
      hook: 'English kept a fossil of this. "I have need of it", "he has fear of heights" — older, more formal English used *have* for states in exactly the Spanish way. Spanish did not drop the habit; we mostly did.',
      pitfall:
        'The one to get right: **tengo calor** means "I am hot" in the temperature sense. *Estoy caliente* means sexually aroused. Same trap with *tengo frío* versus *estoy frío* (cold to the touch, or emotionally cold). Use tener for how the weather is treating you.',
    },
  ],

  items: [
    { id: 'u8.tener', es: 'tener', en: 'to have', pos: 'verb', hook: 'Root of "tenant", "tenacious", "retain", "contain" — all about holding.' },
    { id: 'u8.tengo', es: 'tengo', en: 'I have', pos: 'verb', rank: 65 },
    { id: 'u8.tienes', es: 'tienes', en: 'you have (informal)', pos: 'verb', register: 'informal' },
    { id: 'u8.tiene', es: 'tiene', en: 'he/she has', enAlt: ['you have (formal)'], pos: 'verb' },
    { id: 'u8.tenemos', es: 'tenemos', en: 'we have', pos: 'verb' },
    { id: 'u8.tienen', es: 'tienen', en: 'they have', pos: 'verb' },
    { id: 'u8.tengo-hambre', es: 'tengo hambre', en: 'I am hungry', pos: 'phrase', literal: 'I have hunger' },
    { id: 'u8.tengo-sed', es: 'tengo sed', en: 'I am thirsty', pos: 'phrase', literal: 'I have thirst' },
    { id: 'u8.tengo-frio', es: 'tengo frío', en: 'I am cold', pos: 'phrase', literal: 'I have cold' },
    { id: 'u8.tengo-calor', es: 'tengo calor', en: 'I am hot', pos: 'phrase', literal: 'I have heat', note: 'Not *estoy caliente*. See the pitfall note in this unit.', hook: '*Calor* is the root of "calorie" — a unit of heat.' },
    { id: 'u8.tengo-sueno', es: 'tengo sueño', en: 'I am sleepy', pos: 'phrase', literal: 'I have sleep', note: '*Sueño* is both "sleep" and "dream".' },
    { id: 'u8.tengo-prisa', es: 'tengo prisa', en: 'I am in a hurry', pos: 'phrase', literal: 'I have hurry' },
    { id: 'u8.tiene-razon', es: 'tiene razón', en: 'you are right', pos: 'phrase', literal: 'you have reason', hook: '*Razón* is "reason" — being right is possessing the reason.' },
    { id: 'u8.tengo-que', es: 'tengo que', en: 'I have to', pos: 'phrase', note: 'Always followed by an infinitive: *tengo que ir*.' },
    { id: 'u8.los-anos', es: 'los años', en: 'years', pos: 'noun', gender: 'm', note: 'With the ñ. *Ano* without it means "anus" — worth getting right.' },
    { id: 'u8.la-familia', es: 'la familia', en: 'the family', pos: 'noun', gender: 'f' },
    { id: 'u8.los-hijos', es: 'los hijos', en: 'the children', pos: 'noun', gender: 'm', note: 'Your own children. *Niños* is children generally.' },
    { id: 'u8.el-tiempo', es: 'el tiempo', en: 'the time', enAlt: ['the weather'], pos: 'noun', gender: 'm', note: 'Means both time and weather. *Hora* is clock time; *tiempo* is time in general.' },
    { id: 'u8.el-dinero', es: 'el dinero', en: 'the money', pos: 'noun', gender: 'm', hook: 'From the *denarius*, the Roman silver coin — the "d" in old British "£sd".' },
    { id: 'u8.la-llave', es: 'la llave', en: 'the key', pos: 'noun', gender: 'f', note: 'Two l\'s: "YAH-vay".' },
    { id: 'u8.el-cuarto', es: 'el cuarto', en: 'the room', pos: 'noun', gender: 'm', note: 'Also means "quarter". *La habitación* is the hotel word.' },
    { id: 'u8.tambien-no', es: 'tampoco', en: 'neither', enAlt: ['not either'], pos: 'adv', note: 'The negative twin of *también*. "Yo tampoco" — me neither.' },
  ],

  sentences: [
    { id: 'u8.s1', es: 'Tengo cuarenta y siete años.', en: 'I am forty-seven years old.', uses: ['u8.tengo', 'u8.los-anos'], cloze: 'Tengo' },
    { id: 'u8.s2', es: 'Tengo mucha hambre.', en: 'I am very hungry.', uses: ['u8.tengo-hambre'], cloze: 'mucha hambre' },
    { id: 'u8.s3', es: 'Tengo que trabajar mañana.', en: 'I have to work tomorrow.', uses: ['u8.tengo-que'], cloze: 'Tengo que' },
    { id: 'u8.s4', es: '¿Tiene usted la llave?', en: 'Do you have the key?', uses: ['u8.tiene', 'u8.la-llave'], cloze: '¿Tiene' },
    { id: 'u8.s5', es: 'No tengo dinero.', en: 'I do not have money.', uses: ['u8.tengo', 'u8.el-dinero'], cloze: 'No tengo' },
    { id: 'u8.s6', es: 'Tenemos prisa, por favor.', en: 'We are in a hurry, please.', uses: ['u8.tenemos', 'u8.tengo-prisa'], cloze: 'prisa' },
    { id: 'u8.s7', es: 'Usted tiene razón.', en: 'You are right.', uses: ['u8.tiene-razon'], cloze: 'tiene razón' },
    { id: 'u8.s8', es: 'Tengo dos hijos.', en: 'I have two children.', uses: ['u8.tengo', 'u8.los-hijos'], cloze: 'dos hijos' },
    { id: 'u8.s9', es: 'Tengo frío. ¿Tiene una manta?', en: 'I am cold. Do you have a blanket?', uses: ['u8.tengo-frio', 'u8.tiene'], cloze: 'Tengo frío' },
    { id: 'u8.s10', es: 'No tengo tiempo hoy.', en: 'I do not have time today.', uses: ['u8.tengo', 'u8.el-tiempo'], cloze: 'tiempo' },
    { id: 'u8.s11', es: 'Mi familia tiene un cuarto en el hotel.', en: 'My family has a room in the hotel.', uses: ['u8.la-familia', 'u8.tiene', 'u8.el-cuarto'], cloze: 'tiene un cuarto' },
  ],
};
