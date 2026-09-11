"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function LanguageSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search languages..."
        className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground"
      />
    </div>
  );
}