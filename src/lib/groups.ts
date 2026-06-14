import { prisma } from "@/lib/prisma";

export async function isGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId },
    },
  });
  return !!membership;
}

export async function getGroupBalances(groupId: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true } } },
  });

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      splits: { select: { userId: true, amount: true } },
    },
  });

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    select: { fromUserId: true, toUserId: true, amount: true },
  });

  const { calculateBalances } = await import("@/services/balance");

  return calculateBalances(
    expenses.map((e) => ({
      amount: e.amount,
      paidById: e.paidById,
      splits: e.splits,
    })),
    settlements,
    members.map((m) => ({
      userId: m.user.id,
      userName: m.user.name,
    }))
  );
}
