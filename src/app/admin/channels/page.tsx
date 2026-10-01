import Link from "next/link";
import { cookies } from "next/headers";
import {
  Tv,
  CheckCircle,
  Video,
  AlertCircle,
  Search,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

import AdminChannelCard from "@/components/admin/channels/AdminChannelCard";

interface AdminChannelsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminChannelsPage({
  searchParams,
}: AdminChannelsPageProps) {
  await requireAdmin();

  const supabase = await createClient();

  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  const normalizedSearch = search.toLowerCase();

  const { data: channels, error } = await supabase
    .from("channels")
    .select(`
      id,
      user_id,
      channel_name,
      slug,
      description,
      logo_url,
      banner_url,
      subscription_price,
      currency,
      status,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const sellerIds = [
    ...new Set(
      (channels ?? []).map(
        (channel) => channel.user_id
      )
    ),
  ];

  const { data: sellers } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            username,
            display_name,
            avatar_url
          `)
          .in("id", sellerIds)
      : { data: [] };

  const channelIds = (channels ?? []).map(
    (channel) => channel.id
  );

  const { data: videos } =
    channelIds.length > 0
      ? await supabase
          .from("videos")
          .select("id, channel_id")
          .in("channel_id", channelIds)
      : { data: [] };

  const sellerMap = new Map(
    (sellers ?? []).map((seller) => [
      seller.id,
      seller,
    ])
  );

  const videoCountByChannel = new Map<
    string,
    number
  >();

  (videos ?? []).forEach((video) => {
    videoCountByChannel.set(
      video.channel_id,
      (videoCountByChannel.get(video.channel_id) ??
        0) + 1
    );
  });

  const totalChannels = channels?.length ?? 0;

  const activeChannels =
    channels?.filter(
      (channel) =>
        !channel.status ||
        channel.status === "active"
    ).length ?? 0;

  const channelsWithVideos = (
    channels ?? []
  ).filter(
    (channel) =>
      (videoCountByChannel.get(channel.id) ?? 0) >
      0
  ).length;

  const channelsWithoutVideos =
    totalChannels - channelsWithVideos;

  const filteredChannels = normalizedSearch
    ? (channels ?? []).filter((channel) => {
        const seller = sellerMap.get(
          channel.user_id
        );

        const channelName =
          channel.channel_name?.toLowerCase() ?? "";

        const slug =
          channel.slug?.toLowerCase() ?? "";

        const sellerName =
          seller?.display_name?.toLowerCase() ?? "";

        const sellerUsername =
          seller?.username?.toLowerCase() ?? "";

        return (
          channelName.includes(
            normalizedSearch
          ) ||
          slug.includes(normalizedSearch) ||
          sellerName.includes(
            normalizedSearch
          ) ||
          sellerUsername.includes(
            normalizedSearch
          )
        );
      })
    : channels ?? [];

  const stats = [
    {
      title: "Total Channels",
      value: totalChannels,
      icon: Tv,
    },
    {
      title: "Active Channels",
      value: activeChannels,
      icon: CheckCircle,
    },
    {
      title: "With Videos",
      value: channelsWithVideos,
      icon: Video,
    },
    {
      title: "Without Videos",
      value: channelsWithoutVideos,
      icon: AlertCircle,
    },
  ];

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Channels
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage seller channels across NiceConvo.
            </p>
          </div>

          <Link
            href="/admin/channels/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Create Channel
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-8 rounded-xl border border-border bg-background p-4">
          <form method="GET">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search channels or sellers..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
              />
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mt-6">
          {filteredChannels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                {search
                  ? "No channels found"
                  : "No channels yet"}
              </p>

              <p className="mt-1 text-sm text-muted">
                {search
                  ? "Try a different search."
                  : "Create a channel to get started."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredChannels.map((channel) => {
                const seller = sellerMap.get(
                  channel.user_id
                );

                return (
                  <AdminChannelCard
                    key={channel.id}
                    channel={{
                      ...channel,
                      subscriber_count: 0,
                      video_count:
                        videoCountByChannel.get(
                          channel.id
                        ) ?? 0,
                    }}
                    seller={seller}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}