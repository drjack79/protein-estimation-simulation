"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { TestTube } from "@/components/test-tube"
import { Colorimeter } from "@/components/colorimeter"
import { StandardCurve } from "@/components/standard-curve"
import { ResultsTable } from "@/components/results-table"
import {
  STEPS,
  makeInitialTubes,
  trueAbsorbance,
  linearFit,
  type Tube,
} from "@/lib/lowry"
import { cn } from "@/lib/utils"

// Compressed incubation durations (seconds) representing 10 / 30 real minutes.
const INCUBATION_SECONDS: Record<string, number> = {
  incubate1: 8,
  incubate2: 12,
}

export function Experiment() {
  const [tubes, setTubes] = useState<Tube[]>(() => makeInitialTubes())
  const [stepIndex, setStepIndex] = useState(0)
  const [copperDone, setCopperDone] = useState<string[]>([])
  const [folinDone, setFolinDone] = useState<string[]>([])
  const [measured, setMeasured] = useState<string[]>([])
  const [zeroed, setZeroed] = useState(false)
  const [lastReading, setLastReading] = useState<number | null>(null)
  const [lastReadLabel, setLastReadLabel] = useState("Awaiting sample")
  const [seconds, setSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [incStarted, setIncStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = STEPS[stepIndex]
  const stage = step.id
  // Blue colour develops once the Folin step is complete (during 2nd incubation onward).
  const reacted = stepIndex > STEPS.findIndex((s) => s.id === "folin")

  // Timer effect for incubation steps.
  useEffect(() => {
    if (!timerRunning) return
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setTimerRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerRunning])

  const startTimer = () => {
    setSeconds(INCUBATION_SECONDS[stage] ?? 5)
    setTimerRunning(true)
    setIncStarted(true)
  }

  const handleTubeClick = useCallback(
    (tube: Tube) => {
      if (stage === "copper") {
        setCopperDone((prev) => (prev.includes(tube.id) ? prev : [...prev, tube.id]))
      } else if (stage === "folin") {
        setFolinDone((prev) => (prev.includes(tube.id) ? prev : [...prev, tube.id]))
      } else if (stage === "measure") {
        if (tube.kind !== "blank" && !zeroed) return
        const od = tube.kind === "blank" ? 0 : trueAbsorbance(tube.protein, Number(tube.id.slice(1)) + 3)
        const rounded = Math.round(od * 1000) / 1000
        if (tube.kind === "blank") setZeroed(true)
        setLastReading(rounded)
        setLastReadLabel(`${tube.label} · ${tube.kind === "unknown" ? "unknown" : `${tube.protein} µg`}`)
        setTubes((prev) => prev.map((t) => (t.id === tube.id ? { ...t, od: rounded } : t)))
        setMeasured((prev) => (prev.includes(tube.id) ? prev : [...prev, tube.id]))
      }
    },
    [stage, zeroed],
  )

  const total = tubes.length
  const canAdvance = useMemo(() => {
    switch (stage) {
      case "setup":
        return true
      case "copper":
        return copperDone.length === total
      case "folin":
        return folinDone.length === total
      case "incubate1":
      case "incubate2":
        return incStarted && seconds === 0 && !timerRunning
      case "measure":
        return measured.length === total
      case "analyse":
        return false
      default:
        return false
    }
  }, [stage, copperDone, folinDone, measured, total, seconds, timerRunning, incStarted])

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
      setSeconds(0)
      setTimerRunning(false)
      setIncStarted(false)
    }
  }

  const reset = () => {
    setTubes(makeInitialTubes())
    setStepIndex(0)
    setCopperDone([])
    setFolinDone([])
    setMeasured([])
    setZeroed(false)
    setLastReading(null)
    setLastReadLabel("Awaiting sample")
    setSeconds(0)
    setTimerRunning(false)
    setIncStarted(false)
    setRevealed(false)
  }

  const unknown = tubes.find((t) => t.kind === "unknown")!
  const standardPoints = tubes
    .filter((t) => t.kind !== "unknown" && t.od !== null)
    .map((t) => ({ x: t.protein, y: t.od as number }))
  const fit = linearFit(standardPoints)
  const estimate =
    unknown.od !== null && fit.m !== 0 ? (unknown.od - fit.c) / fit.m : null

  const selectable = (tube: Tube) => {
    if (stage === "copper") return !copperDone.includes(tube.id)
    if (stage === "folin") return !folinDone.includes(tube.id)
    if (stage === "measure") return !measured.includes(tube.id) && (tube.kind === "blank" || zeroed)
    return false
  }
  const isDone = (tube: Tube) => {
    if (stage === "copper") return copperDone.includes(tube.id)
    if (stage === "folin") return folinDone.includes(tube.id)
    if (stage === "measure") return measured.includes(tube.id)
    return false
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left: bench */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                i === stepIndex
                  ? "bg-accent text-accent-foreground"
                  : i < stepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="hidden sm:inline">{s.short}</span>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
          Step {stepIndex + 1}: {step.title}
        </h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
          {step.detail}
        </p>

        {/* Rack */}
        <div className="mt-5 rounded-lg bg-secondary/60 p-4">
          <div className="flex flex-wrap items-end justify-center gap-1 sm:gap-3">
            {tubes.map((tube) => (
              <TestTube
                key={tube.id}
                tube={tube}
                stage={stage}
                reacted={reacted}
                selectable={selectable(tube)}
                done={isDone(tube)}
                onClick={() => handleTubeClick(tube)}
              />
            ))}
          </div>
          <div className="mx-auto mt-1 h-2 max-w-md rounded-b-md bg-foreground/20" />
        </div>

        {/* Step-specific controls */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {(stage === "copper" || stage === "folin") && (
            <p className="text-sm text-muted-foreground">
              Click each tube to add reagent —{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {(stage === "copper" ? copperDone.length : folinDone.length)}/{total}
              </span>{" "}
              done
            </p>
          )}

          {(stage === "incubate1" || stage === "incubate2") && (
            <div className="flex items-center gap-3">
              <Button
                onClick={startTimer}
                disabled={timerRunning || (incStarted && seconds === 0)}
                variant="secondary"
              >
                {timerRunning
                  ? "Incubating…"
                  : incStarted && seconds === 0
                    ? "Incubation complete"
                    : "Start timer"}
              </Button>
              <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </span>
              {timerRunning && (
                <span className="text-xs text-muted-foreground">simulated time</span>
              )}
            </div>
          )}

          {stage === "measure" && (
            <p className="text-sm text-muted-foreground">
              {!zeroed
                ? "Insert the Blank first to zero the instrument."
                : `Read each tube — ${measured.length}/${total} recorded`}
            </p>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={reset} className="text-muted-foreground">
              Reset
            </Button>
            {stage !== "analyse" && (
              <Button onClick={goNext} disabled={!canAdvance}>
                Continue
              </Button>
            )}
          </div>
        </div>

        {stage === "analyse" && (
          <div className="mt-6 space-y-5">
            <StandardCurve tubes={tubes} unknownOd={unknown.od} estimate={estimate} />
            <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estimated protein in unknown
                  </div>
                  <div className="text-3xl font-bold tabular-nums text-foreground">
                    {estimate !== null ? `${estimate.toFixed(1)} µg` : "—"}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>
                    Fit: OD = {fit.m.toFixed(4)}·C + {fit.c.toFixed(3)}
                  </div>
                  <div>R² = {fit.r2.toFixed(4)}</div>
                </div>
              </div>
              <div className="mt-3">
                {revealed ? (
                  <p className="text-sm text-foreground">
                    Actual value: <span className="font-bold tabular-nums">{unknown.protein} µg</span>{" "}
                    <span className="text-muted-foreground">
                      (error{" "}
                      {estimate !== null
                        ? `${Math.abs(estimate - unknown.protein).toFixed(1)} µg`
                        : "—"}
                      )
                    </span>
                  </p>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setRevealed(true)}>
                    Reveal actual value
                  </Button>
                )}
              </div>
            </div>
            <Button onClick={reset}>Run experiment again</Button>
          </div>
        )}
      </section>

      {/* Right: instruments + data */}
      <aside className="space-y-4">
        <Colorimeter reading={lastReading} label={lastReadLabel} zeroed={zeroed} />
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Observation table
          </h3>
          <ResultsTable tubes={tubes} showUnknownProtein={revealed} estimate={estimate} />
        </div>
      </aside>
    </div>
  )
}
