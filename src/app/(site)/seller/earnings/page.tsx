import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Wallet,
  Receipt,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

function formatCurrency(
  amount: number,
  currency = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default async function SellerEarningsPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Current seller
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // Seller channels
  // --------------------------------------------------

  const { data: channels } = await supabase
    .from("channels")
    .select("id, channel_name")
    .eq("user_id", user.id);

  const channelIds =
    channels?.map((channel) => channel.id) ?? [];

  // --------------------------------------------------
  // No channels yet
  // --------------------------------------------------

  if (channelIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Earnings
          </h1>

          <p className="mt-2 text-sm text-muted">
            Track your earnings and payouts.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">
          <p className="font-medium text-foreground">
            No earnings yet
          </p>

          <p className="mt-2 text-sm text-muted">
            Create a channel and start growing your
            subscriber base to earn money.
          </p>

          <Link
            href="/seller/channels"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Manage Channels
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Payments
  // --------------------------------------------------

  const { data: payments, error: paymentsError } =
    await supabase
      .from("payments")
      .select(`
        id,
        gross_amount,
        platform_fee,
        creator_amount,
        currency,
        payment_status,
        paid_at,
        channel_id,
        channels (
          id,
          channel_name
        )
      `)
      .in("channel_id", channelIds)
      .order("paid_at", {
        ascending: false,
      });

  if (paymentsError) {
    console.error(
      "Earnings payments error:",
      paymentsError
    );
  }

  const allPayments = payments ?? [];

  // --------------------------------------------------
  // Only successful payments count as earnings
  // --------------------------------------------------

  const paidPayments = allPayments.filter(
    (payment) =>
      payment.payment_status === "paid"
  );

  // --------------------------------------------------
  // Total earnings
  // --------------------------------------------------

  const totalEarnings = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.creator_amount || 0),
    0
  );

  // --------------------------------------------------
  // Current month earnings
  // --------------------------------------------------

  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const thisMonthPayments =
    paidPayments.filter((payment) => {
      const paidAt = new Date(payment.paid_at);

      return paidAt >= monthStart;
    });

  const thisMonthEarnings =
    thisMonthPayments.reduce(
      (total, payment) =>
        total + Number(payment.creator_amount || 0),
      0
    );

  // --------------------------------------------------
  // Payouts
  // --------------------------------------------------

  const { data: payouts, error: payoutsError } =
    await supabase
      .from("payouts")
      .select(`
        id,
        amount,
        currency,
        status,
        processed_at,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (payoutsError) {
    console.error(
      "Earnings payouts error:",
      payoutsError
    );
  }

  const allPayouts = payouts ?? [];

  // --------------------------------------------------
  // Completed payouts
  // --------------------------------------------------

  const completedPayouts =
    allPayouts.filter(
      (payout) =>
        payout.status === "completed"
    );

  const paidOut = completedPayouts.reduce(
    (total, payout) =>
      total + Number(payout.amount || 0),
    0
  );

  // --------------------------------------------------
  // Available balance
  //
  // Total creator earnings - completed payouts
  // --------------------------------------------------

  const availableBalance =
    Math.max(totalEarnings - paidOut, 0);

  // --------------------------------------------------
  // Recent earnings
  // --------------------------------------------------

  const recentPayments =
    paidPayments.slice(0, 5);

  // --------------------------------------------------
  // Currency
  // --------------------------------------------------

  const currency =
    paidPayments[0]?.currency ||
    allPayouts[0]?.currency ||
    "USD";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Earnings
        </h1>

        <p className="mt-2 text-sm text-muted">
          Track your revenue, earnings, and payouts.
        </p>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Earnings */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Total Earnings
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <DollarSign className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalEarnings,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Your earnings after platform fees
          </p>
        </div>

        {/* This Month */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              This Month
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <ArrowUpRight className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              thisMonthEarnings,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Earnings since the beginning of the month
          </p>
        </div>

        {/* Available Balance */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Available Balance
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Wallet className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              availableBalance,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Earnings not yet paid out
          </p>
        </div>

        {/* Paid Out */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Paid Out
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <CreditCard className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              paidOut,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Total completed payouts
          </p>
        </div>

      </div>

      {/* ==================================================
          QUICK LINKS
      ================================================== */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">

        <Link
            href="/seller/earnings/transactions"
          className="group rounded-xl border border-border bg-background p-5 transition hover:bg-muted-bg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-muted">
                View all payments and earnings.
              </p>
            </div>

            <Receipt className="h-5 w-5 text-muted transition group-hover:text-foreground" />
          </div>
        </Link>

        <Link
          href="/seller/earnings/payouts"
          className="group rounded-xl border border-border bg-background p-5 transition hover:bg-muted-bg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">
                Payouts
              </h2>

              <p className="mt-1 text-sm text-muted">
                View your payout history.
              </p>
            </div>

            <Wallet className="h-5 w-5 text-muted transition group-hover:text-foreground" />
          </div>
        </Link>

      </div>

      {/* ==================================================
          RECENT EARNINGS
      ================================================== */}

      <section className="mt-10">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Recent Earnings
            </h2>

            <p className="mt-1 text-sm text-muted">
              Your latest successful payments.
            </p>
          </div>

          <Link
            href="/seller/earnings/transactions"
            className="text-sm font-medium text-foreground hover:underline"
          >
            View All
          </Link>

        </div>

        {recentPayments.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">
            <p className="font-medium text-foreground">
              No earnings yet
            </p>

            <p className="mt-2 text-sm text-muted">
              Your earnings will appear here when
              subscribers make payments.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="border-b border-border bg-muted-bg">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Channel
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Gross
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Platform Fee
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      You Earned
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">

                  {recentPayments.map(
                    (payment) => {

                      const channel =
                        Array.isArray(
                          payment.channels
                        )
                          ? payment.channels[0]
                          : payment.channels;

                      return (
                        <tr
                          key={payment.id}
                          className="bg-background"
                        >

                          <td className="px-5 py-4 font-medium text-foreground">
                            {channel?.channel_name ||
                              "Channel"}
                          </td>

                          <td className="px-5 py-4 text-muted">
                            {formatCurrency(
                              Number(
                                payment.gross_amount
                              ),
                              payment.currency
                            )}
                          </td>

                          <td className="px-5 py-4 text-muted">
                            {formatCurrency(
                              Number(
                                payment.platform_fee
                              ),
                              payment.currency
                            )}
                          </td>

                          <td className="px-5 py-4 font-medium text-foreground">
                            {formatCurrency(
                              Number(
                                payment.creator_amount
                              ),
                              payment.currency
                            )}
                          </td>

                          <td className="px-5 py-4 text-muted">
                            {formatDate(
                              payment.paid_at
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </section>

    </div>
  );
}