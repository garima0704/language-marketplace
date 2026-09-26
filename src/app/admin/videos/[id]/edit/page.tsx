import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getTranslations } from "@/lib/translations";

import AdminEditVideoForm from "@/components/admin/videos/AdminEditVideoForm";

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

export default async function AdminEditVideoPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  const {
    data: video,
    error: videoError,
  } = await supabase
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
      status
    `)
    .eq("id", id)
    .single();

  if (videoError || !video) {
    notFound();
  }

  /*
   * Admin can edit videos belonging to any seller,
   * so do NOT filter channels by the current admin user.
   */
  const { data: channels } = await supabase
    .from("channels")
    .select(`
      id,
      channel_name,
      user_id,
      profiles!inner (
        username,
        display_name
      )
    `)
    .order("channel_name");

  const { data: languages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  const { data: languageRegions } = await supabase
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

    // Edit
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
    "video.choose_video",
    "video.thumbnail",
    "video.change_thumbnail",
    "video.thumbnail_auto_generated",
    "video.thumbnail_generation_error",

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
    "video.draft_success",
    "video.published_success",

    // Upload / file errors
    "video.invalid_video_type",
    "video.video_size_error",
    "video.thumbnail_type_error",
    "video.thumbnail_size_error",
    "video.uploading_video",

    // Validation
    "video.enter_title_error",
    "video.select_channel_error",
    "video.select_language",
    "video.select_region_error",
    "video.select_level_error",
    "video.select_category_error",

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

    ...categoryTranslationKeys,
  ];

  // Admin UI is always English.
  const translations = await getTranslations(
    translationKeys,
    "en"
  );

  const localizedLanguages = (languages ?? []).map(
    (language) => ({
      code: language.code,
      name:
        translations[
          `language.${language.code}`
        ] ?? language.name,
    })
  );

  return (
    <main className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/admin/videos"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Edit Video
          </h1>

          <p className="mt-2 text-sm text-muted">
            Update video details, learning information,
            category, and publishing settings.
          </p>
        </div>

        <AdminEditVideoForm
          video={video}
          channels={channels ?? []}
          languages={localizedLanguages}
          languageRegions={languageRegions ?? []}
          categories={categoryList}
          translations={translations}
        />
      </div>
    </main>
  );
}