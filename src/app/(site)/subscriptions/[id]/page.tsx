import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import ChannelHeader from "@/components/channels/ChannelHeader";
import { Button } from "@/components/ui/button";

interface SubscriptionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionPage({
  params,
}: SubscriptionPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // =========================================================
  // AUTH
  // =========================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // GET SUBSCRIPTION
  // =========================================================

  const {
    data: subscription,
    error: subscriptionError,
  } = await supabase
    .from("subscriptions")
    .select(`
      id,
      status,
      current_period_end,
      subscription_price,
      channel_id
    `)
    .eq("id", id)
    .eq("buyer_id", user.id)
    .single();

  if (subscriptionError || !subscription) {
    notFound();
  }

  // =========================================================
  // GET CHANNEL
  // =========================================================

  const {
    data: channel,
    error: channelError,
  } = await supabase
    .from("channels")
    .select(`
      id,
      channel_name,
      slug,
      description,
      logo_url,
      banner_url,
      subscription_price,
      currency,
      profiles!channels_user_id_fkey (
        id,
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("id", subscription.channel_id)
    .single();

  if (channelError || !channel) {
    notFound();
  }

  // =========================================================
  // NORMALIZE PROFILE
  // =========================================================

  const seller = Array.isArray(channel.profiles)
    ? channel.profiles[0]
    : channel.profiles;

  if (!seller) {
    notFound();
  }

  // =========================================================
  // CHANNEL HEADER DATA
  // =========================================================

  const channelHeaderData = {
    channel_name: channel.channel_name,
    description: channel.description,
    logo_url: channel.logo_url,
    banner_url: channel.banner_url,
    subscription_price: Number(
      channel.subscription_price ?? 0
    ),
    currency: channel.currency ?? "USD",
    profiles: {
      display_name: seller.display_name,
      username: seller.username,
      avatar_url: seller.avatar_url,
    },
  };

  // =========================================================
  // SUBSCRIPTION DATA
  // =========================================================

  const isActive = subscription.status === "active";

  const renewalDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(subscription.current_period_end));

  const currency = channel.currency ?? "USD";

  const price = Number(
    subscription.subscription_price ??
      channel.subscription_price ??
      0
  );

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="px-6 py-6">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            BACK
        ====================================================== */}

        <Link
          href="/subscriptions"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Subscriptions
        </Link>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Manage Subscription
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage your subscription to{" "}
            {channel.channel_name}.
          </p>
        </div>

        {/* =====================================================
            CHANNEL HEADER
        ====================================================== */}

        <ChannelHeader
          channel={channelHeaderData}
          isSubscribed={isActive}
        />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* ===================================================
              SUBSCRIPTION DETAILS
          ==================================================== */}

          <section className="overflow-hidden rounded-xl border border-border bg-background">

            <div className="border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-foreground">
                Subscription Details
              </h2>

              <p className="mt-1 text-sm text-muted">
                Information about your current membership.
              </p>
            </div>

            <div className="divide-y divide-border">

              {/* STATUS */}

              <div className="flex items-center justify-between gap-4 px-6 py-5">

                <div className="flex items-center gap-3">
                  {isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-foreground" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted" />
                  )}

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Status
                    </p>

                    <p className="mt-0.5 text-sm text-muted">
                      {isActive
                        ? "Your subscription is active."
                        : "Your subscription is inactive."}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* PRICE */}

              <div className="flex items-center justify-between gap-4 px-6 py-5">

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted" />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Membership
                    </p>

                    <p className="mt-0.5 text-sm text-muted">
                      Monthly subscription
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground">
                  {formattedPrice}

                  <span className="ml-1 font-normal text-muted">
                    / month
                  </span>
                </p>
              </div>

              {/* RENEWAL */}

              <div className="flex items-center justify-between gap-4 px-6 py-5">

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted" />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Next renewal
                    </p>

                    <p className="mt-0.5 text-sm text-muted">
                      Your subscription renews automatically.
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground">
                  {renewalDate}
                </p>
              </div>

            </div>
          </section>

          {/* ===================================================
              MANAGE
          ==================================================== */}

          <aside className="h-fit overflow-hidden rounded-xl border border-border bg-background">

            <div className="border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-foreground">
                Manage
              </h2>

              <p className="mt-1 text-sm text-muted">
                Manage your access to this channel.
              </p>
            </div>

            <div className="space-y-3 p-6">

              {/* CONTINUE LEARNING */}

              <Link
                href={`/channels/${channel.slug}`}
                className="block"
              >
                <Button className="w-full rounded-lg">
                  Continue Learning
                </Button>
              </Link>

              {/* CANCEL */}

              {isActive && (
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-border"
                >
                  Cancel Subscription
                </Button>
              )}

            </div>
          </aside>
        </div>

        {/* =====================================================
            NOTE
        ====================================================== */}

        <p className="mt-6 text-xs leading-5 text-muted">
          Your subscription gives you access to
          subscriber-only content from this channel.
          Cancelling your subscription should keep your
          access active until the end of the current billing
          period.
        </p>

      </div>
    </div>
  );
}