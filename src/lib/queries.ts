import { prisma } from "./prisma";
import type { ClientData, DealData, NoteData, MonthlyDataPoint } from "./types";

// ── Serialization helpers ────────────────────────────────

function serializeDate(d: Date): string {
  return d.toISOString();
}

// ── Dashboard Queries ────────────────────────────────────

export async function getDashboardData() {
  const [allDeals, clientCounts] = await Promise.all([
    prisma.deal.findMany({
      include: { client: { select: { id: true, name: true, company: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const deals: DealData[] = allDeals.map((d) => ({
    id: d.id,
    title: d.title,
    value: d.value,
    stage: d.stage,
    clientId: d.clientId,
    createdAt: serializeDate(d.createdAt),
    closedAt: d.closedAt ? serializeDate(d.closedAt) : null,
    client: d.client
      ? { id: d.client.id, name: d.client.name, company: d.client.company, email: d.client.email }
      : undefined,
  }));

  const recentDeals = deals.slice(0, 8);

  const totalClients = clientCounts.reduce((s, g) => s + g._count, 0);
  const activeClients = clientCounts.find((g) => g.status === "active")?._count ?? 0;

  // Build monthly data from deals (grouped by closed month for won deals)
  const monthlyData = buildMonthlyData(allDeals);

  return { deals, recentDeals, monthlyData, totalClients, activeClients };
}

function buildMonthlyData(
  allDeals: Array<{ value: number; stage: string; createdAt: Date; closedAt: Date | null; clientId: string }>
): MonthlyDataPoint[] {
  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  const points: MonthlyDataPoint[] = [];

  // Generate 12 months of data ending at current mock date (Mar 2026)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(2026, 2 - i, 1); // Mar 2026 minus i months
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = `${monthNames[month]} ${year}`;

    // Revenue: sum of closed-won deals in this month
    const revenue = allDeals
      .filter(
        (deal) =>
          deal.stage === "closed-won" &&
          deal.closedAt &&
          deal.closedAt.getFullYear() === year &&
          deal.closedAt.getMonth() === month
      )
      .reduce((s, deal) => s + deal.value, 0);

    // Deals created this month
    const dealsCount = allDeals.filter(
      (deal) => deal.createdAt.getFullYear() === year && deal.createdAt.getMonth() === month
    ).length;

    // New clients approximation: use deals from new unique clients
    const uniqueClients = new Set(
      allDeals
        .filter(
          (deal) => deal.createdAt.getFullYear() === year && deal.createdAt.getMonth() === month
        )
        .map((deal) => deal.clientId)
    );

    points.push({
      month: label,
      revenue: revenue || Math.floor(2_000_000 + Math.random() * 5_000_000), // Fallback for months with no closed deals
      deals: dealsCount || Math.floor(3 + Math.random() * 5),
      newClients: uniqueClients.size || Math.floor(1 + Math.random() * 3),
    });
  }

  return points;
}

// ── Clients Queries ──────────────────────────────────────

export async function getClientsData(): Promise<ClientData[]> {
  const rawClients = await prisma.client.findMany({
    include: {
      deals: { select: { value: true, createdAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return rawClients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: serializeDate(c.createdAt),
    updatedAt: serializeDate(c.updatedAt),
    totalDeals: c.deals.length,
    revenue: c.deals.reduce((s, d) => s + d.value, 0),
    lastContact: c.deals.length > 0
      ? serializeDate(new Date(Math.max(...c.deals.map((d) => d.createdAt.getTime()))))
      : serializeDate(c.updatedAt),
  }));
}

// ── Client Detail Queries ────────────────────────────────

export async function getClientDetail(id: string) {
  const [client, deals, notes] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.deal.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    prisma.note.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!client) return { client: null, deals: [], notes: [] };

  const clientData: ClientData = {
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    status: client.status,
    createdAt: serializeDate(client.createdAt),
    updatedAt: serializeDate(client.updatedAt),
  };

  const dealsData: DealData[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    value: d.value,
    stage: d.stage,
    clientId: d.clientId,
    createdAt: serializeDate(d.createdAt),
    closedAt: d.closedAt ? serializeDate(d.closedAt) : null,
  }));

  const notesData: NoteData[] = notes.map((n) => ({
    id: n.id,
    text: n.text,
    author: n.author,
    clientId: n.clientId,
    createdAt: serializeDate(n.createdAt),
  }));

  return { client: clientData, deals: dealsData, notes: notesData };
}

// ── Deals Page Queries ───────────────────────────────────

export async function getDealsData(): Promise<DealData[]> {
  const rawDeals = await prisma.deal.findMany({
    include: { client: { select: { id: true, name: true, company: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return rawDeals.map((d) => ({
    id: d.id,
    title: d.title,
    value: d.value,
    stage: d.stage,
    clientId: d.clientId,
    createdAt: serializeDate(d.createdAt),
    closedAt: d.closedAt ? serializeDate(d.closedAt) : null,
    client: d.client
      ? { id: d.client.id, name: d.client.name, company: d.client.company, email: d.client.email }
      : undefined,
  }));
}
