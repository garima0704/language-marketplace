import { requireAdmin } from "@/lib/auth/admin";
import CategoryForm from "@/components/admin/categories/CategoryForm";

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

export default async function NewCategoryPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch categories
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
      "NEW CATEGORY PARENT FETCH ERROR:",
      categoriesError
    );
  }

  const categoryList = (categories ?? []) as Category[];

  // --------------------------------------------------
  // Create category map
  // --------------------------------------------------

  const categoryMap = new Map<string, Category>();

  for (const category of categoryList) {
    categoryMap.set(category.id, category);
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
    category: Category
  ): string {
    const parts: string[] = [];
    let current: Category | undefined = category;

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

  for (const category of categoryList) {
    categoryKeyMap.set(
      category.id,
      `category.${getCategoryPath(category)}`
    );
  }

  // --------------------------------------------------
  // Fetch English translations
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
      "NEW CATEGORY TRANSLATION FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Create English translation map
  // --------------------------------------------------

  const translationMap = new Map<string, string>();

  for (const translation of (translations ??
    []) as TranslationRow[]) {
    const categoryId = categoryKeyMap.entries().find(
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
  // Create children map
  //
  // parent_id -> children
  //
  // null -> top-level categories
  // category A -> children of category A
  // --------------------------------------------------

  const childrenMap = new Map<
    string | null,
    Category[]
  >();

  for (const category of categoryList) {
    const parentId = category.parent_id;

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }

    childrenMap.get(parentId)!.push(category);
  }

  // --------------------------------------------------
  // Build hierarchical parent options
  // --------------------------------------------------

  const parentOptions: {
    id: string;
    name: string;
    level: number;
    depth: number;
  }[] = [];

  function addCategories(
    parentId: string | null,
    depth: number
  ) {
    const children =
      childrenMap.get(parentId) ?? [];

    for (const category of children) {
      // Level 4 categories cannot have children,
      // so they should not appear as selectable parents.
      if (category.level < 4) {
        parentOptions.push({
          id: category.id,
          name:
            translationMap.get(category.id) ??
            "Unnamed Category",
          level: category.level,
          depth,
        });
      }

      // Continue through the hierarchy
      // to find children of this category.
      addCategories(
        category.id,
        depth + 1
      );
    }
  }

  // Start from top-level categories
  addCategories(null, 0);

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-3xl p-6">

        {/* Header */}

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Add Category
          </h1>

          <p className="mt-1 text-sm text-muted">
            Create a new category in the master English
            category structure.
          </p>
        </div>

        {/* Form */}

        <CategoryForm
          mode="create"
          parentOptions={parentOptions}
        />

      </div>
    </div>
  );
}