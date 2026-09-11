import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import LanguagesHeader from "@/components/admin/languages/LanguagesHeader";
import LanguageList from "@/components/admin/languages/LanguageList";

export default async function LanguagesPage() {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch languages
  // --------------------------------------------------

  const { data: languages, error: languagesError } = await supabase
    .from("locales")
    .select(
      "code, name, is_default, is_active, display_order"
    )
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (languagesError) {
    console.error("LANGUAGES FETCH ERROR:", languagesError);
  }

  // --------------------------------------------------
  // Fetch regions
  // --------------------------------------------------

  const { data: regions, error: regionsError } = await supabase
    .from("language_regions")
    .select(
      "id, language_code, country, state, sort_order"
    )
    .order("sort_order", { ascending: true })
    .order("country", { ascending: true })
    .order("state", { ascending: true });

  if (regionsError) {
    console.error("LANGUAGE REGIONS FETCH ERROR:", regionsError);
  }

  return (
    <div className="min-h-full bg-light-bg">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
      <LanguagesHeader
        languages={languages ?? []}
        regions={regions ?? []}
      />

      <LanguageList
        languages={languages ?? []}
        regions={regions ?? []}
      />
    </div>
    </div>
  );
}