import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
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

function formatDate(dateString: string | null) {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatProvider(provider: string) {
  switch (provider) {
    case "stripe":
      return "Stripe";

    case "paypal":
      return "PayPal";

    case "bank":
      return "Bank Transfer";

    default:
      return provider;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending";

    case "processing":
      return "Processing";

    case "completed":
      return "Completed";

    case "failed":
      return "Failed";

    default:
      return status;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return CheckCircle2;

    case "failed":
      return XCircle;

    case "processing":
      return Clock3;

    case "pending":
    default:
      return Clock3;
  }
}

export default async function SellerPayoutsPage() {
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
  // Payouts
  // --------------------------------------------------

  const { data: payouts, error: payoutsError } =
    await supabase
      .from("payouts")
      .select(`
        id,
        user_id,
        payout_account_id,
        amount,
        currency,
        provider,
        provider_payout_id,
        status,
        processed_at,
        created_at,
        notes,

        creator_payout_accounts (
          id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (payoutsError) {
    console.error(
      "Seller payouts error:",
      payoutsError
    );
  }

  const payoutList = payouts ?? [];

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const completedPayouts =
    payoutList.filter(
      (payout) => payout.status === "completed"
    );

  const pendingPayouts =
    payoutList.filter(
      (payout) =>
        payout.status === "pending" ||
        payout.status === "processing"
    );

  const failedPayouts =
    payoutList.filter(
      (payout) => payout.status === "failed"
    );

  const totalPaidOut =
    completedPayouts.reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    );

  const totalPending =
    pendingPayouts.reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    );

  const totalFailed =
    failedPayouts.reduce(
      (total, payout) =>
        total + Number(payout.amount || 0),
      0
    );

  const currency =
    payoutList[0]?.currency || "USD";

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
          Payouts
        </h1>

        <p className="mt-2 text-sm text-muted">
          Track payouts sent to your payout account.
        </p>
      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Paid Out */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Total Paid Out
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Banknote className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalPaidOut,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Completed payouts
          </p>
        </div>

        {/* Pending */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Pending
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Clock3 className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalPending,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Pending or processing
          </p>
        </div>

        {/* Failed */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Failed
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <XCircle className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalFailed,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            Failed payouts
          </p>
        </div>

        {/* Payout Count */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Payouts
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <CreditCard className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {payoutList.length.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted">
            Total payout records
          </p>
        </div>

      </div>

      {/* ==================================================
          PAYOUT HISTORY
      ================================================== */}

      <section className="mt-10">

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Payout History
          </h2>

          <p className="mt-1 text-sm text-muted">
            All payouts associated with your account.
          </p>
        </div>

        {payoutList.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
              <Banknote className="h-5 w-5 text-muted" />
            </div>

            <p className="mt-4 font-medium text-foreground">
              No payouts yet
            </p>

            <p className="mt-2 text-sm text-muted">
              Your payouts will appear here once
              earnings are sent to your payout account.
            </p>

          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-sm">

                <thead className="border-b border-border bg-muted-bg">

                  <tr>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Payout
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Provider
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      Payout ID
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

                  {payoutList.map((payout) => {

                    const StatusIcon =
                      getStatusIcon(
                        payout.status
                      );

                    return (
                      <tr
                        key={payout.id}
                        className="bg-background"
                      >

                        {/* Payout */}

                        <td className="px-5 py-4">

                          <div>
                            <p className="font-medium text-foreground">
                              Payout
                            </p>

                            <p className="mt-0.5 text-xs text-muted">
                              {payout.id.slice(0, 8)}
                            </p>
                          </div>

                        </td>

                        {/* Amount */}

                        <td className="px-5 py-4 font-medium text-foreground">
                          {formatCurrency(
                            Number(
                              payout.amount
                            ),
                            payout.currency
                          )}
                        </td>

                        {/* Provider */}

                        <td className="px-5 py-4 text-muted">
                          {formatProvider(
                            payout.provider
                          )}
                        </td>

                        {/* Provider Payout ID */}

                        <td className="px-5 py-4">

                          {payout.provider_payout_id ? (
                            <span className="font-mono text-xs text-muted">
                              {
                                payout.provider_payout_id
                              }
                            </span>
                          ) : (
                            <span className="text-muted">
                              —
                            </span>
                          )}

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-foreground">

                            <StatusIcon className="h-3.5 w-3.5" />

                            {getStatusLabel(
                              payout.status
                            )}

                          </span>

                        </td>

                        {/* Date */}

                        <td className="whitespace-nowrap px-5 py-4 text-muted">

                          {formatDate(
                            payout.processed_at ||
                              payout.created_at
                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </section>

    </div>
  );
}