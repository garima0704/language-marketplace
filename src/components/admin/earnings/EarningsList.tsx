"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import EarningsRow from "@/components/admin/earnings/EarningsRow";
import type { Payment } from "@/components/admin/earnings/EarningsHeader";

type Props = {
  payments: Payment[];
};

export default function EarningsList({
  payments,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredPayments = useMemo(() => {
    const value = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        status === "all" ||
        payment.payment_status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!value) {
        return true;
      }

      const creator = payment.channel?.creator;
      const channel = payment.channel;

      const creatorName =
        creator?.display_name || "";

      const username =
        creator?.username || "";

      const channelName =
        channel?.channel_name || "";

      const provider =
        payment.payment_provider || "";

      return (
        creatorName
          .toLowerCase()
          .includes(value) ||
        username
          .toLowerCase()
          .includes(value) ||
        channelName
          .toLowerCase()
          .includes(value) ||
        provider
          .toLowerCase()
          .includes(value) ||
        payment.id
          .toLowerCase()
          .includes(value)
      );
    });
  }, [payments, search, status]);

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
                setSearch(event.target.value)
              }
              placeholder="Search earnings..."
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
            <option value="all">All earnings</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Earnings table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Earnings
          </h2>

          <p className="mt-1 text-sm text-muted">
            Revenue, platform fees, and creator earnings generated on NiceConvo.
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
                  Channel
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Revenue
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Platform Fee
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Creator Amount
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Date
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <EarningsRow
                    key={payment.id}
                    payment={payment}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-muted"
                  >
                    {payments.length === 0
                      ? "No earnings found."
                      : "No earnings match your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result count */}
      <div className="mt-3 text-xs text-muted">
        Showing {filteredPayments.length} of{" "}
        {payments.length} earnings.
      </div>
    </>
  );
}