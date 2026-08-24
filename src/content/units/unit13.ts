import type { Unit } from '../types.ts';

export const unit13: Unit = {
  id: 'u13',
  n: 13,
  title: 'Your day, and the se you have been saying since day one',
  canDo: 'Describe your daily routine, say how you feel, and finally understand what the se in "me llamo" and "¿cómo se dice?" was doing.',
  scenario:
    'Telling someone what your day looks like. Excusing yourself. Reading a sign that says what is done here rather than who does it.',

  grammar: [
    {
      id: 'u13.g.reflexive',
      title: 'When the verb comes back to you',
      summary:
        'Some verbs point back at their own subject. *Levantar* is to lift something; **levantarse** is to lift yourself — to get up. The pronoun is what makes the difference.',
      body: [
        'You have been using one of these since your first lesson without being told. *Me llamo Juan* is not "my name is Juan" — it is **I call myself Juan**. That stray *me* was a reflexive pronoun all along.',
        'The set: **me** (myself) · **te** (yourself) · **se** (himself, herself, yourself formal) · **nos** (ourselves). The same little words as the object pronouns, with *se* added.',
        'They sit in front of the conjugated verb, exactly like object pronouns: *me levanto*, *te levantas*, *se levanta*, *nos levantamos*. In the dictionary the verb carries *-se* on the end — *levantarse* — which is how you know it is one of these.',
        'The pairing is often not reflexive in English at all, which is why it has to be learned verb by verb rather than reasoned out. *Irse* is "to leave", not "to go oneself". *Quedarse* is "to stay". *Sentirse* is "to feel".',
        'And a genuinely useful contrast: *voy* is "I go", but **me voy** is "I am leaving" — the difference between announcing a destination and announcing an exit.',
      ],
      examples: [
        { es: 'Me levanto a las seis.', en: 'I get up at six.', hl: 'Me levanto' },
        { es: 'Se llama María.', en: 'Her name is María.', hl: 'Se llama' },
        { es: 'Me voy, es tarde.', en: 'I am leaving, it is late.', hl: 'Me voy' },
        { es: 'Nos quedamos aquí.', en: 'We are staying here.', hl: 'Nos quedamos' },
      ],
      hook: 'English keeps a few of these fossils: you "help yourself", "behave yourself", "perjure yourself". Spanish never trimmed the pattern back, so it stayed productive.',
      pitfall:
        'Do not drop the pronoun. *Llamo María* means "I call María" — you are phoning her. *Me llamo María* is your name. One word apart.',
    },
    {
      id: 'u13.g.impersonal-se',
      title: 'The se that means "you" in general',
      summary:
        '**¿Cómo se dice?** is not about anyone in particular. This *se* means "one", "people", or an unnamed "you" — the sign-and-instruction voice of Spanish.',
      body: [
        'Spanish uses *se* + a third-person verb where English reaches for the passive or for a vague "you". *Se habla español* — Spanish is spoken here. *¿Cómo se dice?* — how does one say it. *Aquí no se puede fumar* — you cannot smoke here.',
        'It is everywhere on signs, menus and instructions, precisely because it names no one. That is often the point: the rule exists, and who made it is not the subject.',
        'The verb agrees with the thing, not with a person: *se habla español* (one language), *se hablan dos idiomas* (two languages). The same backwards agreement you met with *gustar*.',
        'When you do not know a word, this is the construction that saves you: **¿Cómo se llama esto?** — what is this called? Point at the thing and ask. It works in every shop in the country.',
      ],
      examples: [
        { es: '¿Cómo se llama esto?', en: 'What is this called?', hl: 'se llama' },
        { es: 'Aquí se habla español.', en: 'Spanish is spoken here.', hl: 'se habla' },
        { es: '¿Cómo se dice en español?', en: 'How do you say it in Spanish?', hl: 'se dice' },
        { es: 'Se puede pagar con tarjeta.', en: 'You can pay by card.', hl: 'Se puede' },
      ],
      pitfall:
        'This *se* never takes a subject. "Se habla español" has no hidden "he" in it — resist the urge to supply one.',
    },
    {
      id: 'u13.g.stem-change',
      title: 'The vowel that stretches under stress',
      summary:
        'You have now met *puedo*, *entiendo*, *prefiero*, *quiero* and *me acuesto*. They are all one rule: when the stress lands on the stem vowel, **o** becomes **ue** and **e** becomes **ie**.',
      body: [
        'Look at what these verbs have in common. *Poder* → *puedo*. *Entender* → *entiendo*. *Acostarse* → *me acuesto*. The infinitive is calm; the moment the stress moves onto that vowel, it breaks in two.',
        'That is not irregularity so much as physics. Latin had short vowels that could not hold a stressed syllable on their own, so speakers spread them into a diphthong. Unstressed, they had no reason to change — which is exactly what you see.',
        'So the *nosotros* form never changes: the stress falls on the ending instead. Puedo, puedes, puede — but **podemos**. Entiendo, entiendes, entiende — but **entendemos**. That is the tell.',
        'Once you have seen it, a large share of what looked like a hundred irregular verbs collapses into two patterns. When you meet a new verb and the stem vowel is *o* or *e*, expect this and check.',
      ],
      examples: [
        { es: 'Puedo, pero no podemos.', en: 'I can, but we cannot.', hl: 'Puedo' },
        { es: 'Me acuesto tarde.', en: 'I go to bed late.', hl: 'acuesto' },
        { es: 'Me despierto temprano.', en: 'I wake up early.', hl: 'despierto' },
        { es: 'Prefiero el pollo.', en: 'I prefer the chicken.', hl: 'Prefiero' },
      ],
      hook: 'Italian did the same thing — *posso* / *puoi* — and French did it and then buried the result under spelling reform. Spanish is the one that wears it plainly.',
      pitfall:
        'Do not carry the change into *nosotros*. "Nosotros puedemos" is wrong; it is *podemos*, with the stem left alone.',
    },
  ],

  items: [
    { id: 'u13.se-refl', es: 'se', en: 'himself/herself', enAlt: ['yourself (formal)', 'oneself'], pos: 'pron', note: 'Also the impersonal "one" in *se habla español*.' },
    { id: 'u13.llamarse', es: 'llamarse', en: 'to be called', pos: 'verb', literal: 'to call oneself' },
    { id: 'u13.se-llama', es: 'se llama', en: 'his/her name is', enAlt: ['it is called'], pos: 'phrase' },
    { id: 'u13.como-se-llama-esto', es: '¿cómo se llama esto?', en: 'what is this called?', pos: 'phrase', lifeline: true, note: 'Point and ask. The fastest way to learn a noun in the wild.' },
    { id: 'u13.levantarse', es: 'levantarse', en: 'to get up', pos: 'verb', literal: 'to lift oneself' },
    { id: 'u13.me-levanto', es: 'me levanto', en: 'I get up', pos: 'phrase' },
    { id: 'u13.despertarse', es: 'despertarse', en: 'to wake up', pos: 'verb' },
    { id: 'u13.me-despierto', es: 'me despierto', en: 'I wake up', pos: 'phrase', note: 'Stem stretches: *e* → *ie*.' },
    { id: 'u13.acostarse', es: 'acostarse', en: 'to go to bed', pos: 'verb' },
    { id: 'u13.me-acuesto', es: 'me acuesto', en: 'I go to bed', pos: 'phrase', note: 'Stem stretches: *o* → *ue*.' },
    { id: 'u13.ducharse', es: 'ducharse', en: 'to take a shower', pos: 'verb' },
    { id: 'u13.me-ducho', es: 'me ducho', en: 'I take a shower', pos: 'phrase' },
    { id: 'u13.sentirse', es: 'sentirse', en: 'to feel', pos: 'verb', note: 'About your own state. *Me siento bien* — I feel well.' },
    { id: 'u13.me-siento', es: 'me siento', en: 'I feel', enAlt: ['I sit down'], pos: 'phrase', note: 'Does double duty: from *sentirse* it is "I feel", from *sentarse* it is "I sit down". Context decides, and nobody is confused in practice.' },
    { id: 'u13.como-se-siente', es: '¿cómo se siente?', en: 'how are you feeling?', pos: 'phrase', register: 'formal', note: 'Warmer and more specific than *¿cómo está?* — you are asking about right now.' },
    { id: 'u13.sentarse', es: 'sentarse', en: 'to sit down', pos: 'verb' },
    { id: 'u13.sientese', es: 'siéntese', en: 'sit down', pos: 'verb', register: 'formal', note: 'What you are told in a waiting room. *Siéntese, por favor.*' },
    { id: 'u13.irse', es: 'irse', en: 'to leave', pos: 'verb', note: 'Not "to go oneself". Leaving, departing.' },
    { id: 'u13.me-voy', es: 'me voy', en: 'I am leaving', pos: 'phrase', note: 'The polite way to break off a conversation. *Bueno, me voy.*' },
    { id: 'u13.quedarse', es: 'quedarse', en: 'to stay', pos: 'verb' },
    { id: 'u13.me-quedo', es: 'me quedo', en: 'I am staying', pos: 'phrase', note: 'In a shop, *me lo quedo* is "I will take it".' },
    { id: 'u13.desayunar', es: 'desayunar', en: 'to have breakfast', pos: 'verb', literal: 'to un-fast', hook: 'Exactly the same idea as English "breakfast": *des-* undoes *ayuno*, the fast.' },
    { id: 'u13.la-cama', es: 'la cama', en: 'the bed', pos: 'noun', gender: 'f' },
    { id: 'u13.la-casa', es: 'la casa', en: 'the house', enAlt: ['home'], pos: 'noun', gender: 'f', note: '*En casa* — at home, no article. *A casa* — homewards.' },
    { id: 'u13.el-trabajo', es: 'el trabajo', en: 'the job', enAlt: ['work'], pos: 'noun', gender: 'm', note: 'Same shape as *trabajo*, "I work" — the noun takes an article, the verb does not.' },
    { id: 'u13.todos-los-dias', es: 'todos los días', en: 'every day', pos: 'phrase' },
    { id: 'u13.por-la-manana', es: 'por la mañana', en: 'in the morning', pos: 'phrase', note: '*Por* for a stretch of time, not *en*.' },
    { id: 'u13.por-la-noche', es: 'por la noche', en: 'at night', pos: 'phrase' },
    { id: 'u13.antes', es: 'antes', en: 'before', pos: 'adv', hook: 'Root of "ante-", as in "antecedent" — what comes in front.' },
    { id: 'u13.primero', es: 'primero', en: 'first', pos: 'adv', enAlt: ['firstly'] },
  ],

  sentences: [
    { id: 'u13.s1', es: 'Me levanto a las seis.', en: 'I get up at six.', uses: ['u13.me-levanto', 'u5.seis'], cloze: 'Me levanto' },
    { id: 'u13.s2', es: 'Se llama María.', en: 'Her name is María.', uses: ['u13.se-llama'], cloze: 'Se llama' },
    { id: 'u13.s3', es: '¿Cómo se llama esto?', en: 'What is this called?', uses: ['u13.como-se-llama-esto'], cloze: 'se llama' },
    { id: 'u13.s4', es: 'Me voy, es tarde.', en: 'I am leaving, it is late.', uses: ['u13.me-voy', 'u9.tarde-adv'], cloze: 'Me voy' },
    { id: 'u13.s5', es: 'Me acuesto tarde todos los días.', en: 'I go to bed late every day.', uses: ['u13.me-acuesto', 'u13.todos-los-dias'], cloze: 'Me acuesto' },
    { id: 'u13.s6', es: 'Me ducho por la mañana.', en: 'I take a shower in the morning.', uses: ['u13.me-ducho', 'u13.por-la-manana'], cloze: 'por la mañana' },
    { id: 'u13.s7', es: 'Aquí se habla español.', en: 'Spanish is spoken here.', uses: ['u13.se-refl', 'u7.hablar', 'u3.aqui'], cloze: 'se habla' },
    { id: 'u13.s8', es: 'Me siento mal.', en: 'I feel bad.', uses: ['u13.me-siento', 'u3.mal'], cloze: 'Me siento' },
    { id: 'u13.s9', es: 'Me quedo en el hotel.', en: 'I am staying at the hotel.', uses: ['u13.me-quedo', 'u3.el-hotel'], cloze: 'Me quedo' },
    { id: 'u13.s10', es: 'Siéntese, por favor.', en: 'Sit down, please.', uses: ['u13.sientese', 'u1.por-favor'], cloze: 'Siéntese' },
    { id: 'u13.s11', es: 'Primero desayuno, después trabajo.', en: 'First I have breakfast, then I work.', uses: ['u13.primero', 'u13.desayunar', 'u9.despues', 'u7.trabajo'], cloze: 'Primero' },
    { id: 'u13.s12', es: 'Se puede pagar con tarjeta.', en: 'You can pay by card.', uses: ['u10.puede', 'u10.pagar', 'u5.la-tarjeta'], cloze: 'Se puede' },
    { id: 'u13.s13', es: 'No me despierto temprano.', en: 'I do not wake up early.', uses: ['u13.me-despierto', 'u9.temprano'], cloze: 'me despierto' },
  ],
};
