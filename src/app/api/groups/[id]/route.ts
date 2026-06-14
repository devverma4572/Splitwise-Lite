import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getGroupBalances, isGroupMember } from "@/lib/groups";
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

  if (!(await isGroupMember(id, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      expenses: {
        include: {
          paidBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const balances = await getGroupBalances(id);

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
      })),
      expenses: group.expenses.map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        paidById: e.paidById,
        paidByName: e.paidBy.name,
        splitType: e.splitType,
        createdAt: e.createdAt.toISOString(),
      })),
      balances,
    },
  });
}
