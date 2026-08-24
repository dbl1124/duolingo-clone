import type { Unit } from '../types';

export const unit07: Unit = {
  id: 'u7',
  n: 7,
  title: 'Regular verbs — the engine',
  canDo: 'Say what you and other people do, using any regular verb in the language.',
  scenario: 'Talking about your work, your day, what you like doing.',

  grammar: [
    {
      id: 'u7.g.present',
      title: 'Three endings, and you can conjugate thousands of verbs',
      summary:
        'Every Spanish infinitive ends in **-ar**, **-er**, or **-ir**. Chop off those two letters and add a new ending for the person. This one pattern unlocks most of the verbs in the language.',
      body: [
        'This is the highest-return twenty minutes in beginner Spanish. Roughly 90% of all Spanish verbs are regular -ar verbs, and once you have this table you can produce them all — including verbs you have never seen, and verbs that have not been invented yet (*tuitear*, to tweet, conjugates exactly like *hablar*).',
        '**-ar** verbs (hablar, to speak): hablo, hablas, habla, hablamos, hablan.',
        '**-er** verbs (comer, to eat): como, comes, come, comemos, comen.',
        '**-ir** verbs (vivir, to live): vivo, vives, vive, vivimos, viven.',
        'Look at what actually varies. The **yo** form is always **-o**, in all three groups. The -er and -ir endings are identical except in the *nosotros* form (comemos vs vivimos). So there are far fewer than three tables here — there is one table with two small wrinkles.',
        'The stress matters as much as the letters. *Hablo* is "I speak" (stress on HA); *habló* is "he spoke" (stress on BLO). Same five letters, different tense, and the only difference you can hear is which syllable you lean on.',
      ],
      examples: [
        { es: 'Hablo un poco de español.', en: 'I speak a little Spanish.', hl: 'Hablo' },
        { es: '¿Habla usted inglés?', en: 'Do you speak English?', hl: 'Habla' },
        { es: 'Comemos a las dos.', en: 'We eat at two.', hl: 'Comemos' },
        { es: 'Vivo en Ohio.', en: 'I live in Ohio.', hl: 'Vivo' },
        { es: 'Ellos trabajan mucho.', en: 'They work a lot.', hl: 'trabajan' },
      ],
      hook: 'The -ar group is the living one: it is where Spanish files every new verb it borrows. *Chatear*, *googlear*, *escanear*. If you meet a verb that looks like an English word with -ar stapled on, it is regular, and you already know how to conjugate it.',
      pitfall:
        'Spanish has no separate "do" or "am" for questions and continuous action. *Hablo español* covers "I speak Spanish", "I am speaking Spanish", and "I do speak Spanish". Do not try to translate "do" or "am" — there is nothing there to translate.',
    },
  ],

  items: [
    { id: 'u7.hablar', es: 'hablar', en: 'to speak', pos: 'verb', rank: 130, hook: 'Root of "affable" — literally "easy to speak to".' },
    { id: 'u7.hablo', es: 'hablo', en: 'I speak', pos: 'verb' },
    { id: 'u7.comer', es: 'comer', en: 'to eat', pos: 'verb', hook: 'Root of "comestible" — edible.' },
    { id: 'u7.como', es: 'como', en: 'I eat', pos: 'verb', note: 'Identical to *cómo* (how) minus the accent. Context sorts it out.' },
    { id: 'u7.vivir', es: 'vivir', en: 'to live', pos: 'verb', hook: 'Root of "vivid", "survive", "revive", "vivacious".' },
    { id: 'u7.vivo', es: 'vivo', en: 'I live', pos: 'verb' },
    { id: 'u7.trabajar', es: 'trabajar', en: 'to work', pos: 'verb', hook: 'From Latin *tripalium*, a three-pronged torture device. Spanish speakers have been making this joke for centuries.' },
    { id: 'u7.trabajo', es: 'trabajo', en: 'I work', pos: 'verb', note: 'Also a noun: *el trabajo*, the job.' },
    { id: 'u7.estudiar', es: 'estudiar', en: 'to study', pos: 'verb' },
    { id: 'u7.necesitar', es: 'necesitar', en: 'to need', pos: 'verb' },
    { id: 'u7.necesito', es: 'necesito', en: 'I need', pos: 'verb', rank: 160, note: 'Enormously useful. "Necesito ayuda" — I need help.' },
    { id: 'u7.tomar', es: 'tomar', en: 'to take', enAlt: ['to drink'], pos: 'verb', note: 'Also means "to drink" — *tomar un café* is more common than *beber un café*.' },
    { id: 'u7.beber', es: 'beber', en: 'to drink', pos: 'verb', hook: 'Root of "beverage" and "imbibe".' },
    { id: 'u7.escribir', es: 'escribir', en: 'to write', pos: 'verb', hook: 'Root of "scribe", "describe", "manuscript".' },
    { id: 'u7.aprender', es: 'aprender', en: 'to learn', pos: 'verb', hook: 'Root of "apprentice".' },
    { id: 'u7.buscar', es: 'buscar', en: 'to look for', pos: 'verb', note: 'The "for" is built in. Never say *buscar para*.' },
    { id: 'u7.el-espanol', es: 'el español', en: 'Spanish (the language)', pos: 'noun', gender: 'm', note: 'Lowercase — Spanish does not capitalise languages or nationalities.' },
    { id: 'u7.el-ingles', es: 'el inglés', en: 'English (the language)', pos: 'noun', gender: 'm' },
    { id: 'u7.en', es: 'en', en: 'in', enAlt: ['on', 'at'], pos: 'prep', rank: 6 },
    { id: 'u7.que', es: 'qué', en: 'what', pos: 'pron', rank: 14 },
    { id: 'u7.porque', es: 'porque', en: 'because', pos: 'conj', note: '*Porque* is "because". *¿Por qué?* — two words, with accent — is "why".' },
    { id: 'u7.por-que', es: '¿por qué?', en: 'why?', pos: 'phrase' },
    { id: 'u7.siempre', es: 'siempre', en: 'always', pos: 'adv', hook: 'Root of "sempiternal". *Siempre* + *verde* gives us "evergreen".' },
    { id: 'u7.nunca', es: 'nunca', en: 'never', pos: 'adv' },
    { id: 'u7.a-veces', es: 'a veces', en: 'sometimes', pos: 'phrase', literal: 'at times' },
  ],

  sentences: [
    { id: 'u7.s1', es: 'Hablo un poco de español.', en: 'I speak a little Spanish.', uses: ['u7.hablo', 'u7.el-espanol'], cloze: 'Hablo' },
    { id: 'u7.s2', es: '¿Habla usted inglés?', en: 'Do you speak English?', uses: ['u7.hablar', 'u7.el-ingles'], cloze: 'Habla' },
    { id: 'u7.s3', es: 'Vivo en los Estados Unidos.', en: 'I live in the United States.', uses: ['u7.vivo', 'u7.en'], cloze: 'Vivo en' },
    { id: 'u7.s4', es: 'Necesito ayuda, por favor.', en: 'I need help, please.', uses: ['u7.necesito'], cloze: 'Necesito' },
    { id: 'u7.s5', es: 'Estudio español porque quiero hablar con mi familia.', en: 'I study Spanish because I want to talk with my family.', uses: ['u7.estudiar', 'u7.porque', 'u7.hablar'], cloze: 'porque' },
    { id: 'u7.s6', es: 'Comemos a las dos.', en: 'We eat at two.', uses: ['u7.comer'], cloze: 'Comemos' },
    { id: 'u7.s7', es: '¿Qué necesita usted?', en: 'What do you need?', uses: ['u7.que', 'u7.necesitar'], cloze: '¿Qué necesita' },
    { id: 'u7.s8', es: 'Trabajo mucho, pero aprendo poco.', en: 'I work a lot, but I learn little.', uses: ['u7.trabajo', 'u7.aprender'], cloze: 'aprendo' },
    { id: 'u7.s9', es: 'A veces tomo café en la mañana.', en: 'Sometimes I drink coffee in the morning.', uses: ['u7.a-veces', 'u7.tomar'], cloze: 'A veces' },
    { id: 'u7.s10', es: 'Busco el mercado.', en: 'I am looking for the market.', uses: ['u7.buscar'], cloze: 'Busco' },
    { id: 'u7.s11', es: 'Siempre hablamos español en casa.', en: 'We always speak Spanish at home.', uses: ['u7.siempre', 'u7.hablar'], cloze: 'Siempre' },
  ],
};
