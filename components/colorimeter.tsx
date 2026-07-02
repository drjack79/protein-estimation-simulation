"use client"

import { cn } from "@/lib/utils"

export function Colorimeter({
  reading,
  label,
  zeroed,
}: {
  reading: number | null
  label: string
  zeroed: boolean
}) {
  return (
    <div className="rounded-lg border border-foreground/15 bg-primary p-4 text-primary-foreground shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
          Colorimeter
        </span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
          660 nm
        </span>
      </div>
      <div className="rounded-md bg-foreground/40 p-3 ring-1 ring-inset ring-primary-foreground/10">
        <div className="font-mono text-4xl font-bold tabular-nums text-[oklch(0.85_0.14_140)]">
          {reading === null ? "—.———" : reading.toFixed(3)}
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-primary-foreground/60">
          {label}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            zeroed ? "bg-[oklch(0.8_0.15_140)]" : "bg-accent",
          )}
        />
        <span className="text-primary-foreground/70">
          {zeroed ? "Zeroed with blank" : "Not zeroed — read the blank first"}
        </span>
      </div>
    </div>
  )
}
