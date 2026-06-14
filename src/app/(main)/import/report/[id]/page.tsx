import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ReportAnomaly {
  row: number;
  type: string;
  severity: "warning" | "error";
  description: string;
  action: string;
}

interface StoredReportJson {
  totalRows: number;
  importedRows: number;
  anomalies: ReportAnomaly[];
}

export default async function ImportReportPage({ params }: PageProps) {
  const { id } = await params;
  const report = await prisma.importReport.findUnique({ where: { id } });

  if (!report) notFound();

  const reportJson = report.reportJson as unknown as StoredReportJson;
  const anomalies = reportJson.anomalies ?? [];
  const warnings = anomalies.filter((anomaly) => anomaly.severity === "warning").length;
  const errors = anomalies.filter((anomaly) => anomaly.severity === "error").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Report</h1>
        <p className="text-muted-foreground">
          Generated {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Rows</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{report.totalRows}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Imported Rows</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">
            {report.importedRows}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Warnings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-amber-600">
            {warnings}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Errors</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">
            {errors}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No anomalies were detected.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row Number</TableHead>
                  <TableHead>Anomaly Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalies.map((anomaly, index) => (
                  <TableRow key={`${anomaly.row}-${anomaly.type}-${index}`}>
                    <TableCell>{anomaly.row}</TableCell>
                    <TableCell>{anomaly.type}</TableCell>
                    <TableCell>{anomaly.description}</TableCell>
                    <TableCell>{anomaly.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
