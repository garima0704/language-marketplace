import Link from "next/link";
import {
  Tv,
  CheckCircle,
  Video,
  AlertCircle,
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  formatPrice,
  formatTimeAgo,
  getInitials,
  getProfileName,
} from "@/lib/utils";

export default async function AdminChannelsPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // Fetch channels
  // ---------------------------------------------------------

  const { data: channels } = await supabase
    .from("channels")
    .select(
      `
        id,
        user_id,
        channel_name,
        slug,
        description,
        logo_url,
        subscription_price,
        currency,
        status,
        created_at
      `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // ---------------------------------------------------------
  // Seller IDs
  // ---------------------------------------------------------

  const sellerIds = [
    ...new Set(
      (channels ?? []).map((channel) => channel.user_id)
    ),
  ];

  // ---------------------------------------------------------
  // Fetch sellers
  // ---------------------------------------------------------

  const { data: sellers } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select(
            `
              id,
              username,
              display_name,
              avatar_url
            `
          )
          .in("id", sellerIds)
      : { data: [] };

  // ---------------------------------------------------------
  // Fetch video counts
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // Maps
  // ---------------------------------------------------------

  const sellerMap = new Map(
    (sellers ?? []).map((seller) => [
      seller.id,
      seller,
    ])
  );

  const videoCountByChannel = new Map<string, number>();

  (videos ?? []).forEach((video) => {
    videoCountByChannel.set(
      video.channel_id,
      (videoCountByChannel.get(video.channel_id) ?? 0) + 1
    );
  });

  // ---------------------------------------------------------
  // Channel statistics
  // ---------------------------------------------------------

  const totalChannels = channels?.length ?? 0;

  const activeChannels =
    channels?.filter(
      (channel) =>
        !channel.status ||
        channel.status === "active"
    ).length ?? 0;

  const channelsWithVideos = (channels ?? []).filter(
    (channel) =>
      (videoCountByChannel.get(channel.id) ?? 0) > 0
  ).length;

  const channelsWithoutVideos =
    totalChannels - channelsWithVideos;

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
    <main className="min-h-screen bg-light-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* -------------------------------------------------
            Header
        ------------------------------------------------- */}

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Channels
          </h1>

          <p className="mt-2 text-secondary">
            Manage seller channels across NiceConvo.
          </p>
        </div>

        {/* -------------------------------------------------
            Stats
        ------------------------------------------------- */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
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

        {/* -------------------------------------------------
            Search
        ------------------------------------------------- */}

        <div className="mt-8 rounded-xl border border-border bg-background p-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              placeholder="Search channels..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />
          </div>
        </div>

        {/* -------------------------------------------------
            Channels Table
        ------------------------------------------------- */}

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">

          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              All Channels
            </h2>

            <p className="mt-1 text-sm text-muted">
              Channels created by NiceConvo sellers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-border text-left">

                  <th className="px-6 py-3 font-medium text-secondary">
                    Channel
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Seller
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Subscription
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Videos
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Created
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {channels && channels.length > 0 ? (
                  channels.map((channel) => {
                    const seller = sellerMap.get(
                      channel.user_id
                    );

                    const sellerName =
                      getProfileName(seller);

                    const videoCount =
                      videoCountByChannel.get(
                        channel.id
                      ) ?? 0;

                    return (
                      <tr
                        key={channel.id}
                        className="border-b border-border last:border-0"
                      >

                        {/* Channel */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {channel.logo_url ? (
                              <img
                                src={channel.logo_url}
                                alt={channel.channel_name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted-bg text-sm font-medium text-secondary">
                                {getInitials(
                                  channel.channel_name
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {channel.channel_name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted">
                                /{channel.slug}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Seller */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">

                            {seller?.avatar_url ? (
                              <img
                                src={seller.avatar_url}
                                alt={sellerName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-bg text-xs font-medium text-secondary">
                                {getInitials(
                                  sellerName
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm text-foreground">
                                {sellerName}
                              </p>

                              {seller?.username && (
                                <p className="truncate text-xs text-muted">
                                  @{seller.username}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* Subscription */}
                        <td className="px-6 py-4 font-medium text-foreground">
                          {formatPrice(
                            channel.subscription_price,
                            channel.currency
                          ) ?? "Free"}
                          <span className="ml-1 text-xs font-normal text-muted">
                            / month
                          </span>
                        </td>

                        {/* Videos */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                            {videoCount}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4 text-muted">
                          {formatTimeAgo(
                            channel.created_at
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/channels/${channel.id}`}
                            className="text-sm font-medium text-secondary hover:text-foreground"
                          >
                            View
                          </Link>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-muted"
                    >
                      No channels found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </div>

      </div>
    </main>
  );
}