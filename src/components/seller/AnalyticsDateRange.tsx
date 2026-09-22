"use client";

import {
  CalendarDays,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface AnalyticsDateRangeProps {
  translations: {
    last7Days: string;
    last30Days: string;
    last90Days: string;
    last6Months: string;
    lastYear: string;
    allTime: string;
    customRange: string;
    to: string;
    apply: string;
  };
}

export default function AnalyticsDateRange({
  translations,
}: AnalyticsDateRangeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const currentRange =
    searchParams.get("range") || "30d";

  const [from, setFrom] = useState(
    searchParams.get("from") || ""
  );

  const [to, setTo] = useState(
    searchParams.get("to") || ""
  );

  const ranges = [
    {
      value: "7d",
      label: translations.last7Days,
    },
    {
      value: "30d",
      label: translations.last30Days,
    },
    {
      value: "90d",
      label: translations.last90Days,
    },
    {
      value: "6m",
      label: translations.last6Months,
    },
    {
      value: "1y",
      label: translations.lastYear,
    },
    {
      value: "all",
      label: translations.allTime,
    },
    {
      value: "custom",
      label: translations.customRange,
    },
  ];

  const selectedRange =
    ranges.find(
      (range) => range.value === currentRange
    ) || ranges[1];

  // --------------------------------------------------
  // Close dropdown when clicking outside
  // --------------------------------------------------

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // Change preset range
  // --------------------------------------------------

  function handleRangeChange(value: string) {
    if (value === "custom") {
      setOpen(false);

      const params = new URLSearchParams(searchParams);

      params.set("range", "custom");

      router.push(
        `${pathname}?${params.toString()}`
      );

      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("range", value);
    params.delete("from");
    params.delete("to");

    setFrom("");
    setTo("");
    setOpen(false);

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  // --------------------------------------------------
  // Apply custom range
  // --------------------------------------------------

  function applyCustomRange() {
    if (!from || !to) return;

    if (from > to) return;

    const params = new URLSearchParams(searchParams);

    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  const customRangeInvalid =
    !from ||
    !to ||
    from > to;

  return (
    <div
      ref={ref}
      className="relative flex flex-wrap items-center gap-2"
    >
      {/* RANGE BUTTON */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          h-10
          min-w-44
          items-center
          justify-between
          rounded-full
          bg-background
          px-4
          text-sm
          font-medium
          text-foreground
          transition
          hover:bg-secondary
          hover:text-white
          hover:shadow-md
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays
            size={17}
            className="shrink-0"
          />

          <span className="truncate">
            {selectedRange.label}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-2
            w-56
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-background
            shadow-xl
          "
        >
          {ranges.map((range) => {
            const selected =
              currentRange === range.value;

            return (
              <button
                type="button"
                key={range.value}
                onClick={() =>
                  handleRangeChange(range.value)
                }
                className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  px-4
                  py-3
                  text-left
                  text-sm
                  transition
                  ${
                    selected
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-secondary hover:text-white"
                  }
                `}
              >
                <span>{range.label}</span>

                {selected && (
                  <Check size={16} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* CUSTOM DATE RANGE */}

      {currentRange === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(event) =>
              setFrom(event.target.value)
            }
            className="
              h-10
              rounded-full
              border
              border-border
              bg-background
              px-4
              text-sm
              text-foreground
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
              [color-scheme:light]
            "
          />

          <span className="text-sm text-muted">
            {translations.to}
          </span>

          <input
            type="date"
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
            className="
              h-10
              rounded-full
              border
              border-border
              bg-background
              px-4
              text-sm
              text-foreground
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
              [color-scheme:light]
            "
          />

          <button
            type="button"
            onClick={applyCustomRange}
            disabled={customRangeInvalid}
            className="
              h-10
              rounded-full
              bg-primary
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {translations.apply}
          </button>
        </div>
      )}
    </div>
  );
}