"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyDataPoint } from "@/lib/types";

type Period = "6m" | "1y" | "all";

const periods: { key: Period; label: string }[] = [
  { key: "6m", label: "6М" },
  { key: "1y", label: "1Г" },
  { key: "all", label: "Всё" },
];

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}К`;
  return String(value);
}

function formatTooltipValue(value: number): string {
  return value.toLocaleString("ru-RU") + " ₽";
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-accent">
        {formatTooltipValue(payload[0].value)}
      </p>
    </div>
  );
}

export default function RevenueChart({ monthlyData }: { monthlyData: MonthlyDataPoint[] }) {
  const [period, setPeriod] = useState<Period>("1y");

  const data =
    period === "6m"
      ? monthlyData.slice(-6)
      : period === "1y"
        ? monthlyData.slice(-12)
        : monthlyData;

  return (
    <div className="card-glow rounded-xl border border-border bg-bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Выручка</h3>
        <div className="flex gap-1 rounded-lg bg-bg-base p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                period === p.key
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--accent)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickFormatter={(v: string) => v.split(" ")[0]}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.08)",
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--accent)",
                stroke: "var(--bg-card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
