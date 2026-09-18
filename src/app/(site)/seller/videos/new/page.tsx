import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabels } from "@/lib/categories";

import NewVideoForm from "@/components/seller/NewVideoForm";

export default async function NewVideoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

  // --------------------------------------------
  // Current locale
  // --------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // --------------------------------------------
  // Seller's channels
  // --------------------------------------------

  const { data: channels } = await supabase
    .from("channels")
    .select("id, channel_name")
    .eq("user_id", user.id)
    .order("channel_name");

  // --------------------------------------------
  // Languages
  // --------------------------------------------

  const { data: languages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  // --------------------------------------------
  // Language / Country / State
  // --------------------------------------------

  const PAGE_SIZE = 1000;

  let languageRegions: {
    id: number;
    language_code: string;
    country: string;
    state: string | null;
    sort_order: number | null;
  }[] = [];

  let from = 0;

  while (true) {
    const {
      data: page,
      error: languageRegionsError,
    } = await supabase
      .from("language_regions")
      .select(
        "id, language_code, country, state, sort_order"
      )
      .order("language_code")
      .order("sort_order")
      .range(from, from + PAGE_SIZE - 1);

    if (languageRegionsError) {
      console.error(
        "Failed to fetch language regions:",
        languageRegionsError
      );
      break;
    }

    languageRegions.push(...(page ?? []));

    if (!page || page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  // --------------------------------------------
  // Categories
  // --------------------------------------------

  const { data: categories } = await supabase
    .from("categories")
    .select(
      "id, slug, parent_id, level, display_order"
    )
    .eq("is_active", true)
    .order("level")
    .order("display_order");

  // --------------------------------------------
  // Category translations
  // --------------------------------------------

  const categoryIds =
    categories?.map((category) => category.id) ?? [];

  const categoryLabels =
    categoryIds.length > 0
      ? await getCategoryLabels(
          categoryIds,
          locale
        )
      : {};

  // --------------------------------------------
  // Page
  // --------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Upload Video
        </h1>

        <p className="mt-2 text-muted-foreground">
          Upload a new lesson for one of your channels.
        </p>
      </div>

      <NewVideoForm
        channels={channels ?? []}
        languages={languages ?? []}
        languageRegions={languageRegions}
        categories={categories ?? []}
        categoryLabels={categoryLabels}
      />
    </div>
  );
}