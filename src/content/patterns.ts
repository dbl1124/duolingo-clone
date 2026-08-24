/**
 * Sentence patterns — the difference between knowing phrases and building them.
 *
 * The 107 fixed sentences elsewhere in this curriculum are memorised as blocks:
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
 * 10 infinitives × 11 time expressions — over 500 sentences from one frame.
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
  { requires: ['u6.el-centro'], article: 'el', noun: 'centro', es: 'el centro', en: 'downtown' },
  { requires: ['u6.la-tienda'], article: 'la', noun: 'tienda', es: 'la tienda', en: 'the shop' },
  { requires: ['u6.la-farmacia'], article: 'la', noun: 'farmacia', es: 'la farmacia', en: 'the pharmacy' },
  { requires: ['u10.el-hospital'], article: 'el', noun: 'hospital', es: 'el hospital', en: 'the hospital' },
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
];

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id);
}

/** How many distinct sentences a pattern can produce, using every filler. */
export function patternSize(pattern: Pattern): number {
  return Object.values(pattern.slots).reduce((n, options) => n * options.length, 1);
}
