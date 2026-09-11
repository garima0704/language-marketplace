import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Card } from "@/components/ui/card";

import {
  User,
  Mail,
  Languages,
  Link as LinkIcon,
  Bell,
  Shield,
  Store,
  Wallet,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  const accountSettings = [
    {
      title: "Personal Information",
      description:
        "Manage your date of birth and personal information.",
      href: "/settings/personal",
      icon: User,
    },
    {
      title: "Email & Password",
      description:
        "Manage your email address and password.",
      href: "/settings/account",
      icon: Mail,
    },
  ];

  const preferenceSettings = [
    {
      title: "Languages",
      description:
        "Manage the languages you speak and your proficiency.",
      href: "/settings/languages",
      icon: Languages,
    },
    {
      title: "Social Links",
      description:
        "Manage your public social media and website links.",
      href: "/settings/social",
      icon: LinkIcon,
    },
    {
      title: "Notifications",
      description:
        "Choose which notifications you receive.",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      title: "Privacy",
      description:
        "Manage your profile visibility and privacy settings.",
      href: "/settings/privacy",
      icon: Shield,
    },
  ];

  const sellerSettings = profile?.is_creator
    ? [
        {
          title: "Seller Profile",
          description:
            "Manage information about you as a seller.",
          href: "/settings/seller",
          icon: Store,
        },
        {
          title: "Payments & Payouts",
          description:
            "Manage how you receive your seller earnings.",
          href: "/settings/payouts",
          icon: Wallet,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account, preferences, and seller settings.
        </p>
      </div>

      {/* Account */}
      <SettingsSection
        title="Account"
        items={accountSettings}
      />

      {/* Preferences */}
      <SettingsSection
        title="Preferences"
        items={preferenceSettings}
      />

      {/* Seller */}
      {sellerSettings.length > 0 && (
        <SettingsSection
          title="Seller"
          items={sellerSettings}
        />
      )}

      {/* Danger Zone */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">
          Danger Zone
        </h2>

        <Link href="/settings/delete-account">
          <Card className="rounded-2xl border-red-200 p-5 transition hover:bg-red-50/50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-red-600">
                  Delete Account
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Permanently delete your NiceConvo account and data.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

type SettingItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

function SettingsSection({
  title,
  items,
}: {
  title: string;
  items: SettingItem[];
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold">
        {title}
      </h2>

      <div className="overflow-hidden rounded-2xl border bg-white">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 p-5
                transition hover:bg-muted/40
                ${
                  index !== items.length - 1
                    ? "border-b"
                    : ""
                }
              `}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}