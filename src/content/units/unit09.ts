import type { Unit } from '../types';

export const unit09: Unit = {
  id: 'u9',
  n: 9,
  title: 'Talking about later',
  canDo: 'Say what you are going to do, today, tomorrow, or next week — without learning a future tense.',
  scenario: 'Making plans, telling a taxi where you are headed, saying when you will be back.',

  grammar: [
    {
      id: 'u9.g.ir',
      title: 'ir a + infinitive — the future tense you get for free',
      summary:
        'Spanish has a real future tense. You do not need it. **Voy a + verb** covers almost everything a beginner wants to say about the future, exactly like English "I am going to".',
      body: [
        'The forms of *ir* (to go): **voy, vas, va, vamos, van**. They look nothing like the infinitive, because *ir* is stitched together from three different Latin verbs. Memorise them as a block and move on.',
        'Then: **person + a + infinitive**. *Voy a comer* — I am going to eat. *Vamos a hablar* — we are going to talk. *Va a llover* — it is going to rain. The second verb never changes; it stays in its dictionary form.',
        'This is the same construction English uses, which makes it one of the rare places where translating word-for-word actually works. Take advantage of it.',
        'The real future tense (*comeré*, *hablaré*) exists and you will meet it later. In everyday Mexican speech *voy a* is more common anyway, so learning it first is not a shortcut you pay for later — it is what people actually say.',
        '**Vamos** does double duty: "we go", "we are going", and "let\'s go". *¡Vamos!* on its own is "let\'s go" — and *vamos a comer* can mean either "we are going to eat" or "let\'s eat", with tone deciding.',
        'One quirk: *ir* almost always wants **a** after it. "Voy a la tienda", not "voy la tienda". And remember *a + el = al*: "voy al mercado".',
      ],
      examples: [
        { es: 'Voy a comer.', en: 'I am going to eat.', hl: 'Voy a' },
        { es: 'Vamos al centro mañana.', en: 'We are going downtown tomorrow.', hl: 'Vamos al' },
        { es: '¿Va a tomar café?', en: 'Are you going to have coffee?', hl: 'Va a' },
        { es: 'Voy a necesitar un taxi.', en: 'I am going to need a taxi.', hl: 'Voy a necesitar' },
        { es: '¡Vamos!', en: "Let's go!", hl: 'Vamos' },
      ],
      hook: '*Ir*, *voy*, and *fui* (I went) come from three unrelated Latin verbs — *ire*, *vadere*, and *esse*. English does the same thing with "go" and "went", where "went" was originally the past tense of "wend". Both languages ended up with a patchwork verb for the same reason: the commonest words resist tidying up.',
      pitfall:
        'Do not conjugate the second verb. "Voy a como" is wrong — it is always *voy a comer*. The infinitive stays untouched.',
    },
  ],

  items: [
    { id: 'u9.ir', es: 'ir', en: 'to go', pos: 'verb', rank: 70 },
    { id: 'u9.voy', es: 'voy', en: 'I go', enAlt: ['I am going'], pos: 'verb' },
    { id: 'u9.vas', es: 'vas', en: 'you go (informal)', pos: 'verb', register: 'informal' },
    { id: 'u9.va', es: 'va', en: 'he/she goes', enAlt: ['you go (formal)'], pos: 'verb' },
    { id: 'u9.vamos', es: 'vamos', en: "we go", enAlt: ["let's go", 'we are going'], pos: 'verb', note: 'Also "let\'s go" on its own.' },
    { id: 'u9.van', es: 'van', en: 'they go', pos: 'verb' },
    { id: 'u9.voy-a', es: 'voy a', en: 'I am going to', pos: 'phrase', note: 'Followed by an infinitive. Your entire future tense.' },
    { id: 'u9.manana', es: 'mañana', en: 'tomorrow', pos: 'adv', note: 'Also "morning". *Hasta mañana* — see you tomorrow.' },
    { id: 'u9.ahora', es: 'ahora', en: 'now', pos: 'adv', hook: 'From *hac hora*, "at this hour". *Ahorita* in Mexico means anything from "right now" to "eventually" — a famously elastic word.' },
    { id: 'u9.despues', es: 'después', en: 'after', enAlt: ['afterwards', 'later'], pos: 'adv' },
    { id: 'u9.luego', es: 'luego', en: 'later', pos: 'adv', note: 'As in *hasta luego*.' },
    { id: 'u9.esta-noche', es: 'esta noche', en: 'tonight', pos: 'phrase', literal: 'this night' },
    { id: 'u9.la-semana', es: 'la semana', en: 'the week', pos: 'noun', gender: 'f', hook: 'From Latin *septimana*, "the seven" — the seven-day set.' },
    { id: 'u9.el-dia', es: 'el día', en: 'the day', pos: 'noun', gender: 'm', note: 'Masculine despite the -a. One of the classic exceptions.' },
    { id: 'u9.proximo', es: 'próximo', en: 'next', pos: 'adj', hook: 'Root of "proximity", "approximate" — the nearest one.' },
    { id: 'u9.temprano', es: 'temprano', en: 'early', pos: 'adv' },
    { id: 'u9.tarde-adv', es: 'tarde', en: 'late', pos: 'adv', note: 'Same word as "afternoon". Root of English "tardy".' },
    { id: 'u9.el-lunes', es: 'el lunes', en: 'Monday', pos: 'noun', gender: 'm', hook: 'Moon-day, exactly like English. *Luna* → lunes, Moon → Monday. The whole week matches: Mars/martes, Mercury/miércoles, Jupiter/jueves, Venus/viernes.' },
    { id: 'u9.el-viernes', es: 'el viernes', en: 'Friday', pos: 'noun', gender: 'm', hook: 'Venus-day. English swapped in the Norse goddess Frigg for the same slot.' },
    { id: 'u9.el-sabado', es: 'el sábado', en: 'Saturday', pos: 'noun', gender: 'm', hook: 'From "Sabbath" — the two days Spanish did not name after planets are the two the Church renamed.' },
    { id: 'u9.el-domingo', es: 'el domingo', en: 'Sunday', pos: 'noun', gender: 'm', hook: 'From *dies dominicus*, "the Lord\'s day".' },
    { id: 'u9.regresar', es: 'regresar', en: 'to come back', enAlt: ['to return'], pos: 'verb', note: '*Regreso a las seis* — I am back at six.' },
    { id: 'u9.salir', es: 'salir', en: 'to leave', enAlt: ['to go out'], pos: 'verb', note: 'Irregular in the *yo* form: *salgo*. Exit signs say **SALIDA**.' },
    { id: 'u9.llegar', es: 'llegar', en: 'to arrive', pos: 'verb' },
  ],

  sentences: [
    { id: 'u9.s1', es: 'Voy a comer ahora.', en: 'I am going to eat now.', uses: ['u9.voy-a', 'u9.ahora'], cloze: 'Voy a' },
    { id: 'u9.s2', es: 'Vamos al centro mañana.', en: 'We are going downtown tomorrow.', uses: ['u9.vamos', 'u9.manana'], cloze: 'Vamos al' },
    { id: 'u9.s3', es: '¿Va a tomar café?', en: 'Are you going to have coffee?', uses: ['u9.va'], cloze: '¿Va a' },
    { id: 'u9.s4', es: 'Voy a necesitar un taxi.', en: 'I am going to need a taxi.', uses: ['u9.voy-a'], cloze: 'Voy a necesitar' },
    { id: 'u9.s5', es: 'Regreso el lunes.', en: 'I come back on Monday.', uses: ['u9.regresar', 'u9.el-lunes'], cloze: 'el lunes' },
    { id: 'u9.s6', es: 'El tren sale temprano.', en: 'The train leaves early.', uses: ['u9.salir', 'u9.temprano'], cloze: 'temprano' },
    { id: 'u9.s7', es: 'Esta noche vamos a un restaurante.', en: 'Tonight we are going to a restaurant.', uses: ['u9.esta-noche', 'u9.vamos'], cloze: 'Esta noche' },
    { id: 'u9.s8', es: 'La próxima semana voy a México.', en: 'Next week I am going to Mexico.', uses: ['u9.proximo', 'u9.la-semana', 'u9.voy'], cloze: 'La próxima semana' },
    { id: 'u9.s9', es: '¿A qué hora llega el autobús?', en: 'What time does the bus arrive?', uses: ['u9.llegar'], cloze: 'llega' },
    { id: 'u9.s10', es: 'Vamos, es tarde.', en: 'Let\'s go, it is late.', uses: ['u9.vamos', 'u9.tarde-adv'], cloze: 'Vamos' },
    { id: 'u9.s11', es: 'Voy a estudiar español el sábado.', en: 'I am going to study Spanish on Saturday.', uses: ['u9.voy-a', 'u9.el-sabado'], cloze: 'el sábado' },
  ],
};
