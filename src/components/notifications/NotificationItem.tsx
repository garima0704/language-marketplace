"use client";

import Link from "next/link";
import {
  Bell,
  Heart,
  MessageCircle,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { formatTimeAgo } from "@/lib/utils";

import type { Notification } from "./types";

type NotificationItemProps = {
  notification: Notification;
  onRead?: (id: string) => void;
  locale: string;
  translations: Record<string, string>;
};

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "comment":
      return MessageCircle;

    case "like":
      return Heart;

    case "report":
      return ShieldAlert;

    case "seller":
      return Wallet;

    default:
      return Bell;
  }
}

export default function NotificationItem({
  notification,
  onRead,
  locale,
  translations,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);

  const title =
    translations[notification.title] ??
    notification.title;

  const message = notification.message
    ? translations[notification.message] ??
      notification.message
    : null;

  const content = (
    <div
      className={[
        "flex gap-4 px-5 py-4 transition-colors",
        notification.is_read
          ? "bg-background"
          : "bg-muted-bg/50",
        "hover:bg-muted-bg",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {title}
            </p>

            {message && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {message}
              </p>
            )}
          </div>

          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTimeAgo(
              notification.created_at,
              locale
            )}
          </span>
        </div>
      </div>

      {!notification.is_read && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-foreground"
          aria-label={
            translations["notifications.unread"] ??
            "Unread"
          }
        />
      )}
    </div>
  );

  if (!notification.href) {
    return (
      <button
        type="button"
        onClick={() =>
          onRead?.(notification.id)
        }
        className="block w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={notification.href}
      onClick={() =>
        onRead?.(notification.id)
      }
      className="block"
    >
      {content}
    </Link>
  );
}
