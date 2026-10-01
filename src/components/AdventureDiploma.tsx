import React from 'react';
import { motion } from 'motion/react';
import { Crown, Star, Printer, Zap, Award } from 'lucide-react';
import { hapticSuccess } from '../utils/animation';

interface AdventureDiplomaProps {
  userName?: string;
  stars: number;
  maxStars: number;
  xp: number;
  onClose: () => void;
}

/**
 * Cérémonie de fin d'aventure : diplôme « Gardienne du Cycle »
 * imprimable (bouton ou Ctrl+P — la mise en page print est gérée
 * dans index.css via @media print).
 */
export const AdventureDiploma: React.FC<AdventureDiplomaProps> = ({
  userName,
  stars,
  maxStars,
  xp,
  onClose,
}) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const displayName = userName?.trim() || 'Gardienne';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 ceremony-screen"
    >
      {/* Confettis animés (écran uniquement) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#60a5fa'][i % 5],
            }}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0, 1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 4 + (i % 5),
              delay: (i % 8) * 0.4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-full max-w-lg my-8"
      >
        {/* ── Le diplôme ── */}
        <div className="diploma-sheet relative bg-white rounded-lg shadow-2xl p-8 sm:p-10 border-4 border-double border-amber-400 overflow-hidden">
          {/* Filigrane couronne */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <Crown className="w-56 h-56 text-amber-100/60" strokeWidth={1} />
          </div>

          <div className="relative text-center space-y-4">
            {/* Médaillon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 15 }}
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg"
            >
              <Crown className="w-8 h-8" />
            </motion.div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-600">
                Raoula_js · Aventure « Le Cycle &amp; Moi »
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                Diplôme de
                <br />
                <span className="print-solid-amber text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Gardienne du Cycle
                </span>
              </h2>
            </div>

            <div className="text-sm text-stone-700">
              <p>Ce diplôme est fièrement décerné à</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-black text-rose-700 my-2 border-b-2 border-dashed border-rose-300 inline-block px-6 pb-1"
              >
                {displayName}
              </motion.p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                pour avoir brillamment terminé les <strong>5 mondes</strong> et les{' '}
                <strong>20 niveaux</strong> de l'aventure, vaincu le <strong>Grand Cycle</strong>{' '}
                et démontré une connaissance remarquable de son corps.
              </p>
            </div>

            {/* Étoiles + XP */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, maxStars) }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7 + i * 0.12, type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </motion.span>
                ))}
              </div>
              <span className="text-xs font-bold text-stone-600">
                {stars}/{maxStars} ⭐ · {xp} XP ⚡
              </span>
            </div>

            {/* Signature & date */}
            <div className="flex items-end justify-between pt-6 text-[10px] text-stone-500">
              <div className="text-left">
                <p className="font-bold text-stone-700">SAMUEL · SAMVICdev</p>
                <p>Créateur de Raoula_js</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-stone-700">Fait le {today}</p>
                <p>100 % privé, sur ton appareil 💗</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions (non imprimées) ── */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 print:hidden">
          <button
            onClick={() => {
              hapticSuccess();
              window.print();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimer mon diplôme
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            Retour à l'aventure
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-white/50 print:hidden">
          <Award className="w-3 h-3 inline mr-1" />
          Astuce : choisis « Enregistrer en PDF » pour le garder précieusement 📄
        </p>
      </motion.div>
    </motion.div>
  );
};
