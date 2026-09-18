import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import TranslationsHeader from "@/components/admin/translations/TranslationsHeader";
import TranslationList from "@/components/admin/translations/TranslationList";

export default async function TranslationsPage() {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch UI translations only
  // --------------------------------------------------
  
  const { data: translations, error: translationsError } =
    await supabase
      .from("translations")
      .select("*")
      .neq("section", "category");

  if (translationsError) {
    console.error("TRANSLATIONS ERROR:", {
      code: translationsError.code,
      message: translationsError.message,
      details: translationsError.details,
      hint: translationsError.hint,
    });

    throw new Error(
      translationsError.message ||
        "Failed to load translations."
    );
  }

  // --------------------------------------------------
  // Fetch active locales
  // --------------------------------------------------

  const { data: locales, error: localesError } =
    await supabase
      .from("locales")
      .select("code, name")
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

  if (localesError) {
    console.error("Error fetching locales:", localesError);

    throw new Error("Failed to load languages.");
  }

  // --------------------------------------------------
  // Calculate translation statistics
  // --------------------------------------------------

  const translationRows = translations ?? [];
  const localeRows = locales ?? [];

  const translationKeys = new Set(
    translationRows.map(
      (translation) => translation.translation_key
    )
  );

  const totalKeys = translationKeys.size;
  const totalLanguages = localeRows.length;

  const nonEnglishLocales = localeRows.filter(
    (locale) => locale.code !== "en"
  );

  let totalExpected = 0;
  let totalCompleted = 0;

  for (const translationKey of translationKeys) {
    const rows = translationRows.filter(
      (translation) =>
        translation.translation_key === translationKey
    );

    const englishRow = rows.find(
      (translation) =>
        translation.locale_code === "en"
    );

    if (!englishRow) {
      continue;
    }

    totalExpected += nonEnglishLocales.length;

    for (const locale of nonEnglishLocales) {
      const row = rows.find(
        (translation) =>
          translation.locale_code === locale.code
      );

      if (row?.value?.trim()) {
        totalCompleted++;
      }
    }
  }

  const completionPercentage =
    totalExpected > 0
      ? Math.round(
          (totalCompleted / totalExpected) * 100
        )
      : 100;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <TranslationsHeader
          totalKeys={totalKeys}
          totalLanguages={totalLanguages}
          completionPercentage={completionPercentage}
        />

        <TranslationList
          translations={translationRows}
          locales={localeRows}
        />
      </div>
    </main>
  );
}