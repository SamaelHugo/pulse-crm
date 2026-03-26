"use client";

import Link from "next/link";
import { deals, clients, type DealStage } from "@/data/mockData";

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

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(".", ",") + "М ₽";
  }
  return value.toLocaleString("ru-RU") + " ₽";
}

function formatRelativeDate(date: Date): string {
  const now = new Date("2026-03-27");
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) {
    const forms = ["день", "дня", "дней"];
    const n = diffDays % 100;
    const n1 = n % 10;
    const form =
      n > 10 && n < 20 ? forms[2] : n1 > 1 && n1 < 5 ? forms[1] : n1 === 1 ? forms[0] : forms[2];
    return `${diffDays} ${form} назад`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const forms = ["неделю", "недели", "недель"];
    const form = weeks === 1 ? forms[0] : weeks < 5 ? forms[1] : forms[2];
    return `${weeks} ${form} назад`;
  }
  const months = Math.floor(diffDays / 30);
  const forms = ["месяц", "месяца", "месяцев"];
  const form = months === 1 ? forms[0] : months < 5 ? forms[1] : forms[2];
  return `${months} ${form} назад`;
}

export default function RecentDeals() {
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const recentDeals = [...deals]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <div className="card-glow rounded-xl border border-border bg-bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Последние сделки
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Сделка
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Этап
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Дата
              </th>
            </tr>
          </thead>
          <tbody>
            {recentDeals.map((deal) => {
              const client = clientMap.get(deal.clientId);
              return (
                <tr
                  key={deal.id}
                  className="border-b border-border/50 transition-colors duration-100 last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-medium text-text-secondary">
                        {client?.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {client?.name}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {client?.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {deal.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {formatCurrency(deal.value)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${stageStyles[deal.stage]}`}
                    >
                      {stageLabels[deal.stage]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-text-muted">
                      {formatRelativeDate(deal.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-6 py-3">
        <Link
          href="/deals"
          className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
        >
          Смотреть все →
        </Link>
      </div>
    </div>
  );
}
