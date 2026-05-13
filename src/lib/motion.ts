/**
 * Shared motion tokens.
 * Keep curves and durations in one place so every section feels cohesive.
 */
import type { Transition, Variants } from "framer-motion";

// Cinematic easing — same curve Apple/Linear/Vercel use for entrances.
export const easeCinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeDecisive: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const easeSpring: [number, number, number, number] = [0.34, 1.3, 0.64, 1];

export const durations = {
  micro: 0.18,
  fast: 0.28,
  base: 0.5,
  slow: 0.8,
  cinematic: 1.1,
} as const;

export const transitions = {
  cinematic: { duration: durations.cinematic, ease: easeCinematic } satisfies Transition,
  base: { duration: durations.base, ease: easeCinematic } satisfies Transition,
  fast: { duration: durations.fast, ease: easeDecisive } satisfies Transition,
  spring: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 } satisfies Transition,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: transitions.cinematic },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

export const staggerChildren = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});
