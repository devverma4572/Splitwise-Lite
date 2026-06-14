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

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!(await isGroupMember(id, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, amount, paidById, splitType, splits } = body;

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
      where: { groupId_userId: { groupId: id, userId: paidById } },
    });

    if (!payerMember) {
      return NextResponse.json(
        { error: "Payer must be a group member" },
        { status: 400 }
      );
    }

    const validationError = validateSplits(
      amount,
      splitType as SplitType,
      splits
    );
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const splitAmounts = computeSplitAmounts(
      amount,
      splitType as SplitType,
      splits
    );

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount,
        paidById,
        groupId: id,
        splitType,
        splits: {
          create: splitAmounts.map((s) => ({
            userId: s.userId,
            amount: s.amount,
          })),
        },
      },
      include: {
        paidBy: { select: { id: true, name: true } },
        splits: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    await notifyGroupMembers(id, {
      title: "New expense",
      message: `${expense.paidBy.name} added ${expense.title} in this group`,
      type: "EXPENSE_CREATED",
      excludeUserIds: [session.userId],
    });

    return NextResponse.json(
      {
        expense: {
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          paidById: expense.paidById,
          paidByName: expense.paidBy.name,
          splitType: expense.splitType,
          createdAt: expense.createdAt.toISOString(),
          splits: expense.splits.map((s) => ({
            id: s.id,
            userId: s.userId,
            userName: s.user.name,
            amount: s.amount,
          })),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
