import { createClient } from "@/lib/supabase/server";

import {
  Users,
  UserCheck,
  Tv,
  Video,
  CreditCard,
  DollarSign,
  Wallet,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";
import {
  formatTimeAgo,
  formatPrice,
} from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // Dashboard statistics
  // ---------------------------------------------------------

  const [
    usersResult,
    sellersResult,
    channelsResult,
    videosResult,
    subscriptionsResult,
    paymentsResult,
    payoutsResult,
    pendingPayoutsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_creator", true),

    supabase
      .from("channels")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("videos")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("payments")
      .select("gross_amount, creator_amount"),

    supabase
      .from("payouts")
      .select("amount")
      .eq("status", "completed"),

    supabase
      .from("payouts")
      .select("amount", { count: "exact" })
      .eq("status", "pending"),
  ]);

  // ---------------------------------------------------------
  // Financial totals
  // ---------------------------------------------------------

  const totalRevenue =
    paymentsResult.data?.reduce(
      (total, payment) =>
        total + Number(payment.gross_amount || 0),
      0
    ) ?? 0;

  const creatorEarnings =
    paymentsResult.data?.reduce(
      (total, payment) =>
        total + Number(payment.creator_amount || 0),
      0
    ) ?? 0;

  const completedPayouts =
    payoutsResult.data?.reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    ) ?? 0;

  const pendingPayouts =
    pendingPayoutsResult.data?.reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    ) ?? 0;

  // ---------------------------------------------------------
  // Stats cards
  // ---------------------------------------------------------

  const stats = [
    {
      title: "Total Users",
      value: usersResult.count ?? 0,
      icon: Users,
    },
    {
      title: "Sellers",
      value: sellersResult.count ?? 0,
      icon: UserCheck,
    },
    {
      title: "Channels",
      value: channelsResult.count ?? 0,
      icon: Tv,
    },
    {
      title: "Videos",
      value: videosResult.count ?? 0,
      icon: Video,
    },
    {
      title: "Active Subscriptions",
      value: subscriptionsResult.count ?? 0,
      icon: CreditCard,
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue, "USD") ?? "$0.00",
      icon: DollarSign,
    },
    {
      title: "Creator Earnings",
      value: formatPrice(creatorEarnings, "USD") ?? "$0.00",
      icon: Wallet,
    },
    {
      title: "Pending Payouts",
      value: formatPrice(pendingPayouts, "USD") ?? "$0.00",
      icon: Clock,
    },
  ];

  // ---------------------------------------------------------
  // Recent activity
  // ---------------------------------------------------------

  const [
    recentUsersResult,
    recentChannelsResult,
    recentVideosResult,
    recentSubscriptionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("channels")
      .select("id, channel_name, created_at")
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("videos")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("subscriptions")
      .select("id, created_at, status")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const recentActivity = [
    ...(recentUsersResult.data ?? []).map((user) => ({
      type: "User",
      title: user.display_name || user.username || "New user",
      date: user.created_at,
    })),

    ...(recentChannelsResult.data ?? []).map((channel) => ({
      type: "Channel",
      title: channel.channel_name,
      date: channel.created_at,
    })),

    ...(recentVideosResult.data ?? []).map((video) => ({
      type: "Video",
      title: video.title,
      date: video.created_at,
    })),

    ...(recentSubscriptionsResult.data ?? []).map((subscription) => ({
      type: "Subscription",
      title: "New subscription",
      date: subscription.created_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 8);

  // ---------------------------------------------------------
  // Recent payments
  // ---------------------------------------------------------

  const { data: recentPayments } = await supabase
    .from("payments")
    .select(
      `
        id,
        gross_amount,
        currency,
        payment_status,
        paid_at,
        created_at,
        buyer_id,
        channel_id
      `
    )
    .order("created_at", { ascending: false })
    .limit(6);

  // ---------------------------------------------------------
  // Pending actions
  // ---------------------------------------------------------

  const pendingPayoutCount = pendingPayoutsResult.count ?? 0;

  return (
    <main className="min-h-screen bg-light-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-secondary">
            Overview of your NiceConvo marketplace.
          </p>
        </div>

        {/* -------------------------------------------------
            Stats
        ------------------------------------------------- */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* -------------------------------------------------
            Activity + Attention
        ------------------------------------------------- */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Latest activity across NiceConvo.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={`${activity.type}-${index}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {activity.type}
                      </p>
                    </div>

                    <p className="ml-4 shrink-0 text-xs text-muted">
                      {formatTimeAgo(activity.date)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-muted">
                  No recent activity.
                </p>
              )}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="rounded-xl border border-border bg-background p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Needs Attention
              </h2>

              <p className="mt-1 text-sm text-muted">
                Items that may require admin action.
              </p>
            </div>

            <div className="mt-5 space-y-3">

              {/* Pending payouts */}
              <Link
                href="/admin/payouts/pending"
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted-bg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
                    <Wallet className="h-5 w-5 text-secondary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pending payouts
                    </p>

                    <p className="text-xs text-muted">
                      Payouts waiting to be processed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {pendingPayoutCount}
                  </span>

                  <ArrowRight className="h-4 w-4 text-muted" />
                </div>
              </Link>

              {/* Reports */}
              <Link
                href="/admin/reports"
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted-bg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
                    <AlertCircle className="h-5 w-5 text-secondary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Content reports
                    </p>

                    <p className="text-xs text-muted">
                      Review reported content and users
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>

              {/* Failed payments */}
              <Link
                href="/admin/payments"
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted-bg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
                    <CreditCard className="h-5 w-5 text-secondary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Payment monitoring
                    </p>

                    <p className="text-xs text-muted">
                      Review recent payment activity
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            Recent Payments
        ------------------------------------------------- */}

        <div className="mt-6 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Recent Payments
              </h2>

              <p className="mt-1 text-sm text-muted">
                Latest marketplace transactions.
              </p>
            </div>

            <Link
              href="/admin/payments"
              className="text-sm font-medium text-secondary hover:text-foreground"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 font-medium text-secondary">
                    Payment
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Amount
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Status
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentPayments && recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4 text-foreground">
                        Payment #{payment.id.slice(0, 8)}
                      </td>

                      <td className="px-6 py-4 font-medium text-foreground">
                        {payment.currency || "USD"}{" "}
                        {Number(payment.gross_amount || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-muted-bg px-2 py-1 text-xs font-medium text-secondary">
                          {payment.payment_status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-muted">
                        {formatTimeAgo(
                          payment.paid_at ||
                          payment.created_at
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-muted"
                    >
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* -------------------------------------------------
            Financial Summary
        ------------------------------------------------- */}

        <div className="mt-6 rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Financial Summary
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinancialItem
            label="Total Revenue"
            value={formatPrice(totalRevenue, "USD") ?? "$0.00"}
          />

          <FinancialItem
            label="Creator Earnings"
            value={formatPrice(creatorEarnings, "USD") ?? "$0.00"}
          />

          <FinancialItem
            label="Completed Payouts"
            value={formatPrice(completedPayouts, "USD") ?? "$0.00"}
          />

          <FinancialItem
            label="Pending Payouts"
            value={formatPrice(pendingPayouts, "USD") ?? "$0.00"}
          />
        </div>
      </div>
    </div>
    </main>
  );
}

// ---------------------------------------------------------
// Components
// ---------------------------------------------------------

function FinancialItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-light-bg p-4">
      <p className="text-sm text-secondary">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
