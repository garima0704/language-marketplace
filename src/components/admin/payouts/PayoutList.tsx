"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import PayoutRow from "@/components/admin/payouts/PayoutRow";
import type { Payout } from "@/components/admin/payouts/PayoutsHeader";

type Props = {
  payouts: Payout[];
};

export default function PayoutList({ payouts }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredPayouts = useMemo(() => {
    const value = search.trim().toLowerCase();

    return payouts.filter((payout) => {
      const matchesStatus =
        status === "all" ||
        payout.status === status;

      if (!matchesStatus) return false;

      if (!value) return true;

      const creator = payout.creator;

      const creatorName =
        creator?.display_name || "";

      const username =
        creator?.username || "";

      const provider =
        payout.provider || "";

      const providerPayoutId =
        payout.provider_payout_id || "";

      const notes =
        payout.notes || "";

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

  return (
    <>
      {/* Filters */}
      <div className="mt-8 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search payouts..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
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
                  Payout ID
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Created
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Processed
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => (
                  <PayoutRow
                    key={payout.id}
                    payout={payout}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
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
      </div>

      <div className="mt-3 text-xs text-muted">
        Showing {filteredPayouts.length} of{" "}
        {payouts.length} payouts.
      </div>
    </>
  );
}