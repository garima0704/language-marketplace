import {
  Video,
  Users,
  DollarSign,
  Layers,
} from "lucide-react";

interface DashboardStatsProps {
  channelCount: number;
  videoCount: number;
  subscriberCount: number;
  earnings: number;
  translations: {
    totalChannels: string;
    channelsDescription: string;
    totalVideos: string;
    videosDescription: string;
    totalSubscribers: string;
    subscribersDescription: string;
    totalEarnings: string;
    earningsDescription: string;
  };
}

export default function DashboardStats({
  channelCount,
  videoCount,
  subscriberCount,
  earnings,
  translations,
}: DashboardStatsProps) {
  const stats = [
    {
      title: translations.totalChannels,
      value: channelCount,
      description: translations.channelsDescription,
      icon: Layers,
    },
    {
      title: translations.totalVideos,
      value: videoCount,
      description: translations.videosDescription,
      icon: Video,
    },
    {
      title: translations.totalSubscribers,
      value: subscriberCount,
      description: translations.subscribersDescription,
      icon: Users,
    },
    {
      title: translations.totalEarnings,
      value: `$${earnings.toFixed(2)}`,
      description: translations.earningsDescription,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-border bg-background p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-muted">
                {stat.title}
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-muted">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}