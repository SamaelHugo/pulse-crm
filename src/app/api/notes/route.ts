import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/notes — create note for client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, clientId, author } = body;

    if (!text || !clientId) {
      return NextResponse.json(
        { success: false, error: "Поля text и clientId обязательны" },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ success: false, error: "Текст заметки не может быть пустым" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ success: false, error: "Клиент не найден" }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        text: text.trim(),
        author: author?.trim() || "Алихан Веров",
        clientId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: note.id,
          text: note.text,
          author: note.author,
          clientId: note.clientId,
          createdAt: note.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ success: false, error: "Ошибка создания заметки" }, { status: 500 });
  }
}
