import type { Unit } from '../types.ts';

export const unit04: Unit = {
  id: 'u4',
  n: 4,
  title: 'Asking for things without sounding blunt',
  canDo: 'Order food and drink, ask what something costs, and ask for the bill.',
  scenario: 'A café, a taquería, a market stall.',

  grammar: [
    {
      id: 'u4.g.gender',
      title: 'Every noun is masculine or feminine, and the words around it follow',
      summary:
        'Nouns ending in **-o** are usually masculine (*el* / *un*). Nouns ending in **-a** are usually feminine (*la* / *una*). Adjectives change to match.',
      body: [
        'There is no logic to find here. A table is feminine and a book is masculine, and neither fact tells you anything about tables or books. It is a filing system, not a claim about the world — treat it as spelling.',
        'The reliable move: never learn a noun on its own. Learn **el libro**, not *libro*. The article rides along with the word and you never have to reconstruct the gender later. Every item in this app is taught with its article for exactly this reason.',
        'Endings that are reliably feminine beyond -a: **-ción**, **-sión**, **-dad**, **-tad**, **-umbre**. That covers a huge slice of the vocabulary you will meet, and it maps onto English almost perfectly — *-ción* is our *-tion*. If you know "information", you know *la información* is feminine.',
        'The exceptions worth knowing early: *el día*, *el problema*, *el mapa*, *el idioma* are masculine despite the -a. And *la mano* is feminine despite the -o.',
      ],
      examples: [
        { es: 'el café', en: 'the coffee', hl: 'el' },
        { es: 'la cuenta', en: 'the bill', hl: 'la' },
        { es: 'un taco', en: 'a taco', hl: 'un' },
        { es: 'una cerveza', en: 'a beer', hl: 'una' },
        { es: 'la información', en: 'the information', hl: 'la' },
      ],
      hook: '**El agua** looks like a broken rule — *agua* is feminine, yet takes *el*. It is a pronunciation fix, not a gender change: two stressed a-sounds colliding ("la agua") is awkward, so the article swaps. The adjective still goes feminine: *el agua fría*.',
      pitfall:
        'Getting a gender wrong is a small, forgivable error that no one will misunderstand. Skipping the article entirely is the bigger tell. Say "un café", never "café".',
    },
    {
      id: 'u4.g.politeness',
      title: 'Four ways to ask, from blunt to gracious',
      summary:
        'Textbooks teach *quiero* ("I want") first. It is grammatically correct and socially flat. Two small upgrades make you sound like an adult rather than a tourist.',
      body: [
        '**Un café, por favor.** — Just name it. This is what people actually say most of the time, and it is impossible to get wrong. Start here.',
        '**¿Me da un café, por favor?** — "Will you give me a coffee?" Warm, standard, very Mexican. This is the one to make your default.',
        '**Quisiera un café.** — "I would like a coffee." A conditional form, so it is softer than *quiero*. Ideal for anything slightly more formal or expensive.',
        '**Quiero un café.** — "I want a coffee." Not rude exactly, but bare. Fine with family; slightly abrupt with a stranger, in the same way "give me a coffee" is in English.',
        'You do not need to understand conditional conjugation to use *quisiera*. Learn it as a fixed block now; the grammar behind it arrives much later and will feel like a free gift when it does.',
      ],
      examples: [
        { es: 'Un café, por favor.', en: 'A coffee, please.', hl: 'por favor' },
        { es: '¿Me da la cuenta, por favor?', en: 'Could I have the bill, please?', hl: '¿Me da' },
        { es: 'Quisiera una cerveza.', en: 'I would like a beer.', hl: 'Quisiera' },
        { es: '¿Cuánto cuesta?', en: 'How much does it cost?', hl: 'cuesta' },
      ],
      pitfall:
        'In Mexico, waving and calling "¡Mesero!" across a restaurant reads as impatient. Catch their eye, or say *disculpe* as they pass.',
    },
  ],

  items: [
    { id: 'u4.un', es: 'un', en: 'a (masculine)', pos: 'det', rank: 10 },
    { id: 'u4.una', es: 'una', en: 'a (feminine)', pos: 'det', rank: 11 },
    { id: 'u4.el-art', es: 'el', en: 'the (masculine)', pos: 'det', rank: 1 },
    { id: 'u4.la-art', es: 'la', en: 'the (feminine)', pos: 'det', rank: 4 },
    { id: 'u4.el-agua', es: 'el agua', en: 'the water', pos: 'noun', gender: 'f', note: 'Feminine noun, masculine article. Say "el agua fría".' },
    { id: 'u4.el-cafe', es: 'un café', en: 'a coffee', pos: 'noun', gender: 'm' },
    { id: 'u4.la-cerveza', es: 'una cerveza', en: 'a beer', pos: 'noun', gender: 'f', hook: 'From Latin *cervisia*, which the Romans borrowed from a Celtic language — they were wine drinkers and took the beer word from their neighbours. Unrelated to English "beer", which is Germanic.' },
    { id: 'u4.la-cuenta', es: 'la cuenta', en: 'the bill', enAlt: ['the check'], pos: 'noun', gender: 'f', hook: 'Root of "count", "account", "counter". You are asking for the tally.' },
    { id: 'u4.la-mesa', es: 'la mesa', en: 'the table', pos: 'noun', gender: 'f', hook: 'A flat-topped hill in the American Southwest is a *mesa* — same word, borrowed whole.' },
    { id: 'u4.el-menu', es: 'el menú', en: 'the menu', pos: 'noun', gender: 'm' },
    { id: 'u4.la-comida', es: 'la comida', en: 'the food', enAlt: ['the meal', 'lunch'], pos: 'noun', gender: 'f', note: 'Also means the midday meal, which is the main one in Mexico.' },
    { id: 'u4.el-taco', es: 'un taco', en: 'a taco', pos: 'noun', gender: 'm' },
    { id: 'u4.el-pollo', es: 'el pollo', en: 'the chicken', pos: 'noun', gender: 'm', note: 'Two l\'s: "POH-yo". *Poco* is "a little" — different word, easy to confuse.' },
    { id: 'u4.la-carne', es: 'la carne', en: 'the meat', pos: 'noun', gender: 'f', hook: 'Root of "carnivore", "carnal", "chili con carne".' },
    { id: 'u4.cuanto-cuesta', es: '¿cuánto cuesta?', en: 'how much does it cost?', pos: 'phrase', rank: 150 },
    { id: 'u4.me-da', es: '¿me da...?', en: 'could I have...?', pos: 'phrase', literal: 'do you give me...?', register: 'formal', note: 'The most natural way to order anything.' },
    { id: 'u4.quisiera', es: 'quisiera', en: 'I would like', pos: 'verb', note: 'Softer than *quiero*. Use it with strangers.' },
    { id: 'u4.quiero', es: 'quiero', en: 'I want', pos: 'verb', rank: 95, note: 'Direct. Fine with friends, a little bare with a waiter.' },
    { id: 'u4.con', es: 'con', en: 'with', pos: 'prep', rank: 15 },
    { id: 'u4.sin', es: 'sin', en: 'without', pos: 'prep', hook: 'Root of "sinecure" — literally "without care".' },
    { id: 'u4.para', es: 'para', en: 'for', pos: 'prep', rank: 18, note: '"Para mí" — for me. Useful when the order is being handed out.' },
    { id: 'u4.algo-mas', es: '¿algo más?', en: 'anything else?', pos: 'phrase', note: 'You will *hear* this constantly. Answer: "nada más, gracias".' },
    { id: 'u4.nada-mas', es: 'nada más', en: 'nothing else', pos: 'phrase', literal: 'nothing more' },
    { id: 'u4.rico', es: 'rico', en: 'delicious', enAlt: ['rich', 'tasty'], pos: 'adj', gender: 'm', note: '"Está muy rico" — a compliment worth having ready.' },
    { id: 'u4.la-propina', es: 'la propina', en: 'the tip', pos: 'noun', gender: 'f', note: 'Around 10–15% in Mexico, usually left in cash.' },
    { id: 'u4.efectivo', es: 'efectivo', en: 'cash', pos: 'noun', gender: 'm', note: '"¿Aceptan tarjeta?" — do you take cards? Worth asking before you order.' },
  ],

  sentences: [
    { id: 'u4.s1', es: 'Un café, por favor.', en: 'A coffee, please.', uses: ['u4.el-cafe', 'u4.un'], cloze: 'Un café' },
    { id: 'u4.s2', es: '¿Me da la cuenta, por favor?', en: 'Could I have the bill, please?', uses: ['u4.me-da', 'u4.la-cuenta'], cloze: '¿Me da' },
    { id: 'u4.s3', es: 'Quisiera una cerveza.', en: 'I would like a beer.', uses: ['u4.quisiera', 'u4.la-cerveza'], cloze: 'Quisiera' },
    { id: 'u4.s4', es: '¿Cuánto cuesta el menú?', en: 'How much does the menu cost?', uses: ['u4.cuanto-cuesta', 'u4.el-menu'], cloze: '¿Cuánto cuesta' },
    { id: 'u4.s5', es: 'Un taco de pollo, por favor.', en: 'A chicken taco, please.', uses: ['u4.el-taco', 'u4.el-pollo'], cloze: 'de pollo' },
    { id: 'u4.s6', es: 'El agua está fría.', en: 'The water is cold.', uses: ['u4.el-agua'], cloze: 'El agua' },
    { id: 'u4.s7', es: 'Café con leche, por favor.', en: 'Coffee with milk, please.', uses: ['u4.el-cafe', 'u4.con'], cloze: 'con' },
    { id: 'u4.s8', es: 'Nada más, gracias.', en: 'Nothing else, thank you.', uses: ['u4.nada-mas'], cloze: 'Nada más' },
    { id: 'u4.s9', es: 'Está muy rico.', en: 'It is delicious.', uses: ['u4.rico'], cloze: 'muy rico' },
    { id: 'u4.s10', es: 'Una mesa para dos, por favor.', en: 'A table for two, please.', uses: ['u4.la-mesa', 'u4.para', 'u4.una'], cloze: 'para dos' },
    { id: 'u4.s11', es: 'Sin carne, por favor.', en: 'Without meat, please.', uses: ['u4.sin', 'u4.la-carne'], cloze: 'Sin carne' },
  ],
};
