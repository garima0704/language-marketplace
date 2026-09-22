"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
};

type Language = {
  id: number;
  language_code: string;
  proficiency: string;
  is_native: boolean;
};

type AvailableLanguage = {
  code: string;
  name: string;
};

type PayoutMethod = "stripe" | "paypal" | "bank";

interface SellerOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  languages: Language[];
  availableLanguages: AvailableLanguage[];
}

const proficiencyOptions = [
  {
    value: "beginner",
    label: "Beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate",
  },
  {
    value: "advanced",
    label: "Advanced",
  },
  {
    value: "fluent",
    label: "Fluent",
  },
];

export default function SellerOnboardingDialog({
  open,
  onOpenChange,
  profile,
  languages: initialLanguages,
  availableLanguages,
}: SellerOnboardingDialogProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);

  const [languages, setLanguages] =
    useState<Language[]>(initialLanguages);

  const [showAddLanguage, setShowAddLanguage] =
    useState(false);

  const [languageCode, setLanguageCode] = useState("");
  const [proficiency, setProficiency] =
    useState("intermediate");
  const [isNative, setIsNative] = useState(false);

  const [bio, setBio] = useState(profile.bio ?? "");

  const [payoutMethod, setPayoutMethod] =
    useState<PayoutMethod>("stripe");

  const [paypalEmail, setPaypalEmail] =
    useState("");

  const [accountHolderName, setAccountHolderName] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [iban, setIban] =
    useState("");

  const [swiftCode, setSwiftCode] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const unusedLanguages =
    availableLanguages.filter(
      (language) =>
        !languages.some(
          (existing) =>
            existing.language_code ===
            language.code
        )
    );

  function resetAddLanguage() {
    setLanguageCode("");
    setProficiency("intermediate");
    setIsNative(false);
    setShowAddLanguage(false);
    setError(null);
  }

  async function handleAddLanguage() {
    setError(null);

    if (!languageCode) {
      setError("Please select a language.");
      return;
    }

    if (
      isNative &&
      languages.some(
        (language) => language.is_native
      )
    ) {
      setError(
        "You can only have one native language."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { data, error: insertError } =
      await supabase
        .from("profile_languages")
        .insert({
          profile_id: user.id,
          language_code: languageCode,
          proficiency,
          is_native: isNative,
        })
        .select(`
          id,
          language_code,
          proficiency,
          is_native
        `)
        .single();

    if (insertError) {
      setSaving(false);

      if (insertError.code === "23505") {
        setError(
          "This language has already been added."
        );
      } else {
        setError(insertError.message);
      }

      return;
    }

    setLanguages((current) => [
      ...current,
      data as Language,
    ]);

    resetAddLanguage();
    setSaving(false);
  }

  async function handleDeleteLanguage(
    id: number
  ) {
    setError(null);
    setSaving(true);

    const { error: deleteError } =
      await supabase
        .from("profile_languages")
        .delete()
        .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setLanguages((current) =>
      current.filter(
        (language) => language.id !== id
      )
    );

    setSaving(false);
  }

  async function handleUpdateProficiency(
    id: number,
    newProficiency: string
  ) {
    setError(null);

    const { error: updateError } =
      await supabase
        .from("profile_languages")
        .update({
          proficiency: newProficiency,
        })
        .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setLanguages((current) =>
      current.map((language) =>
        language.id === id
          ? {
              ...language,
              proficiency: newProficiency,
            }
          : language
      )
    );
  }

  async function handleSaveBio() {
    setError(null);

    if (!bio.trim()) {
      setError(
        "Please add a short bio so learners can understand you better."
      );

      return false;
    }

    setSaving(true);

    const { error: updateError } =
      await supabase
        .from("profiles")
        .update({
          bio: bio.trim(),
        })
        .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return false;
    }

    setSaving(false);

    return true;
  }

  /**
   * Stripe Connect
   *
   * This calls the server-side Stripe endpoint.
   * Stripe should create/retrieve the connected
   * account and return a Stripe Account Link URL.
   *
   * Do not create Stripe accounts or use the
   * Stripe secret key in this client component.
   */
  async function handleStripeConnect() {
    setError(null);
    setSaving(true);

    try {
      const response = await fetch(
        "/api/stripe/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to connect Stripe."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe onboarding URL was not returned."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect Stripe."
      );

      setSaving(false);
    }
  }

  /**
   * Save PayPal payout method.
   */
  async function handleSavePayPal() {
    setError(null);

    const email =
      paypalEmail.trim();

    if (!email) {
      setError(
        "Please enter your PayPal email."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error: payoutError } =
      await supabase
        .from("creator_payout_accounts")
        .insert({
          user_id: user.id,
          provider: "paypal",
          paypal_email: email,
          is_default: true,
          status: "pending",
        });

    if (payoutError) {
      setError(payoutError.message);
      setSaving(false);
      return;
    }

    const { error: creatorError } =
      await supabase
        .from("profiles")
        .update({
          is_creator: true,
        })
        .eq("id", profile.id);

    if (creatorError) {
      setError(creatorError.message);
      setSaving(false);
      return;
    }

    setSaving(false);

    onOpenChange(false);

    router.push("/seller/dashboard");
    router.refresh();
  }

  /**
   * Save bank payout method.
   */
  async function handleSaveBank() {
    setError(null);

    if (
      !accountHolderName.trim() ||
      !bankName.trim() ||
      !accountNumber.trim()
    ) {
      setError(
        "Please complete the required bank account details."
      );

      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error: payoutError } =
      await supabase
        .from("creator_payout_accounts")
        .insert({
          user_id: user.id,
          provider: "bank",
          account_holder_name:
            accountHolderName.trim(),
          bank_name:
            bankName.trim(),
          account_number:
            accountNumber.trim(),
          iban:
            iban.trim() || null,
          swift_code:
            swiftCode.trim() || null,
          is_default: true,
          status: "pending",
        });

    if (payoutError) {
      setError(payoutError.message);
      setSaving(false);
      return;
    }

    const { error: creatorError } =
      await supabase
        .from("profiles")
        .update({
          is_creator: true,
        })
        .eq("id", profile.id);

    if (creatorError) {
      setError(creatorError.message);
      setSaving(false);
      return;
    }

    setSaving(false);

    onOpenChange(false);

    router.push("/seller/dashboard");
    router.refresh();
  }

  /**
   * Handles the action for whichever
   * payout method the seller selected.
   */
  async function handleSavePayout() {
    setError(null);

    if (payoutMethod === "stripe") {
      await handleStripeConnect();
      return;
    }

    if (payoutMethod === "paypal") {
      await handleSavePayPal();
      return;
    }

    await handleSaveBank();
  }

  function handleClose(value: boolean) {
    if (!value) {
      setStep(1);
      setError(null);
      setShowAddLanguage(false);

      setLanguageCode("");
      setProficiency("intermediate");
      setIsNative(false);

      setPayoutMethod("stripe");

      setPaypalEmail("");

      setAccountHolderName("");
      setBankName("");
      setAccountNumber("");
      setIban("");
      setSwiftCode("");

      setSaving(false);
    }

    onOpenChange(value);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Become a Seller
          </DialogTitle>

          <DialogDescription>
            Set up the essentials you need to start
            sharing your language knowledge.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}

        <div className="mt-4 flex items-center">
          {[
            {
              number: 1,
              label: "Languages",
            },
            {
              number: 2,
              label: "Profile",
            },
            {
              number: 3,
              label: "Payout",
            },
          ].map((item, index) => (
            <div
              key={item.number}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    step >= item.number
                      ? "bg-black text-white"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {item.number}
                </div>

                <span
                  className={[
                    "hidden text-sm sm:block",
                    step >= item.number
                      ? "font-medium"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </div>

              {index < 2 && (
                <div className="mx-3 h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* =====================================================
            STEP 1 — LANGUAGES
        ====================================================== */}

        {step === 1 && (
          <div className="space-y-6">
            <div className="pt-2">
              <h3 className="text-lg font-semibold">
                Languages & Proficiency
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Tell learners which languages you know
                and your level of proficiency.
              </p>
            </div>

            {languages.length > 0 && (
              <div className="space-y-3">
                {languages.map((language) => (
                  <div
                    key={language.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {availableLanguages.find(
                            (availableLanguage) =>
                              availableLanguage.code ===
                              language.language_code
                          )?.name ??
                            language.language_code}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {language.is_native
                            ? "Native or Bilingual"
                            : proficiencyOptions.find(
                                (option) =>
                                  option.value ===
                                  language.proficiency
                              )?.label ??
                              language.proficiency}
                        </p>

                        {!language.is_native && (
                          <div className="mt-3">
                            <select
                              value={
                                language.proficiency
                              }
                              onChange={(event) =>
                                handleUpdateProficiency(
                                  language.id,
                                  event.target.value
                                )
                              }
                              className="h-9 w-full rounded-md border bg-background px-3 text-sm sm:w-64"
                            >
                              {proficiencyOptions.map(
                                (option) => (
                                  <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {language.is_native && (
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            Native
                          </span>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saving}
                          onClick={() =>
                            handleDeleteLanguage(
                              language.id
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {languages.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="font-medium">
                  No languages added yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add at least one language to continue.
                </p>
              </div>
            )}

            {/* Add language */}

            {showAddLanguage ? (
              <div className="rounded-xl border p-5">
                <h4 className="font-semibold">
                  Add a language
                </h4>

                <div className="mt-5 space-y-5">
                  <div className="space-y-2">
                    <Label>
                      Language
                    </Label>

                    <select
                      value={languageCode}
                      onChange={(event) =>
                        setLanguageCode(
                          event.target.value
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">
                        Select a language
                      </option>

                      {unusedLanguages.map(
                        (language) => (
                          <option
                            key={language.code}
                            value={language.code}
                          >
                            {language.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Proficiency
                    </Label>

                    <select
                      value={proficiency}
                      onChange={(event) =>
                        setProficiency(
                          event.target.value
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {proficiencyOptions.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isNative}
                      onChange={(event) =>
                        setIsNative(
                          event.target.checked
                        )
                      }
                    />

                    This is my native language
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={handleAddLanguage}
                  >
                    {saving
                      ? "Saving..."
                      : "Add Language"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={resetAddLanguage}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowAddLanguage(true)
                }
              >
                + Add Language
              </Button>
            )}

            {/* Footer */}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                disabled={
                  languages.length === 0 ||
                  saving
                }
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 2 — PROFILE
        ====================================================== */}

        {step === 2 && (
          <div className="space-y-6">
            <div className="pt-2">
              <h3 className="text-lg font-semibold">
                Your Profile
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                This is the information learners will see
                when they view your profile.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
                    {profile.display_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-semibold">
                    {profile.display_name}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>

                  {profile.country && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="seller-bio">
                  Bio
                </Label>

                <p className="mt-1 text-sm text-muted-foreground">
                  A short introduction helps learners
                  understand if you're the right match
                  for them.
                </p>

                <textarea
                  id="seller-bio"
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  placeholder="Tell learners a little about yourself..."
                  rows={5}
                  maxLength={500}
                  className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {bio.length}/500
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const saved =
                    await handleSaveBio();

                  if (saved) {
                    setStep(3);
                  }
                }}
              >
                {saving
                  ? "Saving..."
                  : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 3 — PAYOUT
        ====================================================== */}

        {step === 3 && (
          <div className="space-y-6">
            <div className="pt-2">
              <h3 className="text-lg font-semibold">
                Payout Setup
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose how you want to receive your
                earnings from NiceConvo.
              </p>
            </div>

            <div className="space-y-4">

              {/* =================================================
                  STRIPE
              ================================================== */}

              <div
                className={[
                  "rounded-xl border p-5 transition-colors",
                  payoutMethod === "stripe"
                    ? "border-black"
                    : "border-border",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setPayoutMethod("stripe");
                    setError(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          Stripe
                        </h4>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          Recommended
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Receive payouts securely
                        through Stripe.
                      </p>
                    </div>

                    <div
                      className={[
                        "mt-1 h-4 w-4 shrink-0 rounded-full border",
                        payoutMethod === "stripe"
                          ? "border-black bg-black"
                          : "border-muted-foreground",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {payoutMethod === "stripe" && (
                  <div className="mt-5 rounded-lg bg-light-bg p-4">
                    <p className="text-sm text-muted-foreground">
                      Stripe will securely collect
                      and verify your identity and
                      payout information. Your bank
                      details are handled by Stripe.
                    </p>

                    <Button
                      type="button"
                      className="mt-4"
                      disabled={saving}
                      onClick={
                        handleStripeConnect
                      }
                    >
                      {saving
                        ? "Connecting..."
                        : "Connect Stripe"}
                    </Button>
                  </div>
                )}
              </div>

              {/* =================================================
                  PAYPAL
              ================================================== */}

              <div
                className={[
                  "rounded-xl border p-5 transition-colors",
                  payoutMethod === "paypal"
                    ? "border-black"
                    : "border-border",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setPayoutMethod("paypal");
                    setError(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">
                        PayPal
                      </h4>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Receive your earnings through
                        your PayPal account.
                      </p>
                    </div>

                    <div
                      className={[
                        "mt-1 h-4 w-4 shrink-0 rounded-full border",
                        payoutMethod === "paypal"
                          ? "border-black bg-black"
                          : "border-muted-foreground",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {payoutMethod === "paypal" && (
                  <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypal-email">
                        PayPal Email
                      </Label>

                      <input
                        id="paypal-email"
                        type="email"
                        value={paypalEmail}
                        onChange={(event) =>
                          setPaypalEmail(
                            event.target.value
                          )
                        }
                        placeholder="you@example.com"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  BANK ACCOUNT
              ================================================== */}

              <div
                className={[
                  "rounded-xl border p-5 transition-colors",
                  payoutMethod === "bank"
                    ? "border-black"
                    : "border-border",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setPayoutMethod("bank");
                    setError(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">
                        Bank Account
                      </h4>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Receive your earnings directly
                        into your bank account.
                      </p>
                    </div>

                    <div
                      className={[
                        "mt-1 h-4 w-4 shrink-0 rounded-full border",
                        payoutMethod === "bank"
                          ? "border-black bg-black"
                          : "border-muted-foreground",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {payoutMethod === "bank" && (
                  <div className="mt-5 space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="account-holder-name">
                        Account Holder Name
                      </Label>

                      <input
                        id="account-holder-name"
                        value={accountHolderName}
                        onChange={(event) =>
                          setAccountHolderName(
                            event.target.value
                          )
                        }
                        placeholder="Full name"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank-name">
                        Bank Name
                      </Label>

                      <input
                        id="bank-name"
                        value={bankName}
                        onChange={(event) =>
                          setBankName(
                            event.target.value
                          )
                        }
                        placeholder="Bank name"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-number">
                        Account Number
                      </Label>

                      <input
                        id="account-number"
                        type="password"
                        value={accountNumber}
                        onChange={(event) =>
                          setAccountNumber(
                            event.target.value
                          )
                        }
                        placeholder="Account number"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iban">
                        IBAN
                      </Label>

                      <input
                        id="iban"
                        value={iban}
                        onChange={(event) =>
                          setIban(
                            event.target.value
                          )
                        }
                        placeholder="IBAN"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="swift-code">
                        SWIFT Code
                      </Label>

                      <input
                        id="swift-code"
                        value={swiftCode}
                        onChange={(event) =>
                          setSwiftCode(
                            event.target.value
                          )
                        }
                        placeholder="SWIFT / BIC"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
              >
                Back
              </Button>

              {payoutMethod !== "stripe" && (
                <Button
                  type="button"
                  disabled={saving}
                  onClick={handleSavePayout}
                >
                  {saving
                    ? "Saving..."
                    : "Save & Continue"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}