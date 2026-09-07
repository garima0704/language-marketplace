import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSellerChannels } from "@/lib/channels/getSellerChannels";

import DashboardStats from "@/components/seller/DashboardStats";
import ChannelCard from "@/components/channels/ChannelCard";

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

  const sellerChannels = await getSellerChannels(user.id);

  const channelIds = sellerChannels.map(
    (channel) => channel.id
  );

  // --------------------------------------------------
  // DEFAULT STATS
  // --------------------------------------------------

  let videoCount = 0;
  let subscriberCount = 0;
  let earnings = 0;

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
    // Total earnings
    // -----------------------------------------------

    const {
      data: payments,
      error: paymentsError,
    } = await supabase
      .from("payments")
      .select("creator_amount")
      .in("channel_id", channelIds)
      .eq("payment_status", "paid");

    if (paymentsError) {
      console.error(
        "Dashboard overall earnings error:",
        paymentsError
      );
    }

    earnings = (payments ?? []).reduce(
      (total, payment) =>
        total + Number(payment.creator_amount || 0),
      0
    );

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your channels and grow your audience.
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        channelCount={sellerChannels.length}
        videoCount={videoCount}
        subscriberCount={subscriberCount}
        earnings={earnings}
      />

      {/* Channels */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">
          Your Channels
        </h2>

        {sellerChannels.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sellerChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                variant="seller"
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No channels created yet.
          </p>
        )}
      </section>
    </div>
  );
}
}