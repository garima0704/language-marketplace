"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChannelHeaderProps {
  channel: {
    channel_name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    subscription_price: number;
    currency: string;
    profiles: {
      display_name: string;
      username: string;
      avatar_url: string | null;
    };
  };
}

export default function ChannelHeader({
  channel,
}: ChannelHeaderProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-background shadow-sm pt-0">

      {/* Banner */}
      <div className="h-48 bg-light-bg">
        {channel.banner_url && (
          <img
            src={channel.banner_url}
            alt={channel.channel_name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="relative p-8">

        {/* Logo */}
        <div className="-mt-20 mb-5">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage
              src={channel.logo_url ?? ""}
              alt={channel.channel_name}
            />

            <AvatarFallback className="bg-primary text-4xl font-semibold text-white">
              {channel.channel_name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

          {/* Channel Information */}
          <div className="space-y-3">

            <h1 className="text-3xl font-bold text-foreground">
              {channel.channel_name}
            </h1>

            <p className="text-muted">
              @{channel.profiles.username}
            </p>

            <p className="text-sm text-muted">
              By {channel.profiles.display_name}
            </p>

            {channel.description && (
              <p className="max-w-2xl leading-7 text-muted">
                {channel.description}
              </p>
            )}

          </div>

          {/* Subscribe */}
          <div>
            <Button className="rounded-xl bg-primary px-6 text-white hover:bg-secondary">
              Subscribe ${channel.subscription_price}/{channel.currency}
            </Button>
          </div>

        </div>
      </div>
    </Card>
  );
}