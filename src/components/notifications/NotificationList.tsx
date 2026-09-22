"use client";

import NotificationItem from "./NotificationItem";
import type { Notification } from "./types";

type NotificationListProps = {
  notifications: Notification[];
  onRead?: (id: string) => void;
};

export default function NotificationList({
  notifications,
  onRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border">
          <span className="text-lg">🔔</span>
        </div>

        <h2 className="mt-4 text-sm font-semibold">
          No notifications yet
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll see your notifications here when you have them.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={onRead}
          />
        ))}
      </div>
    </div>
  );
}