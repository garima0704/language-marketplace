"use client";

import { useState } from "react";

import SettingsPanel from "./SettingsPanel";

type NotificationSettings = {
  comments: boolean;
  likes: boolean;
  reports: boolean;
  seller: boolean;
};

const notificationItems = [
  {
    key: "comments" as const,
    title: "Comments",
    description:
      "Receive notifications when someone comments on your videos.",
  },
  {
    key: "likes" as const,
    title: "Likes",
    description:
      "Receive notifications when someone likes your videos or comments.",
  },
  {
    key: "reports" as const,
    title: "Reports",
    description:
      "Receive notifications related to reports and moderation activity.",
  },
  {
    key: "seller" as const,
    title: "Seller activity",
    description:
      "Receive notifications about your seller activity and earnings.",
  },
];

export default function NotificationsSettings() {
  const [settings, setSettings] =
    useState<NotificationSettings>({
      comments: true,
      likes: true,
      reports: true,
      seller: true,
    });

  function toggleSetting(
    key: keyof NotificationSettings
  ) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <SettingsPanel
      title="Notifications"
      description="Choose which notifications you want to receive."
    >
      <div className="max-w-2xl divide-y divide-border border-y border-border">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-6 py-5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings[item.key]}
              onClick={() => toggleSetting(item.key)}
              className={[
                "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
                settings[item.key]
                  ? "border-foreground bg-foreground"
                  : "border-border bg-muted-bg",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                  settings[item.key]
                    ? "translate-x-5"
                    : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Notification preferences will apply to your NiceConvo
        account.
      </p>
    </SettingsPanel>
  );
}