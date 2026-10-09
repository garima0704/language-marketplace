
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export async function getSitePage(slug: string) {
  const cookieStore = await cookies();
  const requestedLocale =
    cookieStore.get("niceconvo_locale")?.value || "en";

  const supabase = await createClient();

  async function fetchPage(localeCode: string) {
    const { data, error } = await supabase
      .from("site_pages")
      .select(
        "id, slug, title, content, page_data, is_published, locale_code"
      )
      .eq("slug", slug)
      .eq("locale_code", localeCode)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("SITE PAGE FETCH ERROR:", error);
      throw new Error("Failed to load website page.");
    }

    return data;
  }

  const page = await fetchPage(requestedLocale);

  if (page || requestedLocale === "en") {
    return page;
  }

  return fetchPage("en");
}