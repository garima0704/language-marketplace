import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import CategoryForm from "@/components/admin/categories/CategoryForm";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
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
        "id, parent_id, level, display_order, is_active"
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
        "id, parent_id, level, display_order"
      )
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

  if (categoriesError) {
    console.error(
      "EDIT CATEGORY PARENT FETCH ERROR:",
      categoriesError
    );
  }

  // --------------------------------------------------
  // Fetch English translations
  // --------------------------------------------------

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("category_translations")
    .select(
      "category_id, locale_code, name"
    )
    .eq("locale_code", "en");

  if (translationsError) {
    console.error(
      "EDIT CATEGORY TRANSLATION FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Create English translation map
  // --------------------------------------------------

  const translationMap = new Map(
    (translations ?? []).map((translation) => [
      translation.category_id,
      translation.name.trim(),
    ])
  );

  // --------------------------------------------------
  // Find descendants
  //
  // A category cannot be moved under itself
  // or under one of its children.
  // --------------------------------------------------

  const descendantIds = new Set<string>();

  const findDescendants = (parentId: string) => {
    for (const item of categories ?? []) {
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

  const parentOptions = (categories ?? [])
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