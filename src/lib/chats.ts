import { prisma } from "@/lib/prisma";

export async function getUnreadChatCount(userId: string): Promise<number> {
  return prisma.chatMessage.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      conversation: {
        participants: {
          some: { userId },
        },
      },
    },
  });
}

export async function getExistingConversation(userAId: string, userBId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        every: {
          userId: { in: [userAId, userBId] },
        },
        some: { userId: userAId },
      },
    },
    include: {
      participants: { select: { userId: true } },
    },
  });

  return (
    conversations.find(
      (conversation) =>
        conversation.participants.length === 2 &&
        conversation.participants.some((p) => p.userId === userBId)
    ) ?? null
  );
}
