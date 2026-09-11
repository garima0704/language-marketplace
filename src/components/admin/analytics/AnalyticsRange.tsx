"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Range =
  | "7d"
  | "30d"
  | "90d"
  | "6m"
  | "1y"
  | "all";

interface AnalyticsRangeProps {
  range: Range;
}

const ranges: {
  value: Range;
  label: string;
}[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

export default function AnalyticsRange({
  range,
}: AnalyticsRangeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeRange(value: Range) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("range", value);

    params.delete("from");
    params.delete("to");

    router.push(`/admin/analytics?${params.toString()}`);
  }

  return (
    <div className="flex justify-end">
      <div className="inline-flex rounded-xl border border-border bg-background p-1">
        {ranges.map((item) => {
          const active = range === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => changeRange(item.value)}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-foreground/10",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}