import Link from "next/link";
import { Plus } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import CategoryStats from "@/components/admin/categories/CategoryStats";
import CategoryTree from "@/components/admin/categories/CategoryTree";

type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  level: number;
  display_order: number;
  is_active: boolean;
};

type Translation = {
  category_id: string;
  locale_code: string;
  name: string;
};

type TranslationRow = {
  translation_key: string;
  locale_code: string;
  value: string;
  name: string | null;
};

type Locale = {
  code: string;
  name: string;
  is_active: boolean;
};

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Categories
  // --------------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select(
        `
          id,
          parent_id,
          slug,
          level,
          display_order,
          is_active
        `
      )
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

  if (categoriesError) {
    console.error(
      "CATEGORIES FETCH ERROR:",
      categoriesError
    );

    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-xl border border-border bg-background p-6">
            <p className="text-sm text-muted">
              Unable to load categories.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Category translations
  // --------------------------------------------------

  const {
    data: translationRows,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      `
        translation_key,
        locale_code,
        value,
        name,
        is_active
      `
    )
    .eq("section", "category");

  if (translationsError) {
    console.error(
      "TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Supported locales
  // --------------------------------------------------

  const { data: locales, error: localesError } =
    await supabase
      .from("locales")
      .select("code, name, is_active")
      .order("name", { ascending: true });

  if (localesError) {
    console.error(
      "LOCALES FETCH ERROR:",
      localesError
    );
  }

  const categoryList = (categories ?? []) as Category[];

  const translationList =
    (translationRows ?? []) as TranslationRow[];

  const localeList = (locales ?? []) as Locale[];

  // --------------------------------------------------
  // Build category translation keys
  // --------------------------------------------------

  const categoryMap = new Map<string, Category>();

  for (const category of categoryList) {
    categoryMap.set(category.id, category);
  }

  const categoryKeyMap = new Map<string, string>();

  function getCategoryPath(category: Category): string {
    const parts: string[] = [];

    let current: Category | undefined = category;

    while (current) {
      parts.unshift(current.slug);

      if (!current.parent_id) {
        break;
      }

      current = categoryMap.get(current.parent_id);
    }

    return parts.join(".");
  }

  for (const category of categoryList) {
    categoryKeyMap.set(
      category.id,
      `category.${getCategoryPath(category)}`
    );
  }

  // --------------------------------------------------
  // Convert translations into CategoryTree format
  // --------------------------------------------------

  const keyToCategoryId = new Map<string, string>();

  for (const [categoryId, translationKey] of categoryKeyMap) {
    keyToCategoryId.set(
      translationKey,
      categoryId
    );
  }

  const categoryTranslations: Translation[] = [];

  for (const translation of translationList) {
    const categoryId = keyToCategoryId.get(
      translation.translation_key
    );

    if (!categoryId) {
      continue;
    }

    categoryTranslations.push({
      category_id: categoryId,
      locale_code: translation.locale_code,
      name:
        translation.value ||
        translation.name ||
        "",
    });
  }

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const totalCategories = categoryList.length;

  const mainCategories = categoryList.filter(
    (category) => category.parent_id === null
  ).length;

  const activeCategories = categoryList.filter(
    (category) => category.is_active
  ).length;

  const inactiveCategories = categoryList.filter(
    (category) => !category.is_active
  ).length;

  // --------------------------------------------------
  // Active translation languages
  // --------------------------------------------------

  const activeLocales = localeList.filter(
    (locale) => locale.is_active
  );

  const totalLanguages = activeLocales.length;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Categories
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage the master category structure and translations.
            </p>
          </div>

          <Link
            href="/admin/categories/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Category
          </Link>
        </div>

        {/* Stats */}

        <div className="mb-6">
          <CategoryStats
            totalCategories={totalCategories}
            mainCategories={mainCategories}
            activeCategories={activeCategories}
            inactiveCategories={inactiveCategories}
          />
        </div>

        {/* Category Tree */}

        <CategoryTree
          categories={categoryList}
          translations={categoryTranslations}
          totalLanguages={totalLanguages}
        />
      </div>
    </main>
  );
}