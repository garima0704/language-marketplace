import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { Input } from "@/components/ui/input";

type PageProps = {
  params: Promise<{
    code: string;
  }>;
};

type Locale = {
  code: string;
  name: string;
  is_active: boolean;
  display_order: number;
};

type Translation = {
  locale_code: string;
  value: string;
};

export default async function LanguageTranslationsPage({
  params,
}: PageProps) {
  const { code } = await params;

  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch language
  // --------------------------------------------------

  const { data: language, error: languageError } =
    await supabase
      .from("locales")
      .select("code, name, is_active, display_order")
      .eq("code", code)
      .maybeSingle();

  if (languageError) {
    console.error(
      "LANGUAGE TRANSLATIONS LANGUAGE FETCH ERROR:",
      languageError
    );
  }

  if (!language) {
    notFound();
  }

  // --------------------------------------------------
  // Fetch active locales
  // --------------------------------------------------

  const { data: locales, error: localesError } =
    await supabase
      .from("locales")
      .select("code, name, is_active, display_order")
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (localesError) {
    console.error(
      "LANGUAGE TRANSLATIONS LOCALES FETCH ERROR:",
      localesError
    );
  }

  // Do not show the source language as its own translation.
  const translationLocales = (locales ?? []).filter(
    (locale) => locale.code !== "en"
  );

  // --------------------------------------------------
  // Fetch translations
  // Example:
  // language.en
  // language.es
  // --------------------------------------------------

  const translationKey = `language.${code}`;

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select("locale_code, value")
    .eq("translation_key", translationKey)
    .eq("section", "language")
    .eq("is_active", true);

  if (translationsError) {
    console.error(
      "LANGUAGE TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  const translationMap: Record<string, string> = {};

  for (const translation of (translations ??
    []) as Translation[]) {
    translationMap[translation.locale_code] =
      translation.value;
  }

  // --------------------------------------------------
  // Save translations
  // --------------------------------------------------

  async function saveTranslations(formData: FormData) {
    "use server";

    const { supabase } = await requireAdmin();

    const {
      data: activeLocales,
      error: activeLocalesError,
    } = await supabase
      .from("locales")
      .select("code")
      .eq("is_active", true);

    if (activeLocalesError) {
      console.error(
        "SAVE LANGUAGE TRANSLATIONS LOCALES ERROR:",
        activeLocalesError
      );

      throw new Error(
        "Unable to load active languages."
      );
    }

    // Do not save the source language.
    const rows = (activeLocales ?? [])
      .filter((locale) => locale.code !== code)
      .map((locale) => {
        const value = String(
          formData.get(
            `translation_${locale.code}`
          ) ?? ""
        ).trim();

        return {
          translation_key: `language.${code}`,
          locale_code: locale.code,
          value,
          section: "language",
          is_active: true,
        };
      });

    const { error } = await supabase
      .from("translations")
      .upsert(rows, {
        onConflict:
          "translation_key,locale_code",
      });

    if (error) {
      console.error(
        "SAVE LANGUAGE TRANSLATIONS ERROR:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to save language translations."
      );
    }

    redirect("/admin/languages");
  }

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/languages"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to Languages
          </Link>

          <div className="mt-5">
            <h1 className="text-xl font-semibold text-foreground">
              {language.name} Translations
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage how {language.name} is displayed
              in other languages.
            </p>
          </div>

          <form action={saveTranslations}>
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Language Name Translations
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Translate “{language.name}” for each
                  available language.
                </p>
              </div>

              <div className="p-5">
                <div className="divide-y divide-border">
                  {translationLocales.map((locale) => (
                    <div
                      key={locale.code}
                      className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[150px_1fr] sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {locale.name}
                        </p>

                        <p className="text-xs text-muted">
                          {locale.code}
                        </p>
                      </div>

                      <Input
                        name={`translation_${locale.code}`}
                        defaultValue={
                          translationMap[
                            locale.code
                          ] ?? ""
                        }
                        placeholder={`Enter ${locale.name} translation`}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-5">
                  <Link
                    href="/admin/languages"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}