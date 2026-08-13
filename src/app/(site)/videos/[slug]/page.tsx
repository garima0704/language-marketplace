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

     Example:

     Spanish from Argentina, Buenos Aires
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
     VIDEO URL

     video.video_id contains something like:

     1efeb750-.../90957...-niceconvo.mp4

     This is a Supabase Storage path.

     We convert it into the actual public URL here.
  ======================================================== */

  let videoUrl = video.video_id;

  if (
    video.video_provider === "supabase" &&
    video.video_id
  ) {
    const {
      data: publicVideo,
    } = supabase.storage
      .from("videos")
      .getPublicUrl(video.video_id);

    videoUrl =
      publicVideo?.publicUrl ||
      video.video_id;
  }

  /* ========================================================
     Render
  ======================================================== */

  return (
    <div className="px-6 py-6">
      <VideoDetail
        video={{
          ...video,

          /* Creator */

          language_name: languageName,

          subtitle_language_name:
            subtitleLanguageName,

          language_description:
            languageDescription,

          /* Breadcrumbs */

          category_path:
            categoryPathWithNames,

          /* Actual playable video URL */

          video_url: videoUrl,
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