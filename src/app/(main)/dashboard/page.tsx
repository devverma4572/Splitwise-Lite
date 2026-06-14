import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getUserBalanceSummaryForGroup,
  getUserOverallBalanceSummary,
} from "@/lib/balances";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroupCard from "@/components/GroupCard";

export default async function DashboardPage() {
  const session = await getSession();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session!.userId },
    include: {
      group: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { group: { createdAt: "desc" } },
  });

  const [overallSummary, groupBalances] = await Promise.all([
    getUserOverallBalanceSummary(session!.userId),
    Promise.all(
      memberships.map((membership) =>
        getUserBalanceSummaryForGroup(membership.group.id, session!.userId)
      )
    ),
  ]);

  const groups = memberships.map((m, index) => ({
    id: m.group.id,
    name: m.group.name,
    createdAt: m.group.createdAt.toISOString(),
    memberCount: m.group._count.members,
    balance: {
      owes: groupBalances[index].owes,
      owed: groupBalances[index].owed,
    },
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session!.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/import">
              <Upload className="h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/groups/create">
              <Plus className="h-4 w-4" />
              Create Group
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Overall Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                You Owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(overallSummary.owes)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                You Are Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(overallSummary.owed)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Groups</h2>
        {groups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="mb-4 text-muted-foreground">
              You haven&apos;t joined any groups yet.
            </p>
            <Button asChild>
              <Link href="/groups/create">Create your first group</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
