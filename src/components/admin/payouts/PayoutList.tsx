"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import PayoutRow from "@/components/admin/payouts/PayoutRow";
import type { Payout } from "@/components/admin/payouts/PayoutsHeader";

type Props = {
  payouts: Payout[];
};

const PAGE_SIZE = 10;

export default function PayoutList({ payouts }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPayouts = useMemo(() => {
    const value = search.trim().toLowerCase();

    return payouts.filter((payout) => {
      const matchesStatus =
        status === "all" || payout.status === status;

      if (!matchesStatus) return false;

      if (!value) return true;

      const creator = payout.creator;

      const creatorName = creator?.display_name || "";
      const username = creator?.username || "";
      const provider = payout.provider || "";
      const providerPayoutId = payout.provider_payout_id || "";
      const notes = payout.notes || "";

      return (
        creatorName.toLowerCase().includes(value) ||
        username.toLowerCase().includes(value) ||
        provider.toLowerCase().includes(value) ||
        providerPayoutId.toLowerCase().includes(value) ||
        notes.toLowerCase().includes(value) ||
        payout.id.toLowerCase().includes(value)
      );
    });
  }, [payouts, search, status]);

  const totalPages = Math.ceil(
    filteredPayouts.length / PAGE_SIZE
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedPayouts = useMemo(() => {
    const from = (safeCurrentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    return filteredPayouts.slice(from, to);
  }, [filteredPayouts, safeCurrentPage]);

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (
    value: string
  ) => {
    setStatus(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Filters */}
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search payouts..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              handleStatusChange(event.target.value)
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
          >
            <option value="all">All payouts</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Payouts
          </h2>

          <p className="mt-1 text-sm text-muted">
            Creator payouts processed through NiceConvo.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-secondary">
                  Creator
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Amount
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Provider
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Created
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedPayouts.length > 0 ? (
                paginatedPayouts.map((payout) => (
                  <PayoutRow
                    key={payout.id}
                    payout={payout}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted"
                  >
                    {payouts.length === 0
                      ? "No payouts found."
                      : "No payouts match your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted">
              Showing{" "}
              {(safeCurrentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(
                safeCurrentPage * PAGE_SIZE,
                filteredPayouts.length
              )}{" "}
              of {filteredPayouts.length}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={safeCurrentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === safeCurrentPage
                      ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-white"
                      : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={safeCurrentPage === totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {totalPages <= 1 && (
        <div className="mt-3 text-xs text-muted">
          Showing {filteredPayouts.length} of{" "}
          {payouts.length} payouts.
        </div>
      )}
    </>
  );
}