"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Bell,
  Wallet,
  Trash2,
  ChevronRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Section =
  | "account"
  | "notifications"
  | "payouts"
  | "delete-account";

type SettingItem = {
  id: Section;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const accountSettings: SettingItem[] = [
  {
    id: "account",
    title: "Email & Password",
    description: "Manage your email address and password.",
    icon: Mail,
  },
];

const preferenceSettings: SettingItem[] = [
  {
    id: "notifications",
    title: "Notifications",
    description: "Choose which notifications you receive.",
    icon: Bell,
  },
];

const sellerSettings: SettingItem[] = [
  {
    id: "payouts",
    title: "Payouts",
    description: "Manage how you receive your seller earnings.",
    icon: Wallet,
  },
];

const dangerSettings: SettingItem[] = [
  {
    id: "delete-account",
    title: "Delete Account",
    description: "Permanently delete your NiceConvo account and data.",
    icon: Trash2,
  },
];

export default function SettingsPage() {
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
      <main className="min-h-[calc(100vh-6rem)] bg-light-bg px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-background p-8">
            <div className="h-7 w-32 animate-pulse rounded bg-muted-bg" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted-bg" />

            <div className="mt-8 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-3">
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

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-light-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and notification preferences.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="border-b border-border p-4 md:border-b-0 md:border-r">
              <SettingsNavigation
                title="Account"
                items={accountSettings}
                activeSection={activeSection}
                onSelect={handleSectionChange}
              />

              <div className="mt-6">
                <SettingsNavigation
                  title="Preferences"
                  items={preferenceSettings}
                  activeSection={activeSection}
                  onSelect={handleSectionChange}
                />
              </div>

              {isCreator && (
                <div className="mt-6">
                  <SettingsNavigation
                    title="Seller"
                    items={sellerSettings}
                    activeSection={activeSection}
                    onSelect={handleSectionChange}
                  />
                </div>
              )}

              <div className="mt-6">
                <SettingsNavigation
                  title="Danger Zone"
                  items={dangerSettings}
                  activeSection={activeSection}
                  onSelect={handleSectionChange}
                />
              </div>
            </aside>

            {/* Content */}
            <section className="min-w-0">
              {activeSection === "account" && <AccountSettings />}

              {activeSection === "notifications" && (
                <NotificationsSettings />
              )}

              {activeSection === "payouts" && isCreator && (
                <PayoutSettings />
              )}

              {activeSection === "delete-account" && (
                <DeleteAccountSettings />
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function SettingsNavigation({
  title,
  items,
  activeSection,
  onSelect,
}: {
  title: string;
  items: SettingItem[];
  activeSection: Section;
  onSelect: (section: Section) => void;
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={[
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                active
                  ? "bg-light-bg text-foreground"
                  : "text-muted-foreground hover:bg-light-bg hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {item.title}
                </span>
              </span>

              <ChevronRight
                className={[
                  "h-4 w-4 shrink-0 transition-opacity",
                  active
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Account                                                                    */
/* -------------------------------------------------------------------------- */

function AccountSettings() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }

      setLoading(false);
    }

    loadUser();
  }, [supabase]);

  async function handleUpdateEmail() {
    if (!email.trim()) return;

    setUpdatingEmail(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.updateUser({
      email: email.trim(),
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "A confirmation email has been sent to your new email address."
      );
    }

    setUpdatingEmail(false);
  }

  async function handleChangePassword() {
    setChangingPassword(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError("Unable to find your account email.");
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "A password reset email has been sent to your email address."
      );
    }

    setChangingPassword(false);
  }

  return (
    <SettingsPanel
      title="Email & Password"
      description="Manage the email address and password used to access your account."
    >
      <div className="max-w-xl space-y-8">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email address
          </label>

          <Input
            type="email"
            value={email}
            disabled={loading || updatingEmail}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Changing your email may require confirmation.
          </p>

          <Button
            type="button"
            className="mt-4"
            size="sm"
            disabled={
              loading ||
              updatingEmail ||
              !email.trim()
            }
            onClick={handleUpdateEmail}
          >
            {updatingEmail ? "Updating..." : "Update Email"}
          </Button>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-semibold">
            Password
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            We will send you an email with a secure link to change
            your password.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={changingPassword}
            onClick={handleChangePassword}
          >
            {changingPassword
              ? "Sending..."
              : "Change Password"}
          </Button>
        </div>

        {(message || error) && (
          <StatusMessage
            message={message}
            error={error}
          />
        )}
      </div>
    </SettingsPanel>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

function NotificationsSettings() {
  const [settings, setSettings] = useState({
    comments: true,
    likes: true,
    reports: true,
    seller: true,
  });

  function toggleSetting(
    key: keyof typeof settings
  ) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

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

/* -------------------------------------------------------------------------- */
/* Payouts                                                                    */
/* -------------------------------------------------------------------------- */

function PayoutSettings() {
  const [selectedMethod, setSelectedMethod] = useState<
    "stripe" | "paypal" | "bank"
  >("stripe");

  return (
    <SettingsPanel
      title="Payouts"
      description="Manage how you receive earnings from your NiceConvo sales."
    >
      <div className="max-w-2xl">
        <div className="space-y-3">
          <PayoutMethod
            id="stripe"
            title="Stripe"
            description="Recommended. Connect your Stripe account to receive payouts securely."
            selected={selectedMethod === "stripe"}
            onSelect={() => setSelectedMethod("stripe")}
          />

          <PayoutMethod
            id="paypal"
            title="PayPal"
            description="Receive your seller earnings through your PayPal account."
            selected={selectedMethod === "paypal"}
            onSelect={() => setSelectedMethod("paypal")}
          />

          <PayoutMethod
            id="bank"
            title="Bank Account"
            description="Receive your seller earnings directly into your bank account."
            selected={selectedMethod === "bank"}
            onSelect={() => setSelectedMethod("bank")}
          />
        </div>

        <div className="mt-6 rounded-xl bg-light-bg p-5">
          {selectedMethod === "stripe" && (
            <StripePayout />
          )}

          {selectedMethod === "paypal" && (
            <PaypalPayout />
          )}

          {selectedMethod === "bank" && (
            <BankPayout />
          )}
        </div>
      </div>
    </SettingsPanel>
  );
}

function PayoutMethod({
  id,
  title,
  description,
  selected,
  onSelect,
}: {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-foreground bg-background"
          : "border-border bg-background hover:bg-light-bg",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-foreground"
            : "border-muted-foreground/40",
        ].join(" ")}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-foreground" />
        )}
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-medium">
          {title}
        </span>

        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function StripePayout() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function handleStripeConnect() {
    try {
      setConnecting(true);
      setError("");

      const response = await fetch(
        "/api/stripe/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to connect Stripe."
        );
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error(
        "Stripe onboarding URL was not returned."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect Stripe."
      );
      setConnecting(false);
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold">
        Stripe
      </h3>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Stripe securely collects and verifies your identity
        and payout information. Your bank details are handled
        directly by Stripe.
      </p>

      <Button
        type="button"
        size="sm"
        className="mt-4"
        disabled={connecting}
        onClick={handleStripeConnect}
      >
        {connecting
          ? "Connecting..."
          : "Connect Stripe"}
      </Button>

      {error && (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function PaypalPayout() {
  const [email, setEmail] = useState("");

  return (
    <div>
      <h3 className="text-sm font-semibold">
        PayPal
      </h3>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Enter the PayPal email address where you want to
        receive your seller earnings.
      </p>

      <div className="mt-4 max-w-md">
        <Input
          type="email"
          placeholder="PayPal email address"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="h-10 bg-background"
        />

        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={!email.trim()}
        >
          Save PayPal
        </Button>
      </div>
    </div>
  );
}

function BankPayout() {
  const [accountHolderName, setAccountHolderName] =
    useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] =
    useState("");

  return (
    <div>
      <h3 className="text-sm font-semibold">
        Bank Account
      </h3>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Add the bank account where you want to receive your
        seller earnings.
      </p>

      <div className="mt-4 max-w-md space-y-3">
        <Input
          placeholder="Account holder name"
          value={accountHolderName}
          onChange={(event) =>
            setAccountHolderName(event.target.value)
          }
          className="h-10 bg-background"
        />

        <Input
          placeholder="Bank name"
          value={bankName}
          onChange={(event) =>
            setBankName(event.target.value)
          }
          className="h-10 bg-background"
        />

        <Input
          placeholder="Account number"
          value={accountNumber}
          onChange={(event) =>
            setAccountNumber(event.target.value)
          }
          className="h-10 bg-background"
        />

        <Button
          type="button"
          size="sm"
          disabled={
            !accountHolderName.trim() ||
            !bankName.trim() ||
            !accountNumber.trim()
          }
        >
          Save Bank Account
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Account                                                             */
/* -------------------------------------------------------------------------- */

function DeleteAccountSettings() {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") return;

    setDeleting(true);

    // Account deletion should be handled by a secure server-side
    // endpoint / Supabase admin operation rather than deleting
    // the auth user directly from the browser.
    //
    // Example later:
    // await fetch("/api/account/delete", { method: "DELETE" });

    setDeleting(false);
  }

  return (
    <SettingsPanel
      title="Delete Account"
      description="Permanently remove your NiceConvo account."
    >
      <div className="max-w-xl">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">
            This action cannot be undone
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Deleting your account will permanently remove your
            account and associated data from NiceConvo.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Type DELETE to continue
            </label>

            <Input
              value={confirmText}
              onChange={(event) =>
                setConfirmText(event.target.value)
              }
              placeholder="DELETE"
              className="h-10 max-w-sm bg-background"
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-4"
            disabled={
              confirmText !== "DELETE" || deleting
            }
            onClick={handleDeleteAccount}
          >
            {deleting
              ? "Deleting..."
              : "Delete Account"}
          </Button>
        </div>
      </div>
    </SettingsPanel>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function SettingsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function StatusMessage({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  if (!message && !error) {
    return null;
  }

  return (
    <p
      className={[
        "text-sm",
        error
          ? "text-destructive"
          : "text-muted-foreground",
      ].join(" ")}
    >
      {error || message}
    </p>
  );
}