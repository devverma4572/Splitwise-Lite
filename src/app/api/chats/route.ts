import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: session.userId },
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const unreadCounts = await prisma.chatMessage.groupBy({
    by: ["conversationId"],
    where: {
      isRead: false,
      senderId: { not: session.userId },
      conversation: {
        participants: {
          some: { userId: session.userId },
        },
      },
    },
    _count: { id: true },
  });

  const unreadByConversation = new Map(
    unreadCounts.map((count) => [count.conversationId, count._count.id])
  );

  return NextResponse.json({
    conversations: conversations.map((conversation) => {
      const participant =
        conversation.participants.find((p) => p.userId !== session.userId)
          ?.user ?? conversation.participants[0].user;
      const lastMessage = conversation.messages[0] ?? null;

      return {
        id: conversation.id,
        participant,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
        unreadCount: unreadByConversation.get(conversation.id) ?? 0,
      };
    }),
  });
}
