"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DealData } from "@/lib/types";
import Modal, { FormInput, FormSelect, FormField } from "@/components/Modal";

// ── Config ───────────────────────────────────────────────

type DealStage = "lead" | "negotiation" | "proposal" | "closed-won" | "closed-lost";

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

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function formatTableDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Types ────────────────────────────────────────────────

type View = "kanban" | "table";
type SortKey = "title" | "value" | "createdAt";

interface ClientOption {
  id: string;
  name: string;
  company: string;
}

// ── Component ────────────────────────────────────────────

export default function DealsView({ deals }: { deals: DealData[] }) {
  const router = useRouter();

  const [view, setView] = useState<View>("kanban");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [mobileStage, setMobileStage] = useState<DealStage>("lead");

  // Create deal modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dealForm, setDealForm] = useState({ title: "", value: "", stage: "lead", clientId: "" });
  const [dealError, setDealError] = useState("");
  const [dealFieldErrors, setDealFieldErrors] = useState<Record<string, string>>({});
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Stage update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load clients when modal opens
  useEffect(() => {
    if (!showCreateModal) return;
    setLoadingClients(true);
    fetch("/api/clients?perPage=100")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setClients(json.data.map((c: ClientOption) => ({ id: c.id, name: c.name, company: c.company })));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingClients(false));
  }, [showCreateModal]);

  // Summary stats
  const pipelineValue = useMemo(
    () =>
      deals
        .filter((d) => d.stage !== "closed-won" && d.stage !== "closed-lost")
        .reduce((s, d) => s + d.value, 0),
    [deals]
  );

  const wonThisMonth = useMemo(
    () =>
      deals
        .filter(
          (d) =>
            d.stage === "closed-won" &&
            d.closedAt &&
            new Date(d.closedAt).getMonth() === 2 &&
            new Date(d.closedAt).getFullYear() === 2026
        )
        .reduce((s, d) => s + d.value, 0),
    [deals]
  );

  const lostThisMonth = useMemo(
    () =>
      deals
        .filter(
          (d) =>
            d.stage === "closed-lost" &&
            d.closedAt &&
            new Date(d.closedAt).getMonth() === 2 &&
            new Date(d.closedAt).getFullYear() === 2026
        )
        .reduce((s, d) => s + d.value, 0),
    [deals]
  );

  const totalClosed = deals.filter(
    (d) => d.stage === "closed-won" || d.stage === "closed-lost"
  ).length;
  const totalWon = deals.filter((d) => d.stage === "closed-won").length;
  const winRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

  // Grouped deals for kanban
  const grouped = useMemo(() => {
    const map: Record<DealStage, DealData[]> = {
      lead: [],
      negotiation: [],
      proposal: [],
      "closed-won": [],
      "closed-lost": [],
    };
    for (const deal of deals) {
      if (map[deal.stage as DealStage]) map[deal.stage as DealStage].push(deal);
    }
    for (const key of Object.keys(map) as DealStage[]) {
      map[key].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return map;
  }, [deals]);

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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [deals, stageFilter, sortKey]);

  // ── Create Deal ────────────────────────────────────────
  const handleCreateDeal = async () => {
    const errors: Record<string, string> = {};
    if (!dealForm.title.trim()) errors.title = "Обязательное поле";
    if (!dealForm.value.trim()) errors.value = "Обязательное поле";
    else if (isNaN(Number(dealForm.value)) || Number(dealForm.value) < 0) errors.value = "Введите число";
    if (!dealForm.clientId) errors.clientId = "Выберите клиента";

    if (Object.keys(errors).length > 0) {
      setDealFieldErrors(errors);
      return;
    }

    setCreatingDeal(true);
    setDealError("");
    setDealFieldErrors({});

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dealForm.title,
          value: Number(dealForm.value),
          stage: dealForm.stage,
          clientId: dealForm.clientId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setDealError(json.error || "Ошибка создания");
        return;
      }
      setShowCreateModal(false);
      setDealForm({ title: "", value: "", stage: "lead", clientId: "" });
      router.refresh();
    } catch {
      setDealError("Ошибка сети");
    } finally {
      setCreatingDeal(false);
    }
  };

  // ── Stage Change ───────────────────────────────────────
  const handleStageChange = async (dealId: string, newStage: string) => {
    setUpdatingId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const json = await res.json();
      if (json.success) router.refresh();
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete Deal ────────────────────────────────────────
  const handleDeleteDeal = async (dealId: string) => {
    setDeletingId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setConfirmDeleteId(null);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

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

          <button
            onClick={() => { setDealForm({ title: "", value: "", stage: "lead", clientId: "" }); setDealError(""); setDealFieldErrors({}); setShowCreateModal(true); }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
          >
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
                    updatingId={updatingId}
                    confirmDeleteId={confirmDeleteId}
                    deletingId={deletingId}
                    onStageChange={handleStageChange}
                    onDeleteRequest={setConfirmDeleteId}
                    onDeleteConfirm={handleDeleteDeal}
                    onDeleteCancel={() => setConfirmDeleteId(null)}
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
                const stage = stageMap.get(deal.stage as DealStage)!;
                return (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    stage={stage}
                    clientName={deal.client?.name}
                    updatingId={updatingId}
                    confirmDeleteId={confirmDeleteId}
                    deletingId={deletingId}
                    onStageChange={handleStageChange}
                    onDeleteRequest={setConfirmDeleteId}
                    onDeleteConfirm={handleDeleteDeal}
                    onDeleteCancel={() => setConfirmDeleteId(null)}
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
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {tableDeals.map((deal, idx) => {
                  const stage = stageMap.get(deal.stage as DealStage)!;
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
                            {deal.client?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {deal.client?.company}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-text-primary">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={deal.stage}
                          disabled={updatingId === deal.id}
                          onChange={(e) => handleStageChange(deal.id, e.target.value)}
                          className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none ${stage.badgeStyle} ${updatingId === deal.id ? "opacity-50" : "cursor-pointer"}`}
                        >
                          {stages.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                        {formatTableDate(deal.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                        {formatTableDate(deal.closedAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        {confirmDeleteId === deal.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteDeal(deal.id)} disabled={deletingId === deal.id} className="rounded-md bg-danger px-2 py-1 text-[11px] font-medium text-white hover:bg-danger/80 disabled:opacity-50">
                              {deletingId === deal.id ? "..." : "Да"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-bg-elevated">Нет</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(deal.id)}
                            className="rounded-lg p-1 text-text-muted transition-colors duration-150 hover:bg-bg-elevated hover:text-danger"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create Deal Modal ────────────────────────────── */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Новая сделка">
        <div className="space-y-4">
          {dealError && (
            <div className="rounded-lg bg-danger-muted px-4 py-2.5 text-sm text-danger">{dealError}</div>
          )}
          <FormInput label="Название *" placeholder="Внедрение CRM" value={dealForm.title} onChange={(e) => setDealForm((p) => ({ ...p, title: e.target.value }))} error={dealFieldErrors.title} />
          <FormInput label="Сумма (₽) *" type="number" placeholder="500000" value={dealForm.value} onChange={(e) => setDealForm((p) => ({ ...p, value: e.target.value }))} error={dealFieldErrors.value} />
          <FormField label="Клиент *" error={dealFieldErrors.clientId}>
            <select
              value={dealForm.clientId}
              onChange={(e) => setDealForm((p) => ({ ...p, clientId: e.target.value }))}
              className={`w-full rounded-lg border bg-bg-card px-3 py-2 text-sm text-text-primary transition-colors duration-150 focus:outline-none ${
                dealFieldErrors.clientId ? "border-danger focus:border-danger" : "border-border focus:border-accent/40"
              }`}
            >
              <option value="">{loadingClients ? "Загрузка..." : "Выберите клиента"}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
              ))}
            </select>
          </FormField>
          <FormSelect
            label="Этап"
            value={dealForm.stage}
            onChange={(e) => setDealForm((p) => ({ ...p, stage: e.target.value }))}
            options={stages.map((s) => ({ value: s.key, label: s.label }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated">Отмена</button>
            <button onClick={handleCreateDeal} disabled={creatingDeal} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50">
              {creatingDeal ? "Создание..." : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
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
  updatingId,
  confirmDeleteId,
  deletingId,
  onStageChange,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  stage: (typeof stages)[number];
  deals: DealData[];
  total: number;
  updatingId: string | null;
  confirmDeleteId: string | null;
  deletingId: string | null;
  onStageChange: (id: string, stage: string) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
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
          return (
            <DealCard
              key={deal.id}
              deal={deal}
              stage={stage}
              clientName={deal.client?.name}
              updatingId={updatingId}
              confirmDeleteId={confirmDeleteId}
              deletingId={deletingId}
              onStageChange={onStageChange}
              onDeleteRequest={onDeleteRequest}
              onDeleteConfirm={onDeleteConfirm}
              onDeleteCancel={onDeleteCancel}
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
  updatingId,
  confirmDeleteId,
  deletingId,
  onStageChange,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  deal: DealData;
  stage: (typeof stages)[number];
  clientName?: string;
  updatingId: string | null;
  confirmDeleteId: string | null;
  deletingId: string | null;
  onStageChange: (id: string, stage: string) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}) {
  return (
    <div
      className={`card-glow cursor-default rounded-lg border border-border border-l-2 ${stage.borderColor} bg-bg-card p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{deal.title}</p>
          <p className="mt-1 text-xs text-text-muted">{clientName}</p>
        </div>
        {confirmDeleteId === deal.id ? (
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => onDeleteConfirm(deal.id)} disabled={deletingId === deal.id} className="rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-danger/80 disabled:opacity-50">
              {deletingId === deal.id ? "..." : "Да"}
            </button>
            <button onClick={onDeleteCancel} className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-muted hover:bg-bg-elevated">Нет</button>
          </div>
        ) : (
          <button
            onClick={() => onDeleteRequest(deal.id)}
            className="shrink-0 rounded p-0.5 text-text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100 [div:hover>&]:opacity-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`font-mono text-sm font-medium ${stage.valueColor}`}>
          {formatCurrency(deal.value)}
        </span>
        <select
          value={deal.stage}
          disabled={updatingId === deal.id}
          onChange={(e) => onStageChange(deal.id, e.target.value)}
          className={`rounded-full border-0 bg-transparent px-0 py-0 text-[11px] text-text-muted transition-colors focus:outline-none ${updatingId === deal.id ? "opacity-50" : "cursor-pointer hover:text-text-secondary"}`}
        >
          {stages.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
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
