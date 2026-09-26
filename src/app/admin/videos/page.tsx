import Link from "next/link";
import { cookies } from "next/headers";

import {
  Video,
  CheckCircle,
  FileText,
  Unlock,
  Lock,
  Plus,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getCategoryLabel } from "@/lib/categories";
import { getBrowseLanguages } from "@/lib/languages";

import VideoSection from "@/components/VideoSection";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type VideoRow = {
  id: string;
  channel_id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  access_type: "free" | "subscriber";
  status: string;
  view_count: number;
  created_at: string;
  published_at: string | null;
  level: string | null;
  language_code: string | null;
  category_id: string | null;
  video_id: string | null;
  video_provider: string | null;
};

type Channel = {
  id: string;
  user_id: string;
  channel_name: string;
  slug: string;
  logo_url: string | null;
};

type Seller = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
  }>;
}) {
  const { supabase } = await requireAdmin();

  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ??
    "en";

  const languages =
    await getBrowseLanguages(locale);

  function getLanguageLabel(
    languageCode: string | null
  ) {
    if (!languageCode) return undefined;

    const language = languages.find(
      (item) => item.code === languageCode
    );

    return language?.name ?? languageCode;
  }

  const { data: videos, error: videosError } =
    await supabase
      .from("videos")
      .select(`
        id,
        channel_id,
        title,
        slug,
        thumbnail_url,
        access_type,
        status,
        view_count,
        created_at,
        published_at,
        level,
        language_code,
        category_id,
        video_id,
        video_provider
      `)
      .order("created_at", {
        ascending: false,
      });

  if (videosError) {
    console.error(
      "VIDEOS FETCH ERROR:",
      videosError
    );

    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Card className="rounded-xl">
            <div className="p-6">
              <p className="text-sm text-muted">
                Unable to load videos.
              </p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const videoList =
    (videos ?? []) as VideoRow[];

  const channelIds = [
    ...new Set(
      videoList.map(
        (video) => video.channel_id
      )
    ),
  ];

  const {
    data: channels,
    error: channelsError,
  } =
    channelIds.length > 0
      ? await supabase
          .from("channels")
          .select(`
            id,
            user_id,
            channel_name,
            slug,
            logo_url
          `)
          .in("id", channelIds)
      : {
          data: [],
          error: null,
        };

  if (channelsError) {
    console.error(
      "CHANNELS FETCH ERROR:",
      channelsError
    );
  }

  const channelList =
    (channels ?? []) as Channel[];

  const sellerIds = [
    ...new Set(
      channelList.map(
        (channel) => channel.user_id
      )
    ),
  ];

  const {
    data: sellers,
    error: sellersError,
  } =
    sellerIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            username,
            display_name
          `)
          .in("id", sellerIds)
      : {
          data: [],
          error: null,
        };

  if (sellersError) {
    console.error(
      "SELLERS FETCH ERROR:",
      sellersError
    );
  }

  const sellerList =
    (sellers ?? []) as Seller[];

  const channelMap = new Map(
    channelList.map((channel) => [
      channel.id,
      channel,
    ])
  );

  const sellerMap = new Map(
    sellerList.map((seller) => [
      seller.id,
      seller,
    ])
  );

  /*
   * Category labels
   */
  const categoryIds = [
    ...new Set(
      videoList
        .map(
          (video) => video.category_id
        )
        .filter(
          (id): id is string =>
            Boolean(id)
        )
    ),
  ];

  const categoryLabelMap =
    new Map<
      string,
      string | undefined
    >();

  if (categoryIds.length > 0) {
    const categoryLabels =
      await Promise.all(
        categoryIds.map(
          async (categoryId) => {
            const label =
              await getCategoryLabel(
                categoryId,
                locale
              );

            return [
              categoryId,
              label,
            ] as const;
          }
        )
      );

    for (const [
      categoryId,
      label,
    ] of categoryLabels) {
      categoryLabelMap.set(
        categoryId,
        label
      );
    }
  }

  /*
   * Stats
   */
  const totalVideos =
    videoList.length;

  const publishedVideos =
    videoList.filter(
      (video) =>
        video.status ===
        "published"
    ).length;

  const draftVideos =
    videoList.filter(
      (video) =>
        video.status === "draft"
    ).length;

  const freeVideos =
    videoList.filter(
      (video) =>
        video.access_type ===
        "free"
    ).length;

  const subscriberVideos =
    videoList.filter(
      (video) =>
        video.access_type ===
        "subscriber"
    ).length;

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

  /*
   * Prepare videos for VideoSection
   */
  const allListVideos =
    videoList.map((video) => {
      const channel =
        channelMap.get(
          video.channel_id
        );

      const seller = channel
        ? sellerMap.get(
            channel.user_id
          )
        : undefined;

      return {
        ...video,

        channels: channel
          ? {
              id: channel.id,
              user_id: channel.user_id,
              channel_name: channel.channel_name,
              slug: channel.slug,
              logo_url: channel.logo_url,
              profiles: null,
            }
          : null,

        seller_name:
          seller?.display_name ||
          seller?.username ||
          "Unknown seller",

        seller_username:
          seller?.username ?? null,

        language_label:
          getLanguageLabel(
            video.language_code
          ),

        category_label:
          video.category_id
            ? categoryLabelMap.get(
                video.category_id
              ) ?? ""
            : "",
      };
    });

  /*
   * Search
   */
  const searchLower =
    search.toLowerCase();

  const listVideos = search
    ? allListVideos.filter(
        (video) =>
          [
            video.title,
            video.channel_name,
            video.seller_name,
            video.seller_username ??
              "",
          ].some((value) =>
            value
              .toLowerCase()
              .includes(
                searchLower
              )
          )
      )
    : allListVideos;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Videos
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage videos uploaded by
              NiceConvo sellers.
            </p>
          </div>

          <Link
            href="/admin/videos/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Video
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <div className="mt-8">
          <form method="GET">
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search videos, channels, or sellers..."
              className="max-w-md"
            />
          </form>
        </div>

        {/* Videos */}
        <div className="mt-6">
          {listVideos.length === 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full">
                <Card className="rounded-xl border-dashed">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h3 className="text-lg font-semibold">
                      {search
                        ? "No videos found"
                        : "No videos yet"}
                    </h3>

                    <p className="mt-2 text-muted-foreground">
                      {search
                        ? "Try changing your search."
                        : "There are no videos uploaded by sellers yet."}
                    </p>

                    {!search && (
                      <div className="mt-6">
                        <Link
                          href="/admin/videos/new"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
                        >
                          <Plus className="h-4 w-4" />
                          Add Video
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <VideoSection
              videos={listVideos}
              showManage
              showView
              showStatus
              showSeller
              manageHrefPrefix="/admin/videos"
              locale={locale}
              compact
            />
          )}
        </div>
      </div>
    </main>
  );
}