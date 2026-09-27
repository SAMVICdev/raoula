import React, { useState } from 'react';
import { 
  AlertCircle, 
  HelpCircle, 
  Heart, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Flame, 
  Activity,
  HeartPulse
} from 'lucide-react';
import { CalculatedCycleStatus } from '../types';
import { PersonalizedAdviceCard } from './PersonalizedAdviceCard';

interface AdviceViewProps {
  status: CalculatedCycleStatus;
}

type GuideTopic = 'retard' | 'avance' | 'douleurs' | 'spm' | 'irregularite' | 'conception';

function defaultTopic(status: CalculatedCycleStatus): GuideTopic {
  if (status.isLate) return 'retard';
  if (status.currentPhase === 'menstruation') return 'douleurs';
  if (status.currentPhase === 'luteal') return 'spm';
  if (status.currentPhase === 'fertile' || status.currentPhase === 'ovulation') return 'conception';
  return 'irregularite';
}

export const AdviceView: React.FC<AdviceViewProps> = ({ status }) => {
  const [activeTopic, setActiveTopic] = useState<GuideTopic>(() => defaultTopic(status));

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900">
                Guide Santé & Conseils Bienveillants
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Comprendre son corps, réagir sereinement face à un retard de règles, des saignements en avance ou des crampes menstruelles.
            </p>
          </div>
        </div>
      </div>

      <PersonalizedAdviceCard status={status} />

      {/* Contextual Status Banner if Retard is currently active */}
      {status.isLate && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">
              Retard détecté sur votre cycle en cours (+{status.daysLate} jour{status.daysLate > 1 ? 's' : ''})
            </h4>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              Pas de panique : un décalage de quelques jours est très fréquent et physiologique. Consultez nos recommandations ci-dessous pour savoir quoi faire étape par étape.
            </p>
          </div>
        </div>
      )}

      {/* Topic Switcher Pills (Buttons) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTopic('retard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'retard'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Retard de règles</span>
        </button>

        <button
          onClick={() => setActiveTopic('avance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'avance'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Règles en avance</span>
        </button>

        <button
          onClick={() => setActiveTopic('douleurs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'douleurs'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Soulager les crampes</span>
        </button>

        <button
          onClick={() => setActiveTopic('spm')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'spm'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Syndrome Prémenstruel (SPM)</span>
        </button>

        <button
          onClick={() => setActiveTopic('irregularite')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'irregularite'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Cycles irréguliers</span>
        </button>

        <button
          onClick={() => setActiveTopic('conception')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTopic === 'conception'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fertilité & Conception</span>
        </button>
      </div>

      {/* Topic Content Panel */}

      {/* TOPIC 1: RETARD DE RÈGLES */}
      {activeTopic === 'retard' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <Clock className="w-5 h-5" />
              <h3>Que faire en cas de retard de règles ?</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Un retard de quelques jours ne signifie pas automatiquement une grossesse. Le cycle féminin est régulé par un axe hormonal sensible au stress, au sommeil et aux émotions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  1. Causes courantes
                </span>
                <ul className="text-xs text-stone-600 space-y-1">
                  <li>• Stress intense ou examens</li>
                  <li>• Voyage ou décalage horaire</li>
                  <li>• Perte ou prise rapide de poids</li>
                  <li>• Pilule du lendemain ou arrêt de pilule</li>
                  <li>• Fatigue ou maladie récente</li>
                </ul>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  2. Le test de grossesse
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Effectuez un test urinaire dès le <strong>1er jour de retard</strong>, idéalement au réveil avec les premières urines qui sont plus concentrées en hormone bêta-hCG. Si négatif, refaites-en un 48h plus tard.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  3. Quand consulter ?
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Consultez un médecin, gynécologue ou sage-femme si le retard dépasse <strong>10 jours</strong> avec un test négatif, ou si vos règles disparaissent pendant plus de <strong>3 mois consécutifs</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 2: RÈGLES EN AVANCE */}
      {activeTopic === 'avance' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <Calendar className="w-5 h-5" />
              <h3>Règles en avance ou saignements au milieu du cycle</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Avoir des saignements plus tôt que prévu peut correspondre à plusieurs phénomènes physiologiques distincts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <h4 className="font-bold text-stone-900 text-xs mb-1.5">
                  Est-ce du "Spotting d'ovulation" ?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Au moment de l'ovulation (vers le 14e jour d'un cycle de 28 jours), la chute transitoire des œstrogènes peut provoquer de légères pertes rosées ou marron pendant 24 à 48 heures. C'est bénin et fréquent.
                </p>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <h4 className="font-bold text-stone-900 text-xs mb-1.5">
                  Cycle court anovulatoire
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Parfois, l'ovulation ne s'est pas produite et la paroi utérine se détache plus précocement (cycles de 20 à 23 jours). Cela arrive couramment à la puberté ou lors d'un pic de surmenage.
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600">
              <strong>À surveiller :</strong> Si vos cycles sont constamment inférieurs à 21 jours ou que les saignements sont très abondants et imprévisibles, un bilan hormonal chez un professionnel de santé est recommandé.
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: SOULAGER LES CRAMPES */}
      {activeTopic === 'douleurs' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <Flame className="w-5 h-5" />
              <h3>Soulager naturellement les crampes menstruelles (Dysménorrhée)</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Les crampes sont déclenchées par les prostaglandines qui provoquent des contractions de l'utérus pour expulser l'endomètre. Voici les remèdes les plus efficaces :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  1. La chaleur bienfaisante
                </span>
                <p className="text-xs text-stone-600">
                  Appliquez une bouillotte chaude sur le bas-ventre ou les lombaires. La chaleur détend immédiatement les muscles utérins.
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  2. Tisanes de plantes
                </span>
                <p className="text-xs text-stone-600">
                  Infusion de feuilles de framboisier (tonique utérin), camomille allemande ou achillée millefeuille pour décongestionner le bassin.
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  3. Magnésium & Oméga-3
                </span>
                <p className="text-xs text-stone-600">
                  Le magnésium réduit les spasmes musculaires. Les oméga-3 (poissons gras, huile de lin, noix) diminuent l'inflammation.
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  4. Posture de l'enfant
                </span>
                <p className="text-xs text-stone-600">
                  À genoux, asseyez-vous sur vos talons et étirez les bras devant vous au sol pour décompresser le bas du dos et le petit bassin.
                </p>
              </div>
            </div>

            {/* Endométriose warning */}
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center gap-2 text-rose-900 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Ne banalisez pas une douleur invalidante (Penser à l’Endométriose)</span>
              </div>
              <p className="text-rose-800 leading-relaxed">
                Avoir mal au point d'être clouée au lit, de manquer l'école ou le travail, ou d'avoir des malaises n'est <strong>PAS NORMAL</strong>. Si les antalgiques habituels ne vous soulagent pas, parlez-en à une sage-femme ou un gynécologue spécialisé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 4: SPM */}
      {activeTopic === 'spm' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <Activity className="w-5 h-5" />
              <h3>Apprivoiser le Syndrome Prémenstruel (SPM)</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Survenant 3 à 7 jours avant les règles, le SPM est lié à la chute brutale de la progestérone et des œstrogènes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <h4 className="font-bold text-stone-900 text-xs mb-1">Humeur & Émotivité</h4>
                <p className="text-xs text-stone-600">
                  Baisse de sérotonine fréquente. Privilégiez des nuits de 8h, des marches en plein air et accordez-vous du calme sans culpabiliser.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <h4 className="font-bold text-stone-900 text-xs mb-1">Seins douloureux</h4>
                <p className="text-xs text-stone-600">
                  L'huile d'onagre ou de bourrache aide à réguler les tensions mammaires. Réduisez le café et le thé pendant cette semaine.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <h4 className="font-bold text-stone-900 text-xs mb-1">Ballonnements</h4>
                <p className="text-xs text-stone-600">
                  La progestérone ralentit le transit. Buvez beaucoup d'eau, réduisez les aliments très salés et marchez après les repas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 5: CYCLES IRRÉGULIERS */}
      {activeTopic === 'irregularite' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <HelpCircle className="w-5 h-5" />
              <h3>Pourquoi mes cycles changent-ils constamment de durée ?</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Un cycle normal peut varier naturellement de 2 à 4 jours d'un mois à l'autre. Cependant, si vos cycles varient de plus de 7 à 10 jours réguliers, voici les pistes courantes :
            </p>

            <ul className="text-xs text-stone-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Adolescence & Premières années :</strong> L'axe hypophyse-ovaires peut mettre 2 à 3 ans après les premières règles pour se stabiliser. C'est tout à fait normal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>SOPK (Syndrome des Ovaires Polykystiques) :</strong> Touche 1 femme sur 10. Se manifeste par des cycles très longs (&gt;35-45 jours), de l'acné persistante ou une pilosité accrue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Thyroïde :</strong> Un dérèglement (hypothyroïdie ou hyperthyroïdie) perturbe immédiatement le rythme menstruel. Une simple prise de sang permet de le vérifier.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Activité sportive intense ou restriction calorique :</strong> Le corps se met en mode économie d'énergie si l'apport calorique est insuffisant.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TOPIC 6: FERTILITÉ & CONCEPTION */}
      {activeTopic === 'conception' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <h3>Comprendre sa fertilité et maximiser ses chances</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Dans un cycle, la fertilité est concentrée sur une fenêtre d'environ <strong>6 jours</strong> (les 5 jours précédant l'ovulation et le jour de l'ovulation).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-950 text-xs mb-1">
                  La glaire "blanc d'œuf" : votre meilleur repère
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  2 à 3 jours avant l'ovulation, les pertes vaginales deviennent fluides, très transparentes et élastiques comme du blanc d'œuf cru. C'est le signal biologique numéro 1 de fertilité maximale.
                </p>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-950 text-xs mb-1">
                  Le décalage de température basale
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Au lendemain de l'ovulation, la progestérone fait grimper la température corporelle d'environ 0,3°C à 0,5°C jusqu'aux règles suivantes. Ce saut confirme que l'ovulation a bien eu lieu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accordion FAQ Rapide */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h3 className="font-bold text-stone-900 text-sm mb-4">
          Questions fréquentes sur le cycle
        </h3>

        <div className="space-y-2 text-xs">
          {[
            {
              q: "Peut-on tomber enceinte pendant les règles ?",
              a: "Bien que rare, c'est possible, surtout pour les femmes ayant des cycles courts (21-23 jours) ou une ovulation précoce, car les spermatozoïdes peuvent survivre jusqu'à 5 jours dans les voies génitales."
            },
            {
              q: "Pourquoi mes règles sont-elles marron ou très sombres au début ?",
              a: "Le sang marron est simplement du sang qui a mis plus de temps à s'évacuer et qui s'est oxydé au contact de l'air. C'est classique et normal au tout début ou à la fin des menstruations."
            },
            {
              q: "Un test de grossesse peut-il être faux négatif ?",
              a: "Oui, si le test est fait trop tôt ou si votre ovulation a eu lieu plus tard que d'habitude. Si votre retard persiste après un test négatif, refaites le test 48h à 72h plus tard."
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-stone-100 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-3.5 text-left font-semibold text-stone-800 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="p-3.5 pt-0 text-stone-600 leading-relaxed bg-stone-50/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
