import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ConfettiBurstProps {
  /** Clé unique : change pour déclencher une nouvelle explosion. */
  trigger: number;
}

const COLORS = ['#e11d48', '#fb7185', '#fda4af', '#818cf8', '#fbbf24', '#34d399'];

/**
 * Explosion de confettis courte (≈1,2 s) pour célébrer une validation.
 * Léger : ~24 particules animées en CSS transform via motion, sans canvas.
 */
export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: `${trigger}-${i}`,
        x: (Math.random() - 0.5) * 260,
        y: -(60 + Math.random() * 160),
        rotate: (Math.random() - 0.5) * 540,
        delay: Math.random() * 0.08,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [trigger]
  );

  if (!trigger) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: [0, p.y, p.y + 120],
            rotate: p.rotate,
            scale: [1, 1, 0.7],
          }}
          transition={{ duration: 1.15, delay: p.delay, ease: 'easeOut' }}
          className="absolute"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};
