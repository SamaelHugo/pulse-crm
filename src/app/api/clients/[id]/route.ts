import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/clients/[id] — single client with deals and notes
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        deals: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: "Клиент не найден" }, { status: 404 });
    }

    const data = {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      status: client.status,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      deals: client.deals.map((d) => ({
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        clientId: d.clientId,
        createdAt: d.createdAt.toISOString(),
        closedAt: d.closedAt?.toISOString() ?? null,
      })),
      notes: client.notes.map((n) => ({
        id: n.id,
        text: n.text,
        author: n.author,
        clientId: n.clientId,
        createdAt: n.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json({ success: false, error: "Ошибка загрузки клиента" }, { status: 500 });
  }
}

// PUT /api/clients/[id] — update client
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Клиент не найден" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ success: false, error: "Имя не может быть пустым" }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.company !== undefined) {
      if (typeof body.company !== "string" || !body.company.trim()) {
        return NextResponse.json({ success: false, error: "Компания не может быть пустой" }, { status: 400 });
      }
      updateData.company = body.company.trim();
    }

    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof body.email !== "string" || !emailRegex.test(body.email)) {
        return NextResponse.json({ success: false, error: "Некорректный email" }, { status: 400 });
      }
      if (body.email.toLowerCase() !== existing.email) {
        const duplicate = await prisma.client.findUnique({ where: { email: body.email.toLowerCase() } });
        if (duplicate) {
          return NextResponse.json({ success: false, error: "Клиент с таким email уже существует" }, { status: 400 });
        }
      }
      updateData.email = body.email.trim().toLowerCase();
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null;
    }

    if (body.status !== undefined) {
      const validStatuses = ["active", "lead", "inactive"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Некорректный статус" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    const client = await prisma.client.update({ where: { id }, data: updateData });

    return NextResponse.json({
      success: true,
      data: {
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PUT /api/clients/[id] error:", error);
    return NextResponse.json({ success: false, error: "Ошибка обновления клиента" }, { status: 500 });
  }
}

// DELETE /api/clients/[id] — delete with cascading deals and notes
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Клиент не найден" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.note.deleteMany({ where: { clientId: id } }),
      prisma.deal.deleteMany({ where: { clientId: id } }),
      prisma.client.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json({ success: false, error: "Ошибка удаления клиента" }, { status: 500 });
  }
}
