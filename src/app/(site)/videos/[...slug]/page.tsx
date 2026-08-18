import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import CategoryVideos from "@/components/videos/CategoryVideos";
import VideoDetail from "@/components/videos/VideoDetail";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function VideosSlugPage({
  params,
}: Props) {
  const { slug } = await params;

  if (!slug?.length) {
    notFound();
  }

  const supabase = await createClient();

  function formatText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

  // ==================================================
  // 1. Try to resolve the complete path as a category
  // ==================================================

  let parentId: string | null = null;
  let categoryFound = true;

  for (const segment of slug) {
    let query = supabase
      .from("categories")
      .select("id, slug, parent_id, level")
      .eq("slug", segment)
      .eq("is_active", true);

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } =
      await query.maybeSingle();

    if (error || !data) {
      categoryFound = false;
      break;
    }

    parentId = data.id;
  }

  // ==================================================
  // 2. Category URL
  // ==================================================

  if (categoryFound) {
    return <CategoryVideos slug={slug} />;
  }

  // ==================================================
  // 3. Video URL
  // ==================================================

// ==================================================
// 3. Video URL
// ==================================================

if (slug.length === 1) {
  const videoSlug = slug[0];

  // --------------------------------------------------
  // Current authenticated user
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --------------------------------------------------
  // Fetch video
  // --------------------------------------------------

  const {
    data: videoData,
    error: videoError,
  } = await supabase
    .from("videos")
    .select(`
      *,
      channels (
        *,
        profiles (*)
      )
    `)
    .eq("slug", videoSlug)
    .eq("status", "published")
    .maybeSingle();

  if (videoError) {
    console.error(
      "Video lookup error:",
      videoError
    );

    notFound();
  }

  if (!videoData) {
    notFound();
  }

  // ==================================================
// CATEGORY PATH
// ==================================================

const categoryPath: {
  id: string;
  slug: string;
  name: string;
}[] = [];

let currentCategoryId =
  videoData.category_id as string | null;

while (currentCategoryId) {
  const { data: category } = await supabase
    .from("categories")
    .select(`
      id,
      slug,
      parent_id,
      category_translations (
        name,
        locale_code
      )
    `)
    .eq("id", currentCategoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (!category) {
    break;
  }

  const translations = Array.isArray(
    category.category_translations
  )
    ? category.category_translations
    : [];

  const translation =
    translations.find(
      (item: any) =>
        item.locale_code === "en"
    ) ?? translations[0];

  categoryPath.unshift({
    id: category.id,
    slug: category.slug,
    name:
      translation?.name ??
      formatText(category.slug),
  });

  currentCategoryId =
    category.parent_id;
}


  // ==================================================
// LANGUAGE + REGION
// ==================================================

let languageName =
  videoData.language_code || "";

let languageDescription =
  languageName;

// --------------------------------------------------
// Language name
// --------------------------------------------------

if (videoData.language_code) {
  const { data: language } =
    await supabase
      .from("locales")
      .select("code, name")
      .eq("code", videoData.language_code)
      .maybeSingle();

  if (language?.name) {
    languageName = language.name;
  }
}

// --------------------------------------------------
// Language region
// --------------------------------------------------

if (videoData.language_region_id) {
  const { data: languageRegion } =
    await supabase
      .from("language_regions")
      .select(`
        id,
        language_code,
        country,
        state
      `)
      .eq("id", videoData.language_region_id)
      .maybeSingle();

  if (languageRegion) {
    const locationParts = [
      languageRegion.country,
      languageRegion.state,
    ].filter(Boolean);

    if (locationParts.length > 0) {
      languageDescription =
        `${languageName} from ${locationParts.join(", ")}`;
    } else {
      languageDescription = languageName;
    }
  }
}

  // ==================================================
  // SUBTITLE LANGUAGE
  // ==================================================

  let subtitleLanguageName =
    videoData.subtitle_language_code;

  if (videoData.subtitle_language_code) {
    const { data: subtitleLanguage } =
      await supabase
        .from("locales")
        .select("code, name")
        .eq(
          "code",
          videoData.subtitle_language_code
        )
        .maybeSingle();

    if (subtitleLanguage?.name) {
      subtitleLanguageName =
        subtitleLanguage.name;
    }
  }

// ==================================================
// AUTHENTICATION
// ==================================================

const isAuthenticated = !!user;

// ==================================================
// SAVED VIDEO
// ==================================================

let isSaved = false;

if (user) {
  const {
    data: savedVideo,
    error: savedVideoError,
  } = await supabase
    .from("saved_videos")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoData.id)
    .maybeSingle();

  if (savedVideoError) {
    console.error(
      "Saved video lookup error:",
      savedVideoError
    );
  }

  isSaved = !!savedVideo;
}

// ==================================================
// SUBSCRIPTION
// ==================================================

let hasActiveSubscription = false;

if (user && videoData.channel_id) {
  const {
    data: subscription,
    error: subscriptionError,
  } = await supabase
    .from("subscriptions")
    .select(`
      id,
      status,
      current_period_end
    `)
    .eq("buyer_id", user.id)
    .eq("channel_id", videoData.channel_id)
    .eq("status", "active")
    .maybeSingle();

  if (subscriptionError) {
    console.error(
      "Subscription lookup error:",
      subscriptionError
    );
  }

  hasActiveSubscription =
    !!subscription;
}

// ==================================================
// WATCH ACCESS
// ==================================================

const canWatch =
  isAuthenticated &&
  (
    videoData.access_type === "free" ||
    hasActiveSubscription
  );

// ==================================================
// VIDEO URL
// ==================================================

let videoUrl: string | null = null;

if (
  canWatch &&
  videoData.video_provider === "supabase" &&
  videoData.video_id
) {
  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await supabase.storage
    .from("videos")
    .createSignedUrl(
      videoData.video_id,
      60 * 60 // 1 hour
    );

  if (signedUrlError) {
    console.error(
      "Video signed URL error:",
      signedUrlError
    );
  } else {
    videoUrl =
      signedUrlData?.signedUrl ?? null;
  }
}

// ==================================================
// BUILD VIDEO OBJECT
// ==================================================

const video = {
  ...videoData,

  category_path: categoryPath,

  language_name: languageName,

  language_description:
    languageDescription,

  subtitle_language_name:
    subtitleLanguageName,

  is_authenticated:
    isAuthenticated,

  is_saved:
    isSaved,

  can_watch:
    canWatch,

  has_active_subscription:
    hasActiveSubscription,

  video_url:
    videoUrl,
};

return <VideoDetail video={video} />;

// ==================================================
// 4. Nothing found
// ==================================================

notFound();
}
}