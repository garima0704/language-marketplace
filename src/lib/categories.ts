import { createClient } from "@/lib/supabase/server";

interface Category {
  id: string;
  slug: string;
  parent_id: string | null;
  level: number;
}

interface CategoryTranslation {
  category_id: string;
  name: string;
}

/**
 * Get category labels for multiple category IDs in one go.
 */
export async function getCategoryLabels(
  categoryIds: Array<string | null | undefined>
): Promise<Record<string, string>> {
  const validCategoryIds = [
    ...new Set(
      categoryIds.filter(
        (id): id is string => Boolean(id)
      )
    ),
  ];

  if (validCategoryIds.length === 0) {
    return {};
  }

  const supabase = await createClient();

  /* -------------------------------------------------------
     Get all categories
  ------------------------------------------------------- */

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select(`
        id,
        slug,
        parent_id,
        level
      `);

  if (categoriesError || !categories?.length) {
    console.error(
      "Failed to load categories:",
      categoriesError
    );

    return {};
  }

  /* -------------------------------------------------------
     Get English translations
  ------------------------------------------------------- */

  const { data: translations, error: translationsError } =
    await supabase
      .from("category_translations")
      .select(`
        category_id,
        name
      `)
      .eq("locale_code", "en");

  if (translationsError) {
    console.error(
      "Failed to load category translations:",
      translationsError
    );
  }

  /* -------------------------------------------------------
     Build lookup maps
  ------------------------------------------------------- */

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  const nameMap = new Map(
    (translations ?? []).map((translation) => [
      translation.category_id,
      translation.name,
    ])
  );

  /* -------------------------------------------------------
     Build labels
  ------------------------------------------------------- */

  const labels: Record<string, string> = {};

  for (const categoryId of validCategoryIds) {
    const current = categoryMap.get(categoryId);

    if (!current) {
      continue;
    }

    /* Find root category */

    let root = current;

    while (root.parent_id) {
      const parent = categoryMap.get(
        root.parent_id
      );

      if (!parent) {
        break;
      }

      root = parent;
    }

    const rootName =
      nameMap.get(root.id) ??
      formatCategorySlug(root.slug);

    const currentName =
      nameMap.get(current.id) ??
      formatCategorySlug(current.slug);

    labels[categoryId] =
      root.id === current.id
        ? rootName
        : `${rootName} - ${currentName}`;
  }

  return labels;
}

/**
 * Get a single category label.
 */
export async function getCategoryLabel(
  categoryId: string | null | undefined
) {
  if (!categoryId) {
    return "";
  }

  const labels = await getCategoryLabels([
    categoryId,
  ]);

  return labels[categoryId] ?? "";
}

function formatCategorySlug(
  value: string
) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}