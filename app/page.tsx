import { Experiment } from "@/components/experiment"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Virtual Bioseparation Lab
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              Protein Estimation by Lowry&apos;s Method -  Virtual Bioseparation Lab - Created by Dr. M. K. Jaganathan
            </h1>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            Standard: <span className="font-semibold text-foreground">Bovine Serum Albumin</span>
            <span className="mx-2 text-border">|</span>
            λ<sub>max</sub> = <span className="font-semibold text-foreground">660 nm</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Estimate the protein concentration of an unknown sample. Prepare a series of BSA
            standards, develop the characteristic blue colour with alkaline copper and
            Folin–Ciocalteu reagents, measure absorbance at 660 nm, and read the unknown off the
            standard curve. Follow the steps below.
          </p>
        </div>
        <Experiment />

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <PrincipleCard
            title="Biuret reaction"
            body="Cu²⁺ ions chelate with peptide bonds in alkaline medium, reducing to Cu⁺."
          />
          <PrincipleCard
            title="Folin reduction"
            body="Cu⁺ and aromatic residues (Tyr, Trp) reduce the phosphomolybdate–phosphotungstate reagent."
          />
          <PrincipleCard
            title="Blue complex"
            body="The reduced reagent gives a blue colour whose intensity is measured at 660 nm."
          />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted-foreground">
          Educational simulation. Reagent volumes and timings are representative of a standard
          Lowry protocol (Lowry et al., 1951).
        </div>
      </footer>
    </div>
  )
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
