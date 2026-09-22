import CategoryPills from "@/components/CategoryPills";
import CreatorSection from "@/components/CreatorSection";
import VideoSection from "@/components/VideoSection";

import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";
import { getBrowseLanguages } from "@/lib/languages";

import { cookies } from "next/headers";

export default async function HomePage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Get selected UI locale
  // --------------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // --------------------------------------------------
  // Home translations
  // --------------------------------------------------

  const homeTranslations =
    await getTranslations(
      [
        "home.trending_videos",
        "home.latest_videos",
      ],
      locale
    );

  // --------------------------------------------------
  // Browse languages
  //
  // Languages come from `locales`.
  // The selected UI locale controls the translated
  // language names displayed to the user.
  // --------------------------------------------------

  const languages =
    await getBrowseLanguages(locale);

  // --------------------------------------------------
  // Shared video fields
  // --------------------------------------------------

  const videoSelect = `
    id,
    slug,
    title,
    thumbnail_url,
    level,
    access_type,
    view_count,
    created_at,
    published_at,
    category_id,
    language_code,

    channels (
      id,
      channel_name,
      slug,
      logo_url,
      user_id,

      profiles (
        id,
        is_creator
      )
    ),

    categories (
      id,
      slug
    )
  `;

  // --------------------------------------------------
  // Trending videos
  // --------------------------------------------------

  const {
    data: trendingVideos,
    error: trendingError,
  } = await supabase
    .from("videos")
    .select(videoSelect)
    .eq("status", "published")
    .eq(
      "channels.profiles.is_creator",
      true
    )
    .order("view_count", {
      ascending: false,
    })
    .limit(8);

  if (trendingError) {
    console.error(
      "Trending videos error:",
      trendingError
    );
  }

  // --------------------------------------------------
  // Latest videos
  // --------------------------------------------------

  const {
    data: latestVideos,
    error: latestError,
  } = await supabase
    .from("videos")
    .select(videoSelect)
    .eq("status", "published")
    .eq(
      "channels.profiles.is_creator",
      true
    )
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(8);

  if (latestError) {
    console.error(
      "Latest videos error:",
      latestError
    );
  }

  // --------------------------------------------------
  // Helper for translated language name
  // --------------------------------------------------

  function getLanguageLabel(
    languageCode: string | null
  ) {
    if (!languageCode) return undefined;

    const language = languages.find(
      (item) => item.code === languageCode
    );

    return language?.name ?? languageCode;
  }

  // --------------------------------------------------
  // Add translated language + category labels
  // --------------------------------------------------

  const formattedTrendingVideos =
    await Promise.all(
      (trendingVideos ?? []).map(
        async (video) => ({
          ...video,

          language_label:
            getLanguageLabel(
              video.language_code
            ),

          category_label:
            await getCategoryLabel(
              video.category_id,
              locale
            ),
        })
      )
    );

  const formattedLatestVideos =
    await Promise.all(
      (latestVideos ?? []).map(
        async (video) => ({
          ...video,

          language_label:
            getLanguageLabel(
              video.language_code
            ),

          category_label:
            await getCategoryLabel(
              video.category_id,
              locale
            ),
        })
      )
    );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="px-6 py-6">

      {/* ============================================
          Browse Languages
      ============================================ */}

      <CategoryPills
        languages={languages}
        selectedLanguage=""
        categories={[]}
        selectedCategory=""
        basePath="/videos"
      />

      {/* ============================================
          Trending Videos
      ============================================ */}

      <VideoSection
        title={
          homeTranslations[
            "home.trending_videos"
          ] ??
          "Trending Videos"
        }
        videos={
          formattedTrendingVideos
        }
        locale={locale}
      />

      {/* ============================================
          Creators
      ============================================ */}

      <CreatorSection />

      {/* ============================================
          Latest Videos
      ============================================ */}

      <VideoSection
        title={
          homeTranslations[
            "home.latest_videos"
          ] ??
          "Latest Videos"
        }
        videos={
          formattedLatestVideos
        }
        locale={locale}
      />
    </div>
  );
}