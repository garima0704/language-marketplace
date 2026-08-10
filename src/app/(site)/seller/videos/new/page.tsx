import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

  // Seller's channels
  const { data: channels } = await supabase
    .from("channels")
    .select("id, channel_name")
    .eq("user_id", user.id)
    .order("channel_name");

  // Languages
  const { data: languages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  // Language / Country / State
  const { data: languageRegions } = await supabase
    .from("language_regions")
    .select(
      "id, language_code, country, state, sort_order"
    )
    .order("language_code")
    .order("sort_order");

  // Categories
  const { data: categories } = await supabase
    .from("categories")
    .select(
      "id, parent_id, level, display_order"
    )
    .eq("is_active", true)
    .order("level")
    .order("display_order");

  // Category translations
  const { data: categoryTranslations } =
    await supabase
      .from("category_translations")
      .select(
        "category_id, locale_code, name"
      );

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
        languageRegions={languageRegions ?? []}
        categories={categories ?? []}
        categoryTranslations={
          categoryTranslations ?? []
        }
      />
    </div>
  );
}
