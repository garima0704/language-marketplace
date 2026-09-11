"use client";

import { Search } from "lucide-react";

export default function ReportsToolbar() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

        <input
          type="search"
          placeholder="Search reports..."
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
        />
      </div>
    </div>
  );
}