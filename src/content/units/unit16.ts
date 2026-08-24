import type { Unit } from '../types.ts';

export const unit16: Unit = {
  id: 'u16',
  n: 16,
  title: 'Keeping a conversation going',
  canDo: 'Hold up your end of a real conversation — react, agree, ask back, and talk about the weather, your family and where you are from.',
  scenario:
    'The twenty minutes after the transaction is over and someone is still talking to you. Everything you know is useless if you cannot keep the exchange alive.',

  grammar: [
    {
      id: 'u16.g.weather',
      title: 'The weather is made, not been',
      summary:
        'Spanish does not say "it is hot". It says **hace calor** — it makes heat. The verb is *hacer*, the noun is the weather, and the frame never changes.',
      body: [
        '*Hace calor* (it is hot) · *hace frío* (it is cold) · *hace sol* (it is sunny) · *hace viento* (it is windy). One frame, and you swap the noun.',
        'Rain and snow are different: they get their own verbs. **Llueve** — it is raining. **Nieva** — it is snowing. One word, no subject, because there is nothing doing the raining.',
        'Now the contrast that matters. **Tengo frío** is "I am cold" — you, personally. **Hace frío** is "it is cold" — the world. Both use nouns where English uses adjectives, but they are not interchangeable, and mixing them up produces a sentence that is grammatical and wrong.',
        'You now have three different verbs where English uses "to be": *ser* for what things are, *estar* for how they are, *tener* for how you feel, and *hacer* for the weather. That is four, in fact, and this is the last of them.',
      ],
      examples: [
        { es: 'Hace mucho calor.', en: 'It is very hot.', hl: 'Hace' },
        { es: 'Hace frío hoy.', en: 'It is cold today.', hl: 'Hace frío' },
        { es: 'Tengo frío.', en: 'I am cold.', hl: 'Tengo frío' },
        { es: 'Llueve mucho aquí.', en: 'It rains a lot here.', hl: 'Llueve' },
      ],
      pitfall:
        '"Estoy caliente" does not mean you are warm. It means something else entirely, and the correct sentence is *tengo calor*. This one is worth getting right the first time.',
    },
    {
      id: 'u16.g.que-exclamation',
      title: '¡Qué…! — one frame, every reaction',
      summary:
        'Put **qué** in front of almost any adjective or noun and you have an exclamation. *¡Qué bien!* *¡Qué rico!* *¡Qué lástima!* No verb needed.',
      body: [
        'English needs a whole sentence to react — "that is wonderful", "what a shame". Spanish needs two words, and they are the two words that make you sound like you are actually in the conversation rather than translating it.',
        'With an adjective: *¡Qué bueno!* (great), *¡Qué caro!* (how expensive), *¡Qué interesante!* With a noun: *¡Qué lástima!* (what a shame), *¡Qué suerte!* (what luck).',
        'No article. English says "what **a** shame"; Spanish drops it. *¡Qué lástima!* — never "¡Qué una lástima!".',
        'These are the cheapest fluency you will ever buy. Learn six of them and you can respond to anything anyone tells you, appropriately, without understanding every word they said. That is not a trick — it is what listening actually looks like before comprehension is complete.',
      ],
      examples: [
        { es: '¡Qué bien!', en: 'How nice!', hl: 'Qué bien' },
        { es: '¡Qué lástima!', en: 'What a shame!', hl: 'Qué lástima' },
        { es: '¡Qué rico!', en: 'How delicious!', hl: 'Qué rico' },
        { es: '¡Qué caro!', en: 'How expensive!', hl: 'Qué caro' },
      ],
      hook: 'The accent on *qué* marks it as the exclaiming-and-asking one. Unaccented *que* is the plain "that" in *creo que*. Same three letters, different jobs, and the mark is how Spanish keeps them apart on the page.',
    },
    {
      id: 'u16.g.keeping-going',
      title: 'Answer, then hand it back',
      summary:
        'The whole mechanic of small talk is two moves: say your bit, then return the question. **¿Y usted?** is the most useful two words in this unit.',
      body: [
        'You already have everything you need to answer. What ends conversations early is not a missing word — it is a full stop. *Bien, gracias.* And then silence, because the other person has no opening.',
        'Add the return and it keeps going: Bien, gracias. **¿Y usted?** Or: Soy de los Estados Unidos. **¿Y usted, de dónde es?**',
        'Three reactions buy you time and signal that you are listening: **¿De verdad?** (really?), **Claro** (of course, right), **Entonces…** (so then…). None of them requires you to have understood everything.',
        'And when you genuinely did not follow: *Perdón, ¿puede repetir?* You learned that on day one for a reason. Using it is not a failure — it is the normal repair move that native speakers make with each other constantly.',
        'The single most common opening question about a person is **¿A qué se dedica?** — what do you do. More natural than *¿Cuál es su trabajo?*, and it is what you will actually be asked.',
      ],
      examples: [
        { es: 'Bien, gracias. ¿Y usted?', en: 'Fine, thanks. And you?', hl: '¿Y usted?' },
        { es: '¿De verdad?', en: 'Really?', hl: 'De verdad' },
        { es: '¿A qué se dedica?', en: 'What do you do for a living?', hl: 'A qué se dedica' },
        { es: 'Claro, por supuesto.', en: 'Of course, absolutely.', hl: 'Claro' },
      ],
      pitfall:
        'Do not answer questions with one word and stop. A bare *sí* reads as a closed door in Spanish just as it does in English — add something, or hand the question back.',
    },
  ],

  items: [
    { id: 'u16.que-tal', es: '¿qué tal?', en: 'how is it going?', pos: 'phrase', note: 'Lighter than *¿cómo está?* — usable with almost anyone, in almost any situation.' },
    { id: 'u16.y-tu', es: '¿y tú?', en: 'and you?', pos: 'phrase', register: 'informal', note: 'The formal version, *¿y usted?*, you met in the first unit.' },
    { id: 'u16.el-clima', es: 'el clima', en: 'the weather', pos: 'noun', gender: 'm', note: 'Masculine despite the *-a*, like *el día* and *el problema*. All three are Greek imports.' },
    { id: 'u16.hace-calor', es: 'hace calor', en: 'it is hot', pos: 'phrase', literal: 'it makes heat' },
    { id: 'u16.hace-frio', es: 'hace frío', en: 'it is cold', pos: 'phrase', literal: 'it makes cold', note: 'About the world. *Tengo frío* is about you.' },
    { id: 'u16.hace-sol', es: 'hace sol', en: 'it is sunny', pos: 'phrase', literal: 'it makes sun' },
    { id: 'u16.llueve', es: 'llueve', en: 'it is raining', pos: 'verb', note: 'Also "it rains". No subject — nothing is doing it.' },
    { id: 'u16.de-verdad', es: '¿de verdad?', en: 'really?', pos: 'phrase', lifeline: true, note: 'Buys you a second and shows you are listening.' },
    { id: 'u16.que-bien', es: '¡qué bien!', en: 'how nice!', pos: 'phrase' },
    { id: 'u16.que-lastima', es: '¡qué lástima!', en: 'what a shame!', pos: 'phrase', note: 'No article. Never "¡qué una lástima!".' },
    { id: 'u16.claro', es: 'claro', en: 'of course', enAlt: ['sure', 'right'], pos: 'adv', hook: 'Literally "clear" — the same move as English "clearly". Root of "clarity" and "declare".' },
    { id: 'u16.por-supuesto', es: 'por supuesto', en: 'of course', pos: 'phrase', literal: 'for supposed', note: 'Slightly more emphatic than *claro*.' },
    { id: 'u16.depende', es: 'depende', en: 'it depends', pos: 'verb' },
    { id: 'u16.entonces', es: 'entonces', en: 'so', enAlt: ['then'], pos: 'adv', note: 'The filler that keeps a sentence moving while you think.' },
    { id: 'u16.a-que-se-dedica', es: '¿a qué se dedica?', en: 'what do you do for a living?', pos: 'phrase', register: 'formal', note: 'What you will actually be asked. More natural than asking about *trabajo* directly.' },
    { id: 'u16.los-padres', es: 'los padres', en: 'the parents', pos: 'noun', gender: 'm', note: 'A masculine plural covers a mixed group — the same reason *los hijos* means children of both kinds.' },
    { id: 'u16.la-madre', es: 'la madre', en: 'the mother', pos: 'noun', gender: 'f', hook: 'Latin *mater*. The *m-* word for mother turns up in nearly every language family, probably because it is the easiest sound an infant makes.' },
    { id: 'u16.el-padre', es: 'el padre', en: 'the father', pos: 'noun', gender: 'm', hook: 'Latin *pater* — root of "paternal", "patron", "patriot".' },
    { id: 'u16.el-hermano', es: 'el hermano', en: 'the brother', pos: 'noun', gender: 'm', hook: 'From Latin *germanus*, "of the same parents" — the root also behind "germane".' },
    { id: 'u16.la-hermana', es: 'la hermana', en: 'the sister', pos: 'noun', gender: 'f' },
    { id: 'u16.la-ciudad', es: 'la ciudad', en: 'the city', pos: 'noun', gender: 'f', hook: 'Latin *civitas* — root of "city", "civic", "citizen".' },
    { id: 'u16.el-pais', es: 'el país', en: 'the country', pos: 'noun', gender: 'm' },
    { id: 'u16.la-gente', es: 'la gente', en: 'the people', pos: 'noun', gender: 'f', note: 'Singular in Spanish. *La gente es muy amable* — the people are very kind.' },
    { id: 'u16.grande', es: 'grande', en: 'big', pos: 'adj', note: 'Shortens to *gran* before any singular noun, and then means "great": *una gran ciudad*.' },
    { id: 'u16.pequeno', es: 'pequeño', en: 'small', pos: 'adj' },
    { id: 'u16.bonito', es: 'bonito', en: 'pretty', enAlt: ['nice', 'lovely'], pos: 'adj', note: 'Safe for places, things and weather. *Qué bonito* works as a compliment on almost anything.' },
    { id: 'u16.amable', es: 'amable', en: 'kind', pos: 'adj', hook: 'Literally "loveable" — from *amar*. *Muy amable* is how you thank someone for a small kindness.' },
    { id: 'u16.la-vez', es: 'la vez', en: 'the time (occasion)', pos: 'noun', gender: 'f', note: 'Not the clock. *Otra vez* — again, which you already know.' },
    { id: 'u16.primera-vez', es: 'la primera vez', en: 'the first time', pos: 'phrase', note: '*Es mi primera vez aquí* — the sentence that explains everything about you at once.' },
    { id: 'u16.cuanto-tiempo', es: '¿cuánto tiempo?', en: 'how long?', pos: 'phrase', note: '*¿Cuánto tiempo está aquí?* — how long are you here for?' },
  ],

  sentences: [
    { id: 'u16.s1', es: 'Hace mucho calor hoy.', en: 'It is very hot today.', uses: ['u16.hace-calor', 'u5.mucho', 'u3.hoy'], cloze: 'Hace' },
    { id: 'u16.s2', es: 'Bien, gracias. ¿Y usted?', en: 'Fine, thanks. And you?', uses: ['u1.bien', 'u1.gracias', 'u1.y-usted'], cloze: '¿Y usted?' },
    { id: 'u16.s3', es: '¿De verdad? ¡Qué bien!', en: 'Really? How nice!', uses: ['u16.de-verdad', 'u16.que-bien'], cloze: 'Qué bien' },
    { id: 'u16.s4', es: '¿A qué se dedica?', en: 'What do you do for a living?', uses: ['u16.a-que-se-dedica'], cloze: 'se dedica' },
    { id: 'u16.s5', es: 'Es mi primera vez aquí.', en: 'It is my first time here.', uses: ['u16.primera-vez', 'u2.mi', 'u3.aqui'], cloze: 'primera vez' },
    { id: 'u16.s6', es: 'Mis padres viven en una ciudad pequeña.', en: 'My parents live in a small city.', uses: ['u16.los-padres', 'u16.la-ciudad', 'u16.pequeno'], cloze: 'Mis padres' },
    { id: 'u16.s7', es: 'Tengo un hermano y una hermana.', en: 'I have a brother and a sister.', uses: ['u16.el-hermano', 'u16.la-hermana', 'u8.tengo'], cloze: 'un hermano y una hermana' },
    { id: 'u16.s8', es: 'La gente aquí es muy amable.', en: 'The people here are very kind.', uses: ['u16.la-gente', 'u16.amable', 'u3.aqui'], cloze: 'La gente' },
    { id: 'u16.s9', es: 'Llueve mucho aquí.', en: 'It rains a lot here.', uses: ['u16.llueve', 'u5.mucho', 'u3.aqui'], cloze: 'Llueve' },
    { id: 'u16.s10', es: 'Claro, por supuesto.', en: 'Of course, absolutely.', uses: ['u16.claro', 'u16.por-supuesto'], cloze: 'por supuesto' },
    { id: 'u16.s11', es: 'Depende del tiempo.', en: 'It depends on the weather.', uses: ['u16.depende', 'u6.del', 'u8.el-tiempo'], cloze: 'Depende' },
    { id: 'u16.s12', es: '¡Qué lástima!', en: 'What a shame!', uses: ['u16.que-lastima'], cloze: 'lástima' },
    { id: 'u16.s13', es: 'Entonces, ¿va a regresar?', en: 'So, are you going to come back?', uses: ['u16.entonces', 'u9.va', 'u9.regresar'], cloze: 'Entonces' },
    { id: 'u16.s14', es: 'Es una ciudad muy bonita.', en: 'It is a very pretty city.', uses: ['u16.la-ciudad', 'u16.bonito'], cloze: 'bonita' },
    { id: 'u16.s15', es: '¿Cuánto tiempo está aquí?', en: 'How long are you here for?', uses: ['u16.cuanto-tiempo', 'u3.esta'], cloze: 'Cuánto tiempo' },
  ],
};
