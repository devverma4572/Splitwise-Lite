import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
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

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId: session.userId },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderId: session.userId,
        content: content.trim(),
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.sender.name,
          content: message.content,
          isRead: message.isRead,
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
