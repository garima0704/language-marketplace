import { requireAdmin } from "@/lib/auth/admin";
import { getTranslations } from "@/lib/translations";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AdminNewVideoForm from "@/components/admin/videos/AdminNewVideoForm";

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

export default async function AdminNewVideoPage() {
  const { supabase } = await requireAdmin();

  // --------------------------------------------
  // Categories
  // --------------------------------------------

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select(
        "id, slug, parent_id, level, display_order"
      )
      .eq("is_active", true)
      .order("level")
      .order("display_order");

  if (categoriesError) {
    console.error(
      "ADMIN CATEGORIES ERROR:",
      categoriesError
    );
  }

  const categoryList: Category[] = categories ?? [];

  const categoryTranslationKeys =
    categoryList.map((category) =>
      getCategoryTranslationKey(
        category,
        categoryList
      )
    );

  // --------------------------------------------
  // Translations
  // Admin is English-only
  // --------------------------------------------

  const translations = await getTranslations(
    [
      // Page
      "video.admin_add_title",
      "video.admin_add_description",

      // Steps
      "video.step_video",
      "video.step_details",
      "video.step_language",
      "video.step_learning",
      "video.step_category_access",

      // Upload
      "video.upload_video",
      "video.drag_drop_video",
      "video.choose_file",
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
      "video.language_of_video",
      "video.select_language_placeholder",

      // Language names
      "language.en",
      "language.es",
      "language.ar",
      "language.zh",
      "language.fr",
      "language.de",
      "language.it",
      "language.pt",

      // Levels
      "level.beginner",
      "level.intermediate",
      "level.advanced",

      // Learning
      "video.learning_details",
      "video.level",
      "video.select_level",
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

      // Category selector
      "category.language",
      "category.select_language",
      "category.category",
      "category.select_category",
      "category.topic",
      "category.select_topic",
      "category.subtopic",
      "category.select_subtopic",
      "category.helper",

      // Category names
      ...categoryTranslationKeys,

      // Language / Region
      "video.country",
      "video.select_country",
      "video.select_language_first",
      "video.state_region",
      "video.select_state_region",
      "video.select_country_first",
      "video.language_region_helper",

      // Common
      "common.yes",
      "common.no",
      "common.previous",
      "common.next",

      // Actions
      "video.publish",
      "video.publishing",

      // Validation
      "video.select_video",
      "video.select_language",
      "video.enter_title_error",
      "video.select_channel_error",
      "video.select_region_error",
      "video.select_level_error",
      "video.select_category_error",
      "video.published_success",
    ],
    "en"
  );

  // --------------------------------------------
  // All channels
  // --------------------------------------------

  const { data: channels, error: channelsError } =
    await supabase
      .from("channels")
      .select(`
        id,
        channel_name,
        user_id,
        profiles!inner (
          id,
          username,
          display_name
        )
      `)
      .order("channel_name");

  if (channelsError) {
    console.error(
      "ADMIN CHANNELS ERROR:",
      channelsError
    );
  }

  // --------------------------------------------
  // Languages
  // --------------------------------------------

  type Locale = {
    code: string;
    name: string;
  };

  const { data: languages, error: languagesError } =
    await supabase
      .from("locales")
      .select("code, name")
      .eq("is_active", true)
      .order("display_order");

  if (languagesError) {
    console.error(
      "ADMIN LANGUAGES ERROR:",
      languagesError
    );
  }

  const localizedLanguages = (languages ?? []).map(
    (language: Locale) => ({
      code: language.code,
      name:
        translations[`language.${language.code}`] ??
        language.name,
    })
  );

  // --------------------------------------------
  // Language regions
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
        "ADMIN LANGUAGE REGIONS ERROR:",
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
  // Page
  // --------------------------------------------

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
          <h1 className="text-2xl font-semibold text-foreground">
            {translations["video.admin_add_title"] ??
              "Add Video"}
          </h1>

          <p className="mt-1 text-sm text-muted">
            {translations["video.admin_add_description"] ??
              "Create a new video for any NiceConvo seller."}
          </p>
        </div>

        <AdminNewVideoForm
          channels={channels ?? []}
          languages={localizedLanguages}
          languageRegions={languageRegions}
          categories={categoryList}
          translations={translations}
        />
      </div>
    </main>
  );
}