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
      .filter(Boolean)
  ),
];

if (categoryIds.length > 0) {
  const allCategoryIds = new Set<string>(categoryIds);
  let currentIds = categoryIds;

  // Get all parent categories
  while (currentIds.length > 0) {
    const { data: parents } = await supabase
      .from("categories")
      .select("id, parent_id, slug, level")
      .in("id", currentIds);

    if (!parents?.length) break;

    const parentIds = parents
      .map((category) => category.parent_id)
      .filter(
        (id): id is string =>
          !!id && !allCategoryIds.has(id)
      );

    if (parentIds.length === 0) break;

    parentIds.forEach((id) => allCategoryIds.add(id));
    currentIds = parentIds;
  }

  // Get all categories
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, parent_id, slug, level")
    .in("id", Array.from(allCategoryIds));

  // Get English category names
  const { data: translations } = await supabase
    .from("category_translations")
    .select("category_id, name")
    .eq("locale_code", "en")
    .in("category_id", Array.from(allCategoryIds));

  const categoryById = new Map(
    (allCategories ?? []).map((category) => [
      category.id,
      category,
    ])
  );

  const nameById = new Map(
    (translations ?? []).map((translation) => [
      translation.category_id,
      translation.name,
    ])
  );

  // Build label for each video
  formattedVideos = formattedVideos.map((video) => {
    if (!video.category_id) {
      return {
        ...video,
        category_label: "",
      };
    }

    const current = categoryById.get(video.category_id);

    if (!current) {
      return {
        ...video,
        category_label: "",
      };
    }

    const deepestName =
      nameById.get(current.id) ?? current.slug;

    let root = current;

    while (root.parent_id) {
      const parent = categoryById.get(root.parent_id);

      if (!parent) break;

      root = parent;
    }

    const rootName =
      nameById.get(root.id) ?? root.slug;

    return {
      ...video,
      category_label:
        root.id === current.id
          ? rootName
          : `${rootName} - ${deepestName}`,
    };
  });
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
        videos={formattedVideos}
      />

    </div>
  );
}