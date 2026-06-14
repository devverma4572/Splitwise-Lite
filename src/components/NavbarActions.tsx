"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationSummary } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface NavbarActionsProps {
  userName: string;
}

export default function NavbarActions({ userName }: NavbarActionsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 8),
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnreadNotifications(data.unreadCount ?? 0);
  }, []);

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const unread = (data.conversations ?? []).reduce(
      (total: number, conversation: { unreadCount?: number }) =>
        total + (conversation.unreadCount ?? 0),
      0
    );
    setUnreadChats(unread);
  }, []);

  async function handleNotificationClick(notification: NotificationSummary) {
    if (!notification.isRead) {
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: "PATCH",
      });
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      setUnreadNotifications((count) => Math.max(0, count - 1));
    }
  }

  async function handleReadAll() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadNotifications(0);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    const load = () => {
      loadNotifications();
      loadChats();
    };

    const timeout = window.setTimeout(load, 0);
    const interval = window.setInterval(load, 30000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadChats, loadNotifications]);

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <Button
        variant={pathname === "/dashboard" ? "secondary" : "ghost"}
        size="sm"
        asChild
        className="hidden sm:inline-flex"
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
              {unreadNotifications}
            </span>
          )}
        </Button>

        {notificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-semibold">Notifications</p>
              {unreadNotifications > 0 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={handleReadAll}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              ) : (
                visibleNotifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-accent ${
                      notification.isRead ? "" : "bg-primary/10"
                    }`}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        variant={pathname === "/chats" ? "secondary" : "ghost"}
        size="sm"
        asChild
      >
        <Link href="/chats">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Chats</span>
          {unreadChats > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {unreadChats}
            </span>
          )}
        </Link>
      </Button>

      <Button
        variant={pathname === "/profile" ? "secondary" : "ghost"}
        size="sm"
        asChild
      >
        <Link href="/profile">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
      </Button>

      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
      <span className="sr-only">Signed in as {userName}</span>
    </nav>
  );
}
