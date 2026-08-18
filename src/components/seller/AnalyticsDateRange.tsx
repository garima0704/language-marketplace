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

const ranges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

export default function AnalyticsDateRange() {
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

      // Keep existing dates if already selected.
      // Otherwise start with empty dates.
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
      {/* --------------------------------------------------
          RANGE BUTTON
      -------------------------------------------------- */}

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
        <div className="flex items-center gap-2">
          <CalendarDays size={17} />

          <span className="truncate">
            {selectedRange.label}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* --------------------------------------------------
          DROPDOWN
      -------------------------------------------------- */}

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

      {/* --------------------------------------------------
          CUSTOM DATE RANGE
      -------------------------------------------------- */}

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
            to
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
            Apply
          </button>
        </div>
      )}
    </div>
  );
}