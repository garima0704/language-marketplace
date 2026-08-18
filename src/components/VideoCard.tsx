import Link from "next/link";
import Image from "next/image";

interface VideoCardProps {
  id: string;
  slug: string;
  title: string;
  creator: string;
  thumbnail: string;
  avatar: string;
  channelName: string;
  views: number;
  createdAt: string;
  level: string | null;
  accessType: "free" | "subscriber";
  categoryLabel?: string;
  showManage?: boolean;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

export default function VideoCard({
  id,
  slug,
  title,
  creator,
  thumbnail,
  avatar,
  channelName,
  views,
  createdAt,
  level,
  accessType,
  categoryLabel,
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
        <Link href={`/videos/${slug}`}
          className="mb-3 block"
        >
          <h3 className="line-clamp-2 font-semibold leading-5 text-foreground transition hover:text-secondary">
            {title}
          </h3>
        </Link>

        {/* Creator */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted-bg">
            {avatar ? (
              <Image
                src={avatar}
                alt={creator}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-medium text-white">
                {creator.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {creator}
            </p>

            <p className="truncate text-xs text-muted">
              {channelName}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted">
          {views.toLocaleString()} views • {formatTimeAgo(createdAt)}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {level && (
            <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
              {level}
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
              ? "Free"
              : "Subscribers only"}
          </span>
        </div>

        {/* Seller action */}
        {showManage && (
          <div className="flex justify-end pt-2">
            <Link
              href={`/seller/videos/${id}`}
              className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted-bg"
            >
              Manage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}