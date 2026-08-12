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
  // Debug
  // --------------------------------------------------

  console.log("languages:", languagePills);
  console.log("languages error:", languagesError);

  console.log("trending videos:", trendingVideos);
  console.log("trending error:", trendingError);

  console.log("latest videos:", latestVideos);
  console.log("latest error:", latestError);

  return (
    <div className="px-6 py-6">
      <CategoryBar
        categories={languagePills}
        basePath="/categories"
      />

      <VideoSection
        title="Trending Videos"
        videos={trendingVideos ?? []}
      />

      <CreatorSection />

      <VideoSection
        title="Latest Videos"
        videos={latestVideos ?? []}
      />
    </div>
  );
}