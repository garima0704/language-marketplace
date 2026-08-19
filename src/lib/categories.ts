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

interface CategoryWithTranslation extends Category {
  category_translations?: CategoryTranslation[];
}

/**
 * Get category label such as:
 *
 * English
 * English - Business
 * Spanish - Travel
 */
export async function getCategoryLabel(
  categoryId: string | null | undefined
) {
  if (!categoryId) return "";

  const supabase = await createClient();

  /* Get the selected category */
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      parent_id,
      level
    `);

  if (!categories?.length) {
    return "";
  }

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  /* Get English translations */
  const { data: translations } =
    await supabase
      .from("category_translations")
      .select(`
        category_id,
        name
      `)
      .eq("locale_code", "en");

  const nameMap = new Map(
    (translations ?? []).map((translation) => [
      translation.category_id,
      translation.name,
    ])
  );

  const current = categoryMap.get(categoryId);

  if (!current) {
    return "";
  }

  /* Find root category */
  let root = current;

  while (root.parent_id) {
    const parent = categoryMap.get(
      root.parent_id
    );

    if (!parent) break;

    root = parent;
  }

  const rootName =
    nameMap.get(root.id) ??
    formatCategorySlug(root.slug);

  const currentName =
    nameMap.get(current.id) ??
    formatCategorySlug(current.slug);

  if (root.id === current.id) {
    return rootName;
  }

  return `${rootName} - ${currentName}`;
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