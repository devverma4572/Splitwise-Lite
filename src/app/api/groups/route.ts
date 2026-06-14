import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.userId },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { group: { createdAt: "desc" } },
  });

  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    createdAt: m.group.createdAt.toISOString(),
    memberCount: m.group._count.members,
  }));

  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        createdById: session.userId,
        members: {
          create: { userId: session.userId },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    await createNotification({
      userId: session.userId,
      title: "Group created",
      message: `You created ${group.name}`,
      type: "GROUP_CREATED",
    });

    return NextResponse.json(
      {
        group: {
          id: group.id,
          name: group.name,
          createdAt: group.createdAt.toISOString(),
          memberCount: group._count.members,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
