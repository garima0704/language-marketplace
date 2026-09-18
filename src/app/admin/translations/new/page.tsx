import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import TranslationForm from "@/components/admin/translations/TranslationForm";

export default async function NewTranslationPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------------
  // Fetch active languages
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
    console.error(
      "NEW TRANSLATION LOCALES FETCH ERROR:",
      localesError
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="w-full">
      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* Back */}
        <Link
          href="/admin/translations"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Translations
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Add Translation
          </h1>

          <p className="mt-1 text-sm text-muted">
            Add a translated piece of text for the NiceConvo website.
          </p>
        </div>

        {/* Form */}
        <TranslationForm locales={locales ?? []} />

      </div>
    </main>
  );
}