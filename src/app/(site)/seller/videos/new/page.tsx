import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

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
  // Translation
  // --------------------------------------------

  const translations = await getTranslations(
    [
      "video.upload_title",
      "video.upload_description",

      // Stepper
      "video.step_video",
      "video.step_details",
      "video.step_language",
      "video.step_learning",
      "video.step_category_access",

      // Upload
      "video.upload_video",
      "video.drag_drop_video",
      "video.choose_file",
      "video.thumbnail",
      "video.change_thumbnail",
      "video.thumbnail_auto_generated",

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

      // Category selector UI
      "category.category",
      "category.select_category",
      "category.subcategory",
      "category.select_subcategory",
      "category.topic",
      "category.select_topic",
      "category.subtopic",
      "category.select_subtopic",
      "category.helper",

      // Language selector
      "video.language_of_video",
      "video.select_language_placeholder",
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
      "video.save_draft",
      "video.saving",
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
      "video.login_publish",
      "video.login_draft",
      "video.published_success",
      "video.draft_success",
      "video.thumbnail_generation_error",
      "video.choose_video",
    ],
    locale
  );

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

  const { data: categoryTranslations } =
    categoryIds.length > 0
      ? await supabase
          .from("category_translations")
          .select("category_id, locale_code, name")
          .in("category_id", categoryIds)
          .eq("locale_code", locale)
      : { data: [] };

  const localizedLanguages = (languages ?? []).map((language) => ({
    code: language.code,
    name:
      translations[`language.${language.code}`] ||
      language.name,
  }));

  // --------------------------------------------
  // Page
  // --------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {translations["video.upload_title"] ?? "Upload Video"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {translations["video.upload_description"] ??
            "Upload a new lesson for one of your channels."}
        </p>
      </div>

      <NewVideoForm
        channels={channels ?? []}
        languages={localizedLanguages}
        languageRegions={languageRegions}
        categories={categories ?? []}
        categoryTranslations={categoryTranslations ?? []}
        locale={locale}
        translations={translations}
      />
    </div>
  );
}