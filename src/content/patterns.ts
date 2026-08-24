/**
 * Sentence patterns — the difference between knowing phrases and building them.
 *
 * The 189 fixed sentences elsewhere in this curriculum are memorised as blocks:
 * you learn "Voy a comer ahora" whole, and nothing ever forces you to assemble
 * "Vamos a estudiar el sábado" from parts. That is the gap these close. A pattern
 * is a grammatical frame with slots; every time it comes up the app fills the
 * slots differently, so the answer cannot be recalled — it has to be constructed.
 *
 * Two consequences worth stating.
 *
 * **The scheduler tracks the pattern, not the sentence.** A generated sentence is
 * disposable; the skill is the frame. So FSRS schedules "ir a + infinitive" as one
 * item, and each review produces a sentence you have never seen.
 *
 * **The curriculum stops being finite.** The `ir a` pattern alone has 5 subjects ×
 * 19 infinitives × 10 time expressions — 950 sentences from one frame.
 *
 * Correctness is the whole risk here: a generator that emits wrong Spanish is
 * worse than no generator at all. So nothing is derived by rule. Conjugations are
 * written out, agreement is explicit, and every filler names the cards it needs,
 * so a pattern can only use words you have actually met. The test suite expands
 * every combination of every pattern and checks the results structurally.
 */

/** A word or phrase that can fill a slot. */
export interface Filler {
  /** Card ids that must be known before this filler may be used. */
  requires: string[];
  es: string;
  en: string;
}

/** A place, kept split so `a + el` can contract correctly. */
export interface PlaceFiller extends Filler {
  article: 'el' | 'la';
  /** The noun without its article: "mercado", not "el mercado". */
  noun: string;
}

/** An adjective with its agreement forms written out rather than derived. */
export interface AdjectiveFiller extends Filler {
  masculine: string;
  feminine: string;
  plural: string;
}

/**
 * A noun together with the object pronoun that replaces it. The pronoun is
 * stored rather than derived: gender is a property of the Spanish word, not
 * something a rule can recover from its spelling.
 */
export interface ObjectFiller extends Filler {
  pronoun: 'lo' | 'la' | 'los' | 'las';
  plural: boolean;
}

/** Something likeable. `plural` decides gusta vs gustan, which is the whole drill. */
export interface LikeableFiller extends Filler {
  plural: boolean;
}

/** A noun carrying its article, so an adjective can be made to agree with it. */
export interface ThingFiller extends Filler {
  article: 'el' | 'la';
}

/** An adjective that also knows its English comparative — "cheaper", not "more cheap". */
export interface ComparableAdj extends AdjectiveFiller {
  enComparative: string;
}

/** A regular verb with its present-tense forms written out. */
export interface VerbFiller extends Filler {
  yo: string;
  tu: string;
  el: string;
  nosotros: string;
  /** English for he/she, which is the only form that differs. */
  enThird: string;
}

export interface Realized {
  es: string;
  en: string;
  /** Other spellings that are equally correct — see `alsoAccepted` below. */
  esAlt: string[];
}

export interface Pattern {
  id: string;
  /** Unit whose grammar this drills; gates when the pattern becomes available. */
  unitId: string;
  /** Shown above the prompt, so the learner knows which frame is being asked for. */
  title: string;
  /** A worked example, shown when the pattern is first introduced. */
  example: string;
  /** Cards needed regardless of which fillers are chosen. */
  requires: string[];
  /** Named slots and their candidate fillers. */
  slots: Record<string, Filler[]>;
  /** Builds one concrete sentence from one filler per slot. */
  build: (pick: Record<string, Filler>) => Realized;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------ shared pools -- */

/**
 * Bare infinitives that stand on their own after "voy a", "tengo que", "no puedo".
 *
 * Deliberately excludes verbs that need an object to make sense — "voy a
 * necesitar" is not a sentence anyone says. Where a verb needs one, the object is
 * baked into the filler ("tomar café") and its cards named in `requires`.
 */
const INFINITIVES: Filler[] = [
  { requires: ['u7.comer'], es: 'comer', en: 'eat' },
  { requires: ['u7.trabajar'], es: 'trabajar', en: 'work' },
  { requires: ['u7.estudiar'], es: 'estudiar', en: 'study' },
  { requires: ['u7.escribir'], es: 'escribir', en: 'write' },
  { requires: ['u7.aprender'], es: 'aprender', en: 'learn' },
  { requires: ['u10.pagar'], es: 'pagar', en: 'pay' },
  { requires: ['u10.llamar'], es: 'llamar', en: 'call' },
  { requires: ['u9.regresar'], es: 'regresar', en: 'come back' },
  { requires: ['u9.salir'], es: 'salir', en: 'leave' },
  { requires: ['u7.tomar', 'u4.el-cafe'], es: 'tomar café', en: 'have a coffee' },
  { requires: ['u7.hablar', 'u7.el-espanol'], es: 'hablar español', en: 'speak Spanish' },
  { requires: ['u12.cocinar'], es: 'cocinar', en: 'cook' },
  { requires: ['u12.viajar'], es: 'viajar', en: 'travel' },
  { requires: ['u12.bailar'], es: 'bailar', en: 'dance' },
  { requires: ['u12.leer'], es: 'leer', en: 'read' },
  { requires: ['u13.desayunar'], es: 'desayunar', en: 'have breakfast' },
  { requires: ['u15.comprar', 'u15.el-pan'], es: 'comprar pan', en: 'buy bread' },
  { requires: ['u12.escuchar', 'u12.la-musica'], es: 'escuchar música', en: 'listen to music' },
  { requires: ['u11.ver', 'u12.la-pelicula'], es: 'ver una película', en: 'watch a film' },
];

/**
 * Time expressions that can only sit in a past-tense sentence.
 *
 * Kept apart from WHEN rather than merged: "Voy a comer ayer" is exactly the
 * error a shared pool would produce, and no test would catch it because the
 * sentence is structurally perfect.
 */
const PAST_WHEN: Filler[] = [
  { requires: ['u14.ayer'], es: 'ayer', en: 'yesterday' },
  { requires: ['u14.anoche'], es: 'anoche', en: 'last night' },
  { requires: ['u14.la-semana-pasada'], es: 'la semana pasada', en: 'last week' },
  { requires: ['u3.hoy'], es: 'hoy', en: 'today' },
  { requires: ['u9.el-lunes'], es: 'el lunes', en: 'on Monday' },
  { requires: ['u9.el-sabado'], es: 'el sábado', en: 'on Saturday' },
];

const WHEN: Filler[] = [
  { requires: ['u9.manana'], es: 'mañana', en: 'tomorrow' },
  { requires: ['u3.hoy'], es: 'hoy', en: 'today' },
  { requires: ['u9.ahora'], es: 'ahora', en: 'now' },
  { requires: ['u9.esta-noche'], es: 'esta noche', en: 'tonight' },
  { requires: ['u9.despues'], es: 'después', en: 'afterwards' },
  { requires: ['u9.temprano'], es: 'temprano', en: 'early' },
  { requires: ['u9.el-lunes'], es: 'el lunes', en: 'on Monday' },
  { requires: ['u9.el-viernes'], es: 'el viernes', en: 'on Friday' },
  { requires: ['u9.el-sabado'], es: 'el sábado', en: 'on Saturday' },
  { requires: ['u9.el-domingo'], es: 'el domingo', en: 'on Sunday' },
];

const PLACES: PlaceFiller[] = [
  { requires: ['u3.el-bano'], article: 'el', noun: 'baño', es: 'el baño', en: 'the bathroom' },
  { requires: ['u3.el-hotel'], article: 'el', noun: 'hotel', es: 'el hotel', en: 'the hotel' },
  { requires: ['u6.el-mercado'], article: 'el', noun: 'mercado', es: 'el mercado', en: 'the market' },
  { requires: ['u6.la-estacion'], article: 'la', noun: 'estación', es: 'la estación', en: 'the station' },
  { requires: ['u6.el-aeropuerto'], article: 'el', noun: 'aeropuerto', es: 'el aeropuerto', en: 'the airport' },
  { requires: ['u6.la-parada'], article: 'la', noun: 'parada', es: 'la parada', en: 'the bus stop' },
  { requires: ['u6.el-centro'], article: 'el', noun: 'centro', es: 'el centro', en: 'the centre' },
  { requires: ['u6.la-tienda'], article: 'la', noun: 'tienda', es: 'la tienda', en: 'the shop' },
  { requires: ['u6.la-farmacia'], article: 'la', noun: 'farmacia', es: 'la farmacia', en: 'the pharmacy' },
  { requires: ['u10.el-hospital'], article: 'el', noun: 'hospital', es: 'el hospital', en: 'the hospital' },
  { requires: ['u15.la-panaderia'], article: 'la', noun: 'panadería', es: 'la panadería', en: 'the bakery' },
  { requires: ['u13.la-casa'], article: 'la', noun: 'casa', es: 'la casa', en: 'the house' },
];

/** Nouns concrete enough that "I want it" is a sentence someone would say. */
const OBJECTS: ObjectFiller[] = [
  { requires: ['u4.el-menu'], pronoun: 'lo', plural: false, es: 'el menú', en: 'the menu' },
  { requires: ['u4.la-cuenta'], pronoun: 'la', plural: false, es: 'la cuenta', en: 'the bill' },
  { requires: ['u10.el-pasaporte'], pronoun: 'lo', plural: false, es: 'el pasaporte', en: 'the passport' },
  { requires: ['u8.la-llave'], pronoun: 'la', plural: false, es: 'la llave', en: 'the key' },
  { requires: ['u8.el-dinero'], pronoun: 'lo', plural: false, es: 'el dinero', en: 'the money' },
  { requires: ['u12.el-libro'], pronoun: 'lo', plural: false, es: 'el libro', en: 'the book' },
  { requires: ['u10.la-maleta'], pronoun: 'la', plural: false, es: 'la maleta', en: 'the suitcase' },
  { requires: ['u15.los-huevos'], pronoun: 'los', plural: true, es: 'los huevos', en: 'the eggs' },
  { requires: ['u15.las-verduras'], pronoun: 'las', plural: true, es: 'las verduras', en: 'the vegetables' },
];

/**
 * Things and activities to like. Spanish keeps the article on the noun where
 * English drops it — *me gusta el café* is "I like coffee", not "the coffee" —
 * so the two sides are written out separately rather than assembled.
 */
const LIKEABLE: LikeableFiller[] = [
  { requires: ['u4.el-cafe'], plural: false, es: 'el café', en: 'coffee' },
  { requires: ['u15.el-pescado'], plural: false, es: 'el pescado', en: 'fish' },
  { requires: ['u12.la-musica'], plural: false, es: 'la música', en: 'music' },
  { requires: ['u4.la-comida', 'u2.mexicana'], plural: false, es: 'la comida mexicana', en: 'Mexican food' },
  { requires: ['u4.el-taco'], plural: true, es: 'los tacos', en: 'tacos' },
  { requires: ['u15.las-verduras'], plural: true, es: 'las verduras', en: 'vegetables' },
  { requires: ['u12.el-libro'], plural: true, es: 'los libros', en: 'books' },
  { requires: ['u12.viajar'], plural: false, es: 'viajar', en: 'to travel' },
  { requires: ['u12.cocinar'], plural: false, es: 'cocinar', en: 'to cook' },
  { requires: ['u12.bailar'], plural: false, es: 'bailar', en: 'to dance' },
];

/** Nouns worth comparing, each carrying the article its adjective must match. */
const COMPARABLE_THINGS: ThingFiller[] = [
  { requires: ['u3.el-hotel'], article: 'el', es: 'el hotel', en: 'the hotel' },
  { requires: ['u6.el-mercado'], article: 'el', es: 'el mercado', en: 'the market' },
  { requires: ['u4.el-cafe'], article: 'el', es: 'el café', en: 'the coffee' },
  { requires: ['u4.la-comida'], article: 'la', es: 'la comida', en: 'the food' },
  { requires: ['u6.la-tienda'], article: 'la', es: 'la tienda', en: 'the shop' },
  { requires: ['u16.la-ciudad'], article: 'la', es: 'la ciudad', en: 'the city' },
];

/* ---------------------------------------------------------------- patterns -- */

/**
 * ir a + infinitive. The highest-value frame in the course: it is the entire
 * future tense, and it is the construction English speakers can build fastest
 * because their own language works the same way.
 */
const irA: Pattern = {
  id: 'p.ir-a',
  unitId: 'u9',
  title: 'Saying what someone is going to do',
  example: 'Voy a comer mañana — I am going to eat tomorrow',
  requires: ['u9.voy-a'],
  slots: {
    who: [
      { requires: ['u9.voy'], es: 'Voy', en: 'I am' },
      { requires: ['u9.vas'], es: 'Vas', en: 'You are' },
      { requires: ['u9.va'], es: 'Va', en: 'He is' },
      { requires: ['u9.va'], es: 'Va', en: 'She is' },
      { requires: ['u9.vamos'], es: 'Vamos', en: 'We are' },
    ],
    what: INFINITIVES,
    when: WHEN,
  },
  build: ({ who, what, when }) => ({
    es: `${who!.es} a ${what!.es} ${when!.es}`,
    en: `${who!.en} going to ${what!.en} ${when!.en}`,
    esAlt: [`${pronounFor(who!.en)} ${who!.es.toLowerCase()} a ${what!.es} ${when!.es}`],
  }),
};

/** The subject pronoun matching an English subject, for the optional-pronoun variant. */
function pronounFor(en: string): string {
  if (en.startsWith('I ')) return 'Yo';
  if (en.startsWith('You ')) return 'Tú';
  if (en.startsWith('He ')) return 'Él';
  if (en.startsWith('She ')) return 'Ella';
  return 'Nosotros';
}

/** tener + noun, where English reaches for "to be". */
const tenerState: Pattern = {
  id: 'p.tener-state',
  unitId: 'u8',
  title: 'Saying how someone feels, the Spanish way',
  example: 'Tengo hambre — I am hungry (literally: I have hunger)',
  requires: ['u8.tener'],
  slots: {
    who: [
      { requires: ['u8.tengo'], es: 'Tengo', en: 'I am' },
      { requires: ['u8.tienes'], es: 'Tienes', en: 'You are' },
      { requires: ['u8.tiene'], es: 'Tiene', en: 'He is' },
      { requires: ['u8.tenemos'], es: 'Tenemos', en: 'We are' },
    ],
    state: [
      { requires: ['u8.tengo-hambre'], es: 'hambre', en: 'hungry' },
      { requires: ['u8.tengo-sed'], es: 'sed', en: 'thirsty' },
      { requires: ['u8.tengo-frio'], es: 'frío', en: 'cold' },
      { requires: ['u8.tengo-calor'], es: 'calor', en: 'hot' },
      { requires: ['u8.tengo-sueno'], es: 'sueño', en: 'sleepy' },
      { requires: ['u8.tengo-prisa'], es: 'prisa', en: 'in a hurry' },
    ],
  },
  build: ({ who, state }) => ({
    es: `${who!.es} ${state!.es}`,
    en: `${who!.en} ${state!.en}`,
    esAlt: [`${pronounFor(who!.en)} ${who!.es.toLowerCase()} ${state!.es}`],
  }),
};

/** tener que + infinitive — obligation. */
const tenerQue: Pattern = {
  id: 'p.tener-que',
  unitId: 'u8',
  title: 'Saying what someone has to do',
  example: 'Tengo que trabajar mañana — I have to work tomorrow',
  requires: ['u8.tengo-que'],
  slots: {
    who: [
      { requires: ['u8.tengo'], es: 'Tengo', en: 'I have' },
      { requires: ['u8.tienes'], es: 'Tienes', en: 'You have' },
      { requires: ['u8.tiene'], es: 'Tiene', en: 'He has' },
      { requires: ['u8.tenemos'], es: 'Tenemos', en: 'We have' },
    ],
    what: INFINITIVES,
    when: WHEN,
  },
  build: ({ who, what, when }) => ({
    es: `${who!.es} que ${what!.es} ${when!.es}`,
    en: `${who!.en} to ${what!.en} ${when!.en}`,
    esAlt: [`${pronounFor(who!.en)} ${who!.es.toLowerCase()} que ${what!.es} ${when!.es}`],
  }),
};

/**
 * estar + adjective.
 *
 * Both singular agreements are accepted for "I" and "you" because the app does
 * not know the learner's gender and has no business assuming it — "estoy
 * cansado" and "estoy cansada" are both correct answers to "I am tired".
 */
const estarMood: Pattern = {
  id: 'p.estar-mood',
  unitId: 'u3',
  title: 'Saying how someone is right now',
  example: 'Estoy cansado — I am tired',
  requires: ['u3.estoy'],
  slots: {
    who: [
      { requires: ['u3.estoy'], es: 'Estoy', en: 'I am' },
      { requires: ['u3.estas'], es: 'Estás', en: 'You are' },
      { requires: ['u3.esta'], es: 'Está', en: 'He is' },
      { requires: ['u3.esta'], es: 'Está', en: 'She is' },
      { requires: ['u3.estamos'], es: 'Estamos', en: 'We are' },
    ],
    how: [
      adj('u3.cansado', 'tired', 'cansado', 'cansada', 'cansados'),
      adj('u3.contento', 'happy', 'contento', 'contenta', 'contentos'),
      adj('u3.enfermo', 'sick', 'enfermo', 'enferma', 'enfermos'),
      adj('u3.ocupado', 'busy', 'ocupado', 'ocupada', 'ocupados'),
      adj('u3.listo', 'ready', 'listo', 'lista', 'listos'),
    ],
  },
  build: ({ who, how }) => {
    const a = how as AdjectiveFiller;
    const subject = who!.en;
    // Only he/she/we fix the agreement. First and second person do not, so both
    // singular forms are correct and both are accepted.
    const form =
      subject === 'He is'
        ? a.masculine
        : subject === 'She is'
          ? a.feminine
          : subject === 'We are'
            ? a.plural
            : a.masculine;
    const alts: string[] = [`${pronounFor(subject)} ${who!.es.toLowerCase()} ${form}`];
    if (subject === 'I am' || subject === 'You are') {
      alts.push(`${who!.es} ${a.feminine}`, `${pronounFor(subject)} ${who!.es.toLowerCase()} ${a.feminine}`);
    }
    return { es: `${who!.es} ${form}`, en: `${subject} ${a.en}`, esAlt: alts };
  },
};

function adj(
  requires: string,
  en: string,
  masculine: string,
  feminine: string,
  plural: string,
): AdjectiveFiller {
  return { requires: [requires], es: masculine, en, masculine, feminine, plural };
}

function cadj(
  requires: string,
  en: string,
  enComparative: string,
  masculine: string,
  feminine: string,
): ComparableAdj {
  return {
    requires: [requires],
    es: masculine,
    en,
    enComparative,
    masculine,
    feminine,
    plural: `${masculine}s`,
  };
}

/** ¿Dónde está + place? — the single most useful question in travel. */
const dondeEsta: Pattern = {
  id: 'p.donde-esta',
  unitId: 'u3',
  title: 'Asking where something is',
  example: '¿Dónde está la farmacia? — Where is the pharmacy?',
  requires: ['u3.donde-esta'],
  slots: { place: PLACES },
  build: ({ place }) => ({
    es: `¿Dónde está ${place!.es}?`,
    en: `Where is ${place!.en}?`,
    esAlt: [],
  }),
};

/**
 * ¿Cómo llego a...? — chosen specifically because it forces the a + el = al
 * contraction, which is a rule you can only be said to know if you apply it
 * to a noun you were not expecting.
 */
const comoLlego: Pattern = {
  id: 'p.como-llego',
  unitId: 'u6',
  title: 'Asking how to get somewhere (watch the al / a la)',
  example: '¿Cómo llego al mercado? — How do I get to the market?',
  requires: ['u6.como-llego', 'u6.al'],
  slots: { place: PLACES },
  build: ({ place }) => {
    const p = place as PlaceFiller;
    const to = p.article === 'el' ? `al ${p.noun}` : `a la ${p.noun}`;
    return { es: `¿Cómo llego ${to}?`, en: `How do I get to ${p.en}?`, esAlt: [] };
  },
};

/** ¿Me da...? — ordering, in the phrasing Mexicans actually use. */
const meDa: Pattern = {
  id: 'p.me-da',
  unitId: 'u4',
  title: 'Ordering something politely',
  example: '¿Me da una cerveza, por favor? — Could I have a beer, please?',
  requires: ['u4.me-da', 'u1.por-favor'],
  slots: {
    item: [
      { requires: ['u4.el-cafe'], es: 'un café', en: 'a coffee' },
      { requires: ['u4.la-cerveza'], es: 'una cerveza', en: 'a beer' },
      { requires: ['u4.el-menu'], es: 'el menú', en: 'the menu' },
      { requires: ['u4.la-cuenta'], es: 'la cuenta', en: 'the bill' },
      { requires: ['u4.el-taco'], es: 'un taco', en: 'a taco' },
      { requires: ['u4.el-agua'], es: 'el agua', en: 'the water' },
    ],
  },
  build: ({ item }) => ({
    es: `¿Me da ${item!.es}, por favor?`,
    en: `Could I have ${item!.en}, please?`,
    esAlt: [`¿Me da ${item!.es} por favor?`],
  }),
};

/** Regular present tense — the frame that makes the conjugation table real. */
const regularVerb: Pattern = {
  id: 'p.regular-verb',
  unitId: 'u7',
  title: 'Conjugating a regular verb',
  example: 'Siempre trabajo — I always work',
  requires: ['u7.hablar'],
  slots: {
    who: [
      { requires: ['u2.yo'], es: 'yo', en: 'I' },
      { requires: ['u2.tu'], es: 'tú', en: 'You' },
      { requires: ['u2.el'], es: 'él', en: 'He' },
      { requires: ['u2.nosotros'], es: 'nosotros', en: 'We' },
    ],
    verb: [
      verb('u7.trabajar', 'work', 'works', 'trabajo', 'trabajas', 'trabaja', 'trabajamos'),
      verb('u7.estudiar', 'study', 'studies', 'estudio', 'estudias', 'estudia', 'estudiamos'),
      verb('u7.comer', 'eat', 'eats', 'como', 'comes', 'come', 'comemos'),
      verb('u7.escribir', 'write', 'writes', 'escribo', 'escribes', 'escribe', 'escribimos'),
      verb('u7.aprender', 'learn', 'learns', 'aprendo', 'aprendes', 'aprende', 'aprendemos'),
    ],
    often: [
      { requires: ['u7.siempre'], es: 'siempre', en: 'always' },
      { requires: ['u7.nunca'], es: 'nunca', en: 'never' },
      { requires: ['u7.a-veces'], es: 'a veces', en: 'sometimes' },
      { requires: ['u5.mucho'], es: 'mucho', en: 'a lot' },
      { requires: ['u3.un-poco'], es: 'un poco', en: 'a little' },
    ],
  },
  build: ({ who, verb: v, often }) => {
    const f = v as VerbFiller;
    const form =
      who!.en === 'I'
        ? f.yo
        : who!.en === 'You'
          ? f.tu
          : who!.en === 'He'
            ? f.el
            : f.nosotros;
    const enVerb = who!.en === 'He' ? f.enThird : f.en;
    // Frequency adverbs lead; quantity adverbs follow. Putting "mucho" in front
    // or "siempre" behind is not ungrammatical, but it is not what people say.
    const leads = often!.es === 'siempre' || often!.es === 'nunca' || often!.es === 'a veces';
    const es = leads ? `${cap(often!.es)} ${form}` : `${cap(form)} ${often!.es}`;
    const en = leads
      ? `${who!.en} ${often!.en} ${enVerb}`
      : `${who!.en} ${enVerb} ${often!.en}`;
    return {
      es,
      en,
      esAlt: [
        leads
          ? `${cap(who!.es)} ${often!.es} ${form}`
          : `${cap(who!.es)} ${form} ${often!.es}`,
      ],
    };
  },
};

function verb(
  requires: string,
  en: string,
  enThird: string,
  yo: string,
  tu: string,
  el: string,
  nosotros: string,
): VerbFiller {
  return { requires: [requires], es: yo, en, enThird, yo, tu, el, nosotros };
}

/** ¿Puede + infinitive? — one frame that covers most requests. */
const puede: Pattern = {
  id: 'p.puede',
  unitId: 'u10',
  title: 'Asking someone to do something',
  example: '¿Puede repetir? — Can you repeat that?',
  requires: ['u10.puede'],
  slots: {
    what: [
      { requires: ['u10.puede-ayudarme'], es: 'ayudarme', en: 'help me' },
      { requires: ['u1.puede-repetir'], es: 'repetir', en: 'repeat that' },
      { requires: ['u1.mas-despacio', 'u7.hablar'], es: 'hablar más despacio', en: 'speak more slowly' },
      { requires: ['u10.llamar', 'u10.el-doctor'], es: 'llamar a un doctor', en: 'call a doctor' },
    ],
  },
  build: ({ what }) => ({
    es: `¿Puede ${what!.es}?`,
    en: `Can you ${what!.en}?`,
    esAlt: [`¿Puede ${what!.es}, por favor?`],
  }),
};

/** no poder + infinitive — the negative half of the same frame. */
const noPuedo: Pattern = {
  id: 'p.no-puedo',
  unitId: 'u10',
  title: 'Saying what you cannot do',
  example: 'No puedo pagar — I cannot pay',
  requires: ['u10.no-puedo'],
  slots: {
    what: [
      { requires: ['u10.pagar'], es: 'pagar', en: 'pay' },
      { requires: ['u7.hablar', 'u7.el-ingles'], es: 'hablar inglés', en: 'speak English' },
      { requires: ['u10.encontrar', 'u10.la-maleta'], es: 'encontrar mi maleta', en: 'find my suitcase' },
      { requires: ['u9.salir'], es: 'salir', en: 'leave' },
      { requires: ['u7.trabajar'], es: 'trabajar', en: 'work' },
    ],
  },
  build: ({ what }) => ({
    es: `No puedo ${what!.es}`,
    en: `I cannot ${what!.en}`,
    esAlt: [`Yo no puedo ${what!.es}`],
  }),
};

/** ser + de — origin, and the other half of the ser/estar split. */
const serOrigin: Pattern = {
  id: 'p.ser-origin',
  unitId: 'u2',
  title: 'Saying where someone is from',
  example: 'Soy de México — I am from Mexico',
  requires: ['u2.de'],
  slots: {
    who: [
      { requires: ['u2.soy'], es: 'Soy', en: 'I am' },
      { requires: ['u2.eres'], es: 'Eres', en: 'You are' },
      { requires: ['u2.es'], es: 'Es', en: 'He is' },
      { requires: ['u2.somos'], es: 'Somos', en: 'We are' },
    ],
    where: [
      { requires: ['u2.mexicano'], es: 'México', en: 'Mexico' },
      { requires: ['u2.estados-unidos'], es: 'los Estados Unidos', en: 'the United States' },
      { requires: ['u3.aqui'], es: 'aquí', en: 'here' },
    ],
  },
  build: ({ who, where }) => ({
    es: `${who!.es} de ${where!.es}`,
    en: `${who!.en} from ${where!.en}`,
    esAlt: [`${pronounFor(who!.en)} ${who!.es.toLowerCase()} de ${where!.es}`],
  }),
};

/* ------------------------------------------------- patterns for units 11-16 -- */

/**
 * Replacing a noun with lo / la / los / las.
 *
 * The prompt names the noun being stood in for, because that is the whole skill:
 * the learner has to remember *el menú* is masculine and *la cuenta* feminine,
 * then put the right pronoun in front of the verb. Without the noun on screen
 * there would be no way to know which answer was wanted.
 */
const objectPronoun: Pattern = {
  id: 'p.object-pronoun',
  unitId: 'u11',
  title: 'Replacing a noun with lo, la, los or las',
  example: 'Lo quiero — I want it (the menu)',
  requires: ['u11.lo'],
  slots: {
    thing: OBJECTS,
    verb: [
      { requires: ['u4.quiero'], es: 'quiero', en: 'I want' },
      { requires: ['u8.tengo'], es: 'tengo', en: 'I have' },
      { requires: ['u11.veo'], es: 'veo', en: 'I see' },
      { requires: ['u7.necesito'], es: 'necesito', en: 'I need' },
    ],
  },
  build: ({ thing, verb: v }) => {
    const o = thing as ObjectFiller;
    return {
      es: `${cap(o.pronoun)} ${v!.es}`,
      en: `${v!.en} ${o.plural ? 'them' : 'it'} — ${o.en}`,
      esAlt: [],
    };
  },
};

/**
 * gustar, with the agreement that trips everyone.
 *
 * The pronoun says whose opinion it is; the verb agrees with the *thing*. Those
 * two facts pull in opposite directions for an English speaker, which is exactly
 * why this needs generating rather than memorising — the only way to get
 * "Nos gustan las verduras" right is to work it out.
 */
const gustar: Pattern = {
  id: 'p.gustar',
  unitId: 'u12',
  title: 'Saying what someone likes (watch gusta / gustan)',
  example: 'Me gustan los tacos — I like tacos',
  requires: ['u12.gustar'],
  slots: {
    who: [
      { requires: ['u12.me-gusta'], es: 'Me', en: 'I like' },
      { requires: ['u12.te-gusta'], es: 'Te', en: 'You like' },
      { requires: ['u12.le-gusta'], es: 'Le', en: 'He likes' },
      { requires: ['u11.nos', 'u12.me-gusta'], es: 'Nos', en: 'We like' },
    ],
    thing: LIKEABLE,
  },
  build: ({ who, thing }) => {
    const t = thing as LikeableFiller;
    const verb = t.plural ? 'gustan' : 'gusta';
    const es = `${who!.es} ${verb} ${t.es}`;
    return {
      es,
      en: `${who!.en} ${t.en}`,
      // Naming the person is optional in Spanish and extremely common in speech,
      // but the pronoun still has to be there.
      esAlt: who!.en === 'He likes' ? [`A él ${who!.es.toLowerCase()} ${verb} ${t.es}`] : [],
    };
  },
};

/** Reflexive daily routine — the frame, not the individual phrase. */
const reflexiveRoutine: Pattern = {
  id: 'p.reflexive-routine',
  unitId: 'u13',
  title: 'Describing your daily routine',
  example: 'Me levanto temprano — I get up early',
  requires: ['u13.se-refl'],
  slots: {
    action: [
      { requires: ['u13.me-levanto'], es: 'Me levanto', en: 'I get up' },
      { requires: ['u13.me-despierto'], es: 'Me despierto', en: 'I wake up' },
      { requires: ['u13.me-acuesto'], es: 'Me acuesto', en: 'I go to bed' },
      { requires: ['u13.me-ducho'], es: 'Me ducho', en: 'I take a shower' },
    ],
    when: [
      { requires: ['u9.temprano'], es: 'temprano', en: 'early' },
      { requires: ['u9.tarde-adv'], es: 'tarde', en: 'late' },
      { requires: ['u5.seis'], es: 'a las seis', en: 'at six' },
      { requires: ['u5.siete'], es: 'a las siete', en: 'at seven' },
      { requires: ['u13.todos-los-dias'], es: 'todos los días', en: 'every day' },
    ],
  },
  build: ({ action, when }) => ({
    es: `${action!.es} ${when!.es}`,
    en: `${action!.en} ${when!.en}`,
    esAlt: [],
  }),
};

/** The preterite, attached to a time that forces it. */
const preteriteWhen: Pattern = {
  id: 'p.preterite',
  unitId: 'u14',
  title: 'Saying what you did',
  example: 'Comí mucho ayer — I ate a lot yesterday',
  requires: ['u14.ayer'],
  slots: {
    action: [
      { requires: ['u14.comi', 'u5.mucho'], es: 'Comí mucho', en: 'I ate a lot' },
      { requires: ['u14.hable', 'u7.el-espanol'], es: 'Hablé español', en: 'I spoke Spanish' },
      { requires: ['u14.trabaje', 'u5.mucho'], es: 'Trabajé mucho', en: 'I worked a lot' },
      { requires: ['u14.sali', 'u9.temprano'], es: 'Salí temprano', en: 'I left early' },
      { requires: ['u14.llegue', 'u9.tarde-adv'], es: 'Llegué tarde', en: 'I arrived late' },
      { requires: ['u15.compre', 'u15.el-pan'], es: 'Compré pan', en: 'I bought bread' },
      { requires: ['u14.vi', 'u2.amigo', 'u2.mi'], es: 'Vi a mi amigo', en: 'I saw my friend' },
    ],
    when: PAST_WHEN,
  },
  build: ({ action, when }) => ({
    es: `${action!.es} ${when!.es}`,
    en: `${action!.en} ${when!.en}`,
    esAlt: [],
  }),
};

/**
 * fui a + place. Drills the a + el contraction a second time, in the past —
 * which is where it is easiest to forget, because the verb is already taking
 * all the attention.
 */
const fuiA: Pattern = {
  id: 'p.fui-a',
  unitId: 'u14',
  title: 'Saying where someone went',
  example: 'Fui al mercado ayer — I went to the market yesterday',
  requires: ['u14.fui', 'u6.al'],
  slots: {
    who: [
      { requires: ['u14.fui'], es: 'Fui', en: 'I went' },
      { requires: ['u14.fue'], es: 'Fue', en: 'He went' },
      { requires: ['u14.fuimos'], es: 'Fuimos', en: 'We went' },
    ],
    place: PLACES,
    when: PAST_WHEN,
  },
  build: ({ who, place, when }) => {
    const p = place as PlaceFiller;
    const to = p.article === 'el' ? `al ${p.noun}` : `a la ${p.noun}`;
    return {
      es: `${who!.es} ${to} ${when!.es}`,
      en: `${who!.en} to ${p.en} ${when!.en}`,
      esAlt: [],
    };
  },
};

/**
 * Comparison. The thing compared against is derived from the subject's gender
 * rather than being a slot of its own — "el otro" has to agree with whatever it
 * refers back to, and a second free slot would let it disagree.
 */
const comparison: Pattern = {
  id: 'p.comparison',
  unitId: 'u15',
  title: 'Comparing two things',
  example: 'El hotel es más barato que el otro — The hotel is cheaper than the other one',
  requires: ['u15.mas'],
  slots: {
    subject: COMPARABLE_THINGS,
    quality: [
      cadj('u15.caro', 'expensive', 'more expensive', 'caro', 'cara'),
      cadj('u15.barato', 'cheap', 'cheaper', 'barato', 'barata'),
      cadj('u16.bonito', 'pretty', 'prettier', 'bonito', 'bonita'),
      cadj('u16.pequeno', 'small', 'smaller', 'pequeño', 'pequeña'),
      cadj('u16.grande', 'big', 'bigger', 'grande', 'grande'),
      cadj('u12.interesante', 'interesting', 'more interesting', 'interesante', 'interesante'),
      // No "rico" here. It only means tasty of food — of a shop or a city it
      // means wealthy — and a pattern has no way to express a constraint that
      // runs between two slots, so the adjective has to fit every subject.
    ],
  },
  build: ({ subject, quality }) => {
    const t = subject as ThingFiller;
    const a = quality as ComparableAdj;
    const form = t.article === 'la' ? a.feminine : a.masculine;
    const other = t.article === 'la' ? 'la otra' : 'el otro';
    return {
      es: `${cap(t.es)} es más ${form} que ${other}`,
      en: `${cap(t.en)} is ${a.enComparative} than the other one`,
      esAlt: [],
    };
  },
};

/**
 * hacer for the weather.
 *
 * Rain is deliberately left out: *llueve* is a single word with no frame to
 * assemble, so putting it in a construction exercise would teach nothing. What
 * this drills is "hace + noun" where English wants "is + adjective".
 */
const weather: Pattern = {
  id: 'p.weather',
  unitId: 'u16',
  title: 'Talking about the weather',
  example: 'Hace calor hoy — It is hot today',
  requires: ['u14.hacer'],
  slots: {
    what: [
      { requires: ['u16.hace-calor'], es: 'calor', en: 'hot' },
      { requires: ['u16.hace-frio'], es: 'frío', en: 'cold' },
      { requires: ['u16.hace-sol'], es: 'sol', en: 'sunny' },
    ],
    // Every option here has to make sense with sun, cold and heat alike. An
    // earlier version included "por la noche", which produced the structurally
    // perfect "Hace sol por la noche" — sunny at night.
    where: [
      { requires: ['u3.hoy'], es: 'hoy', en: 'today' },
      { requires: ['u3.aqui'], es: 'aquí', en: 'here' },
      { requires: ['u16.la-ciudad'], es: 'en la ciudad', en: 'in the city' },
      { requires: ['u6.el-centro'], es: 'en el centro', en: 'in the centre' },
      { requires: ['u6.el-mercado'], es: 'en el mercado', en: 'at the market' },
    ],
  },
  build: ({ what, where }) => ({
    es: `Hace ${what!.es} ${where!.es}`,
    en: `It is ${what!.en} ${where!.en}`,
    esAlt: [],
  }),
};

export const patterns: Pattern[] = [
  serOrigin,
  estarMood,
  dondeEsta,
  meDa,
  comoLlego,
  regularVerb,
  tenerState,
  tenerQue,
  irA,
  puede,
  noPuedo,
  objectPronoun,
  gustar,
  reflexiveRoutine,
  preteriteWhen,
  fuiA,
  comparison,
  weather,
];

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id);
}

/** How many distinct sentences a pattern can produce, using every filler. */
export function patternSize(pattern: Pattern): number {
  return Object.values(pattern.slots).reduce((n, options) => n * options.length, 1);
}
