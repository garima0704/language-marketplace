import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

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
     GET SELECTED LOCALE
  ======================================================== */

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  /* ========================================================
     TRANSLATIONS
  ======================================================== */

  const translations = await getTranslations(
    [
      // Watch history
      "watch_history.title",
      "watch_history.description",
      "watch_history.empty.title",
      "watch_history.empty.description",

      // Video card
      "video.no_thumbnail",
      "video.views",
      "video.view",
      "video.published",
      "video.draft",
      "video.free",
      "video.subscribers_only",
      "video.manage",

      // Video levels
      "level.beginner",
      "level.intermediate",
      "level.advanced",
      "level.fluent",
    ],
    locale
  );

  const videoTranslations = {
    noThumbnail:
      translations["video.no_thumbnail"] ??
      "No thumbnail",

    views:
      translations["video.views"] ??
      "views",

    published:
      translations["video.published"] ??
      "Published",

    draft:
      translations["video.draft"] ??
      "Draft",

    free:
      translations["video.free"] ??
      "Free",

    subscribersOnly:
      translations["video.subscribers_only"] ??
      "Subscribers only",

    manage:
      translations["video.manage"] ??
      "Manage",
    
    view:
      translations["video.view"] ??
      "View",
  };

  const levelTranslations = {
    beginner:
      translations["level.beginner"] ??
      "Beginner",

    intermediate:
      translations["level.intermediate"] ??
      "Intermediate",

    advanced:
      translations["level.advanced"] ??
      "Advanced",

    fluent:
      translations["level.fluent"] ??
      "Fluent",
  };

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
          level
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
       CATEGORY
    ====================================================== */

    const category = Array.isArray(video.categories)
      ? video.categories[0]
      : video.categories;

    const categoryLabel = await getCategoryLabel(
      category?.id,
      locale
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

      watched_at: item.watched_at,
      progress_seconds: item.progress_seconds ?? 0,
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
            {translations["watch_history.title"] ??
              "Watch History"}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {translations["watch_history.description"] ??
              "Videos you've watched recently."}
          </p>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {translations["watch_history.empty.title"] ??
                "No watch history"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {translations["watch_history.empty.description"] ??
                "Videos you watch will appear here so you can easily continue watching them later."}
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
                locale={locale}
                translations={videoTranslations}
                levelTranslations={levelTranslations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
