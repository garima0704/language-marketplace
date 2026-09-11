import { createClient } from "@/lib/supabase/server";
import { formatDateKey } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

export type AnalyticsRange =
  | "7d"
  | "30d"
  | "90d"
  | "6m"
  | "1y"
  | "all";

export interface AnalyticsDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsStats {
  grossRevenue: number;
  platformRevenue: number;
  creatorEarnings: number;

  newUsers: number;
  newCreators: number;
  newSubscriptions: number;
  activeSubscriptions: number;

  videos: number;
  views: number;

  changes: {
    grossRevenue: number;
    platformRevenue: number;
    users: number;
    subscriptions: number;
    videos: number;
    views: number;
  };
}

export interface AnalyticsComparison {
  value: number;
  percentage: number;
  direction: "up" | "down" | "same";
}

export interface AnalyticsComparisons {
  totalRevenue: AnalyticsComparison;
  platformRevenue: AnalyticsComparison;
  creatorEarnings: AnalyticsComparison;
  totalPayments: AnalyticsComparison;
  videoViews: AnalyticsComparison;
  newUsers: AnalyticsComparison;
  newSellers: AnalyticsComparison;
}

export interface AdminAnalytics {
  range: AnalyticsRange;

  startDate: Date;
  endDate: Date;

  previousStartDate: Date;
  previousEndDate: Date;

  stats: AnalyticsStats;
  comparisons: AnalyticsComparisons;

  trends: {
    revenue: AnalyticsDataPoint[];
    platformRevenue: AnalyticsDataPoint[];
    creatorEarnings: AnalyticsDataPoint[];
    views: AnalyticsDataPoint[];
    users: AnalyticsDataPoint[];
    sellers: AnalyticsDataPoint[];
    subscriptions: AnalyticsDataPoint[];
  };

  topVideos: {
    id: string;
    title: string;
    channelId: string;
    views: number;
  }[];

  topChannels: {
    id: string;
    name: string;
    views: number;
  }[];

  insights: {
    title: string;
    description: string;
  }[];
}

// ============================================================
// Date helpers
// ============================================================

function startOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

function getRangeDates(range: AnalyticsRange) {
  const today = startOfDay(new Date());

  let startDate: Date;

  switch (range) {
    case "7d":
      startDate = addDays(today, -6);
      break;

    case "30d":
      startDate = addDays(today, -29);
      break;

    case "90d":
      startDate = addDays(today, -89);
      break;

    case "6m": {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    }

    case "1y": {
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    }

    case "all":
      startDate = new Date(2000, 0, 1);
      break;

    default:
      startDate = addDays(today, -29);
  }

  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(new Date()),
  };
}

function getPreviousPeriod(startDate: Date, endDate: Date) {
  const currentStart = startOfDay(startDate);
  const currentEnd = endOfDay(endDate);

  const durationDays =
    Math.round(
      (currentEnd.getTime() - currentStart.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const previousEnd = addDays(currentStart, -1);

  const previousStart = addDays(
    previousEnd,
    -(durationDays - 1)
  );

  return {
    previousStartDate: startOfDay(previousStart),
    previousEndDate: endOfDay(previousEnd),
  };
}

// ============================================================
// Comparison helpers
// ============================================================

function percentageChange(
  current: number,
  previous: number
): AnalyticsComparison {
  if (previous === 0 && current === 0) {
    return {
      value: current,
      percentage: 0,
      direction: "same",
    };
  }

  if (previous === 0) {
    return {
      value: current,
      percentage: 100,
      direction: "up",
    };
  }

  const percentage =
    ((current - previous) / Math.abs(previous)) * 100;

  return {
    value: current,
    percentage: Math.abs(percentage),
    direction:
      percentage > 0
        ? "up"
        : percentage < 0
          ? "down"
          : "same",
  };
}

function signedChange(current: number, previous: number) {
  if (previous === 0 && current === 0) {
    return 0;
  }

  if (previous === 0) {
    return 100;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

// ============================================================
// Trend bucket helpers
// ============================================================

function createDateBuckets(
  startDate: Date,
  endDate: Date
) {
  const buckets: string[] = [];

  const durationDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  // Daily for 7d / 30d / 90d
  if (durationDays <= 90) {
    let current = startOfDay(startDate);

    while (current <= endDate) {
      buckets.push(formatDateKey(current));

      current = addDays(current, 1);
    }

    return buckets;
  }

  // Monthly for longer periods
  let current = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );

  const finalMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    1
  );

  while (current <= finalMonth) {
    buckets.push(
      `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, "0")}`
    );

    current.setMonth(current.getMonth() + 1);
  }

  return buckets;
}

function getBucketKey(
  date: string | Date,
  daily: boolean
) {
  const value =
    typeof date === "string" ? new Date(date) : date;

  if (daily) {
    return formatDateKey(value);
  }

  return `${value.getFullYear()}-${String(
    value.getMonth() + 1
  ).padStart(2, "0")}`;
}

function createEmptyTrend(
  buckets: string[]
): AnalyticsDataPoint[] {
  return buckets.map((date) => ({
    date,
    value: 0,
  }));
}

// ============================================================
// Stats
// ============================================================

interface StatsResult {
  grossRevenue: number;
  platformRevenue: number;
  creatorEarnings: number;

  totalPayments: number;

  newUsers: number;
  newCreators: number;
  newSubscriptions: number;

  activeSubscriptions: number;

  videos: number;
  views: number;
}

async function getStats(
  startDate: Date,
  endDate: Date
): Promise<StatsResult> {
  const supabase = await createClient();

  const [
    paymentsResult,
    viewsResult,
    usersResult,
    creatorsResult,
    subscriptionsResult,
    videosResult,
    activeSubscriptionsResult,
  ] = await Promise.all([
    // --------------------------------------------------------
    // Paid payments
    // --------------------------------------------------------
    supabase
      .from("payments")
      .select(
        "id, gross_amount, platform_fee, creator_amount"
      )
      .eq("payment_status", "paid")
      .gte("paid_at", startDate.toISOString())
      .lte("paid_at", endDate.toISOString()),

    // --------------------------------------------------------
    // Video views
    // IMPORTANT: watched_at is the actual view event date
    // --------------------------------------------------------
    supabase
      .from("video_views")
      .select("id", { count: "exact", head: true })
      .gte("watched_at", startDate.toISOString())
      .lte("watched_at", endDate.toISOString()),

    // --------------------------------------------------------
    // New users
    // --------------------------------------------------------
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),

    // --------------------------------------------------------
    // New creators
    //
    // This means profiles created during the period with
    // is_creator = true.
    // --------------------------------------------------------
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_creator", true)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),

    // --------------------------------------------------------
    // New subscriptions
    // --------------------------------------------------------
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),

    // --------------------------------------------------------
    // New videos
    // --------------------------------------------------------
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),

    // --------------------------------------------------------
    // Current active subscriptions
    //
    // This is a current snapshot, NOT period-based.
    // --------------------------------------------------------
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  if (paymentsResult.error) {
    throw new Error(
      `Failed to load payments analytics: ${paymentsResult.error.message}`
    );
  }

  if (viewsResult.error) {
    throw new Error(
      `Failed to load video views analytics: ${viewsResult.error.message}`
    );
  }

  if (usersResult.error) {
    throw new Error(
      `Failed to load user analytics: ${usersResult.error.message}`
    );
  }

  if (creatorsResult.error) {
    throw new Error(
      `Failed to load creator analytics: ${creatorsResult.error.message}`
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load subscription analytics: ${subscriptionsResult.error.message}`
    );
  }

  if (videosResult.error) {
    throw new Error(
      `Failed to load video analytics: ${videosResult.error.message}`
    );
  }

  if (activeSubscriptionsResult.error) {
    throw new Error(
      `Failed to load active subscription analytics: ${activeSubscriptionsResult.error.message}`
    );
  }

  const payments = paymentsResult.data ?? [];

  const grossRevenue = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.gross_amount ?? 0),
    0
  );

  const platformRevenue = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.platform_fee ?? 0),
    0
  );

  const creatorEarnings = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.creator_amount ?? 0),
    0
  );

  return {
    grossRevenue,
    platformRevenue,
    creatorEarnings,

    totalPayments: payments.length,

    newUsers: usersResult.count ?? 0,
    newCreators: creatorsResult.count ?? 0,
    newSubscriptions: subscriptionsResult.count ?? 0,

    activeSubscriptions:
      activeSubscriptionsResult.count ?? 0,

    videos: videosResult.count ?? 0,
    views: viewsResult.count ?? 0,
  };
}

// ============================================================
// Revenue trends
// ============================================================

async function getRevenueTrends(
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient();

  const durationDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const daily = durationDays <= 90;

  const buckets = createDateBuckets(
    startDate,
    endDate
  );

  const revenue = createEmptyTrend(buckets);
  const platformRevenue = createEmptyTrend(buckets);
  const creatorEarnings = createEmptyTrend(buckets);

  const { data, error } = await supabase
    .from("payments")
    .select(
      "gross_amount, platform_fee, creator_amount, paid_at"
    )
    .eq("payment_status", "paid")
    .gte("paid_at", startDate.toISOString())
    .lte("paid_at", endDate.toISOString());

  if (error) {
    throw new Error(
      `Failed to load revenue trends: ${error.message}`
    );
  }

  const revenueMap = new Map<string, number>();
  const platformMap = new Map<string, number>();
  const creatorMap = new Map<string, number>();

  for (const payment of data ?? []) {
    if (!payment.paid_at) continue;

    const key = getBucketKey(
      payment.paid_at,
      daily
    );

    revenueMap.set(
      key,
      (revenueMap.get(key) ?? 0) +
        Number(payment.gross_amount ?? 0)
    );

    platformMap.set(
      key,
      (platformMap.get(key) ?? 0) +
        Number(payment.platform_fee ?? 0)
    );

    creatorMap.set(
      key,
      (creatorMap.get(key) ?? 0) +
        Number(payment.creator_amount ?? 0)
    );
  }

  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];

    revenue[i].value =
      revenueMap.get(bucket) ?? 0;

    platformRevenue[i].value =
      platformMap.get(bucket) ?? 0;

    creatorEarnings[i].value =
      creatorMap.get(bucket) ?? 0;
  }

  return {
    revenue,
    platformRevenue,
    creatorEarnings,
  };
}

// ============================================================
// View trends
// ============================================================

async function getViewTrend(
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient();

  const durationDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const daily = durationDays <= 90;

  const buckets = createDateBuckets(
    startDate,
    endDate
  );

  const trend = createEmptyTrend(buckets);

  const { data, error } = await supabase
    .from("video_views")
    .select("watched_at")
    .gte("watched_at", startDate.toISOString())
    .lte("watched_at", endDate.toISOString());

  if (error) {
    throw new Error(
      `Failed to load view trends: ${error.message}`
    );
  }

  const map = new Map<string, number>();

  for (const view of data ?? []) {
    if (!view.watched_at) continue;

    const key = getBucketKey(
      view.watched_at,
      daily
    );

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  for (let i = 0; i < buckets.length; i++) {
    trend[i].value =
      map.get(buckets[i]) ?? 0;
  }

  return trend;
}

// ============================================================
// User / creator trends
// ============================================================

async function getProfileTrends(
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient();

  const durationDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const daily = durationDays <= 90;

  const buckets = createDateBuckets(
    startDate,
    endDate
  );

  const users = createEmptyTrend(buckets);
  const sellers = createEmptyTrend(buckets);

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at, is_creator")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error) {
    throw new Error(
      `Failed to load profile trends: ${error.message}`
    );
  }

  const usersMap = new Map<string, number>();
  const sellersMap = new Map<string, number>();

  for (const profile of data ?? []) {
    if (!profile.created_at) continue;

    const key = getBucketKey(
      profile.created_at,
      daily
    );

    usersMap.set(
      key,
      (usersMap.get(key) ?? 0) + 1
    );

    if (profile.is_creator) {
      sellersMap.set(
        key,
        (sellersMap.get(key) ?? 0) + 1
      );
    }
  }

  for (let i = 0; i < buckets.length; i++) {
    users[i].value =
      usersMap.get(buckets[i]) ?? 0;

    sellers[i].value =
      sellersMap.get(buckets[i]) ?? 0;
  }

  return {
    users,
    sellers,
  };
}

// ============================================================
// Subscription trends
// ============================================================

async function getSubscriptionTrend(
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient();

  const durationDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const daily = durationDays <= 90;

  const buckets = createDateBuckets(
    startDate,
    endDate
  );

  const trend = createEmptyTrend(buckets);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error) {
    throw new Error(
      `Failed to load subscription trends: ${error.message}`
    );
  }

  const map = new Map<string, number>();

  for (const subscription of data ?? []) {
    if (!subscription.created_at) continue;

    const key = getBucketKey(
      subscription.created_at,
      daily
    );

    map.set(
      key,
      (map.get(key) ?? 0) + 1
    );
  }

  for (let i = 0; i < buckets.length; i++) {
    trend[i].value =
      map.get(buckets[i]) ?? 0;
  }

  return trend;
}

// ============================================================
// Top videos + channels
// ============================================================

async function getTopContent(
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient();

  // ----------------------------------------------------------
  // Get all videos.
  //
  // We intentionally do NOT filter videos by created_at here.
  // An old video can still be one of the most viewed videos
  // during the selected analytics period.
  // ----------------------------------------------------------
  const { data: videos, error: videosError } =
    await supabase
      .from("videos")
      .select("id, title, channel_id");

  if (videosError) {
    throw new Error(
      `Failed to load videos for analytics: ${videosError.message}`
    );
  }

  // ----------------------------------------------------------
  // Get views during selected period.
  // ----------------------------------------------------------
  const { data: views, error: viewsError } =
    await supabase
      .from("video_views")
      .select("video_id")
      .gte("watched_at", startDate.toISOString())
      .lte("watched_at", endDate.toISOString());

  if (viewsError) {
    throw new Error(
      `Failed to load video views for top content: ${viewsError.message}`
    );
  }

  // ----------------------------------------------------------
  // Count views per video
  // ----------------------------------------------------------
  const videoViewMap = new Map<string, number>();

  for (const view of views ?? []) {
    if (!view.video_id) continue;

    videoViewMap.set(
      view.video_id,
      (videoViewMap.get(view.video_id) ?? 0) + 1
    );
  }

  const videoLookup = new Map(
    (videos ?? []).map((video) => [
      video.id,
      video,
    ])
  );

  // ----------------------------------------------------------
  // Top videos
  // ----------------------------------------------------------
  const topVideos = Array.from(
    videoViewMap.entries()
  )
    .map(([videoId, viewCount]) => {
      const video = videoLookup.get(videoId);

      if (!video) return null;

      return {
        id: video.id,
        title: video.title ?? "Untitled video",
        channelId: video.channel_id,
        views: viewCount,
      };
    })
    .filter(
      (
        video
      ): video is {
        id: string;
        title: string;
        channelId: string;
        views: number;
      } => Boolean(video)
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ----------------------------------------------------------
  // Aggregate views by channel
  // ----------------------------------------------------------
  const channelViewMap = new Map<
    string,
    number
  >();

  for (const [videoId, viewCount] of videoViewMap) {
    const video = videoLookup.get(videoId);

    if (!video?.channel_id) continue;

    channelViewMap.set(
      video.channel_id,
      (channelViewMap.get(video.channel_id) ?? 0) +
        viewCount
    );
  }

  // ----------------------------------------------------------
  // Get channel names
  // ----------------------------------------------------------
  const channelIds = Array.from(
    channelViewMap.keys()
  );

  let channels: {
    id: string;
    channel_name: string;
  }[] = [];

  if (channelIds.length > 0) {
    const { data, error } = await supabase
      .from("channels")
      .select("id, channel_name")
      .in("id", channelIds);

    if (error) {
      throw new Error(
        `Failed to load channels for analytics: ${error.message}`
      );
    }

    channels = data ?? [];
  }

  const channelLookup = new Map(
    channels.map((channel) => [
      channel.id,
      channel,
    ])
  );

  const topChannels = Array.from(
    channelViewMap.entries()
  )
    .map(([channelId, viewCount]) => {
      const channel = channelLookup.get(channelId);

      if (!channel) {
        return null;
      }

      return {
        id: channel.id,
        name:
          channel.channel_name ??
          "Untitled channel",
        views: viewCount,
      };
    })
    .filter((channel) => channel !== null)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

     return {
    topVideos,
    topChannels,
  };
}

// ============================================================
// Insights
// ============================================================

function buildInsights(
  stats: AnalyticsStats,
  topVideos: AdminAnalytics["topVideos"]
) {
  const insights: {
    title: string;
    description: string;
  }[] = [];

  // ----------------------------------------------------------
  // Revenue
  // ----------------------------------------------------------
  if (stats.changes.grossRevenue > 0) {
    insights.push({
      title: "Revenue is growing",
      description: `Gross revenue increased by ${Math.round(
        stats.changes.grossRevenue
      )}% compared with the previous period.`,
    });
  } else if (stats.changes.grossRevenue < 0) {
    insights.push({
      title: "Revenue declined",
      description: `Gross revenue decreased by ${Math.round(
        Math.abs(stats.changes.grossRevenue)
      )}% compared with the previous period.`,
    });
  }

  // ----------------------------------------------------------
  // Users
  // ----------------------------------------------------------
  if (stats.changes.users > 0) {
    insights.push({
      title: "User growth is positive",
      description: `New users increased by ${Math.round(
        stats.changes.users
      )}% compared with the previous period.`,
    });
  } else if (stats.changes.users < 0) {
    insights.push({
      title: "User growth slowed",
      description: `New user registrations decreased by ${Math.round(
        Math.abs(stats.changes.users)
      )}% compared with the previous period.`,
    });
  }

  // ----------------------------------------------------------
  // Subscriptions
  // ----------------------------------------------------------
  if (stats.changes.subscriptions > 0) {
    insights.push({
      title: "Subscriptions are increasing",
      description: `New subscriptions increased by ${Math.round(
        stats.changes.subscriptions
      )}% compared with the previous period.`,
    });
  } else if (stats.changes.subscriptions < 0) {
    insights.push({
      title: "Subscriptions declined",
      description: `New subscriptions decreased by ${Math.round(
        Math.abs(stats.changes.subscriptions)
      )}% compared with the previous period.`,
    });
  }

  // ----------------------------------------------------------
  // Views
  // ----------------------------------------------------------
  if (stats.changes.views > 0) {
    insights.push({
      title: "Video engagement is up",
      description: `Video views increased by ${Math.round(
        stats.changes.views
      )}% compared with the previous period.`,
    });
  } else if (stats.changes.views < 0) {
    insights.push({
      title: "Video engagement declined",
      description: `Video views decreased by ${Math.round(
        Math.abs(stats.changes.views)
      )}% compared with the previous period.`,
    });
  }

  // ----------------------------------------------------------
  // Top video
  // ----------------------------------------------------------
  const topVideo = topVideos[0];

  if (topVideo) {
    insights.push({
      title: "Top performing video",
      description: `"${topVideo.title}" generated ${topVideo.views.toLocaleString()} views during this period.`,
    });
  }

  // ----------------------------------------------------------
  // Empty-state insight
  // ----------------------------------------------------------
  if (insights.length === 0) {
    insights.push({
      title: "Not enough activity yet",
      description:
        "There is not enough activity in this period to identify meaningful trends.",
    });
  }

  return insights.slice(0, 5);
}

// ============================================================
// Main analytics function
// ============================================================

export async function getAdminAnalytics(
  range: AnalyticsRange = "30d",
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AdminAnalytics> {
  // ----------------------------------------------------------
  // Date range
  // ----------------------------------------------------------
  const rangeDates = getRangeDates(range);

  const startDate = options?.startDate
    ? startOfDay(options.startDate)
    : rangeDates.startDate;

  const endDate = options?.endDate
    ? endOfDay(options.endDate)
    : rangeDates.endDate;

  const {
    previousStartDate,
    previousEndDate,
  } = getPreviousPeriod(startDate, endDate);

  // ----------------------------------------------------------
  // Current + previous stats
  // ----------------------------------------------------------
  const [
    currentStats,
    previousStats,
    revenueTrends,
    viewTrend,
    profileTrends,
    subscriptionTrend,
    topContent,
  ] = await Promise.all([
    getStats(startDate, endDate),

    getStats(
      previousStartDate,
      previousEndDate
    ),

    getRevenueTrends(
      startDate,
      endDate
    ),

    getViewTrend(
      startDate,
      endDate
    ),

    getProfileTrends(
      startDate,
      endDate
    ),

    getSubscriptionTrend(
      startDate,
      endDate
    ),

    getTopContent(
      startDate,
      endDate
    ),
  ]);

  // ----------------------------------------------------------
  // Stats changes
  // ----------------------------------------------------------
  const stats: AnalyticsStats = {
    grossRevenue: currentStats.grossRevenue,
    platformRevenue: currentStats.platformRevenue,
    creatorEarnings: currentStats.creatorEarnings,

    newUsers: currentStats.newUsers,
    newCreators: currentStats.newCreators,
    newSubscriptions:
      currentStats.newSubscriptions,

    activeSubscriptions:
      currentStats.activeSubscriptions,

    videos: currentStats.videos,
    views: currentStats.views,

    changes: {
      grossRevenue: signedChange(
        currentStats.grossRevenue,
        previousStats.grossRevenue
      ),

      platformRevenue: signedChange(
        currentStats.platformRevenue,
        previousStats.platformRevenue
      ),

      users: signedChange(
        currentStats.newUsers,
        previousStats.newUsers
      ),

      subscriptions: signedChange(
        currentStats.newSubscriptions,
        previousStats.newSubscriptions
      ),

      videos: signedChange(
        currentStats.videos,
        previousStats.videos
      ),

      views: signedChange(
        currentStats.views,
        previousStats.views
      ),
    },
  };

  // ----------------------------------------------------------
  // Comparisons
  // ----------------------------------------------------------
  const comparisons: AnalyticsComparisons = {
    totalRevenue: percentageChange(
      currentStats.grossRevenue,
      previousStats.grossRevenue
    ),

    platformRevenue: percentageChange(
      currentStats.platformRevenue,
      previousStats.platformRevenue
    ),

    creatorEarnings: percentageChange(
      currentStats.creatorEarnings,
      previousStats.creatorEarnings
    ),

    totalPayments: percentageChange(
      currentStats.totalPayments,
      previousStats.totalPayments
    ),

    videoViews: percentageChange(
      currentStats.views,
      previousStats.views
    ),

    newUsers: percentageChange(
      currentStats.newUsers,
      previousStats.newUsers
    ),

    // Existing name kept for compatibility with the
    // current AnalyticsComparisons interface.
    newSellers: percentageChange(
      currentStats.newCreators,
      previousStats.newCreators
    ),
  };

  // ----------------------------------------------------------
  // Insights
  // ----------------------------------------------------------
  const insights = buildInsights(
    stats,
    topContent.topVideos
  );

  // ----------------------------------------------------------
  // Final result
  // ----------------------------------------------------------
  return {
    range,

    startDate,
    endDate,

    previousStartDate,
    previousEndDate,

    stats,
    comparisons,

    trends: {
      revenue: revenueTrends.revenue,
      platformRevenue:
        revenueTrends.platformRevenue,
      creatorEarnings:
        revenueTrends.creatorEarnings,

      views: viewTrend,

      users: profileTrends.users,
      sellers: profileTrends.sellers,

      subscriptions: subscriptionTrend,
    },

    topVideos: topContent.topVideos,
    topChannels: topContent.topChannels,

    insights,
  };
}