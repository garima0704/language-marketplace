import Link from "next/link";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  categoryLabel?: string;

  // Seller-specific
  status?: string;
  showStatus?: boolean;
  showManage?: boolean;
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
  categoryLabel,
  status,
  showStatus = false,
  showManage = false,
}: VideoCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-background transition hover:shadow-md">
      {/* Thumbnail */}
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
                No thumbnail
              </span>
            </div>
          )}

          {/* Category */}
          {categoryLabel && (
            <span className="absolute right-2 top-2 z-10 rounded-md bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
              {categoryLabel}
            </span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="space-y-2 p-4">
        {/* Title */}
        <Link
          href={`/videos/${slug}`}
          className="mb-3 block"
        >
          <h3 className="line-clamp-2 font-semibold leading-5 text-foreground transition hover:text-secondary">
            {title}
          </h3>
        </Link>

        {/* Channel */}
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

        {/* Views + Time */}
        <div className="text-xs text-muted">
          {views.toLocaleString()} views •{" "}
          {formatTimeAgo(createdAt)}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Published / Draft - Seller only */}
          {showStatus && (
            <span
              className={
                status === "published"
                  ? "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  : "rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground"
              }
            >
              {status === "published"
                ? "Published"
                : "Draft"}
            </span>
          )}

          {/* Level */}
          {level && (
            <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          )}

          {/* Access Type */}
          <span
            className={
              accessType === "free"
                ? "rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground"
                : "rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
            }
          >
            {accessType === "free"
              ? "Free"
              : "Subscribers only"}
          </span>
        </div>

        {/* Manage - Seller only */}
        {showManage && (
          <div className="flex justify-end pt-2">
            <Link href={`/seller/videos/${id}`}>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}