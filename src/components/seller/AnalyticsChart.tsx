"use client";

import { useMemo } from "react";

interface AnalyticsPoint {
  key: string;
  label: string;
  revenue: number;
  transactions: number;
}

interface AnalyticsChartProps {
  data: AnalyticsPoint[];
  currency?: string;
  transactionLabel?: string;
  transactionsLabel?: string;
}

function formatCurrency(
  amount: number,
  currency = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AnalyticsChart({
  data,
  currency = "USD",
  transactionLabel = "transaction",
  transactionsLabel = "transactions",
}: AnalyticsChartProps) {
  const maxRevenue = useMemo(() => {
    const max = Math.max(
      ...data.map((item) => item.revenue),
      0
    );

    return max > 0 ? max : 1;
  }, [data]);

  return (
    <div className="w-full min-w-0">
      {/* Chart */}
      <div className="relative h-64 min-w-0 overflow-visible">
        {/* Horizontal guides */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className="border-t border-dashed border-border"
            />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex min-w-0 items-end justify-between gap-1 px-2 sm:gap-2">
          {data.map((item) => {
            const height =
              (item.revenue / maxRevenue) * 100;

            return (
              <div
                key={item.key}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                {/* Bar */}
                <div className="relative flex h-full min-w-0 items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-md bg-primary transition-opacity group-hover:opacity-80"
                    style={{
                      height: `${Math.max(
                        height,
                        item.revenue > 0 ? 4 : 1
                      )}%`,
                    }}
                  />
                </div>

                {/* Tooltip */}
                {item.revenue > 0 && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md group-hover:block">
                    <p className="font-medium text-foreground">
                      {formatCurrency(
                        item.revenue,
                        currency
                      )}
                    </p>

                    <p className="mt-1 text-muted">
                      {item.transactions}{" "}
                      {item.transactions === 1
                        ? transactionLabel
                        : transactionsLabel}
                    </p>

                    <p className="mt-1 text-muted">
                      {item.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="mt-6 flex min-w-0 gap-1 px-2 pb-10 sm:gap-2">
        {data.map((item) => (
          <div
            key={item.key}
            className="relative min-w-0 flex-1"
          >
            <div className="flex justify-center">
              <span className="origin-top-left translate-y-1 -rotate-45 whitespace-nowrap text-[11px] text-muted">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}