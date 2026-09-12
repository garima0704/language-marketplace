import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import EarningsDetails from "@/components/admin/earnings/EarningsDetails";

interface EarningsDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EarningsDetailsPage({
  params,
}: EarningsDetailsPageProps) {
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
      ),

      subscription:subscriptions!payments_subscription_fkey (
        id
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "EARNINGS DETAIL FETCH ERROR:",
      error
    );
  }

  if (!payment) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/admin/earnings"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to earnings
          </Link>

          <div className="mt-8 rounded-xl border border-border bg-background p-8">
            <h1 className="text-xl font-semibold text-foreground">
              Earnings record not found
            </h1>

            <p className="mt-2 text-sm text-muted">
              The earnings record you are looking for
              does not exist or could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const channel = Array.isArray(payment.channel)
    ? payment.channel[0] ?? null
    : payment.channel ?? null;

  const creator = channel
    ? Array.isArray(channel.creator)
      ? channel.creator[0] ?? null
      : channel.creator ?? null
    : null;

  const subscription = Array.isArray(
    payment.subscription
  )
    ? payment.subscription[0] ?? null
    : payment.subscription ?? null;

  const normalizedPayment = {
    ...payment,
    channel: channel
      ? {
          ...channel,
          creator,
        }
      : null,
    subscription,
  };

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/admin/earnings"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to earnings
        </Link>

        <div className="mt-6">
          <EarningsDetails
            payment={normalizedPayment}
          />
        </div>
      </div>
    </main>
  );
}