"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import PageRow from "@/components/admin/pages/PageRow";

type SitePage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  page_data: Record<string, unknown>;
  locale_code: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  pages: SitePage[];
};

export default function PageList({
  pages,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredPages = useMemo(() => {
    const value = search.trim().toLowerCase();

    return pages.filter((page) => {
      const matchesStatus =
        status === "all" ||
        (status === "published" &&
          page.is_published) ||
        (status === "draft" &&
          !page.is_published);

      if (!matchesStatus) {
        return false;
      }

      if (!value) {
        return true;
      }

      return (
        page.title.toLowerCase().includes(value) ||
        page.slug.toLowerCase().includes(value)
      );
    });
  }, [pages, search, status]);

  return (
    <>
      {/* Filters */}
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search pages..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">
              All pages
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Draft
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              All Pages
            </h2>

            <p className="mt-1 text-sm text-muted">
              Manage your website pages and legal content.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-secondary">
                  Page
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Slug
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Language
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Updated
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <PageRow
                    key={page.id}
                    page={page}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted"
                  >
                    {pages.length === 0
                      ? "No pages found."
                      : "No pages match your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result count */}
      <div className="mt-3 text-xs text-muted">
        Showing {filteredPages.length} of{" "}
        {pages.length} pages.
      </div>
    </>
  );
}