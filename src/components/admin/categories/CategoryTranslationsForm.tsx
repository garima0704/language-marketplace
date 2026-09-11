"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";

import { saveCategoryTranslations } from "@/app/actions/admin/category-translations";

type Locale = {
  code: string;
  name: string;
};

type Translation = {
  locale_code: string;
  name: string;
};

type CategoryTranslationsFormProps = {
  categoryId: string;
  categoryName: string;
  locales: Locale[];
  translations: Translation[];
};

export default function CategoryTranslationsForm({
  categoryId,
  categoryName,
  locales,
  translations,
}: CategoryTranslationsFormProps) {
  const router = useRouter();

  const translationMap = new Map(
    translations.map((translation) => [
      translation.locale_code,
      translation.name,
    ])
  );

  const editableLocales = locales.filter(
    (locale) => locale.code !== "en"
  );

  const [values, setValues] = useState<
    Record<string, string>
  >(() => {
    const initialValues: Record<string, string> = {};

    for (const locale of editableLocales) {
      initialValues[locale.code] =
        translationMap.get(locale.code) ?? "";
    }

    return initialValues;
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const translatedCount = editableLocales.filter(
    (locale) =>
      values[locale.code]?.trim().length > 0
  ).length;

  const totalTranslated =
    translatedCount +
    (translationMap.has("en") ? 1 : 0);

  function updateValue(
    localeCode: string,
    value: string
  ) {
    setValues((current) => ({
      ...current,
      [localeCode]: value,
    }));

    setSuccess(false);
    setError("");
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    startTransition(async () => {
      const result =
        await saveCategoryTranslations(
          categoryId,
          editableLocales.map((locale) => ({
            localeCode: locale.code,
            name: values[locale.code] ?? "",
          }))
        );

      if (!result.success) {
        setError(
          result.error ??
            "Unable to save translations."
        );
        return;
      }

      setSuccess(true);
      router.push("/admin/categories");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background"
    >
      {/* --------------------------------------------------
          Header
      -------------------------------------------------- */}

      <div className="border-b border-border px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Category Translations
            </h2>

            <p className="mt-1 text-sm text-muted">
              Add translations for{" "}
              <span className="font-medium text-foreground">
                {categoryName}
              </span>
              .
            </p>
          </div>

          <div className="rounded-lg bg-muted-bg px-3 py-2 text-sm text-muted">
            <span className="font-medium text-foreground">
              {totalTranslated}
            </span>
            /{locales.length} languages
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* --------------------------------------------------
            English master
        -------------------------------------------------- */}

        <div className="rounded-lg border border-border bg-muted-bg p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-foreground">
              English
            </label>

            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted">
              Master
            </span>
          </div>

          <input
            type="text"
            value={categoryName}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted outline-none"
          />

          <p className="mt-2 text-xs text-muted">
            Edit the English name from the Edit Category page.
          </p>
        </div>

        {/* --------------------------------------------------
            Other languages
        -------------------------------------------------- */}

        {editableLocales.map((locale) => {
          const hasTranslation =
            values[locale.code]?.trim().length > 0;

          return (
            <div key={locale.code}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor={`translation-${locale.code}`}
                  className="text-sm font-medium text-foreground"
                >
                  {locale.name}
                </label>

                {hasTranslation && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <Check className="h-3.5 w-3.5" />
                    Translated
                  </span>
                )}
              </div>

              <input
                id={`translation-${locale.code}`}
                type="text"
                value={values[locale.code] ?? ""}
                onChange={(event) =>
                  updateValue(
                    locale.code,
                    event.target.value
                  )
                }
                placeholder={`Enter ${locale.name} translation`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>
          );
        })}

        {/* --------------------------------------------------
            Messages
        -------------------------------------------------- */}

        {error && (
          <div className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground">
            Translations saved successfully.
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          Footer
      -------------------------------------------------- */}

      <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Leave a translation empty if it is not available yet.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/categories")
            }
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {isPending
              ? "Saving..."
              : "Save Translations"}
          </button>
        </div>
      </div>
    </form>
  );
}