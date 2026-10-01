import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Gamepad2,
  Brain,
  Scale,
  Grid3x3,
  ArrowLeft,
  Trophy,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { staggerContainer, fadeUpItem, hapticLight, hapticSuccess } from '../utils/animation';

/* ═══════════════════════════════════════════════════════════════
   Données des jeux — contenu éducatif, bienveillant, non médical
   ═══════════════════════════════════════════════════════════════ */

interface QuizQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

const QUIZ: QuizQuestion[] = [
  {
    question: 'Combien de jours dure en moyenne un cycle menstruel ?',
    choices: ['14 jours', '28 jours', '45 jours'],
    answerIndex: 1,
    explanation:
      "La moyenne est de 28 jours, mais un cycle normal peut aller de 21 à 35 jours. Chaque corps a son rythme !",
  },
  {
    question: 'Quelle phase suit directement les règles ?',
    choices: ['La phase lutéale', 'La phase folliculaire', "La phase d'ovulation"],
    answerIndex: 1,
    explanation:
      "Après les règles, la phase folliculaire commence : les hormones préparent un ovocyte dans les ovaires.",
  },
  {
    question: 'Combien de temps un spermatozoïde peut-il survivre dans le corps ?',
    choices: ['Quelques heures', 'Environ 24 heures', "Jusqu'à 5 jours"],
    answerIndex: 2,
    explanation:
      "Jusqu'à 5 jours dans la glaire fertile ! C'est pourquoi la fenêtre fertile commence avant l'ovulation.",
  },
  {
    question: 'Quelle température indique souvent qu\u2019une ovulation a eu lieu ?',
    choices: [
      'Une chute de 1 °C',
      'Une hausse de 0,3 à 0,5 °C qui persiste',
      'Aucun changement'],
    answerIndex: 1,
    explanation:
      "La progestérone post-ovulatoire fait monter la température de 0,3 à 0,5 °C. Ce décalage thermique confirme l'ovulation.",
  },
  {
    question: 'Le stress peut-il décaler tes règles ?',
    choices: ['Non, jamais', 'Oui, parfois de plusieurs jours', 'Seulement si on prend des médicaments'],
    answerIndex: 1,
    explanation:
      "Oui ! L'axe hormonal est sensible au stress, au sommeil et aux voyages. Un décalage de quelques jours est fréquent.",
  },
  {
    question: 'Quelle glaire annonce la fertilité maximale ?',
    choices: ['Sèche et collante', 'Crémeuse blanche', 'Filante comme du blanc d’œuf'],
    answerIndex: 2,
    explanation:
      "La glaire transparente et élastique « blanc d'œuf » est le meilleur signal de fertilité maximale.",
  },
  {
    question: 'Une douleur qui empêche de vivre sa journée pendant les règles est :',
    choices: [
      'Normale, il faut juste supporter',
      'À signaler à un professionnel de santé',
      'Une excuse pour sécher les cours'],
    answerIndex: 1,
    explanation:
      "Une douleur invalidante n'est PAS normale. Cela peut évoquer de l'endométriose : il faut en parler à un professionnel.",
  },
  {
    question: 'Le sang des règles peut être de couleur…',
    choices: ['Rouge vif uniquement', 'Rouge, brun ou rosé — c’est normal', 'Noir (grave !)'],
    answerIndex: 1,
    explanation:
      "Rouge vif, brun ou rosé : tout est normal. Le brun est du sang oxydé qui a mis du temps à s'évacuer.",
  },
];

interface TrueFalse {
  statement: string;
  answer: boolean;
  explanation: string;
}

const TRUE_FALSE: TrueFalse[] = [
  {
    statement: 'On peut tomber enceinte pendant les règles.',
    answer: true,
    explanation:
      "C'est rare mais possible, surtout avec des cycles courts ou une ovulation précoce : les spermatozoïdes survivent jusqu'à 5 jours.",
  },
  {
    statement: 'Toutes les femmes ont des cycles de exactement 28 jours.',
    answer: false,
    explanation:
      "Faux ! De 21 à 35 jours, tout est normal. Même d'un mois à l'autre, 2 à 4 jours de variation sont habituels.",
  },
  {
    statement: "L'ovulation a toujours lieu le 14e jour.",
    answer: false,
    explanation:
      "Faux ! Le 14e jour est une moyenne sur un cycle de 28 jours. Pour un cycle de 32 jours, l'ovulation tombe souvent vers le 18e jour.",
  },
  {
    statement: "La chute de cheveux ou l'acné du cycle peut être liée aux hormones.",
    answer: true,
    explanation:
      "Vrai ! Les fluctuations d'œstrogènes et de progestérone influencent peau et cheveux au fil du cycle.",
  },
  {
    statement: 'Un tampon peut se perdre à l’intérieur du corps.',
    answer: false,
    explanation:
      "Faux : anatomiquement impossible — le col de l'utérus bloque le passage. Mais respecte la durée maximale d'utilisation (4 à 8 h).",
  },
  {
    statement: 'Faire du sport pendant les règles est déconseillé.',
    answer: false,
    explanation:
      "Faux ! Le sport doux (marche, yoga, natation) libère des endorphines qui soulagent souvent les crampes.",
  },
  {
    statement: "Les règles douloureuses au point de vomir doivent être évaluées par un médecin.",
    answer: true,
    explanation:
      "Vrai ! Cela peut signaler de l'endométriose ou un autre problème traitable. N'attend pas pour en parler.",
  },
  {
    statement: 'La pilule contraceptive rend les cycles réguliers Naturellement.',
    answer: false,
    explanation:
      "Faux : sur pilule, les « règles » sont des saignements de privation provoqués par la pause. Le cycle naturel est mis en pause.",
  },
];

const MEMORY_PAIRS = [
  { emoji: '🌸', label: 'Phase folliculaire' },
  { emoji: '❤️', label: 'Prends soin de toi' },
  { emoji: '🌊', label: 'Fenêtre fertile' },
  { emoji: '🔥', label: 'Chaleur = crampes soulagées' },
  { emoji: '😴', label: 'Le repos est vital' },
  { emoji: '🤗', label: 'Humeur changeante = normal' },
] as const;

/* ═══════════════════════════════════════════════════════════════
   Utilitaires score local
   ═══════════════════════════════════════════════════════════════ */

const SCORE_KEY = 'raoula_games_scores';

function loadScores(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveScore(game: string, value: number): void {
  try {
    const scores = loadScores();
    if (!scores[game] || value > scores[game]) {
      scores[game] = value;
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    }
  } catch {
    // ignore
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ═══════════════════════════════════════════════════════════════
   Vue principale
   ═══════════════════════════════════════════════════════════════ */

type GameId = 'quiz' | 'truefalse' | 'memory' | null;

export const GamesView: React.FC = () => {
  const [game, setGame] = useState<GameId>(null);
  const [scores, setScores] = useState<Record<string, number>>(() => loadScores());

  const registerScore = (gameId: string, value: number) => {
    saveScore(gameId, value);
    setScores(loadScores());
  };

  const backToHub = () => setGame(null);

  const GAMES = [
    {
      id: 'quiz' as const,
      title: 'Quiz « Mon cycle & moi »',
      desc: '8 questions pour devenir experte de ton corps',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-rose-500 to-pink-500',
      scoreLabel: 'Meilleur score',
      score: scores.quiz != null ? `${scores.quiz}/8` : null,
    },
    {
      id: 'truefalse' as const,
      title: 'Vrai ou Faux',
      desc: 'Débusque les idées reçues sur les règles',
      icon: <Scale className="w-6 h-6" />,
      gradient: 'from-violet-500 to-purple-500',
      scoreLabel: 'Meilleure série',
      score: scores.truefalse != null ? `${scores.truefalse}/8` : null,
    },
    {
      id: 'memory' as const,
      title: 'Mémoire des émotions',
      desc: 'Retrouve les paires et leurs petits messages',
      icon: <Grid3x3 className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-violet-500',
      scoreLabel: 'Meilleur score (moins de coups)',
      score: scores.memory != null ? `${scores.memory} coups` : null,
    },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      {/* Hero */}
      <motion.div
        variants={fadeUpItem}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-5 sm:p-7 shadow-md shadow-purple-600/20"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-14 -left-6 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/20"
          >
            <Gamepad2 className="w-6 h-6" />
          </motion.div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-100/90 block">
              Espace Jeux
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Apprends en t'amusant 🎮
            </h2>
            <p className="text-xs sm:text-sm text-purple-50/90 mt-1.5 leading-relaxed max-w-xl">
              Des mini-jeux pour connaître ton corps, casser les idées reçues et détendre l'esprit.
              100 % hors-ligne, aucune donnée enregistrée en ligne.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contenu : hub ou jeu actif */}
      <AnimatePresence mode="wait">
        {game === null && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {GAMES.map((g) => (
              <motion.button
                key={g.id}
                onClick={() => {
                  hapticLight();
                  setGame(g.id);
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200 shadow-xs text-left cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.gradient} text-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform`}
                >
                  {g.icon}
                </div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">{g.title}</h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">{g.desc}</p>
                {g.score && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    <Trophy className="w-3 h-3" />
                    {g.scoreLabel} : {g.score}
                  </div>
                )}
                <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-stone-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            ))}

            {/* Note pédagogique */}
            <motion.div
              variants={fadeUpItem}
              className="sm:col-span-3 p-3.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 flex items-start gap-2"
            >
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Les scores sont gardés uniquement sur ton appareil. Ces jeux donnent des repères
                généraux : ce n'est pas un avis médical.
              </span>
            </motion.div>
          </motion.div>
        )}

        {game === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <QuizGame onScore={(v) => registerScore('quiz', v)} onExit={backToHub} />
          </motion.div>
        )}

        {game === 'truefalse' && (
          <motion.div
            key="truefalse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TrueFalseGame onScore={(v) => registerScore('truefalse', v)} onExit={backToHub} />
          </motion.div>
        )}

        {game === 'memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <MemoryGame onScore={(v) => registerScore('memory', v)} onExit={backToHub} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JEU 1 : QUIZ
   ═══════════════════════════════════════════════════════════════ */

const QuizGame: React.FC<{ onScore: (v: number) => void; onExit: () => void }> = ({ onScore, onExit }) => {
  const questions = useMemo(() => shuffle(QUIZ), []);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[step];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answerIndex) {
      setScore((s) => s + 1);
      hapticSuccess();
    } else {
      hapticLight();
    }
  };

  const next = () => {
    if (step + 1 >= questions.length) {
      const finalScore = score;
      onScore(finalScore);
      setDone(true);
    } else {
      setStep((s) => s + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStep(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const perfect = score === questions.length;
    return (
      <GameShell onExit={onExit} title="Quiz « Mon cycle & moi »">
        <div className="text-center py-8 space-y-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              perfect ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
            }`}
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h3 className="text-xl font-black text-stone-900">
            {score} / {questions.length} bonnes réponses
          </h3>
          <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
            {perfect
              ? 'Parfait ! Tu maîtrises ton cycle mieux que personne. 🏆'
              : score >= 6
                ? 'Très bien ! Tu connais bien ton corps, continue. ✨'
                : 'Beau début — refais un tour dans les guides Conseils et retente ta chance !'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Rejouer
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Retour aux jeux
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onExit={onExit} title="Quiz « Mon cycle & moi »">
      {/* Progression */}
      <div className="flex items-center gap-1.5 mb-4">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < step ? 'w-6 bg-rose-400' : i === step ? 'w-8 bg-rose-500' : 'w-4 bg-stone-200'
            }`}
          />
        ))}
        <span className="ml-auto text-[11px] font-medium text-stone-400">
          {step + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <h3 className="text-base font-bold text-stone-900 mb-4 leading-snug">{q.question}</h3>

          <div className="space-y-2">
            {q.choices.map((choice, i) => {
              const isAnswer = i === q.answerIndex;
              const isPicked = picked === i;
              const showState = picked !== null;
              return (
                <motion.button
                  key={i}
                  onClick={() => pick(i)}
                  whileTap={picked === null ? { scale: 0.98 } : undefined}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    showState
                      ? isAnswer
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isPicked
                          ? 'bg-red-50 border-red-300 text-red-900'
                          : 'bg-white border-stone-100 text-stone-400'
                      : 'bg-white border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-stone-800'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{choice}</span>
                    {showState && isAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {showState && isPicked && !isAnswer && <X className="w-4 h-4 text-red-500 shrink-0" />}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{q.explanation}</span>
                </div>
                <button
                  onClick={next}
                  className="mt-4 w-full py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
                >
                  {step + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </GameShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JEU 2 : VRAI / FAUX
   ═══════════════════════════════════════════════════════════════ */

const TrueFalseGame: React.FC<{ onScore: (v: number) => void; onExit: () => void }> = ({ onScore, onExit }) => {
  const items = useMemo(() => shuffle(TRUE_FALSE), []);
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);

  const item = items[step];

  const answer = (v: boolean) => {
    if (answered !== null) return;
    setAnswered(v);
    if (v === item.answer) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      hapticSuccess();
    } else {
      setStreak(0);
      hapticLight();
    }
  };

  const next = () => {
    if (step + 1 >= items.length) {
      const finalBest = Math.max(bestStreak, streak);
      onScore(finalBest);
      setDone(true);
    } else {
      setStep((s) => s + 1);
      setAnswered(null);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswered(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setDone(false);
  };

  if (done) {
    return (
      <GameShell onExit={onExit} title="Vrai ou Faux">
        <div className="text-center py-8 space-y-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="w-20 h-20 mx-auto rounded-full bg-violet-50 text-violet-500 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h3 className="text-xl font-black text-stone-900">
            {score} / {items.length} idées reçues débusquées
          </h3>
          <p className="text-sm text-stone-600">
            Meilleure série : <strong className="text-violet-700">{bestStreak} 🔥</strong>
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Rejouer
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Retour aux jeux
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onExit={onExit} title="Vrai ou Faux">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < step ? 'w-5 bg-violet-400' : i === step ? 'w-7 bg-violet-500' : 'w-3.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
        {streak > 1 && (
          <motion.span
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full"
          >
            🔥 {streak} d'affilée
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22 }}
        >
          <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-6 sm:p-8 mb-4 min-h-36 flex items-center justify-center">
            <p className="text-base sm:text-lg font-bold text-stone-900 text-center leading-relaxed">
              « {item.statement} »
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => answer(true)}
              whileTap={answered === null ? { scale: 0.96 } : undefined}
              className={`py-4 rounded-2xl text-base font-bold border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                answered === null
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : item.answer === true
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                    : 'bg-white border-stone-100 text-stone-300'
              }`}
            >
              <Check className="w-6 h-6" />
              Vrai
            </motion.button>
            <motion.button
              onClick={() => answer(false)}
              whileTap={answered === null ? { scale: 0.96 } : undefined}
              className={`py-4 rounded-2xl text-base font-bold border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                answered === null
                  ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                  : item.answer === false
                    ? 'bg-red-500 border-red-500 text-white shadow-md'
                    : 'bg-white border-stone-100 text-stone-300'
              }`}
            >
              <X className="w-6 h-6" />
              Faux
            </motion.button>
          </div>

          <AnimatePresence>
            {answered !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    answered === item.answer
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
                      : 'bg-amber-50 border-amber-100 text-amber-950'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item.explanation}</span>
                </div>
                <button
                  onClick={next}
                  className="mt-4 w-full py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors cursor-pointer"
                >
                  {step + 1 >= items.length ? 'Voir mon score' : 'Affirmation suivante'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </GameShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JEU 3 : MÉMOIRE DES ÉMOTIONS
   ═══════════════════════════════════════════════════════════════ */

interface MemoryCard {
  key: number;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryGame: React.FC<{ onScore: (v: number) => void; onExit: () => void }> = ({ onScore, onExit }) => {
  const [cards, setCards] = useState<MemoryCard[]>(() => {
    const deck = MEMORY_PAIRS.flatMap((p, i) => [
      { key: i * 2, emoji: p.emoji, label: p.label, flipped: false, matched: false },
      { key: i * 2 + 1, emoji: p.emoji, label: p.label, flipped: false, matched: false },
    ]);
    return shuffle(deck);
  });
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  const flip = (key: number) => {
    if (locked || done) return;
    const card = cards.find((c) => c.key === key);
    if (!card || card.flipped || card.matched) return;
    hapticLight();

    const newCards = cards.map((c) => (c.key === key ? { ...c, flipped: true } : c));
    setCards(newCards);

    if (firstPick === null) {
      setFirstPick(key);
      return;
    }

    const first = newCards.find((c) => c.key === firstPick)!;
    setMoves((m) => m + 1);
    setLocked(true);

    if (first.emoji === card.emoji) {
      // Paire trouvée
      const pair = MEMORY_PAIRS.find((p) => p.emoji === card.emoji);
      setLastMatch(pair?.label || null);
      setTimeout(() => {
        setCards((cs) =>
          cs.map((c) => (c.emoji === card.emoji ? { ...c, matched: true, flipped: true } : c))
        );
        setFirstPick(null);
        setLocked(false);
        hapticSuccess();
        // Vérifie la fin
        setCards((cs) => {
          if (cs.every((c) => c.matched)) {
            onScore(moves + 1);
            setDone(true);
          }
          return cs;
        });
      }, 450);
    } else {
      setTimeout(() => {
        setCards((cs) =>
          cs.map((c) => (c.key === firstPick || c.key === key ? { ...c, flipped: false } : c))
        );
        setFirstPick(null);
        setLocked(false);
        setLastMatch(null);
      }, 750);
    }
  };

  const restart = () => {
    const deck = MEMORY_PAIRS.flatMap((p, i) => [
      { key: i * 2, emoji: p.emoji, label: p.label, flipped: false, matched: false },
      { key: i * 2 + 1, emoji: p.emoji, label: p.label, flipped: false, matched: false },
    ]);
    setCards(shuffle(deck));
    setFirstPick(null);
    setMoves(0);
    setLocked(false);
    setDone(false);
    setLastMatch(null);
  };

  if (done) {
    return (
      <GameShell onExit={onExit} title="Mémoire des émotions">
        <div className="text-center py-8 space-y-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="w-20 h-20 mx-auto rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>
          <h3 className="text-xl font-black text-stone-900">Terminé en {moves} coups !</h3>
          <p className="text-sm text-stone-600 max-w-sm mx-auto">
            {moves <= 9
              ? 'Mémoire de championne ! 🏆'
              : moves <= 13
                ? 'Très bien joué ! ✨'
                : 'Chaque partie entraîne ta mémoire, retente !'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Rejouer
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Retour aux jeux
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onExit={onExit} title="Mémoire des émotions">
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-medium text-stone-500">
          Coups : <strong className="text-stone-900">{moves}</strong>
        </span>
        <span className="font-medium text-stone-500">
          Paires :{' '}
          <strong className="text-stone-900">
            {cards.filter((c) => c.matched).length / 2}/{MEMORY_PAIRS.length}
          </strong>
        </span>
      </div>

      <AnimatePresence>
        {lastMatch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900 font-medium text-center"
          >
            {lastMatch} 💜
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.key}
            onClick={() => flip(card.key)}
            whileTap={{ scale: 0.94 }}
            animate={card.matched ? { scale: [1, 1.12, 1] } : {}}
            className={`aspect-square rounded-2xl text-2xl sm:text-3xl flex items-center justify-center border-2 transition-colors cursor-pointer ${
              card.matched
                ? 'bg-emerald-50 border-emerald-200 opacity-90'
                : card.flipped
                  ? 'bg-white border-indigo-300 shadow-sm'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-500 border-transparent hover:brightness-110 shadow-sm'
            }`}
          >
            {card.flipped || card.matched ? (
              <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                {card.emoji}
              </motion.span>
            ) : (
              <span className="text-white/70 text-lg">?</span>
            )}
          </motion.button>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-stone-400 text-center">
        Retrouve les 6 paires en un minimum de coups. Chaque paire révèle un petit message positif 💜
      </p>
    </GameShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Coquille commune : en-tête avec retour
   ═══════════════════════════════════════════════════════════════ */

const GameShell: React.FC<{ title: string; onExit: () => void; children: React.ReactNode }> = ({
  title,
  onExit,
  children,
}) => (
  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Tous les jeux
      </button>
      <h3 className="text-sm font-bold text-stone-900">{title}</h3>
    </div>
    {children}
  </div>
);
