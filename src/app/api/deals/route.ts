import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/deals — list with optional stage filter
export async function GET(req: NextRequest) {
  try {
    const stage = req.nextUrl.searchParams.get("stage") || "";

    const where: Record<string, unknown> = {};
    const validStages = ["lead", "negotiation", "proposal", "closed-won", "closed-lost"];
    if (stage && validStages.includes(stage)) {
      where.stage = stage;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: { client: { select: { id: true, name: true, company: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const data = deals.map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value,
      stage: d.stage,
      clientId: d.clientId,
      createdAt: d.createdAt.toISOString(),
      closedAt: d.closedAt?.toISOString() ?? null,
      client: d.client
        ? { id: d.client.id, name: d.client.name, company: d.client.company, email: d.client.email }
        : undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/deals error:", error);
    return NextResponse.json({ success: false, error: "Ошибка загрузки сделок" }, { status: 500 });
  }
}

// POST /api/deals — create new deal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, value, stage, clientId } = body;

    if (!title || value === undefined || !clientId) {
      return NextResponse.json(
        { success: false, error: "Поля title, value и clientId обязательны" },
        { status: 400 }
      );
    }

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Название не может быть пустым" }, { status: 400 });
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return NextResponse.json({ success: false, error: "Сумма должна быть положительным числом" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ success: false, error: "Клиент не найден" }, { status: 404 });
    }

    const validStages = ["lead", "negotiation", "proposal", "closed-won", "closed-lost"];
    const dealStage = stage && validStages.includes(stage) ? stage : "lead";

    const deal = await prisma.deal.create({
      data: {
        title: title.trim(),
        value: Math.round(numValue),
        stage: dealStage,
        clientId,
        closedAt: dealStage === "closed-won" || dealStage === "closed-lost" ? new Date() : null,
      },
      include: { client: { select: { id: true, name: true, company: true, email: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: deal.id,
          title: deal.title,
          value: deal.value,
          stage: deal.stage,
          clientId: deal.clientId,
          createdAt: deal.createdAt.toISOString(),
          closedAt: deal.closedAt?.toISOString() ?? null,
          client: deal.client
            ? { id: deal.client.id, name: deal.client.name, company: deal.client.company, email: deal.client.email }
            : undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/deals error:", error);
    return NextResponse.json({ success: false, error: "Ошибка создания сделки" }, { status: 500 });
  }
}
