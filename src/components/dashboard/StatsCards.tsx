"use client";

import { deals, monthlyData, clients, type DealStage } from "@/data/mockData";

function formatCurrency(value: number): string {
  return value.toLocaleString("ru-RU").replace(/,/g, " ") + " ₽";
}

function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
        isPositive
          ? "bg-success-muted text-success"
          : "bg-danger-muted text-danger"
      }`}
    >
      <svg
        className={`h-3 w-3 ${isPositive ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function ConversionRing({ percentage }: { percentage: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function StatsCards() {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];

  const revenueTrend =
    ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;

  const activeStages: DealStage[] = ["lead", "negotiation", "proposal"];
  const activeDeals = deals.filter((d) => activeStages.includes(d.stage));
  const proposalDeals = deals.filter((d) => d.stage === "proposal");

  const newClientsTrend =
    ((currentMonth.newClients - prevMonth.newClients) / prevMonth.newClients) *
    100;

  const closedWon = deals.filter((d) => d.stage === "closed-won").length;
  const closedLost = deals.filter((d) => d.stage === "closed-lost").length;
  const closedTotal = closedWon + closedLost;
  const conversion = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const stats = [
    {
      label: "Выручка за месяц",
      value: formatCurrency(currentMonth.revenue),
      extra: <TrendBadge value={revenueTrend} />,
      icon: (
        <svg
          className="h-8 w-8 text-accent-secondary/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Активные сделки",
      value: String(activeDeals.length),
      extra: (
        <span className="text-sm text-text-secondary">
          из них {proposalDeals.length} на финале
        </span>
      ),
      icon: (
        <svg
          className="h-8 w-8 text-accent/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
          />
        </svg>
      ),
    },
    {
      label: "Новые клиенты",
      value: String(currentMonth.newClients),
      extra: <TrendBadge value={newClientsTrend} />,
      icon: (
        <svg
          className="h-8 w-8 text-success/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
          />
        </svg>
      ),
    },
    {
      label: "Конверсия",
      value: `${conversion.toFixed(1)}%`,
      extra: (
        <span className="text-sm text-text-secondary">
          {activeClients} из {totalClients} активных
        </span>
      ),
      icon: <ConversionRing percentage={conversion} />,
      hasRing: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-glow relative overflow-hidden rounded-xl border border-border bg-bg-card p-6"
        >
          <div className="absolute right-4 top-4">
            {stat.hasRing ? (
              <div className="relative">
                {stat.icon}
                <span className="absolute inset-0 flex items-center justify-center rotate-90 font-mono text-[11px] font-semibold text-accent">
                  {stat.value}
                </span>
              </div>
            ) : (
              stat.icon
            )}
          </div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            {stat.label}
          </p>
          {!stat.hasRing && (
            <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-text-primary">
              {stat.value}
            </p>
          )}
          {stat.hasRing && <div className="mt-2 h-9" />}
          <div className="mt-2">{stat.extra}</div>
        </div>
      ))}
    </div>
  );
}
