import { getSession } from "@/lib/auth";
import ChatsClient from "@/components/ChatsClient";

export default async function ChatsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chats</h1>
        <p className="text-muted-foreground">
          Send direct messages to other Splitwise Lite users.
        </p>
      </div>

      <ChatsClient currentUserId={session!.userId} />
    </div>
  );
}
