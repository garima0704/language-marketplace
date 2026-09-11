"use client";

import { useState } from "react";

interface DataPoint {
  date: string;
  value: number;
}

interface AnalyticsTrendChartProps {
  id: string;
  title: string;
  description: string;
  data: DataPoint[];
  valuePrefix?: string;
}

interface ChartPoint extends DataPoint {
  x: number;
  y: number;
}

function formatValue(value: number, prefix = "") {
  return `${prefix}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatDateLabel(date: string) {
  // Monthly bucket: YYYY-MM
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [year, month] = date.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    );
  }

  // Daily bucket: YYYY-MM-DD
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNiceAxisMax(maxValue: number) {
  if (maxValue <= 0) {
    return 4;
  }

  if (maxValue <= 4) {
    return 4;
  }

  if (maxValue <= 10) {
    return 10;
  }

  if (maxValue <= 20) {
    return 20;
  }

  if (maxValue <= 50) {
    return 50;
  }

  if (maxValue <= 100) {
    return 100;
  }

  const magnitude =
    10 ** Math.floor(Math.log10(maxValue));

  const normalized = maxValue / magnitude;

  let niceNormalized = 10;

  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  }

  return niceNormalized * magnitude;
}

function formatAxisValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value);
}

export default function AnalyticsTrendChart({
  id,
  title,
  description,
  data,
  valuePrefix = "",
}: AnalyticsTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted">
          {description}
        </p>

        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted">
            No data available for this period.
          </p>
        </div>
      </section>
    );
  }

  const width = 1000;
  const height = 320;

  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 42;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxDataValue = Math.max(
    ...data.map((item) => item.value),
    0
  );

  const axisMax = getNiceAxisMax(maxDataValue);

  const points: ChartPoint[] = data.map(
    (item, index) => {
      const x =
        paddingLeft +
        (index /
          Math.max(data.length - 1, 1)) *
          chartWidth;

      const y =
        paddingTop +
        chartHeight -
        (item.value / axisMax) *
          chartHeight;

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const path = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaPath = `${path}
    L ${points[points.length - 1].x} ${
      paddingTop + chartHeight
    }
    L ${points[0].x} ${
      paddingTop + chartHeight
    }
    Z`;

  const last = data[data.length - 1];

  const selectedPoint =
    hoveredIndex !== null
      ? points[hoveredIndex]
      : null;

  /*
   * Five Y-axis levels:
   *
   * 4 ─────────
   * 3 ─────────
   * 2 ─────────
   * 1 ─────────
   * 0 ─────────
   */
  const yTicks = Array.from(
    { length: 5 },
    (_, index) =>
      axisMax -
      (axisMax / 4) * index
  );

  /*
   * Show around 5-6 X-axis labels instead
   * of only first/last.
   */
  const labelCount = Math.min(
    data.length,
    6
  );

  const labelIndexes = Array.from(
    { length: labelCount },
    (_, index) => {
      if (labelCount === 1) {
        return 0;
      }

      return Math.round(
        (index /
          (labelCount - 1)) *
          (data.length - 1)
      );
    }
  );

  return (
    <section className="rounded-2xl border border-border bg-background p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {title}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-semibold tracking-tight">
            {formatValue(
              selectedPoint?.value ?? last.value,
              valuePrefix
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            {selectedPoint
              ? formatDateLabel(
                  selectedPoint.date
                )
              : "Current"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative mt-8">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[300px] w-full overflow-visible"
          role="img"
          aria-label={`${title} trend chart`}
        >
          {/* Y-axis grid + labels */}
          {yTicks.map((tick, index) => {
            const y =
              paddingTop +
              (index / 4) *
                chartHeight;

            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                />

                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted text-[12px]"
                  fill="currentColor"
                  opacity="0.7"
                >
                  {formatAxisValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path
            d={areaPath}
            fill="currentColor"
            fillOpacity="0.05"
          />

          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover zones */}
          {points.map((point, index) => {
            const previous =
              points[index - 1];

            const next =
              points[index + 1];

            let left =
              index === 0
                ? paddingLeft
                : (previous.x + point.x) / 2;

            let right =
              index === points.length - 1
                ? width - paddingRight
                : (point.x + next.x) / 2;

            if (right <= left) {
              left = point.x - 20;
              right = point.x + 20;
            }

            return (
              <rect
                key={`hover-${index}`}
                x={left}
                y={paddingTop}
                width={Math.max(
                  right - left,
                  1
                )}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredIndex(index)
                }
                onMouseLeave={() =>
                  setHoveredIndex(null)
                }
              />
            );
          })}

          {/* Data points */}
          {points.map((point, index) => {
            const isHovered =
              hoveredIndex === index;

            return (
              <g key={`point-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 6 : 4}
                  fill="currentColor"
                  className="transition-all duration-150"
                />

                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {labelIndexes.map((index) => {
            const point = points[index];

            return (
              <text
                key={`label-${index}`}
                x={point.x}
                y={
                  paddingTop +
                  chartHeight +
                  28
                }
                textAnchor="middle"
                className="fill-muted text-[12px]"
                fill="currentColor"
                opacity="0.7"
              >
                {formatDateLabel(
                  point.date
                )}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {selectedPoint && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-xl border border-border bg-background px-4 py-3 shadow-lg"
            style={{
              left: `${Math.min(
                Math.max(
                  (selectedPoint.x / width) *
                    100,
                  8
                ),
                82
              )}%`,
              transform:
                "translateX(-50%)",
            }}
          >
            <p className="text-xs text-muted">
              {formatDateLabel(
                selectedPoint.date
              )}
            </p>

            <p className="mt-1 text-sm font-semibold">
              {formatValue(
                selectedPoint.value,
                valuePrefix
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}