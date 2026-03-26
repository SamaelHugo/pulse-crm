import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/clients — list with search, filter, sort, pagination
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const sort = url.searchParams.get("sort") || "name";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get("perPage")) || 50));

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const orderBy: Record<string, string> =
      sort === "revenue" ? {} : sort === "lastContact" ? { updatedAt: "desc" } : { name: "asc" };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: { deals: { select: { value: true, createdAt: true } } },
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { name: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.client.count({ where }),
    ]);

    const data = clients.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      totalDeals: c.deals.length,
      revenue: c.deals.reduce((s, d) => s + d.value, 0),
      lastContact:
        c.deals.length > 0
          ? new Date(Math.max(...c.deals.map((d) => d.createdAt.getTime()))).toISOString()
          : c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data, total, page, perPage });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json({ success: false, error: "Ошибка загрузки клиентов" }, { status: 500 });
  }
}

// POST /api/clients — create new client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, status } = body;

    if (!name || !company || !email) {
      return NextResponse.json(
        { success: false, error: "Поля name, company и email обязательны" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || typeof company !== "string" || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Некорректные типы данных" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Некорректный email" },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Клиент с таким email уже существует" },
        { status: 400 }
      );
    }

    const validStatuses = ["active", "lead", "inactive"];
    const clientStatus = status && validStatuses.includes(status) ? status : "lead";

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        status: clientStatus,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...client,
          createdAt: client.createdAt.toISOString(),
          updatedAt: client.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json({ success: false, error: "Ошибка создания клиента" }, { status: 500 });
  }
}
