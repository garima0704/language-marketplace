"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import SettingsPanel from "./SettingsPanel";

type NotificationSettings = {
  comments: boolean;
  likes: boolean;
  reports: boolean;
  seller: boolean;
};

type NotificationsSettingsProps = {
  translations: Record<string, string>;
};

const defaultSettings: NotificationSettings = {
  comments: true,
  likes: true,
  reports: true,
  seller: true,
};

export default function NotificationsSettings({
  translations,
}: NotificationsSettingsProps) {
  const supabase = createClient();

  const [settings, setSettings] =
    useState<NotificationSettings>(
      defaultSettings
    );

  const [loading, setLoading] = useState(true);

  const [savingKey, setSavingKey] =
    useState<keyof NotificationSettings | null>(
      null
    );

  const notificationItems = [
    {
      key: "comments" as const,
      title:
        translations["settings.comments"] ??
        "Comments",
      description:
        translations[
          "settings.comments_description"
        ] ??
        "Receive notifications when someone comments on your videos.",
    },
    {
      key: "likes" as const,
      title:
        translations["settings.likes"] ??
        "Likes",
      description:
        translations[
          "settings.likes_description"
        ] ??
        "Receive notifications when someone likes your videos or comments.",
    },
    {
      key: "reports" as const,
      title:
        translations["settings.reports"] ??
        "Reports",
      description:
        translations[
          "settings.reports_description"
        ] ??
        "Receive notifications related to reports and moderation activity.",
    },
    {
      key: "seller" as const,
      title:
        translations["settings.seller_activity"] ??
        "Seller activity",
      description:
        translations[
          "settings.seller_activity_description"
        ] ??
        "Receive notifications about your seller activity and earnings.",
    },
  ];

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("notification_preferences")
        .select(
          "comments, likes, reports, seller"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Failed to load notification preferences:",
          error
        );

        setLoading(false);
        return;
      }

      if (data) {
        setSettings({
          comments: data.comments,
          likes: data.likes,
          reports: data.reports,
          seller: data.seller,
        });
      } else {
        const { error: insertError } =
          await supabase
            .from("notification_preferences")
            .insert({
              user_id: user.id,
              ...defaultSettings,
            });

        if (insertError) {
          console.error(
            "Failed to create notification preferences:",
            insertError
          );
        }
      }

      setLoading(false);
    }

    loadSettings();
  }, [supabase]);

  async function toggleSetting(
    key: keyof NotificationSettings
  ) {
    const newValue = !settings[key];

    setSettings((current) => ({
      ...current,
      [key]: newValue,
    }));

    setSavingKey(key);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSettings((current) => ({
        ...current,
        [key]: !newValue,
      }));

      setSavingKey(null);
      return;
    }

    const { error } = await supabase
      .from("notification_preferences")
      .update({
        [key]: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Failed to save notification preference:",
        error
      );

      setSettings((current) => ({
        ...current,
        [key]: !newValue,
      }));
    }

    setSavingKey(null);
  }

  return (
    <SettingsPanel
      title={
        translations["settings.notifications"] ??
        "Notifications"
      }
      description={
        translations[
          "settings.notifications_description"
        ] ??
        "Choose which notifications you want to receive."
      }
    >
      <div className="max-w-2xl divide-y divide-border border-y border-border">
        {notificationItems.map((item) => {
          const isEnabled =
            settings[item.key];

          const isSaving =
            savingKey === item.key;

          return (
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
                aria-checked={isEnabled}
                aria-label={`${item.title} ${
                  translations[
                    "settings.notifications"
                  ] ?? "notifications"
                }`}
                disabled={
                  loading || isSaving
                }
                onClick={() =>
                  toggleSetting(item.key)
                }
                className={[
                  "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  isEnabled
                    ? "border-foreground bg-foreground"
                    : "border-border bg-muted-bg",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                    isEnabled
                      ? "translate-x-5"
                      : "translate-x-0.5",
                  ].join(" ")}
                />
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {translations[
          "settings.notification_preferences_footer"
        ] ??
          "Notification preferences will apply to your NiceConvo account."}
      </p>
    </SettingsPanel>
  );
}