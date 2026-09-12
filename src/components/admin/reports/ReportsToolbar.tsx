"use client";

import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ReportsToolbar() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <form
        action="/admin/reports"
        method="GET"
        className="relative w-full md:max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search reports..."
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        {search && (
          <a
            href="/admin/reports"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </a>
        )}
      </form>
    </div>
  );
}