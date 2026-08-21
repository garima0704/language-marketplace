import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import ChannelCard from "@/components/channels/ChannelCard";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // GET ACTIVE SUBSCRIPTIONS
  // =========================================================

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      status,
      current_period_end,
      subscription_price,
      channel_id
    `)
    .eq("buyer_id", user.id)
    .eq("status", "active");

  if (error) {
    console.error(error);

    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground">
          My Subscriptions
        </h1>

        <p className="mt-4 text-muted">
          Failed to load subscriptions.
        </p>
      </div>
    );
  }

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground">
          My Subscriptions
        </h1>

        <p className="mt-2 text-muted">
          Continue learning from the channels you've subscribed to.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-background px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted-bg text-4xl">
            📺
          </div>

          <h2 className="text-2xl font-semibold text-foreground">
            No subscriptions yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-muted">
            Subscribe to your favorite language channels and
            continue learning anytime.
          </p>

          <Link href="/sellers">
            <Button className="mt-8 rounded-lg">
              Browse Sellers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // GET CHANNEL DETAILS
  // =========================================================

  const channelIds = subscriptions.map(
    (subscription) => subscription.channel_id
  );

  const { data: channels } = await supabase
    .from("channels")
    .select(`
      id,
      channel_name,
      slug,
      description,
      logo_url,
      banner_url,
      profiles!channels_user_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `)
    .in("id", channelIds);

  const channelMap = new Map(
    (channels ?? []).map((channel) => [
      channel.id,
      channel,
    ])
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="px-8 py-8">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          My Subscriptions
        </h1>

        <p className="mt-2 text-muted">
          Continue learning from the channels you've subscribed to.
        </p>
      </div>

      {/* =====================================================
          SUBSCRIPTION GRID
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {subscriptions.map((subscription) => {
          const channel = channelMap.get(
            subscription.channel_id
          );

          if (!channel) return null;

          const seller = Array.isArray(channel.profiles)
            ? channel.profiles[0]
            : channel.profiles;

          return (
            <ChannelCard
              key={subscription.id}
              channel={{
                id: channel.id,
                channel_name: channel.channel_name,
                slug: channel.slug,
                description: channel.description,
                logo_url: channel.logo_url,
                banner_url: channel.banner_url,
              }}
              seller={seller}
              variant="subscription"
              subscription={{
                id: subscription.id,
                current_period_end:
                  subscription.current_period_end,
              }}
            />
          );
        })}

      </div>
    </div>
  );
}