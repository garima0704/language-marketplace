import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

function formatCurrency(
  amount: number,
  currency = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(
  dateString: string | null,
  locale = "en"
) {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatProvider(
  provider: string,
  translations: Record<string, string>
) {
  switch (provider) {
    case "stripe":
      return "Stripe";

    case "paypal":
      return "PayPal";

    case "bank":
      return translations["seller.bank_transfer"];

    default:
      return provider;
  }
}

function getStatusLabel(
  status: string,
  translations: Record<string, string>
) {
  switch (status) {
    case "pending":
      return translations["seller.pending"];

    case "processing":
      return translations["seller.processing"];

    case "completed":
      return translations["seller.completed"];

    case "failed":
      return translations["seller.failed"];

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
  // Locale
  // --------------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value || "en";

  // --------------------------------------------------
  // Translations
  // --------------------------------------------------

  const translations = await getTranslations(
    [
      "seller.back_to_earnings",
      "seller.payouts",
      "seller.track_payouts",
      "seller.total_paid_out",
      "seller.completed_payouts",
      "seller.pending",
      "seller.pending_or_processing",
      "seller.failed",
      "seller.failed_payouts",
      "seller.payout_count",
      "seller.total_payout_records",
      "seller.payout_history",
      "seller.all_payouts_associated",
      "seller.no_payouts",
      "seller.payouts_will_appear",
      "seller.payout",
      "seller.amount",
      "seller.provider",
      "seller.payout_id",
      "seller.status",
      "seller.date",
      "seller.bank_transfer",
      "seller.processing",
      "seller.completed",
    ],
    locale
  );

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
        {translations["seller.back_to_earnings"]}
      </Link>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {translations["seller.payouts"]}
        </h1>

        <p className="mt-2 text-sm text-muted">
          {translations["seller.track_payouts"]}
        </p>
      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Paid Out */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-muted">
              {translations["seller.total_paid_out"]}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Banknote className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(
              totalPaidOut,
              currency
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            {translations["seller.completed_payouts"]}
          </p>
        </div>

        {/* Pending */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-muted">
              {translations["seller.pending"]}
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
            {translations["seller.pending_or_processing"]}
          </p>
        </div>

        {/* Failed */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-muted">
              {translations["seller.failed"]}
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
            {translations["seller.failed_payouts"]}
          </p>
        </div>

        {/* Payout Count */}

        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-muted">
              {translations["seller.payout_count"]}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <CreditCard className="h-4 w-4 text-foreground" />
            </div>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            {payoutList.length.toLocaleString(locale)}
          </p>

          <p className="mt-1 text-xs text-muted">
            {translations["seller.total_payout_records"]}
          </p>
        </div>

      </div>

      {/* ==================================================
          PAYOUT HISTORY
      ================================================== */}

      <section className="mt-10">

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {translations["seller.payout_history"]}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {translations["seller.all_payouts_associated"]}
          </p>
        </div>

        {payoutList.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
              <Banknote className="h-5 w-5 text-muted" />
            </div>

            <p className="mt-4 font-medium text-foreground">
              {translations["seller.no_payouts"]}
            </p>

            <p className="mt-2 text-sm text-muted">
              {translations["seller.payouts_will_appear"]}
            </p>

          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-sm">

                <thead className="border-b border-border bg-muted-bg">

                  <tr>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.payout"]}
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.amount"]}
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.provider"]}
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.payout_id"]}
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.status"]}
                    </th>

                    <th className="px-5 py-3 text-left font-medium text-muted">
                      {translations["seller.date"]}
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
                              {translations["seller.payout"]}
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
                            payout.provider,
                            translations
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
                              payout.status,
                              translations
                            )}

                          </span>

                        </td>

                        {/* Date */}

                        <td className="whitespace-nowrap px-5 py-4 text-muted">

                          {formatDate(
                            payout.processed_at ||
                              payout.created_at,
                            locale
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