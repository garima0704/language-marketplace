import Link from "next/link";
import VideoCard from "@/components/VideoCard";

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_creator: boolean;
}

interface Channel {
  id: string;
  channel_name: string;
  logo_url: string | null;
  user_id: string;
  profiles: Profile | Profile[] | null;
}

interface CategoryTranslation {
  name: string;
  locale_code: string;
}

interface Category {
  id: string;
  slug: string;
  category_translations:
    | CategoryTranslation[]
    | CategoryTranslation
    | null;
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
  channels: Channel | Channel[] | null;
  categories: Category | Category[] | null;
  category_label?: string;
}

interface Props {
  title?: string;
  showViewAll?: boolean;
  videos?: Video[];
}

export default function VideoSection({
  title,
  showViewAll = true,
  videos = [],
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
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
              View All
            </Link>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted-bg px-6 py-12 text-center">
          <p className="text-sm text-muted">
            No videos available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const channel = Array.isArray(video.channels)
              ? video.channels[0]
              : video.channels;

            const profile = Array.isArray(channel?.profiles)
              ? channel.profiles[0]
              : channel?.profiles;

            const category = Array.isArray(video.categories)
              ? video.categories[0]
              : video.categories;

            const translation = Array.isArray(
              category?.category_translations
            )
              ? category.category_translations[0]
              : category?.category_translations;

            const creatorName =
              profile?.display_name ||
              "Creator";

            const avatar =
              profile?.avatar_url ||
              channel?.logo_url ||
              "";

            const categoryLabel = video.category_label || "";

            return (
              <VideoCard
                key={video.id}
                id={video.id}
                slug={video.slug}
                title={video.title}
                creator={creatorName}
                thumbnail={video.thumbnail_url || ""}
                avatar={avatar}
                channelName={channel?.channel_name || ""}
                views={video.view_count}
                createdAt={video.created_at}
                level={video.level}
                accessType={video.access_type}
                categoryLabel={categoryLabel}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}