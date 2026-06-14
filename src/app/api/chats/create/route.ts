import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getExistingConversation } from "@/lib/chats";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    if (user.id === session.userId) {
      return NextResponse.json(
        { error: "You cannot start a chat with yourself" },
        { status: 400 }
      );
    }

    const existingConversation = await getExistingConversation(
      session.userId,
      user.id
    );

    if (existingConversation) {
      return NextResponse.json({
        conversation: {
          id: existingConversation.id,
          participant: user,
        },
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.userId }, { userId: user.id }],
        },
      },
    });

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          participant: user,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
