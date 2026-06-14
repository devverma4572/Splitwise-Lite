import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
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
  const report = await prisma.importReport.findUnique({ where: { id } });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({
    report: {
      id: report.id,
      createdAt: report.createdAt.toISOString(),
      totalRows: report.totalRows,
      importedRows: report.importedRows,
      anomalyCount: report.anomalyCount,
      reportJson: report.reportJson,
    },
  });
}
