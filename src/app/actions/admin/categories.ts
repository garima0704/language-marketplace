"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type CategoryInput = {
  name: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
};

type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

type CategoryNode = {
  id: string;
  parent_id: string | null;
  level: number;
  slug?: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDescendants(
  categoryId: string,
  categories: Array<{
    id: string;
    parent_id: string | null;
  }>
) {
  const descendants = new Set<string>();

  const findChildren = (parentId: string) => {
    for (const category of categories) {
      if (category.parent_id === parentId) {
        if (!descendants.has(category.id)) {
          descendants.add(category.id);
          findChildren(category.id);
        }
      }
    }
  };

  findChildren(categoryId);

  return descendants;
}

function getRelativeDepth(
  categoryId: string,
  categories: Array<{
    id: string;
    parent_id: string | null;
  }>
): number {
  const children = categories.filter(
    (category) => category.parent_id === categoryId
  );

  if (children.length === 0) {
    return 0;
  }

  return (
    1 +
    Math.max(
      ...children.map((child) =>
        getRelativeDepth(child.id, categories)
      )
    )
  );
}

/**
 * Build the hierarchical translation key for a category.
 *
 * Examples:
 *
 * category.business
 * category.technical
 * category.technical.business
 * category.technical.business.customer-service
 */
function getCategoryTranslationKey(
  categoryId: string,
  categories: CategoryNode[]
): string | null {
  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  const parts: string[] = [];

  let current =
    categoryMap.get(categoryId);

  const visited = new Set<string>();

  while (current) {
    if (visited.has(current.id)) {
      return null;
    }

    visited.add(current.id);

    if (!current.slug) {
      return null;
    }

    parts.unshift(current.slug);

    if (!current.parent_id) {
      break;
    }

    current =
      categoryMap.get(current.parent_id);
  }

  if (parts.length === 0) {
    return null;
  }

  return `category.${parts.join(".")}`;
}

/**
 * Fetch all categories required to build hierarchical
 * translation keys.
 */
async function getAllCategories(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, level, slug");

  if (error) {
    console.error(
      "FETCH CATEGORIES ERROR:",
      error
    );

    return {
      categories: [] as CategoryNode[],
      error,
    };
  }

  return {
    categories: (data ?? []) as CategoryNode[],
    error: null,
  };
}

export async function createCategory(
  input: CategoryInput
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const name = input.name.trim();

  if (!name) {
    return {
      success: false,
      error: "English category name is required.",
    };
  }

  const slug = slugify(name);

  if (!slug) {
    return {
      success: false,
      error:
        "A valid slug could not be generated from the category name.",
    };
  }

  // --------------------------------------------------
  // Calculate level
  // --------------------------------------------------

  let level = 1;

  if (input.parentId) {
    const { data: parent, error: parentError } =
      await supabase
        .from("categories")
        .select("id, level")
        .eq("id", input.parentId)
        .single();

    if (parentError || !parent) {
      return {
        success: false,
        error:
          "The selected parent category could not be found.",
      };
    }

    level = parent.level + 1;
  }

  if (level > 4) {
    return {
      success: false,
      error:
        "Categories can only be nested up to 4 levels.",
    };
  }

  // --------------------------------------------------
  // Create category
  // --------------------------------------------------

  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("categories")
    .insert({
      parent_id: input.parentId,
      slug,
      level,
      display_order: input.displayOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (categoryError || !category) {
    console.error(
      "CREATE CATEGORY ERROR:",
      categoryError
    );

    if (categoryError?.code === "23505") {
      return {
        success: false,
        error:
          "A category with this name already exists under the selected parent.",
      };
    }

    return {
      success: false,
      error: "Unable to create the category.",
    };
  }

  // --------------------------------------------------
  // Build translation key
  // --------------------------------------------------

  const { categories, error: categoriesError } =
    await getAllCategories(supabase);

  if (categoriesError) {
    await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    return {
      success: false,
      error:
        "Unable to build the category translation key.",
    };
  }

  const translationKey =
    getCategoryTranslationKey(
      category.id,
      categories
    );

  if (!translationKey) {
    await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    return {
      success: false,
      error:
        "Unable to create the category translation key.",
    };
  }

  // --------------------------------------------------
  // Create English translation
  // --------------------------------------------------

  const { error: translationError } =
    await supabase
      .from("translations")
      .insert({
        translation_key: translationKey,
        locale_code: "en",
        value: name,
        section: "category",
        name,
        is_active: input.isActive,
      });

  if (translationError) {
    console.error(
      "CREATE CATEGORY TRANSLATION ERROR:",
      translationError
    );

    await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    return {
      success: false,
      error:
        "Unable to create the English category translation.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/translations");

  return {
    success: true,
    id: category.id,
  };
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const name = input.name.trim();

  if (!name) {
    return {
      success: false,
      error: "English category name is required.",
    };
  }

  const slug = slugify(name);

  if (!slug) {
    return {
      success: false,
      error:
        "A valid slug could not be generated from the category name.",
    };
  }

  // --------------------------------------------------
  // Fetch all categories
  // --------------------------------------------------

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select(
      "id, parent_id, level, slug"
    );

  if (categoriesError) {
    console.error(
      "FETCH CATEGORIES FOR UPDATE ERROR:",
      categoriesError
    );

    return {
      success: false,
      error:
        "Unable to validate the category hierarchy.",
    };
  }

  const categoryList =
    categories ?? [];

  const currentCategory =
    categoryList.find(
      (category) => category.id === id
    );

  if (!currentCategory) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  // --------------------------------------------------
  // Prevent category from becoming its own parent
  // --------------------------------------------------

  if (input.parentId === id) {
    return {
      success: false,
      error:
        "A category cannot be its own parent.",
    };
  }

  // --------------------------------------------------
  // Find descendants
  // --------------------------------------------------

  const descendants =
    getDescendants(
      id,
      categoryList
    );

  // --------------------------------------------------
  // Prevent circular hierarchy
  // --------------------------------------------------

  if (
    input.parentId &&
    descendants.has(input.parentId)
  ) {
    return {
      success: false,
      error:
        "A category cannot be moved inside one of its own child categories.",
    };
  }

  // --------------------------------------------------
  // Find new parent
  // --------------------------------------------------

  let newLevel = 1;

  if (input.parentId) {
    const parent =
      categoryList.find(
        (category) =>
          category.id === input.parentId
      );

    if (!parent) {
      return {
        success: false,
        error:
          "The selected parent category could not be found.",
      };
    }

    newLevel = parent.level + 1;
  }

  // --------------------------------------------------
  // Calculate maximum descendant depth
  // --------------------------------------------------

  const relativeDepth =
    getRelativeDepth(
      id,
      categoryList
    );

  if (
    newLevel + relativeDepth >
    4
  ) {
    return {
      success: false,
      error:
        "This move would create a category hierarchy deeper than 4 levels.",
    };
  }

  // --------------------------------------------------
  // Build the new hierarchy in memory
  // --------------------------------------------------

  const updatedParents =
    new Map<string, string | null>();

  for (const category of categoryList) {
    updatedParents.set(
      category.id,
      category.parent_id
    );
  }

  updatedParents.set(
    id,
    input.parentId
  );

  // --------------------------------------------------
  // Calculate levels using the new hierarchy
  // --------------------------------------------------

  const newLevels =
    new Map<string, number>();

  const calculateLevel = (
    categoryId: string
  ): number => {
    const existingLevel =
      newLevels.get(categoryId);

    if (existingLevel !== undefined) {
      return existingLevel;
    }

    if (categoryId === id) {
      newLevels.set(
        categoryId,
        newLevel
      );

      return newLevel;
    }

    const parentId =
      updatedParents.get(
        categoryId
      );

    if (
      parentId === null ||
      parentId === undefined
    ) {
      const originalCategory =
        categoryList.find(
          (category) =>
            category.id === categoryId
        );

      const level =
        originalCategory?.level ?? 1;

      newLevels.set(
        categoryId,
        level
      );

      return level;
    }

    const parentLevel =
      calculateLevel(parentId);

    const level =
      parentLevel + 1;

    newLevels.set(
      categoryId,
      level
    );

    return level;
  };

  calculateLevel(id);

  for (const descendantId of descendants) {
    calculateLevel(descendantId);
  }

  // --------------------------------------------------
  // Safety check
  // --------------------------------------------------

  for (const [
    categoryId,
    level,
  ] of newLevels) {
    if (level > 4) {
      return {
        success: false,
        error:
          "This move would create a category hierarchy deeper than 4 levels.",
      };
    }

    if (categoryId === id) {
      continue;
    }
  }

  // --------------------------------------------------
  // Build old translation key
  // --------------------------------------------------

  const oldTranslationKey =
    getCategoryTranslationKey(
      id,
      categoryList
    );

  // --------------------------------------------------
  // Update category
  // --------------------------------------------------

  const {
    error: updateError,
  } = await supabase
    .from("categories")
    .update({
      parent_id: input.parentId,
      slug,
      level: newLevel,
      display_order:
        input.displayOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (updateError) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      updateError
    );

    if (
      updateError.code ===
      "23505"
    ) {
      return {
        success: false,
        error:
          "A category with this slug already exists under the selected parent.",
      };
    }

    return {
      success: false,
      error:
        "Unable to update the category.",
    };
  }

  // --------------------------------------------------
  // Update descendant levels
  // --------------------------------------------------

  for (const descendantId of descendants) {
    const descendantLevel =
      newLevels.get(
        descendantId
      );

    if (
      descendantLevel ===
      undefined
    ) {
      continue;
    }

    const {
      error: descendantError,
    } = await supabase
      .from("categories")
      .update({
        level:
          descendantLevel,
      })
      .eq(
        "id",
        descendantId
      );

    if (descendantError) {
      console.error(
        "UPDATE DESCENDANT LEVEL ERROR:",
        descendantError
      );

      return {
        success: false,
        error:
          "The category was moved, but one or more child category levels could not be updated.",
      };
    }
  }

  // --------------------------------------------------
  // Re-fetch categories after hierarchy update
  // --------------------------------------------------

  const {
    categories: updatedCategoryList,
    error:
      updatedCategoriesError,
  } = await getAllCategories(
    supabase
  );

  if (updatedCategoriesError) {
    return {
      success: false,
      error:
        "The category was updated, but its translation key could not be rebuilt.",
    };
  }

  const newTranslationKey =
    getCategoryTranslationKey(
      id,
      updatedCategoryList
    );

  if (!newTranslationKey) {
    return {
      success: false,
      error:
        "The category was updated, but its translation key could not be generated.",
    };
  }

  // --------------------------------------------------
  // Update translation
  // --------------------------------------------------

  if (
    oldTranslationKey &&
    oldTranslationKey !==
      newTranslationKey
  ) {
    // Move the existing translations to
    // the new hierarchical key.
    const {
      data: existingTranslations,
      error:
        existingTranslationsError,
    } = await supabase
      .from("translations")
      .select(`
        id,
        locale_code,
        value,
        name,
        section,
        is_active
      `)
      .eq(
        "translation_key",
        oldTranslationKey
      );

    if (
      existingTranslationsError
    ) {
      console.error(
        "FETCH OLD CATEGORY TRANSLATIONS ERROR:",
        existingTranslationsError
      );

      return {
        success: false,
        error:
          "The category was updated, but its translations could not be moved.",
      };
    }

    if (
      existingTranslations &&
      existingTranslations.length > 0
    ) {
      const translationRows =
        existingTranslations.map(
          (translation) => ({
            translation_key:
              newTranslationKey,
            locale_code:
              translation.locale_code,
            value:
              translation.locale_code ===
              "en"
                ? name
                : translation.value,
            name:
              translation.locale_code ===
              "en"
                ? name
                : translation.name,
            section:
              "category",
            is_active:
              input.isActive &&
              translation.is_active,
            updated_at:
              new Date().toISOString(),
          })
        );

      const {
        error: upsertError,
      } = await supabase
        .from("translations")
        .upsert(
          translationRows,
          {
            onConflict:
              "translation_key,locale_code",
          }
        );

      if (upsertError) {
        console.error(
          "MOVE CATEGORY TRANSLATIONS ERROR:",
          upsertError
        );

        return {
          success: false,
          error:
            "The category was updated, but its translations could not be moved.",
        };
      }

      await supabase
        .from("translations")
        .delete()
        .eq(
          "translation_key",
          oldTranslationKey
        );
    }
  } else {
    // Same hierarchy/key. Update English
    // and visibility.
    const {
      error: translationError,
    } = await supabase
      .from("translations")
      .upsert(
        {
          translation_key:
            newTranslationKey,
          locale_code: "en",
          value: name,
          section: "category",
          name,
          is_active:
            input.isActive,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "translation_key,locale_code",
        }
      );

    if (translationError) {
      console.error(
        "UPDATE CATEGORY TRANSLATION ERROR:",
        translationError
      );

      return {
        success: false,
        error:
          "The category was updated, but the English name could not be saved.",
      };
    }

    // Keep all existing translated rows
    // aligned with the category visibility.
    const {
      error:
        visibilityError,
    } = await supabase
      .from("translations")
      .update({
        is_active:
          input.isActive,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "translation_key",
        newTranslationKey
      );

    if (visibilityError) {
      console.error(
        "UPDATE CATEGORY TRANSLATION VISIBILITY ERROR:",
        visibilityError
      );

      return {
        success: false,
        error:
          "The category was updated, but translation visibility could not be updated.",
      };
    }
  }

  revalidatePath(
    "/admin/categories"
  );

  revalidatePath(
    `/admin/categories/${id}/edit`
  );

  revalidatePath(
    `/admin/categories/${id}/translations`
  );

  revalidatePath(
    "/admin/translations"
  );

  return {
    success: true,
    id,
  };
}