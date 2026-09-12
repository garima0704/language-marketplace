import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import PaymentDetails from "@/components/admin/payments/PaymentDetails";

interface PaymentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentDetailsPage({
  params,
}: PaymentDetailsPageProps) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: payment,
    error,
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

      buyer:profiles!payments_buyer_fkey (
        id,
        username,
        display_name
      ),

      channel:channels!payments_channel_fkey (
        id,
        channel_name,
        slug
      ),

      subscription:subscriptions!payments_subscription_fkey (
        id
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "PAYMENT DETAIL FETCH ERROR:",
      error
    );
  }

  if (!payment) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to payments
          </Link>

          <div className="mt-8 rounded-xl border border-border bg-background p-8">
            <h1 className="text-xl font-semibold text-foreground">
              Payment not found
            </h1>

            <p className="mt-2 text-sm text-muted">
              The payment you are looking for does not exist or
              could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const buyer = Array.isArray(payment.buyer)
    ? payment.buyer[0] ?? null
    : payment.buyer ?? null;

  const channel = Array.isArray(payment.channel)
    ? payment.channel[0] ?? null
    : payment.channel ?? null;

  const subscription = Array.isArray(payment.subscription)
    ? payment.subscription[0] ?? null
    : payment.subscription ?? null;

  const normalizedPayment = {
    ...payment,
    buyer,
    channel,
    subscription,
  };

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to payments
        </Link>

        <div className="mt-6">
          <PaymentDetails payment={normalizedPayment} />
        </div>
      </div>
    </main>
  );
}