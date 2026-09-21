// Shared pacing. Geography still determines each individual stroke duration.
export const GUIDE_MOTION = {
  reveal: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  scene: { duration: 0.22, ease: "easeOut" },
  route: { duration: 4, delay: 0.25 },
  meter: { duration: 0.8, ease: "easeOut" },
} as const
