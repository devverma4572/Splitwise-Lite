"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeSplitAmounts, validateSplits } from "@/lib/splits";
import { formatCurrency } from "@/lib/utils";
import { GroupMemberSummary, SplitType } from "@/types";

interface ExpenseFormProps {
  groupId: string;
  members: GroupMemberSummary[];
}

export default function ExpenseForm({ groupId, members }: ExpenseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState(members[0]?.userId ?? "");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [splitValues, setSplitValues] = useState<Record<string, number>>(
    Object.fromEntries(members.map((m) => [m.userId, splitType === "share" ? 1 : 0]))
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSplitTypeChange(value: SplitType) {
    setSplitType(value);
    setSplitValues(
      Object.fromEntries(
        members.map((m) => [m.userId, value === "share" ? 1 : value === "equal" ? 0 : 0])
      )
    );
  }

  function updateSplitValue(userId: string, value: number) {
    setSplitValues((prev) => ({ ...prev, [userId]: value }));
  }

  const parsedAmount = parseFloat(amount) || 0;
  const splits = members.map((m) => ({
    userId: m.userId,
    value: splitType === "equal" ? 0 : (splitValues[m.userId] ?? 0),
  }));

  const previewAmounts =
    parsedAmount > 0 && members.length > 0
      ? computeSplitAmounts(parsedAmount, splitType, splits)
      : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (!title.trim() || !numAmount || !paidById) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const validationError = validateSplits(numAmount, splitType, splits);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: numAmount,
          paidById,
          splitType,
          splits,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create expense");
        return;
      }

      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Dinner, groceries, rent..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Paid By</Label>
        <Select value={paidById} onValueChange={setPaidById}>
          <SelectTrigger>
            <SelectValue placeholder="Select payer" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Split Type</Label>
        <Select value={splitType} onValueChange={(v) => handleSplitTypeChange(v as SplitType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal">Equal</SelectItem>
            <SelectItem value="unequal">Unequal</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="share">Share</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {splitType !== "equal" && (
        <div className="space-y-3 rounded-lg border p-4">
          <Label>
            {splitType === "unequal" && "Amount per member"}
            {splitType === "percentage" && "Percentage per member"}
            {splitType === "share" && "Shares per member"}
          </Label>
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <span className="w-32 text-sm font-medium">{member.name}</span>
              <Input
                type="number"
                step={splitType === "share" ? "1" : "0.01"}
                min="0"
                value={splitValues[member.userId] ?? 0}
                onChange={(e) =>
                  updateSplitValue(member.userId, parseFloat(e.target.value) || 0)
                }
                className="max-w-[140px]"
              />
              {splitType === "percentage" && <span className="text-sm">%</span>}
              {previewAmounts.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  = {formatCurrency(
                    previewAmounts.find((p) => p.userId === member.userId)?.amount ?? 0
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {splitType === "equal" && parsedAmount > 0 && members.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Each member pays {formatCurrency(parsedAmount / members.length)}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Creating..." : "Create Expense"}
      </Button>
    </form>
  );
}
