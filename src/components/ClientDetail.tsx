"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ClientData, DealData, NoteData } from "@/lib/types";
import Modal, { FormInput, FormSelect } from "@/components/Modal";

// ── Helpers ──────────────────────────────────────────────

type ClientStatus = "active" | "lead" | "inactive";
type DealStage = "lead" | "negotiation" | "proposal" | "closed-won" | "closed-lost";

const statusConfig: Record<ClientStatus, { label: string; style: string }> = {
  active: { label: "Активный", style: "bg-success-muted text-success" },
  lead: { label: "Лид", style: "bg-accent-secondary-muted text-accent-secondary" },
  inactive: { label: "Неактивный", style: "bg-[#6B7280]/15 text-[#9CA3AF]" },
};

const stageLabels: Record<DealStage, string> = {
  lead: "Лид",
  negotiation: "Переговоры",
  proposal: "Предложение",
  "closed-won": "Закрыта",
  "closed-lost": "Проиграна",
};

const stageStyles: Record<DealStage, string> = {
  lead: "bg-[#6B7280]/15 text-[#9CA3AF]",
  negotiation: "bg-accent-secondary-muted text-accent-secondary",
  proposal: "bg-accent-muted text-accent",
  "closed-won": "bg-success-muted text-success",
  "closed-lost": "bg-danger-muted text-[#9CA3AF]",
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

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(".", ",") + "М ₽";
  if (value === 0) return "0 ₽";
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

// ── Types ────────────────────────────────────────────────

type Tab = "deals" | "activity" | "notes";

interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  color: string;
}

interface Props {
  client: ClientData | null;
  deals: DealData[];
  notes: NoteData[];
}

// ── Component ────────────────────────────────────────────

export default function ClientDetail({ client, deals, notes }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("deals");
  const [copied, setCopied] = useState<string | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", company: "", email: "", phone: "", status: "" });
  const [editError, setEditError] = useState("");
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // New deal modal
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealData, setDealData] = useState({ title: "", value: "", stage: "lead" });
  const [dealError, setDealError] = useState("");
  const [dealFieldErrors, setDealFieldErrors] = useState<Record<string, string>>({});
  const [creatingDeal, setCreatingDeal] = useState(false);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!client) return <NotFound />;

  const clientDeals = [...deals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalRevenue = clientDeals.reduce((sum, d) => sum + d.value, 0);
  const avgDeal = clientDeals.length > 0 ? totalRevenue / clientDeals.length : 0;

  const activities = buildActivities(client, clientDeals);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "deals", label: "Сделки" },
    { key: "activity", label: "Активность" },
    { key: "notes", label: "Заметки" },
  ];

  const status = statusConfig[client.status as ClientStatus];

  // ── Edit Client ────────────────────────────────────────
  const openEditModal = () => {
    setEditData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone || "",
      status: client.status,
    });
    setEditError("");
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    const errors: Record<string, string> = {};
    if (!editData.name.trim()) errors.name = "Обязательное поле";
    if (!editData.company.trim()) errors.company = "Обязательное поле";
    if (!editData.email.trim()) errors.email = "Обязательное поле";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) errors.email = "Некорректный email";

    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }

    setSaving(true);
    setEditError("");
    setEditFieldErrors({});

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (!json.success) {
        setEditError(json.error || "Ошибка сохранения");
        return;
      }
      setShowEditModal(false);
      router.refresh();
    } catch {
      setEditError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Client ──────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/clients");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  // ── Create Deal ────────────────────────────────────────
  const handleCreateDeal = async () => {
    const errors: Record<string, string> = {};
    if (!dealData.title.trim()) errors.title = "Обязательное поле";
    if (!dealData.value.trim()) errors.value = "Обязательное поле";
    else if (isNaN(Number(dealData.value)) || Number(dealData.value) < 0) errors.value = "Введите число";

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
          title: dealData.title,
          value: Number(dealData.value),
          stage: dealData.stage,
          clientId: client.id,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setDealError(json.error || "Ошибка создания");
        return;
      }
      setShowDealModal(false);
      setDealData({ title: "", value: "", stage: "lead" });
      router.refresh();
    } catch {
      setDealError("Ошибка сети");
    } finally {
      setCreatingDeal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/clients" className="text-accent transition-colors duration-150 hover:text-accent-hover">Клиенты</Link>
        <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-text-secondary">{client.name}</span>
      </nav>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold ${getAvatarColor(client.name)}`}>
            {getInitials(client.name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-text-primary">{client.name}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status?.style || ""}`}>{status?.label || client.status}</span>
            </div>
            <p className="mt-1 text-text-secondary">{client.company}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <button onClick={() => handleCopy(client.email, "email")} className="group flex items-center gap-1.5 transition-colors duration-150 hover:text-text-secondary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {copied === "email" ? "Скопировано!" : client.email}
                <svg className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </button>
              {client.phone && (
                <button onClick={() => handleCopy(client.phone!, "phone")} className="group flex items-center gap-1.5 transition-colors duration-150 hover:text-text-secondary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {copied === "phone" ? "Скопировано!" : client.phone}
                  <svg className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openEditModal}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
          >
            Редактировать
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger-muted"
          >
            Удалить
          </button>
          <button
            onClick={() => { setDealData({ title: "", value: "", stage: "lead" }); setDealError(""); setDealFieldErrors({}); setShowDealModal(true); }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
          >
            Новая сделка
          </button>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Всего сделок" value={String(clientDeals.length)} />
        <StatCard label="Общая выручка" value={formatCurrency(totalRevenue)} />
        <StatCard label="Средний чек" value={formatCurrency(avgDeal)} />
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="overflow-x-auto border-b border-border">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`relative whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors duration-150 ${activeTab === tab.key ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              {tab.label}
              {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "deals" && <DealsTab deals={clientDeals} onRefresh={() => router.refresh()} />}
      {activeTab === "activity" && <ActivityTab activities={activities} />}
      {activeTab === "notes" && <NotesTab notes={notes} clientId={client.id} onRefresh={() => router.refresh()} />}

      {/* ── Edit Client Modal ────────────────────────────── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Редактировать клиента">
        <div className="space-y-4">
          {editError && (
            <div className="rounded-lg bg-danger-muted px-4 py-2.5 text-sm text-danger">{editError}</div>
          )}
          <FormInput label="Имя *" value={editData.name} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} error={editFieldErrors.name} />
          <FormInput label="Компания *" value={editData.company} onChange={(e) => setEditData((p) => ({ ...p, company: e.target.value }))} error={editFieldErrors.company} />
          <FormInput label="Email *" type="email" value={editData.email} onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))} error={editFieldErrors.email} />
          <FormInput label="Телефон" type="tel" value={editData.phone} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} />
          <FormSelect
            label="Статус"
            value={editData.status}
            onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}
            options={[
              { value: "lead", label: "Лид" },
              { value: "active", label: "Активный" },
              { value: "inactive", label: "Неактивный" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowEditModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated">Отмена</button>
            <button onClick={handleEdit} disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── New Deal Modal ───────────────────────────────── */}
      <Modal open={showDealModal} onClose={() => setShowDealModal(false)} title="Новая сделка">
        <div className="space-y-4">
          {dealError && (
            <div className="rounded-lg bg-danger-muted px-4 py-2.5 text-sm text-danger">{dealError}</div>
          )}
          <FormInput label="Название *" placeholder="Внедрение CRM" value={dealData.title} onChange={(e) => setDealData((p) => ({ ...p, title: e.target.value }))} error={dealFieldErrors.title} />
          <FormInput label="Сумма (₽) *" type="number" placeholder="500000" value={dealData.value} onChange={(e) => setDealData((p) => ({ ...p, value: e.target.value }))} error={dealFieldErrors.value} />
          <FormSelect
            label="Этап"
            value={dealData.stage}
            onChange={(e) => setDealData((p) => ({ ...p, stage: e.target.value }))}
            options={[
              { value: "lead", label: "Лид" },
              { value: "negotiation", label: "Переговоры" },
              { value: "proposal", label: "Предложение" },
              { value: "closed-won", label: "Закрыта (выиграно)" },
              { value: "closed-lost", label: "Закрыта (проиграно)" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDealModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated">Отмена</button>
            <button onClick={handleCreateDeal} disabled={creatingDeal} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50">
              {creatingDeal ? "Создание..." : "Создать"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────── */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Удалить клиента?">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Клиент <span className="font-medium text-text-primary">{client.name}</span> и все его сделки и заметки будут удалены безвозвратно.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-elevated">Отмена</button>
            <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-danger/80 disabled:opacity-50">
              {deleting ? "Удаление..." : "Удалить"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-glow rounded-xl border border-border bg-bg-card p-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}

// ── Deals Tab ────────────────────────────────────────────

function DealsTab({ deals: clientDeals, onRefresh }: { deals: DealData[]; onRefresh: () => void }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStageChange = async (dealId: string, newStage: string) => {
    setUpdatingId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const json = await res.json();
      if (json.success) onRefresh();
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    setDeletingId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setConfirmDeleteId(null);
        onRefresh();
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (clientDeals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg-card py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated">
          <svg className="h-7 w-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-text-primary">Нет сделок</p>
        <p className="mt-1 text-sm text-text-muted">У этого клиента пока нет сделок</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clientDeals.map((deal) => (
        <div key={deal.id} className="card-glow flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{deal.title}</p>
            <p className="mt-1 text-xs text-text-muted">
              Создана {formatShortDate(deal.createdAt)}
              {deal.closedAt && ` · Закрыта ${formatShortDate(deal.closedAt)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-text-primary">{formatCurrency(deal.value)}</span>
            <select
              value={deal.stage}
              disabled={updatingId === deal.id}
              onChange={(e) => handleStageChange(deal.id, e.target.value)}
              className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none ${stageStyles[deal.stage as DealStage] || ""} ${updatingId === deal.id ? "opacity-50" : "cursor-pointer"}`}
            >
              <option value="lead">Лид</option>
              <option value="negotiation">Переговоры</option>
              <option value="proposal">Предложение</option>
              <option value="closed-won">Закрыта</option>
              <option value="closed-lost">Проиграна</option>
            </select>
            {confirmDeleteId === deal.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeleteDeal(deal.id)}
                  disabled={deletingId === deal.id}
                  className="rounded-md bg-danger px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-danger/80 disabled:opacity-50"
                >
                  {deletingId === deal.id ? "..." : "Да"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-muted transition-colors hover:bg-bg-elevated"
                >
                  Нет
                </button>
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
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity Tab ─────────────────────────────────────────

function ActivityTab({ activities }: { activities: ActivityEvent[] }) {
  return (
    <div className="relative ml-4 border-l border-border pl-8">
      {activities.map((event, idx) => (
        <div key={event.id} className={`relative ${idx < activities.length - 1 ? "pb-8" : ""}`}>
          <div className={`absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full ${event.color}`} />
          <div>
            <p className="text-sm font-medium text-text-primary">{event.title}</p>
            {event.description && <p className="mt-0.5 text-sm text-text-secondary">{event.description}</p>}
            <p className="mt-1 text-xs text-text-muted">{formatDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Notes Tab ────────────────────────────────────────────

function NotesTab({ notes, clientId, onRefresh }: { notes: NoteData[]; clientId: string; onRefresh: () => void }) {
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText, clientId }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Ошибка добавления");
        return;
      }
      setNoteText("");
      onRefresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Добавить заметку..." rows={3} className="w-full resize-none rounded-lg border border-border bg-bg-base p-3 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none" />
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim() || submitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent"
          >
            {submitting ? "Добавление..." : "Добавить"}
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="card-glow rounded-xl border border-border bg-bg-card p-5">
            <p className="text-sm text-text-primary whitespace-pre-line">{note.text}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
              <span>{note.author}</span>
              <span>·</span>
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 404 State ────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
        <svg className="h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <p className="mt-4 text-lg font-semibold text-text-primary">Клиент не найден</p>
      <p className="mt-1 text-sm text-text-muted">Клиент с таким идентификатором не существует</p>
      <Link href="/clients" className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover">Вернуться к списку</Link>
    </div>
  );
}

// ── Activity Builder ─────────────────────────────────────

function buildActivities(client: ClientData, clientDeals: DealData[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  const earliestDate = clientDeals.length > 0
    ? new Date(Math.min(...clientDeals.map((d) => new Date(d.createdAt).getTime())))
    : new Date(client.createdAt);
  const contactCreated = new Date(earliestDate);
  contactCreated.setMonth(contactCreated.getMonth() - 1);
  events.push({ id: `act-contact-${client.id}`, title: "Создан контакт", description: `${client.name} из ${client.company}`, date: contactCreated.toISOString(), color: "bg-accent" });

  clientDeals.forEach((deal) => {
    events.push({ id: `act-deal-new-${deal.id}`, title: `Новая сделка: ${deal.title}`, description: formatCurrency(deal.value), date: deal.createdAt, color: "bg-accent-secondary" });
    if (deal.closedAt) {
      const won = deal.stage === "closed-won";
      events.push({ id: `act-deal-close-${deal.id}`, title: `Сделка ${won ? "закрыта" : "проиграна"}: ${deal.title}`, description: formatCurrency(deal.value), date: deal.closedAt, color: won ? "bg-success" : "bg-danger" });
    }
  });

  if (clientDeals.length > 0) {
    const base = new Date(client.updatedAt);
    const callDate1 = new Date(base); callDate1.setDate(base.getDate() - 3);
    events.push({ id: `act-call-1-${client.id}`, title: "Звонок клиенту", description: "Обсуждение текущих задач и сроков", date: callDate1.toISOString(), color: "bg-accent" });
    events.push({ id: `act-call-2-${client.id}`, title: "Звонок клиенту", description: "Уточнение деталей по проекту", date: base.toISOString(), color: "bg-accent" });
  }

  const emailDate = new Date(client.updatedAt); emailDate.setDate(emailDate.getDate() - 1);
  events.push({ id: `act-email-${client.id}`, title: "Отправлено письмо", description: "Коммерческое предложение", date: emailDate.toISOString(), color: "bg-[#8B5CF6]" });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events.slice(0, 10);
}
