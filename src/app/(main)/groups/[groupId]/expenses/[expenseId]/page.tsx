import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import ChatBox from "@/components/ChatBox";

interface PageProps {
  params: Promise<{ groupId: string; expenseId: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const { groupId, expenseId } = await params;
  const session = await getSession();

  if (!(await isGroupMember(groupId, session!.userId))) {
    notFound();
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId, groupId },
    include: {
      paidBy: { select: { id: true, name: true } },
      splits: {
        include: { user: { select: { id: true, name: true } } },
      },
      messages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!expense) notFound();

  const messages = expense.messages.map((m) => ({
    id: m.id,
    userId: m.userId,
    userName: m.user.name,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/groups/${groupId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to group
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{expense.title}</CardTitle>
              <CardDescription>
                {new Date(expense.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(expense.amount)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Paid by {expense.paidBy.name}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {expense.splitType} split
            </Badge>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Split Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expense.splits.map((split) => (
                  <TableRow key={split.id}>
                    <TableCell>{split.user.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(split.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
          <CardDescription>Chat about this expense</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatBox
            expenseId={expenseId}
            initialMessages={messages}
            currentUserId={session!.userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
