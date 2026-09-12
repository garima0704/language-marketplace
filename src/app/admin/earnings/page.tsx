import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import EarningsHeader from "@/components/admin/earnings/EarningsHeader";
import EarningsList from "@/components/admin/earnings/EarningsList";

export default async function EarningsPage() {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // Fetch payments
  // --------------------------------------------------

  const {
    data: payments,
    error: paymentsError,
  } = await supabase
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

      channel:channels!payments_channel_fkey (
        id,
        channel_name,
        slug,
        user_id,

        creator:profiles!channels_user_id_fkey (
          id,
          username,
          display_name
        )
      )
    `)
    .order("paid_at", { ascending: false });

  if (paymentsError) {
    console.error(
      "PAYMENTS FETCH ERROR:",
      paymentsError
    );
  }

  // --------------------------------------------------
  // Normalize nested Supabase relations
  // --------------------------------------------------

  const normalizedPayments = (payments ?? []).map(
    (payment) => {
      const channel = Array.isArray(payment.channel)
        ? payment.channel[0] ?? null
        : payment.channel ?? null;

      const creator = channel
        ? Array.isArray(channel.creator)
          ? channel.creator[0] ?? null
          : channel.creator ?? null
        : null;

      return {
        ...payment,
        channel: channel
          ? {
              ...channel,
              creator,
            }
          : null,
      };
    }
  );

  // --------------------------------------------------
  // Fetch completed payouts
  // --------------------------------------------------

  const {
    data: payouts,
    error: payoutsError,
  } = await supabase
    .from("payouts")
    .select(`
      id,
      amount,
      currency,
      status,
      processed_at,
      created_at
    `)
    .eq("status", "completed");

  if (payoutsError) {
    console.error(
      "PAYOUTS FETCH ERROR:",
      payoutsError
    );
  }

  // --------------------------------------------------
  // Calculate total paid out
  // --------------------------------------------------

  const totalPaidOut = (payouts ?? []).reduce(
    (total, payout) =>
      total + Number(payout.amount),
    0
  );

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <EarningsHeader
          payments={normalizedPayments}
          totalPaidOut={totalPaidOut}
        />

        <div className="mt-6">
          <EarningsList
            payments={normalizedPayments}
          />
        </div>
      </div>
    </main>
  );
}