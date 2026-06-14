"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatConversationSummary, ChatMessageSummary } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface ChatsClientProps {
  currentUserId: string;
}

interface SelectedConversation {
  id: string;
  participant: ChatConversationSummary["participant"];
  messages: ChatMessageSummary[];
}

export default function ChatsClient({ currentUserId }: ChatsClientProps) {
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    []
  );
  const [selectedId, setSelectedId] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(null);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSummary = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId),
    [conversations, selectedId]
  );

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const loaded = data.conversations ?? [];
    setConversations(loaded);

    if (!selectedId && loaded[0]) {
      setSelectedId(loaded[0].id);
    }
  }, [selectedId]);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/chats/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setSelectedConversation(data.conversation);

    await fetch(`/api/chats/${id}/read`, { method: "PATCH" });
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
  }, []);

  async function handleCreateChat(e: React.FormEvent) {
    e.preventDefault();
    if (!newChatEmail.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chats/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newChatEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create chat");
        return;
      }

      setNewChatEmail("");
      await loadConversations();
      setSelectedId(data.conversation.id);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !message.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chats/${selectedId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setMessage("");
      setSelectedConversation((current) =>
        current
          ? { ...current, messages: [...current.messages, data.message] }
          : current
      );
      await loadConversations();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(loadConversations, 0);
    const interval = window.setInterval(loadConversations, 10000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const timeout = window.setTimeout(() => loadConversation(selectedId), 0);
    const interval = window.setInterval(() => loadConversation(selectedId), 5000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadConversation, selectedId]);

  return (
    <div className="grid min-h-[calc(100vh-10rem)] gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chats</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleCreateChat} className="space-y-2">
            <Label htmlFor="new-chat-email">+ New Chat</Label>
            <div className="flex gap-2">
              <Input
                id="new-chat-email"
                type="email"
                placeholder="user@example.com"
                value={newChatEmail}
                onChange={(event) => setNewChatEmail(event.target.value)}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Search by email to start a chat.
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left hover:bg-accent ${
                    selectedId === conversation.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{conversation.participant.name}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {conversation.lastMessage?.content ?? conversation.participant.email}
                  </p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[32rem] flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">
            {selectedConversation?.participant.name ??
              selectedSummary?.participant.name ??
              "Selected Chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
            {!selectedConversation ? (
              <p className="text-center text-sm text-muted-foreground">
                Select or create a chat to start messaging.
              </p>
            ) : selectedConversation.messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No messages yet.
              </p>
            ) : (
              selectedConversation.messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={`flex flex-col ${
                    chatMessage.senderId === currentUserId
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      chatMessage.senderId === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium opacity-80">
                      {chatMessage.senderName}
                    </p>
                    <p>{chatMessage.content}</p>
                  </div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(chatMessage.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              disabled={!selectedId}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !selectedId || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
