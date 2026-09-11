import {
  ArrowDown,
  ArrowUp,
} from "lucide-react";

interface AnalyticsStatsProps {
  stats: {
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
  };
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function Change({
  value,
}: {
  value: number;
}) {
  const positive = value >= 0;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 text-xs font-medium",
        positive ? "text-foreground" : "text-muted",
      ].join(" ")}
    >
      {positive ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5" />
      )}

      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function AnalyticsStats({
  stats,
}: AnalyticsStatsProps) {
  const items = [
    {
      label: "Gross Revenue",
      value: money(stats.grossRevenue),
      change: stats.changes.grossRevenue,
      comparison: "vs previous period",
    },
    {
      label: "Platform Revenue",
      value: money(stats.platformRevenue),
      change: stats.changes.platformRevenue,
      comparison: "vs previous period",
    },
    {
      label: "New Subscriptions",
      value: number(stats.newSubscriptions),
      change: stats.changes.subscriptions,
      comparison: "vs previous period",
    },
    {
      label: "Video Views",
      value: number(stats.views),
      change: stats.changes.views,
      comparison: "vs previous period",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="px-6 py-6"
          >
            <p className="text-sm font-medium text-muted">
              {item.label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Change value={item.change} />

              <span className="text-xs text-muted">
                {item.comparison}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}