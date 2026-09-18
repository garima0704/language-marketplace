import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

interface Category {
  id: string;
  slug: string;
  parent_id: string | null;
  level: number;
}

export async function getCategoryLabels(
  categoryIds: Array<string | null | undefined>,
  locale = "en",
  includeParent = true
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

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
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
     Build category map
  ------------------------------------------------------- */

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category as Category,
    ])
  );

  /* -------------------------------------------------------
     Build hierarchical translation keys
  ------------------------------------------------------- */

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

      current = categoryMap.get(
        current.parent_id
      );
    }

    return parts.join(".");
  }

  for (const category of categories as Category[]) {
    const path = getCategoryPath(category);

    categoryKeyMap.set(
      category.id,
      `category.${path}`
    );
  }

  /* -------------------------------------------------------
     Get translations
  ------------------------------------------------------- */

  const translationKeys = validCategoryIds
    .map((categoryId) =>
      categoryKeyMap.get(categoryId)
    )
    .filter(
      (key): key is string => Boolean(key)
    );

  const translations = await getTranslations(
    translationKeys,
    locale
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

    /* ---------------------------------------------------
       Find root category
    --------------------------------------------------- */

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

    /* ---------------------------------------------------
       Translation keys
    --------------------------------------------------- */

    const rootKey = categoryKeyMap.get(root.id);
    const currentKey =
      categoryKeyMap.get(current.id);

    /* ---------------------------------------------------
       Root category name
    --------------------------------------------------- */

    const rootName =
      (rootKey && translations[rootKey]) ??
      formatCategorySlug(root.slug);

    /* ---------------------------------------------------
       Current category name
    --------------------------------------------------- */

    const currentName =
      (currentKey && translations[currentKey]) ??
      formatCategorySlug(current.slug);

    /* ---------------------------------------------------
       Final label
    --------------------------------------------------- */

    labels[categoryId] =
      includeParent && root.id !== current.id
        ? `${rootName} - ${currentName}`
        : currentName;
  }

  return labels;
}

/**
 * Get a single category label.
 */
export async function getCategoryLabel(
  categoryId: string | null | undefined,
  locale = "en"
): Promise<string> {
  if (!categoryId) {
    return "";
  }

  const labels = await getCategoryLabels(
    [categoryId],
    locale
  );

  return labels[categoryId] ?? "";
}

function formatCategorySlug(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}