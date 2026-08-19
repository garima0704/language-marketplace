import { Card } from "@/components/ui/card";
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
}

export default function DashboardStats({
  channelCount,
  videoCount,
  subscriberCount,
  earnings,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Channels",
      value: channelCount,
      icon: Layers,
    },
    {
      title: "Videos",
      value: videoCount,
      icon: Video,
    },
    {
      title: "Subscribers",
      value: subscriberCount,
      icon: Users,
    },
    {
      title: "Earnings",
      value: `$${earnings.toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="rounded-2xl bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-foreground">
                  {stat.value}
                </h3>
              </div>

              <div className="rounded-xl bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}