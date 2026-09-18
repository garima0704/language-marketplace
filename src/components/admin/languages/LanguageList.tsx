"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import LanguageRow from "./LanguageRow";

export type Language = {
  code: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
};

export type Region = {
  id: number;
  language_code: string;
  country: string;
  state: string | null;
  sort_order: number;
};

export type LanguageTranslation = {
  locale_code: string;
  value: string;
};

type Props = {
  languages: Language[];
  regions: Region[];
  translations: Record<
    string,
    LanguageTranslation[]
  >;
  totalLanguages: number;
};

export default function LanguageList({
  languages,
  regions,
  translations,
  totalLanguages,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredLanguages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return languages;
    }

    return languages.filter(
      (language) =>
        language.name.toLowerCase().includes(value) ||
        language.code.toLowerCase().includes(value)
    );
  }, [languages, search]);

  return (
    <div className="space-y-6">
      {/* Search */}

      <div className="mt-8 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search languages..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
            />
          </div>
        </div>
      </div>

      {/* Languages */}

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Master Language Structure
          </h2>

          <p className="mt-1 text-sm text-muted">
            Manage languages, regional variations, and translations.
          </p>
        </div>

        {filteredLanguages.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No languages found
            </p>

            <p className="mt-1 text-sm text-muted">
              {languages.length === 0
                ? "No languages have been added yet."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLanguages.map((language) => {
              const languageRegions = regions.filter(
                (region) =>
                  region.language_code === language.code
              );

              return (
                <LanguageRow
                  key={language.code}
                  language={language}
                  regions={languageRegions}
                  translations={
                    translations[language.code] ?? []
                  }
                  totalLanguages={totalLanguages}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-muted">
        Showing {filteredLanguages.length} of{" "}
        {languages.length} languages
      </div>
    </div>
  );
}