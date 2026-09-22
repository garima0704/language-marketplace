import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { getTranslations } from "@/lib/translations";

interface Profile {
  id: string;
  is_creator: boolean;
}

interface Channel {
  id: string;
  channel_name: string;
  slug: string;
  logo_url: string | null;
  user_id: string;
  profiles: Profile | Profile[] | null;
}

interface Video {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  level: string | null;
  access_type: "free" | "subscriber";
  view_count: number;
  created_at: string;
  published_at: string | null;
  status?: string;

  channels: Channel | Channel[] | null;

  language_label?: string;
  category_label?: string;
}

interface Props {
  title?: string;
  showViewAll?: boolean;
  videos?: Video[];
  showManage?: boolean;
  showView?: boolean;
  showStatus?: boolean;
  compact?: boolean;
  locale?: string;
}

export default async function VideoSection({
  title,
  showViewAll = true,
  videos = [],
  showManage = false,
  showView = false,
  showStatus = false,
  compact = false,
  locale = "en",
}: Props) {
  const translations = await getTranslations(
    [
      // Video card
      "video.no_thumbnail",
      "video.views",
      "video.published",
      "video.draft",
      "video.free",
      "video.subscribers_only",
      "video.manage",
      "video.view",

      // Home / video section
      "home.view_all",
      "home.no_videos",

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

  const homeTranslations = {
    viewAll:
      translations["home.view_all"] ??
      "View All",

    noVideos:
      translations["home.no_videos"] ??
      "No videos available yet.",
  };

  return (
    <section
      className={
        compact
          ? "py-0"
          : "mx-auto max-w-7xl px-6 py-8"
      }
    >
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            {title}
          </h2>

          {showViewAll && (
            <Link
              href="/videos"
              className="text-sm font-medium text-foreground transition hover:text-secondary"
            >
              {homeTranslations.viewAll}
            </Link>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted-bg px-6 py-12 text-center">
          <p className="text-sm text-muted">
            {homeTranslations.noVideos}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const channel = Array.isArray(
              video.channels
            )
              ? video.channels[0]
              : video.channels;

            const languageLabel =
              video.language_label || "";

            const categoryLabel =
              video.category_label || "";

            return (
              <VideoCard
                key={video.id}
                id={video.id}
                slug={video.slug}
                title={video.title}
                thumbnail={
                  video.thumbnail_url || ""
                }
                channelName={
                  channel?.channel_name || ""
                }
                channelSlug={
                  channel?.slug || ""
                }
                channelLogo={
                  channel?.logo_url || ""
                }
                views={
                  video.view_count ?? 0
                }
                createdAt={
                  video.created_at
                }
                level={video.level}
                accessType={
                  video.access_type
                }
                languageLabel={
                  languageLabel
                }
                categoryLabel={
                  categoryLabel
                }
                status={video.status}
                showStatus={showStatus}
                showManage={showManage}
                showView={showView}
                locale={locale}
                translations={
                  videoTranslations
                }
                levelTranslations={
                  levelTranslations
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}