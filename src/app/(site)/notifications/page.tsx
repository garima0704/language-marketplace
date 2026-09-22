"use client";

import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import NotificationList from "@/components/notifications/NotificationList";
import type { Notification } from "@/components/notifications/types";

export default function NotificationsPage() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  useEffect(() => {
    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, type, title, message, href, is_read, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setNotifications(data ?? []);
      }

      setLoading(false);
    }

    loadNotifications();
  }, [supabase]);

  async function handleRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  async function handleMarkAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-6rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="h-7 w-40 animate-pulse rounded bg-muted-bg" />

            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-muted-bg" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="divide-y divide-border">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 px-5 py-4"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted-bg" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted-bg" />
                    <div className="h-4 w-72 animate-pulse rounded bg-muted-bg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-6rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Stay up to date with activity on your NiceConvo account.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted-bg"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        <NotificationList
          notifications={notifications}
          onRead={handleRead}
        />
      </div>
    </main>
  );
}