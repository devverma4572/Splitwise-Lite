import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  getPreviewRows,
  normalizeImportRows,
  parseCsv,
} from "@/lib/csv-import";
import { detectImportAnomalies, ImportAnomaly } from "@/lib/anomaly-detector";
import { prisma } from "@/lib/prisma";
import { computeSplitAmounts } from "@/lib/splits";

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function hasBlockingAnomaly(rowNumber: number, anomalies: ImportAnomaly[]) {
  return anomalies.some(
    (anomaly) =>
      anomaly.rowNumber === rowNumber &&
      (anomaly.severity === "error" || anomaly.anomalyType === "UNKNOWN_USER")
  );
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const mode = getStringValue(formData, "mode") || "preview";
    const groupId = getStringValue(formData, "groupId");
    const file = formData.get("file");

    if (!groupId) {
      return NextResponse.json({ error: "Group is required" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.userId } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const csv = parseCsv(await file.text());
    const rows = normalizeImportRows(csv.columns, csv.rows);
    const [members, existingExpenses] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.expense.findMany({
        where: { groupId },
        select: { title: true, amount: true, paidById: true, createdAt: true },
      }),
    ]);

    const users = members.map((member) => member.user);
    const anomalies = detectImportAnomalies(rows, users, existingExpenses);
    const importableRows = rows.filter(
      (row) => !hasBlockingAnomaly(row.rowNumber, anomalies)
    );

    if (mode !== "confirm") {
      return NextResponse.json({
        columns: csv.columns,
        previewRows: getPreviewRows(csv.rows),
        totalRows: rows.length,
        importableRows: importableRows.length,
        anomalyCount: anomalies.length,
        anomalies,
      });
    }

    const usersByIdentity = new Map(
      users.flatMap((user) => [
        [user.email.trim().toLowerCase(), user],
        [user.name.trim().toLowerCase(), user],
      ])
    );

    const report = await prisma.$transaction(async (tx) => {
      for (const row of importableRows) {
        const payer = usersByIdentity.get(row.payer.trim().toLowerCase());
        if (!payer) continue;

        const participants = row.participants
          .map((participant) =>
            usersByIdentity.get(participant.trim().toLowerCase())
          )
          .filter((participant): participant is NonNullable<typeof participant> =>
            Boolean(participant)
          );

        if (participants.length === 0) continue;

        const amount = Math.abs(row.amount);
        const splitAmounts = computeSplitAmounts(
          amount,
          "equal",
          participants.map((participant) => ({
            userId: participant.id,
            value: 0,
          }))
        );

        await tx.expense.create({
          data: {
            title: row.amount < 0 ? `Refund: ${row.title || "Imported row"}` : row.title || "Imported row",
            amount,
            paidById: payer.id,
            groupId,
            splitType: "equal",
            createdAt: row.date ?? undefined,
            splits: {
              create: splitAmounts.map((split) => ({
                userId: split.userId,
                amount: split.amount,
              })),
            },
          },
        });
      }

      return tx.importReport.create({
        data: {
          totalRows: rows.length,
          importedRows: importableRows.length,
          anomalyCount: anomalies.length,
          reportJson: {
            totalRows: rows.length,
            importedRows: importableRows.length,
            anomalies: anomalies.map((anomaly) => ({
              row: anomaly.rowNumber,
              type: anomaly.anomalyType,
              severity: anomaly.severity,
              description: anomaly.description,
              action: anomaly.actionTaken,
            })),
          },
        },
      });
    });

    return NextResponse.json({
      reportId: report.id,
      totalRows: rows.length,
      importedRows: importableRows.length,
      anomalyCount: anomalies.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process import" },
      { status: 500 }
    );
  }
}
