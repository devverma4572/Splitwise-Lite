import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { createNotification, createNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

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
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 409 }
      );
    }

    const member = await prisma.groupMember.create({
      data: { groupId: id, userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const existingMembers = await prisma.groupMember.findMany({
      where: { groupId: id, userId: { not: user.id } },
      select: { userId: true },
    });

    await Promise.all([
      createNotification({
        userId: user.id,
        title: "Added to group",
        message: `You were added to ${group.name}`,
        type: "GROUP_MEMBER_ADDED",
      }),
      createNotifications(
        existingMembers
          .filter((existingMember) => existingMember.userId !== session.userId)
          .map((existingMember) => ({
            userId: existingMember.userId,
            title: "New group member",
            message: `${user.name} was added to ${group.name}`,
            type: "GROUP_MEMBER_ADDED",
          }))
      ),
    ]);

    return NextResponse.json(
      {
        member: {
          id: member.id,
          userId: member.user.id,
          name: member.user.name,
          email: member.user.email,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to add member" },
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

  if (!(await isGroupMember(id, session.userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User is required" }, { status: 400 });
    }

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
      include: {
        user: { select: { name: true } },
        group: { select: { name: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId: id, userId } },
    });

    const remainingMembers = await prisma.groupMember.findMany({
      where: { groupId: id },
      select: { userId: true },
    });

    await Promise.all([
      createNotification({
        userId,
        title: "Removed from group",
        message: `You were removed from ${member.group.name}`,
        type: "GROUP_MEMBER_REMOVED",
      }),
      createNotifications(
        remainingMembers
          .filter((remainingMember) => remainingMember.userId !== session.userId)
          .map((remainingMember) => ({
            userId: remainingMember.userId,
            title: "Group member removed",
            message: `${member.user.name} was removed from ${member.group.name}`,
            type: "GROUP_MEMBER_REMOVED",
          }))
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
