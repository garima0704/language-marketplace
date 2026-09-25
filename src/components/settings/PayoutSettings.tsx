"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SettingsPanel from "./SettingsPanel";
import StatusMessage from "./StatusMessage";

type PayoutMethodType = "stripe" | "paypal" | "bank";

type PayoutAccount = {
  id: string;
  provider: PayoutMethodType;
  paypal_email: string | null;
  account_holder_name: string | null;
  bank_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  is_default: boolean;
  status: string;
};

type PayoutSettingsProps = {
  translations: Record<string, string>;
};

export default function PayoutSettings({
  translations,
}: PayoutSettingsProps) {
  const supabase = createClient();

  const t = (key: string, fallback: string) =>
    translations[key] ?? fallback;

  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [activeMethod, setActiveMethod] =
    useState<PayoutMethodType>("stripe");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayoutAccounts() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          t(
            "settings.must_be_logged_in",
            "You must be logged in."
          )
        );
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("creator_payout_accounts")
        .select(payoutAccountSelect)
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (fetchError) {
        setError(
          t(
            "settings.payout_load_error",
            "Unable to load your payout details."
          )
        );
        setLoading(false);
        return;
      }

      const payoutAccounts = (data ?? []) as PayoutAccount[];

      setAccounts(payoutAccounts);

      const defaultAccount = payoutAccounts.find(
        (account) => account.is_default
      );

      if (defaultAccount) {
        setActiveMethod(defaultAccount.provider);
      }

      setLoading(false);
    }

    loadPayoutAccounts();
  }, [supabase]);

  const getAccount = (provider: PayoutMethodType) =>
    accounts.find((account) => account.provider === provider);

  return (
    <SettingsPanel
      title={t("settings.payouts", "Payouts")}
      description={t(
        "settings.payouts_description",
        "Manage how you receive earnings from your NiceConvo sales."
      )}
    >
      <div className="space-y-6">
        <div className="grid gap-3">
          <PayoutMethodButton
            active={activeMethod === "stripe"}
            title={t("settings.stripe", "Stripe")}
            description={t(
              "settings.stripe_description",
              "Recommended. Connect your Stripe account to receive payouts securely."
            )}
            onClick={() => {
              setActiveMethod("stripe");
              setError("");
            }}
          />

          <PayoutMethodButton
            active={activeMethod === "paypal"}
            title={t("settings.paypal", "PayPal")}
            description={t(
              "settings.paypal_description",
              "Receive your seller earnings through your PayPal account."
            )}
            onClick={() => {
              setActiveMethod("paypal");
              setError("");
            }}
          />

          <PayoutMethodButton
            active={activeMethod === "bank"}
            title={t("settings.bank_account", "Bank Account")}
            description={t(
              "settings.bank_account_description",
              "Receive your seller earnings directly into your bank account."
            )}
            onClick={() => {
              setActiveMethod("bank");
              setError("");
            }}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t(
              "settings.loading_payouts",
              "Loading payout details..."
            )}
          </p>
        ) : (
          <>
            {activeMethod === "stripe" && (
              <StripePayout
                translations={translations}
                account={getAccount("stripe")}
              />
            )}

            {activeMethod === "paypal" && (
              <PaypalPayout
                translations={translations}
                account={getAccount("paypal")}
                onSaved={(account) => {
                  setAccounts((current) => {
                    const existing = current.find(
                      (item) => item.id === account.id
                    );

                    if (existing) {
                      return current.map((item) =>
                        item.id === account.id ? account : item
                      );
                    }

                    return [...current, account];
                  });
                }}
              />
            )}

            {activeMethod === "bank" && (
              <BankPayout
                translations={translations}
                account={getAccount("bank")}
                onSaved={(account) => {
                  setAccounts((current) => {
                    const existing = current.find(
                      (item) => item.id === account.id
                    );

                    if (existing) {
                      return current.map((item) =>
                        item.id === account.id ? account : item
                      );
                    }

                    return [...current, account];
                  });
                }}
              />
            )}
          </>
        )}

        {error && (
          <StatusMessage
            message=""
            error={error}
          />
        )}
      </div>
    </SettingsPanel>
  );
}

function PayoutMethodButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-foreground bg-light-bg"
          : "border-border hover:bg-light-bg",
      ].join(" ")}
    >
      <p className="text-sm font-medium">{title}</p>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </button>
  );
}

function StripePayout({
  translations,
  account,
}: {
  translations: Record<string, string>;
  account?: PayoutAccount;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = (key: string, fallback: string) =>
    translations[key] ?? fallback;

  async function handleConnect() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error("Stripe connection failed");
      }

      window.location.href = result.url;
    } catch {
      setError(
        t(
          "settings.stripe_connect_error",
          "Unable to connect Stripe. Please try again."
        )
      );
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div>
        <h3 className="text-sm font-semibold">
          {t("settings.stripe", "Stripe")}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t(
            "settings.stripe_connect_description",
            "Connect your Stripe account to receive your seller earnings securely."
          )}
        </p>
      </div>

      {account?.status === "active" && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            "settings.stripe_connected",
            "Your Stripe account is connected."
          )}
        </p>
      )}

      {error && (
        <StatusMessage
          message=""
          error={error}
        />
      )}

      <Button
        type="button"
        size="sm"
        className="mt-5"
        onClick={handleConnect}
        disabled={loading}
      >
        {loading
          ? t("settings.connecting", "Connecting...")
          : t("settings.connect_stripe", "Connect Stripe")}
      </Button>
    </div>
  );
}

function PaypalPayout({
  translations,
  account,
  onSaved,
}: {
  translations: Record<string, string>;
  account?: PayoutAccount;
  onSaved: (account: PayoutAccount) => void;
}) {
  const supabase = createClient();

  const t = (key: string, fallback: string) =>
    translations[key] ?? fallback;

  const [email, setEmail] = useState(
    account?.paypal_email ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(
        t(
          "settings.paypal_email_required",
          "Please enter your PayPal email address."
        )
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          t(
            "settings.must_be_logged_in",
            "You must be logged in."
          )
        );
        return;
      }

      const payload = {
        user_id: user.id,
        provider: "paypal",
        paypal_email: trimmedEmail,
        is_default: true,
        status: "pending",
      };

      const { data, error: saveError } = await supabase
        .from("creator_payout_accounts")
        .upsert(payload, {
          onConflict: "user_id,provider",
        })
        .select(payoutAccountSelect)
        .single();

      if (saveError) {
        throw saveError;
      }

      onSaved(data as PayoutAccount);

      setMessage(
        t(
          "settings.paypal_saved",
          "PayPal details saved successfully."
        )
      );
    } catch {
      setError(
        t(
          "settings.paypal_save_error",
          "Unable to save PayPal details. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div>
        <h3 className="text-sm font-semibold">
          {t("settings.paypal", "PayPal")}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t(
            "settings.paypal_email_description",
            "Enter the PayPal email address where you want to receive your seller earnings."
          )}
        </p>
      </div>

      <div className="mt-5">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t(
            "settings.paypal_email_placeholder",
            "PayPal email address"
          )}
        />
      </div>

      <StatusMessage
        message={message}
        error={error}
      />

      <Button
        type="button"
        size="sm"
        className="mt-5"
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? t("settings.saving", "Saving...")
          : t("settings.save_paypal", "Save PayPal")}
      </Button>
    </div>
  );
}

function BankPayout({
  translations,
  account,
  onSaved,
}: {
  translations: Record<string, string>;
  account?: PayoutAccount;
  onSaved: (account: PayoutAccount) => void;
}) {
  const supabase = createClient();

  const t = (key: string, fallback: string) =>
    translations[key] ?? fallback;

  const [accountHolderName, setAccountHolderName] =
    useState(account?.account_holder_name ?? "");

  const [bankName, setBankName] = useState(
    account?.bank_name ?? ""
  );

  const [accountNumber, setAccountNumber] = useState(
    account?.account_number ?? ""
  );

  const [iban, setIban] = useState(
    account?.iban ?? ""
  );

  const [swiftCode, setSwiftCode] = useState(
    account?.swift_code ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setMessage("");
    setError("");

    if (
      !accountHolderName.trim() ||
      !bankName.trim() ||
      !accountNumber.trim()
    ) {
      setError(
        t(
          "settings.bank_details_required",
          "Please enter the account holder name, bank name, and account number."
        )
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          t(
            "settings.must_be_logged_in",
            "You must be logged in."
          )
        );
        return;
      }

      const payload = {
        user_id: user.id,
        provider: "bank",
        account_holder_name: accountHolderName.trim(),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        iban: iban.trim() || null,
        swift_code: swiftCode.trim() || null,
        is_default: true,
        status: "pending",
      };

      const { data, error: saveError } = await supabase
        .from("creator_payout_accounts")
        .upsert(payload, {
          onConflict: "user_id,provider",
        })
        .select(payoutAccountSelect)
        .single();

      if (saveError) {
        throw saveError;
      }

      onSaved(data as PayoutAccount);

      setMessage(
        t(
          "settings.bank_details_saved",
          "Bank details saved successfully."
        )
      );
    } catch {
      setError(
        t(
          "settings.bank_details_save_error",
          "Unable to save bank details. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div>
        <h3 className="text-sm font-semibold">
          {t("settings.bank_account", "Bank Account")}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t(
            "settings.bank_account_description",
            "Enter the bank account details where you want to receive your seller earnings."
          )}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <Input
          value={accountHolderName}
          onChange={(event) =>
            setAccountHolderName(event.target.value)
          }
          placeholder={t(
            "settings.account_holder_name",
            "Account holder name"
          )}
        />

        <Input
          value={bankName}
          onChange={(event) =>
            setBankName(event.target.value)
          }
          placeholder={t(
            "settings.bank_name",
            "Bank name"
          )}
        />

        <Input
          value={accountNumber}
          onChange={(event) =>
            setAccountNumber(event.target.value)
          }
          placeholder={t(
            "settings.account_number",
            "Account number"
          )}
        />

        <Input
          value={iban}
          onChange={(event) =>
            setIban(event.target.value)
          }
          placeholder={t(
            "settings.iban",
            "IBAN"
          )}
        />

        <Input
          value={swiftCode}
          onChange={(event) =>
            setSwiftCode(event.target.value)
          }
          placeholder={t(
            "settings.swift_code",
            "SWIFT code"
          )}
        />
      </div>

      <StatusMessage
        message={message}
        error={error}
      />

      <Button
        type="button"
        size="sm"
        className="mt-5"
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? t("settings.saving", "Saving...")
          : t(
              "settings.save_bank_details",
              "Save Bank Details"
            )}
      </Button>
    </div>
  );
}

const payoutAccountSelect = `
  id,
  provider,
  paypal_email,
  account_holder_name,
  bank_name,
  account_number,
  iban,
  swift_code,
  is_default,
  status
`;