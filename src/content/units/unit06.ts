import type { Unit } from '../types.ts';

export const unit06: Unit = {
  id: 'u6',
  n: 6,
  title: 'Getting where you are going',
  canDo: 'Ask for directions and understand the answer you get back.',
  scenario: 'Lost on a street corner, or getting a taxi to the right place.',

  grammar: [
    {
      id: 'u6.g.contractions',
      title: 'The only two contractions in Spanish',
      summary:
        '**a + el = al** and **de + el = del**. That is the complete list. Spanish has exactly two, both mandatory, and neither has an apostrophe.',
      body: [
        'English contractions are optional and casual — "do not" and "don\'t" are both fine. These two are neither optional nor casual. Writing "a el mercado" is simply an error.',
        'They only fire with the masculine singular **el**. *A la estación* stays as it is. *De las tiendas* stays as it is. Only *el* fuses.',
        'They also do not fire with *él* (he), because that is a different word wearing an accent: "el regalo es de él" — the gift is from him.',
      ],
      examples: [
        { es: 'Voy al mercado.', en: 'I am going to the market.', hl: 'al' },
        { es: 'Vengo del hotel.', en: 'I am coming from the hotel.', hl: 'del' },
        { es: 'Voy a la estación.', en: 'I am going to the station.', hl: 'a la' },
      ],
    },
    {
      id: 'u6.g.commands',
      title: 'Directions come back as commands — you only need to understand them',
      summary:
        'When you ask the way, the answer arrives as instructions: *siga, tome, dé vuelta, cruce*. Recognising these matters far more than producing them.',
      body: [
        'This is worth stating plainly because it changes how you should study this unit. There is a real difference between vocabulary you need to *say* and vocabulary you need to *recognise*, and treating them identically wastes your ten minutes.',
        'You will produce roughly three sentences here: *¿dónde está X?*, *¿cómo llego a X?*, and *estoy perdido*. Everything else in this unit is listening.',
        'The forms you will hear, all *usted* commands: **siga** (continue), **tome** (take), **dé vuelta** (turn), **cruce** (cross), **camine** (walk), **baje** (get off).',
        'In Mexico "turn right" is normally *dé vuelta a la derecha*. Spain says *gire*. You will also hear *derecho* meaning "straight ahead" — which sounds almost exactly like *derecha*, "right". Context and a pointed finger will save you, but this pair genuinely catches people out.',
        'A practical tactic: ask, then repeat the key part back. "¿A la derecha?" They will confirm or correct. This converts a wall of fast Spanish into a yes-or-no question you can actually handle.',
      ],
      examples: [
        { es: 'Siga derecho.', en: 'Keep going straight.', hl: 'Siga derecho' },
        { es: 'Dé vuelta a la derecha.', en: 'Turn right.', hl: 'Dé vuelta' },
        { es: 'Tome el metro.', en: 'Take the metro.', hl: 'Tome' },
        { es: 'Está a dos cuadras.', en: 'It is two blocks away.', hl: 'dos cuadras' },
      ],
      pitfall:
        '*Derecho* = straight ahead. *Derecha* = right. One letter, opposite instructions. If you are unsure, point and ask "¿derecho?" while gesturing forward.',
    },
  ],

  items: [
    { id: 'u6.como-llego', es: '¿cómo llego a...?', en: 'how do I get to...?', pos: 'phrase', note: 'Your main production sentence for this unit.' },
    { id: 'u6.la-derecha', es: 'a la derecha', en: 'to the right', pos: 'phrase', hook: 'Same root as "direct", "dexterous" — Latin *dexter*, the right hand.' },
    { id: 'u6.la-izquierda', es: 'a la izquierda', en: 'to the left', pos: 'phrase', hook: 'One of the very few Basque words in Spanish, from *ezkerra*. Basque predates Latin in Iberia by thousands of years and is related to no other living language.' },
    { id: 'u6.derecho', es: 'derecho', en: 'straight ahead', pos: 'adv', note: 'Dangerously close to *derecha* (right). Listen for the final vowel.' },
    { id: 'u6.la-calle', es: 'la calle', en: 'the street', pos: 'noun', gender: 'f', note: 'Two l\'s: "KAH-yay".' },
    { id: 'u6.la-esquina', es: 'la esquina', en: 'the corner', pos: 'noun', gender: 'f' },
    { id: 'u6.la-cuadra', es: 'la cuadra', en: 'the block', pos: 'noun', gender: 'f', hook: 'Literally "a square" — root of "quadrant". Mexican cities were laid out on grids, so blocks are the unit of distance.' },
    { id: 'u6.el-mercado', es: 'el mercado', en: 'the market', pos: 'noun', gender: 'm', hook: 'Root of "market", "merchant", "commerce".' },
    { id: 'u6.la-estacion', es: 'la estación', en: 'the station', pos: 'noun', gender: 'f', note: 'The *-ción* ending is always feminine, and always matches English *-tion*.' },
    { id: 'u6.el-aeropuerto', es: 'el aeropuerto', en: 'the airport', pos: 'noun', gender: 'm', hook: '*Puerto* is "port" — an airport is an air-port, built the same way in both languages.' },
    { id: 'u6.la-parada', es: 'la parada', en: 'the bus stop', pos: 'noun', gender: 'f', note: 'From *parar*, to stop. A military "parade" is the same root — a formation halted for inspection.' },
    { id: 'u6.el-taxi', es: 'el taxi', en: 'the taxi', pos: 'noun', gender: 'm' },
    { id: 'u6.el-metro', es: 'el metro', en: 'the subway', enAlt: ['the metro'], pos: 'noun', gender: 'm' },
    { id: 'u6.el-centro', es: 'el centro', en: 'downtown', enAlt: ['the centre', 'the center'], pos: 'noun', gender: 'm' },
    { id: 'u6.la-tienda', es: 'la tienda', en: 'the shop', enAlt: ['the store'], pos: 'noun', gender: 'f' },
    { id: 'u6.la-farmacia', es: 'la farmacia', en: 'the pharmacy', pos: 'noun', gender: 'f' },
    { id: 'u6.siga', es: 'siga', en: 'keep going', enAlt: ['continue', 'follow'], pos: 'verb', register: 'formal', note: 'Recognise it. You will not need to say it.' },
    { id: 'u6.tome', es: 'tome', en: 'take', pos: 'verb', register: 'formal', note: 'As in "tome el metro". Recognition only.' },
    { id: 'u6.de-vuelta', es: 'dé vuelta', en: 'turn', pos: 'phrase', register: 'formal', note: 'The Mexican phrasing. Spain says *gire*.' },
    { id: 'u6.al', es: 'al', en: 'to the (masculine)', pos: 'prep', literal: 'a + el' },
    { id: 'u6.del', es: 'del', en: 'from the (masculine)', pos: 'prep', literal: 'de + el' },
    { id: 'u6.estoy-perdido', es: 'estoy perdido', en: 'I am lost', pos: 'phrase', note: 'A woman says *perdida*. Say this and people will help you — it reliably opens doors.', lifeline: true },
    { id: 'u6.esta-lejos', es: '¿está lejos?', en: 'is it far?', pos: 'phrase', note: 'A yes-or-no question, which is much easier to survive than an open one.' },
    { id: 'u6.entre', es: 'entre', en: 'between', pos: 'prep', hook: 'Root of "entrance", "enter", "between".' },
    { id: 'u6.enfrente', es: 'enfrente de', en: 'across from', enAlt: ['opposite', 'in front of'], pos: 'prep', hook: '*Frente* is "forehead" or "front" — root of "affront", "confront".' },
  ],

  sentences: [
    { id: 'u6.s1', es: '¿Cómo llego al centro?', en: 'How do I get downtown?', uses: ['u6.como-llego', 'u6.al', 'u6.el-centro'], cloze: '¿Cómo llego' },
    { id: 'u6.s2', es: 'Estoy perdido.', en: 'I am lost.', uses: ['u6.estoy-perdido'], cloze: 'perdido' },
    { id: 'u6.s3', es: '¿Dónde está la farmacia?', en: 'Where is the pharmacy?', uses: ['u6.la-farmacia'], cloze: 'la farmacia' },
    { id: 'u6.s4', es: 'Siga derecho dos cuadras.', en: 'Keep going straight for two blocks.', uses: ['u6.siga', 'u6.derecho', 'u6.la-cuadra'], cloze: 'Siga derecho' },
    { id: 'u6.s5', es: 'Dé vuelta a la izquierda en la esquina.', en: 'Turn left at the corner.', uses: ['u6.de-vuelta', 'u6.la-izquierda', 'u6.la-esquina'], cloze: 'a la izquierda' },
    { id: 'u6.s6', es: '¿Está lejos el aeropuerto?', en: 'Is the airport far?', uses: ['u6.esta-lejos', 'u6.el-aeropuerto'], cloze: '¿Está lejos' },
    { id: 'u6.s7', es: 'El mercado está enfrente del hotel.', en: 'The market is across from the hotel.', uses: ['u6.el-mercado', 'u6.enfrente', 'u6.del'], cloze: 'enfrente del' },
    { id: 'u6.s8', es: 'Tome el metro al centro.', en: 'Take the metro downtown.', uses: ['u6.tome', 'u6.el-metro', 'u6.al'], cloze: 'al centro' },
    { id: 'u6.s9', es: 'La parada está en la esquina.', en: 'The bus stop is on the corner.', uses: ['u6.la-parada', 'u6.la-esquina'], cloze: 'La parada' },
    { id: 'u6.s10', es: 'Quisiera un taxi al aeropuerto.', en: 'I would like a taxi to the airport.', uses: ['u6.el-taxi', 'u6.al', 'u6.el-aeropuerto'], cloze: 'al aeropuerto' },
  ],
};
