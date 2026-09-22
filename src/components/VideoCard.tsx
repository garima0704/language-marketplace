import Link from "next/link";
import Image from "next/image";

import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoCardTranslations {
  noThumbnail: string;
  views: string;
  published: string;
  draft: string;
  free: string;
  subscribersOnly: string;
  manage: string;
  view: string;
}

interface VideoLevelTranslations {
  beginner: string;
  intermediate: string;
  advanced: string;
  fluent: string;
}

interface VideoCardProps {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelSlug: string;
  channelLogo: string;
  views: number;
  createdAt: string;
  level: string | null;
  accessType: "free" | "subscriber";

  languageLabel?: string;
  categoryLabel?: string;

  status?: string;
  showStatus?: boolean;
  showManage?: boolean;
  showView?: boolean;
  locale?: string;
  translations?: VideoCardTranslations;
  levelTranslations?: VideoLevelTranslations;
}

export default function VideoCard({
  id,
  slug,
  title,
  thumbnail,
  channelName,
  channelSlug,
  channelLogo,
  views,
  createdAt,
  level,
  accessType,

  languageLabel,
  categoryLabel,

  status,
  showStatus = false,
  showManage = false,
  showView = false,
  locale = "en",
  translations,
  levelTranslations,
}: VideoCardProps) {
  const labels: VideoCardTranslations = {
    noThumbnail:
      translations?.noThumbnail ?? "No thumbnail available",
    views:
      translations?.views ?? "views",
    published:
      translations?.published ?? "Published",
    draft:
      translations?.draft ?? "Draft",
    free:
      translations?.free ?? "Free",
    subscribersOnly:
      translations?.subscribersOnly ?? "Subscribers only",
    manage:
      translations?.manage ?? "Manage",
    view:
      translations?.view ?? "View",
  };

  const levels: VideoLevelTranslations = {
    beginner:
      levelTranslations?.beginner ?? "Beginner",
    intermediate:
      levelTranslations?.intermediate ?? "Intermediate",
    advanced:
      levelTranslations?.advanced ?? "Advanced",
    fluent:
      levelTranslations?.fluent ?? "Fluent",
  };

  const levelLabel =
    level === "beginner"
      ? levels.beginner
      : level === "intermediate"
        ? levels.intermediate
        : level === "advanced"
          ? levels.advanced
          : level === "fluent"
            ? levels.fluent
            : level;

  const categoryDisplay = [
    languageLabel,
    categoryLabel,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-background transition hover:shadow-md">
      <Link href={`/videos/${slug}`}>
        <div className="relative aspect-video overflow-hidden bg-muted-bg">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted-bg">
              <span className="text-sm text-muted">
                {labels.noThumbnail}
              </span>
            </div>
          )}

          {categoryDisplay && (
            <span className="absolute right-2 top-2 z-10 rounded-md bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
              {categoryDisplay}
            </span>
          )}
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <Link
          href={`/videos/${slug}`}
          className="mb-3 block"
        >
          <h3 className="line-clamp-2 font-semibold leading-5 text-foreground transition hover:text-secondary">
            {title}
          </h3>
        </Link>

        <Link
          href={`/channels/${channelSlug}`}
          className="group/channel flex items-center gap-3"
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted-bg">
            {channelLogo ? (
              <Image
                src={channelLogo}
                alt={channelName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-medium text-white">
                {channelName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <p className="min-w-0 truncate text-sm font-medium text-foreground transition group-hover/channel:text-secondary">
            {channelName}
          </p>
        </Link>

        <div className="text-xs text-muted">
          {views.toLocaleString(locale)}{" "}
          {labels.views} •{" "}
          {formatTimeAgo(createdAt, locale)}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showStatus && (
            <span
              className={
                status === "published"
                  ? "rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground"
                  : "rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground"
              }
            >
              {status === "published"
                ? labels.published
                : labels.draft}
            </span>
          )}

          {level && (
            <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
              {levelLabel}
            </span>
          )}

          <span
            className={
              accessType === "free"
                ? "rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground"
                : "rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
            }
          >
            {accessType === "free"
              ? labels.free
              : labels.subscribersOnly}
          </span>
        </div>

        {(showView || showManage) && (
          <div className="mt-6 flex gap-3">
            {showManage && (
              <Link
                href={`/seller/videos/${id}`}
                className={
                  showView && status === "published"
                    ? "flex-1"
                    : "w-full"
                }
              >
                <Button size="sm" className="w-full">
                  {labels.manage}
                </Button>
              </Link>
            )}

            {showView && status === "published" && (
              <Link
                href={`/videos/${slug}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {labels.view}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}