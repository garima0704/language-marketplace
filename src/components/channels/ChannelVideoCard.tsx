"use client";

import { Card } from "@/components/ui/card";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    access_type: string;
    view_count: number;
    created_at: string;
    level: string | null;
    category_label?: string;
  };
  channelName: string;
  channelLogo?: string | null;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  const days = Math.floor(diffSeconds / 86400);

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  const hours = Math.floor(diffSeconds / 3600);

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  return "Just now";
}

export default function ChannelVideoCard({
  video,
  channelName,
  channelLogo,
}: VideoCardProps) {
  return (
    <Card className="group/card overflow-hidden rounded-xl p-0 transition hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary text-sm font-medium text-white">
            No thumbnail
          </div>
        )}

        {/* Category */}
        {video.category_label && (
          <span className="absolute right-2 top-2 z-10 max-w-[80%] truncate rounded-md bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
            {video.category_label}
          </span>
        )}
      </div>

      {/* Video information */}
      <div className="space-y-2 p-4 pt-2">
        <h3 className="line-clamp-2 font-semibold">
          {video.title}
        </h3>

        {/* Channel */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {channelLogo ? (
              <img
                src={channelLogo}
                alt={channelName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                {channelName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <p className="truncate text-sm text-muted-foreground">
            {channelName}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{video.view_count} views</span>

          <span aria-hidden="true">•</span>

          <span>{formatTimeAgo(video.created_at)}</span>
        </div>

        {/* Tags / Access */}
        <div className="flex flex-wrap items-center gap-2">
          {video.level && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {video.level}
            </span>
          )}

          <span
            className={
              video.access_type === "free"
                ? "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                : "rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white"
            }
          >
            {video.access_type === "free"
              ? "Free"
              : "Subscribers only"}
          </span>
        </div>
      </div>
    </Card>
  );
}