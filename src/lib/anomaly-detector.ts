import { NormalizedImportRow } from "@/lib/csv-import";

export interface ImportAnomaly {
  rowNumber: number;
  anomalyType: string;
  severity: "warning" | "error";
  description: string;
  actionTaken: string;
}

export interface KnownUser {
  id: string;
  name: string;
  email: string;
}

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function titlesAreSimilar(a: string, b: string): boolean {
  const first = normalizeTitle(a);
  const second = normalizeTitle(b);
  return first === second || first.includes(second) || second.includes(first);
}

export function detectImportAnomalies(
  rows: NormalizedImportRow[],
  users: KnownUser[],
  existingExpenses: { title: string; amount: number; paidById: string; createdAt: Date }[]
): ImportAnomaly[] {
  const anomalies: ImportAnomaly[] = [];
  const usersByIdentity = new Map<string, KnownUser>();

  for (const user of users) {
    usersByIdentity.set(normalizeIdentity(user.email), user);
    usersByIdentity.set(normalizeIdentity(user.name), user);
  }

  rows.forEach((row, index) => {
    const payer = usersByIdentity.get(normalizeIdentity(row.payer));
    const previousRows = rows.slice(0, index);

    if (!row.payer) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "MISSING_PAYER",
        severity: "error",
        description: "No payer was provided for this row.",
        actionTaken: "ROW_MARKED_INVALID",
      });
    }

    if (row.participants.length === 0) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "MISSING_PARTICIPANTS",
        severity: "error",
        description: "No participants were provided for this row.",
        actionTaken: "ROW_MARKED_INVALID",
      });
    }

    if (!Number.isFinite(row.amount)) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "INVALID_AMOUNT",
        severity: "error",
        description: "Amount is missing or invalid.",
        actionTaken: "ROW_MARKED_INVALID",
      });
    } else if (row.amount < 0) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "NEGATIVE_AMOUNT",
        severity: "warning",
        description: "Amount is negative and will be treated as a refund.",
        actionTaken: "TREATED_AS_REFUND",
      });
    }

    if (!row.rawDate || !row.date) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "INVALID_DATE",
        severity: "warning",
        description: "Date is missing or invalid.",
        actionTaken: "FLAGGED_FOR_REVIEW",
      });
    } else if (row.date.getTime() > Date.now()) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "FUTURE_DATE",
        severity: "warning",
        description: "Date is in the future.",
        actionTaken: "FLAGGED_FOR_REVIEW",
      });
    }

    if (row.payer && !payer) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "UNKNOWN_USER",
        severity: "warning",
        description: `Payer "${row.payer}" was not found.`,
        actionTaken: "SUGGEST_CREATE_USER",
      });
    }

    for (const participant of row.participants) {
      if (!usersByIdentity.has(normalizeIdentity(participant))) {
        anomalies.push({
          rowNumber: row.rowNumber,
          anomalyType: "UNKNOWN_USER",
          severity: "warning",
          description: `Participant "${participant}" was not found.`,
          actionTaken: "SUGGEST_CREATE_USER",
        });
      }
    }

    if (!payer || !row.date || !Number.isFinite(row.amount)) return;

    const duplicateInFile = previousRows.some((previous) => {
      const previousPayer = usersByIdentity.get(normalizeIdentity(previous.payer));
      return (
        previousPayer?.id === payer.id &&
        Math.abs(Math.abs(previous.amount) - Math.abs(row.amount)) <= 0.01 &&
        previous.date?.toDateString() === row.date?.toDateString() &&
        titlesAreSimilar(previous.title, row.title)
      );
    });

    const duplicateInDb = existingExpenses.some(
      (expense) =>
        expense.paidById === payer.id &&
        Math.abs(expense.amount - Math.abs(row.amount)) <= 0.01 &&
        expense.createdAt.toDateString() === row.date?.toDateString() &&
        titlesAreSimilar(expense.title, row.title)
    );

    if (duplicateInFile || duplicateInDb) {
      anomalies.push({
        rowNumber: row.rowNumber,
        anomalyType: "DUPLICATE_EXPENSE",
        severity: "warning",
        description: "Similar payer, amount, date, and title were found.",
        actionTaken: "FLAGGED_FOR_REVIEW",
      });
    }
  });

  return anomalies;
}
