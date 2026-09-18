"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import TranslationRow from "./TranslationRow";

type Translation = {
  id: string;
  translation_key: string;
  name: string;
  section: string;
  locale_code: string;
  value: string;
  is_active: boolean;
};

type Locale = {
  code: string;
  name: string;
};

type Props = {
  translations: Translation[];
  locales: Locale[];
};

type TranslationGroup = {
  translationKey: string;
  name: string;
  section: string;
  english: string;
  translatedCount: number;
  totalLanguages: number;
  isComplete: boolean;
  isActive: boolean;
};

const PAGE_SIZE = 10;

function formatSection(section: string) {
  return section
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export default function TranslationList({
  translations,
  locales,
}: Props) {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --------------------------------------------------
  // Group translations by translation key
  // --------------------------------------------------

  const groups = useMemo<TranslationGroup[]>(() => {
    const grouped = new Map<
      string,
      Translation[]
    >();

    for (const row of translations) {
      const existing = grouped.get(
        row.translation_key
      );

      if (existing) {
        existing.push(row);
      } else {
        grouped.set(row.translation_key, [row]);
      }
    }

    return Array.from(grouped.entries()).map(
      ([translationKey, rows]) => {
        const englishRow = rows.find(
          (row) => row.locale_code === "en"
        );

        const translatedRows = rows.filter(
          (row) => row.locale_code !== "en"
        );

        const totalLanguages = locales.length;

        const translatedCount =
          translatedRows.filter(
            (row) => row.value?.trim()
          ).length;

        const isComplete =
          totalLanguages > 0 &&
          rows.filter((row) => row.value?.trim())
            .length >= totalLanguages;

        const isActive = rows.every(
          (row) => row.is_active
        );

        return {
          translationKey,
          name:
            englishRow?.name ??
            rows[0]?.name ??
            "",
          section:
            englishRow?.section ??
            rows[0]?.section ??
            "",
          english:
            englishRow?.value ?? "",
          translatedCount,
          totalLanguages,
          isComplete,
          isActive,
        };
      }
    );
  }, [translations, locales]);

  // --------------------------------------------------
  // Sections
  // --------------------------------------------------

  const sections = useMemo(() => {
    return Array.from(
      new Set(
        groups.map((item) => item.section)
      )
    ).sort();
  }, [groups]);

  // --------------------------------------------------
  // Filter translations
  // --------------------------------------------------

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return groups.filter((item) => {
      const matchesSearch =
        !query ||
        item.name
          .toLowerCase()
          .includes(query) ||
        item.translationKey
          .toLowerCase()
          .includes(query) ||
        item.english
          .toLowerCase()
          .includes(query);

      const matchesSection =
        section === "all" ||
        item.section === section;

      return (
        matchesSearch &&
        matchesSection
      );
    });
  }, [
    groups,
    search,
    section,
  ]);

  // --------------------------------------------------
  // Reset pagination when filters change
  // --------------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [search, section]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredGroups.length / PAGE_SIZE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedGroups = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredGroups.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [
    filteredGroups,
    safeCurrentPage,
  ]);

  const startResult =
    filteredGroups.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const endResult = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredGroups.length
  );

  // --------------------------------------------------
  // Pagination handlers
  // --------------------------------------------------

  function goToPage(page: number) {
    setCurrentPage(
      Math.min(
        Math.max(page, 1),
        totalPages
      )
    );
  }

  // --------------------------------------------------
  // Page numbers
  // --------------------------------------------------

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      safeCurrentPage - 2,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      safeCurrentPage + 2,
    ];
  }, [safeCurrentPage, totalPages]);

  return (
    <>
      {/* --------------------------------------------------
          Filters
      -------------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search translations..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
            />
          </div>

          {/* Section */}

          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value)
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">
              All sections
            </option>

            {sections.map((item) => (
              <option
                key={item}
                value={item}
              >
                {formatSection(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --------------------------------------------------
          Translation Table
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {/* Table header */}

        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Translations
          </h2>

          <p className="mt-1 text-sm text-muted">
            Website text used throughout NiceConvo.
          </p>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Translation
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Section
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  English
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Languages
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="whitespace-nowrap px-6 py-3 text-right font-medium text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedGroups.length > 0 ? (
                paginatedGroups.map(
                  (translation) => (
                    <TranslationRow
                      key={
                        translation.translationKey
                      }
                      translation={translation}
                    />
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-foreground">
                      No translations found
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Try changing your search or
                      section filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        {filteredGroups.length > 0 &&
          totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startResult}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {endResult}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredGroups.length}
                </span>{" "}
                translations
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage - 1
                    )
                  }
                  disabled={
                    safeCurrentPage === 1
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        goToPage(page)
                      }
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition ${
                        page === safeCurrentPage
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:bg-muted-bg"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage + 1
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Result count when only one page */}

      {filteredGroups.length > 0 &&
        totalPages === 1 && (
          <div className="mt-3 text-xs text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startResult}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {endResult}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredGroups.length}
            </span>{" "}
            translations.
          </div>
        )}
    </>
  );
}