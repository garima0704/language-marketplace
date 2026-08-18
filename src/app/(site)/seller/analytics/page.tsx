import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  PlaySquare,
  Users,
  Wallet,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import AnalyticsChart from "@/components/seller/AnalyticsChart";
import AnalyticsDateRange from "@/components/seller/AnalyticsDateRange";

function formatCurrency(
  amount: number,
  currency = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);
}

interface SellerAnalyticsPageProps {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function SellerAnalyticsPage({
  searchParams,
}: SellerAnalyticsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const range = params.range || "30d";

  function getDateRange(
  range: string,
  from?: string,
  to?: string
) {
  const now = new Date();

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  // Custom range
  if (range === "custom" && from && to) {
    const customStart = new Date(`${from}T00:00:00`);
    const customEnd = new Date(`${to}T23:59:59.999`);

    if (
      !Number.isNaN(customStart.getTime()) &&
      !Number.isNaN(customEnd.getTime()) &&
      customStart <= customEnd
    ) {
      return {
        start: customStart,
        end: customEnd,
      };
    }
  }

  const start = new Date(now);

  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 6);
      break;

    case "30d":
      start.setDate(start.getDate() - 29);
      break;

    case "90d":
      start.setDate(start.getDate() - 89);
      break;

    case "6m":
      start.setMonth(start.getMonth() - 5);
      start.setDate(1);
      break;

    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      break;

    case "all":
      return {
        start: null,
        end,
      };

    default:
      start.setDate(start.getDate() - 29);
  }

  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
}

const { start, end } = getDateRange(
  range,
  params.from,
  params.to
);

  // --------------------------------------------------
  // Current seller
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // Seller channels
  // --------------------------------------------------

  const { data: channels, error: channelsError } =
    await supabase
      .from("channels")
      .select(`
        id,
        channel_name
      `)
      .eq("user_id", user.id);

  if (channelsError) {
    console.error(
      "Seller analytics channels error:",
      channelsError
    );
  }

  const channelIds =
    channels?.map((channel) => channel.id) ?? [];

  // --------------------------------------------------
  // No channels
  // --------------------------------------------------

  if (channelIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Link
          href="/seller"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-muted">
            Understand how your channels and videos are performing.
          </p>
        </div>

        <div className="rounded-xl border border-border px-6 py-14 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted" />

          <p className="mt-4 font-medium text-foreground">
            No analytics available yet
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Create a channel and publish videos to start seeing
            views, subscribers, and revenue analytics.
          </p>

          <Link
            href="/seller/channels"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Manage Channels
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Payments
  // --------------------------------------------------

  let paymentsQuery = supabase
  .from("payments")
  .select(`
    id,
    channel_id,
    creator_amount,
    gross_amount,
    platform_fee,
    currency,
    payment_status,
    paid_at,
    created_at
  `)
  .in("channel_id", channelIds)
  .order("paid_at", {
    ascending: false,
  });

if (start) {
  paymentsQuery = paymentsQuery.gte(
    "paid_at",
    start.toISOString()
  );
}

if (end) {
  paymentsQuery = paymentsQuery.lte(
    "paid_at",
    end.toISOString()
  );
}

const {
  data: payments,
  error: paymentsError,
} = await paymentsQuery;

  if (paymentsError) {
    console.error(
      "Seller analytics payments error:",
      paymentsError
    );
  }

  const paymentList = payments ?? [];

  const paidPayments = paymentList.filter(
    (payment) => payment.payment_status === "paid"
  );

 // --------------------------------------------------
// Videos
// --------------------------------------------------

let videosQuery = supabase
  .from("videos")
  .select(`
    id,
    title,
    thumbnail_url,
    channel_id,
    status,
    created_at
  `)
  .in("channel_id", channelIds)
  .order("created_at", {
    ascending: false,
  });

const {
  data: videos,
  error: videosError,
} = await videosQuery;

if (videosError) {
  console.error(
    "Seller analytics videos error:",
    videosError
  );
}

const videoList = videos ?? [];


// --------------------------------------------------
// Video Views
// --------------------------------------------------

let videoViewList: {
  id: string;
  video_id: string;
  watched_at: string;
  watch_seconds: number;
}[] = [];

if (videoList.length > 0) {
  let videoViewsQuery = supabase
    .from("video_views")
    .select(`
      id,
      video_id,
      watched_at,
      watch_seconds
    `)
    .in(
      "video_id",
      videoList.map((video) => video.id)
    );

  if (start) {
    videoViewsQuery = videoViewsQuery.gte(
      "watched_at",
      start.toISOString()
    );
  }

  if (end) {
    videoViewsQuery = videoViewsQuery.lte(
      "watched_at",
      end.toISOString()
    );
  }

  const {
    data: videoViews,
    error: videoViewsError,
  } = await videoViewsQuery;

  if (videoViewsError) {
    console.error(
      "Seller analytics video views error:",
      videoViewsError
    );
  }

  videoViewList = videoViews ?? [];
}

// --------------------------------------------------
// Subscriptions
// --------------------------------------------------

const {
  data: subscriptions,
  error: subscriptionsError,
} = await supabase
  .from("subscriptions")
  .select(`
    id,
    channel_id,
    status,
    created_at
  `)
  .in("channel_id", channelIds);

if (subscriptionsError) {
  console.error(
    "Seller analytics subscriptions error:",
    subscriptionsError
  );
}

const subscriptionList = subscriptions ?? [];

const activeSubscriptions = subscriptionList.filter(
  (subscription) =>
    subscription.status === "active"
);

  // --------------------------------------------------
  // Payouts
  // --------------------------------------------------

  let payoutsQuery = supabase
  .from("payouts")
  .select(`
    id,
    amount,
    currency,
    status,
    created_at
  `)
  .eq("user_id", user.id);

if (start) {
  payoutsQuery = payoutsQuery.gte(
    "created_at",
    start.toISOString()
  );
}

if (end) {
  payoutsQuery = payoutsQuery.lte(
    "created_at",
    end.toISOString()
  );
}

const {
  data: payouts,
  error: payoutsError,
} = await payoutsQuery;

if (payoutsError) {
  console.error(
    "Seller analytics payouts error:",
    payoutsError
  );
}

const payoutList = payouts ?? [];

  // --------------------------------------------------
// View counts by video
// --------------------------------------------------

const videoViewCounts = new Map<string, number>();

videoViewList.forEach((view) => {
  videoViewCounts.set(
    view.video_id,
    (videoViewCounts.get(view.video_id) ?? 0) + 1
  );
});

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const totalRevenue = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.creator_amount || 0),
    0
  );

  const totalGross = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.gross_amount || 0),
    0
  );

  const totalFees = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.platform_fee || 0),
    0
  );

  const totalViews = videoViewList.length;

  const pendingPayouts = payoutList
    .filter((payout) => payout.status === "pending")
    .reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    );

  const currency =
    paidPayments[0]?.currency || "USD";

  // --------------------------------------------------
// Revenue chart - dynamic selected period
// --------------------------------------------------

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getChartData() {
  const now = new Date();

  // -----------------------------------------------
  // All time / fallback
  // -----------------------------------------------

  if (!start) {
    const months = Array.from(
      { length: 12 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (11 - index),
          1
        );

        return {
          key: getMonthKey(date),
          label: getMonthLabel(date),
          revenue: 0,
          transactions: 0,
        };
      }
    );

    const monthMap = new Map(
      months.map((month) => [
        month.key,
        month,
      ])
    );

    paidPayments.forEach((payment) => {
      const paymentDate = new Date(
        payment.paid_at || payment.created_at
      );

      const key = getMonthKey(paymentDate);
      const month = monthMap.get(key);

      if (!month) return;

      month.revenue += Number(
        payment.creator_amount || 0
      );

      month.transactions += 1;
    });

    return months;
  }

  const differenceInDays =
    Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  // -----------------------------------------------
  // Up to 90 days = daily
  // -----------------------------------------------

  if (differenceInDays <= 90) {
    const days = Array.from(
      { length: differenceInDays },
      (_, index) => {
        const date = new Date(start);

        date.setDate(
          start.getDate() + index
        );

        return {
          key: getDayKey(date),
          label: getDayLabel(date),
          revenue: 0,
          transactions: 0,
        };
      }
    );

    const dayMap = new Map(
      days.map((day) => [
        day.key,
        day,
      ])
    );

    paidPayments.forEach((payment) => {
      const paymentDate = new Date(
        payment.paid_at || payment.created_at
      );

      const key = getDayKey(paymentDate);
      const day = dayMap.get(key);

      if (!day) return;

      day.revenue += Number(
        payment.creator_amount || 0
      );

      day.transactions += 1;
    });

    return days;
  }

  // -----------------------------------------------
  // More than 90 days = monthly
  // -----------------------------------------------

  const months: {
    key: string;
    label: string;
    revenue: number;
    transactions: number;
  }[] = [];

  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    1
  );

  const finalMonth = new Date(
    end.getFullYear(),
    end.getMonth(),
    1
  );

  while (cursor <= finalMonth) {
    months.push({
      key: getMonthKey(cursor),
      label: getMonthLabel(cursor),
      revenue: 0,
      transactions: 0,
    });

    cursor.setMonth(
      cursor.getMonth() + 1
    );
  }

  const monthMap = new Map(
    months.map((month) => [
      month.key,
      month,
    ])
  );

  paidPayments.forEach((payment) => {
    const paymentDate = new Date(
      payment.paid_at || payment.created_at
    );

    const key = getMonthKey(paymentDate);
    const month = monthMap.get(key);

    if (!month) return;

    month.revenue += Number(
      payment.creator_amount || 0
    );

    month.transactions += 1;
  });

  return months;
}

const chartData = getChartData();

 // --------------------------------------------------
// Top videos
// --------------------------------------------------

const topVideos = [...videoList]
  .map((video) => ({
    ...video,
    analyticsViews:
      videoViewCounts.get(video.id) ?? 0,
  }))
  .sort(
    (a, b) =>
      b.analyticsViews - a.analyticsViews
  )
  .slice(0, 5);

  // --------------------------------------------------
  // Top channels
  // --------------------------------------------------

  const channelStats = (channels ?? []).map((channel) => {
    const channelVideos = videoList.filter(
      (video) =>
        video.channel_id === channel.id
    );

    const channelPayments = paidPayments.filter(
      (payment) =>
        payment.channel_id === channel.id
    );

    const channelSubscribers =
      activeSubscriptions.filter(
        (subscription) =>
          subscription.channel_id === channel.id
      ).length;

    return {
      id: channel.id,
      name: channel.channel_name,
      videos: channelVideos.length,
      views: channelVideos.reduce(
        (total, video) =>
          total +
          (videoViewCounts.get(video.id) ?? 0),
        0
      ),
      subscribers: channelSubscribers,
      revenue: channelPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.creator_amount || 0),
        0
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-muted">
              Track your channel performance, audience,
              views, and earnings.
            </p>
          </div>

          <AnalyticsDateRange />
        </div>
      </div>

      {/* --------------------------------------------------
          KPI CARDS
      -------------------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Total Revenue
            </p>

            <Wallet className="h-4 w-4 text-muted" />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalRevenue,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Your earnings after platform fees
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Subscribers
            </p>

            <Users className="h-4 w-4 text-muted" />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(
              activeSubscriptions.length
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Active subscribers
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Total Views
            </p>

            <Eye className="h-4 w-4 text-muted" />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(totalViews)}
          </p>

          <p className="mt-1 text-xs text-muted">
            Across all your videos
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Pending Payout
            </p>

            <Wallet className="h-4 w-4 text-muted" />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              pendingPayouts,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Currently pending
          </p>
        </div>
      </div>

      {/* --------------------------------------------------
          REVENUE CHART
      -------------------------------------------------- */}

      <div className="mt-6 rounded-xl border border-border bg-background p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            Revenue
          </h2>

          <p className="text-sm text-muted">
            Your creator earnings for the selected period.
          </p>
        </div>

        <div className="mt-6">
          <AnalyticsChart
            data={chartData}
            currency={currency}
          />
        </div>
      </div>

      {/* --------------------------------------------------
          PERFORMANCE + TRANSACTIONS
      -------------------------------------------------- */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Performance */}

        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Content Performance
              </h2>

              <p className="mt-1 text-sm text-muted">
                Your most watched videos.
              </p>
            </div>

            <PlaySquare className="h-5 w-5 text-muted" />
          </div>

          <div className="mt-6 space-y-4">
            {topVideos.length > 0 ? (
              topVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4"
                >
                  <div className="w-5 text-sm font-medium text-muted">
                    {index + 1}
                  </div>

                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted-bg">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {video.title}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {formatNumber(
                          video.analyticsViews
                        )}{" "}
                        views
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                No videos available yet.
              </p>
            )}
          </div>
        </div>

        {/* Revenue summary */}

        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Earnings Summary
          </h2>

          <p className="mt-1 text-sm text-muted">
            Breakdown of your payment activity.
          </p>

          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm text-muted">
                Gross revenue
              </span>

              <span className="font-medium text-foreground">
                {formatCurrency(
                  totalGross,
                  currency
                )}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm text-muted">
                Platform fees
              </span>

              <span className="font-medium text-foreground">
                {formatCurrency(
                  totalFees,
                  currency
                )}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm text-muted">
                Net creator earnings
              </span>

              <span className="font-semibold text-foreground">
                {formatCurrency(
                  totalRevenue,
                  currency
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">
                Paid transactions
              </span>

              <span className="font-medium text-foreground">
                {formatNumber(
                  paidPayments.length
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          CHANNEL PERFORMANCE
      -------------------------------------------------- */}

      <div className="mt-6 rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Channel Performance
            </h2>

            <p className="mt-1 text-sm text-muted">
              Compare how each of your channels is performing.
            </p>
          </div>

          <Link
            href="/seller/channels"
            className="text-sm font-medium text-foreground hover:underline"
          >
            Manage channels
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  Channel
                </th>

                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                  Videos
                </th>

                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                  Views
                </th>

                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                  Subscribers
                </th>

                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-muted">
                  Revenue
                </th>
              </tr>
            </thead>

            <tbody>
              {channelStats.map((channel) => (
                <tr
                  key={channel.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-4 text-sm font-medium text-foreground">
                    {channel.name}
                  </td>

                  <td className="py-4 text-right text-sm text-secondary">
                    {formatNumber(
                      channel.videos
                    )}
                  </td>

                  <td className="py-4 text-right text-sm text-secondary">
                    {formatNumber(
                      channel.views
                    )}
                  </td>

                  <td className="py-4 text-right text-sm text-secondary">
                    {formatNumber(
                      channel.subscribers
                    )}
                  </td>

                  <td className="py-4 text-right text-sm font-medium text-foreground">
                    {formatCurrency(
                      channel.revenue,
                      currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}