export interface CsvParseResult {
  columns: string[];
  rows: Record<string, string>[];
}

export interface NormalizedImportRow {
  rowNumber: number;
  title: string;
  amount: number;
  date: Date | null;
  rawDate: string;
  payer: string;
  participants: string[];
  raw: Record<string, string>;
}

const COLUMN_ALIASES = {
  title: ["title", "description", "expense", "name"],
  amount: ["amount", "cost", "total", "value"],
  date: ["date", "createdat", "created_at", "paid_at", "paidat"],
  payer: ["payer", "paidby", "paid_by", "paid by", "user"],
  participants: ["participants", "members", "splitwith", "split_with", "split with"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(columns: string[], aliases: string[]): string | undefined {
  return columns.find((column) => {
    const normalized = normalizeHeader(column).replace(/[\s_-]/g, "");
    return aliases.some(
      (alias) => normalized === alias.replace(/[\s_-]/g, "")
    );
  });
}

export function parseCsv(text: string): CsvParseResult {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index++;
      row.push(field.trim());
      field = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);

  const columns = rows[0] ?? [];
  return {
    columns,
    rows: rows.slice(1).map((values) =>
      Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ""]))
    ),
  };
}

export function normalizeImportRows(
  columns: string[],
  rows: Record<string, string>[]
): NormalizedImportRow[] {
  const titleColumn = findColumn(columns, COLUMN_ALIASES.title);
  const amountColumn = findColumn(columns, COLUMN_ALIASES.amount);
  const dateColumn = findColumn(columns, COLUMN_ALIASES.date);
  const payerColumn = findColumn(columns, COLUMN_ALIASES.payer);
  const participantsColumn = findColumn(columns, COLUMN_ALIASES.participants);

  return rows.map((row, index) => {
    const rawAmount = amountColumn ? row[amountColumn] : "";
    const normalizedAmount = rawAmount.replace(/[₹,\s]/g, "");
    const rawDate = dateColumn ? row[dateColumn] : "";
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const participants = participantsColumn
      ? row[participantsColumn]
          .split(/[;|]/)
          .map((participant) => participant.trim())
          .filter(Boolean)
      : [];

    return {
      rowNumber: index + 2,
      title: titleColumn ? row[titleColumn].trim() : "",
      amount: Number.parseFloat(normalizedAmount),
      date:
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
      rawDate,
      payer: payerColumn ? row[payerColumn].trim() : "",
      participants,
      raw: row,
    };
  });
}

export function getPreviewRows(rows: Record<string, string>[], limit = 10) {
  return rows.slice(0, limit);
}
