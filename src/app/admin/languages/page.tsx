import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import LanguagesHeader from "@/components/admin/languages/LanguagesHeader";
import LanguageList from "@/components/admin/languages/LanguageList";

export default async function LanguagesPage() {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // Languages
  // --------------------------------------------------

  const { data: languages, error: languagesError } =
    await supabase
      .from("locales")
      .select(
        "code, name, is_default, is_active, display_order"
      )
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

  if (languagesError) {
    console.error(
      "LANGUAGES FETCH ERROR:",
      languagesError
    );
  }

  // --------------------------------------------------
  // Regions
  // --------------------------------------------------

  const { data: regions, error: regionsError } =
    await supabase
      .from("language_regions")
      .select(
        "id, language_code, country, state, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("country", { ascending: true })
      .order("state", { ascending: true });

  if (regionsError) {
    console.error(
      "LANGUAGE REGIONS FETCH ERROR:",
      regionsError
    );
  }

  // --------------------------------------------------
  // Language translations
  //
  // language.en
  // language.es
  // language.fr
  // etc.
  // --------------------------------------------------

  const {
    data: languageTranslations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      "translation_key, locale_code, value"
    )
    .eq("section", "language")
    .eq("is_active", true);

  if (translationsError) {
    console.error(
      "LANGUAGE TRANSLATIONS FETCH ERROR:",
      translationsError
    );
  }

  // --------------------------------------------------
  // Group translations by language code
  // --------------------------------------------------

  const translationsByLanguage: Record<
    string,
    {
      locale_code: string;
      value: string;
    }[]
  > = {};

  for (const translation of languageTranslations ?? []) {
    if (!translation.translation_key.startsWith("language.")) {
      continue;
    }

    const languageCode =
      translation.translation_key.replace(
        "language.",
        ""
      );

    if (!translationsByLanguage[languageCode]) {
      translationsByLanguage[languageCode] = [];
    }

    translationsByLanguage[languageCode].push({
      locale_code: translation.locale_code,
      value: translation.value,
    });
  }

  // --------------------------------------------------
  // Number of supported translation languages
  // --------------------------------------------------

  const totalLanguages = (languages ?? []).filter(
    (language) => language.is_active
  ).length;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <LanguagesHeader
          languages={languages ?? []}
          regions={regions ?? []}
        />

        <LanguageList
          languages={languages ?? []}
          regions={regions ?? []}
          translations={translationsByLanguage}
          totalLanguages={totalLanguages}
        />
      </div>
    </main>
  );
}