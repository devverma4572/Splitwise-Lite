import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getGroupBalances, isGroupMember } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BalanceCard from "@/components/BalanceCard";
import ExpenseCard from "@/components/ExpenseCard";
import MemberList from "@/components/MemberList";
import SettlementModal from "@/components/SettlementModal";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { groupId } = await params;
  const session = await getSession();

  if (!(await isGroupMember(groupId, session!.userId))) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      expenses: {
        include: { paidBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) notFound();

  const balances = await getGroupBalances(groupId);

  const members = group.members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));

  const expenses = group.expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    paidById: e.paidById,
    paidByName: e.paidBy.name,
    splitType: e.splitType,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SettlementModal groupId={groupId} members={members} />
          <Button asChild>
            <Link href={`/groups/${groupId}/expenses/create`}>
              <Plus className="h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>{members.length} people in this group</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberList members={members} groupId={groupId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
            <CardDescription>Who owes whom in this group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {balances.map((balance) => (
              <BalanceCard key={balance.userId} balance={balance} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Expenses</h2>
        {expenses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-4 text-muted-foreground">No expenses yet.</p>
            <Button asChild>
              <Link href={`/groups/${groupId}/expenses/create`}>
                Add first expense
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                groupId={groupId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
