"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Bell,
  Wallet,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import SettingsNavigation from "@/components/settings/SettingsNavigation";
import AccountSettings from "@/components/settings/AccountSettings";
import NotificationsSettings from "@/components/settings/NotificationsSettings";
import PayoutSettings from "@/components/settings/PayoutSettings";
import DeleteAccountSettings from "@/components/settings/DeleteAccountSettings";

import type {
  Section,
  SettingItem,
} from "@/components/settings/types";

type SettingsPageClientProps = {
  translations: Record<string, string>;
  locale: string;
};

export default function SettingsPageClient({
  translations,
  locale,
}: SettingsPageClientProps) {
  const supabase = createClient();

  const [activeSection, setActiveSection] =
    useState<Section>("account");

  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_creator")
        .eq("id", user.id)
        .single();

      setIsCreator(profile?.is_creator ?? false);
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-6rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-border bg-background p-8">
            <div className="h-7 w-32 animate-pulse rounded bg-muted-bg" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted-bg" />

            <div className="mt-8 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-lg bg-muted-bg" />
                <div className="h-10 animate-pulse rounded-lg bg-muted-bg" />
                <div className="h-10 animate-pulse rounded-lg bg-muted-bg" />
              </div>

              <div className="space-y-4">
                <div className="h-6 w-48 animate-pulse rounded bg-muted-bg" />
                <div className="h-4 w-80 animate-pulse rounded bg-muted-bg" />
                <div className="h-10 animate-pulse rounded-lg bg-muted-bg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const accountSettings: SettingItem[] = [
    {
      id: "account",
      title:
        translations["settings.email_password"] ??
        "Email & Password",
      icon: Mail,
    },
  ];

  const preferenceSettings: SettingItem[] = [
    {
      id: "notifications",
      title:
        translations["settings.notifications"] ??
        "Notifications",
      icon: Bell,
    },
  ];

  const sellerSettings: SettingItem[] = [
    {
      id: "payouts",
      title:
        translations["settings.payouts"] ??
        "Payouts",
      icon: Wallet,
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      id: "delete-account",
      title:
        translations["settings.delete_account"] ??
        "Delete Account",
      icon: Trash2,
    },
  ];

  const navigationSections = [
    {
      title:
        translations["settings.account"] ??
        "Account",
      items: accountSettings,
    },
    {
      title:
        translations["settings.preferences"] ??
        "Preferences",
      items: preferenceSettings,
    },
    ...(isCreator
      ? [
          {
            title:
              translations["settings.seller"] ??
              "Seller",
            items: sellerSettings,
          },
        ]
      : []),
    {
      title:
        translations["settings.danger_zone"] ??
        "Danger Zone",
      items: dangerSettings,
    },
  ];

  return (
    <main className="min-h-[calc(100vh-6rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {translations["settings.title"] ??
              "Settings"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {translations["settings.description"] ??
              "Manage your account and notification preferences."}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)]">
            <SettingsNavigation
              sections={navigationSections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            <section className="min-w-0">
              {activeSection === "account" && (
                <AccountSettings
                  translations={translations}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationsSettings
                  translations={translations}
                />
              )}

              {activeSection === "payouts" &&
                isCreator && (
                  <PayoutSettings
                    translations={translations}
                  />
                )}

              {activeSection === "delete-account" && (
                <DeleteAccountSettings
                  translations={translations}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}