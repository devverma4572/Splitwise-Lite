import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { isGroupMember } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ExpenseForm from "@/components/ExpenseForm";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function CreateExpensePage({ params }: PageProps) {
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
    },
  });

  if (!group) notFound();

  const members = group.members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/groups/${groupId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to {group.name}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>
            Record a new expense for {group.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm groupId={groupId} members={members} />
        </CardContent>
      </Card>
    </div>
  );
}
