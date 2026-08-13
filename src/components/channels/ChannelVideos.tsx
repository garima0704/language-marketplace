import ChannelVideoCard from "@/components/channels/ChannelVideoCard";

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail_url: string | null;
  access_type: string;
  view_count: number;
  created_at: string;
  level: string | null;
  category_label?: string;
}

interface ChannelVideosProps {
  videos?: ChannelVideo[];
  channelName: string;
  channelLogo?: string | null;
}

export default function ChannelVideos({
  videos = [],
  channelName,
  channelLogo,
}: ChannelVideosProps) {
  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <h2 className="text-2xl font-bold text-foreground">
        Videos
      </h2>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <ChannelVideoCard
              key={video.id}
              video={video}
              channelName={channelName}
              channelLogo={channelLogo}
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