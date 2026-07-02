// Core data + calculations for the virtual Lowry protein estimation experiment.

export type TubeKind = "blank" | "standard" | "unknown"

export type Tube = {
  id: string
  label: string
  kind: TubeKind
  // Volume of BSA working standard (mL) added for standards.
  bsaVolume: number
  // Protein content in the tube (µg). For unknown this is hidden until revealed.
  protein: number
  // Measured absorbance at 660 nm (null until read on the colorimeter).
  od: number | null
}

// Absorbance response of the Lowry reaction (approx. Beer–Lambert, linear region).
// ~0.008 AU per µg protein => 100 µg reads ~0.80 AU.
const SLOPE_PER_UG = 0.008

// Deterministic tiny "instrument noise" so repeated runs feel real but stable per tube.
function pseudoNoise(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 0.012
}

export function trueAbsorbance(protein: number, seed: number) {
  if (protein <= 0) return 0
  const noise = pseudoNoise(seed)
  return Math.max(0, protein * SLOPE_PER_UG + noise)
}

// The six standards: 0, 20, 40, 60, 80, 100 µg of BSA (from a 200 µg/mL stock).
export const STANDARD_PROTEINS = [0, 20, 40, 60, 80, 100]
const STOCK_CONC = 200 // µg/mL BSA working standard

export function makeInitialTubes(): Tube[] {
  const standards: Tube[] = STANDARD_PROTEINS.map((protein, i) => ({
    id: `S${i}`,
    label: i === 0 ? "Blank" : `S${i}`,
    kind: i === 0 ? "blank" : "standard",
    bsaVolume: protein / STOCK_CONC,
    protein,
    od: null,
  }))

  // Unknown sample with a "random" but fixed-per-session protein amount.
  const unknownProtein = Math.round((35 + Math.random() * 55) / 2) * 2 // even µg 36–90
  const unknown: Tube = {
    id: "U1",
    label: "Unknown",
    kind: "unknown",
    bsaVolume: 0.5,
    protein: unknownProtein,
    od: null,
  }

  return [...standards, unknown]
}

// Least-squares fit of OD = m * protein + c using only the standard tubes.
export function linearFit(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { m: 0, c: 0, r2: 0 }
  const sx = points.reduce((s, p) => s + p.x, 0)
  const sy = points.reduce((s, p) => s + p.y, 0)
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0)
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0)
  const meanY = sy / n
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const c = (sy - m * sx) / n
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (m * p.x + c)) ** 2, 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, c, r2 }
}

export const STEPS = [
  {
    id: "setup",
    title: "Prepare tubes",
    short: "Setup",
    detail:
      "Pipette increasing volumes of BSA working standard (200 µg/mL) into tubes S1–S5, and your unknown into U1. Make each up to 1 mL with distilled water.",
  },
  {
    id: "copper",
    title: "Add alkaline copper reagent",
    short: "Reagent C",
    detail:
      "Add 5 mL of freshly prepared alkaline copper reagent (Reagent C) to every tube. Mix well.",
  },
  {
    id: "incubate1",
    title: "Incubate 10 minutes",
    short: "Incubate I",
    detail:
      "Let the tubes stand at room temperature for 10 minutes so copper can complex with the peptide bonds.",
  },
  {
    id: "folin",
    title: "Add Folin–Ciocalteu reagent",
    short: "Folin",
    detail:
      "Rapidly add 0.5 mL of Folin–Ciocalteu reagent (1N) to each tube and mix immediately.",
  },
  {
    id: "incubate2",
    title: "Incubate 30 minutes",
    short: "Incubate II",
    detail:
      "Stand in the dark for 30 minutes. A blue colour develops in proportion to protein concentration.",
  },
  {
    id: "measure",
    title: "Read absorbance at 660 nm",
    short: "Colorimeter",
    detail:
      "Zero the colorimeter with the blank, then measure the optical density of each tube at 660 nm.",
  },
  {
    id: "analyse",
    title: "Plot & estimate",
    short: "Results",
    detail:
      "Plot OD against protein concentration for the standards, then read the unknown off the standard curve.",
  },
] as const

export type StepId = (typeof STEPS)[number]["id"]
