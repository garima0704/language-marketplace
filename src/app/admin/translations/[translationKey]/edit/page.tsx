import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import TranslationEditForm from "@/components/admin/translations/TranslationEditForm";

type PageProps = {
  params: Promise<{
    translationKey: string;
  }>;
};

type Locale = {
  code: string;
  name: string;
};

export default async function TranslationEditPage({
  params,
}: PageProps) {
  const { supabase } = await requireAdmin();

  const { translationKey } = await params;

  const decodedTranslationKey =
    decodeURIComponent(translationKey);

  const {
    data: translations,
    error: translationsError,
  } = await supabase
    .from("translations")
    .select(
      "id, translation_key, name, section, locale_code, value, is_active"
    )
    .eq(
      "translation_key",
      decodedTranslationKey
    )
    .order("locale_code", {
      ascending: true,
    });

  if (translationsError) {
    console.error(
      "TRANSLATION EDIT ERROR:",
      translationsError
    );

    throw new Error(
      "Failed to load translation."
    );
  }

  if (
    !translations ||
    translations.length === 0
  ) {
    throw new Error(
      "Translation not found."
    );
  }

  const {
    data: locales,
    error: localesError,
  } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (localesError) {
    console.error(
      "TRANSLATION EDIT LOCALES ERROR:",
      localesError
    );

    throw new Error(
      "Failed to load languages."
    );
  }

  const localeRows: Locale[] = locales ?? [];

  const englishTranslation =
    translations.find(
      (translation) =>
        translation.locale_code === "en"
    );

  const translationName =
    englishTranslation?.name ??
    translations[0]?.name ??
    decodedTranslationKey;

  const section =
    englishTranslation?.section ??
    translations[0]?.section ??
    "common";

  return (
    <main className="w-full">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href={`/admin/translations/${encodeURIComponent(
            decodedTranslationKey
          )}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Translation
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Edit Translation
          </h1>

          <p className="mt-1 text-sm text-muted">
            Update the text and translations used throughout
            NiceConvo.
          </p>
        </div>

        <TranslationEditForm
          translationKey={decodedTranslationKey}
          translationName={translationName}
          section={section}
          translations={translations}
          locales={localeRows}
        />
      </div>
    </main>
  );
}