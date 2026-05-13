import type { Variants, Transition } from "framer-motion";

/**
 * Motion philosophy — calm intelligence.
 * - Shorter durations (0.5s default vs 0.8s in v1)
 * - Smaller travel distances (8-12px vs 24-32px)
 * - No spring overshoots, no glow pulses
 * - Single calm easing curve used everywhere
 */

export const ease = {
  calm: [0.22, 1, 0.36, 1] as [number, number, number, number],
  precise: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const duration = {
  micro: 0.18,
  short: 0.32,
  base: 0.5,
  long: 0.7,
};

export const t = {
  base: { duration: duration.base, ease: ease.calm } as Transition,
  short: { duration: duration.short, ease: ease.calm } as Transition,
  long: { duration: duration.long, ease: ease.calm } as Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: t.base },
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: t.long },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: t.short },
};

export const stagger = (delay = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: delay,
      delayChildren: 0.05,
    },
  },
});
