import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminAnalytics,
  type AnalyticsRange,
} from "@/lib/analytics/admin";

import AnalyticsHeader from "@/components/admin/analytics/AnalyticsHeader";
import AnalyticsRangeSelector from "@/components/admin/analytics/AnalyticsRange";
import AnalyticsStats from "@/components/admin/analytics/AnalyticsStats";
import AnalyticsTrendChart from "@/components/admin/analytics/AnalyticsTrendChart";
import AnalyticsBreakdown from "@/components/admin/analytics/AnalyticsBreakdown";
import AnalyticsTopVideos from "@/components/admin/analytics/AnalyticsTopVideos";
import AnalyticsTopChannels from "@/components/admin/analytics/AnalyticsTopChannels";
import AnalyticsInsights from "@/components/admin/analytics/AnalyticsInsights";
import AnalyticsMiniTrend from "@/components/admin/analytics/AnalyticsMiniTrend";

type SearchParams = {
  range?: string;
  from?: string;
  to?: string;
};

const allowedRanges: AnalyticsRange[] = [
  "7d",
  "30d",
  "90d",
  "6m",
  "1y",
  "all",
];

function getValidRange(
  value?: string
): AnalyticsRange {
  if (
    value &&
    allowedRanges.includes(
      value as AnalyticsRange
    )
  ) {
    return value as AnalyticsRange;
  }

  return "30d";
}

function getValidDate(
  value?: string
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const range = getValidRange(
    params.range
  );

  const customStartDate = getValidDate(
    params.from
  );

  const customEndDate = getValidDate(
    params.to
  );

  const analytics =
    await getAdminAnalytics(range, {
      startDate: customStartDate,
      endDate: customEndDate,
    });

  console.log("========== ADMIN ANALYTICS ==========");
console.log("Range:", range);
console.log("Start date:", analytics.startDate);
console.log("End date:", analytics.endDate);

console.log("Stats:", JSON.stringify(analytics.stats, null, 2));

console.log(
  "Revenue:",
  JSON.stringify(analytics.trends.revenue, null, 2)
);

console.log(
  "Users:",
  JSON.stringify(analytics.trends.users, null, 2)
);

console.log(
  "Subscriptions:",
  JSON.stringify(
    analytics.trends.subscriptions,
    null,
    2
  )
);

console.log(
  "Views:",
  JSON.stringify(
    analytics.trends.views,
    null,
    2
  )
);

console.log(
  "Top videos:",
  JSON.stringify(
    analytics.topVideos,
    null,
    2
  )
);

console.log(
  "Top channels:",
  JSON.stringify(
    analytics.topChannels,
    null,
    2
  )
);

console.log("======================================");

  const {
    startDate,
    endDate,
    stats,
    trends,
    topVideos,
    topChannels,
    insights,
  } = analytics;

  return (
    <main className="w-full">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">

        {/* Header */}
        <AnalyticsHeader
          startDate={startDate}
          endDate={endDate}
        />

        {/* Range selector */}
        <div className="mt-8">
          <AnalyticsRangeSelector
            range={range}
          />
        </div>

        {/* Overview stats */}
        <div className="mt-8">
          <AnalyticsStats
            stats={stats}
          />
        </div>

        {/* Revenue */}
        <div className="mt-10">
          <AnalyticsTrendChart
            id="revenue"
            title="Revenue"
            description="Gross revenue generated during the selected period."
            data={trends.revenue}
            valuePrefix="$"
          />
        </div>

        {/* Secondary trends */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AnalyticsMiniTrend
            title="Users"
            description="New users"
            data={trends.users}
          />

          <AnalyticsMiniTrend
            title="Subscriptions"
            description="New subscriptions"
            data={trends.subscriptions}
          />

          <AnalyticsMiniTrend
            title="Video Views"
            description="Viewing activity"
            data={trends.views}
          />
        </div>

        {/* Revenue breakdown */}
        <div className="mt-8">
          <AnalyticsBreakdown
            grossRevenue={
              stats.grossRevenue
            }
            platformRevenue={
              stats.platformRevenue
            }
            creatorEarnings={
              stats.creatorEarnings
            }
            data={[
              {
                name: "Platform revenue",
                value:
                  stats.platformRevenue,
              },
              {
                name: "Creator earnings",
                value:
                  stats.creatorEarnings,
              },
            ]}
          />
        </div>

        {/* Top content */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AnalyticsTopVideos
            videos={topVideos}
          />

          <AnalyticsTopChannels
            channels={topChannels}
          />
        </div>

        {/* Insights */}
        <div className="mt-8">
          <AnalyticsInsights
            insights={insights}
          />
        </div>

      </div>
    </main>
  );
}