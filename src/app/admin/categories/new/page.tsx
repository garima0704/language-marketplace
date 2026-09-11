import { requireAdmin } from "@/lib/auth/admin";
import CategoryForm from "@/components/admin/categories/CategoryForm";

export default async function NewCategoryPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch categories
  // --------------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, parent_id, level, display_order")
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

  if (categoriesError) {
    console.error(
      "NEW CATEGORY PARENT FETCH ERROR:",
      categoriesError
    );
  }

  // --------------------------------------------------
  // Fetch English translations
  // --------------------------------------------------

  const { data: translations, error: translationsError } =
    await supabase
      .from("category_translations")
      .select("category_id, locale_code, name")
      .eq("locale_code", "en");

  if (translationsError) {
    console.error(
      "NEW CATEGORY TRANSLATION FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Create translation map
  // --------------------------------------------------

  const translationMap = new Map(
    (translations ?? []).map((translation) => [
      translation.category_id,
      translation.name.trim(),
    ])
  );

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
    typeof categories
  >();

  for (const category of categories ?? []) {
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
    const children = childrenMap.get(parentId) ?? [];

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
      addCategories(category.id, depth + 1);
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