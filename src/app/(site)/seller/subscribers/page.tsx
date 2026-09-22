import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  Users,
  UserCheck,
  DollarSign,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";
import SubscribersTable from "@/components/seller/SubscribersTable";

export default async function SubscribersPage() {
  const supabase = await createClient();

  const cookieStore = await cookies();

  const locale =
  cookieStore.get("niceconvo_locale")?.value || "en";

  // --------------------------------------------------
  // Translations
  // --------------------------------------------------

  const translations = await getTranslations(
  [
    "seller.subscribers",
    "seller.subscribers_description",
    "seller.no_channels",
    "seller.create_channel_subscribers",

    "seller.subscriber",
    "seller.channel",

    "seller.total_subscribers",
    "seller.total_subscribers_description",
    "seller.active_subscribers",
    "seller.active_subscribers_description",
    "seller.monthly_subscription_value",
    "seller.monthly_subscription_value_description",
    "seller.your_subscribers",
    "seller.your_subscribers_description",

    // Subscribers table
    "seller.search_subscribers",
    "seller.all",
    "seller.active",
    "seller.cancelled",
    "seller.expired",
    "seller.no_subscribers",
    "seller.no_subscribers_found",
    "seller.no_subscribers_description",
    "seller.try_change_search_filter",
    "seller.subscription",
    "seller.status",
    "seller.renewal",
    "seller.joined",
    "seller.per_month",
    "seller.ends_after_period",
    "seller.cancelling",
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
    redirect("/login");
  }

  // --------------------------------------------------
  // Seller profile
  // --------------------------------------------------

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, is_creator")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Profile lookup error:",
      profileError
    );
  }

  if (!profile?.is_creator) {
    redirect("/");
  }

  // --------------------------------------------------
  // Seller channels
  // --------------------------------------------------

  const { data: channels, error: channelsError } =
    await supabase
      .from("channels")
      .select(`
        id,
        channel_name,
        slug
      `)
      .eq("user_id", user.id);

  if (channelsError) {
    console.error(
      "Channels lookup error:",
      channelsError
    );
  }

  const sellerChannels = channels ?? [];

  const channelIds = sellerChannels.map(
    (channel) => channel.id
  );

  // --------------------------------------------------
  // No channels
  // --------------------------------------------------

  if (channelIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1>
            {translations["seller.subscribers"] ?? "Subscribers"}
          </h1>

          <p>
            {translations["seller.subscribers_description"] ??
              "Manage the people subscribed to your channels."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background px-6 py-12 text-center">
          <p className="font-medium text-foreground">
            {translations["seller.no_channels"] ?? "No channels yet"}
          </p>

          <p className="mt-2 text-sm text-muted">
            {translations["seller.create_channel_subscribers"] ??
              "Create a channel to start getting subscribers."}
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Subscriptions
  // --------------------------------------------------

  const {
    data: subscriptions,
    error: subscriptionsError,
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
      created_at,

      profiles!subscriptions_buyer_fkey (
        id,
        username,
        display_name,
        avatar_url
      ),

      channels!subscriptions_channel_fkey (
        id,
        channel_name,
        slug
      )
    `)
    .in("channel_id", channelIds)
    .order("created_at", {
      ascending: false,
    });

  if (subscriptionsError) {
    console.error(
      "Subscriptions lookup error:",
      subscriptionsError
    );
  }

  // --------------------------------------------------
  // Format subscriber rows
  // --------------------------------------------------

  const subscriberRows = (subscriptions ?? []).map(
    (subscription) => {
      const subscriberProfile = Array.isArray(
        subscription.profiles
      )
        ? subscription.profiles[0]
        : subscription.profiles;

      const channel = Array.isArray(
        subscription.channels
      )
        ? subscription.channels[0]
        : subscription.channels;

      return {
        id: subscription.id,
        buyerId: subscription.buyer_id,

        subscriberName:
          subscriberProfile?.display_name ||
          subscriberProfile?.username ||
          translations["seller.subscriber"] ||
          "Subscriber",

        username:
          subscriberProfile?.username || null,

        avatarUrl:
          subscriberProfile?.avatar_url || null,

        channelName:
          channel?.channel_name || 
           translations["seller.channel"] ||
          "Channel",

        channelSlug:
          channel?.slug || null,

        price: Number(
          subscription.subscription_price
        ),

        currency:
          subscription.currency,

        status:
          subscription.status,

        startedAt:
          subscription.started_at,

        currentPeriodEnd:
          subscription.current_period_end,

        cancelAtPeriodEnd:
          subscription.cancel_at_period_end,

        cancelledAt:
          subscription.cancelled_at,

        paymentProvider:
          subscription.payment_provider,

        createdAt:
          subscription.created_at,
      };
    }
  );

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const totalSubscribers =
    subscriberRows.length;

  const activeSubscribers =
    subscriberRows.filter(
      (subscriber) =>
        subscriber.status === "active"
    ).length;

  const monthlySubscriptionValue =
    subscriberRows
      .filter(
        (subscriber) =>
          subscriber.status === "active"
      )
      .reduce(
        (total, subscriber) =>
          total + subscriber.price,
        0
      );

  // --------------------------------------------------
  // Currency
  // --------------------------------------------------

  const currency =
    subscriberRows[0]?.currency || "USD";

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
           {translations["seller.subscribers"] ?? "Subscribers"}
        </h1>

        <p className="mt-2 text-sm text-muted">
          {translations["seller.subscribers_description"] ??
          "Manage the people subscribed to your channels."}
        </p>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total Subscribers */}

        <div className="rounded-xl border border-border bg-background p-5">

          <div className="flex items-center justify-between">

            <p className="text-lg font-bold text-muted">
              {translations["seller.total_subscribers"] ?? "Total Subscribers"}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <Users className="h-4 w-4 text-foreground" />
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {totalSubscribers}
          </p>

          <p className="mt-1 text-xs text-muted">
            {translations["seller.total_subscribers_description"] ??
            "People subscribed to your channels"}
          </p>

        </div>

        {/* Active Subscribers */}

        <div className="rounded-xl border border-border bg-background p-5">

          <div className="flex items-center justify-between">

            <p className="text-lg font-bold text-muted">
              {translations["seller.active_subscribers"] ?? "Active Subscribers"}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <UserCheck className="h-4 w-4 text-foreground" />
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {activeSubscribers}
          </p>

          <p className="mt-1 text-xs text-muted">
            {translations["seller.active_subscribers_description"] ??
            "Currently active subscriptions"}
          </p>

        </div>

        {/* Monthly Subscription Value */}

        <div className="rounded-xl border border-border bg-background p-5">

          <div className="flex items-center justify-between">

            <p className="text-lg font-bold text-muted">
              {translations["seller.monthly_subscription_value"] ??
              "Monthly Subscription Value"}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg">
              <DollarSign className="h-4 w-4 text-foreground" />
            </div>

          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(monthlySubscriptionValue)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {translations["seller.monthly_subscription_value_description"] ??
            "Value of active subscriptions"}
          </p>

        </div>

      </div>

      {/* ==================================================
          SUBSCRIBERS
      ================================================== */}

      <section className="mt-10">

        <div className="mb-4">

          <h2 className="text-xl font-semibold text-foreground">
            {translations["seller.your_subscribers"] ??
            "Your Subscribers"}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {translations["seller.your_subscribers_description"] ??
            "View and manage subscribers across your channels."}
          </p>

        </div>

        <SubscribersTable
          subscribers={subscriberRows}
          translations={translations}
          locale={locale}
        />

      </section>

    </div>
  );
}