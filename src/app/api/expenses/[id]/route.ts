import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { notifyGroupMembers } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { computeSplitAmounts, validateSplits } from "@/lib/splits";
import { SplitType } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      paidBy: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
      splits: {
        include: { user: { select: { id: true, name: true } } },
      },
      messages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (!(await isGroupMember(expense.groupId, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    expense: {
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      paidById: expense.paidById,
      paidByName: expense.paidBy.name,
      splitType: expense.splitType,
      groupId: expense.groupId,
      groupName: expense.group.name,
      createdAt: expense.createdAt.toISOString(),
      splits: expense.splits.map((s) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        amount: s.amount,
      })),
      messages: expense.messages.map((m) => ({
        id: m.id,
        userId: m.userId,
        userName: m.user.name,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existingExpense = await prisma.expense.findUnique({
    where: { id },
    include: {
      splits: { select: { userId: true, amount: true } },
      group: { select: { id: true, name: true } },
    },
  });

  if (!existingExpense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (!(await isGroupMember(existingExpense.groupId, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const title = body.title ?? existingExpense.title;
    const amount = body.amount ?? existingExpense.amount;
    const paidById = body.paidById ?? existingExpense.paidById;
    const splitType = body.splitType ?? existingExpense.splitType;
    const splits =
      body.splits ??
      existingExpense.splits.map((split) => ({
        userId: split.userId,
        value: split.amount,
      }));

    if (!title?.trim() || !amount || !paidById || !splitType || !splits) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const payerMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: existingExpense.groupId,
          userId: paidById,
        },
      },
    });

    if (!payerMember) {
      return NextResponse.json(
        { error: "Payer must be a group member" },
        { status: 400 }
      );
    }

    const validationError = validateSplits(amount, splitType as SplitType, splits);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const splitAmounts = computeSplitAmounts(
      amount,
      splitType as SplitType,
      splits
    );

    const expense = await prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({ where: { expenseId: id } });

      return tx.expense.update({
        where: { id },
        data: {
          title: title.trim(),
          amount,
          paidById,
          splitType,
          splits: {
            create: splitAmounts.map((split) => ({
              userId: split.userId,
              amount: split.amount,
            })),
          },
        },
        include: {
          paidBy: { select: { id: true, name: true } },
          splits: { include: { user: { select: { id: true, name: true } } } },
        },
      });
    });

    await notifyGroupMembers(existingExpense.groupId, {
      title: "Expense updated",
      message: `${expense.title} was updated in ${existingExpense.group.name}`,
      type: "EXPENSE_UPDATED",
      excludeUserIds: [session.userId],
    });

    return NextResponse.json({
      expense: {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        paidById: expense.paidById,
        paidByName: expense.paidBy.name,
        splitType: expense.splitType,
        createdAt: expense.createdAt.toISOString(),
        splits: expense.splits.map((split) => ({
          id: split.id,
          userId: split.userId,
          userName: split.user.name,
          amount: split.amount,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { group: { select: { id: true, name: true } } },
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (!(await isGroupMember(expense.groupId, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.expense.delete({ where: { id } });

    await notifyGroupMembers(expense.groupId, {
      title: "Expense deleted",
      message: `${expense.title} was deleted from ${expense.group.name}`,
      type: "EXPENSE_DELETED",
      excludeUserIds: [session.userId],
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
