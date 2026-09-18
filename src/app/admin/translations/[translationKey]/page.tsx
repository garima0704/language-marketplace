import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  Pencil,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";

type PageProps = {
  params: Promise<{
    translationKey: string;
  }>;
};

type Locale = {
  code: string;
  name: string;
};

export default async function TranslationViewPage({
  params,
}: PageProps) {
  const { supabase } = await requireAdmin();

  const { translationKey } = await params;

  const decodedTranslationKey =
    decodeURIComponent(translationKey);

  // --------------------------------------------------
  // Fetch translation rows
  // --------------------------------------------------

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      "id, translation_key, name, section, locale_code, value, is_active"
    )
    .eq(
      "translation_key",
      decodedTranslationKey
    )
    .order("locale_code", {
      ascending: true,
    });

  if (translationsError) {
    console.error(
      "TRANSLATION VIEW ERROR:",
      translationsError
    );

    throw new Error(
      "Failed to load translation."
    );
  }

  if (
    !translations ||
    translations.length === 0
  ) {
    throw new Error(
      "Translation not found."
    );
  }

  // --------------------------------------------------
  // Fetch active languages
  // --------------------------------------------------

  const {
    data: locales,
    error: localesError,
  } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (localesError) {
    console.error(
      "TRANSLATION VIEW LOCALES ERROR:",
      localesError
    );
  }

  const localeRows: Locale[] = locales ?? [];

  // --------------------------------------------------
  // Translation information
  // --------------------------------------------------

  const englishTranslation =
    translations.find(
      (translation) =>
        translation.locale_code === "en"
    );

  const translatedRows =
    translations.filter(
      (translation) =>
        translation.locale_code !== "en"
    );

  const translationName =
    englishTranslation?.name ??
    translations[0]?.name ??
    decodedTranslationKey;

  const section =
    englishTranslation?.section ??
    translations[0]?.section ??
    "";

  const isActive = translations.every(
    (translation) => translation.is_active
  );

  const translatedCount =
    translatedRows.filter(
      (translation) =>
        translation.value?.trim()
    ).length;

  const totalTranslations =
    localeRows.filter(
      (locale) => locale.code !== "en"
    ).length;

  const isComplete =
    totalTranslations === 0 ||
    translatedCount >= totalTranslations;

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function formatSection(value: string) {
    return value
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }

  function getLanguageName(
    localeCode: string
  ) {
    return (
      localeRows.find(
        (locale) =>
          locale.code === localeCode
      )?.name ?? localeCode
    );
  }

  return (
    <main className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}

        <Link
          href="/admin/translations"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Translations
        </Link>

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {translationName}
            </h1>

            <p className="mt-1 text-sm text-muted">
              View translation details and language values.
            </p>
          </div>

          <Link
            href={`/admin/translations/${encodeURIComponent(
              decodedTranslationKey
            )}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Pencil className="h-4 w-4" />
            Edit Translation
          </Link>
        </div>

        {/* Translation Details */}

        <div className="rounded-xl border border-border bg-background">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Translation Details
            </h2>

            <p className="mt-1 text-sm text-muted">
              Information about this translation.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
            {/* Translation Name */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Translation
              </p>

              <p className="mt-2 text-sm font-medium text-foreground">
                {translationName}
              </p>
            </div>

            {/* Section */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Section
              </p>

              <p className="mt-2 text-sm text-foreground">
                {formatSection(section)}
              </p>
            </div>

            {/* Translation Key */}

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Translation Key
              </p>

              <code className="mt-2 block rounded-lg bg-light-bg px-4 py-3 text-sm text-foreground">
                {decodedTranslationKey}
              </code>
            </div>

            {/* Status */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </p>

              <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                {isActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </>
                ) : (
                  <>
                    <CircleOff className="h-4 w-4" />
                    Hidden
                  </>
                )}
              </div>
            </div>

            {/* Translation Progress */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Translation Progress
              </p>

              <p className="mt-2 text-sm text-foreground">
                {translatedCount} of{" "}
                {totalTranslations} translated
                {isComplete && (
                  <span className="ml-2 font-medium">
                    · Complete
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* English */}

        <div className="mt-6 rounded-xl border border-border bg-background">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              English
            </h2>

            <p className="mt-1 text-sm text-muted">
              Default language value.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="rounded-lg border border-border bg-light-bg px-4 py-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {englishTranslation?.value ||
                  "No English translation."}
              </p>
            </div>
          </div>
        </div>

        {/* Other Languages */}

        <div className="mt-6 rounded-xl border border-border bg-background">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              Translations
            </h2>

            <p className="mt-1 text-sm text-muted">
              Translated values for each language.
            </p>
          </div>

          <div className="divide-y divide-border">
            {translatedRows.length > 0 ? (
              translatedRows.map(
                (translation) => (
                  <div
                    key={translation.id}
                    className="px-6 py-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        {getLanguageName(
                          translation.locale_code
                        )}
                      </h3>

                      {!translation.value?.trim() && (
                        <span className="text-xs text-muted">
                          Not translated
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg border border-border bg-background px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {translation.value?.trim() ||
                          "No translation added yet."}
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-muted">
                  No additional language translations found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action */}

        <div className="mt-6 flex justify-end">
          <Link
            href={`/admin/translations/${encodeURIComponent(
              decodedTranslationKey
            )}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Pencil className="h-4 w-4" />
            Edit Translation
          </Link>
        </div>
      </div>
    </main>
  );
}