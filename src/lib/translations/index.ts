import { createClient } from "@/lib/supabase/server";

type TranslationRow = {
  translation_key: string;
  locale_code: string;
  value: string;
};

export async function getTranslation(
  key: string,
  locale = "en"
): Promise<string> {
  const supabase = await createClient();

  const normalizedLocale =
    locale?.trim().toLowerCase() || "en";

  const locales =
    normalizedLocale === "en"
      ? ["en"]
      : [normalizedLocale, "en"];

  const { data, error } = await supabase
    .from("translations")
    .select(
      "translation_key, locale_code, value"
    )
    .eq("is_active", true)
    .eq("translation_key", key)
    .in("locale_code", locales);

  if (error) {
    console.error(
      "Failed to load translation:",
      error
    );

    return key;
  }

  const translations =
    (data ?? []) as TranslationRow[];

  const requestedTranslation =
    translations.find(
      (translation) =>
        translation.locale_code ===
          normalizedLocale &&
        translation.value?.trim()
    );

  if (requestedTranslation) {
    return requestedTranslation.value;
  }

  const englishTranslation =
    translations.find(
      (translation) =>
        translation.locale_code === "en" &&
        translation.value?.trim()
    );

  return englishTranslation?.value ?? key;
}

export async function getTranslations(
  keys: string[],
  locale = "en"
): Promise<Record<string, string>> {
  if (keys.length === 0) {
    return {};
  }

  const supabase = await createClient();

  const normalizedLocale =
    locale?.trim().toLowerCase() || "en";

  const uniqueKeys = [
    ...new Set(keys),
  ];

  const locales =
    normalizedLocale === "en"
      ? ["en"]
      : [normalizedLocale, "en"];

  const { data, error } = await supabase
    .from("translations")
    .select(
      "translation_key, locale_code, value"
    )
    .eq("is_active", true)
    .in("translation_key", uniqueKeys)
    .in("locale_code", locales);

  if (error) {
    console.error(
      "Failed to load translations:",
      error
    );

    return Object.fromEntries(
      uniqueKeys.map((key) => [key, key])
    );
  }

  const translations =
    (data ?? []) as TranslationRow[];

  const result: Record<string, string> = {};

  for (const key of uniqueKeys) {
    const requestedTranslation =
      translations.find(
        (translation) =>
          translation.translation_key === key &&
          translation.locale_code ===
            normalizedLocale &&
          translation.value?.trim()
      );

    if (requestedTranslation) {
      result[key] =
        requestedTranslation.value;
      continue;
    }

    const englishTranslation =
      translations.find(
        (translation) =>
          translation.translation_key === key &&
          translation.locale_code === "en" &&
          translation.value?.trim()
      );

    result[key] =
      englishTranslation?.value ?? key;
  }

  return result;
}