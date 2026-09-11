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
    (translation) =>
      translation.localeCode !== "en"
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
  // Delete translations that were cleared
  // --------------------------------------------------

  const emptyLocales = Array.from(
    localeMap.entries()
  )
    .filter(([, name]) => !name)
    .map(([localeCode]) => localeCode);

  if (emptyLocales.length > 0) {
    const { error: deleteError } = await supabase
      .from("category_translations")
      .delete()
      .eq("category_id", categoryId)
      .in("locale_code", emptyLocales);

    if (deleteError) {
      console.error(
        "DELETE CATEGORY TRANSLATIONS ERROR:",
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
      category_id: categoryId,
      locale_code: localeCode,
      name,
    }));

  if (rowsToUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from("category_translations")
      .upsert(rowsToUpsert, {
        onConflict: "category_id,locale_code",
      });

    if (upsertError) {
      console.error(
        "UPSERT CATEGORY TRANSLATIONS ERROR:",
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

  return {
    success: true,
  };
}