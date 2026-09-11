import Link from "next/link";
import { Plus } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import CategoryStats from "@/components/admin/categories/CategoryStats";
import CategoryTree from "@/components/admin/categories/CategoryTree";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch categories
  // --------------------------------------------------

  const { data: categories, error: categoriesError } = await supabase
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
    console.error("CATEGORIES FETCH ERROR:", categoriesError);

    return (
      <div className="p-6">
        <div className="rounded-xl border border-border bg-background p-6">
          <p className="text-sm text-muted">
            Unable to load categories.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Fetch all translations
  //
  // IMPORTANT:
  // Do not use .in("category_id", categoryIds).
  // --------------------------------------------------

  const { data: translations, error: translationsError } =
    await supabase
      .from("category_translations")
      .select("category_id, locale_code, name");

  if (translationsError) {
    console.error(
      "TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Fetch supported locales
  // --------------------------------------------------

  const { data: locales, error: localesError } = await supabase
    .from("locales")
    .select("code, name")
    .order("name", { ascending: true });

  if (localesError) {
    console.error("LOCALES FETCH ERROR:", localesError);
  }

  const categoryList = categories ?? [];
  const translationList = translations ?? [];
  const localeList = locales ?? [];

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const totalCategories = categoryList.length;

  // Top-level master categories.
  // These are no longer language categories.
  const mainCategories = categoryList.filter(
    (category) => category.parent_id === null
  ).length;

  // --------------------------------------------------
  // Translation completeness
  // --------------------------------------------------

  const translationCounts = new Map<string, number>();

  for (const translation of translationList) {
    translationCounts.set(
      translation.category_id,
      (translationCounts.get(translation.category_id) ?? 0) + 1
    );
  }

  const fullyTranslated = categoryList.filter(
    (category) =>
      (translationCounts.get(category.id) ?? 0) >=
      localeList.length
  ).length;

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-7xl space-y-6 p-6">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>

        {/* Stats */}

        <CategoryStats
          totalCategories={totalCategories}
          mainCategories={mainCategories}
          fullyTranslated={fullyTranslated}
          totalLanguages={localeList.length}
        />

        {/* Category Tree */}

        <CategoryTree
          categories={categoryList}
          translations={translationList}
          totalLanguages={localeList.length}
        />
      </div>
    </div>
  );
}