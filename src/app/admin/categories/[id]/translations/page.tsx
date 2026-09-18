import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import CategoryTranslationsForm from "@/components/admin/categories/CategoryTranslationsForm";

type Category = {
  id: string;
  slug: string;
  parent_id: string | null;
};

type TranslationRow = {
  translation_key: string;
  locale_code: string;
  value: string;
};

export default async function CategoryTranslationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch current category
  // --------------------------------------------------

  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, slug, parent_id")
      .eq("id", id)
      .single();

  if (categoryError || !category) {
    notFound();
  }

  // --------------------------------------------------
  // Fetch category hierarchy
  // --------------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, slug, parent_id");

  if (categoriesError) {
    console.error(
      "CATEGORY HIERARCHY FETCH ERROR:",
      categoriesError
    );

    notFound();
  }

  const categoryList = (categories ?? []) as Category[];

  const categoryMap = new Map<string, Category>();

  for (const item of categoryList) {
    categoryMap.set(item.id, item);
  }

  // --------------------------------------------------
  // Build hierarchical translation key
  //
  // Example:
  // category.technical
  // category.technical.business
  // category.technical.business.customer-service
  // --------------------------------------------------

  const pathParts: string[] = [];
  let current: Category | undefined = category as Category;

  while (current) {
    pathParts.unshift(current.slug);

    if (!current.parent_id) {
      break;
    }

    current = categoryMap.get(current.parent_id);

    if (!current) {
      notFound();
    }
  }

  const translationKey = `category.${pathParts.join(".")}`;

  // --------------------------------------------------
  // Fetch category translations
  // --------------------------------------------------

  const { data: translations, error: translationsError } =
    await supabase
      .from("translations")
      .select(
        "translation_key, locale_code, value"
      )
      .eq("translation_key", translationKey)
      .eq("section", "category");

  if (translationsError) {
    console.error(
      "CATEGORY TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  const translationList =
    (translations ?? []) as TranslationRow[];

  // --------------------------------------------------
  // Fetch supported locales
  // --------------------------------------------------

  const { data: locales, error: localesError } =
    await supabase
      .from("locales")
      .select("code, name")
      .order("name");

  if (localesError) {
    console.error(
      "LOCALES FETCH ERROR:",
      localesError
    );
  }

  // --------------------------------------------------
  // English category name
  // --------------------------------------------------

  const englishTranslation = translationList.find(
    (translation) =>
      translation.locale_code === "en"
  );

  const categoryName =
    englishTranslation?.value?.trim() ??
    category.slug;

  // --------------------------------------------------
  // Keep the form's existing data shape
  // --------------------------------------------------

  const formTranslations = translationList.map(
    (translation) => ({
      category_id: id,
      locale_code: translation.locale_code,
      name: translation.value,
    })
  );

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-7xl space-y-6 p-6">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/categories"
              className="text-sm text-muted hover:text-foreground"
            >
              ← Back to Categories
            </Link>

            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Category Translations
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage translations for{" "}
              <span className="font-medium text-foreground">
                {categoryName}
              </span>
            </p>
          </div>

          <Link
            href={`/admin/categories/${id}/edit`}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted-bg"
          >
            Edit Category
          </Link>
        </div>

        {/* Translation Form */}

        <CategoryTranslationsForm
          categoryId={id}
          categoryName={categoryName}
          locales={locales ?? []}
          translations={formTranslations}
        />
      </div>
    </div>
  );
}