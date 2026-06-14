import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    select: { groupId: true },
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (!(await isGroupMember(expense.groupId, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        expenseId: id,
        userId: session.userId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          userId: message.userId,
          userName: message.user.name,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
