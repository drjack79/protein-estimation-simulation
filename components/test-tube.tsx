"use client"

import { cn } from "@/lib/utils"
import type { Tube } from "@/lib/lowry"

type Stage = "setup" | "copper" | "incubate1" | "folin" | "incubate2" | "measure" | "analyse"

// Map protein amount (0–100 µg) to a developed-blue liquid colour.
function developedColor(protein: number) {
  const t = Math.min(1, protein / 100)
  // Interpolate from very pale blue -> deep prussian blue.
  const light = { r: 219, g: 234, b: 246 }
  const deep = { r: 24, g: 78, b: 156 }
  const r = Math.round(light.r + (deep.r - light.r) * t)
  const g = Math.round(light.g + (deep.g - light.g) * t)
  const b = Math.round(light.b + (deep.b - light.b) * t)
  return `rgb(${r} ${g} ${b})`
}

function liquidFor(tube: Tube, stage: Stage, reacted: boolean) {
  // Before Folin + 2nd incubation the tube is essentially colourless/pale.
  const preColorStages: Stage[] = ["setup", "copper", "incubate1", "folin"]
  if (preColorStages.includes(stage) || !reacted) {
    if (stage === "setup") return "rgb(236 244 250 / 0.55)" // water-clear
    return "rgb(206 226 224 / 0.7)" // faint copper tint
  }
  return developedColor(tube.protein)
}

export function TestTube({
  tube,
  stage,
  reacted,
  selectable,
  done,
  onClick,
}: {
  tube: Tube
  stage: Stage
  reacted: boolean
  selectable?: boolean
  done?: boolean
  onClick?: () => void
}) {
  const fill = stage === "setup" && tube.protein === 0 && tube.kind === "blank" ? 34 : 62
  const liquid = liquidFor(tube, stage, reacted)

  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onClick}
      aria-label={`Tube ${tube.label}${done ? ", reagent added" : ""}`}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-md px-2 pb-2 pt-1 transition",
        selectable && "cursor-pointer hover:bg-secondary",
        !selectable && "cursor-default",
      )}
    >
      <div className="relative h-40 w-10">
        {/* glass */}
        <div className="absolute inset-0 overflow-hidden rounded-b-full rounded-t-sm border border-foreground/25 bg-background/40 shadow-inner">
          {/* liquid */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
            style={{ height: `${fill}%`, backgroundColor: liquid }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-foreground/5" />
          </div>
          {/* glass highlight */}
          <div className="absolute left-1 top-2 h-24 w-1.5 rounded-full bg-background/70" />
        </div>
        {done && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
            ✓
          </span>
        )}
        {selectable && !done && (
          <span className="absolute -inset-1 animate-pulse rounded-b-full rounded-t-sm ring-2 ring-accent/60" />
        )}
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-foreground">{tube.label}</div>
        <div className="text-[10px] tabular-nums text-muted-foreground">
          {tube.kind === "unknown" ? "?" : `${tube.protein} µg`}
        </div>
      </div>
    </button>
  )
}
