"use client";

import { useState } from "react";

interface DataPoint {
  date: string;
  value: number;
}

interface AnalyticsMiniTrendProps {
  title: string;
  description: string;
  data: DataPoint[];
  valuePrefix?: string;
}

function formatValue(value: number, prefix = "") {
  return `${prefix}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatDate(date: string) {
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

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsMiniTrend({
  title,
  description,
  data,
  valuePrefix = "",
}: AnalyticsMiniTrendProps) {
  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const currentValue =
    data[data.length - 1]?.value ?? 0;

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-border bg-background p-5">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted">
          {description}
        </p>

        <div className="mt-6 flex h-20 items-center justify-center">
          <span className="text-xs text-muted">
            No data
          </span>
        </div>
      </section>
    );
  }

  const width = 400;
  const height = 100;

  const paddingX = 4;
  const paddingY = 10;

  const maxValue = Math.max(
    ...data.map((item) => item.value),
    1
  );

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index / Math.max(data.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      (item.value / maxValue) *
        (height - paddingY * 2);

    return {
      ...item,
      x,
      y,
    };
  });

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const selectedPoint =
    hoveredIndex !== null
      ? points[hoveredIndex]
      : null;

  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-muted">
            {description}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold tracking-tight">
            {formatValue(
              selectedPoint?.value ?? currentValue,
              valuePrefix
            )}
          </p>

          <p className="mt-1 text-[11px] text-muted">
            {selectedPoint
              ? formatDate(selectedPoint.date)
              : "Current"}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-24 w-full"
          preserveAspectRatio="none"
        >
          {/* Grid */}
          <line
            x1={0}
            x2={width}
            y1={height / 2}
            y2={height / 2}
            stroke="currentColor"
            strokeOpacity="0.06"
          />

          {/* Area */}
          <path
            d={`${path} L ${width} ${height} L 0 ${height} Z`}
            fill="currentColor"
            fillOpacity="0.05"
          />

          {/* Trend line */}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover areas + points */}
          {points.map((point, index) => {
            const previous =
              points[index - 1];

            const next =
              points[index + 1];

            const left =
              index === 0
                ? 0
                : (previous.x + point.x) / 2;

            const right =
              index === points.length - 1
                ? width
                : (point.x + next.x) / 2;

            const isHovered =
              hoveredIndex === index;

            return (
              <g key={index}>
                <rect
                  x={left}
                  y={0}
                  width={right - left}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredIndex(index)
                  }
                  onMouseLeave={() =>
                    setHoveredIndex(null)
                  }
                />

                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="currentColor"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {selectedPoint && (
          <div className="pointer-events-none absolute right-0 top-0 rounded-lg border border-border bg-background px-3 py-2 shadow-md">
            <p className="text-[11px] text-muted">
              {formatDate(selectedPoint.date)}
            </p>

            <p className="mt-0.5 text-xs font-semibold">
              {formatValue(
                selectedPoint.value,
                valuePrefix
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>{formatDate(data[0].date)}</span>

        <span>
          {formatDate(
            data[data.length - 1].date
          )}
        </span>
      </div>
    </section>
  );
}