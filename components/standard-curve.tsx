"use client"

import {
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Tube } from "@/lib/lowry"
import { linearFit } from "@/lib/lowry"

export function StandardCurve({
  tubes,
  unknownOd,
  estimate,
}: {
  tubes: Tube[]
  unknownOd: number | null
  estimate: number | null
}) {
  const standardPoints = tubes
    .filter((t) => t.kind !== "unknown" && t.od !== null)
    .map((t) => ({ x: t.protein, y: t.od as number }))

  const fit = linearFit(standardPoints)

  // Build the fitted line across the standard range.
  const line = [0, 100].map((x) => ({ x, fit: fit.m * x + fit.c }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 12, right: 16, bottom: 28, left: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            tickCount={6}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11 }}
            label={{
              value: "Protein (µg)",
              position: "bottom",
              offset: 10,
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, "auto"]}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11 }}
            label={{
              value: "OD @ 660 nm",
              angle: -90,
              position: "insideLeft",
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            formatter={(value: number, name) => [value.toFixed(3), name === "y" ? "OD" : name]}
            labelFormatter={(l) => `${l} µg`}
          />
          <Line
            data={line}
            dataKey="fit"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Best fit"
          />
          <Scatter data={standardPoints} fill="var(--chart-1)" name="Standards" />
          {unknownOd !== null && estimate !== null && (
            <>
              <ReferenceLine
                y={unknownOd}
                stroke="var(--accent)"
                strokeDasharray="5 4"
                strokeWidth={1.5}
              />
              <ReferenceLine
                x={estimate}
                stroke="var(--accent)"
                strokeDasharray="5 4"
                strokeWidth={1.5}
              />
              <Scatter
                data={[{ x: estimate, y: unknownOd }]}
                fill="var(--accent)"
                name="Unknown"
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
