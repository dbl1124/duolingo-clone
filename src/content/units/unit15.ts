import type { Unit } from '../types.ts';

export const unit15: Unit = {
  id: 'u15',
  n: 15,
  title: 'Markets, shops, and actually eating well',
  canDo: 'Buy things by name, ask what something costs and whether there is a cheaper one, and read a menu without guessing.',
  scenario:
    'A market stall, a bakery, a shop where nothing has a price on it. Ordering a meal you actually want rather than the one word you recognised.',

  grammar: [
    {
      id: 'u15.g.este-ese',
      title: 'This one, that one',
      summary:
        '**Este** is the one near you. **Ese** is the one near them. Both agree with the noun: *este pan*, *esta fruta*, *estos huevos*, *esas verduras*.',
      body: [
        'In a market this is most of what you need. You do not have to name the thing — you point and say *este* or *ese*, and the transaction proceeds.',
        'The forms: **este / esta / estos / estas** for what is near you. **ese / esa / esos / esas** for what is near the person you are talking to.',
        'On its own, with no noun after it, the neutral form is **esto** — "this thing, whatever it is". That is the one in *¿cómo se llama esto?*, and it is the form to use when you genuinely do not know what you are pointing at.',
        'Spanish has a third set — *aquel*, for things far from both of you. You will hear it. You do not need to produce it, and leaving it out costs you nothing.',
      ],
      examples: [
        { es: 'Quiero este.', en: 'I want this one.', hl: 'este' },
        { es: 'Esta fruta es muy rica.', en: 'This fruit is delicious.', hl: 'Esta' },
        { es: '¿Cuánto cuesta ese?', en: 'How much is that one?', hl: 'ese' },
        { es: '¿Cómo se llama esto?', en: 'What is this called?', hl: 'esto' },
      ],
      pitfall:
        'Agreement follows the noun, not the distance. *Esta cerveza* even though beer has nothing feminine about it — *cerveza* is the feminine word, so *esta* it is.',
    },
    {
      id: 'u15.g.comparing',
      title: 'More, less, and cheaper',
      summary:
        'One frame covers all comparison: **más … que** for more, **menos … que** for less. *Más barato que ese* — cheaper than that one.',
      body: [
        'English has two ways to compare — "cheaper" and "more expensive" — and no rule for which verb takes which. Spanish has one: *más* in front of the adjective, every time. *Más barato*, *más caro*, *más grande*, *más interesante*. There is no separate comparative form to learn.',
        'Add *que* for what you are comparing against: *Este es más barato que ese.*',
        'For the most, add an article: *el más barato* — the cheapest. *La mejor comida* — the best food.',
        'The exceptions are the two you already know. *Mejor* is "better" — never "más bueno". *Peor* is "worse". Two irregulars in the whole system, and English has the same two.',
        'In a shop, the sentence that does the most work is **¿Tiene algo más barato?** — do you have anything cheaper. It is a complete, polite negotiation in four words.',
      ],
      examples: [
        { es: 'Es más barato.', en: 'It is cheaper.', hl: 'más barato' },
        { es: '¿Tiene algo más barato?', en: 'Do you have anything cheaper?', hl: 'más barato' },
        { es: 'Este es más caro que ese.', en: 'This one is more expensive than that one.', hl: 'más caro que' },
        { es: 'Es la mejor comida de México.', en: 'It is the best food in Mexico.', hl: 'la mejor' },
      ],
      pitfall:
        'Do not say "más bueno" or "más malo". Those are *mejor* and *peor*, exactly as English refuses "more good".',
    },
    {
      id: 'u15.g.eria',
      title: 'The suffix that tells you where things are sold',
      summary:
        'Take a product, add **-ería**, and you have the shop that sells it. *Pan* → **panadería**. *Carne* → **carnicería**. *Libro* → **librería**. You already know *farmacia*.',
      body: [
        'This is the single best return on effort available to an adult learner, because it turns vocabulary you already have into vocabulary you did not know you had.',
        '*Pan* (bread) → *panadería*. *Carne* (meat) → *carnicería*. *Fruta* → *frutería*. *Zapato* (shoe) → *zapatería*. *Taco* → *taquería*, which you have seen on signs without needing it explained.',
        'The person who works there usually ends in **-ero** or **-era**: *panadero*, *carnicero*, *mesero* (waiter, from *mesa*).',
        'English has the same machinery — bakery, brewery, creamery — from the same Latin suffix, arriving via French. You are not learning a new rule so much as being handed a key to a lock you already own.',
        'It will not work every single time, and native speakers will understand you regardless. Guessing *fruteria* and being gently corrected costs nothing; not guessing costs you the word.',
      ],
      examples: [
        { es: 'Voy a la panadería.', en: 'I am going to the bakery.', hl: 'panadería' },
        { es: 'La carnicería está cerca.', en: 'The butcher shop is nearby.', hl: 'carnicería' },
        { es: 'Es una taquería muy buena.', en: 'It is a very good taco place.', hl: 'taquería' },
      ],
      hook: 'The suffix is Latin *-aria*, "the place concerned with". It reached English through Norman French as *-ery*, which is why "bakery" and *panadería* are cousins built from different words for bread.',
    },
  ],

  items: [
    { id: 'u15.comprar', es: 'comprar', en: 'to buy', pos: 'verb', rank: 60 },
    { id: 'u15.compre', es: 'compré', en: 'I bought', pos: 'verb' },
    { id: 'u15.mas', es: 'más', en: 'more', pos: 'adv', note: 'Also builds every comparison: *más barato*, *más caro*.' },
    { id: 'u15.el-pan', es: 'el pan', en: 'the bread', pos: 'noun', gender: 'm', hook: 'Latin *panis*. Survives in English "company" — literally the people you share bread with.' },
    { id: 'u15.el-pescado', es: 'el pescado', en: 'the fish', pos: 'noun', gender: 'm', note: 'The fish you eat. A fish still swimming is *un pez*.' },
    { id: 'u15.las-verduras', es: 'las verduras', en: 'the vegetables', pos: 'noun', gender: 'f', hook: 'From *verde*, green — the green things.' },
    { id: 'u15.la-fruta', es: 'la fruta', en: 'the fruit', pos: 'noun', gender: 'f' },
    { id: 'u15.el-arroz', es: 'el arroz', en: 'the rice', pos: 'noun', gender: 'm', hook: 'From Arabic *ar-ruzz*. Eight centuries of Al-Andalus left Spanish around a thousand Arabic words, and most of them start with the *al-* or *a-* that was the Arabic article.' },
    { id: 'u15.los-frijoles', es: 'los frijoles', en: 'the beans', pos: 'noun', gender: 'm', note: 'Mexican usage. Spain says *judías*, elsewhere *porotos*.' },
    { id: 'u15.el-queso', es: 'el queso', en: 'the cheese', pos: 'noun', gender: 'm', hook: 'Latin *caseus* — the same root that gave English "cheese" through a different door.' },
    { id: 'u15.los-huevos', es: 'los huevos', en: 'the eggs', pos: 'noun', gender: 'm' },
    { id: 'u15.la-leche', es: 'la leche', en: 'the milk', pos: 'noun', gender: 'f', hook: 'Latin *lac* — root of "lactose" and "galaxy", the milky way.' },
    { id: 'u15.el-desayuno', es: 'el desayuno', en: 'breakfast', pos: 'noun', gender: 'm' },
    { id: 'u15.el-almuerzo', es: 'el almuerzo', en: 'lunch', pos: 'noun', gender: 'm', note: 'In Mexico the big meal of the day, eaten mid-afternoon rather than at noon.' },
    { id: 'u15.la-cena', es: 'la cena', en: 'dinner', pos: 'noun', gender: 'f', note: 'Later and lighter than an English dinner. Nine o\'clock is normal.' },
    { id: 'u15.picante', es: 'picante', en: 'spicy', pos: 'adj', hook: 'From *picar*, to sting or peck — the same picture as English "piquant".' },
    { id: 'u15.caro', es: 'caro', en: 'expensive', pos: 'adj' },
    { id: 'u15.barato', es: 'barato', en: 'cheap', pos: 'adj', note: '*¿Tiene algo más barato?* is the whole negotiation in four words.' },
    { id: 'u15.probar', es: 'probar', en: 'to try', enAlt: ['to taste'], pos: 'verb', note: 'Tasting food and trying on clothes are the same verb. *¿Puedo probar?*' },
    { id: 'u15.me-lo-llevo', es: 'me lo llevo', en: "I'll take it", pos: 'phrase', literal: 'I carry it off for myself', note: 'What you say once you have decided. Two pronouns stacked up, exactly as the placement rule predicts.' },
    { id: 'u15.la-bolsa', es: 'la bolsa', en: 'the bag', pos: 'noun', gender: 'f', note: '*¿Me da una bolsa?* — could I have a bag.' },
    { id: 'u15.el-kilo', es: 'el kilo', en: 'the kilo', pos: 'noun', gender: 'm', note: 'Markets sell by the kilo. *Medio kilo* is half. A kilo is about two and a quarter pounds.' },
    { id: 'u15.medio', es: 'medio', en: 'half', pos: 'adj', note: 'The same *medio* as in *y media* for telling the time.' },
    { id: 'u15.demasiado', es: 'demasiado', en: 'too much', pos: 'adv' },
    { id: 'u15.otro', es: 'otro', en: 'another', pos: 'det', note: 'Never takes *un*. "Otro café", not "un otro café" — the *un* is already inside it.' },
    { id: 'u15.este', es: 'este', en: 'this one', pos: 'det', note: '*Esta* for a feminine noun, *esto* when you have no idea what it is.' },
    { id: 'u15.ese', es: 'ese', en: 'that one', pos: 'det', note: 'The one nearer to whoever you are talking to.' },
    { id: 'u15.la-panaderia', es: 'la panadería', en: 'the bakery', pos: 'noun', gender: 'f', hook: '*Pan* plus *-ería*, the place-where-it-is-sold suffix. The same machinery as English "bakery".' },
    { id: 'u15.el-mesero', es: 'el mesero', en: 'the waiter', pos: 'noun', gender: 'm', note: 'From *mesa*, table. To call one over: *¡Joven!* or a raised hand, never a snap of the fingers.' },
  ],

  sentences: [
    { id: 'u15.s1', es: '¿Cuánto cuesta el kilo?', en: 'How much is a kilo?', uses: ['u4.cuanto-cuesta', 'u15.el-kilo'], cloze: 'el kilo' },
    { id: 'u15.s2', es: '¿Tiene algo más barato?', en: 'Do you have anything cheaper?', uses: ['u8.tiene', 'u15.mas', 'u15.barato'], cloze: 'más barato' },
    { id: 'u15.s3', es: 'Es demasiado caro.', en: 'It is too expensive.', uses: ['u15.demasiado', 'u15.caro'], cloze: 'demasiado' },
    { id: 'u15.s4', es: 'Me lo llevo.', en: 'I will take it.', uses: ['u15.me-lo-llevo'], cloze: 'Me lo llevo' },
    { id: 'u15.s5', es: 'Quiero medio kilo de queso.', en: 'I want half a kilo of cheese.', uses: ['u4.quiero', 'u15.medio', 'u15.el-queso'], cloze: 'medio kilo' },
    { id: 'u15.s6', es: '¿Es muy picante?', en: 'Is it very spicy?', uses: ['u15.picante', 'u3.muy'], cloze: 'picante' },
    { id: 'u15.s7', es: 'Compré pan en la panadería.', en: 'I bought bread at the bakery.', uses: ['u15.compre', 'u15.el-pan', 'u15.la-panaderia'], cloze: 'Compré' },
    { id: 'u15.s8', es: 'Para mí, el pescado.', en: 'For me, the fish.', uses: ['u4.para', 'u15.el-pescado'], cloze: 'el pescado' },
    { id: 'u15.s9', es: '¿Puedo probar?', en: 'Can I try it?', uses: ['u10.puedo', 'u15.probar'], cloze: 'probar' },
    { id: 'u15.s10', es: 'Quiero este, por favor.', en: 'I want this one, please.', uses: ['u15.este', 'u4.quiero', 'u1.por-favor'], cloze: 'este' },
    { id: 'u15.s11', es: 'La cena es a las nueve.', en: 'Dinner is at nine.', uses: ['u15.la-cena', 'u5.nueve'], cloze: 'La cena' },
    { id: 'u15.s12', es: '¿Me da una bolsa?', en: 'Could I have a bag?', uses: ['u4.me-da', 'u15.la-bolsa'], cloze: 'una bolsa' },
    { id: 'u15.s13', es: 'Otro café, por favor.', en: 'Another coffee, please.', uses: ['u15.otro', 'u4.el-cafe'], cloze: 'Otro' },
    { id: 'u15.s14', es: 'Los huevos con frijoles son muy ricos.', en: 'The eggs with beans are delicious.', uses: ['u15.los-huevos', 'u15.los-frijoles', 'u4.rico'], cloze: 'con frijoles' },
  ],
};
