import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const participant =
    conversation.participants.find((p) => p.userId !== session.userId)?.user ??
    conversation.participants[0].user;

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      participant,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.name,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      })),
    },
  });
}
