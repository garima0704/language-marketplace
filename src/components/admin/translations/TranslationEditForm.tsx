"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
} from "lucide-react";

type Locale = {
  code: string;
  name: string;
};

type Translation = {
  id: string;
  translation_key: string;
  name: string;
  section: string;
  locale_code: string;
  value: string;
  is_active: boolean;
};

type Props = {
  translationKey: string;
  translationName: string;
  section: string;
  translations: Translation[];
  locales: Locale[];
};

const sections = [
  { value: "common", label: "General / Common" },
  { value: "nav", label: "Navigation" },
  { value: "sidebar", label: "Sidebar" },
  { value: "auth", label: "Login & Signup" },
  { value: "home", label: "Home Page" },
  { value: "video", label: "Videos" },
  { value: "seller", label: "Seller Area" },
  { value: "profile", label: "Profile" },
  { value: "subscription", label: "Subscriptions" },
  { value: "payment", label: "Payments" },
  { value: "report", label: "Reports" },
  { value: "search", label: "Search" },
  {
    value: "notifications",
    label: "Notifications",
  },
  {
    value: "errors",
    label: "Error Messages",
  },
  {
    value: "validation",
    label: "Form Validation",
  },
  { value: "footer", label: "Footer" },
];

export default function TranslationEditForm({
  translationKey,
  translationName,
  section,
  translations,
  locales,
}: Props) {
  const router = useRouter();

  const englishTranslation =
    translations.find(
      (translation) =>
        translation.locale_code === "en"
    );

  const initialTranslations: Record<
    string,
    string
  > = {};

  for (const translation of translations) {
    initialTranslations[
      translation.locale_code
    ] = translation.value ?? "";
  }

  const [name, setName] =
    useState(translationName);

  const [selectedSection, setSelectedSection] =
    useState(section);

  const [englishText, setEnglishText] =
    useState(
      englishTranslation?.value ?? ""
    );

  const [translationValues, setTranslationValues] =
    useState<Record<string, string>>(
      initialTranslations
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  function updateTranslation(
    localeCode: string,
    value: string
  ) {
    setTranslationValues((current) => ({
      ...current,
      [localeCode]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Please enter a translation name."
      );
      return;
    }

    if (!englishText.trim()) {
      setError(
        "Please enter the English text."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/translations",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            translation_key: translationKey,
            name: name.trim(),
            section: selectedSection,
            englishText:
              englishText.trim(),
            translations:
              translationValues,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update translation."
        );
      }

      router.push("/admin/translations");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update translation."
      );

      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Translation Details
          </h2>

          <p className="mt-1 text-sm text-muted">
            Update the name and section for this
            translation.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="section"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Section
            </label>

            <select
              id="section"
              value={selectedSection}
              onChange={(event) =>
                setSelectedSection(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground"
            >
              {sections.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Translation Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="translation-key"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Translation Key
            </label>

            <div
              id="translation-key"
              className="rounded-lg border border-border bg-light-bg px-4 py-3 text-sm"
            >
              <code className="text-foreground">
                {translationKey}
              </code>
            </div>

            <p className="mt-2 text-xs text-muted">
              The translation key cannot be changed
              after creation.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Default Text
          </h2>

          <p className="mt-1 text-sm text-muted">
            Update the English default value.
          </p>
        </div>

        <div>
          <label
            htmlFor="english-text"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            English
          </label>

          <textarea
            id="english-text"
            value={englishText}
            onChange={(event) =>
              setEnglishText(event.target.value)
            }
            rows={3}
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Translations
          </h2>

          <p className="mt-1 text-sm text-muted">
            Update the translated value for each
            active language.
          </p>
        </div>

        <div className="space-y-5">
          {locales
            .filter(
              (locale) =>
                locale.code !== "en"
            )
            .map((locale) => (
              <div key={locale.code}>
                <label
                  htmlFor={`translation-${locale.code}`}
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  {locale.name}
                </label>

                <textarea
                  id={`translation-${locale.code}`}
                  value={
                    translationValues[
                      locale.code
                    ] ?? ""
                  }
                  onChange={(event) =>
                    updateTranslation(
                      locale.code,
                      event.target.value
                    )
                  }
                  placeholder={`Enter ${locale.name} translation`}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
                />
              </div>
            ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin/translations/${encodeURIComponent(
                translationKey
              )}`
            )
          }
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-light-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}