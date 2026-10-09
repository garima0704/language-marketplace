import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import EditVideoForm from "@/components/seller/EditVideoForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type Category = {
  id: string;
  slug: string;
  parent_id: string | null;
  level: number;
  display_order: number;
};

function getCategoryTranslationKey(
  category: Category,
  categories: Category[]
) {
  const parts: string[] = [category.slug];

  let current = category;

  while (current.parent_id) {
    const parent = categories.find(
      (item) => item.id === current.parent_id
    );

    if (!parent) break;

    parts.unshift(parent.slug);
    current = parent;
  }

  return `category.${parts.join(".")}`;
}

export default async function EditVideoPage({
  params,
}: PageProps) {
  const { id } = await params;

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

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  /*
   * Load the existing video.
   *
   * Important:
   * This is intentionally scoped to the current seller.
   * The Edit page must never allow a creator to edit
   * another creator's video.
   */
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

  const { data: channels } = await supabase
    .from("channels")
    .select("id, channel_name")
    .eq("user_id", user.id)
    .order("channel_name");

  const { data: languages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  const { data: languageRegions } =
    await supabase
      .from("language_regions")
      .select(
        "id, language_code, country, state, sort_order"
      )
      .order("language_code")
      .order("sort_order");

  const { data: categories } = await supabase
    .from("categories")
    .select(
      "id, slug, parent_id, level, display_order"
    )
    .eq("is_active", true)
    .order("level")
    .order("display_order");

  const categoryList: Category[] = categories ?? [];

  /*
   * Category translations now come from the single
   * translations table.
   */
  const categoryTranslationKeys =
    categoryList.map((category) =>
      getCategoryTranslationKey(
        category,
        categoryList
      )
    );

  const translationKeys = [
  // Steps
  "video.step_video",
  "video.step_details",
  "video.step_language",
  "video.step_learning",
  "video.step_category_access",

  // Edit Video
  "video.edit_title",
  "video.edit_description",
  "video.current_video",
  "video.current_video_uploaded",
  "video.replace_video_description",
  "video.replace_video",
  "video.new_video_selected",
  "video.leave_video_empty",
  "video.thumbnail_preview_alt",
  "video.thumbnail_format",

  // Video
  "video.upload_video",
  "video.drag_drop_video",
  "video.choose_file",
  "video.choose_video",
  "video.thumbnail",
  "video.change_thumbnail",
  "video.thumbnail_auto_generated",
  "video.thumbnail_generation_error",
  "video.no_file_chosen",

  // Details
  "video.details",
  "video.title",
  "video.enter_title",
  "video.description",
  "video.describe_learning",
  "video.channel",
  "video.select_channel",

  // Language
  "video.native_speaker",

  // Learning
  "video.learning_details",
  "video.level",
  "video.select_level",
  "level.beginner",
  "level.intermediate",
  "level.advanced",
  "video.captions_original",
  "video.subtitles_second_language",
  "video.no_subtitles",
  "video.explains_idioms",
  "video.explains_technical_lingo",
  "video.profanity",
  "video.ai_voice",

  // Category / Access
  "video.category",
  "video.access",
  "video.subscribers_only",
  "video.free_preview",

  // Common
  "common.yes",
  "common.no",
  "common.cancel",
  "common.yes_delete",
  "common.previous",
  "common.next",

  // Save / publish
  "video.saving",
  "video.save_draft",
  "video.publishing",
  "video.publish",
  "video.save_changes",
  "video.updated_success",
  "video.replaced_success",
  "video.save_error",

  // Upload / file errors
  "video.invalid_video_type",
  "video.video_size_error",
  "video.thumbnail_type_error",
  "video.thumbnail_size_error",
  "video.uploading_video",

  // Delete
  "video.danger_zone",
  "video.delete_description",
  "video.delete_video",
  "video.delete_confirmation",
  "video.delete_warning",
  "video.deleting",
  "video.deleted_success",
  "video.delete_error",

  // Validation
  "video.select_video",
  "video.enter_title_error",
  "video.select_channel_error",
  "video.select_language",
  "video.select_region_error",
  "video.select_level_error",
  "video.select_category_error",
  "video.login_publish",
  "video.published_success",
  "video.login_draft",
  "video.draft_success",

  // LanguageRegionSelector
  "video.language_of_video",
  "video.select_language_placeholder",
  "video.country",
  "video.select_country",
  "video.select_language_first",
  "video.state_region",
  "video.select_state_region",
  "video.select_country_first",
  "video.language_region_helper",

  // CategorySelector
  "category.language",
  "category.select_language",
  "category.category",
  "category.select_category",
  "category.topic",
  "category.select_topic",
  "category.subtopic",
  "category.select_subtopic",
  "category.helper",

  // Language names
  "language.ar",
  "language.zh",
  "language.en",
  "language.fr",
  "language.de",
  "language.it",
  "language.pt",
  "language.es",

  // Category names
  ...categoryTranslationKeys,
];

  const translations = await getTranslations(
    translationKeys,
    locale
  );

  const localizedLanguages = (languages ?? []).map((language) => ({
    code: language.code,
    name:
      translations[`language.${language.code}`] ||
      language.name,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {translations["video.edit_title"] ?? "Edit Video"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {translations["video.edit_description"] ??
            "Update your video details and publishing settings."}
        </p>
      </div>

      <EditVideoForm
        video={video}
        channels={channels ?? []}
        languages={localizedLanguages}
        languageRegions={languageRegions ?? []}
        categories={categoryList}
        translations={translations}
        locale={locale}
      />
    </div>
  );
}