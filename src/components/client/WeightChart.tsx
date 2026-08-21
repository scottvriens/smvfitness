"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BodyMetricEntry } from "@/lib/types";

export function WeightChart({ data }: { data: BodyMetricEntry[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
    weight: d.weightKg,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-sage)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-sage)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-taupe)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-charcoal)", opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 11, fill: "var(--color-charcoal)", opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            width={46}
            tickFormatter={(value: number) => `${Math.round(value)}`}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid var(--color-taupe)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} kg`, "Weight"]}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="var(--color-sage-deep)"
            strokeWidth={2.5}
            fill="url(#weightFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
