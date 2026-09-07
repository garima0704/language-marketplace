import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EditVideoForm from "@/components/seller/EditVideoForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVideoPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // --------------------------------------------
  // Check logged-in user
  // --------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------
  // Check creator
  // --------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

  // --------------------------------------------
  // Get video
  // --------------------------------------------

  const { data: video, error: videoError } =
    await supabase
      .from("videos")
      .select(`
        id,
        channel_id,
        category_id,
        title,
        description,
        thumbnail_url,
        video_provider,
        video_id,
        language_code,
        language_region_id,
        is_native_speaker,
        level,
        captions_original,
        subtitle_language_code,
        explains_idioms,
        explains_technical_lingo,
        profanity,
        ai_voice,
        access_type,
        status,
        channels!inner (
          id,
          channel_name,
          user_id
        )
      `)
      .eq("id", id)
      .eq("channels.user_id", user.id)
      .single();

  if (videoError || !video) {
    notFound();
  }

  // --------------------------------------------
  // Seller channels
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
  // Language regions
  // --------------------------------------------

  const { data: languageRegions } =
    await supabase
      .from("language_regions")
      .select(
        "id, language_code, country, state, sort_order"
      )
      .order("language_code")
      .order("sort_order");

  // --------------------------------------------
  // Categories
  // --------------------------------------------

  const { data: categories } = await supabase
    .from("categories")
    .select(
      "id, parent_id, level, display_order"
    )
    .eq("is_active", true)
    .order("level")
    .order("display_order");

  // --------------------------------------------
  // Category translations
  // --------------------------------------------

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
          Edit Video
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update your video details and publishing settings.
        </p>
      </div>

      <EditVideoForm
        video={video}
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