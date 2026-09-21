export const JOURNEY_STEPS = [
  {
    id: "build",
    number: "01",
    title: "Build your route.",
    description:
      "Connect stops using routes and carriers from the planner’s network.",
  },
  {
    id: "check",
    number: "02",
    title: "Review the checks.",
    description:
      "See estimated miles, the mileage band, and the checks implemented by the planner.",
  },
  {
    id: "share",
    number: "03",
    title: "Share the journey.",
    description:
      "Create a read-only snapshot to discuss with your travel partner.",
  },
] as const
export type StageId = (typeof JOURNEY_STEPS)[number]["id"]
export type WorkbenchPresentation = "flow" | "cinematic"
