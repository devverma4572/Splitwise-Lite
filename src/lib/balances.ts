import { prisma } from "@/lib/prisma";
import { roundAmount } from "@/lib/utils";
import { calculateBalances } from "@/services/balance";

export interface UserBalanceSummary {
  owes: number;
  owed: number;
  net: number;
}

export async function getUserBalanceSummaryForGroup(
  groupId: string,
  userId: string
): Promise<UserBalanceSummary> {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true } } },
  });

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: { select: { userId: true, amount: true } } },
  });

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    select: { fromUserId: true, toUserId: true, amount: true },
  });

  const balances = calculateBalances(
    expenses.map((expense) => ({
      amount: expense.amount,
      paidById: expense.paidById,
      splits: expense.splits,
    })),
    settlements,
    members.map((member) => ({
      userId: member.user.id,
      userName: member.user.name,
    }))
  );

  const net = balances.find((balance) => balance.userId === userId)?.balance ?? 0;

  return {
    owes: roundAmount(Math.max(0, -net)),
    owed: roundAmount(Math.max(0, net)),
    net: roundAmount(net),
  };
}

export async function getUserOverallBalanceSummary(
  userId: string
): Promise<UserBalanceSummary> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  const summaries = await Promise.all(
    memberships.map((membership) =>
      getUserBalanceSummaryForGroup(membership.groupId, userId)
    )
  );

  return summaries.reduce<UserBalanceSummary>(
    (total, summary) => ({
      owes: roundAmount(total.owes + summary.owes),
      owed: roundAmount(total.owed + summary.owed),
      net: roundAmount(total.net + summary.net),
    }),
    { owes: 0, owed: 0, net: 0 }
  );
}
