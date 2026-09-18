import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabels } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";

import CategoryPills from "@/components/CategoryPills";
import VideoSection from "@/components/VideoSection";

export default async function VideosPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Current locale
  // --------------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // --------------------------------------------------
  // Page translations
  // --------------------------------------------------

  const translations = await getTranslations(
    [
      "videos.all",
      "videos.home",
      "videos.title",
      "videos.all_videos",
      "videos.description",
    ],
    locale
  );

  // --------------------------------------------------
  // Top-level language categories
  // --------------------------------------------------

  const {
    data: languageCategories,
    error: languagesError,
  } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      display_order
    `)
    .is("parent_id", null)
    .eq("is_active", true)
    .order("display_order");

  if (languagesError) {
    console.error(
      "Failed to load video categories:",
      languagesError
    );
  }

  // --------------------------------------------------
  // Language category labels
  // --------------------------------------------------

  const languageCategoryIds =
    languageCategories?.map(
      (category) => category.id
    ) ?? [];

  const languageLabels =
    languageCategoryIds.length > 0
      ? await getCategoryLabels(
          languageCategoryIds,
          locale
        )
      : {};

  // --------------------------------------------------
  // Language pills
  // --------------------------------------------------

  const pills = [
    {
      id: "all",
      slug: "videos",
      name:
        translations["videos.all"] ?? "All",
    },

    ...(languageCategories ?? []).map(
      (language) => ({
        id: language.id,
        slug: language.slug,
        name:
          languageLabels[language.id] ??
          language.slug,
      })
    ),
  ];

  // --------------------------------------------------
  // Fetch published videos
  // --------------------------------------------------

  const {
    data: videos,
    error: videosError,
  } = await supabase
    .from("videos")
    .select(`
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

      channels (
        id,
        channel_name,
        slug,
        logo_url,
        user_id,

        profiles (
          id,
          display_name,
          avatar_url,
          is_creator
        )
      )
    `)
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (videosError) {
    console.error(
      "Failed to load videos:",
      videosError
    );
  }

  // --------------------------------------------------
  // Build category labels
  // First level + last level
  // Example: English - Business
  // --------------------------------------------------

  let formattedVideos = videos ?? [];

  const categoryIds = [
    ...new Set(
      formattedVideos
        .map((video) => video.category_id)
        .filter(
          (id): id is string => Boolean(id)
        )
    ),
  ];

  if (categoryIds.length > 0) {
    const categoryLabels =
      await getCategoryLabels(
        categoryIds,
        locale
      );

    formattedVideos = formattedVideos.map(
      (video) => ({
        ...video,
        category_label:
          video.category_id
            ? categoryLabels[
                video.category_id
              ] ?? ""
            : "",
      })
    );
  } else {
    formattedVideos = formattedVideos.map(
      (video) => ({
        ...video,
        category_label: "",
      })
    );
  }

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-7xl">
        <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="transition hover:text-gray-900"
          >
            {translations["videos.home"] ?? "Home"}
          </Link>

          <span>/</span>

          <span className="font-medium text-foreground">
            {translations["videos.title"] ?? "Videos"}
          </span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900">
          {translations["videos.all_videos"] ??
            "All Videos"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {translations["videos.description"] ??
            "Discover language videos from creators around the world."}
        </p>
      </div>

      {/* Language filter */}
      <CategoryPills
        categories={pills}
        selectedCategory="all"
        basePath="/videos"
      />

      {/* Result label */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <p className="text-sm font-medium text-gray-600">
          {translations["videos.all_videos"] ??
            "All Videos"}
        </p>
      </div>

      {/* Videos */}
      <VideoSection
        showViewAll={false}
        videos={formattedVideos}
        locale={locale}
      />
    </div>
  );
}