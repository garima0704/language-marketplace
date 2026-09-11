"use client";

import { useMemo, useState } from "react";

import LanguageSearch from "./LanguageSearch";
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

type Props = {
  languages: Language[];
  regions: Region[];
};

export default function LanguageList({
  languages,
  regions,
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
    <div className="space-y-4">
      <LanguageSearch
        value={search}
        onChange={setSearch}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-white">
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