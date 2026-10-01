/* ═══════════════════════════════════════════════════════════════
   Aventure « Le Cycle & Moi » — données et progression
   5 mondes × niveaux progressifs + boss final.
   Progression (étoiles, niveaux débloqués) persistée en localStorage.
   Contenu éducatif, bienveillant, non médical.
   ═══════════════════════════════════════════════════════════════ */

export interface QuizQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface TrueFalseItem {
  statement: string;
  answer: boolean;
  explanation: string;
}

export interface SymptomSortItem {
  label: string;
  category: 'body' | 'mind';
  hint: string;
}

/* ═════════════════════ Banques de questions ═════════════════════ */

export const QUIZ_PHASES: QuizQuestion[] = [
  {
    question: 'Combien de jours dure en moyenne un cycle menstruel ?',
    choices: ['14 jours', '28 jours', '45 jours'],
    answerIndex: 1,
    explanation: 'La moyenne est de 28 jours, mais un cycle normal va de 21 à 35 jours. Chaque corps a son rythme !',
  },
  {
    question: 'Quel est le tout premier jour du cycle ?',
    choices: ["Le jour de l'ovulation", 'Le premier jour des règles', 'Le dernier jour des règles'],
    answerIndex: 1,
    explanation: 'Le jour 1 du cycle est toujours le premier jour des règles.',
  },
  {
    question: 'Quelle phase suit directement les règles ?',
    choices: ['La phase lutéale', 'La phase folliculaire', "La phase d'ovulation"],
    answerIndex: 1,
    explanation: "Après les règles, la phase folliculaire commence : les hormones préparent un ovocyte.",
  },
  {
    question: 'Que se passe-t-il pendant les règles ?',
    choices: [
      "L'utérus se vide de sa muqueuse",
      "L'ovulation a lieu",
      'La progestérone est à son maximum'],
    answerIndex: 0,
    explanation: "Pendant les règles, la muqueuse utérine (endomètre) se détache et s'évacue.",
  },
  {
    question: 'Quand a lieu l’ovulation dans un cycle de 28 jours ?',
    choices: ['Vers le jour 7', 'Vers le jour 14', 'Vers le jour 25'],
    answerIndex: 1,
    explanation: "Vers le jour 14 pour un cycle de 28 jours — soit environ 14 jours avant les règles suivantes.",
  },
  {
    question: 'Quelle hormone monte fortement après l’ovulation ?',
    choices: ['La progestérone', "L'insuline", "L'adrénaline"],
    answerIndex: 0,
    explanation: 'La progestérone, produite par le corps jaune, prépare la muqueuse utérine.',
  },
  {
    question: 'La phase lutéale se termine par…',
    choices: ["L'ovulation", 'Les règles', 'La fenêtre fertile'],
    answerIndex: 1,
    explanation: "Si pas de fécondation, la chute de progestérone déclenche les règles : un nouveau cycle démarre.",
  },
  {
    question: 'Quelle est la durée habituelle des règles ?',
    choices: ['1 à 2 jours', '3 à 7 jours', '10 à 14 jours'],
    answerIndex: 1,
    explanation: 'Entre 3 et 7 jours en général. Au-delà de 8 jours régulièrement, on en parle à un professionnel.',
  },
];

export const QUIZ_BODY: QuizQuestion[] = [
  {
    question: 'Que provoque la chute des hormones avant les règles ?',
    choices: ['Le SPM', "L'ovulation", 'La glaire fertile'],
    answerIndex: 0,
    explanation: 'La chute brutale de progestérone et œstrogènes cause le syndrome prémenstruel (SPM).',
  },
  {
    question: 'Quelles substances causent les crampes menstruelles ?',
    choices: ['Les prostaglandines', 'Les vitamines C', 'Les glucides'],
    answerIndex: 0,
    explanation: 'Les prostaglandines font contracter l’utérus pour évacuer l’endomètre — d’où les crampes.',
  },
  {
    question: 'Quel remède simple soulage vite les crampes ?',
    choices: ['Une bouillotte chaude', "Un bain d'eau froide", 'Rester debout sans bouger'],
    answerIndex: 0,
    explanation: 'La chaleur détend les muscles utérins. Tisanes, magnésium et postures aident aussi.',
  },
  {
    question: 'Le sang brun au début ou à la fin des règles est…',
    choices: ['Un signe de maladie', 'Du sang oxydé, tout à fait normal', 'Un reste de tampon'],
    answerIndex: 1,
    explanation: "C'est du sang qui a mis du temps à s'évacuer et s'est oxydé au contact de l'air.",
  },
  {
    question: 'Une douleur qui empêche d’aller en cours est…',
    choices: ['Normale, il faut supporter', 'À signaler à un professionnel', 'Une faiblesse'],
    answerIndex: 1,
    explanation: "Douleur invalidante ≠ normal. Cela peut évoquer de l'endométriose : parles-en !",
  },
  {
    question: 'Le magnésium aide à…',
    choices: ['Réduire les spasmes musculaires', 'Faire grossir', "Accélérer l'ovulation"],
    answerIndex: 0,
    explanation: 'Le magnésium (et les oméga-3) réduit spasmes et inflammation pendant le cycle.',
  },
  {
    question: 'Le sport pendant les règles est…',
    choices: ['Interdit', 'Bénéfique (endorphines !)', 'Sans effet'],
    answerIndex: 1,
    explanation: 'Le sport doux libère des endorphines qui soulagent naturellement les crampes.',
  },
  {
    question: 'Combien de jours de retard justifie un test de grossesse ?',
    choices: ['Dès le 1er jour de retard', 'Après 1 mois', 'Jamais nécessaire'],
    answerIndex: 0,
    explanation: 'Le test urinaire est fiable dès le 1er jour de retard, au réveil de préférence.',
  },
];

export const QUIZ_FERTILITY: QuizQuestion[] = [
  {
    question: 'Combien de temps les spermatozoïdes survivent-ils ?',
    choices: ['Quelques heures', 'Environ 24 h', "Jusqu'à 5 jours"],
    answerIndex: 2,
    explanation: "Jusqu'à 5 jours dans la glaire fertile ! D'où une fenêtre fertile de 6 jours.",
  },
  {
    question: 'Quelle glaire annonce la fertilité maximale ?',
    choices: ['Sèche et collante', 'Crémeuse blanche', 'Filante comme du blanc d’œuf'],
    answerIndex: 2,
    explanation: "La glaire transparente et élastique « blanc d'œuf » signale la fertilité maximale.",
  },
  {
    question: 'La fenêtre fertile dure environ…',
    choices: ['1 jour', '6 jours', '14 jours'],
    answerIndex: 1,
    explanation: 'Les 5 jours avant l’ovulation + le jour de l’ovulation = 6 jours fertiles.',
  },
  {
    question: 'Que montre le décalage thermique après l’ovulation ?',
    choices: [
      'Une hausse de 0,3 à 0,5 °C persistante',
      'Une chute de 2 °C',
      'Aucun changement'],
    answerIndex: 0,
    explanation: "La progestérone fait monter la température : c'est la preuve que l'ovulation a eu lieu.",
  },
  {
    question: 'Peut-on tomber enceinte pendant les règles ?',
    choices: ['Impossible', 'Rare mais possible', 'Toujours'],
    answerIndex: 1,
    explanation: "Rare mais possible avec des cycles courts ou une ovulation précoce.",
  },
  {
    question: 'Le jour le plus fertile du cycle est…',
    choices: ["La veille de l'ovulation et le jour même", 'Le 1er jour des règles', 'Le 20e jour toujours'],
    answerIndex: 0,
    explanation: "La veille et le jour de l'ovulation sont les pics de fertilité.",
  },
  {
    question: 'Que fait la température corporelle après l’ovulation ?',
    choices: ['Elle reste stable', 'Elle monte légèrement', 'Elle descend fortement'],
    answerIndex: 1,
    explanation: "Montée de 0,3 à 0,5 °C due à la progestérone — mesurée au réveil avant de se lever.",
  },
  {
    question: 'Quand mesure-t-on la température basale ?',
    choices: ['Le soir avant de dormir', 'Au réveil, avant toute activité', 'Après le petit-déjeuner'],
    answerIndex: 1,
    explanation: 'Au réveil, après au moins 3 h de sommeil, avant de bouger — pour une mesure fiable.',
  },
];

export const QUIZ_MYTHS: QuizQuestion[] = [
  {
    question: 'Combien de femmes sur 10 sont touchées par le SOPK ?',
    choices: ['1 sur 10', '5 sur 10', 'Aucune'],
    answerIndex: 0,
    explanation: 'Le SOPK (ovaires polykystiques) touche environ 1 femme sur 10.',
  },
  {
    question: 'Les cycles irréguliers à l’adolescence sont…',
    choices: ['Inquiétants', 'Normaux pendant 2 à 3 ans', 'Une maladie'],
    answerIndex: 1,
    explanation: "L'axe hormonal met 2 à 3 ans après les premières règles à se stabiliser.",
  },
  {
    question: 'Sur pilule contraceptive, les « règles » sont…',
    choices: [
      'De vraies règles naturelles',
      'Des saignements de privation',
      'Une ovulation'],
    answerIndex: 1,
    explanation: "Ce sont des saignements de privation liés à la pause : le cycle naturel est mis en pause.",
  },
  {
    question: 'La thyroïde peut-elle perturber les cycles ?',
    choices: ['Non', 'Oui, un dérèglement perturbe le rythme', 'Seulement après 50 ans'],
    answerIndex: 1,
    explanation: 'Oui : hypo ou hyperthyroïdie perturbe le cycle. Une prise de sang le vérifie.',
  },
  {
    question: 'L’endométriose touche environ…',
    choices: ['1 femme sur 10', '1 femme sur 100', 'Personne'],
    answerIndex: 0,
    explanation: 'Environ 1 femme sur 10. Douleurs invalidantes = consulter, ce n’est pas « à vivre ».',
  },
  {
    question: 'Un sport intense et une alimentation trop restrictive peuvent…',
    choices: ["Améliorer l'ovulation", 'Arrêter les règles', 'Rien changer'],
    answerIndex: 1,
    explanation: 'Le corps se met en économie d’énergie : les règles peuvent disparaître.',
  },
  {
    question: 'Le stress peut-il décaler les règles ?',
    choices: ['Jamais', 'Oui, parfois de plusieurs jours', 'Seulement avec médicaments'],
    answerIndex: 1,
    explanation: "L'axe hormonal est sensible au stress, sommeil et voyages. Décalage fréquent !",
  },
  {
    question: 'Quand consulter pour un retard avec test négatif ?',
    choices: ['Après 3 jours', 'Après 10 jours, ou règles absentes 3 mois', 'Jamais'],
    answerIndex: 1,
    explanation: 'Retard > 10 jours avec test négatif, ou absence de règles 3 mois → avis médical.',
  },
];

export const TRUE_FALSE_SETS: TrueFalseItem[][] = [
  [
    { statement: 'On peut tomber enceinte pendant les règles.', answer: true, explanation: "Rare mais possible : les spermatozoïdes survivent jusqu'à 5 jours." },
    { statement: 'Toutes les femmes ont des cycles de 28 jours pile.', answer: false, explanation: 'De 21 à 35 jours, tout est normal !' },
    { statement: "L'ovulation a toujours lieu le 14e jour.", answer: false, explanation: 'Cela dépend de la durée de ton cycle.' },
    { statement: 'Le sport pendant les règles est déconseillé.', answer: false, explanation: 'Le sport doux soulage grâce aux endorphines !' },
  ],
  [
    { statement: 'Un tampon peut se perdre à l’intérieur du corps.', answer: false, explanation: 'Impossible : le col de l’utérus bloque le passage.' },
    { statement: 'Les règles douloureuses au point de vomir doivent être évaluées.', answer: true, explanation: 'Vrai : possible endométriose ou autre cause traitable.' },
    { statement: 'Le sang brun est un signe de maladie.', answer: false, explanation: 'C’est du sang oxydé, parfaitement normal.' },
    { statement: 'La thyroïde influence le cycle menstruel.', answer: true, explanation: 'Un dérèglement thyroidien perturbe les cycles.' },
  ],
  [
    { statement: 'On ne peut pas tomber enceinte la première fois.', answer: false, explanation: 'Faux ! Une ovulation peut avoir lieu à tout moment du cycle fertile.' },
    { statement: "L'acné et les cheveux peuvent réagir aux hormones du cycle.", answer: true, explanation: 'Vrai : œstrogènes et progestérone influencent peau et cheveux.' },
    { statement: 'Il faut laver son vagin avec un savon spécial chaque jour.', answer: false, explanation: 'Non : le vagin s’auto-nettoie. Une douche externe à l’eau suffit.' },
    { statement: 'On peut être enceinte sans avoir de règles depuis 3 mois sans le savoir.', answer: true, explanation: 'Vrai : en cas d’absence prolongée, un test est recommandé.' },
  ],
];

export const SYMPTOM_SORT_SETS: SymptomSortItem[][] = [
  [
    { label: 'Crampes au ventre', category: 'body', hint: 'Les prostaglandines font contracter l’utérus.' },
    { label: 'Humeur qui change vite', category: 'mind', hint: 'La chute de sérotonine joue sur les émotions.' },
    { label: 'Seins tendus', category: 'body', hint: 'Sensation physique liée aux hormones.' },
    { label: 'Envie de pleurer sans raison', category: 'mind', hint: 'Le SPM touche aussi le moral.' },
  ],
  [
    { label: 'Ballonnements', category: 'body', hint: 'La progestérone ralentit le transit.' },
    { label: 'Irritabilité', category: 'mind', hint: 'Un symptôme émotionnel fréquent du SPM.' },
    { label: 'Maux de tête', category: 'body', hint: 'Les œstrogènes qui chutent peuvent déclencher des migraines.' },
    { label: 'Besoin de solitude', category: 'mind', hint: 'Écouter son besoin de calme est sain.' },
  ],
  [
    { label: 'Acné avant les règles', category: 'body', hint: 'Le rapport œstrogènes/progestérone change la peau.' },
    { label: 'Troubles du sommeil', category: 'mind', hint: 'Le cycle influence le sommeil (et inversement).' },
    { label: 'Dos douloureux', category: 'body', hint: 'Les contractions utérines irradient souvent au dos.' },
    { label: 'Difficulté à se concentrer', category: 'mind', hint: 'Le fameux « brain fog » du SPM.' },
  ],
];

/* ═════════════════════ Mémoire : decks par niveau ═════════════════════ */

export interface MemoryPair {
  emoji: string;
  label: string;
}

export const MEMORY_DECKS: MemoryPair[][] = [
  [
    { emoji: '🌸', label: 'Phase folliculaire' },
    { emoji: '❤️', label: 'Prends soin de toi' },
    { emoji: '🌊', label: 'Fenêtre fertile' },
  ],
  [
    { emoji: '🔥', label: 'Chaleur contre crampes' },
    { emoji: '😴', label: 'Le repos est vital' },
    { emoji: '🤗', label: 'Humeur changeante = normal' },
    { emoji: '🌱', label: 'Ton corps grandit avec toi' },
  ],
  [
    { emoji: '🌸', label: 'Phase folliculaire' },
    { emoji: '🔥', label: 'Chaleur contre crampes' },
    { emoji: '💧', label: "Bois de l'eau !" },
    { emoji: '🧘🏾‍♀️', label: 'Respire profondément' },
    { emoji: '☀️', label: "Marche au soleil" },
    { emoji: '💪🏾', label: 'Tu es plus forte que tu penses' },
  ],
];

/* ═════════════════════ Mondes de l'aventure ═════════════════════ */

export type WorldGameType = 'quiz' | 'truefalse' | 'memory' | 'sort' | 'boss';

export interface WorldLevel {
  /** Titre du niveau */
  title: string;
  /** Type de jeu pour ce niveau */
  game: WorldGameType;
  /** Paramètres selon le jeu : nombre de questions, deck, etc. */
  config: {
    questions?: number;
    /** Erreurs autorisées pour valider le niveau */
    lives?: number;
    deckIndex?: number;
    /** Nombre de colonnes de la grille mémoire */
    pairs?: number;
  };
}

export interface World {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  softBg: string;
  accentText: string;
  levels: WorldLevel[];
}

export const WORLDS: World[] = [
  {
    id: 1,
    title: 'Les Premiers Pas',
    subtitle: 'Découvre les bases de ton cycle',
    emoji: '🌱',
    gradient: 'from-emerald-500 to-green-500',
    softBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    levels: [
      { title: 'Les 4 saisons du cycle', game: 'quiz', config: { questions: 4, lives: 2 } },
      { title: 'Quiz : avancement', game: 'quiz', config: { questions: 4, lives: 1 } },
      { title: 'Idées reçues, épisode 1', game: 'truefalse', config: {} },
      { title: 'La clé du cycle', game: 'memory', config: { deckIndex: 0, pairs: 3 } },
    ],
  },
  {
    id: 2,
    title: 'Le Corps en Fête',
    subtitle: 'Symptômes, remèdes et bon sens',
    emoji: '💗',
    gradient: 'from-rose-500 to-pink-500',
    softBg: 'bg-rose-50',
    accentText: 'text-rose-600',
    levels: [
      { title: 'Quiz : le corps qui parle', game: 'quiz', config: { questions: 5, lives: 2 } },
      { title: 'Tri : corps ou esprit ?', game: 'sort', config: {} },
      { title: 'Idées reçues, épisode 2', game: 'truefalse', config: {} },
      { title: 'Mémoire apaisante', game: 'memory', config: { deckIndex: 1, pairs: 4 } },
    ],
  },
  {
    id: 3,
    title: 'La Fertilité Éclairée',
    subtitle: 'Fenêtre fertile, glaire et température',
    emoji: '✨',
    gradient: 'from-indigo-500 to-violet-500',
    softBg: 'bg-indigo-50',
    accentText: 'text-indigo-600',
    levels: [
      { title: 'Quiz : les signaux fertiles', game: 'quiz', config: { questions: 6, lives: 2 } },
      { title: 'Mémoire fertile', game: 'memory', config: { deckIndex: 2, pairs: 6 } },
      { title: 'Tri : capte les indices', game: 'sort', config: {} },
      { title: 'Quiz sans filet', game: 'quiz', config: { questions: 6, lives: 1 } },
    ],
  },
  {
    id: 4,
    title: 'Les Gardiennes du Savoir',
    subtitle: 'Débusque les fausses croyances',
    emoji: '🛡️',
    gradient: 'from-violet-500 to-purple-500',
    softBg: 'bg-violet-50',
    accentText: 'text-violet-600',
    levels: [
      { title: 'Vrai ou Faux : les légendes', game: 'truefalse', config: {} },
      { title: 'Quiz : démystifier', game: 'quiz', config: { questions: 6, lives: 2 } },
      { title: 'Vrai ou Faux : l’expertise', game: 'truefalse', config: {} },
      { title: 'Le grand tri des gardiennes', game: 'sort', config: {} },
    ],
  },
  {
    id: 5,
    title: 'Le Grand Cycle',
    subtitle: 'Le boss final t’attend',
    emoji: '👑',
    gradient: 'from-amber-500 to-orange-500',
    softBg: 'bg-amber-50',
    accentText: 'text-amber-600',
    levels: [
      { title: 'Épreuve 1 : le corps', game: 'quiz', config: { questions: 6, lives: 1 } },
      { title: 'Épreuve 2 : la fertilité', game: 'quiz', config: { questions: 6, lives: 1 } },
      { title: 'Épreuve 3 : les mythes', game: 'truefalse', config: {} },
      { title: 'Boss final : Le Grand Cycle', game: 'boss', config: { questions: 8, lives: 2 } },
    ],
  },
];

export const TOTAL_LEVELS = WORLDS.reduce((acc, w) => acc + w.levels.length, 0);

/* ═════════════════════ Banque boss (mélange difficile) ═════════════════════ */

export const QUIZ_BOSS: QuizQuestion[] = [
  {
    question: 'Quelle est la bonne séquence des phases ?',
    choices: [
      'Règles → folliculaire → ovulation → lutéale',
      'Folliculaire → règles → lutéale → ovulation',
      'Ovulation → folliculaire → règles → lutéale'],
    answerIndex: 0,
    explanation: 'Règles (J1-5), phase folliculaire, ovulation (~J14), phase lutéale jusqu’aux règles suivantes.',
  },
  {
    question: 'Fenêtre fertile de 6 jours : pourquoi autant ?',
    choices: [
      'Les spermatozoïdes survivent 5 jours',
      "L'ovulation dure 6 jours",
      'La glaire reste fertile 2 semaines'],
    answerIndex: 0,
    explanation: 'Les spermatozoïdes attendent jusqu’à 5 jours + le jour de l’ovulation = 6 jours.',
  },
  {
    question: 'Que produit le corps jaune après l’ovulation ?',
    choices: ['De la progestérone', "De l'insuline", 'Du sang'],
    answerIndex: 0,
    explanation: 'Le corps jaune produit la progestérone qui maintient la muqueuse utérine.',
  },
  {
    question: 'Le décalage thermique post-ovulatoire est de…',
    choices: ['0,3 à 0,5 °C', '1 à 2 °C', '5 °C'],
    answerIndex: 0,
    explanation: 'Une légère montée de 0,3 à 0,5 °C, mesurée au réveil.',
  },
  {
    question: 'Une douleur menstruelle invalidante évoque…',
    choices: ['Une grossesse', "L'endométriose — à faire évaluer", 'Rien d’anormal'],
    answerIndex: 1,
    explanation: 'Douleur qui cloue au lit = consulter. L’endométriose touche 1 femme sur 10.',
  },
  {
    question: 'Cycles > 35 jours très longs + acné + pilosité évoquent…',
    choices: ['Le SOPK', 'Une grossesse', 'Un simple stress'],
    answerIndex: 0,
    explanation: 'Le syndrome des ovaires polykystiques touche 1 femme sur 10 : bilan possible.',
  },
  {
    question: 'Le premier jour du cycle est…',
    choices: ['Le jour de l’ovulation', 'Le 1er jour des règles', 'Le lendemain des règles'],
    answerIndex: 1,
    explanation: 'Convention : J1 = premier jour des règles.',
  },
  {
    question: 'Pourquoi mesurer la température au réveil ?',
    choices: [
      'Pour éviter les variations de la journée',
      'Parce que c’est plus pratique',
      "Pour mesurer l'insuline"],
    answerIndex: 0,
    explanation: 'La température basale doit être prise avant toute activité pour être fiable.',
  },
];

/* ═════════════════════ Progression persistée ═════════════════════ */

export interface LevelProgress {
  stars: number; // 1 à 3
  bestScore?: number;
  bestAccuracy?: number;
  completedAt?: string;
}

export interface AdventureProgress {
  /** clé "worldId-levelIndex" → progrès */
  levels: Record<string, LevelProgress>;
  /** XP total gagné */
  xp: number;
}

const PROGRESS_KEY = 'raoula_adventure_progress_v1';

export function loadProgress(): AdventureProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdventureProgress;
      return { levels: parsed.levels || {}, xp: parsed.xp || 0 };
    }
  } catch {
    // ignore
  }
  return { levels: {}, xp: 0 };
}

export function saveProgress(p: AdventureProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function levelKey(worldId: number, levelIndex: number): string {
  return `${worldId}-${levelIndex}`;
}

/** Niveau débloqué ? Niveau 0 de chaque monde toujours accessible ; sinon niveau précédent du monde complété. */
export function isLevelUnlocked(progress: AdventureProgress, worldId: number, levelIndex: number): boolean {
  if (levelIndex === 0) {
    // Monde 1 toujours accessible ; mondes suivants nécessitent le monde précédent terminé (niveau 0 au moins)
    if (worldId === 1) return true;
    // Le monde précédent doit avoir son premier niveau complété
    const prevWorld = WORLDS[worldId - 2];
    return prevWorld ? !!progress.levels[levelKey(prevWorld.id, 0)] : false;
  }
  return !!progress.levels[levelKey(worldId, levelIndex - 1)];
}

/** Calcule les étoiles selon la précision et les vies restantes. */
export function computeStars(correct: number, total: number, livesLost: number): number {
  const accuracy = total > 0 ? correct / total : 0;
  if (accuracy >= 1 && livesLost === 0) return 3;
  if (accuracy >= 0.75 && livesLost <= 1) return 2;
  return 1;
}

export function totalStars(progress: AdventureProgress): number {
  return Object.values(progress.levels).reduce((acc, l) => acc + l.stars, 0);
}
