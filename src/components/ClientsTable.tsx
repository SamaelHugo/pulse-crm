"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ClientData } from "@/lib/types";
import Modal, { FormInput, FormSelect } from "@/components/Modal";

// ── Helpers ──────────────────────────────────────────────

type ClientStatus = "active" | "lead" | "inactive";

const statusConfig: Record<
  ClientStatus,
  { label: string; style: string }
> = {
  active: { label: "Активный", style: "bg-success-muted text-success" },
  lead: {
    label: "Лид",
    style: "bg-accent-secondary-muted text-accent-secondary",
  },
  inactive: { label: "Неактивный", style: "bg-[#6B7280]/15 text-[#9CA3AF]" },
};

const avatarColors = [
  "bg-accent-muted text-accent",
  "bg-accent-secondary-muted text-accent-secondary",
  "bg-success-muted text-success",
  "bg-danger-muted text-danger",
  "bg-[#8B5CF6]/15 text-[#A78BFA]",
  "bg-[#EC4899]/15 text-[#F472B6]",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAvatarColor(name: string): string {
  return avatarColors[hashString(name) % avatarColors.length];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(".", ",") + "М ₽";
  }
  if (value === 0) return "0 ₽";
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) {
    const n = diffDays % 100;
    const n1 = n % 10;
    const form =
      n > 10 && n < 20
        ? "дней"
        : n1 > 1 && n1 < 5
          ? "дня"
          : n1 === 1
            ? "день"
            : "дней";
    return `${diffDays} ${form} назад`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const form = weeks === 1 ? "неделю" : weeks < 5 ? "недели" : "недель";
    return `${weeks} ${form} назад`;
  }
  const months = Math.floor(diffDays / 30);
  const form =
    months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев";
  return `${months} ${form} назад`;
}

// ── Types ────────────────────────────────────────────────

type StatusFilter = "all" | ClientStatus;
type SortKey = "name" | "revenue" | "lastContact";

// ── Component ────────────────────────────────────────────

export default function ClientsTable({ clients }: { clients: ClientData[] }) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({ name: "", company: "", email: "", phone: "", status: "lead" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Debounced search
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortKey, perPage]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...clients];

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "ru");
        case "revenue":
          return (b.revenue ?? 0) - (a.revenue ?? 0);
        case "lastContact":
          return new Date(b.lastContact ?? 0).getTime() - new Date(a.lastContact ?? 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [clients, debouncedSearch, statusFilter, sortKey]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const allChecked =
    paginated.length > 0 && paginated.every((c) => checkedIds.has(c.id));

  const toggleAll = useCallback(() => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        paginated.forEach((c) => next.delete(c.id));
      } else {
        paginated.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }, [allChecked, paginated]);

  const toggleOne = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  // ── Create Client ─────────────────────────────────────────
  const handleCreate = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Обязательное поле";
    if (!formData.company.trim()) errors.company = "Обязательное поле";
    if (!formData.email.trim()) errors.email = "Обязательное поле";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Некорректный email";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setCreating(true);
    setCreateError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setCreateError(json.error || "Ошибка создания");
        return;
      }
      setShowCreateModal(false);
      setFormData({ name: "", company: "", email: "", phone: "", status: "lead" });
      router.refresh();
    } catch {
      setCreateError("Ошибка сети");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Клиенты</h2>
          <span className="rounded-md bg-bg-elevated px-2 py-0.5 font-mono text-xs font-medium text-text-secondary">
            {clients.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
        >
          + Новый клиент
        </button>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-1 md:flex-nowrap">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1 md:max-w-[300px]">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, компании, email..."
            className="w-full rounded-lg border border-border bg-bg-card py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary transition-colors duration-150 focus:border-accent/40 focus:outline-none"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="lead">Лиды</option>
          <option value="inactive">Неактивные</option>
        </select>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary transition-colors duration-150 focus:border-accent/40 focus:outline-none"
        >
          <option value="name">По имени</option>
          <option value="revenue">По выручке</option>
          <option value="lastContact">По дате</option>
        </select>

        {/* View toggle (table active) */}
        <div className="ml-auto flex gap-1 rounded-lg border border-border bg-bg-card p-1">
          <button className="rounded-md bg-accent-muted p-1.5 text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>
          </button>
          <button className="rounded-md p-1.5 text-text-muted transition-colors duration-150 hover:text-text-secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Table (desktop) ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState onReset={() => { setSearch(""); setStatusFilter("all"); }} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-elevated/50">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-border bg-bg-card accent-accent"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Клиент
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Компания
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Статус
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Сделки
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Выручка
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Последний контакт
                    </th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((client, idx) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      checked={checkedIds.has(client.id)}
                      onCheck={() => toggleOne(client.id)}
                      onClick={() => router.push(`/clients/${client.id}`)}
                      striped={idx % 2 === 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Cards (mobile) ───────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {paginated.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => router.push(`/clients/${client.id}`)}
              />
            ))}
          </div>

          {/* ── Pagination ───────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              Показано{" "}
              <span className="font-medium text-text-secondary">
                {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)}
              </span>{" "}
              из{" "}
              <span className="font-medium text-text-secondary">
                {filtered.length}
              </span>
            </p>

            <div className="flex items-center gap-2">
              {/* Per page */}
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-lg border border-border bg-bg-card px-2 py-1.5 text-xs text-text-secondary focus:border-accent/40 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>

              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-bg-card p-1.5 text-text-secondary transition-colors duration-150 hover:bg-bg-elevated disabled:opacity-30 disabled:hover:bg-bg-card"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Page numbers */}
              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span key={`e${i}`} className="px-1 text-xs text-text-muted">
                    ...
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors duration-150 ${
                      page === n
                        ? "bg-accent text-white"
                        : "border border-border bg-bg-card text-text-secondary hover:bg-bg-elevated"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-bg-card p-1.5 text-text-secondary transition-colors duration-150 hover:bg-bg-elevated disabled:opacity-30 disabled:hover:bg-bg-card"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create Client Modal ──────────────────────────── */}
      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); setCreateError(""); setFieldErrors({}); }} title="Новый клиент">
        <div className="space-y-4">
          {createError && (
            <div className="rounded-lg bg-danger-muted px-4 py-2.5 text-sm text-danger">{createError}</div>
          )}
          <FormInput
            label="Имя *"
            placeholder="Иван Петров"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            error={fieldErrors.name}
          />
          <FormInput
            label="Компания *"
            placeholder="ООО «Компания»"
            value={formData.company}
            onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
            error={fieldErrors.company}
          />
          <FormInput
            label="Email *"
            type="email"
            placeholder="ivan@company.ru"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            error={fieldErrors.email}
          />
          <FormInput
            label="Телефон"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          />
          <FormSelect
            label="Статус"
            value={formData.status}
            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
            options={[
              { value: "lead", label: "Лид" },
              { value: "active", label: "Активный" },
              { value: "inactive", label: "Неактивный" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowCreateModal(false); setCreateError(""); setFieldErrors({}); }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated"
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            >
              {creating ? "Создание..." : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Table Row ────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}

function ClientRow({
  client,
  checked,
  onCheck,
  onClick,
  striped,
}: {
  client: ClientData;
  checked: boolean;
  onCheck: () => void;
  onClick: () => void;
  striped: boolean;
}) {
  const status = statusConfig[client.status as ClientStatus];

  return (
    <tr
      className={`border-b border-border/50 transition-colors duration-100 last:border-b-0 hover:bg-white/[0.03] cursor-pointer ${
        striped ? "bg-white/[0.01]" : ""
      }`}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="h-4 w-4 rounded border-border bg-bg-card accent-accent"
        />
      </td>
      <td className="px-4 py-3" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(client.name)}`}
          >
            {getInitials(client.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {client.name}
            </p>
            <p className="truncate text-xs text-text-muted">{client.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary" onClick={onClick}>
        {client.company}
      </td>
      <td className="px-4 py-3" onClick={onClick}>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${status?.style || ""}`}
        >
          {status?.label || client.status}
        </span>
      </td>
      <td
        className="px-4 py-3 text-center font-mono text-sm text-text-secondary"
        onClick={onClick}
      >
        {client.totalDeals ?? 0}
      </td>
      <td
        className="px-4 py-3 text-right font-mono text-sm font-medium text-text-primary"
        onClick={onClick}
      >
        {formatCurrency(client.revenue ?? 0)}
      </td>
      <td
        className="px-4 py-3 text-right text-xs text-text-muted"
        onClick={onClick}
      >
        {client.lastContact ? formatRelativeDate(client.lastContact) : "—"}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-lg p-1.5 text-text-muted transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ── Mobile Card ──────────────────────────────────────────

function ClientCard({
  client,
  onClick,
}: {
  client: ClientData;
  onClick: () => void;
}) {
  const status = statusConfig[client.status as ClientStatus];

  return (
    <button
      onClick={onClick}
      className="card-glow w-full rounded-xl border border-border bg-bg-card p-4 text-left transition-colors duration-150 hover:bg-white/[0.02]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(client.name)}`}
        >
          {getInitials(client.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-text-primary">
              {client.name}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status?.style || ""}`}
            >
              {status?.label || client.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{client.company}</p>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {client.totalDeals ?? 0} сделок
            </span>
            <span className="font-mono font-medium text-text-primary">
              {formatCurrency(client.revenue ?? 0)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-text-muted">
            <span>{client.email}</span>
            <span>{client.lastContact ? formatRelativeDate(client.lastContact) : "—"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Empty State ──────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg-card py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
        <svg
          className="h-8 w-8 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-text-primary">
        Клиенты не найдены
      </p>
      <p className="mt-1 text-sm text-text-muted">
        Попробуйте изменить параметры поиска
      </p>
      <button
        onClick={onReset}
        className="mt-4 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
