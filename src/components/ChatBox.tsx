"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSummary } from "@/types";

interface ChatBoxProps {
  expenseId: string;
  initialMessages: MessageSummary[];
  currentUserId: string;
}

export default function ChatBox({
  expenseId,
  initialMessages,
  currentUserId,
}: ChatBoxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/expenses/${expenseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setContent("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.userId === currentUserId ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.userId === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="mb-1 text-xs font-medium opacity-80">
                  {msg.userName}
                </p>
                <p>{msg.content}</p>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !content.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
