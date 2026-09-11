"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import type { Language, Region } from "./LanguageList";

type Props = {
  language: Language;
  regions: Region[];
};

export default function LanguageRegions({
  language,
  regions,
}: Props) {
  const [search, setSearch] = useState("");
  const [expandedCountries, setExpandedCountries] =
    useState<Record<string, boolean>>({});

  // --------------------------------------------------
  // Filter regions
  // --------------------------------------------------

  const languageRegions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const sorted = [...regions].sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }

      const countryCompare = a.country.localeCompare(
        b.country
      );

      if (countryCompare !== 0) {
        return countryCompare;
      }

      return (a.state || "").localeCompare(
        b.state || ""
      );
    });

    if (!query) {
      return sorted;
    }

    return sorted.filter((region) => {
      const country = region.country.toLowerCase();
      const state =
        region.state?.toLowerCase() || "";

      return (
        country.includes(query) ||
        state.includes(query)
      );
    });
  }, [regions, search]);

  const totalRegionCount = regions.length;

  // --------------------------------------------------
  // Group regions by country
  // --------------------------------------------------

  const countries = useMemo(() => {
    const grouped = new Map<string, Region[]>();

    languageRegions.forEach((region) => {
      const existing = grouped.get(region.country);

      if (existing) {
        existing.push(region);
      } else {
        grouped.set(region.country, [region]);
      }
    });

    return Array.from(grouped.entries()).map(
      ([country, countryRegions]) => ({
        country,
        regions: countryRegions,
      })
    );
  }, [languageRegions]);

  // --------------------------------------------------
  // Toggle country
  // --------------------------------------------------

  const toggleCountry = (country: string) => {
    setExpandedCountries((previous) => ({
      ...previous,
      [country]: !previous[country],
    }));
  };

  return (
    <div className="border-t border-border bg-light-bg px-5 py-5 pl-[4.5rem]">
      <div className="max-w-4xl space-y-4">
        {/* Header */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Regions
            </h3>

            <p className="mt-0.5 text-xs text-muted">
              Regions available for {language.name}.
            </p>
          </div>

          <Link
            href={`/admin/languages/${language.code}/regions/new`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground transition hover:bg-light-bg"
          >
            <Plus className="h-4 w-4" />
            Add Region
          </Link>
        </div>

        {/* Search */}

        {totalRegionCount > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search regions..."
              className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground"
            />
          </div>
        )}

        {/* Region list */}

        {languageRegions.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-white px-4 py-8 text-center">
            <p className="text-sm text-muted">
              {totalRegionCount === 0
                ? "No regions added yet."
                : "No regions match your search."}
            </p>

            {totalRegionCount === 0 && (
              <Link
                href={`/admin/languages/${language.code}/regions/new`}
                className="mt-3 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
              >
                Add the first region
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <div className="divide-y divide-border">
              {countries.map(
                ({ country, regions: countryRegions }) => {
                  const isExpanded =
                    expandedCountries[country] ?? false;

                  return (
                    <div key={country}>
                      {/* Country row */}

                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleCountry(country)
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-muted-bg hover:text-foreground"
                          aria-label={
                            isExpanded
                              ? `Collapse ${country}`
                              : `Expand ${country}`
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleCountry(country)
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {country}
                            </span>

                            <span className="text-xs text-muted">
                              {countryRegions.length}{" "}
                              {countryRegions.length ===
                              1
                                ? "region"
                                : "regions"}
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* States / regions */}

                      {isExpanded && (
                        <div className="border-t border-border bg-light-bg">
                          {countryRegions.map(
                            (region) => (
                              <div
                                key={region.id}
                                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 pl-16 last:border-b-0"
                              >
                                <div className="min-w-0">
                                  {region.state ? (
                                    <p className="text-sm text-foreground">
                                      {region.state}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted">
                                      Entire country
                                    </p>
                                  )}
                                </div>

                                <Link
                                  href={`/admin/languages/${language.code}/regions/${region.id}/edit`}
                                  className="inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-secondary transition hover:bg-white hover:text-foreground"
                                >
                                  <Pencil className="h-3.5 w-3.5" />

                                  <span className="hidden sm:inline">
                                    Edit
                                  </span>
                                </Link>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}