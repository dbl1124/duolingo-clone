import type { Unit } from '../types.ts';

export const unit11: Unit = {
  id: 'u11',
  n: 11,
  title: 'It, him, her — the little words that go first',
  canDo: 'Replace a noun you have already mentioned instead of repeating it, and put the pronoun where Spanish wants it.',
  scenario:
    'Any conversation past its first sentence. "Do you have it?" "I want it." "Can you help me?" "I will bring it to you."',

  grammar: [
    {
      id: 'u11.g.placement',
      title: 'The object goes before the verb',
      summary:
        'English says "I want it". Spanish says **lo quiero** — literally "it I want". Object pronouns move in front of the conjugated verb, and this is the single hardest word-order habit to build.',
      body: [
        'You have been using this since your first day without noticing. *Me llamo* is "myself I call". *¿Me da un café?* is "to-me you give a coffee?". *Me duele la cabeza* is "to-me it hurts, the head". Every one of those puts the little word first.',
        'The set for direct objects — the thing being acted on:',
        '**lo** (it/him, masculine) · **la** (it/her, feminine) · **los** (them, masculine) · **las** (them, feminine)',
        'And for people on the receiving end — the indirect objects:',
        '**me** (me) · **te** (you, informal) · **le** (him, her, you formal) · **nos** (us)',
        'Gender follows the noun you replaced, not the thing itself. *El menú* → *lo tengo*. *La cuenta* → *la tengo*. Same English "I have it", two different Spanish sentences, and the only way to pick is to remember which noun you are standing in for.',
        'Negation wraps the whole cluster: **no lo tengo**, not "lo no tengo". The *no* goes furthest left.',
      ],
      examples: [
        { es: 'Lo quiero.', en: 'I want it.', hl: 'Lo' },
        { es: 'No la tengo.', en: 'I do not have it.', hl: 'No la' },
        { es: '¿Los tiene?', en: 'Do you have them?', hl: 'Los' },
        { es: 'Te espero aquí.', en: 'I will wait for you here.', hl: 'Te' },
        { es: 'Le doy el dinero.', en: 'I give him the money.', hl: 'Le' },
      ],
      hook: 'Latin put objects before verbs as a matter of course — *te amo* is Latin as well as Spanish. English lost that freedom when it lost its case endings and had to fix word order to show who did what. Spanish kept just enough marking on these eight little words to keep them mobile.',
      pitfall:
        'Do not translate "I want it" word by word. *Quiero lo* is not a sentence — it is the mistake every English speaker makes for the first month. The pronoun leads.',
    },
    {
      id: 'u11.g.attach',
      title: 'Except when it hooks onto the end',
      summary:
        'With an infinitive or a command, the pronoun glues onto the back of the verb instead: **ayudarme**, **verlo**, **tráigamelo**. One word, no hyphen.',
      body: [
        '*¿Puede ayudarme?* — you already know this one. It is *ayudar* + *me*, welded together. The rule: when the verb is an infinitive, the pronoun can ride on the end.',
        'And when there are two verbs, you get a genuine choice. *Voy a verlo* and *Lo voy a ver* are both correct, both common, and mean exactly the same thing. Pick whichever comes out of your mouth first.',
        'Commands take the pronoun on the end too: *tráigalo* (bring it), *dígame* (tell me). If a stress mark appears out of nowhere — *tráigalo* — that is only Spanish keeping the stress where it already was after the word got longer.',
        'The one place you have no choice is a plain conjugated verb: *lo tengo*, never "tengolo".',
      ],
      examples: [
        { es: '¿Puede ayudarme?', en: 'Can you help me?', hl: 'ayudarme' },
        { es: 'Voy a verlo mañana.', en: 'I am going to see it tomorrow.', hl: 'verlo' },
        { es: 'Lo voy a ver mañana.', en: 'I am going to see it tomorrow.', hl: 'Lo voy a ver' },
        { es: 'Dígame.', en: 'Tell me.', hl: 'Dígame' },
      ],
      pitfall:
        'The choice only exists with two verbs. One conjugated verb on its own always takes the pronoun in front.',
    },
    {
      id: 'u11.g.saber-conocer',
      title: 'Two verbs for "know"',
      summary:
        'Spanish splits knowing in half. **Saber** is knowing a fact or how to do something. **Conocer** is being acquainted with a person, a place, or a thing.',
      body: [
        '*Sé dónde está* — I know where it is. A fact. *Conozco México* — I know Mexico, as in I have been there and it is familiar. Never the other way round.',
        'The test that works nearly always: if you could follow it with "that…" or "how to…", you want *saber*. If you could follow it with a name, you want *conocer*.',
        '*No sé* is your everyday "I don\'t know" — and it is *saber*, because what you do not know is a fact.',
        'Both are irregular in the *yo* form and nowhere else: **sé** and **conozco**. Everything else behaves.',
        'English used to make this split too. "Ken" survives in Scots and in "beyond our ken", and it is the same root as *conocer* — both from a Proto-Indo-European verb for recognising.',
      ],
      examples: [
        { es: 'No sé dónde está.', en: 'I do not know where it is.', hl: 'sé' },
        { es: 'Conozco México.', en: 'I know Mexico.', hl: 'Conozco' },
        { es: '¿Conoce a mi esposa?', en: 'Do you know my wife?', hl: 'Conoce' },
        { es: 'Sé hablar español.', en: 'I know how to speak Spanish.', hl: 'Sé hablar' },
      ],
      hook: 'French, Italian and Portuguese all make the same split — *savoir/connaître*, *sapere/conoscere*, *saber/conhecer*. English is the odd one out for flattening two ideas into one word.',
      pitfall:
        '"Do you know Maria?" is *¿Conoce a María?* — with an **a** before the person. Spanish marks a human object that way, and it is the one extra letter that makes the sentence sound native.',
    },
  ],

  items: [
    { id: 'u11.lo', es: 'lo', en: 'it (masculine)', enAlt: ['him'], pos: 'pron', note: 'Stands in for a masculine noun: *el menú* → *lo tengo*.' },
    { id: 'u11.los-obj', es: 'los', en: 'them (masculine)', pos: 'pron', note: 'Also used for a mixed group of people.' },
    { id: 'u11.las-obj', es: 'las', en: 'them (feminine)', pos: 'pron' },
    { id: 'u11.me-obj', es: 'me', en: 'me', enAlt: ['to me'], pos: 'pron', note: 'The *me* you have been saying in *me llamo* and *me duele*.' },
    { id: 'u11.te-obj', es: 'te', en: 'you (informal)', enAlt: ['to you'], pos: 'pron', register: 'informal' },
    { id: 'u11.le', es: 'le', en: 'to him', enAlt: ['to her', 'to you (formal)'], pos: 'pron', note: 'One word covers all three. Context sorts it out, or you add *a él*, *a ella*, *a usted*.' },
    { id: 'u11.nos', es: 'nos', en: 'us', enAlt: ['to us'], pos: 'pron' },
    { id: 'u11.ver', es: 'ver', en: 'to see', pos: 'verb', rank: 40, hook: 'Root of "vision", "video", "evident". Latin *videre* — the *d* wore away in Spanish.' },
    { id: 'u11.veo', es: 'veo', en: 'I see', pos: 'verb' },
    { id: 'u11.ve', es: 've', en: 'he/she sees', enAlt: ['you see (formal)'], pos: 'verb' },
    { id: 'u11.nos-vemos', es: 'nos vemos', en: 'see you', pos: 'phrase', literal: 'we see each other', note: 'The standard sign-off among people who expect to meet again. Warmer than *adiós*.' },
    { id: 'u11.dar', es: 'dar', en: 'to give', pos: 'verb', rank: 45 },
    { id: 'u11.doy', es: 'doy', en: 'I give', pos: 'verb' },
    { id: 'u11.traer', es: 'traer', en: 'to bring', pos: 'verb', hook: 'Latin *trahere*, "to drag" — the same root as "tractor" and "attract".' },
    { id: 'u11.trae', es: 'trae', en: 'he/she brings', enAlt: ['you bring (formal)'], pos: 'verb', note: '*¿Me trae la cuenta?* is how you ask for the bill without saying please twice.' },
    { id: 'u11.ayudar', es: 'ayudar', en: 'to help', pos: 'verb' },
    { id: 'u11.ayudo', es: 'ayudo', en: 'I help', pos: 'verb' },
    { id: 'u11.saber', es: 'saber', en: 'to know (a fact)', pos: 'verb', rank: 30, note: 'Facts and skills. Not people or places.' },
    { id: 'u11.se-fact', es: 'sé', en: 'I know', pos: 'verb', note: 'The accent is the only thing separating it from *se*, which is a different word entirely.' },
    { id: 'u11.conocer', es: 'conocer', en: 'to know (a person or place)', pos: 'verb', rank: 55, hook: 'Same ancient root as English "can", "cunning" and Scots "ken".' },
    { id: 'u11.conozco', es: 'conozco', en: 'I know (a person or place)', pos: 'verb', note: 'Irregular only here. *Conoces*, *conoce* are regular.' },
    { id: 'u11.entender', es: 'entender', en: 'to understand', pos: 'verb', hook: 'Latin *intendere*, "to stretch toward" — the same picture as English "attend".' },
    { id: 'u11.entiendo', es: 'entiendo', en: 'I understand', pos: 'verb', note: 'The *e* becomes *ie* when stressed: *entiendo*, but *entender*. A pattern you will see again.' },
    { id: 'u11.decir', es: 'decir', en: 'to say', enAlt: ['to tell'], pos: 'verb', rank: 25 },
    { id: 'u11.digo', es: 'digo', en: 'I say', pos: 'verb' },
    { id: 'u11.dice', es: 'dice', en: 'he/she says', enAlt: ['you say (formal)'], pos: 'verb', note: '*¿Cómo se dice?* — the phrase you already use — is this verb.' },
    { id: 'u11.esperar', es: 'esperar', en: 'to wait', enAlt: ['to hope'], pos: 'verb', note: 'Waiting and hoping are the same verb. *Espero que sí* — I hope so.' },
    { id: 'u11.lo-siento', es: 'lo siento', en: "I'm sorry", pos: 'phrase', literal: 'I feel it', note: 'For sympathy or a real apology. *Perdón* is for bumping into someone.' },
  ],

  sentences: [
    { id: 'u11.s1', es: 'Lo quiero.', en: 'I want it.', uses: ['u11.lo', 'u4.quiero'], cloze: 'Lo' },
    { id: 'u11.s2', es: 'No los tengo.', en: 'I do not have them.', uses: ['u11.los-obj', 'u8.tengo'], cloze: 'los' },
    { id: 'u11.s3', es: 'La veo mañana.', en: 'I will see her tomorrow.', uses: ['u11.veo', 'u9.manana'], cloze: 'La' },
    { id: 'u11.s4', es: '¿Me ayuda, por favor?', en: 'Can you help me, please?', uses: ['u11.me-obj', 'u11.ayudar', 'u1.por-favor'], cloze: 'Me' },
    { id: 'u11.s5', es: 'Te espero aquí.', en: 'I will wait for you here.', uses: ['u11.te-obj', 'u11.esperar', 'u3.aqui'], cloze: 'Te' },
    { id: 'u11.s6', es: '¿Me trae la cuenta?', en: 'Could you bring me the bill?', uses: ['u11.trae', 'u4.la-cuenta'], cloze: 'Me trae' },
    { id: 'u11.s7', es: 'Le doy el dinero.', en: 'I give him the money.', uses: ['u11.le', 'u11.doy', 'u8.el-dinero'], cloze: 'Le doy' },
    { id: 'u11.s8', es: 'Voy a verlo mañana.', en: 'I am going to see it tomorrow.', uses: ['u11.ver', 'u9.voy-a'], cloze: 'verlo' },
    { id: 'u11.s9', es: 'Lo siento, no entiendo.', en: 'I am sorry, I do not understand.', uses: ['u11.lo-siento', 'u1.no-entiendo'], cloze: 'Lo siento' },
    { id: 'u11.s10', es: 'No sé dónde está.', en: 'I do not know where it is.', uses: ['u11.se-fact', 'u3.donde-esta'], cloze: 'sé' },
    { id: 'u11.s11', es: 'Conozco México.', en: 'I know Mexico.', uses: ['u11.conozco'], cloze: 'Conozco' },
    { id: 'u11.s12', es: 'Nos vemos el lunes.', en: 'See you Monday.', uses: ['u11.nos-vemos', 'u9.el-lunes'], cloze: 'Nos vemos' },
    { id: 'u11.s13', es: '¿Cómo se dice en español?', en: 'How do you say it in Spanish?', uses: ['u11.dice', 'u7.el-espanol'], cloze: 'se dice' },
  ],
};
