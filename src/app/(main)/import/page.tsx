import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ImportClient from "@/components/ImportClient";

export default async function ImportPage() {
  const session = await getSession();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session!.userId },
    include: { group: { select: { id: true, name: true } } },
    orderBy: { group: { createdAt: "desc" } },
  });

  const groups = memberships.map((membership) => membership.group);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Expenses</h1>
        <p className="text-muted-foreground">
          Preview CSV rows, review anomalies, and import valid expenses.
        </p>
      </div>

      <ImportClient groups={groups} />
    </div>
  );
}
