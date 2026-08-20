import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/VideoCard";
import { getCategoryLabel } from "@/lib/categories";

export default async function SavedVideosPage() {
  const supabase = await createClient();

  /* ========================================================
     AUTHENTICATED USER
  ======================================================== */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ========================================================
     GET SAVED VIDEOS
  ======================================================== */

  const { data: savedVideos, error } = await supabase
    .from("saved_videos")
    .select(`
      id,
      created_at,

      videos (
        id,
        slug,
        title,
        thumbnail_url,
        access_type,
        view_count,
        created_at,
        level,
        status,

        categories (
          id,
          slug,
          parent_id,
          level,

          category_translations (
            name,
            locale_code
          )
        ),

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
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading saved videos:", error);
  }

  /* ========================================================
     PREPARE VIDEOS
  ======================================================== */

  const videos: any[] = [];

  for (const saved of savedVideos ?? []) {
    const video = Array.isArray(saved.videos)
      ? saved.videos[0]
      : saved.videos;

    if (!video) continue;

    const channel = Array.isArray(video.channels)
      ? video.channels[0]
      : video.channels;

    /* ======================================================
       CATEGORY
    ====================================================== */

    const category = Array.isArray(video.categories)
      ? video.categories[0]
      : video.categories;

    const categoryLabel = await getCategoryLabel(
      category?.id
    );

    /* ======================================================
       ADD VIDEO
    ====================================================== */

    videos.push({
      id: video.id,
      slug: video.slug,
      title: video.title,
      thumbnail_url: video.thumbnail_url,
      access_type: video.access_type,
      view_count: video.view_count ?? 0,
      created_at: video.created_at,
      level: video.level,

      category_label: categoryLabel,

      channel_name: channel?.channel_name ?? "",
      channel_slug: channel?.slug ?? "",
      channel_logo: channel?.logo_url ?? "",

      saved_at: saved.created_at,
    });
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Saved Videos
          </h1>

          <p className="mt-2 text-sm text-muted">
            Videos you've saved to watch later.
          </p>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No saved videos
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Videos you save will appear here so you
              can easily find them later.
            </p>
          </div>
        ) : (

          /* ==================================================
             VIDEO GRID
          ================================================== */

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video: any) => (
              <VideoCard
                key={video.id}
                id={video.id}
                slug={video.slug}
                title={video.title}
                thumbnail={video.thumbnail_url || ""}
                channelName={video.channel_name}
                channelSlug={video.channel_slug}
                channelLogo={video.channel_logo}
                views={video.view_count}
                createdAt={video.created_at}
                level={video.level}
                accessType={video.access_type}
                categoryLabel={video.category_label || ""}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}