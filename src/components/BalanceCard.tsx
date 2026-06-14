import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BalanceSummary } from "@/types";
import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react";

interface BalanceCardProps {
  balance: BalanceSummary;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const isPositive = balance.balance > 0.01;
  const isNegative = balance.balance < -0.01;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{balance.userName}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span
          className={`text-lg font-semibold ${
            isPositive
              ? "text-green-600"
              : isNegative
                ? "text-red-600"
                : "text-muted-foreground"
          }`}
        >
          {formatCurrency(Math.abs(balance.balance))}
        </span>
        {isPositive ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            gets back
          </Badge>
        ) : isNegative ? (
          <Badge variant="destructive">
            <ArrowDownLeft className="mr-1 h-3 w-3" />
            owes
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Minus className="mr-1 h-3 w-3" />
            settled
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
