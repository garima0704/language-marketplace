import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import VideoDetail from "@/components/videos/VideoDetail";

interface VideoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type Category = {
  id: string;
  slug: string;
  parent_id: string | null;
  level: number;
  category_translations?: {
    name: string;
    locale_code: string;
  }[];
};

export default async function VideoPage({
  params,
}: VideoPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

  /* ========================================================
     Get video
  ======================================================== */

  const { data: video, error } = await supabase
    .from("videos")
    .select(`
      *,

      channels (
        id,
        channel_name,
        slug,
        logo_url,
        subscription_price,
        currency,

        profiles (
          id,
          display_name,
          username,
          avatar_url
        )
      ),

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

      language:locales!videos_language_fkey (
        code,
        name
      ),

      subtitle_language:locales!videos_subtitle_language_fkey (
        code,
        name
      ),

      language_region:language_regions!videos_language_region_fkey (
        id,
        language_code,
        country,
        state,
        sort_order
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !video) {
    notFound();
  }

  /* ========================================================
     Build category hierarchy
  ======================================================== */

  const categoryPath: Category[] = [];

  let currentCategory =
    video.categories as Category | null;

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

    currentCategory =
      parentCategory as Category;
  }

  /* ========================================================
     Category display names
  ======================================================== */

  const categoryPathWithNames =
    categoryPath.map((category) => {
      const translations =
        category.category_translations ?? [];

      const translation =
        translations.find(
          (item) =>
            item.locale_code === "en"
        ) ??
        translations[0];

      return {
        id: category.id,
        slug: category.slug,
        name:
          translation?.name ??
          formatText(category.slug),
      };
    });

  /* ========================================================
     Language
  ======================================================== */

  const languageName =
    video.language?.name ||
    formatText(video.language_code);

  /* ========================================================
     Subtitle language
  ======================================================== */

  const subtitleLanguageName =
    video.subtitle_language?.name ||
    (
      video.subtitle_language_code
        ? formatText(
            video.subtitle_language_code
          )
        : ""
    );

  /* ========================================================
     Language region
  ======================================================== */

  const languageRegion =
    video.language_region;

  const languageDescription = [
    languageName
      ? `${languageName}${
          languageRegion?.country
            ? ` from ${languageRegion.country}`
            : ""
        }`
      : null,

    languageRegion?.state || null,
  ]
    .filter(Boolean)
    .join(", ");

  /* ========================================================
   VIDEO ACCESS
======================================================== */

let hasActiveSubscription = false;
let canWatch = false;
let videoUrl: string | null = null;

/*
 * Nobody can watch without authentication.
 */
if (user) {
  /*
   * FREE VIDEO
   *
   * Any authenticated user can watch.
   */
  if (video.access_type === "free") {
    canWatch = true;
  }

  /*
   * SUBSCRIBER VIDEO
   *
   * Check whether the current user has
   * an active subscription to this channel.
   */
  if (
    video.access_type === "subscriber" &&
    video.channel_id
  ) {
    const { data: subscription } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("channel_id", video.channel_id)
        .eq("status", "active")
        .gt(
          "current_period_end",
          new Date().toISOString()
        )
        .maybeSingle();

    if (subscription) {
      hasActiveSubscription = true;
      canWatch = true;
    }
  }
}
  /* ========================================================
     SIGNED VIDEO URL
  ======================================================== */

  /*
   * Only generate a signed URL when the user
   * is actually authorized to watch.
   */
  if (
    canWatch &&
    video.video_provider === "supabase" &&
    video.video_id
  ) {
    const {
      data: signedVideo,
      error: signedUrlError,
    } = await supabase.storage
      .from("videos")
      .createSignedUrl(
        video.video_id,
        60 * 60
      );

    if (
      !signedUrlError &&
      signedVideo?.signedUrl
    ) {
      videoUrl = signedVideo.signedUrl;
    } else {
      canWatch = false;
    }
  }

  let isSaved = false;

if (user) {
  const { data: savedVideo } = await supabase
    .from("saved_videos")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", video.id)
    .maybeSingle();

  isSaved = !!savedVideo;
}

  /* ========================================================
     Render
  ======================================================== */

  return (
    <div className="px-6 py-6">
      <VideoDetail
      video={{
        ...video,

        language_name: languageName,

        subtitle_language_name:
          subtitleLanguageName,

        language_description:
          languageDescription,

        category_path:
          categoryPathWithNames,

        is_authenticated: !!user,

        has_active_subscription:
          hasActiveSubscription,

        can_watch:
          canWatch,

        video_url:
          videoUrl,

        is_saved:
          isSaved,
      }}
    />
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