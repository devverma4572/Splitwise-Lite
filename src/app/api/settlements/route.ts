import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { notifyGroupMembers } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fromUserId, toUserId, amount, groupId } = await request.json();

    if (!fromUserId || !toUserId || !amount || !groupId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: "Cannot settle with yourself" },
        { status: 400 }
      );
    }

    if (!(await isGroupMember(groupId, session.userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [fromMember, toMember] = await Promise.all([
      prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: fromUserId } },
      }),
      prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: toUserId } },
      }),
    ]);

    if (!fromMember || !toMember) {
      return NextResponse.json(
        { error: "Both users must be group members" },
        { status: 400 }
      );
    }

    const settlement = await prisma.settlement.create({
      data: { fromUserId, toUserId, amount, groupId },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
        group: { select: { name: true } },
      },
    });

    await notifyGroupMembers(groupId, {
      title: "Settlement recorded",
      message: `${settlement.fromUser.name} paid ${settlement.toUser.name} in ${settlement.group.name}`,
      type: "SETTLEMENT_RECORDED",
      excludeUserIds: [session.userId],
    });

    return NextResponse.json(
      {
        settlement: {
          id: settlement.id,
          fromUserId: settlement.fromUserId,
          fromUserName: settlement.fromUser.name,
          toUserId: settlement.toUserId,
          toUserName: settlement.toUser.name,
          amount: settlement.amount,
          groupId: settlement.groupId,
          createdAt: settlement.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create settlement" },
      { status: 500 }
    );
  }
}
