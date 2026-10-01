import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Gamepad2,
  ArrowLeft,
  Trophy,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  Star,
  Heart,
  Scale,
  Grid3x3,
  Brain,
  ListFilter,
  Crown,
  Flame,
  Zap,
} from 'lucide-react';
import { staggerContainer, fadeUpItem, hapticLight, hapticSuccess } from '../utils/animation';
import { AdventureDiploma } from './AdventureDiploma';
import {
  WORLDS,
  TOTAL_LEVELS,
  QUIZ_PHASES,
  QUIZ_BODY,
  QUIZ_FERTILITY,
  QUIZ_MYTHS,
  QUIZ_BOSS,
  TRUE_FALSE_SETS,
  SYMPTOM_SORT_SETS,
  MEMORY_DECKS,
  loadProgress,
  saveProgress,
  levelKey,
  isLevelUnlocked,
  computeStars,
  totalStars,
  type AdventureProgress,
  type QuizQuestion,
  type TrueFalseItem,
  type SymptomSortItem,
  type MemoryPair,
  type World,
  type WorldLevel,
} from '../games/adventureData';

/* ═════════════════════ Sélection de questions selon le monde ═════════════════════ */

function quizBankForWorld(world: World): QuizQuestion[] {
  switch (world.id) {
    case 1: return QUIZ_PHASES;
    case 2: return QUIZ_BODY;
    case 3: return QUIZ_FERTILITY;
    case 4: return QUIZ_MYTHS;
    default: return QUIZ_BOSS;
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

/* ═════════════════════ Vue principale ═════════════════════ */

type Route =
  | { view: 'map' }
  | { view: 'world'; world: World }
  | { view: 'play'; world: World; levelIndex: number };

export const GamesView: React.FC<{ userName?: string }> = ({ userName }) => {
  const [route, setRoute] = useState<Route>({ view: 'map' });
  const [progress, setProgress] = useState<AdventureProgress>(() => loadProgress());
  const [showCeremony, setShowCeremony] = useState(false);

  const completeLevel = (
    worldId: number,
    levelIndex: number,
    stars: number,
    score: number,
    accuracy: number
  ) => {
    setProgress((prev) => {
      const key = levelKey(worldId, levelIndex);
      const existing = prev.levels[key];
      const newLevelProgress = {
        stars: Math.max(existing?.stars || 0, stars),
        bestScore: Math.max(existing?.bestScore || 0, score),
        bestAccuracy: Math.max(existing?.bestAccuracy || 0, accuracy),
        completedAt: new Date().toISOString(),
      };
      const next: AdventureProgress = {
        levels: { ...prev.levels, [key]: newLevelProgress },
        xp: prev.xp + stars * 30 + score * 5,
      };
      saveProgress(next);
      return next;
    });
  };

  const stars = totalStars(progress);
  const completedLevels = Object.keys(progress.levels).length;
  const adventureDone = completedLevels >= TOTAL_LEVELS;

  // Cérémonie automatique : s'affiche une fois quand le dernier niveau est validé
  React.useEffect(() => {
    if (adventureDone && !showCeremony) {
      const dismissed = (() => {
        try {
          return localStorage.getItem('raoula_ceremony_seen') === '1';
        } catch {
          return false;
        }
      })();
      if (!dismissed) {
        setShowCeremony(true);
        try {
          localStorage.setItem('raoula_ceremony_seen', '1');
        } catch {
          // ignore
        }
      }
    }
  }, [adventureDone, showCeremony]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      {/* Hero */}
      <motion.div
        variants={fadeUpItem}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-5 sm:p-7 shadow-md shadow-purple-600/20"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-14 -left-6 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/20"
            >
              <Gamepad2 className="w-6 h-6" />
            </motion.div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-100/90 block">
                Aventure
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {adventureDone ? 'Aventure terminée, championne ! 👑' : 'Le Cycle & Moi'}
              </h2>
              <p className="text-xs sm:text-sm text-purple-50/90 mt-1 leading-relaxed max-w-xl">
                {adventureDone
                  ? 'Tu as vaincu le Grand Cycle. Rejoue pour améliorer tes étoiles !'
                  : '5 mondes, 20 niveaux et un boss final pour devenir experte de ton corps.'}
              </p>
              {adventureDone && (
                <button
                  onClick={() => setShowCeremony(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-200 hover:to-yellow-300 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Voir mon diplôme de Gardienne du Cycle
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-white shrink-0">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center text-amber-300 font-black text-lg">
                <Star className="w-4 h-4 fill-current" />
                {stars}
                <span className="text-white/60 font-medium text-xs">/{TOTAL_LEVELS * 3}</span>
              </div>
              <div className="text-[10px] text-white/70">étoiles</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center font-black text-lg">
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                {progress.xp}
              </div>
              <div className="text-[10px] text-white/70">XP</div>
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="relative mt-4">
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(completedLevels / TOTAL_LEVELS) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-white/70 mt-1 text-right">
            {completedLevels}/{TOTAL_LEVELS} niveaux terminés
          </p>
        </div>
      </motion.div>

      {/* Contenu selon la route */}
      <AnimatePresence mode="wait">
        {route.view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Parcours des mondes */}
            <div className="relative">
              {/* Ligne de connexion verticale */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-stone-200 hidden sm:block" aria-hidden="true" />
              <div className="space-y-3">
                {WORLDS.map((world, wIdx) => {
                  const worldDone = world.levels.every((_, li) => progress.levels[levelKey(world.id, li)]);
                  const worldStars = world.levels.reduce(
                    (acc, _, li) => acc + (progress.levels[levelKey(world.id, li)]?.stars || 0),
                    0
                  );
                  const worldUnlocked = wIdx === 0 || !!progress.levels[levelKey(WORLDS[wIdx - 1].id, 0)];
                  return (
                    <motion.button
                      key={world.id}
                      onClick={() => {
                        if (!worldUnlocked) return;
                        hapticLight();
                        setRoute({ view: 'world', world });
                      }}
                      whileHover={worldUnlocked ? { y: -2 } : undefined}
                      whileTap={worldUnlocked ? { scale: 0.99 } : undefined}
                      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl border shadow-xs flex items-center gap-4 cursor-pointer transition-colors ${
                        worldUnlocked
                          ? 'bg-white border-stone-200 hover:shadow-sm'
                          : 'bg-stone-50 border-stone-100 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                          worldUnlocked
                            ? `bg-gradient-to-br ${world.gradient} text-white`
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {worldUnlocked ? world.emoji : <Lock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm sm:text-base font-bold ${worldUnlocked ? 'text-stone-900' : 'text-stone-400'}`}>
                            Monde {world.id} · {world.title}
                          </h3>
                          {worldDone && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${world.softBg} ${world.accentText}`}>
                              ✓ Terminé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {worldUnlocked ? world.subtitle : `Termine le monde ${world.id - 1} pour débloquer`}
                        </p>
                        {worldUnlocked && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {Array.from({ length: world.levels.length * 3 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < worldStars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-stone-100 text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <Sparkles className={`w-4 h-4 shrink-0 ${worldUnlocked ? world.accentText : 'text-stone-300'}`} />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Termine les niveaux pour gagner des étoiles ⭐ et de l'XP ⚡. Rejoue un niveau terminé pour
                améliorer ta note. Ta progression reste sur ton appareil. Ce n'est pas un avis médical.
              </span>
            </div>
          </motion.div>
        )}

        {route.view === 'world' && (
          <motion.div
            key={`world-${route.world.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <WorldMap
              world={route.world}
              progress={progress}
              onBack={() => setRoute({ view: 'map' })}
              onPlay={(levelIndex) => setRoute({ view: 'play', world: route.world, levelIndex })}
            />
          </motion.div>
        )}

        {route.view === 'play' && (
          <motion.div
            key={`play-${route.world.id}-${route.levelIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <PlayLevel
              world={route.world}
              levelIndex={route.levelIndex}
              progress={progress}
              onBack={() => setRoute({ view: 'world', world: route.world })}
              onComplete={(stars, score, accuracy) =>
                completeLevel(route.world.id, route.levelIndex, stars, score, accuracy)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cérémonie de fin : diplôme imprimable */}
      <AnimatePresence>
        {showCeremony && (
          <AdventureDiploma
            userName={userName}
            stars={stars}
            maxStars={TOTAL_LEVELS * 3}
            xp={progress.xp}
            onClose={() => setShowCeremony(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═════════════════════ Carte d'un monde (liste des niveaux) ═════════════════════ */

const WorldMap: React.FC<{
  world: World;
  progress: AdventureProgress;
  onBack: () => void;
  onPlay: (levelIndex: number) => void;
}> = ({ world, progress, onBack, onPlay }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Carte de l'aventure
      </button>

      <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${world.gradient} text-white mb-5 shadow-sm`}>
        <span className="text-3xl">{world.emoji}</span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 block">
            Monde {world.id}
          </span>
          <h3 className="text-lg font-black">{world.title}</h3>
          <p className="text-xs text-white/85">{world.subtitle}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {world.levels.map((level, li) => {
          const unlocked = isLevelUnlocked(progress, world.id, li);
          const lp = progress.levels[levelKey(world.id, li)];
          const gameIcon =
            level.game === 'quiz' ? <Brain className="w-4 h-4" />
            : level.game === 'truefalse' ? <Scale className="w-4 h-4" />
            : level.game === 'memory' ? <Grid3x3 className="w-4 h-4" />
            : level.game === 'sort' ? <ListFilter className="w-4 h-4" />
            : <Crown className="w-4 h-4" />;
          return (
            <motion.button
              key={li}
              onClick={() => {
                if (!unlocked) {
                  hapticLight();
                  return;
                }
                hapticLight();
                onPlay(li);
              }}
              whileHover={unlocked ? { x: 3 } : undefined}
              whileTap={unlocked ? { scale: 0.98 } : undefined}
              className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                unlocked
                  ? lp
                    ? `${world.softBg} border border-stone-200`
                    : 'bg-white border-stone-200 hover:border-stone-300'
                  : 'bg-stone-50 border-stone-100 opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  unlocked
                    ? lp
                      ? `bg-gradient-to-br ${world.gradient} text-white`
                      : `${world.softBg} ${world.accentText}`
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {unlocked ? gameIcon : <Lock className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm font-bold ${unlocked ? 'text-stone-900' : 'text-stone-400'}`}>
                    Niveau {li + 1} · {level.title}
                  </span>
                  {level.game === 'boss' && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> BOSS
                    </span>
                  )}
                </div>
                {!unlocked && (
                  <span className="text-[11px] text-stone-400">Termine le niveau précédent</span>
                )}
                {lp && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= lp.stars ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-200'}`}
                      />
                    ))}
                    <span className="text-[10px] text-stone-400 ml-1">
                      Rejouer pour améliorer
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/* ═════════════════════ Gestion d'un niveau en cours ═════════════════════ */

const PlayLevel: React.FC<{
  world: World;
  levelIndex: number;
  progress: AdventureProgress;
  onBack: () => void;
  onComplete: (stars: number, score: number, accuracy: number) => void;
}> = ({ world, levelIndex, progress, onBack, onComplete }) => {
  const level: WorldLevel = world.levels[levelIndex];
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<{
    stars: number;
    score: number;
    total: number;
    livesLost: number;
    accuracy: number;
  } | null>(null);

  const prevResult = progress.levels[levelKey(world.id, levelIndex)];
  const lives = level.config.lives ?? 0;

  const finish = (score: number, total: number, livesLost: number) => {
    const stars = computeStars(score, total, livesLost);
    const accuracy = total > 0 ? score / total : 0;
    onComplete(stars, score, accuracy);
    setResult({ stars, score, total, livesLost, accuracy });
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Monde {world.id}
        </button>
        <h3 className="text-sm font-bold text-stone-900">
          Niveau {levelIndex + 1} · {level.title}
        </h3>
        {/* Vies */}
        <div className="flex items-center gap-0.5">
          {lives > 0 ? (
            Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className={`w-4 h-4 ${result ? 'text-stone-200' : 'fill-rose-500 text-rose-500'}`} />
            ))
          ) : (
            <span className="text-[10px] text-stone-400">sans vies</span>
          )}
        </div>
      </div>

      {result ? (
        <LevelVictory
          world={world}
          result={result}
          isBoss={level.game === 'boss'}
          onReplay={() => {
            setResult(null);
            setRunId((r) => r + 1);
          }}
          onNext={() => {
            setResult(null);
            if (levelIndex + 1 < world.levels.length) {
              // reste dans le même PlayLevel : on ne peut pas changer levelIndex ici,
              // onBack ramène à la carte du monde où le niveau suivant est débloqué
              onBack();
            } else {
              onBack();
            }
          }}
          hasNext={levelIndex + 1 < world.levels.length}
          prevStars={prevResult?.stars || 0}
        />
      ) : (
        <LevelGame
          key={runId}
          world={world}
          level={level}
          onWin={(score, total, livesLost) => finish(score, total, livesLost)}
          onLivesExhausted={(score, total) => finish(score, total, lives)}
        />
      )}
    </div>
  );
};

/* ═════════════════════ Écran de victoire ═════════════════════ */

const LevelVictory: React.FC<{
  world: World;
  result: { stars: number; score: number; total: number; livesLost: number; accuracy: number };
  isBoss: boolean;
  hasNext: boolean;
  prevStars: number;
  onReplay: () => void;
  onNext: () => void;
}> = ({ world, result, isBoss, hasNext, prevStars, onReplay, onNext }) => {
  const better = result.stars >= prevStars;
  return (
    <div className="text-center py-6 space-y-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 16 }}
        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${world.gradient} text-white flex items-center justify-center shadow-lg`}
      >
        {isBoss ? <Crown className="w-10 h-10" /> : <Trophy className="w-10 h-10" />}
      </motion.div>

      <h3 className="text-xl font-black text-stone-900">
        {isBoss ? 'Le Grand Cycle est vaincu ! 👑' : 'Niveau terminé !'}
      </h3>

      {/* Étoiles animées */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + s * 0.2, type: 'spring', stiffness: 300, damping: 14 }}
          >
            <Star
              className={`w-9 h-9 ${
                s <= result.stars ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-200'
              }`}
            />
          </motion.div>
        ))}
      </div>

      <p className="text-sm text-stone-600">
        Score : <strong>{result.score}/{result.total}</strong> · Précision :{' '}
        <strong>{Math.round(result.accuracy * 100)} %</strong>
        {!better && prevStars > 0 && (
          <span className="block text-[11px] text-stone-400 mt-0.5">
            Record précédent : {prevStars} ⭐
          </span>
        )}
      </p>

      {better && result.stars > prevStars && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs font-bold text-amber-600"
        >
          🎉 Nouveau record pour ce niveau ! +{result.stars * 30} XP
        </motion.p>
      )}

      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Rejouer
        </button>
        <button
          onClick={onNext}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer bg-gradient-to-r ${world.gradient} shadow-sm`}
        >
          {hasNext ? 'Niveau suivant' : isBoss ? 'Carte de l’aventure' : 'Retour au monde'}
        </button>
      </div>
    </div>
  );
};

/* ═════════════════════ Router des mini-jeux ═════════════════════ */

const LevelGame: React.FC<{
  world: World;
  level: WorldLevel;
  onWin: (score: number, total: number, livesLost: number) => void;
  onLivesExhausted: (score: number, total: number) => void;
}> = ({ world, level, onWin, onLivesExhausted }) => {
  const maxLives = level.config.lives ?? 0;
  const [livesLost, setLivesLost] = useState(0);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);
  const [total, setTotal] = useState(0);

  // Vérifie l'échec après une erreur
  const registerAnswer = (correct: boolean, questionsTotal: number) => {
    const newScore = correct ? score + 1 : score;
    const newLost = correct ? livesLost : livesLost + 1;
    setScore(newScore);
    setLivesLost(newLost);
    if (maxLives > 0 && newLost > maxLives) {
      onLivesExhausted(newScore, questionsTotal);
    }
    return { newScore, newLost };
  };

  const common = { world, level, registerAnswer, finish: () => onWin(score, total, livesLost) };
  void step;
  void total;
  void setStep;
  void setTotal;

  switch (level.game) {
    case 'quiz':
    case 'boss': {
      const bank = level.game === 'boss' ? QUIZ_BOSS : quizBankForWorld(world);
      const n = level.config.questions ?? 4;
      return (
        <QuizRun
          key={`${world.id}-${levelIndex(world, level)}-quiz`}
          questions={shuffle(bank).slice(0, n)}
          maxLives={maxLives}
          onAnswer={(correct, totalSoFar) => {
            const { newScore, newLost } = registerAnswer(correct, totalSoFar);
            return { newScore, newLost };
          }}
          onEnd={(finalScore, finalTotal, lost) => onWin(finalScore, finalTotal, lost)}
          onFail={(finalScore, finalTotal, lost) => onLivesExhausted(finalScore, finalTotal)}
          accent={`bg-gradient-to-r ${world.gradient}`}
          softBg={world.softBg}
          accentText={world.accentText}
        />
      );
    }
    case 'truefalse':
      return (
        <TrueFalseRun
          items={TRUE_FALSE_SETS[Math.min(world.id - 1, TRUE_FALSE_SETS.length - 1)]}
          maxLives={maxLives}
          onEnd={(finalScore, finalTotal, lost) => onWin(finalScore, finalTotal, lost)}
          onFail={(finalScore, finalTotal) => onLivesExhausted(finalScore, finalTotal)}
          softBg={world.softBg}
          accentText={world.accentText}
        />
      );
    case 'memory':
      return (
        <MemoryRun
          deck={MEMORY_DECKS[level.config.deckIndex ?? 0]}
          onEnd={(moves) => onWin(moves === 0 ? 1 : 1, 1, 0)}
          softBg={world.softBg}
          accentText={world.accentText}
        />
      );
    case 'sort':
      return (
        <SortRun
          items={shuffle(SYMPTOM_SORT_SETS[Math.min(world.id - 1, SYMPTOM_SORT_SETS.length - 1)])}
          maxLives={maxLives}
          onEnd={(finalScore, finalTotal, lost) => onWin(finalScore, finalTotal, lost)}
          onFail={(finalScore, finalTotal) => onLivesExhausted(finalScore, finalTotal)}
          softBg={world.softBg}
          accentText={world.accentText}
        />
      );
    default:
      return null;
  }
};

function levelIndex(_world: World, level: WorldLevel): string {
  return level.title;
}

/* ═════════════════════ Quiz générique en run ═════════════════════ */

const QuizRun: React.FC<{
  questions: QuizQuestion[];
  maxLives: number;
  onAnswer?: (correct: boolean, totalSoFar: number) => void;
  onEnd: (score: number, total: number, livesLost: number) => void;
  onFail: (score: number, total: number, livesLost: number) => void;
  accent: string;
  softBg: string;
  accentText: string;
}> = ({ questions, maxLives, onEnd, onFail, accent }) => {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [livesLost, setLivesLost] = useState(0);
  const [dead, setDead] = useState(false);

  const q = questions[step];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answerIndex;
    if (correct) {
      setScore((s) => s + 1);
      hapticSuccess();
    } else {
      setLivesLost((l) => l + 1);
      hapticLight();
      if (maxLives > 0 && livesLost + 1 > maxLives) {
        setDead(true);
      }
    }
  };

  const next = () => {
    if (dead) {
      onFail(score, step + 1, livesLost);
      return;
    }
    if (step + 1 >= questions.length) {
      onEnd(score, questions.length, livesLost);
    } else {
      setStep((s) => s + 1);
      setPicked(null);
    }
  };

  if (dead) {
    return (
      <div className="text-center py-8 space-y-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center"
        >
          <X className="w-8 h-8 text-stone-400" />
        </motion.div>
        <h3 className="text-lg font-black text-stone-900">Plus de vies !</h3>
        <p className="text-sm text-stone-600">
          Tu as répondu à {score}/{questions.length} correctement. Relis le guide dans l'onglet Conseils et retente !
        </p>
        <button
          onClick={next}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl ${accent}`}
        >
          Voir le résultat
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progression */}
      <div className="flex items-center gap-1.5 mb-4">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < step ? 'w-5 bg-rose-400' : i === step ? 'w-7 bg-rose-500' : 'w-3.5 bg-stone-200'
            }`}
          />
        ))}
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
                  className={`mt-4 w-full py-3 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer ${accent}`}
                >
                  {dead ? 'Voir le résultat' : step + 1 >= questions.length ? 'Terminer le niveau' : 'Suivant'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ═════════════════════ Vrai / Faux en run ═════════════════════ */

const TrueFalseRun: React.FC<{
  items: TrueFalseItem[];
  maxLives: number;
  onEnd: (score: number, total: number, livesLost: number) => void;
  onFail: (score: number, total: number) => void;
  softBg: string;
  accentText: string;
}> = ({ items, maxLives, onEnd, onFail, accentText }) => {
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [livesLost, setLivesLost] = useState(0);
  const [dead, setDead] = useState(false);

  const item = items[step];

  const answer = (v: boolean) => {
    if (answered !== null) return;
    setAnswered(v);
    const correct = v === item.answer;
    if (correct) {
      setScore((s) => s + 1);
      hapticSuccess();
    } else {
      setLivesLost((l) => l + 1);
      hapticLight();
      if (maxLives > 0 && livesLost + 1 > maxLives) setDead(true);
    }
  };

  const next = () => {
    if (dead) {
      onFail(score, step + 1);
      return;
    }
    if (step + 1 >= items.length) {
      onEnd(score, items.length, livesLost);
    } else {
      setStep((s) => s + 1);
      setAnswered(null);
    }
  };

  if (dead) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
          <X className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-lg font-black text-stone-900">Plus de vies !</h3>
        <p className="text-sm text-stone-600">Score : {score}/{items.length}. Retente ta chance !</p>
        <button
          onClick={next}
          className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl cursor-pointer bg-gradient-to-r from-violet-500 to-purple-500`}
        >
          Voir le résultat
        </button>
      </div>
    );
  }

  return (
    <div>
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
        <span className={`text-[11px] font-bold ${accentText}`}>
          {score}/{items.length}
        </span>
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
                  className="mt-4 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl cursor-pointer"
                >
                  {dead ? 'Voir le résultat' : step + 1 >= items.length ? 'Terminer le niveau' : 'Suivant'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ═════════════════════ Mémoire en run ═════════════════════ */

const MemoryRun: React.FC<{
  deck: MemoryPair[];
  onEnd: (moves: number) => void;
  softBg: string;
  accentText: string;
}> = ({ deck, onEnd }) => {
  const [cards, setCards] = useState(() => {
    const full = deck.flatMap((p, i) => [
      { key: i * 2, emoji: p.emoji, label: p.label, flipped: false, matched: false },
      { key: i * 2 + 1, emoji: p.emoji, label: p.label, flipped: false, matched: false },
    ]);
    return shuffle(full);
  });
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  const flip = (key: number) => {
    if (locked) return;
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
      const pair = deck.find((p) => p.emoji === card.emoji);
      setLastMatch(pair?.label || null);
      setTimeout(() => {
        setCards((cs) =>
          cs.map((c) => (c.emoji === card.emoji ? { ...c, matched: true, flipped: true } : c))
        );
        setFirstPick(null);
        setLocked(false);
        hapticSuccess();
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

  // Fin de partie
  const matchedCount = cards.filter((c) => c.matched).length;
  const allMatched = matchedCount === cards.length;
  React.useEffect(() => {
    if (allMatched && cards.length > 0) {
      const timer = setTimeout(() => onEnd(moves), 900);
      return () => clearTimeout(timer);
    }
  }, [allMatched, cards.length, moves, onEnd]);

  const gridCols = deck.length <= 3 ? 'grid-cols-3' : deck.length <= 4 ? 'grid-cols-4' : 'grid-cols-4';

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-medium text-stone-500">
          Coups : <strong className="text-stone-900">{moves}</strong>
        </span>
        <span className="font-medium text-stone-500">
          Paires :{' '}
          <strong className="text-stone-900">
            {matchedCount / 2}/{deck.length}
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

      <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
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
    </div>
  );
};

/* ═════════════════════ Tri de symptômes en run ═════════════════════ */

const SortRun: React.FC<{
  items: SymptomSortItem[];
  maxLives: number;
  onEnd: (score: number, total: number, livesLost: number) => void;
  onFail: (score: number, total: number) => void;
  softBg: string;
  accentText: string;
}> = ({ items, maxLives, onEnd, onFail }) => {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<null | 'body' | 'mind'>(null);
  const [score, setScore] = useState(0);
  const [livesLost, setLivesLost] = useState(0);
  const [dead, setDead] = useState(false);

  const item = items[step];

  const choose = (cat: 'body' | 'mind') => {
    if (answer !== null) return;
    setAnswer(cat);
    const correct = cat === item.category;
    if (correct) {
      setScore((s) => s + 1);
      hapticSuccess();
    } else {
      setLivesLost((l) => l + 1);
      hapticLight();
      if (maxLives > 0 && livesLost + 1 > maxLives) setDead(true);
    }
  };

  const next = () => {
    if (dead) {
      onFail(score, step + 1);
      return;
    }
    if (step + 1 >= items.length) {
      onEnd(score, items.length, livesLost);
    } else {
      setStep((s) => s + 1);
      setAnswer(null);
    }
  };

  if (dead) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
          <X className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-lg font-black text-stone-900">Plus de vies !</h3>
        <p className="text-sm text-stone-600">Score : {score}/{items.length}. Retente !</p>
        <button
          onClick={next}
          className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500"
        >
          Voir le résultat
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < step ? 'w-5 bg-rose-400' : i === step ? 'w-7 bg-rose-500' : 'w-3.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-rose-600">
          {score}/{items.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
        >
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-6 sm:p-8 mb-4 text-center">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">
              Ce symptôme est-il…
            </p>
            <p className="text-lg sm:text-xl font-black text-stone-900">{item.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => choose('body')}
              whileTap={answer === null ? { scale: 0.96 } : undefined}
              className={`py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                answer === null
                  ? 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
                  : item.category === 'body'
                    ? 'bg-sky-500 border-sky-500 text-white shadow-md'
                    : 'bg-white border-stone-100 text-stone-300'
              }`}
            >
              <Heart className="w-5 h-5" />
              Corporel
            </motion.button>
            <motion.button
              onClick={() => choose('mind')}
              whileTap={answer === null ? { scale: 0.96 } : undefined}
              className={`py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                answer === null
                  ? 'bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100'
                  : item.category === 'mind'
                    ? 'bg-violet-500 border-violet-500 text-white shadow-md'
                    : 'bg-white border-stone-100 text-stone-300'
              }`}
            >
              <Brain className="w-5 h-5" />
              Émotionnel
            </motion.button>
          </div>

          <AnimatePresence>
            {answer !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 flex items-start gap-2">
                  <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item.hint}</span>
                </div>
                <button
                  onClick={next}
                  className="mt-4 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl cursor-pointer"
                >
                  {dead ? 'Voir le résultat' : step + 1 >= items.length ? 'Terminer le niveau' : 'Suivant'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* Icônes utilisées uniquement dans le header du jeu de tri */
void Flame;
