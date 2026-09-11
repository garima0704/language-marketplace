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
      error: "A valid slug could not be generated from the category name.",
    };
  }

  // --------------------------------------------------
  // Calculate level
  // --------------------------------------------------

  let level = 1;

  if (input.parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("categories")
      .select("id, level")
      .eq("id", input.parentId)
      .single();

    if (parentError || !parent) {
      return {
        success: false,
        error: "The selected parent category could not be found.",
      };
    }

    level = parent.level + 1;
  }

  if (level > 4) {
    return {
      success: false,
      error: "Categories can only be nested up to 4 levels.",
    };
  }

  // --------------------------------------------------
  // Create category
  // --------------------------------------------------

  const { data: category, error: categoryError } = await supabase
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
    console.error("CREATE CATEGORY ERROR:", categoryError);

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
  // Create English translation
  // --------------------------------------------------

  const { error: translationError } = await supabase
    .from("category_translations")
    .insert({
      category_id: category.id,
      locale_code: "en",
      name,
    });

  if (translationError) {
    console.error(
      "CREATE CATEGORY TRANSLATION ERROR:",
      translationError
    );

    // Roll back the category if the English translation
    // could not be created.
    await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    return {
      success: false,
      error: "Unable to create the English category translation.",
    };
  }

  revalidatePath("/admin/categories");

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

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, parent_id, level");

  if (categoriesError) {
    console.error(
      "FETCH CATEGORIES FOR UPDATE ERROR:",
      categoriesError
    );

    return {
      success: false,
      error: "Unable to validate the category hierarchy.",
    };
  }

  const categoryList = categories ?? [];

  const currentCategory = categoryList.find(
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
      error: "A category cannot be its own parent.",
    };
  }

  // --------------------------------------------------
  // Find descendants
  // --------------------------------------------------

  const descendants = getDescendants(
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
    const parent = categoryList.find(
      (category) => category.id === input.parentId
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

  const relativeDepth = getRelativeDepth(
    id,
    categoryList
  );

  if (newLevel + relativeDepth > 4) {
    return {
      success: false,
      error:
        "This move would create a category hierarchy deeper than 4 levels.",
    };
  }

  // --------------------------------------------------
  // Build the new hierarchy in memory
  // --------------------------------------------------

  const updatedParents = new Map<string, string | null>();

  for (const category of categoryList) {
    updatedParents.set(
      category.id,
      category.parent_id
    );
  }

  updatedParents.set(id, input.parentId);

  // --------------------------------------------------
  // Calculate levels using the new hierarchy
  // --------------------------------------------------

  const newLevels = new Map<string, number>();

  const calculateLevel = (
    categoryId: string
  ): number => {
    const existingLevel =
      newLevels.get(categoryId);

    if (existingLevel !== undefined) {
      return existingLevel;
    }

    if (categoryId === id) {
      newLevels.set(categoryId, newLevel);
      return newLevel;
    }

    const parentId =
      updatedParents.get(categoryId);

    if (parentId === null || parentId === undefined) {
      const originalCategory = categoryList.find(
        (category) => category.id === categoryId
      );

      const level =
        originalCategory?.level ?? 1;

      newLevels.set(categoryId, level);

      return level;
    }

    const parentLevel =
      calculateLevel(parentId);

    const level = parentLevel + 1;

    newLevels.set(categoryId, level);

    return level;
  };

  calculateLevel(id);

  for (const descendantId of descendants) {
    calculateLevel(descendantId);
  }

  // --------------------------------------------------
  // Safety check
  // --------------------------------------------------

  for (const [categoryId, level] of newLevels) {
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
  // Update category
  // --------------------------------------------------

  const { error: updateError } =
    await supabase
      .from("categories")
      .update({
        parent_id: input.parentId,
        slug,
        level: newLevel,
        display_order: input.displayOrder,
        is_active: input.isActive,
      })
      .eq("id", id);

  if (updateError) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      updateError
    );

    if (updateError.code === "23505") {
      return {
        success: false,
        error:
          "A category with this slug already exists under the selected parent.",
      };
    }

    return {
      success: false,
      error: "Unable to update the category.",
    };
  }

  // --------------------------------------------------
  // Update descendant levels
  // --------------------------------------------------

  for (const descendantId of descendants) {
    const descendantLevel =
      newLevels.get(descendantId);

    if (descendantLevel === undefined) {
      continue;
    }

    const { error: descendantError } =
      await supabase
        .from("categories")
        .update({
          level: descendantLevel,
        })
        .eq("id", descendantId);

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
  // Update English translation
  // --------------------------------------------------

  const { error: translationError } =
    await supabase
      .from("category_translations")
      .upsert(
        {
          category_id: id,
          locale_code: "en",
          name,
        },
        {
          onConflict:
            "category_id,locale_code",
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

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePath(
    `/admin/categories/${id}/translations`
  );

  return {
    success: true,
    id,
  };
}