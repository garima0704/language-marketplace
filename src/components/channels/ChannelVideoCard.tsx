"use client";

import { Card } from "@/components/ui/card";

interface VideoCardProps {
  video: {
    title: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    access_type: string;
    view_count: number;
  };
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "";

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function ChannelVideoCard({
  video,
}: VideoCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md">
      <div className="aspect-video bg-muted-bg">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No thumbnail
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground">
          {video.title}
        </h3>

        <div className="flex items-center justify-between text-sm text-muted">
          <span>{video.view_count} views</span>

          <span>
            {formatDuration(video.duration_seconds)}
          </span>
        </div>

        <span
          className={
            video.access_type === "free"
              ? "text-sm font-medium text-primary"
              : "text-sm text-secondary"
          }
        >
          {video.access_type === "free"
            ? "Free"
            : "Subscribers only"}
        </span>
      </div>
    </Card>
  );
}