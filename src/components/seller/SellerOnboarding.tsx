"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Language = {
  id: number;
  language_code: string;
  proficiency: string;
  is_native: boolean;
  locales: {
    code: string;
    name: string;
  } | null;
};

type AvailableLanguage = {
  code: string;
  name: string;
};

interface SellerOnboardingProps {
  languages: Language[];
  availableLanguages: AvailableLanguage[];
}

const proficiencyOptions = [
  {
    value: "beginner",
    label: "Basic",
  },
  {
    value: "intermediate",
    label: "Conversational",
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

export default function SellerOnboarding({
  languages: initialLanguages,
  availableLanguages,
}: SellerOnboardingProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);

  const [languages, setLanguages] =
    useState<Language[]>(initialLanguages);

  const [showAddLanguage, setShowAddLanguage] =
    useState(false);

  const [languageCode, setLanguageCode] =
    useState("");

  const [proficiency, setProficiency] =
    useState("intermediate");

  const [isNative, setIsNative] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const unusedLanguages = useMemo(() => {
    const existingCodes = new Set(
      languages.map((language) => language.language_code)
    );

    return availableLanguages.filter(
      (language) => !existingCodes.has(language.code)
    );
  }, [languages, availableLanguages]);

  async function handleAddLanguage() {
    setError(null);

    if (!languageCode) {
      setError("Please select a language.");
      return;
    }

    if (isNative) {
      const alreadyHasNative = languages.some(
        (language) => language.is_native
      );

      if (alreadyHasNative) {
        setError(
          "You can only have one native language."
        );
        return;
      }
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

    const { data, error: insertError } = await supabase
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
        is_native,
        locales (
          code,
          name
        )
      `)
      .single();

    if (insertError) {
      setSaving(false);

      if (
        insertError.code === "23505"
      ) {
        setError(
          "You have already added this language."
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

    setLanguageCode("");
    setProficiency("intermediate");
    setIsNative(false);
    setShowAddLanguage(false);
    setSaving(false);
  }

  async function handleDeleteLanguage(id: number) {
    setError(null);
    setSaving(true);

    const { error: deleteError } = await supabase
      .from("profile_languages")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setLanguages((current) =>
      current.filter((language) => language.id !== id)
    );

    setSaving(false);
  }

  async function handleUpdateProficiency(
    id: number,
    newProficiency: string
  ) {
    setError(null);

    const { error: updateError } = await supabase
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}

      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          Become a Seller
        </h1>

        <p className="mt-2 text-muted-foreground">
          Set up your seller profile and start sharing
          your language knowledge.
        </p>
      </div>

      {/* Progress */}

      <div className="mb-8 flex items-center gap-3">
        {[1, 2, 3, 4].map((number) => (
          <div
            key={number}
            className="flex items-center gap-3"
          >
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                step >= number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {number}
            </div>

            {number < 4 && (
              <div className="h-px w-8 bg-border sm:w-16" />
            )}
          </div>
        ))}
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* STEP 1 */}

      {step === 1 && (
        <Card className="rounded-2xl p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">
              Languages & Proficiency
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add the languages you know and tell
              learners about your proficiency.
            </p>
          </div>

          {/* Existing languages */}

          {languages.length > 0 && (
            <div className="mt-8 space-y-3">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {language.locales?.name ??
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
                    </div>

                    {language.is_native && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        Native
                      </span>
                    )}
                  </div>

                  {/* Edit */}

                  {!language.is_native && (
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">
                        Proficiency
                      </Label>

                      <select
                        value={language.proficiency}
                        onChange={(event) =>
                          handleUpdateProficiency(
                            language.id,
                            event.target.value
                          )
                        }
                        className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm md:w-64"
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
                  )}

                  {/* Delete */}

                  <div className="mt-4">
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
              ))}
            </div>
          )}

          {/* Empty state */}

          {languages.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed p-6 text-center">
              <p className="font-medium">
                You haven't added any languages yet.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add at least one language to continue.
              </p>
            </div>
          )}

          {/* Add language */}

          {showAddLanguage ? (
            <div className="mt-8 rounded-xl border p-5">
              <h3 className="font-semibold">
                Add a language
              </h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {/* Language */}

                <div className="space-y-2">
                  <Label htmlFor="language">
                    Language
                  </Label>

                  <select
                    id="language"
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

                {/* Proficiency */}

                <div className="space-y-2">
                  <Label htmlFor="proficiency">
                    Proficiency
                  </Label>

                  <select
                    id="proficiency"
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
              </div>

              {/* Native */}

              <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm">
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

              {/* Actions */}

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
                  onClick={() => {
                    setShowAddLanguage(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                setShowAddLanguage(true);
                setError(null);
              }}
            >
              + Add Language
            </Button>
          )}

          {/* Continue */}

          <div className="mt-10 flex justify-end border-t pt-6">
            <Button
              type="button"
              disabled={
                languages.length === 0 ||
                saving
              }
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <Card className="rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">
            Seller Profile
          </h2>

          <p className="mt-2 text-muted-foreground">
            Next, we'll set up the information learners
            see on your seller profile.
          </p>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              Back
            </Button>

            <Button>
              Continue
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}