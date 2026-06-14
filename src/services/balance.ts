import { roundAmount } from "@/lib/utils";

export interface BalanceEntry {
  userId: string;
  userName: string;
  balance: number;
}

export interface ExpenseForBalance {
  amount: number;
  paidById: string;
  splits: { userId: string; amount: number }[];
}

export interface SettlementForBalance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface MemberForBalance {
  userId: string;
  userName: string;
}

export function calculateBalances(
  expenses: ExpenseForBalance[],
  settlements: SettlementForBalance[],
  members: MemberForBalance[]
): BalanceEntry[] {
  const balances = new Map<string, number>();

  for (const member of members) {
    balances.set(member.userId, 0);
  }

  for (const expense of expenses) {
    balances.set(
      expense.paidById,
      (balances.get(expense.paidById) ?? 0) + expense.amount
    );

    for (const split of expense.splits) {
      balances.set(
        split.userId,
        (balances.get(split.userId) ?? 0) - split.amount
      );
    }
  }

  for (const settlement of settlements) {
    balances.set(
      settlement.fromUserId,
      (balances.get(settlement.fromUserId) ?? 0) + settlement.amount
    );
    balances.set(
      settlement.toUserId,
      (balances.get(settlement.toUserId) ?? 0) - settlement.amount
    );
  }

  return members.map((member) => ({
    userId: member.userId,
    userName: member.userName,
    balance: roundAmount(balances.get(member.userId) ?? 0),
  }));
}

export function getSimplifiedDebts(
  balances: BalanceEntry[]
): { fromUserId: string; fromUserName: string; toUserId: string; toUserName: string; amount: number }[] {
  const debtors: { userId: string; userName: string; amount: number }[] = [];
  const creditors: { userId: string; userName: string; amount: number }[] = [];

  for (const entry of balances) {
    if (entry.balance < -0.01) {
      debtors.push({
        userId: entry.userId,
        userName: entry.userName,
        amount: Math.abs(entry.balance),
      });
    } else if (entry.balance > 0.01) {
      creditors.push({
        userId: entry.userId,
        userName: entry.userName,
        amount: entry.balance,
      });
    }
  }

  const debts: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
  }[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = roundAmount(Math.min(debtors[i].amount, creditors[j].amount));

    if (amount > 0) {
      debts.push({
        fromUserId: debtors[i].userId,
        fromUserName: debtors[i].userName,
        toUserId: creditors[j].userId,
        toUserName: creditors[j].userName,
        amount,
      });
    }

    debtors[i].amount = roundAmount(debtors[i].amount - amount);
    creditors[j].amount = roundAmount(creditors[j].amount - amount);

    if (debtors[i].amount <= 0.01) i++;
    if (creditors[j].amount <= 0.01) j++;
  }

  return debts;
}
