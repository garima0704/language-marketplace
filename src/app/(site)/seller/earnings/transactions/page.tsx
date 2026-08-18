import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Percent,
  ReceiptText,
  RefreshCcw,
  WalletCards,
  XCircle,
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

function getStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Paid";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    default:
      return status;
  }
}

export default async function SellerTransactionsPage() {
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

  const { data: channels, error: channelsError } =
    await supabase
      .from("channels")
      .select("id, channel_name")
      .eq("user_id", user.id);

  if (channelsError) {
    console.error(
      "Seller channels error:",
      channelsError
    );
  }

  const channelIds =
    channels?.map((channel) => channel.id) ?? [];

  // --------------------------------------------------
  // No channels
  // --------------------------------------------------

  if (channelIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Link
          href="/seller/earnings"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-muted">
            View payments received from your subscribers.
          </p>
        </div>

        <div className="rounded-xl border border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">
            No transactions yet
          </p>

          <p className="mt-2 text-sm text-muted">
            Create a channel and start accepting
            subscriptions to see transactions here.
          </p>
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
        subscription_id,
        buyer_id,
        channel_id,
        gross_amount,
        platform_fee,
        creator_amount,
        currency,
        payment_provider,
        provider_payment_id,
        payment_status,
        paid_at,
        created_at,
        invoice_number,

        channels (
          id,
          channel_name
        ),

        profiles!payments_buyer_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .in("channel_id", channelIds)
      .order("paid_at", {
        ascending: false,
      });

  if (paymentsError) {
    console.error(
      "Transactions lookup error:",
      paymentsError
    );
  }

  const transactionList = payments ?? [];

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const totalTransactions =
    transactionList.length;

  const paidTransactions =
    transactionList.filter(
      (payment) =>
        payment.payment_status === "paid"
    );

  const totalGross = paidTransactions.reduce(
    (total, payment) =>
      total + Number(payment.gross_amount || 0),
    0
  );

  const totalFees = paidTransactions.reduce(
    (total, payment) =>
      total + Number(payment.platform_fee || 0),
    0
  );

  const totalEarned = paidTransactions.reduce(
    (total, payment) =>
      total + Number(payment.creator_amount || 0),
    0
  );

  const currency =
    transactionList[0]?.currency || "USD";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        href="/seller/earnings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Earnings
      </Link>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>

        <p className="mt-2 text-sm text-muted">
          View payments received from your subscribers.
        </p>
      </div>

      {/* ==================================================
           SUMMARY
          ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Transactions */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Transactions
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <ReceiptText className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {totalTransactions.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted">
            Total payment records
          </p>
        </div>


        {/* Gross Revenue */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Gross Revenue
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Banknote className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(totalGross, currency)}
          </p>

          <p className="mt-1 text-xs text-muted">
            Before platform fees
          </p>
        </div>


        {/* Platform Fees */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Platform Fees
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Percent className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(totalFees, currency)}
          </p>

          <p className="mt-1 text-xs text-muted">
            Fees deducted from revenue
          </p>
        </div>


        {/* Your Earnings */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Your Earnings
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <WalletCards className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(totalEarned, currency)}
          </p>

          <p className="mt-1 text-xs text-muted">
            After platform fees
          </p>
        </div>

      </div>

      {/* ==================================================
          TRANSACTIONS
      ================================================== */}

      <section className="mt-10">

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-muted">
            All payments associated with your channels.
          </p>
        </div>

        {transactionList.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">
            <p className="font-medium text-foreground">
              No transactions yet
            </p>

            <p className="mt-2 text-sm text-muted">
              Payments will appear here when subscribers
              make purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-sm">

                <thead className="border-b border-border bg-muted-bg">

                  <tr>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Subscriber
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Channel
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Gross
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Fee
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      You Earned
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Provider
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-border">

                  {transactionList.map(
                    (payment) => {

                      const channel =
                        Array.isArray(
                          payment.channels
                        )
                          ? payment.channels[0]
                          : payment.channels;

                      const buyer =
                        Array.isArray(
                          payment.profiles
                        )
                          ? payment.profiles[0]
                          : payment.profiles;

                      return (
                        <tr
                          key={payment.id}
                          className="bg-background"
                        >

                          {/* Subscriber */}

                          <td className="px-5 py-4">

                            <div>
                              <p className="font-medium text-foreground">
                                {buyer?.display_name ||
                                  buyer?.username ||
                                  "Subscriber"}
                              </p>

                              {buyer?.username && (
                                <p className="mt-0.5 text-xs text-muted">
                                  @{buyer.username}
                                </p>
                              )}
                            </div>

                          </td>

                          {/* Channel */}

                          <td className="px-5 py-4 text-foreground">
                            {channel?.channel_name ||
                              "Channel"}
                          </td>

                          {/* Gross */}

                          <td className="px-5 py-4 text-muted">
                            {formatCurrency(
                              Number(
                                payment.gross_amount
                              ),
                              payment.currency
                            )}
                          </td>

                          {/* Fee */}

                          <td className="px-5 py-4 text-muted">
                            {formatCurrency(
                              Number(
                                payment.platform_fee
                              ),
                              payment.currency
                            )}
                          </td>

                          {/* Creator */}

                          <td className="px-5 py-4 font-medium text-foreground">
                            {formatCurrency(
                              Number(
                                payment.creator_amount
                              ),
                              payment.currency
                            )}
                          </td>

                          {/* Provider */}

                          <td className="px-5 py-4">
                            <span className="capitalize text-muted">
                              {payment.payment_provider}
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">

                            {payment.payment_status ===
                            "paid" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {getStatusLabel(
                                  payment.payment_status
                                )}
                              </span>
                            ) : payment.payment_status ===
                              "refunded" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">
                                <RefreshCcw className="h-3.5 w-3.5" />
                                {getStatusLabel(
                                  payment.payment_status
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">
                                <XCircle className="h-3.5 w-3.5" />
                                {getStatusLabel(
                                  payment.payment_status
                                )}
                              </span>
                            )}

                          </td>

                          {/* Date */}

                          <td className="whitespace-nowrap px-5 py-4 text-muted">
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