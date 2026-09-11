import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import PaymentsHeader from "@/components/admin/payments/PaymentsHeader";
import PaymentList from "@/components/admin/payments/PaymentList";

export default async function PaymentsPage() {
  await requireAdmin();

  const supabase = await createClient();

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
      payment_status,
      paid_at,
      created_at,
      invoice_number,

      buyer:profiles!payments_buyer_fkey (
        id,
        username,
        display_name
      ),

      channel:channels!payments_channel_fkey (
        id,
        channel_name,
        slug
      )
    `)
    .order("paid_at", { ascending: false });

  if (paymentsError) {
    console.error(
      "PAYMENTS FETCH ERROR:",
      paymentsError
    );
  }

  const normalizedPayments = (payments ?? []).map(
    (payment) => {
      const buyer = Array.isArray(payment.buyer)
        ? payment.buyer[0] ?? null
        : payment.buyer ?? null;

      const channel = Array.isArray(payment.channel)
        ? payment.channel[0] ?? null
        : payment.channel ?? null;

      return {
        ...payment,
        buyer,
        channel,
      };
    }
  );

  return (
    <main className="min-h-screen bg-light-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PaymentsHeader
          payments={normalizedPayments}
        />

        <PaymentList
          payments={normalizedPayments}
        />
      </div>
    </main>
  );
}