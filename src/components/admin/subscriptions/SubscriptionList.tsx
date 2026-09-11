"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import SubscriptionRow from "@/components/admin/subscriptions/SubscriptionRow";

import type { Subscription } from "@/components/admin/subscriptions/SubscriptionsHeader";

type Props = {
  subscriptions: Subscription[];
};

export default function SubscriptionList({
  subscriptions,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredSubscriptions = useMemo(() => {
    const value = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesStatus =
        status === "all" ||
        subscription.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!value) {
        return true;
      }

      const buyer = subscription.buyer;
      const channel = subscription.channel;

      const buyerName =
        buyer?.display_name ||
        buyer?.username ||
        "";

      const username = buyer?.username || "";

      const channelName =
        channel?.channel_name || "";

      return (
        buyerName.toLowerCase().includes(value) ||
        username.toLowerCase().includes(value) ||
        channelName.toLowerCase().includes(value) ||
        subscription.id.toLowerCase().includes(value)
      );
    });
  }, [subscriptions, search, status]);

  return (
    <>
      {/* Filters */}
      <div className="mt-8 rounded-xl border border-border bg-background p-4">
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
              placeholder="Search subscriptions..."
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
              All subscriptions
            </option>

            <option value="active">
              Active
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="expired">
              Expired
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">

        {/* Table title */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Subscriptions
          </h2>

          <p className="mt-1 text-sm text-muted">
            Customer subscriptions on NiceConvo.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-secondary">
                  Subscriber
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Channel
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Price
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Next Billing
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Provider
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-muted"
                  >
                    {subscriptions.length === 0
                      ? "No subscriptions found."
                      : "No subscriptions match your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted">
        Showing {filteredSubscriptions.length} of{" "}
        {subscriptions.length} subscriptions.
      </div>
    </>
  );
}