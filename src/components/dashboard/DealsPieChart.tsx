"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { deals, type DealStage } from "@/data/mockData";

const stageConfig: Record<
  DealStage,
  { label: string; color: string; cssColor: string }
> = {
  lead: {
    label: "Лид",
    color: "#6B7280",
    cssColor: "bg-[#6B7280]",
  },
  negotiation: {
    label: "Переговоры",
    color: "var(--accent-secondary)",
    cssColor: "bg-accent-secondary",
  },
  proposal: {
    label: "Предложение",
    color: "var(--accent)",
    cssColor: "bg-accent",
  },
  "closed-won": {
    label: "Закрыта",
    color: "var(--success)",
    cssColor: "bg-success",
  },
  "closed-lost": {
    label: "Проиграна",
    color: "#4B5563",
    cssColor: "bg-[#4B5563]",
  },
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-text-muted">{item.name}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
        {item.value} сделок
      </p>
    </div>
  );
}

export default function DealsPieChart() {
  const stageCounts = (Object.keys(stageConfig) as DealStage[]).map(
    (stage) => ({
      name: stageConfig[stage].label,
      value: deals.filter((d) => d.stage === stage).length,
      color: stageConfig[stage].color,
      cssColor: stageConfig[stage].cssColor,
    })
  );

  const total = deals.length;

  return (
    <div className="card-glow rounded-xl border border-border bg-bg-card p-6">
      <h3 className="mb-6 text-sm font-semibold text-text-primary">
        Сделки по этапам
      </h3>

      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stageCounts}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {stageCounts.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold text-text-primary">
            {total}
          </span>
          <span className="text-xs text-text-muted">сделок</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
        {stageCounts.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${item.cssColor}`}
            />
            <span className="text-xs text-text-secondary">{item.name}</span>
            <span className="ml-auto font-mono text-xs font-medium text-text-primary">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
