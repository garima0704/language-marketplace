import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ChannelVideoCard from "@/components/channels/ChannelVideoCard";

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
          logo_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Error loading saved videos:",
      error
    );
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
     BUILD CATEGORY PATH
  ====================================================== */

  const categoryPath: any[] = [];

  let currentCategory = Array.isArray(
    video.categories
  )
    ? video.categories[0]
    : video.categories;

  while (currentCategory) {
    categoryPath.unshift(currentCategory);

    if (!currentCategory.parent_id) {
      break;
    }

    const { data: parentCategory } =
      await supabase
        .from("categories")
        .select(`
          id,
          slug,
          parent_id,
          level,

          category_translations (
            name,
            locale_code
          )
        `)
        .eq("id", currentCategory.parent_id)
        .single();

    if (!parentCategory) {
      break;
    }

    currentCategory = parentCategory;
  }

  /* ======================================================
    CATEGORY LABEL
    ====================================================== */

function getCategoryName(category: any) {
  if (!category) return "";

  const translations =
    category.category_translations ?? [];

  const translation =
    translations.find(
      (item: any) =>
        item.locale_code === "en"
    ) ??
    translations[0];

  return (
    translation?.name ??
    formatText(category.slug)
  );
}

/*
 * First category = top-level language
 * Last category = actual category assigned to video
 */
const topCategory =
  categoryPath[0];

const selectedCategory =
  categoryPath[categoryPath.length - 1];

const topCategoryName =
  getCategoryName(topCategory);

const selectedCategoryName =
  getCategoryName(selectedCategory);

/*
 * Avoid:
 *
 * Arabic - Arabic
 *
 * when the video itself belongs directly
 * to the top-level category.
 */
const categoryLabel =
  topCategory?.id === selectedCategory?.id
    ? topCategoryName
    : `${topCategoryName} - ${selectedCategoryName}`;

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

    category_label:
      categoryLabel || undefined,

    channel_name:
      channel?.channel_name ?? null,

    channel_slug:
      channel?.slug ?? null,

    channel_logo:
      channel?.logo_url ?? null,

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

          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">

            {videos.map((video: any) => (
              <ChannelVideoCard
                key={video.id}
                video={video}
                channelName={
                  video.channel_name ?? "Channel"
                }
                channelLogo={
                  video.channel_logo
                }
              />
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   Helper
========================================================= */

function formatText(
  value?: string | null
) {
  if (!value) return "";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}