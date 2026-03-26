import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/deals/[id] — update deal
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Сделка не найдена" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ success: false, error: "Название не может быть пустым" }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.value !== undefined) {
      const numValue = Number(body.value);
      if (isNaN(numValue) || numValue < 0) {
        return NextResponse.json({ success: false, error: "Сумма должна быть положительным числом" }, { status: 400 });
      }
      updateData.value = Math.round(numValue);
    }

    if (body.stage !== undefined) {
      const validStages = ["lead", "negotiation", "proposal", "closed-won", "closed-lost"];
      if (!validStages.includes(body.stage)) {
        return NextResponse.json({ success: false, error: "Некорректный этап" }, { status: 400 });
      }
      updateData.stage = body.stage;

      // Auto-set closedAt when moving to closed stage
      const isClosed = body.stage === "closed-won" || body.stage === "closed-lost";
      const wasClosed = existing.stage === "closed-won" || existing.stage === "closed-lost";
      if (isClosed && !wasClosed) {
        updateData.closedAt = new Date();
      } else if (!isClosed && wasClosed) {
        updateData.closedAt = null;
      }
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, name: true, company: true, email: true } } },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("PUT /api/deals/[id] error:", error);
    return NextResponse.json({ success: false, error: "Ошибка обновления сделки" }, { status: 500 });
  }
}

// DELETE /api/deals/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Сделка не найдена" }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/deals/[id] error:", error);
    return NextResponse.json({ success: false, error: "Ошибка удаления сделки" }, { status: 500 });
  }
}
