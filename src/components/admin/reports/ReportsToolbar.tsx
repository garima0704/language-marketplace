"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ReportsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  function updateParams(
    key: string,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Always return to page 1 when filters change
    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              updateParams(
                "search",
                event.target.value
              )
            }
            placeholder="Search reports..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(event) =>
            updateParams(
              "status",
              event.target.value
            )
          }
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
        >
          <option value="all">All reports</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="removed">Removed</option>
        </select>
      </div>
    </div>
  );
}