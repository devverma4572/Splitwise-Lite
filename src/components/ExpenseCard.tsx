import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseSummary } from "@/types";

interface ExpenseCardProps {
  expense: ExpenseSummary;
  groupId: string;
}

export default function ExpenseCard({ expense, groupId }: ExpenseCardProps) {
  return (
    <Link href={`/groups/${groupId}/expenses/${expense.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{expense.title}</CardTitle>
            <span className="font-semibold text-primary">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          <CardDescription>
            Paid by {expense.paidByName} ·{" "}
            {new Date(expense.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="capitalize">
            {expense.splitType}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
