export const motionPresets = {
  fadeUp: "fade-up",
  fadeIn: "fade-in",
  scaleIn: "scale-in",
  staggerChildren: "stagger-children",
} as const;

export type MotionPreset = keyof typeof motionPresets;
