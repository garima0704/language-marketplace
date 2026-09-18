"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type TranslationInput = {
  localeCode: string;
  name: string;
};

type TranslationActionResult = {
  success: boolean;
  error?: string;
};

type CategoryNode = {
  id: string;
  parent_id: string | null;
  slug: string;
};

export async function saveCategoryTranslations(
  categoryId: string,
  translations: TranslationInput[]
): Promise<TranslationActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // Make sure category exists
  // --------------------------------------------------

  const { data: category, error: categoryError } =
    await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .single();

  if (categoryError || !category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  // --------------------------------------------------
  // English cannot be changed from this page
  // --------------------------------------------------

  const nonEnglishTranslations = translations.filter(
    (translation) => translation.localeCode !== "en"
  );

  // --------------------------------------------------
  // Fetch supported locales
  // --------------------------------------------------

  const { data: locales, error: localesError } =
    await supabase
      .from("locales")
      .select("code");

  if (localesError) {
    console.error(
      "FETCH LOCALES ERROR:",
      localesError
    );

    return {
      success: false,
      error: "Unable to load supported languages.",
    };
  }

  const supportedLocales = new Set(
    (locales ?? []).map((locale) => locale.code)
  );

  // --------------------------------------------------
  // Validate submitted locale codes
  // --------------------------------------------------

  for (const translation of nonEnglishTranslations) {
    if (!supportedLocales.has(translation.localeCode)) {
      return {
        success: false,
        error: `Unsupported language: ${translation.localeCode}`,
      };
    }
  }

  // --------------------------------------------------
  // Remove duplicate locale codes
  // --------------------------------------------------

  const localeMap = new Map<string, string>();

  for (const translation of nonEnglishTranslations) {
    localeMap.set(
      translation.localeCode,
      translation.name.trim()
    );
  }

  // --------------------------------------------------
  // Fetch category hierarchy
  // --------------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, parent_id, slug");

  if (categoriesError) {
    console.error(
      "FETCH CATEGORIES ERROR:",
      categoriesError
    );

    return {
      success: false,
      error: "Unable to load category hierarchy.",
    };
  }

  const categoryMap = new Map<string, CategoryNode>(
    (categories ?? []).map((item) => [
      item.id,
      item as CategoryNode,
    ])
  );

  const currentCategory = categoryMap.get(categoryId);

  if (!currentCategory) {
    return {
      success: false,
      error: "Category not found.",
    };
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
  let current: CategoryNode | undefined = currentCategory;

  while (current) {
    pathParts.unshift(current.slug);

    if (!current.parent_id) {
      break;
    }

    current = categoryMap.get(current.parent_id);

    if (!current) {
      return {
        success: false,
        error: "Invalid category hierarchy.",
      };
    }
  }

  const translationKey = `category.${pathParts.join(".")}`;

  // --------------------------------------------------
  // Delete translations that were cleared
  // --------------------------------------------------

  const emptyLocales = Array.from(localeMap.entries())
    .filter(([, name]) => !name)
    .map(([localeCode]) => localeCode);

  if (emptyLocales.length > 0) {
    const { error: deleteError } = await supabase
      .from("translations")
      .delete()
      .eq("translation_key", translationKey)
      .in("locale_code", emptyLocales);

    if (deleteError) {
      console.error(
        "DELETE TRANSLATIONS ERROR:",
        deleteError
      );

      return {
        success: false,
        error: "Unable to remove empty translations.",
      };
    }
  }

  // --------------------------------------------------
  // Save non-empty translations
  // --------------------------------------------------

  const rowsToUpsert = Array.from(
    localeMap.entries()
  )
    .filter(([, name]) => name.length > 0)
    .map(([localeCode, name]) => ({
      translation_key: translationKey,
      locale_code: localeCode,
      value: name,
      section: "category",
      name,
      is_active: true,
    }));

  if (rowsToUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from("translations")
      .upsert(rowsToUpsert, {
        onConflict: "translation_key,locale_code",
      });

    if (upsertError) {
      console.error(
        "UPSERT TRANSLATIONS ERROR:",
        upsertError
      );

      return {
        success: false,
        error: upsertError.message,
      };
    }
  }

  // --------------------------------------------------
  // Refresh relevant pages
  // --------------------------------------------------

  revalidatePath("/admin/categories");
  revalidatePath(
    `/admin/categories/${categoryId}/translations`
  );
  revalidatePath("/admin/translations");

  return {
    success: true,
  };
}