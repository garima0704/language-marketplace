import ChannelVideoCard from "./ChannelVideoCard";

interface ChannelVideosProps {
  videos: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    access_type: string;
    view_count: number;
  }[];
}

export default function ChannelVideos({
  videos,
}: ChannelVideosProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-foreground">
        Videos
      </h2>

      {videos.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <ChannelVideoCard
              key={video.id}
              video={video}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-8 text-center">
          <p className="text-muted">
            No videos available yet.
          </p>
        </div>
      )}
    </section>
  );
}