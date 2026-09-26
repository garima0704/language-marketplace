import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Save } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { Input } from "@/components/ui/input";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  level: number;
  display_order: number;
  is_active: boolean;
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

export default async function CategoryTranslationsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  /*
   * CATEGORY
   */

  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select(
      "id, parent_id, slug, level, display_order, is_active"
    )
    .eq("id", id)
    .maybeSingle();

  if (categoryError) {
    console.error(
      "CATEGORY TRANSLATIONS CATEGORY FETCH ERROR:",
      categoryError
    );
  }

  if (!category) {
    notFound();
  }

  /*
   * ALL CATEGORIES
   *
   * Used to build the hierarchical
   * translation key.
   */

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select(
      "id, parent_id, slug, level, display_order, is_active"
    );

  if (categoriesError) {
    console.error(
      "CATEGORY TRANSLATIONS CATEGORIES ERROR:",
      categoriesError
    );
  }

  const categoryList =
    (categories ?? []) as Category[];

  const categoryMap = new Map<string, Category>();

  for (const item of categoryList) {
    categoryMap.set(item.id, item);
  }

  function getCategoryPath(
    currentCategory: Category
  ): string {
    const parts: string[] = [];

    let current: Category | undefined =
      currentCategory;

    while (current) {
      parts.unshift(current.slug);

      if (!current.parent_id) {
        break;
      }

      current = categoryMap.get(
        current.parent_id
      );
    }

    return parts.join(".");
  }

  const categoryPath = getCategoryPath(category);

  const translationKey =
    `category.${categoryPath}`;

  /*
   * ACTIVE LOCALES
   *
   * English is the source language, so it is
   * excluded from the translation inputs.
   */

  const {
    data: locales,
    error: localesError,
  } = await supabase
    .from("locales")
    .select(
      "code, name, is_active, display_order"
    )
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (localesError) {
    console.error(
      "CATEGORY TRANSLATIONS LOCALES ERROR:",
      localesError
    );
  }

  const translationLocales = (
    locales ?? []
  ).filter((locale) => locale.code !== "en");

  /*
   * EXISTING TRANSLATIONS
   */

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select("locale_code, value")
    .eq("translation_key", translationKey)
    .eq("section", "category")
    .eq("is_active", true);

  if (translationsError) {
    console.error(
      "CATEGORY TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  const translationMap: Record<
    string,
    string
  > = {};

  for (const translation of (translations ??
    []) as Translation[]) {
    translationMap[translation.locale_code] =
      translation.value;
  }

  /*
   * SAVE TRANSLATIONS
   */

  async function saveTranslations(
    formData: FormData
  ) {
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
        "SAVE CATEGORY TRANSLATIONS LOCALES ERROR:",
        activeLocalesError
      );

      throw new Error(
        "Unable to load active languages."
      );
    }

    const rows = (activeLocales ?? [])
      .filter((locale) => locale.code !== "en")
      .map((locale) => {
        const value = String(
          formData.get(
            `translation_${locale.code}`
          ) ?? ""
        ).trim();

        return {
          translation_key: translationKey,
          locale_code: locale.code,
          value,
          section: "category",
          is_active: true,
        };
      });

    if (rows.length > 0) {
      const { error } = await supabase
        .from("translations")
        .upsert(rows, {
          onConflict:
            "translation_key,locale_code",
        });

      if (error) {
        console.error(
          "SAVE CATEGORY TRANSLATIONS ERROR:",
          error
        );

        throw new Error(
          error.message ||
            "Unable to save category translations."
        );
      }
    }

    redirect("/admin/categories");
  }

  /*
   * ENGLISH SOURCE NAME
   */

  const englishName =
    translationMap.en ||
    category.slug;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/categories"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to Categories
          </Link>

          <div className="mt-5">
            <h1 className="text-xl font-semibold text-foreground">
              {englishName} Translations
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage how {englishName} is displayed
              in other languages.
            </p>
          </div>

          <form action={saveTranslations}>
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Category Name Translations
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Translate “{englishName}” for each
                  available language.
                </p>
              </div>

              <div className="p-5">
                {translationLocales.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted">
                      No other active languages are
                      available for translation.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {translationLocales.map(
                      (locale) => (
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
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                  <Link
                    href="/admin/categories"
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                  >
                    <Save className="h-4 w-4" />
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