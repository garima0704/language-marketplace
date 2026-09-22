import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { getCategoryLabels } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";

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
  // ==================================================
  // Next.js 16
  // params is a Promise
  // ==================================================

  const { slug } = await params;

  if (!slug?.length) {
    notFound();
  }

  const supabase = await createClient();

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // ==================================================
  // 1. Check whether the first segment is a browse
  // language
  //
  // Examples:
  //
  // /videos/en
  // /videos/es
  // /videos/ar
  // /videos/zh
  // /videos/fr
  // /videos/de
  // /videos/it
  // /videos/pt
  //
  // If it is a language, CategoryVideos handles
  // the complete remaining category path.
  // ==================================================

  const firstSegment = slug[0];

  const {
    data: language,
    error: languageError,
  } = await supabase
    .from("locales")
    .select("code, name")
    .eq("code", firstSegment)
    .eq("is_active", true)
    .maybeSingle();

  if (languageError) {
    console.error(
      "Failed to resolve browse language:",
      languageError
    );
  }

  // ==================================================
  // 2. Language / Category page
  //
  // /videos/en
  // /videos/en/business
  // /videos/en/business/finance
  //
  // CategoryVideos is responsible for:
  // - category hierarchy
  // - category pills
  // - language pills
  // - language-specific videos
  // - translated category labels
  // ==================================================

  if (language) {
    return (
      <CategoryVideos slug={slug} />
    );
  }

  // ==================================================
  // 3. Video detail page
  //
  // If the first segment is NOT a language and
  // there is only one URL segment, treat it as
  // a video slug.
  //
  // Example:
  //
  // /videos/my-video-slug
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
    // Current UI translations
    // --------------------------------------------------

    const translations = await getTranslations(
      [
        "video.from",
        "video.home",
        "general.videos",
        "video.views",

        "video.browser_not_supported",

        "video.login_to_watch",
        "video.login_free_video",
        "video.login_video",
        "video.login_to_watch_button",

        "video.subscribe_to_watch",
        "video.subscribe_to_channel",

        "video.posted_by",
        "video.description",
        "channel.no_description",

        "video.details",
        "video.skill",
        "video.language",
        "video.subtitles",
        "video.native_speaker",
        "video.captions",
        "video.explains_idioms",
        "video.explains_technical_lingo",
        "video.profanity",
        "video.ai_voice",
        "video.idioms",
        "video.technical",

        "video.access",
        "video.video_access",
        "video.free",
        "video.subscribers_only",
        "video.available",

        "channel.month",
        "channel.subscribed",
        "channel.subscribe",

        "common.yes",
        "common.no",

        "video.original",

        "video.related_videos",
        "video.view_all",
        "video.no_thumbnail",
        "video.channel_subscription",

        "video.save",
        "video.saved",
        "video.remove_from_saved",
        "video.login_to_save",

        "video.comments",
        "video.add_comment",
        "video.comment",
        "video.reply",
        "video.delete",
        "video.like_comment",
        "video.unlike_comment",
        "video.like",
        "video.unlike",
        "video.login_to_like",
        "video.reply_to",
        "video.posting",
        "video.hide_replies",
        "video.view",
        "video.replies",
        "video.login_to_comment",
        "video.login_to_join_conversation",
        "video.loading_comments",
        "video.no_comments",
        "video.first_comment",
        "video.comments_load_error",
        "video.comment_post_error",
        "video.reply_post_error",
        "video.comment_like_exists",
        "video.comment_like_error",
        "video.comment_delete_error",
        "video.delete_comment_confirm",
        "video.you",
        "channel_form.cancel",

        "report.report",
        "report.reported",
        "report.report_video",
        "report.login_to_report",
        "report.submitted",
        "report.submitted_description",
        "report.already_reported",
        "report.already_reported_description",
        "report.description",
        "report.reason_question",
        "report.reason_spam",
        "report.reason_inappropriate",
        "report.reason_copyright",
        "report.reason_harassment",
        "report.reason_violence",
        "report.reason_misleading",
        "report.reason_other",
        "report.additional_details",
        "report.details_placeholder",
        "report.submitting",
        "report.submit",
        "report.submit_error",
        "common.done",
        "common.close",
        "common.optional",

        "rating.title",
        "rating.rating",
        "rating.ratings",
        "rating.no_ratings",
        "rating.your_rating",
        "rating.rate_video",
        "rating.login_to_rate",
        "rating.edit",
        "rating.update",
        "rating.submit",
        "rating.review_placeholder",
        "rating.rating_aria",
        "rating.loading_error",
        "rating.login_error",
        "rating.select_error",
        "rating.review_min_error",
        "rating.review_max_error",
        "rating.save_error",
        "rating.reviews",
        "rating.first_to_rate",
        "rating.first_to_rate_description",
        "rating.user",

        "auth.login",

        "level.beginner",
        "level.intermediate",
        "level.advanced",
        "level.fluent",

        "language.en",
        "language.es",
        "language.ar",
        "language.zh",
        "language.fr",
        "language.de",
        "language.it",
        "language.pt",
      ],
      locale
    );

    // --------------------------------------------------
    // Fetch current video
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

    const currentCategoryId =
      videoData.category_id as string | null;

    if (currentCategoryId) {
      // ------------------------------------------------
      // Load category hierarchy
      // ------------------------------------------------

      const categoryMap = new Map<
        string,
        {
          id: string;
          slug: string;
          parent_id: string | null;
          level: number;
        }
      >();

      let categoryIds = [
        currentCategoryId,
      ];

      while (categoryIds.length > 0) {
        const {
          data: categories,
          error: categoriesError,
        } = await supabase
          .from("categories")
          .select(
            "id, slug, parent_id, level"
          )
          .eq("is_active", true)
          .in("id", categoryIds);

        if (categoriesError) {
          console.error(
            "Category lookup error:",
            categoriesError
          );

          break;
        }

        if (!categories?.length) {
          break;
        }

        const parentIds: string[] = [];

        for (const category of categories) {
          categoryMap.set(
            category.id,
            category
          );

          if (
            category.parent_id &&
            !categoryMap.has(
              category.parent_id
            )
          ) {
            parentIds.push(
              category.parent_id
            );
          }
        }

        categoryIds = [
          ...new Set(parentIds),
        ];
      }

      // ------------------------------------------------
      // Get translated category labels
      // ------------------------------------------------

      const labels =
        await getCategoryLabels(
          Array.from(
            categoryMap.keys()
          ),
          locale
        );

      // ------------------------------------------------
      // Build category path
      // ------------------------------------------------

      const pathCategories: {
        id: string;
        slug: string;
        name: string;
      }[] = [];

      let current =
        categoryMap.get(
          currentCategoryId
        );

      while (current) {
        pathCategories.unshift({
          id: current.id,
          slug: current.slug,
          name:
            labels[current.id] ??
            current.slug,
        });

        if (!current.parent_id) {
          break;
        }

        current =
          categoryMap.get(
            current.parent_id
          );
      }

      categoryPath.push(
        ...pathCategories
      );
    }

    // ==================================================
    // LANGUAGE + REGION
    // ==================================================

    let languageName =
      videoData.language_code || "";

    let languageDescription =
      languageName;

    // --------------------------------------------------
    // Translated language name
    // --------------------------------------------------

    if (videoData.language_code) {
      const languageKey =
        `language.${videoData.language_code}`;

      languageName =
        translations[languageKey] ??
        videoData.language_code;

      languageDescription =
        languageName;
    }

    // --------------------------------------------------
    // Language region
    // --------------------------------------------------

    if (videoData.language_region_id) {
      const {
        data: languageRegion,
        error: languageRegionError,
      } = await supabase
        .from("language_regions")
        .select(`
          id,
          language_code,
          country,
          state
        `)
        .eq(
          "id",
          videoData.language_region_id
        )
        .maybeSingle();

      if (languageRegionError) {
        console.error(
          "Language region lookup error:",
          languageRegionError
        );
      }

      if (languageRegion) {
        const locationParts = [
          languageRegion.country,
          languageRegion.state,
        ].filter(Boolean);

        if (locationParts.length > 0) {
          languageDescription =
            `${languageName} ${
              translations["video.from"] ?? "from"
            } ${locationParts.join(", ")}`;
        } else {
          languageDescription =
            languageName;
        }
      }
    }

    // ==================================================
    // SUBTITLE LANGUAGE
    // ==================================================

    let subtitleLanguageName =
      videoData.subtitle_language_code || "";

    if (videoData.subtitle_language_code) {
      const subtitleLanguageKey =
        `language.${videoData.subtitle_language_code}`;

      subtitleLanguageName =
        translations[subtitleLanguageKey] ??
        videoData.subtitle_language_code;
    }

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    const isAuthenticated =
      !!user;

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
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "video_id",
          videoData.id
        )
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

    let hasActiveSubscription =
      false;

    if (
      user &&
      videoData.channel_id
    ) {
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
        .eq(
          "buyer_id",
          user.id
        )
        .eq(
          "channel_id",
          videoData.channel_id
        )
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

  const channel = Array.isArray(videoData.channels)
    ? videoData.channels[0]
    : videoData.channels;

  const channelProfile = Array.isArray(channel?.profiles)
    ? channel.profiles[0]
    : channel?.profiles;

  const isVideoOwner =
    !!user &&
    user.id === channelProfile?.id;

  const canWatch =
    isAuthenticated &&
    (
      isVideoOwner ||
      videoData.access_type === "free" ||
      hasActiveSubscription
    );

    // ==================================================
    // VIDEO URL
    // ==================================================

    let videoUrl:
      | string
      | null = null;

    if (
      canWatch &&
      videoData.video_provider ===
        "supabase" &&
      videoData.video_id
    ) {
      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabase.storage
        .from("videos")
        .createSignedUrl(
          videoData.video_id,
          60 * 60
        );

      if (signedUrlError) {
        console.error(
          "Video signed URL error:",
          signedUrlError
        );
      } else {
        videoUrl =
          signedUrlData?.signedUrl ??
          null;
      }
    }

    // ==================================================
    // RELATED VIDEOS
    //
    // Same category + same language
    // Exclude current video
    // ==================================================

    let relatedVideos: any[] = [];

    if (
      videoData.category_id &&
      videoData.language_code
    ) {
      const {
        data: relatedVideoData,
        error: relatedVideosError,
      } = await supabase
        .from("videos")
        .select(`
          id,
          slug,
          title,
          thumbnail_url,
          view_count,
          published_at,
          created_at,
          language_code,
          access_type,
          channel_id,

          channels (
            id,
            channel_name,
            slug,
            logo_url,

            profiles (
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq(
          "category_id",
          videoData.category_id
        )
        .eq(
          "language_code",
          videoData.language_code
        )
        .eq(
          "status",
          "published"
        )
        .neq(
          "id",
          videoData.id
        )
        .order(
          "published_at",
          {
            ascending: false,
            nullsFirst: false,
          }
        )
        .limit(5);

      if (relatedVideosError) {
        console.error(
          "Related videos lookup error:",
          relatedVideosError
        );
      } else {
        relatedVideos =
          relatedVideoData ?? [];
      }
    }

    // ==================================================
    // BUILD VIDEO OBJECT
    // ==================================================

    const video = {
      ...videoData,

      category_path:
        categoryPath,

      language_name:
        languageName,

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

    // ==================================================
    // RENDER VIDEO DETAIL
    // ==================================================

    return (
      <VideoDetail
        video={video}
        relatedVideos={relatedVideos}
        translations={translations}
        locale={locale}
      />
    );
  }

  // ==================================================
  // 4. Nothing found
  // ==================================================

  notFound();
}