"use client";

import Link from "next/link";
import Image from "next/image";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

interface Subscriber {
  id: string;
  buyerId: string;

  subscriberName: string;
  username: string | null;
  avatarUrl: string | null;

  channelName: string;
  channelSlug: string | null;

  price: number;
  currency: string;

  status: string;

  startedAt: string;
  currentPeriodEnd: string;

  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;

  paymentProvider: string;
  createdAt: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(
  amount: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${
      currency || "USD"
    }`;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SubscribersTable({
  subscribers,
}: SubscribersTableProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const filteredSubscribers =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return subscribers.filter(
        (subscriber) => {
          const matchesSearch =
            !searchValue ||
            subscriber.subscriberName
              .toLowerCase()
              .includes(searchValue) ||
            subscriber.username
              ?.toLowerCase()
              .includes(searchValue) ||
            subscriber.channelName
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter === "all" ||
            subscriber.status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      subscribers,
      search,
      statusFilter,
    ]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}

        <div className="relative w-full sm:max-w-sm">

          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search subscribers..."
            className="h-10 rounded-lg border-border pl-9"
          />

        </div>

        {/* Status */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              setStatusFilter("all")
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              statusFilter === "all"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-muted-bg"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter("active")
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              statusFilter === "active"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-muted-bg"
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter("cancelled")
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              statusFilter === "cancelled"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-muted-bg"
            }`}
          >
            Cancelled
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter("expired")
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              statusFilter === "expired"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-muted-bg"
            }`}
          >
            Expired
          </button>

        </div>

      </div>

      {/* ==================================================
          EMPTY FILTER RESULT
      ================================================== */}

      {filteredSubscribers.length === 0 ? (
        <div className="px-6 py-16 text-center">

          <p className="font-medium text-foreground">
            {subscribers.length === 0
              ? "No subscribers yet"
              : "No subscribers found"}
          </p>

          <p className="mt-2 text-sm text-muted">
            {subscribers.length === 0
              ? "Your subscribers will appear here when someone subscribes to your channel."
              : "Try changing your search or status filter."}
          </p>

        </div>
      ) : (

        <>
          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-left">

              <thead className="border-b border-border bg-muted-bg">

                <tr>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Subscriber
                  </th>

                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Channel
                  </th>

                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Subscription
                  </th>

                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Renewal
                  </th>

                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Joined
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-border">

                {filteredSubscribers.map(
                  (subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="transition hover:bg-muted-bg/50"
                    >

                      {/* Subscriber */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted-bg">

                            {subscriber.avatarUrl ? (
                              <Image
                                src={
                                  subscriber.avatarUrl
                                }
                                alt={
                                  subscriber.subscriberName
                                }
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-medium text-white">
                                {getInitials(
                                  subscriber.subscriberName
                                )}
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-foreground">
                              {
                                subscriber.subscriberName
                              }
                            </p>

                            {subscriber.username && (
                              <p className="truncate text-xs text-muted">
                                @
                                {
                                  subscriber.username
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* Channel */}

                      <td className="px-5 py-4">

                        {subscriber.channelSlug ? (
                          <Link
                            href={`/channels/${subscriber.channelSlug}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {
                              subscriber.channelName
                            }
                          </Link>
                        ) : (
                          <span className="text-sm text-foreground">
                            {
                              subscriber.channelName
                            }
                          </span>
                        )}

                      </td>

                      {/* Subscription */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(
                            subscriber.price,
                            subscriber.currency
                          )}
                        </p>

                        <p className="text-xs text-muted">
                          per month
                        </p>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <StatusBadge
                          status={
                            subscriber.status
                          }
                          cancelAtPeriodEnd={
                            subscriber.cancelAtPeriodEnd
                          }
                        />

                      </td>

                      {/* Renewal */}

                      <td className="px-5 py-4">

                        <p className="text-sm text-foreground">
                          {formatDate(
                            subscriber.currentPeriodEnd
                          )}
                        </p>

                        {subscriber.cancelAtPeriodEnd && (
                          <p className="mt-0.5 text-xs text-muted">
                            Ends after period
                          </p>
                        )}

                      </td>

                      {/* Joined */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-secondary">
                          {formatDate(
                            subscriber.startedAt
                          )}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              MOBILE
          ================================================== */}

          <div className="divide-y divide-border md:hidden">

            {filteredSubscribers.map(
              (subscriber) => (
                <div
                  key={subscriber.id}
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted-bg">

                        {subscriber.avatarUrl ? (
                          <Image
                            src={
                              subscriber.avatarUrl
                            }
                            alt={
                              subscriber.subscriberName
                            }
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-medium text-white">
                            {getInitials(
                              subscriber.subscriberName
                            )}
                          </div>
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-foreground">
                          {
                            subscriber.subscriberName
                          }
                        </p>

                        {subscriber.username && (
                          <p className="truncate text-xs text-muted">
                            @
                            {
                              subscriber.username
                            }
                          </p>
                        )}

                      </div>

                    </div>

                    <StatusBadge
                      status={
                        subscriber.status
                      }
                      cancelAtPeriodEnd={
                        subscriber.cancelAtPeriodEnd
                      }
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                    <div>
                      <p className="text-xs text-muted">
                        Channel
                      </p>

                      <p className="mt-1 font-medium text-foreground">
                        {
                          subscriber.channelName
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">
                        Subscription
                      </p>

                      <p className="mt-1 font-medium text-foreground">
                        {formatCurrency(
                          subscriber.price,
                          subscriber.currency
                        )}
                        <span className="text-xs font-normal text-muted">
                          {" "}
                          / month
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">
                        Renewal
                      </p>

                      <p className="mt-1 text-foreground">
                        {formatDate(
                          subscriber.currentPeriodEnd
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">
                        Joined
                      </p>

                      <p className="mt-1 text-foreground">
                        {formatDate(
                          subscriber.startedAt
                        )}
                      </p>
                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        </>

      )}

    </div>
  );
}

/* ==================================================
   STATUS BADGE
================================================== */

function StatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: string;
  cancelAtPeriodEnd: boolean;
}) {
  if (
    status === "active" &&
    cancelAtPeriodEnd
  ) {
    return (
      <span className="inline-flex rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">
        Cancelling
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="inline-flex rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">
        Active
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="inline-flex rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-muted">
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-muted">
      Expired
    </span>
  );
}