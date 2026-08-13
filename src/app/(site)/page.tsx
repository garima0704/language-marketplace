import CategoryBar from "@/components/CategoryBar";
import CreatorSection from "@/components/CreatorSection";
import VideoSection from "@/components/VideoSection";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch languages
  // --------------------------------------------------

  const { data: languages, error: languagesError } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      category_translations(
        name,
        locale_code
      )
    `)
    .is("parent_id", null)
    .eq("level", 1)
    .eq("is_active", true)
    .order("display_order");

  const languagePills = (languages ?? []).map((language) => ({
    id: language.id,
    slug: language.slug,
    name:
      language.category_translations[0]?.name ??
      language.slug,
  }));

  // --------------------------------------------------
  // Shared video fields
  // --------------------------------------------------

  const videoSelect = `
    id,
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
  `;

  // --------------------------------------------------
  // Trending videos
  // Most viewed published videos
  // Only videos belonging to creators
  // --------------------------------------------------

  const { data: trendingVideos, error: trendingError } =
    await supabase
      .from("videos")
      .select(videoSelect)
      .eq("status", "published")
      .eq("channels.profiles.is_creator", true)
      .order("view_count", { ascending: false })
      .limit(8);

  // --------------------------------------------------
  // Latest videos
  // Most recently published videos
  // Only videos belonging to creators
  // --------------------------------------------------

  const { data: latestVideos, error: latestError } =
    await supabase
      .from("videos")
      .select(videoSelect)
      .eq("status", "published")
      .eq("channels.profiles.is_creator", true)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(8);

  // --------------------------------------------------
  // Build category labels
  // First level + last level
  // Example: English - Business
  // --------------------------------------------------

  const allVideos = [
    ...(trendingVideos ?? []),
    ...(latestVideos ?? []),
  ];

  const categoryIds = [
    ...new Set(
      allVideos
        .map((video) => video.category_id)
        .filter(Boolean)
    ),
  ];

  const categoryLabelMap = new Map<string, string>();

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

    // Get category names
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

    // Build label for every video
    allVideos.forEach((video) => {
      if (!video.category_id) return;

      const current = categoryById.get(video.category_id);

      if (!current) return;

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

      const label =
        root.id === current.id
          ? rootName
          : `${rootName} - ${deepestName}`;

      categoryLabelMap.set(video.id, label);
    });
  }

  // --------------------------------------------------
  // Add category labels to videos
  // --------------------------------------------------

  const formattedTrendingVideos = (trendingVideos ?? []).map(
    (video) => ({
      ...video,
      category_label:
        categoryLabelMap.get(video.id) ?? "",
    })
  );

  const formattedLatestVideos = (latestVideos ?? []).map(
    (video) => ({
      ...video,
      category_label:
        categoryLabelMap.get(video.id) ?? "",
    })
  );

  return (
    <div className="px-6 py-6">
      <CategoryBar
        categories={languagePills}
        basePath="/videos"
      />

      <VideoSection
        title="Trending Videos"
        videos={formattedTrendingVideos}
      />

      <CreatorSection />

      <VideoSection
        title="Latest Videos"
        videos={formattedLatestVideos}
      />
    </div>
  );
}