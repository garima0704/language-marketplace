import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import SubscriptionDetails from "@/components/admin/subscriptions/SubscriptionDetails";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SubscriptionDetailsPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: subscription,
    error,
  } = await supabase
    .from("subscriptions")
    .select(`
      id,
      buyer_id,
      channel_id,
      subscription_price,
      currency,
      status,
      started_at,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      cancelled_at,
      payment_provider,
      next_billing_at,
      created_at,

      buyer:profiles!subscriptions_buyer_fkey (
        id,
        username,
        display_name
      ),

      channel:channels!subscriptions_channel_fkey (
        id,
        channel_name,
        slug
      )
    `)
    .eq("id", id)
    .single();

  if (error || !subscription) {
    console.error(
      "SUBSCRIPTION DETAILS FETCH ERROR:",
      error
    );

    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>

          <div className="mt-6 rounded-xl border border-border bg-background p-8">
            <h1 className="text-xl font-semibold text-foreground">
              Subscription not found
            </h1>

            <p className="mt-2 text-sm text-muted">
              The subscription you are looking for does not
              exist or could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const buyer = Array.isArray(subscription.buyer)
    ? subscription.buyer[0] ?? null
    : subscription.buyer ?? null;

  const channel = Array.isArray(subscription.channel)
    ? subscription.channel[0] ?? null
    : subscription.channel ?? null;

  const normalizedSubscription = {
    ...subscription,
    buyer,
    channel,
  };

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>
        </div>

        <SubscriptionDetails
          subscription={normalizedSubscription}
        />
      </div>
    </main>
  );
}