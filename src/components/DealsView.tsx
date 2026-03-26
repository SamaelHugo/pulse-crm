"use client";

import { useState, useMemo } from "react";
import { deals, clients, type Deal, type DealStage } from "@/data/mockData";

// ── Config ───────────────────────────────────────────────

const stages: {
  key: DealStage;
  label: string;
  color: string;
  dotColor: string;
  borderColor: string;
  valueColor: string;
  badgeStyle: string;
}[] = [
  {
    key: "lead",
    label: "Лид",
    color: "text-[#9CA3AF]",
    dotColor: "bg-[#6B7280]",
    borderColor: "border-l-[#6B7280]",
    valueColor: "text-text-secondary",
    badgeStyle: "bg-[#6B7280]/15 text-[#9CA3AF]",
  },
  {
    key: "negotiation",
    label: "Переговоры",
    color: "text-accent-secondary",
    dotColor: "bg-accent-secondary",
    borderColor: "border-l-accent-secondary",
    valueColor: "text-accent-secondary",
    badgeStyle: "bg-accent-secondary-muted text-accent-secondary",
  },
  {
    key: "proposal",
    label: "Предложение",
    color: "text-accent",
    dotColor: "bg-accent",
    borderColor: "border-l-accent",
    valueColor: "text-accent",
    badgeStyle: "bg-accent-muted text-accent",
  },
  {
    key: "closed-won",
    label: "Закрыто (выиграно)",
    color: "text-success",
    dotColor: "bg-success",
    borderColor: "border-l-success",
    valueColor: "text-success",
    badgeStyle: "bg-success-muted text-success",
  },
  {
    key: "closed-lost",
    label: "Закрыто (проиграно)",
    color: "text-[#9CA3AF]",
    dotColor: "bg-danger",
    borderColor: "border-l-danger/50",
    valueColor: "text-text-muted",
    badgeStyle: "bg-danger-muted text-[#9CA3AF]",
  },
];

const stageMap = new Map(stages.map((s) => [s.key, s]));
const clientMap = new Map(clients.map((c) => [c.id, c]));

// ── Helpers ──────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(".", ",") + "М ₽";
  }
  if (value === 0) return "0 ₽";
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatFullCurrency(value: number): string {
  return value.toLocaleString("ru-RU").replace(/,/g, " ") + " ₽";
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function formatTableDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Types ────────────────────────────────────────────────

type View = "kanban" | "table";
type SortKey = "title" | "value" | "createdAt";

// ── Component ────────────────────────────────────────────

export default function DealsView() {
  const [view, setView] = useState<View>("kanban");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [mobileStage, setMobileStage] = useState<DealStage>("lead");

  // Summary stats
  const pipelineValue = useMemo(
    () =>
      deals
        .filter((d) => d.stage !== "closed-won" && d.stage !== "closed-lost")
        .reduce((s, d) => s + d.value, 0),
    []
  );

  const wonThisMonth = useMemo(
    () =>
      deals
        .filter(
          (d) =>
            d.stage === "closed-won" &&
            d.closedAt &&
            d.closedAt.getMonth() === 2 &&
            d.closedAt.getFullYear() === 2026
        )
        .reduce((s, d) => s + d.value, 0),
    []
  );

  const lostThisMonth = useMemo(
    () =>
      deals
        .filter(
          (d) =>
            d.stage === "closed-lost" &&
            d.closedAt &&
            d.closedAt.getMonth() === 2 &&
            d.closedAt.getFullYear() === 2026
        )
        .reduce((s, d) => s + d.value, 0),
    []
  );

  const totalClosed = deals.filter(
    (d) => d.stage === "closed-won" || d.stage === "closed-lost"
  ).length;
  const totalWon = deals.filter((d) => d.stage === "closed-won").length;
  const winRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

  // Grouped deals for kanban
  const grouped = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      lead: [],
      negotiation: [],
      proposal: [],
      "closed-won": [],
      "closed-lost": [],
    };
    for (const deal of deals) {
      map[deal.stage].push(deal);
    }
    // Sort each group by date
    for (const key of Object.keys(map) as DealStage[]) {
      map[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return map;
  }, []);

  // Filtered + sorted for table
  const tableDeals = useMemo(() => {
    let result =
      stageFilter === "all"
        ? [...deals]
        : deals.filter((d) => d.stage === stageFilter);

    result.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return a.title.localeCompare(b.title, "ru");
        case "value":
          return b.value - a.value;
        case "createdAt":
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [stageFilter, sortKey]);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Сделки</h2>
          <span className="rounded-md bg-bg-elevated px-2 py-0.5 font-mono text-xs font-medium text-text-secondary">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Stage filter (table view) */}
          {view === "table" && (
            <select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(e.target.value as DealStage | "all")
              }
              className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary transition-colors duration-150 focus:border-accent/40 focus:outline-none"
            >
              <option value="all">Все этапы</option>
              {stages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          )}

          {/* View toggle */}
          <div className="flex gap-1 rounded-lg border border-border bg-bg-card p-1">
            <button
              onClick={() => setView("kanban")}
              className={`rounded-md p-1.5 transition-colors duration-150 ${
                view === "kanban"
                  ? "bg-accent-muted text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              title="Канбан"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </button>
            <button
              onClick={() => setView("table")}
              className={`rounded-md p-1.5 transition-colors duration-150 ${
                view === "table"
                  ? "bg-accent-muted text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              title="Таблица"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                />
              </svg>
            </button>
          </div>

          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover">
            + Новая сделка
          </button>
        </div>
      </div>

      {/* ── Summary Bar ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Воронка"
          value={formatFullCurrency(pipelineValue)}
          color="text-accent"
        />
        <SummaryCard
          label="Выиграно (месяц)"
          value={formatFullCurrency(wonThisMonth)}
          color="text-success"
        />
        <SummaryCard
          label="Проиграно (месяц)"
          value={formatFullCurrency(lostThisMonth)}
          color="text-danger"
        />
        <SummaryCard
          label="Win rate"
          value={`${winRate.toFixed(0)}%`}
          color="text-accent-secondary"
        />
      </div>

      {/* ── Kanban ─────────────────────────────────────── */}
      {view === "kanban" && (
        <>
          {/* Desktop kanban */}
          <div className="hidden overflow-x-auto pb-4 md:block">
            <div className="flex gap-4" style={{ minWidth: stages.length * 280 }}>
              {stages.map((stage) => {
                const stageDeals = grouped[stage.key];
                const stageTotal = stageDeals.reduce(
                  (s, d) => s + d.value,
                  0
                );
                return (
                  <KanbanColumn
                    key={stage.key}
                    stage={stage}
                    deals={stageDeals}
                    total={stageTotal}
                  />
                );
              })}
            </div>
          </div>

          {/* Mobile: stage tabs */}
          <div className="md:hidden">
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-bg-card p-1">
              {stages.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setMobileStage(s.key)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    mobileStage === s.key
                      ? "bg-accent text-white"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {s.label.split(" ")[0]}{" "}
                  <span className="opacity-60">
                    {grouped[s.key].length}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {grouped[mobileStage].map((deal) => {
                const stage = stageMap.get(deal.stage)!;
                const client = clientMap.get(deal.clientId);
                return (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    stage={stage}
                    clientName={client?.name}
                  />
                );
              })}
              {grouped[mobileStage].length === 0 && (
                <p className="py-8 text-center text-sm text-text-muted">
                  Нет сделок на этом этапе
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Table ──────────────────────────────────────── */}
      {view === "table" && (
        <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-elevated/50">
                  <ThSortable
                    label="Сделка"
                    sortKey="title"
                    current={sortKey}
                    onSort={setSortKey}
                  />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Клиент
                  </th>
                  <ThSortable
                    label="Сумма"
                    sortKey="value"
                    current={sortKey}
                    onSort={setSortKey}
                    align="right"
                  />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Этап
                  </th>
                  <ThSortable
                    label="Создана"
                    sortKey="createdAt"
                    current={sortKey}
                    onSort={setSortKey}
                    align="right"
                  />
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Закрыта
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableDeals.map((deal, idx) => {
                  const client = clientMap.get(deal.clientId);
                  const stage = stageMap.get(deal.stage)!;
                  return (
                    <tr
                      key={deal.id}
                      className={`border-b border-border/50 transition-colors duration-100 last:border-b-0 hover:bg-white/[0.03] ${
                        idx % 2 === 1 ? "bg-white/[0.01]" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                        {deal.title}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm text-text-secondary">
                            {client?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {client?.company}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-text-primary">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${stage.badgeStyle}`}
                        >
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                        {formatTableDate(deal.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                        {formatTableDate(deal.closedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card-glow rounded-xl border border-border bg-bg-card p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-lg font-bold tracking-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}

// ── Kanban Column ────────────────────────────────────────

function KanbanColumn({
  stage,
  deals: stageDeals,
  total,
}: {
  stage: (typeof stages)[number];
  deals: Deal[];
  total: number;
}) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-xl bg-bg-card/50">
      {/* Column header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
        <span className={`text-sm font-semibold ${stage.color}`}>
          {stage.label}
        </span>
        <span className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] font-medium text-text-muted">
          {stageDeals.length}
        </span>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 380px)" }}>
        {stageDeals.map((deal) => {
          const client = clientMap.get(deal.clientId);
          return (
            <DealCard
              key={deal.id}
              deal={deal}
              stage={stage}
              clientName={client?.name}
            />
          );
        })}
        {stageDeals.length === 0 && (
          <p className="py-6 text-center text-xs text-text-muted">
            Нет сделок
          </p>
        )}
      </div>
    </div>
  );
}

// ── Deal Card ────────────────────────────────────────────

function DealCard({
  deal,
  stage,
  clientName,
}: {
  deal: Deal;
  stage: (typeof stages)[number];
  clientName?: string;
}) {
  return (
    <div
      className={`card-glow cursor-default rounded-lg border border-border border-l-2 ${stage.borderColor} bg-bg-card p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
    >
      <p className="text-sm font-semibold text-text-primary">{deal.title}</p>
      <p className="mt-1 text-xs text-text-muted">{clientName}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`font-mono text-sm font-medium ${stage.valueColor}`}>
          {formatCurrency(deal.value)}
        </span>
        <span className="text-[11px] text-text-muted">
          {formatShortDate(deal.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Sortable Table Header ────────────────────────────────

function ThSortable({
  label,
  sortKey,
  current,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th
      className={`cursor-pointer px-4 py-3 text-${align} text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 select-none ${
        active ? "text-accent" : "text-text-muted hover:text-text-secondary"
      }`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        )}
      </span>
    </th>
  );
}
