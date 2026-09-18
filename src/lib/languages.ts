import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export interface BrowseLanguage {
  code: string;
  name: string;
  display_order: number;
}

/**
 * Get all active browse languages with their
 * names translated into the currently selected
 * UI language.
 *
 * The UI language controls the labels only.
 * It does NOT filter which browse languages appear.
 */
export async function getBrowseLanguages(
  locale?: string
): Promise<BrowseLanguage[]> {
  const supabase = await createClient();

  /* -------------------------------------------------------
     Get UI language
  ------------------------------------------------------- */

  let selectedLocale = locale;

  if (!selectedLocale) {
    const cookieStore = await cookies();

    selectedLocale =
      cookieStore.get("niceconvo_locale")?.value ?? "en";
  }

  /* -------------------------------------------------------
     Get all active browse languages
  ------------------------------------------------------- */

  const {
    data: languages,
    error: languagesError,
  } = await supabase
    .from("locales")
    .select("code, name, display_order")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (languagesError) {
    console.error(
      "Failed to load browse languages:",
      languagesError
    );

    return [];
  }

  if (!languages?.length) {
    return [];
  }

  /* -------------------------------------------------------
     English UI uses the locale name directly.
  ------------------------------------------------------- */

  if (selectedLocale === "en") {
    return languages.map((language) => ({
      code: language.code,
      name: language.name,
      display_order: language.display_order,
    }));
  }

  /* -------------------------------------------------------
     Get translated language names.
     
     Example:
       language.en → Inglés
       language.es → Español
       language.ar → Árabe
  ------------------------------------------------------- */

  const translationKeys = languages.map(
    (language) => `language.${language.code}`
  );

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      "translation_key, locale_code, value"
    )
    .eq("section", "language")
    .eq("locale_code", selectedLocale)
    .eq("is_active", true)
    .in("translation_key", translationKeys);

  if (translationsError) {
    console.error(
      "Failed to load language translations:",
      translationsError
    );
  }

  /* -------------------------------------------------------
     Build translation lookup
  ------------------------------------------------------- */

  const translationMap = new Map<string, string>();

  for (const translation of translations ?? []) {
    if (translation.value?.trim()) {
      translationMap.set(
        translation.translation_key,
        translation.value
      );
    }
  }

  /* -------------------------------------------------------
     Build final language list
     
     IMPORTANT:
     Never filter languages based on UI locale.
     All active browse languages remain visible.
  ------------------------------------------------------- */

  return languages.map((language) => {
    const translationKey =
      `language.${language.code}`;

    return {
      code: language.code,
      display_order: language.display_order,
      name:
        translationMap.get(translationKey) ??
        language.name,
    };
  });
}