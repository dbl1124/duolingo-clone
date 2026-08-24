import type { Unit } from '../types';

export const unit10: Unit = {
  id: 'u10',
  n: 10,
  title: 'When something goes wrong',
  canDo: 'Ask for help, explain a problem, and handle a situation you did not plan for.',
  scenario: 'A lost bag, a wrong charge, a pharmacy, a doctor, a phone that will not connect.',

  grammar: [
    {
      id: 'u10.g.poder',
      title: 'poder + infinitive — asking for anything at all',
      summary:
        '**¿Puede...?** ("can you...?") plus any infinitive is a complete request. One pattern, unlimited uses.',
      body: [
        'The forms: **puedo** (I can), **puedes** (you can, informal), **puede** (he/she can, you can formal), **podemos** (we can), **pueden** (they can). Another e→ue stem change, same shape as *tener*.',
        'Attach an infinitive and you have a polite request: *¿puede ayudarme?* (can you help me?), *¿puede repetir?* (can you repeat?), *¿puede hablar más despacio?* (can you speak more slowly?).',
        'Flip it for permission: *¿puedo pasar?* (may I come through?), *¿puedo pagar con tarjeta?* (can I pay by card?).',
        'Notice *ayudarme* — the "me" glues onto the end of the infinitive rather than sitting before it. You will learn the full system for these pronouns later; for now, learn *ayudarme* as a single word.',
        'The negative is just *no* in front: **no puedo** (I cannot), **no funciona** (it does not work).',
      ],
      examples: [
        { es: '¿Puede ayudarme, por favor?', en: 'Can you help me, please?', hl: '¿Puede ayudarme' },
        { es: '¿Puedo pagar con tarjeta?', en: 'Can I pay by card?', hl: '¿Puedo' },
        { es: 'No puedo encontrar mi maleta.', en: 'I cannot find my suitcase.', hl: 'No puedo' },
        { es: '¿Puede hablar más despacio?', en: 'Can you speak more slowly?', hl: '¿Puede hablar' },
      ],
      hook: 'Root of "potent", "power", "possible". *Poder* is also a noun — *el poder* means "power" outright, as in political power.',
    },
    {
      id: 'u10.g.negation',
      title: 'Spanish stacks its negatives on purpose',
      summary:
        'Where English says "I do not have anything", Spanish says **no tengo nada** — "I do not have nothing". Double negatives are correct and required.',
      body: [
        'English teachers spent a century stamping out "I did not see nothing". Spanish never had that campaign. If the sentence starts with *no*, the later words stay negative too.',
        '*No tengo nada* — I have nothing. *No veo a nadie* — I see nobody. *No voy nunca* — I never go.',
        'You can also front the negative word and drop the *no*: *nunca voy* means the same as *no voy nunca*. Both are correct; the first is slightly more emphatic.',
        'The practical upshot: do not try to "fix" the double negative into English shape. Leave both negatives in place and it will be right.',
      ],
      examples: [
        { es: 'No tengo nada que declarar.', en: 'I have nothing to declare.', hl: 'No tengo nada' },
        { es: 'No conozco a nadie aquí.', en: 'I do not know anyone here.', hl: 'nadie' },
        { es: 'No funciona.', en: 'It does not work.', hl: 'No funciona' },
      ],
      pitfall:
        'The single most useful negative sentence in this app is **no funciona** — "it does not work". Wifi, key card, phone, air conditioning, ATM. Say the noun, then *no funciona*.',
    },
  ],

  items: [
    { id: 'u10.ayuda', es: '¡ayuda!', en: 'help!', pos: 'interj', note: 'For real emergencies, *¡socorro!* is the stronger cry.', lifeline: true },
    { id: 'u10.puede-ayudarme', es: '¿puede ayudarme?', en: 'can you help me?', pos: 'phrase', register: 'formal', lifeline: true },
    { id: 'u10.puedo', es: 'puedo', en: 'I can', pos: 'verb' },
    { id: 'u10.puede', es: 'puede', en: 'you can (formal)', enAlt: ['he can', 'she can'], pos: 'verb' },
    { id: 'u10.no-puedo', es: 'no puedo', en: 'I cannot', pos: 'phrase' },
    { id: 'u10.no-funciona', es: 'no funciona', en: 'it does not work', pos: 'phrase', note: 'Point at the thing and say it. Endlessly useful.', lifeline: true },
    { id: 'u10.no-se', es: 'no sé', en: "I don't know", pos: 'phrase', note: 'With the accent — *se* without it is a different word entirely.', lifeline: true },
    { id: 'u10.un-momento', es: 'un momento', en: 'one moment', pos: 'phrase', note: 'Buys you time to assemble a sentence. Use it shamelessly.', lifeline: true },
    { id: 'u10.otra-vez', es: 'otra vez', en: 'again', pos: 'phrase', literal: 'another time', note: '"¿Otra vez, por favor?" is a shorter way to ask for a repeat.', lifeline: true },
    { id: 'u10.la-policia', es: 'la policía', en: 'the police', pos: 'noun', gender: 'f' },
    { id: 'u10.el-hospital', es: 'el hospital', en: 'the hospital', pos: 'noun', gender: 'm' },
    { id: 'u10.el-doctor', es: 'el doctor', en: 'the doctor', pos: 'noun', gender: 'm', note: '*El médico* is equally common.' },
    { id: 'u10.me-duele', es: 'me duele', en: 'it hurts', pos: 'phrase', literal: 'it hurts me', note: 'Add the body part: *me duele la cabeza* — my head hurts.' },
    { id: 'u10.la-cabeza', es: 'la cabeza', en: 'the head', pos: 'noun', gender: 'f', hook: 'Root of "capital", "captain", "chief" — all from Latin *caput*, head.' },
    { id: 'u10.el-estomago', es: 'el estómago', en: 'the stomach', pos: 'noun', gender: 'm' },
    { id: 'u10.la-medicina', es: 'la medicina', en: 'the medicine', pos: 'noun', gender: 'f' },
    { id: 'u10.el-pasaporte', es: 'el pasaporte', en: 'the passport', pos: 'noun', gender: 'm' },
    { id: 'u10.la-maleta', es: 'la maleta', en: 'the suitcase', pos: 'noun', gender: 'f' },
    { id: 'u10.el-telefono', es: 'el teléfono', en: 'the phone', pos: 'noun', gender: 'm' },
    { id: 'u10.perdi', es: 'perdí', en: 'I lost', pos: 'verb', note: 'A past tense you can borrow now: *perdí mi maleta*.' },
    { id: 'u10.encontrar', es: 'encontrar', en: 'to find', pos: 'verb' },
    { id: 'u10.pagar', es: 'pagar', en: 'to pay', pos: 'verb' },
    { id: 'u10.llamar', es: 'llamar', en: 'to call', pos: 'verb', note: 'Same verb as in *me llamo* — to call, including on the phone.' },
    { id: 'u10.nada', es: 'nada', en: 'nothing', pos: 'pron', note: 'Pairs with a preceding *no*: "no tengo nada".' },
    { id: 'u10.nadie', es: 'nadie', en: 'nobody', pos: 'pron' },
    { id: 'u10.el-problema', es: 'el problema', en: 'the problem', pos: 'noun', gender: 'm', note: 'Masculine despite the -a — a Greek loanword, like *el sistema* and *el tema*.' },
    { id: 'u10.esta-bien', es: 'está bien', en: "it's fine", enAlt: ['okay', 'all right'], pos: 'phrase', note: 'Accepts, agrees, and defuses. A useful thing to have ready.' },
  ],

  sentences: [
    { id: 'u10.s1', es: '¿Puede ayudarme, por favor?', en: 'Can you help me, please?', uses: ['u10.puede-ayudarme'], cloze: '¿Puede ayudarme' },
    { id: 'u10.s2', es: 'No funciona el teléfono.', en: 'The phone does not work.', uses: ['u10.no-funciona', 'u10.el-telefono'], cloze: 'No funciona' },
    { id: 'u10.s3', es: 'Perdí mi pasaporte.', en: 'I lost my passport.', uses: ['u10.perdi', 'u10.el-pasaporte'], cloze: 'Perdí' },
    { id: 'u10.s4', es: 'Me duele la cabeza.', en: 'My head hurts.', uses: ['u10.me-duele', 'u10.la-cabeza'], cloze: 'Me duele' },
    { id: 'u10.s5', es: 'No sé, lo siento.', en: 'I do not know, I am sorry.', uses: ['u10.no-se'], cloze: 'No sé' },
    { id: 'u10.s6', es: 'Necesito un doctor.', en: 'I need a doctor.', uses: ['u10.el-doctor'], cloze: 'un doctor' },
    { id: 'u10.s7', es: '¿Puedo pagar con tarjeta?', en: 'Can I pay by card?', uses: ['u10.puedo', 'u10.pagar'], cloze: '¿Puedo pagar' },
    { id: 'u10.s8', es: 'No tengo nada que declarar.', en: 'I have nothing to declare.', uses: ['u10.nada'], cloze: 'nada' },
    { id: 'u10.s9', es: 'Un momento, por favor.', en: 'One moment, please.', uses: ['u10.un-momento'], cloze: 'Un momento' },
    { id: 'u10.s10', es: '¿Otra vez, más despacio?', en: 'Again, more slowly?', uses: ['u10.otra-vez'], cloze: 'Otra vez' },
    { id: 'u10.s11', es: 'No puedo encontrar mi maleta.', en: 'I cannot find my suitcase.', uses: ['u10.no-puedo', 'u10.encontrar', 'u10.la-maleta'], cloze: 'No puedo encontrar' },
    { id: 'u10.s12', es: 'Está bien, no hay problema.', en: 'It is fine, there is no problem.', uses: ['u10.esta-bien', 'u10.el-problema'], cloze: 'Está bien' },
  ],
};
