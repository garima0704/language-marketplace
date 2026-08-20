import CategoryBar from "@/components/CategoryBar";
import CreatorSection from "@/components/CreatorSection";
import VideoSection from "@/components/VideoSection";
import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/categories";

export default async function HomePage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch languages
  // --------------------------------------------------

  const { data: languages } = await supabase
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
  // --------------------------------------------------

  const { data: trendingVideos } = await supabase
    .from("videos")
    .select(videoSelect)
    .eq("status", "published")
    .eq("channels.profiles.is_creator", true)
    .order("view_count", {
      ascending: false,
    })
    .limit(8);

  // --------------------------------------------------
  // Latest videos
  // --------------------------------------------------

  const { data: latestVideos } = await supabase
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
  // Add category labels
  // --------------------------------------------------

  const formattedTrendingVideos = await Promise.all(
    (trendingVideos ?? []).map(async (video) => ({
      ...video,
      category_label: await getCategoryLabel(
        video.category_id
      ),
    }))
  );

  const formattedLatestVideos = await Promise.all(
    (latestVideos ?? []).map(async (video) => ({
      ...video,
      category_label: await getCategoryLabel(
        video.category_id
      ),
    }))
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

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