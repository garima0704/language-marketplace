import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import CategoryBar from "@/components/CategoryBar";
import VideoSection from "@/components/VideoSection";

export default async function VideosPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Top-level language categories
  // --------------------------------------------------

  const { data: languages, error: languagesError } =
    await supabase
      .from("categories")
      .select(`
        id,
        slug,
        display_order,
        category_translations!inner(
          locale_code,
          name
        )
      `)
      .is("parent_id", null)
      .eq("is_active", true)
      .eq("category_translations.locale_code", "en")
      .order("display_order");

  // --------------------------------------------------
  // Language pills
  // --------------------------------------------------

  const pills = [
    {
      id: "all",
      slug: "videos",
      name: "All",
    },

    ...(languages ?? []).map((language) => ({
      id: language.id,
      slug: language.slug,
      name:
        language.category_translations[0]?.name ??
        language.slug,
    })),
  ];

  // --------------------------------------------------
  // Fetch published videos
  // --------------------------------------------------

  const { data: videos, error: videosError } =
    await supabase
      .from("videos")
      .select(`
        id,
        title,
        thumbnail_url,
        level,
        access_type,
        view_count,
        created_at,
        published_at,

        channels (
          id,
          channel_name,
          logo_url,
          user_id,

          profiles (
            id,
            display_name,
            avatar_url,
            is_creator
          )
        ),

        categories (
          id,
          slug,

          category_translations (
            name,
            locale_code
          )
        )
      `)
      .eq("status", "published")
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      });

  console.log("languages:", languages);
  console.log("languages error:", languagesError);

  console.log("videos:", videos);
  console.log("videos error:", videosError);

  return (
    <div className="px-6 py-6">

      {/* Header */}
      <div className="mx-auto mb-6 max-w-7xl">

        <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="transition hover:text-gray-900"
          >
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-foreground">
            Videos
          </span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900">
          All Videos
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover language videos from creators around the world.
        </p>

      </div>

      {/* Language filter */}
      <CategoryBar
        categories={pills}
        selectedCategory="all"
        basePath="/videos"
      />

      {/* Result label */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <p className="text-sm font-medium text-gray-600">
          All Videos
        </p>
      </div>

      {/* Videos */}
      <VideoSection
        showViewAll={false}
        videos={videos ?? []}
      />

    </div>
  );
}