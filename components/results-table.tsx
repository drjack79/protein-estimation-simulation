"use client"

import { cn } from "@/lib/utils"
import type { Tube } from "@/lib/lowry"

export function ResultsTable({
  tubes,
  showUnknownProtein,
  estimate,
}: {
  tubes: Tube[]
  showUnknownProtein: boolean
  estimate: number | null
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary text-left text-xs uppercase tracking-wide text-secondary-foreground">
            <th className="px-3 py-2 font-semibold">Tube</th>
            <th className="px-3 py-2 font-semibold">
              BSA <span className="normal-case">(mL)</span>
            </th>
            <th className="px-3 py-2 font-semibold">
              Protein <span className="normal-case">(µg)</span>
            </th>
            <th className="px-3 py-2 text-right font-semibold">
              OD @ <span className="normal-case">660 nm</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tubes.map((t) => {
            const isUnknown = t.kind === "unknown"
            return (
              <tr key={t.id} className={cn("border-t border-border", isUnknown && "bg-accent/10")}>
                <td className="px-3 py-2 font-medium">{t.label}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">
                  {t.bsaVolume.toFixed(2)}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {isUnknown
                    ? showUnknownProtein
                      ? `${t.protein}`
                      : estimate !== null
                        ? `≈ ${estimate.toFixed(1)}`
                        : "?"
                    : t.protein}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {t.od === null ? "—" : t.od.toFixed(3)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
