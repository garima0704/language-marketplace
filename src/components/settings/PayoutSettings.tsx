"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SettingsPanel from "./SettingsPanel";

type PayoutMethodType =
  | "stripe"
  | "paypal"
  | "bank";

export default function PayoutSettings() {
  const [selectedMethod, setSelectedMethod] =
    useState<PayoutMethodType>("stripe");

  return (
    <SettingsPanel
      title="Payouts"
      description="Manage how you receive earnings from your NiceConvo sales."
    >
      <div className="max-w-2xl">
        <div className="space-y-3">
          <PayoutMethod
            title="Stripe"
            description="Recommended. Connect your Stripe account to receive payouts securely."
            selected={selectedMethod === "stripe"}
            onSelect={() => setSelectedMethod("stripe")}
          />

          <PayoutMethod
            title="PayPal"
            description="Receive your seller earnings through your PayPal account."
            selected={selectedMethod === "paypal"}
            onSelect={() => setSelectedMethod("paypal")}
          />

          <PayoutMethod
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

/* -------------------------------------------------------------------------- */
/* Payout Method                                                              */
/* -------------------------------------------------------------------------- */

function PayoutMethod({
  title,
  description,
  selected,
  onSelect,
}: {
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

/* -------------------------------------------------------------------------- */
/* Stripe                                                                     */
/* -------------------------------------------------------------------------- */

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
          data?.error || "Unable to connect Stripe."
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

/* -------------------------------------------------------------------------- */
/* PayPal                                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Bank Account                                                               */
/* -------------------------------------------------------------------------- */

function BankPayout() {
  const [accountHolderName, setAccountHolderName] =
    useState("");

  const [bankName, setBankName] =
    useState("");

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