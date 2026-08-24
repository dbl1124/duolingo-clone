import type { Unit } from '../types.ts';

export const unit12: Unit = {
  id: 'u12',
  n: 12,
  title: 'What you like, and what you think',
  canDo: 'Say what you like, love, prefer and think — and ask someone else the same, which is how a conversation gets past small talk.',
  scenario:
    'Dinner with people you have just met. Choosing between two things. Being asked your opinion and having somewhere to go with it.',

  grammar: [
    {
      id: 'u12.g.gustar',
      title: 'gustar runs backwards',
      summary:
        '*Me gusta el café* does not mean "I like coffee" word for word. It means **coffee is pleasing to me**. The thing you like is the subject; you are the one it happens to.',
      body: [
        'Take the English sentence apart: "I like coffee". *I* is doing the liking. Spanish flips it — the coffee does the pleasing, and *me* is on the receiving end. That is why the pronoun comes first and never changes shape.',
        'So the verb agrees with **the thing**, not with you:',
        '**Me gusta el café** — coffee (one thing) pleases me. **Me gustan los tacos** — tacos (several things) please me.',
        'Swap the pronoun to change whose opinion it is, and the verb sits still: *me gusta*, *te gusta*, *le gusta*, *nos gusta*. Only the little word in front moves.',
        'When what you like is an action, use the infinitive and stay singular: *me gusta viajar*, *me gusta cocinar*. Even for two actions — *me gusta leer y cocinar* — it stays *gusta*.',
        'To be clear about who, put the person out front with **a**: *A mi esposa le gusta el pescado.* The *le* still has to be there. Spanish says it twice and does not consider that a redundancy.',
      ],
      examples: [
        { es: 'Me gusta el café.', en: 'I like coffee.', hl: 'Me gusta' },
        { es: 'Me gustan los tacos.', en: 'I like tacos.', hl: 'Me gustan' },
        { es: '¿Le gusta México?', en: 'Do you like Mexico?', hl: 'Le gusta' },
        { es: 'No me gusta esperar.', en: 'I do not like waiting.', hl: 'No me gusta' },
        { es: 'Nos gusta mucho.', en: 'We like it a lot.', hl: 'Nos gusta' },
      ],
      hook: 'English used to work this way too. "Methinks" is "it seems to me", and "if it please you" survives in "please" itself. Spanish simply never gave the construction up.',
      pitfall:
        'Never say "yo gusto". That means *I* am the pleasing one — you have told the room you are attractive. The sentence you want is *me gusta*.',
    },
    {
      id: 'u12.g.softening',
      title: 'Saying it more gently',
      summary:
        'Spanish has a whole gear for softening. **Me gustaría** instead of *quiero*, **creo que** in front of an opinion — the difference between sounding blunt and sounding like a person.',
      body: [
        '*Quiero un café* is perfectly grammatical and slightly abrupt, the way "I want a coffee" is in English. **Me gustaría un café** — I would like a coffee — is the version you use with a stranger. You already met its cousin *quisiera* in the restaurant unit; they are interchangeable.',
        'For opinions, lead with **creo que** — I think that. *Creo que es muy bueno.* It costs you two words and turns a pronouncement into a contribution.',
        'The *que* is not optional. English drops it — "I think it is good" — but Spanish keeps it: *creo que es bueno*. Leaving it out is one of the surer signs of a translated sentence.',
        'To disagree without a confrontation: *Creo que no* — I think not. And to agree: *Creo que sí*. Two of the most useful three-word answers in the language.',
      ],
      examples: [
        { es: 'Me gustaría un café.', en: 'I would like a coffee.', hl: 'Me gustaría' },
        { es: 'Creo que es muy bueno.', en: 'I think it is very good.', hl: 'Creo que' },
        { es: 'Creo que sí.', en: 'I think so.', hl: 'Creo que sí' },
        { es: 'Prefiero el pollo.', en: 'I prefer the chicken.', hl: 'Prefiero' },
      ],
      pitfall:
        'Do not drop *que*. "Creo es bueno" is not a sentence — the *que* is load-bearing in Spanish in a way it is not in English.',
    },
    {
      id: 'u12.g.adj-agree',
      title: 'Adjectives that agree, and two that do not',
      summary:
        'An adjective ending in **-o** changes to match: *bueno, buena, buenos, buenas*. One ending in **-e** or a consonant — *interesante*, *difícil* — usually only adds **-s** for plural.',
      body: [
        'You have been doing this since *cansado / cansada*. The rule generalises: *-o* adjectives have four forms, most others have two.',
        '**bueno** → bueno, buena, buenos, buenas. **interesante** → interesante, interesantes. **fácil** → fácil, fáciles.',
        'The agreement follows the noun, not you: *la comida es buena* even if the person saying it is a man. It is the food that is being described.',
        'One group breaks the second half of that rule, and it is a group you use constantly: **nationalities**. An adjective of nationality ending in a consonant *does* take **-a** in the feminine. *Español* → **española**. *Inglés* → **inglesa**, losing its accent on the way. *Alemán* → **alemana**. So it is *una mujer española*, never "una mujer español".',
        'Nationalities ending in *-e* behave normally and never change: *estadounidense* covers everyone.',
        '*Bueno* and *malo* drop their *-o* in front of a masculine singular noun: **un buen restaurante**, **un mal día**. Only there, and only for those two — this is worth knowing because you will hear it constantly.',
      ],
      examples: [
        { es: 'La comida es buena.', en: 'The food is good.', hl: 'buena' },
        { es: 'Es un buen libro.', en: 'It is a good book.', hl: 'buen' },
        { es: 'Es muy interesante.', en: 'It is very interesting.', hl: 'interesante' },
        { es: 'No es difícil.', en: 'It is not difficult.', hl: 'difícil' },
      ],
      pitfall:
        '*Bien* and *bueno* are not interchangeable. *Bien* describes how something is done — *habla bien*. *Bueno* describes a thing — *es bueno*. "Es bien" is wrong.',
    },
  ],

  items: [
    { id: 'u12.gustar', es: 'gustar', en: 'to be pleasing', enAlt: ['to like'], pos: 'verb', note: 'Listed in dictionaries as "to like", but it behaves as "to please".' },
    { id: 'u12.me-gusta', es: 'me gusta', en: 'I like (it)', pos: 'phrase', literal: 'it pleases me' },
    { id: 'u12.me-gustan', es: 'me gustan', en: 'I like (them)', pos: 'phrase', literal: 'they please me', note: 'Plural because the *things* are plural, not because you are.' },
    { id: 'u12.no-me-gusta', es: 'no me gusta', en: 'I do not like (it)', pos: 'phrase', note: 'The *no* goes at the very front, before the pronoun.' },
    { id: 'u12.te-gusta', es: 'te gusta', en: 'you like (it)', pos: 'phrase', register: 'informal' },
    { id: 'u12.le-gusta', es: 'le gusta', en: 'he/she likes (it)', enAlt: ['you like (it, formal)'], pos: 'phrase' },
    { id: 'u12.me-encanta', es: 'me encanta', en: 'I love (it)', pos: 'phrase', literal: 'it enchants me', hook: 'Literally "it enchants me" — same root as English "enchant" and "incantation". Spanish reserves *amar* for people and uses enchantment for everything else.' },
    { id: 'u12.me-gustaria', es: 'me gustaría', en: 'I would like', pos: 'phrase', note: 'The polite way to order or ask. Interchangeable with *quisiera*.' },
    { id: 'u12.preferir', es: 'preferir', en: 'to prefer', pos: 'verb' },
    { id: 'u12.prefiero', es: 'prefiero', en: 'I prefer', pos: 'verb', note: 'Same *e* → *ie* stretch as *entiendo*.' },
    { id: 'u12.creer', es: 'creer', en: 'to believe', enAlt: ['to think'], pos: 'verb', hook: 'Latin *credere* — the root of "credit", "credible" and "creed".' },
    { id: 'u12.creo', es: 'creo', en: 'I think', enAlt: ['I believe'], pos: 'verb' },
    { id: 'u12.creo-que', es: 'creo que', en: 'I think that', pos: 'phrase', note: 'The *que* is required even though English drops it.' },
    { id: 'u12.creo-que-si', es: 'creo que sí', en: 'I think so', pos: 'phrase' },
    { id: 'u12.la-musica', es: 'la música', en: 'the music', pos: 'noun', gender: 'f' },
    { id: 'u12.la-pelicula', es: 'la película', en: 'the movie', enAlt: ['the film'], pos: 'noun', gender: 'f', hook: 'From Latin *pellicula*, "little skin" — the film in the photographic sense, then the thing shown on it.' },
    { id: 'u12.el-libro', es: 'el libro', en: 'the book', pos: 'noun', gender: 'm', hook: 'Latin *liber*, the inner bark of a tree — what people wrote on before paper. Same root as "library".' },
    { id: 'u12.viajar', es: 'viajar', en: 'to travel', pos: 'verb', hook: 'Same root as "voyage" — Latin *via*, a road.' },
    { id: 'u12.cocinar', es: 'cocinar', en: 'to cook', pos: 'verb' },
    { id: 'u12.bailar', es: 'bailar', en: 'to dance', pos: 'verb' },
    { id: 'u12.leer', es: 'leer', en: 'to read', pos: 'verb', hook: 'Latin *legere*, "to gather" then "to read" — the root of "legible" and "lecture".' },
    { id: 'u12.escuchar', es: 'escuchar', en: 'to listen', pos: 'verb' },
    { id: 'u12.bueno', es: 'bueno', en: 'good', pos: 'adj', note: 'Becomes *buen* before a masculine noun: *un buen día*.' },
    { id: 'u12.malo', es: 'malo', en: 'bad', pos: 'adj', note: 'Becomes *mal* before a masculine noun: *un mal día*.' },
    { id: 'u12.mejor', es: 'mejor', en: 'better', enAlt: ['best'], pos: 'adj', note: 'One word for both. *El mejor* is "the best".' },
    { id: 'u12.interesante', es: 'interesante', en: 'interesting', pos: 'adj' },
    { id: 'u12.aburrido', es: 'aburrido', en: 'boring', pos: 'adj', note: 'With *estar* it flips to "bored": *estoy aburrido* is how you feel, *es aburrido* is what it is.' },
    { id: 'u12.dificil', es: 'difícil', en: 'difficult', pos: 'adj' },
    { id: 'u12.facil', es: 'fácil', en: 'easy', pos: 'adj', hook: 'Root of "facile" and "facility" — Latin *facilis*, easy to do.' },
    { id: 'u12.favorito', es: 'favorito', en: 'favourite', pos: 'adj' },
  ],

  sentences: [
    { id: 'u12.s1', es: 'Me gusta el café.', en: 'I like coffee.', uses: ['u12.me-gusta', 'u4.el-cafe'], cloze: 'Me gusta' },
    { id: 'u12.s2', es: 'Me gustan los tacos.', en: 'I like tacos.', uses: ['u12.me-gustan', 'u4.el-taco'], cloze: 'gustan' },
    { id: 'u12.s3', es: 'No me gusta esperar.', en: 'I do not like waiting.', uses: ['u12.no-me-gusta', 'u11.esperar'], cloze: 'No me gusta' },
    { id: 'u12.s4', es: '¿Le gusta la comida mexicana?', en: 'Do you like Mexican food?', uses: ['u12.le-gusta', 'u4.la-comida', 'u2.mexicana'], cloze: 'Le gusta' },
    { id: 'u12.s5', es: 'Me encanta viajar.', en: 'I love to travel.', uses: ['u12.me-encanta', 'u12.viajar'], cloze: 'Me encanta' },
    { id: 'u12.s6', es: 'Me gustaría un café, por favor.', en: 'I would like a coffee, please.', uses: ['u12.me-gustaria', 'u1.por-favor'], cloze: 'Me gustaría' },
    { id: 'u12.s7', es: 'Creo que es muy bueno.', en: 'I think it is very good.', uses: ['u12.creo-que', 'u12.bueno', 'u3.muy'], cloze: 'Creo que' },
    { id: 'u12.s8', es: 'Prefiero el pollo.', en: 'I prefer the chicken.', uses: ['u12.prefiero', 'u4.el-pollo'], cloze: 'Prefiero' },
    { id: 'u12.s9', es: 'La película es muy interesante.', en: 'The movie is very interesting.', uses: ['u12.la-pelicula', 'u12.interesante'], cloze: 'interesante' },
    { id: 'u12.s10', es: 'No es difícil.', en: 'It is not difficult.', uses: ['u12.dificil'], cloze: 'difícil' },
    { id: 'u12.s11', es: 'Me gusta escuchar música.', en: 'I like listening to music.', uses: ['u12.me-gusta', 'u12.escuchar', 'u12.la-musica'], cloze: 'escuchar' },
    { id: 'u12.s12', es: 'Es mi libro favorito.', en: 'It is my favourite book.', uses: ['u12.el-libro', 'u12.favorito', 'u2.mi'], cloze: 'favorito' },
    { id: 'u12.s13', es: 'A mi esposa le gusta cocinar.', en: 'My wife likes to cook.', uses: ['u12.le-gusta', 'u2.esposa', 'u12.cocinar'], cloze: 'le gusta' },
  ],
};
