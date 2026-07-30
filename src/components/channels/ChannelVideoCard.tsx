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

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}


export default function ChannelVideoCard({
  video,
}: VideoCardProps) {

  return (

    <Card className="overflow-hidden rounded-xl hover:shadow-md transition">

      <div className="aspect-video bg-muted">

        {video.thumbnail_url && (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        )}

      </div>



      <div className="p-4 space-y-2">


        <h3 className="font-semibold line-clamp-2">
          {video.title}
        </h3>



        <div className="flex items-center justify-between text-sm text-muted-foreground">


          <span>
            {video.view_count} views
          </span>



          <span>
            {formatDuration(video.duration_seconds)}
          </span>


        </div>



        <span
          className={
            video.access_type === "free"
              ? "text-green-600 text-sm"
              : "text-secondary text-sm"
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