import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import SubscriptionsHeader from "@/components/admin/subscriptions/SubscriptionsHeader";
import SubscriptionList from "@/components/admin/subscriptions/SubscriptionList";

export default async function SubscriptionsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data: subscriptions,
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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "SUBSCRIPTIONS FETCH ERROR:",
      error
    );
  }

  const normalizedSubscriptions = (
    subscriptions ?? []
  ).map((subscription) => {
    const buyer = Array.isArray(
      subscription.buyer
    )
      ? subscription.buyer[0] ?? null
      : subscription.buyer ?? null;

    const channel = Array.isArray(
      subscription.channel
    )
      ? subscription.channel[0] ?? null
      : subscription.channel ?? null;

    return {
      ...subscription,
      buyer,
      channel,
    };
  });

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <SubscriptionsHeader
          subscriptions={normalizedSubscriptions}
        />

        <div className="mt-6">
          <SubscriptionList
            subscriptions={normalizedSubscriptions}
          />
        </div>
      </div>
    </main>
  );
}