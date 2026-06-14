import { prisma } from "@/lib/prisma";

interface NotificationInput {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) return { count: 0 };
  return prisma.notification.createMany({ data: inputs });
}

export async function notifyGroupMembers(
  groupId: string,
  input: Omit<NotificationInput, "userId"> & { excludeUserIds?: string[] }
) {
  const excluded = new Set(input.excludeUserIds ?? []);
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  return createNotifications(
    members
      .filter((member) => !excluded.has(member.userId))
      .map((member) => ({
        userId: member.userId,
        title: input.title,
        message: input.message,
        type: input.type,
      }))
  );
}
