import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DashboardStats from "@/components/seller/DashboardStats";
import SellerChannelCard from "@/components/seller/SellerChannelCard";

export default async function SellerDashboardPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // --------------------------------------------------
  // CHANNELS
  // --------------------------------------------------

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const sellerChannels = channels ?? [];

  const channelIds = sellerChannels.map(
    (channel) => channel.id
  );

  // --------------------------------------------------
  // DEFAULT STATS
  // --------------------------------------------------

  let videoCount = 0;
  let subscriberCount = 0;
  let monthlyEarnings = 0;

  // --------------------------------------------------
  // SELLER STATS
  // --------------------------------------------------

  if (channelIds.length > 0) {
    // -----------------------------------------------
    // Video count
    // -----------------------------------------------

    const {
      count: videosCount,
      error: videosError,
    } = await supabase
      .from("videos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("channel_id", channelIds);

    if (videosError) {
      console.error(
        "Dashboard video count error:",
        videosError
      );
    }

    videoCount = videosCount ?? 0;

    // -----------------------------------------------
    // Active subscribers
    // -----------------------------------------------

    const {
      count: subscriptionsCount,
      error: subscriptionsError,
    } = await supabase
      .from("subscriptions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("channel_id", channelIds)
      .eq("status", "active");

    if (subscriptionsError) {
      console.error(
        "Dashboard subscriber count error:",
        subscriptionsError
      );
    }

    subscriberCount = subscriptionsCount ?? 0;

    // -----------------------------------------------
    // Monthly earnings
    // -----------------------------------------------

    const now = new Date();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const {
      data: payments,
      error: paymentsError,
    } = await supabase
      .from("payments")
      .select("creator_amount, payment_status, paid_at")
      .in("channel_id", channelIds)
      .eq("payment_status", "paid")
      .gte("paid_at", monthStart.toISOString());

    if (paymentsError) {
      console.error(
        "Dashboard monthly earnings error:",
        paymentsError
      );
    }

    monthlyEarnings = (payments ?? []).reduce(
      (total, payment) =>
        total + Number(payment.creator_amount || 0),
      0
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="px-6 py-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name}
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your channels and grow your audience.
        </p>
      </div>

      <DashboardStats
        channelCount={sellerChannels.length}
        videoCount={videoCount}
        subscriberCount={subscriberCount}
        monthlyEarnings={monthlyEarnings}
      />

      <section className="space-y-4">

        <h2 className="text-2xl font-bold">
          Your Channels
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {sellerChannels.length ? (
            sellerChannels.map((channel) => (
              <SellerChannelCard
                key={channel.id}
                channel={channel}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              No channels created yet.
            </p>
          )}

        </div>

      </section>

    </div>
  );
}