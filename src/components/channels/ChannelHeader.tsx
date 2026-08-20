"use client";

import Link from "next/link";

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
isSubscribed?: boolean;
}

export default function ChannelHeader({
  channel,
  isSubscribed = false,
}: ChannelHeaderProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-background pt-0 shadow-sm">

      {/* =================================================
          BANNER
      ================================================== */}

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

        {/* =================================================
            CHANNEL LOGO
        ================================================== */}

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

          {/* =================================================
              CHANNEL INFORMATION
          ================================================== */}

          <div className="min-w-0">

            {/* Channel Name */}

            <h1 className="text-3xl font-bold text-foreground">
              {channel.channel_name}
            </h1>

            {/* Seller */}

            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <span className="text-muted">
                Created by:
              </span>

              <Link
                href={`/sellers/${channel.profiles.username}`}
                className="font-semibold text-foreground transition hover:text-secondary hover:underline"
              >
                @{channel.profiles.username}
              </Link>
            </div>

            {/* About */}

            {channel.description && (
              <p className="mt-5 max-w-2xl text-sm italic leading-7 text-secondary">
                {channel.description}
              </p>
            )}

          </div>

          {/* =================================================
              SUBSCRIBE
          ================================================== */}

          <div className="shrink-0">
            {isSubscribed ? (
              <Button
                disabled
                className="rounded-xl bg-muted-bg px-6 text-foreground"
              >
                Subscribed
              </Button>
            ) : (
              <Button className="rounded-xl bg-primary px-6 text-white hover:bg-secondary">
                Subscribe ${channel.subscription_price}/
                {channel.currency}
              </Button>
            )}
          </div>

        </div>
      </div>
    </Card>
  );
}