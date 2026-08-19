import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/VideoCard";
import { getCategoryLabel } from "@/lib/categories";

export default async function WatchHistoryPage() {
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
     GET WATCH HISTORY
  ======================================================== */

  const { data: history, error } = await supabase
    .from("watch_history")
    .select(`
      id,
      watched_at,
      progress_seconds,

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
            display_name,
            avatar_url,
            is_creator
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .order("watched_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading watch history:",
      error
    );
  }

  /* ========================================================
     PREPARE VIDEOS
  ======================================================== */

  const videos: any[] = [];

  for (const item of history ?? []) {
    const video = Array.isArray(item.videos)
      ? item.videos[0]
      : item.videos;

    if (!video) continue;

    // Don't show unpublished/deleted videos
    if (video.status !== "published") continue;

    /* ======================================================
       CHANNEL
    ====================================================== */

    const channel = Array.isArray(video.channels)
      ? video.channels[0]
      : video.channels;

    /* ======================================================
       CREATOR
    ====================================================== */

    const profile = Array.isArray(channel?.profiles)
      ? channel.profiles[0]
      : channel?.profiles;

    const creatorName =
      profile?.display_name ||
      "Creator";

    const avatar =
      profile?.avatar_url ||
      channel?.logo_url ||
      "";

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

      creator: creatorName,
      avatar,

      channel_name:
        channel?.channel_name ?? "",

      watched_at: item.watched_at,
      progress_seconds:
        item.progress_seconds ?? 0,
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
            Watch History
          </h1>

          <p className="mt-2 text-sm text-muted">
            Videos you've watched recently.
          </p>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">

            <h2 className="text-lg font-semibold text-foreground">
              No watch history
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Videos you watch will appear here so
              you can easily continue watching them later.
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
                creator={video.creator}
                thumbnail={video.thumbnail_url || ""}
                avatar={video.avatar}
                channelName={video.channel_name}
                views={video.view_count}
                createdAt={video.created_at}
                level={video.level}
                accessType={video.access_type}
                categoryLabel={
                  video.category_label || ""
                }
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}