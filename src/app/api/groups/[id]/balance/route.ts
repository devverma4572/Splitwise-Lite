import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getGroupBalances, isGroupMember } from "@/lib/groups";

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

  const balances = await getGroupBalances(id);
  return NextResponse.json({ balances });
}
