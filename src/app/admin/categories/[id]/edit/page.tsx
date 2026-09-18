import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import CategoryForm from "@/components/admin/categories/CategoryForm";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Category = {
  id: string;
  parent_id: string | null;
  level: number;
  display_order: number;
  slug: string;
};

type TranslationRow = {
  translation_key: string;
  locale_code: string;
  value: string;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch category
  // --------------------------------------------------

  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select(
        "id, parent_id, level, display_order, is_active, slug"
      )
      .eq("id", id)
      .single();

  if (categoryError || !category) {
    notFound();
  }

  // --------------------------------------------------
  // Fetch all categories
  // --------------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select(
        "id, parent_id, level, display_order, slug"
      )
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

  if (categoriesError) {
    console.error(
      "EDIT CATEGORY PARENT FETCH ERROR:",
      categoriesError
    );
  }

  const categoryList = (categories ?? []) as Category[];

  // --------------------------------------------------
  // Build category map
  // --------------------------------------------------

  const categoryMap = new Map<string, Category>();

  for (const item of categoryList) {
    categoryMap.set(item.id, item);
  }

  // --------------------------------------------------
  // Build hierarchical translation keys
  //
  // Example:
  // category.technical
  // category.technical.business
  // category.technical.business.customer-service
  // --------------------------------------------------

  const categoryKeyMap = new Map<string, string>();

  function getCategoryPath(
    currentCategory: Category
  ): string {
    const parts: string[] = [];
    let current: Category | undefined = currentCategory;

    while (current) {
      parts.unshift(current.slug);

      if (!current.parent_id) {
        break;
      }

      current = categoryMap.get(current.parent_id);

      if (!current) {
        break;
      }
    }

    return parts.join(".");
  }

  for (const item of categoryList) {
    categoryKeyMap.set(
      item.id,
      `category.${getCategoryPath(item)}`
    );
  }

  // --------------------------------------------------
  // Fetch English category translations
  // --------------------------------------------------

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      "translation_key, locale_code, value"
    )
    .eq("section", "category")
    .eq("locale_code", "en")
    .eq("is_active", true);

  if (translationsError) {
    console.error(
      "EDIT CATEGORY TRANSLATION FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Create English translation map
  // --------------------------------------------------

  const translationMap = new Map<string, string>();

  for (const translation of (translations ??
    []) as TranslationRow[]) {
    const categoryId = [...categoryKeyMap.entries()].find(
      ([, translationKey]) =>
        translationKey === translation.translation_key
    )?.[0];

    if (!categoryId) {
      continue;
    }

    translationMap.set(
      categoryId,
      translation.value.trim()
    );
  }

  // --------------------------------------------------
  // Find descendants
  //
  // A category cannot be moved under itself
  // or under one of its children.
  // --------------------------------------------------

  const descendantIds = new Set<string>();

  const findDescendants = (parentId: string) => {
    for (const item of categoryList) {
      if (item.parent_id === parentId) {
        if (!descendantIds.has(item.id)) {
          descendantIds.add(item.id);
          findDescendants(item.id);
        }
      }
    }
  };

  findDescendants(id);

  // --------------------------------------------------
  // Build parent options
  // --------------------------------------------------

  const parentOptions = categoryList
    .filter((item) => item.id !== id)
    .filter((item) => !descendantIds.has(item.id))
    .filter((item) => item.level < 4)
    .map((item) => ({
      id: item.id,
      name:
        translationMap.get(item.id) ??
        "Unnamed Category",
      level: item.level,
    }));

  // --------------------------------------------------
  // Current English category name
  // --------------------------------------------------

  const englishName =
    translationMap.get(category.id) ?? "";

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-3xl space-y-6 p-6">

        {/* Header */}

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Edit Category
          </h1>

          <p className="mt-1 text-sm text-muted">
            Update the category details in the master
            English category structure.
          </p>
        </div>

        {/* Category Form */}

        <CategoryForm
          mode="edit"
          categoryId={category.id}
          initialName={englishName}
          initialParentId={category.parent_id}
          initialDisplayOrder={category.display_order}
          initialIsActive={category.is_active}
          parentOptions={parentOptions}
        />

      </div>
    </div>
  );
}