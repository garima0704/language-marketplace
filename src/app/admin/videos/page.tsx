import Link from "next/link";
import {
  Video,
  CheckCircle,
  FileText,
  Unlock,
  Lock,
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  formatTimeAgo,
  getInitials,
  getProfileName,
} from "@/lib/utils";

export default async function AdminVideosPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // Fetch videos
  // ---------------------------------------------------------

  const { data: videos } = await supabase
    .from("videos")
    .select(
      `
        id,
        channel_id,
        title,
        slug,
        thumbnail_url,
        access_type,
        status,
        view_count,
        created_at
      `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // ---------------------------------------------------------
  // Channel IDs
  // ---------------------------------------------------------

  const channelIds = [
    ...new Set(
      (videos ?? []).map(
        (video) => video.channel_id
      )
    ),
  ];

  // ---------------------------------------------------------
  // Fetch channels
  // ---------------------------------------------------------

  const { data: channels } =
    channelIds.length > 0
      ? await supabase
          .from("channels")
          .select(
            `
              id,
              user_id,
              channel_name
            `
          )
          .in("id", channelIds)
      : { data: [] };

  // ---------------------------------------------------------
  // Seller IDs
  // ---------------------------------------------------------

  const sellerIds = [
    ...new Set(
      (channels ?? []).map(
        (channel) => channel.user_id
      )
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
  // Maps
  // ---------------------------------------------------------

  const channelMap = new Map(
    (channels ?? []).map((channel) => [
      channel.id,
      channel,
    ])
  );

  const sellerMap = new Map(
    (sellers ?? []).map((seller) => [
      seller.id,
      seller,
    ])
  );

  // ---------------------------------------------------------
  // Video statistics
  // ---------------------------------------------------------

  const totalVideos = videos?.length ?? 0;

  const publishedVideos =
    videos?.filter(
      (video) =>
        video.status === "published"
    ).length ?? 0;

  const draftVideos =
    videos?.filter(
      (video) =>
        video.status === "draft"
    ).length ?? 0;

  const freeVideos =
    videos?.filter(
      (video) =>
        video.access_type === "free"
    ).length ?? 0;

  const subscriberVideos =
    videos?.filter(
      (video) =>
        video.access_type !== "free"
    ).length ?? 0;

  const stats = [
    {
      title: "Total Videos",
      value: totalVideos,
      icon: Video,
    },
    {
      title: "Published",
      value: publishedVideos,
      icon: CheckCircle,
    },
    {
      title: "Drafts",
      value: draftVideos,
      icon: FileText,
    },
    {
      title: "Free Videos",
      value: freeVideos,
      icon: Unlock,
    },
    {
      title: "Subscriber Only",
      value: subscriberVideos,
      icon: Lock,
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
            Videos
          </h1>

          <p className="mt-2 text-secondary">
            Manage and monitor videos uploaded by NiceConvo sellers.
          </p>
        </div>

        {/* -------------------------------------------------
            Stats
        ------------------------------------------------- */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              placeholder="Search videos..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />
          </div>
        </div>

        {/* -------------------------------------------------
            Videos Table
        ------------------------------------------------- */}

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">

          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              All Videos
            </h2>

            <p className="mt-1 text-sm text-muted">
              Videos uploaded by NiceConvo sellers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-border text-left">

                  <th className="px-6 py-3 font-medium text-secondary">
                    Video
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Channel
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Access
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Status
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Views
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

                {videos && videos.length > 0 ? (
                  videos.map((video) => {
                    const channel = channelMap.get(
                      video.channel_id
                    );

                    const seller = channel
                      ? sellerMap.get(channel.user_id)
                      : undefined;

                    const sellerName =
                      getProfileName(seller);

                    const isFree =
                      video.access_type === "free";

                    return (
                      <tr
                        key={video.id}
                        className="border-b border-border last:border-0"
                      >

                        {/* Video */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="h-12 w-20 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-muted-bg">
                                <Video className="h-5 w-5 text-muted" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-medium text-foreground">
                                {video.title}
                              </p>

                              <p className="mt-0.5 max-w-xs truncate text-xs text-muted">
                                /{video.slug}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Channel */}
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {channel?.channel_name || "—"}
                            </p>

                            {seller && (
                              <div className="mt-1 flex items-center gap-2">

                                {seller.avatar_url ? (
                                  <img
                                    src={seller.avatar_url}
                                    alt={sellerName}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted-bg text-[10px] font-medium text-secondary">
                                    {getInitials(
                                      sellerName
                                    )}
                                  </div>
                                )}

                                <span className="text-xs text-muted">
                                  {sellerName}
                                </span>

                              </div>
                            )}
                          </div>
                        </td>

                        {/* Access */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                            {isFree ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                Free
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                Subscriber
                              </>
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                            {video.status || "Unknown"}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4 text-secondary">
                          {Number(
                            video.view_count || 0
                          ).toLocaleString()}
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4 text-muted">
                          {formatTimeAgo(
                            video.created_at
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/videos/${video.id}`}
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
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-muted"
                    >
                      No videos found.
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