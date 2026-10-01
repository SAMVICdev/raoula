import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Clock,
  Flame,
  Activity,
  HeartPulse,
  Compass,
  Stethoscope,
  Droplets,
  Brain,
  Moon,
  Thermometer,
  Baby,
  Quote
} from 'lucide-react';
import { CalculatedCycleStatus } from '../types';
import { PersonalizedAdviceCard } from './PersonalizedAdviceCard';
import { staggerContainer, fadeUpItem } from '../utils/animation';

interface AdviceViewProps {
  status: CalculatedCycleStatus;
}

type GuideTopic = 'retard' | 'avance' | 'douleurs' | 'spm' | 'irregularite' | 'conception';

interface TopicMeta {
  id: GuideTopic;
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  softBg: string;
  accentText: string;
  border: string;
}

const TOPICS: TopicMeta[] = [
  {
    id: 'retard',
    icon: <Clock className="w-5 h-5" />,
    title: 'Retard de règles',
    desc: 'Causes fréquentes, test et quand consulter',
    gradient: 'from-rose-500 to-pink-500',
    softBg: 'bg-rose-50',
    accentText: 'text-rose-600',
    border: 'border-rose-200',
  },
  {
    id: 'avance',
    icon: <Calendar className="w-5 h-5" />,
    title: 'Règles en avance',
    desc: 'Spotting d’ovulation, cycles courts',
    gradient: 'from-amber-500 to-orange-500',
    softBg: 'bg-amber-50',
    accentText: 'text-amber-600',
    border: 'border-amber-200',
  },
  {
    id: 'douleurs',
    icon: <Flame className="w-5 h-5" />,
    title: 'Soulager les crampes',
    desc: 'Chaleur, plantes, magnésium, postures',
    gradient: 'from-red-500 to-rose-500',
    softBg: 'bg-red-50',
    accentText: 'text-red-600',
    border: 'border-red-200',
  },
  {
    id: 'spm',
    icon: <Brain className="w-5 h-5" />,
    title: 'Syndrome Prémenstruel',
    desc: 'Humeur, seins sensibles, ballonnements',
    gradient: 'from-violet-500 to-purple-500',
    softBg: 'bg-violet-50',
    accentText: 'text-violet-600',
    border: 'border-violet-200',
  },
  {
    id: 'irregularite',
    icon: <HelpCircle className="w-5 h-5" />,
    title: 'Cycles irréguliers',
    desc: 'Comprendre et identifier les causes',
    gradient: 'from-sky-500 to-blue-500',
    softBg: 'bg-sky-50',
    accentText: 'text-sky-600',
    border: 'border-sky-200',
  },
  {
    id: 'conception',
    icon: <Baby className="w-5 h-5" />,
    title: 'Fertilité & Conception',
    desc: 'Fenêtre fertile, glaire, température',
    gradient: 'from-indigo-500 to-violet-500',
    softBg: 'bg-indigo-50',
    accentText: 'text-indigo-600',
    border: 'border-indigo-200',
  },
];

function defaultTopic(status: CalculatedCycleStatus): GuideTopic {
  if (status.isLate) return 'retard';
  if (status.currentPhase === 'menstruation') return 'douleurs';
  if (status.currentPhase === 'luteal') return 'spm';
  if (status.currentPhase === 'fertile' || status.currentPhase === 'ovulation') return 'conception';
  return 'irregularite';
}

/** Numéro d'étape stylisé pour les contenus */
function StepBadge({ n, colorClass }: { n: number; colorClass: string }) {
  return (
    <span
      className={`w-6 h-6 rounded-full ${colorClass} text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm`}
    >
      {n}
    </span>
  );
}

export const AdviceView: React.FC<AdviceViewProps> = ({ status }) => {
  const [activeTopic, setActiveTopic] = useState<GuideTopic>(() => defaultTopic(status));
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const active = TOPICS.find((t) => t.id === activeTopic)!;

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Banner — dégradé attractif */}
      <motion.div
        variants={fadeUpItem}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-5 sm:p-7 shadow-md shadow-rose-600/20"
      >
        {/* Cercles décoratifs en fond */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-14 -left-6 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute top-6 right-16 w-3 h-3 rounded-full bg-white/30" aria-hidden="true" />

        <div className="relative flex items-start gap-4">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/20"
          >
            <HeartPulse className="w-6 h-6" />
          </motion.div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-100/90 block">
              Guide santé
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Comprends ton corps, mois après mois
            </h2>
            <p className="text-xs sm:text-sm text-rose-50/90 mt-1.5 leading-relaxed max-w-xl">
              Des conseils bienveillants et clairs pour chaque situation : retard, crampes, SPM,
              fertilité… Choisis le guide qui te correspond ci-dessous.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUpItem}>
        <PersonalizedAdviceCard status={status} />
      </motion.div>

      {/* Contextual Status Banner if Retard is currently active */}
      {status.isLate && (
        <motion.div
          variants={fadeUpItem}
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </motion.span>
          <div>
            <h4 className="font-bold text-amber-950">
              Retard détecté sur ton cycle en cours (+{status.daysLate} jour{status.daysLate > 1 ? 's' : ''})
            </h4>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              Pas de panique : un décalage de quelques jours est très fréquent et physiologique.
              Le guide « Retard de règles » est ouvert pour toi ci-dessous. 👇
            </p>
          </div>
        </motion.div>
      )}

      {/* Grille de guides — cartes attractives */}
      <motion.div variants={fadeUpItem}>
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-stone-900">Choisis ton guide</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <motion.button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden text-left p-3.5 sm:p-4 rounded-2xl border transition-colors cursor-pointer group ${
                  isActive
                    ? `${topic.softBg} ${topic.border} ring-2 ring-rose-200 shadow-sm`
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="topic-indicator"
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topic.gradient}`}
                  />
                )}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? `bg-gradient-to-br ${topic.gradient} text-white shadow-sm`
                      : `${topic.softBg} ${topic.accentText} group-hover:scale-105`
                  }`}
                >
                  {topic.icon}
                </div>
                <div className={`text-xs sm:text-sm font-bold leading-tight ${isActive ? 'text-stone-900' : 'text-stone-800'}`}>
                  {topic.title}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 mt-1 leading-snug">
                  {topic.desc}
                </div>
                {isActive && (
                  <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${topic.accentText.replace('text-', 'bg-')}`} />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Contenu du guide actif — transition animée */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTopic}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-xs"
        >
          {/* En-tête du guide */}
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-stone-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.gradient} text-white flex items-center justify-center shadow-sm`}>
              {active.icon}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">{active.title}</h3>
          </div>

          {/* ═══════════ RETARD ═══════════ */}
          {activeTopic === 'retard' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Un retard de quelques jours ne signifie pas automatiquement une grossesse.
                Le cycle féminin est régulé par un axe hormonal sensible au stress, au sommeil et aux émotions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StepBadge n={1} colorClass="bg-rose-500" />
                    <span className="text-xs font-bold text-stone-900">Causes courantes</span>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-start gap-1.5"><Droplets className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" /> Stress intense ou examens</li>
                    <li className="flex items-start gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /> Voyage ou décalage horaire</li>
                    <li className="flex items-start gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Perte ou prise rapide de poids</li>
                    <li className="flex items-start gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> Pilule du lendemain ou arrêt de pilule</li>
                    <li className="flex items-start gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> Fatigue ou maladie récente</li>
                  </ul>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StepBadge n={2} colorClass="bg-rose-500" />
                    <span className="text-xs font-bold text-stone-900">Le test de grossesse</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Effectue un test urinaire dès le <strong>1er jour de retard</strong>, idéalement au réveil
                    avec les premières urines, plus concentrées en hormone bêta-hCG.
                    Si négatif, refais-en un <strong>48 h plus tard</strong>.
                  </p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StepBadge n={3} colorClass="bg-rose-500" />
                    <span className="text-xs font-bold text-stone-900">Quand consulter ?</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Consulte un médecin, gynécologue ou sage-femme si le retard dépasse <strong>10 jours</strong>
                    {' '}avec un test négatif, ou si tes règles disparaissent plus de <strong>3 mois consécutifs</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ AVANCE ═══════════ */}
          {activeTopic === 'avance' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Avoir des saignements plus tôt que prévu peut correspondre à plusieurs phénomènes physiologiques distincts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-stone-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-amber-500" />
                    Est-ce du « spotting d'ovulation » ?
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Au moment de l'ovulation (vers le 14e jour d'un cycle de 28 jours), la chute transitoire
                    des œstrogènes peut provoquer de légères pertes rosées ou marron pendant 24 à 48 heures.
                    C'est bénin et fréquent.
                  </p>
                </div>
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-stone-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Cycle court anovulatoire
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Parfois, l'ovulation ne s'est pas produite et la paroi utérine se détache plus précocement
                    (cycles de 20 à 23 jours). Cela arrive couramment à la puberté ou lors d'un pic de surmenage.
                  </p>
                </div>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  <strong>À surveiller :</strong> si tes cycles sont constamment inférieurs à 21 jours ou que les
                  saignements sont très abondants et imprévisibles, un bilan hormonal chez un professionnel
                  de santé est recommandé.
                </span>
              </div>
            </div>
          )}

          {/* ═══════════ CRAMPES ═══════════ */}
          {activeTopic === 'douleurs' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Les crampes sont déclenchées par les prostaglandines qui provoquent des contractions de
                l'utérus pour expulser l'endomètre. Voici les remèdes les plus efficaces :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: <Flame className="w-4 h-4" />, iconBg: 'bg-red-100 text-red-600', title: 'La chaleur bienfaisante', text: "Applique une bouillotte chaude sur le bas-ventre ou les lombaires. La chaleur détend immédiatement les muscles utérins." },
                  { icon: <Droplets className="w-4 h-4" />, iconBg: 'bg-emerald-100 text-emerald-600', title: 'Tisanes de plantes', text: "Infusion de feuilles de framboisier (tonique utérin), camomille allemande ou achillée millefeuille pour décongestionner le bassin." },
                  { icon: <Sparkles className="w-4 h-4" />, iconBg: 'bg-amber-100 text-amber-600', title: 'Magnésium & Oméga-3', text: "Le magnésium réduit les spasmes musculaires. Les oméga-3 (poissons gras, huile de lin, noix) diminuent l'inflammation." },
                  { icon: <Moon className="w-4 h-4" />, iconBg: 'bg-indigo-100 text-indigo-600', title: "Posture de l'enfant", text: "À genoux, assieds-toi sur tes talons et étire les bras devant toi au sol pour décompresser le bas du dos et le petit bassin." },
                ].map((remede, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="bg-stone-50 p-3.5 rounded-xl border border-stone-100"
                  >
                    <div className={`w-8 h-8 rounded-lg ${remede.iconBg} flex items-center justify-center mb-2`}>
                      {remede.icon}
                    </div>
                    <span className="font-bold text-stone-900 text-xs block mb-1">
                      {i + 1}. {remede.title}
                    </span>
                    <p className="text-xs text-stone-600">{remede.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Endométriose warning */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs"
              >
                <div className="flex items-center gap-2 text-rose-900 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Ne banalise pas une douleur invalidante (penser à l'endométriose)</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  Avoir mal au point d'être clouée au lit, de manquer l'école ou le travail, ou d'avoir des
                  malaises n'est <strong>PAS NORMAL</strong>. Si les antalgiques habituels ne te soulagent pas,
                  parle-en à une sage-femme ou un gynécologue spécialisé.
                </p>
              </motion.div>
            </div>
          )}

          {/* ═══════════ SPM ═══════════ */}
          {activeTopic === 'spm' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Survenant 3 à 7 jours avant les règles, le SPM est lié à la chute brutale de la progestérone
                et des œstrogènes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Brain className="w-4 h-4" />, iconBg: 'bg-violet-100 text-violet-600', title: 'Humeur & Émotivité', text: "Baisse de sérotonine fréquente. Privilégie des nuits de 8 h, des marches en plein air et accorde-toi du calme sans culpabiliser." },
                  { icon: <HeartPulse className="w-4 h-4" />, iconBg: 'bg-rose-100 text-rose-600', title: 'Seins douloureux', text: "L'huile d'onagre ou de bourrache aide à réguler les tensions mammaires. Réduis le café et le thé pendant cette semaine." },
                  { icon: <Droplets className="w-4 h-4" />, iconBg: 'bg-sky-100 text-sky-600', title: 'Ballonnements', text: "La progestérone ralentit le transit. Bois beaucoup d'eau, réduis les aliments très salés et marche après les repas." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="bg-stone-50 p-4 rounded-xl border border-stone-100"
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center mb-2`}>
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs mb-1">{item.title}</h4>
                    <p className="text-xs text-stone-600">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ IRRÉGULIERS ═══════════ */}
          {activeTopic === 'irregularite' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Un cycle normal peut varier naturellement de 2 à 4 jours d'un mois à l'autre. Cependant,
                si tes cycles varient de plus de 7 à 10 jours, voici les pistes courantes :
              </p>
              <ul className="text-xs text-stone-600 space-y-2.5">
                {[
                  { title: 'Adolescence & premières années', text: "L'axe hypophyse-ovaires peut mettre 2 à 3 ans après les premières règles pour se stabiliser. C'est tout à fait normal." },
                  { title: 'SOPK (Syndrome des Ovaires Polykystiques)', text: "Touche 1 femme sur 10. Se manifeste par des cycles très longs (>35-45 jours), de l'acné persistante ou une pilosité accrue." },
                  { title: 'Thyroïde', text: "Un dérèglement (hypo- ou hyperthyroïdie) perturbe immédiatement le rythme menstruel. Une simple prise de sang permet de le vérifier." },
                  { title: 'Sport intense ou restriction alimentaire', text: "Le corps se met en mode économie d'énergie si l'apport calorique est insuffisant." },
                ].map((cause, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-start gap-2.5 bg-stone-50/80 p-3 rounded-xl border border-stone-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span><strong>{cause.title} :</strong> {cause.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* ═══════════ CONCEPTION ═══════════ */}
          {activeTopic === 'conception' && (
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Dans un cycle, la fertilité est concentrée sur une fenêtre d'environ <strong>6 jours</strong>
                {' '}(les 5 jours précédant l'ovulation et le jour de l'ovulation).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-indigo-950 text-xs mb-1.5 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-indigo-500" />
                    La glaire « blanc d'œuf » : ton meilleur repère
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    2 à 3 jours avant l'ovulation, les pertes vaginales deviennent fluides, très transparentes
                    et élastiques comme du blanc d'œuf cru. C'est le signal biologique numéro 1 de fertilité maximale.
                  </p>
                </div>
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-indigo-950 text-xs mb-1.5 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-indigo-500" />
                    Le décalage de température basale
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Au lendemain de l'ovulation, la progestérone fait grimper la température corporelle
                    d'environ 0,3 °C à 0,5 °C jusqu'aux règles suivantes. Ce saut confirme que l'ovulation
                    a bien eu lieu.
                  </p>
                </div>
              </div>
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 text-xs text-stone-700 flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="italic">
                  Note ta glaire et ta température chaque jour dans le journal : l'onglet Analyses
                  détecte automatiquement ton décalage thermique d'ovulation.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Accordion FAQ Rapide — animée */}
      <motion.div variants={fadeUpItem} className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h3 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-rose-500" />
          Questions fréquentes sur le cycle
        </h3>

        <div className="space-y-2 text-xs">
          {[
            {
              q: 'Peut-on tomber enceinte pendant les règles ?',
              a: "Bien que rare, c'est possible, surtout pour les femmes ayant des cycles courts (21-23 jours) ou une ovulation précoce, car les spermatozoïdes peuvent survivre jusqu'à 5 jours dans les voies génitales.",
            },
            {
              q: 'Pourquoi mes règles sont-elles marron ou très sombres au début ?',
              a: "Le sang marron est simplement du sang qui a mis plus de temps à s'évacuer et qui s'est oxydé au contact de l'air. C'est classique et normal au tout début ou à la fin des menstruations.",
            },
            {
              q: 'Un test de grossesse peut-il être faux négatif ?',
              a: 'Oui, si le test est fait trop tôt ou si ton ovulation a eu lieu plus tard que d\'habitude. Si le retard persiste après un test négatif, refais le test 48 h à 72 h plus tard.',
            },
          ].map((item, idx) => (
            <div key={idx} className="border border-stone-100 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className={`w-full p-3.5 text-left font-semibold text-stone-800 flex items-center justify-between transition-colors cursor-pointer ${
                  expandedFaq === idx ? 'bg-rose-50/60' : 'hover:bg-stone-50'
                }`}
              >
                <span>{item.q}</span>
                <motion.span
                  animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className={`w-4 h-4 ${expandedFaq === idx ? 'text-rose-500' : 'text-stone-400'}`} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {expandedFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 pt-0 text-stone-600 leading-relaxed bg-rose-50/30">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
