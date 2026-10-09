import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import ChannelHeader from "@/components/channels/ChannelHeader";
import VideoCard from "@/components/VideoCard";
import { getCategoryLabels } from "@/lib/categories";
import { getTranslations } from "@/lib/translations";
import { getBrowseLanguages } from "@/lib/languages";

interface ChannelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChannelPage({
  params,
}: ChannelPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  /* =======================================================
     CURRENT UI LANGUAGE
  ======================================================== */

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  /* =======================================================
     TRANSLATIONS
  ======================================================== */

  const translations = await getTranslations(
    [
      // Channel
      "channel.videos",
      "channel.no_videos",
      "channel.created_by",
      "channel.subscribed",
      "channel.subscribe",

      // Video card
      "video.no_thumbnail",
      "video.views",
      "video.published",
      "video.draft",
      "video.free",
      "video.subscribers_only",
      "video.manage",
      "video.view",

      // Video levels
      "level.beginner",
      "level.intermediate",
      "level.advanced",
      "level.fluent",
    ],
    locale
  );

  /* =======================================================
     GET CHANNEL
  ======================================================== */

  const {
    data: channel,
    error: channelError,
  } = await supabase
    .from("channels")
    .select(`
      *,
      profiles (
        id,
        display_name,
        username,
        avatar_url,
        country
      )
    `)
    .eq("slug", slug)
    .single();

  if (channelError || !channel) {
    notFound();
  }

  /* =======================================================
     CHECK CURRENT USER SUBSCRIPTION
  ======================================================== */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSubscribed = false;

  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("channel_id", channel.id)
      .eq("status", "active")
      .maybeSingle();

    isSubscribed = !!subscription;
  }

  /* =======================================================
     GET CHANNEL VIDEOS
  ======================================================== */

  const {
    data: videos,
    error: videosError,
  } = await supabase
    .from("videos")
    .select("*")
    .eq("channel_id", channel.id)
    .order("created_at", {
      ascending: false,
    });

  if (videosError) {
    console.error(
      "Channel videos error:",
      videosError
    );
  }

  let channelVideos = videos ?? [];

  /* =======================================================
     LANGUAGE LABELS
  ======================================================== */

  const browseLanguages =
    await getBrowseLanguages(locale);

  const languageLabels: Record<string, string> =
    Object.fromEntries(
      browseLanguages.map((language) => [
        language.code,
        language.name,
      ])
    );

  /* =======================================================
     CATEGORY LABELS
  ======================================================== */

  const categoryLabels =
    await getCategoryLabels(
      channelVideos.map(
        (video) => video.category_id
      ),
      locale,
      false
    );

  /* =======================================================
     FORMAT VIDEO LABELS
  ======================================================== */

  channelVideos = channelVideos.map(
    (video) => ({
      ...video,

      language_label:
        languageLabels[video.language_code] ??
        video.language_code ??
        "",

      category_label:
        video.category_id
          ? categoryLabels[
              video.category_id
            ] ?? ""
          : "",
    })
  );

  /* =======================================================
     CHANNEL INFORMATION
  ======================================================== */

  const channelName =
    channel.channel_name;

  const channelLogo =
    channel.logo_url;

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="space-y-6 px-6 py-6">

      {/* =================================================
          CHANNEL HEADER
      ================================================== */}

      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        translations={{
          created_by:
            translations["channel.created_by"] ??
            "Created by:",

          subscribed:
            translations["channel.subscribed"] ??
            "Subscribed",

          subscribe:
            translations["channel.subscribe"] ??
            "Subscribe",
        }}
      />

      {/* =================================================
          CHANNEL VIDEOS
      ================================================== */}

      <section>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">
            {translations["channel.videos"] ??
              "Videos"}
          </h2>
        </div>

        {channelVideos.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center">
            <p className="text-sm text-muted">
              {translations["channel.no_videos"] ??
                "No videos have been uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {channelVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                slug={video.slug}
                title={video.title}
                thumbnail={video.thumbnail_url ?? ""}
                channelName={channelName}
                channelSlug={channel.slug}
                channelLogo={channelLogo ?? ""}
                views={video.view_count ?? 0}
                createdAt={video.created_at}
                level={video.level}
                accessType={video.access_type}

                languageLabel={
                  video.language_label
                }

                categoryLabel={
                  video.category_label
                }

                locale={locale}

                translations={{
                  noThumbnail:
                    translations["video.no_thumbnail"] ??
                    "No thumbnail available",

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
                }}

                levelTranslations={{
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
                }}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}