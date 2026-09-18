"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

type Locale = {
  code: string;
  name: string;
};

type Props = {
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
  { value: "notifications", label: "Notifications" },
  { value: "errors", label: "Error Messages" },
  { value: "validation", label: "Form Validation" },
  { value: "footer", label: "Footer" },
];

function createKeyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function TranslationForm({ locales }: Props) {
  const router = useRouter();

  const [section, setSection] = useState("common");
  const [name, setName] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>(
    {}
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const translationKey = useMemo(() => {
    const namePart = createKeyPart(name);

    if (!namePart) {
      return "";
    }

    return `${section}.${namePart}`;
  }, [section, name]);

  function updateTranslation(localeCode: string, value: string) {
    setTranslations((current) => ({
      ...current,
      [localeCode]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a translation name.");
      return;
    }

    if (!englishText.trim()) {
      setError("Please enter the English text.");
      return;
    }

    if (!translationKey) {
      setError("Unable to generate a translation key.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          translation_key: translationKey,
          section,
          name: name.trim(),
          englishText: englishText.trim(),
          translations,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save translation."
        );
      }

      router.push("/admin/translations");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save translation."
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* -------------------------------------------------- */}
      {/* Translation Details */}
      {/* -------------------------------------------------- */}

      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Translation Details
          </h2>

          <p className="mt-1 text-sm text-muted">
            Define where this text is used and give it a clear name.
          </p>
        </div>

        <div className="space-y-5">
          {/* Section */}

          <div>
            <label
              htmlFor="section"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Section
            </label>

            <select
              id="section"
              value={section}
              onChange={(event) => setSection(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground"
            >
              {sections.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Translation Name */}

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
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Welcome message"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
            />

            <p className="mt-2 text-xs text-muted">
              Use a short name that helps administrators identify this
              translation later.
            </p>
          </div>

          {/* Generated Key */}

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
              {translationKey ? (
                <code className="text-foreground">
                  {translationKey}
                </code>
              ) : (
                <span className="text-muted">
                  Enter a translation name to generate the key
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-muted">
              This key is generated automatically and is used by the
              application.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Default Text */}
      {/* -------------------------------------------------- */}

      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Default Text
          </h2>

          <p className="mt-1 text-sm text-muted">
            Enter the English text that will be used as the default
            language.
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
            onChange={(event) => setEnglishText(event.target.value)}
            placeholder="e.g. Welcome to NiceConvo"
            rows={3}
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
          />
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Translations */}
      {/* -------------------------------------------------- */}

      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Translations
          </h2>

          <p className="mt-1 text-sm text-muted">
            Add the translated text for each active language. You can
            leave a language empty and add it later.
          </p>
        </div>

        <div className="space-y-5">
          {locales
            .filter((locale) => locale.code !== "en")
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
                  value={translations[locale.code] ?? ""}
                  onChange={(event) =>
                    updateTranslation(
                      locale.code,
                      event.target.value
                    )
                  }
                  placeholder={`Enter ${locale.name} translation`}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted transition focus:border-foreground"
                />
              </div>
            ))}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------------------- */}

      {error && (
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Actions */}
      {/* -------------------------------------------------- */}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/translations")}
          disabled={saving}
          className="rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-light-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Translation
            </>
          )}
        </button>
      </div>
    </form>
  );
}