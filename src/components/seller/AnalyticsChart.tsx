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
}: AnalyticsChartProps) {
  const maxRevenue = useMemo(() => {
    const max = Math.max(
      ...data.map((item) => item.revenue),
      0
    );

    return max > 0 ? max : 1;
  }, [data]);

  return (
    <div className="w-full">
      {/* Chart */}

      <div className="relative h-64">
        {/* Horizontal guides */}

        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className="border-t border-dashed border-border"
            />
          ))}
        </div>

        {/* Bars */}

        <div className="absolute inset-0 flex items-end justify-between gap-3 px-2">
          {data.map((item) => {
            const height =
              (item.revenue / maxRevenue) * 100;

            return (
              <div
                key={item.key}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <div className="relative flex h-full items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-md bg-primary transition-opacity group-hover:opacity-80"
                    style={{
                      height: `${Math.max(
                        height,
                        item.revenue > 0 ? 4 : 1
                      )}%`,
                    }}
                  >
                    {/* Tooltip */}

                    {item.revenue > 0 && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-sm group-hover:block">
                        <p className="font-medium text-foreground">
                          {formatCurrency(
                            item.revenue,
                            currency
                          )}
                        </p>

                        <p className="mt-1 text-muted">
                          {item.transactions}{" "}
                          {item.transactions === 1
                            ? "transaction"
                            : "transactions"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}

      <div className="mt-3 flex justify-between gap-3 px-2">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex-1 text-center text-xs text-muted"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}