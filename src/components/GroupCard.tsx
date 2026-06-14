import Link from "next/link";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GroupSummary } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface GroupCardProps {
  group: GroupSummary;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <CardDescription>
            Created {new Date(group.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} members</span>
          </div>
          {group.balance && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {group.balance.owes <= 0.01 && group.balance.owed <= 0.01 ? (
                <div className="col-span-2 rounded-md bg-muted px-3 py-2 text-center font-medium text-muted-foreground">
                  Settled Up
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">You Owe</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(group.balance.owes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">You Are Owed</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(group.balance.owed)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
