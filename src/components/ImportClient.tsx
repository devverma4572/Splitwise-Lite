"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImportAnomaly } from "@/lib/anomaly-detector";

interface ImportClientProps {
  groups: { id: string; name: string }[];
}

interface PreviewState {
  columns: string[];
  previewRows: Record<string, string>[];
  totalRows: number;
  importableRows: number;
  anomalyCount: number;
  anomalies: ImportAnomaly[];
}

export default function ImportClient({ groups }: ImportClientProps) {
  const router = useRouter();
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitImport(mode: "preview" | "confirm") {
    if (!groupId || !file) {
      setError("Choose a group and CSV file first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("groupId", groupId);
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }

      if (mode === "preview") {
        setPreview(data);
      } else {
        router.push(`/import/report/${data.reportId}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>
            Upload expenses into a selected group. Columns are detected from the header row.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV file</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setPreview(null);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading || groups.length === 0}
              onClick={() => submitImport("preview")}
            >
              <Upload className="h-4 w-4" />
              Preview CSV
            </Button>
            <Button
              type="button"
              disabled={loading || !preview}
              onClick={() => submitImport("confirm")}
            >
              {loading ? "Importing..." : "Confirm Import"}
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Create or join a group before importing expenses.
            </p>
          )}
        </CardContent>
      </Card>

      {preview && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Rows</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{preview.totalRows}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Importable Rows</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-green-600">
                {preview.importableRows}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Anomalies</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-amber-600">
                {preview.anomalyCount}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.previewRows.map((row, index) => (
                    <TableRow key={index}>
                      {preview.columns.map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {preview.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Action Taken</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.anomalies.map((anomaly, index) => (
                      <TableRow key={`${anomaly.rowNumber}-${anomaly.anomalyType}-${index}`}>
                        <TableCell>{anomaly.rowNumber}</TableCell>
                        <TableCell>{anomaly.anomalyType}</TableCell>
                        <TableCell className={anomaly.severity === "error" ? "text-red-600" : "text-amber-600"}>
                          {anomaly.severity}
                        </TableCell>
                        <TableCell>{anomaly.description}</TableCell>
                        <TableCell>{anomaly.actionTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
