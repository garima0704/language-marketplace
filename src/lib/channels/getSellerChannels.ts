import { createClient } from "@/lib/supabase/server";

export async function getSellerChannels(userId: string) {
  const supabase = await createClient();

  const { data: channels, error } = await supabase
    .from("channels")
    .select(
      `
        id,
        channel_name,
        slug,
        description,
        logo_url,
        banner_url,
        subscription_price,
        created_at
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get seller channels error:", error);
    return [];
  }

  const sellerChannels = channels ?? [];

  const channelStats = await Promise.all(
    sellerChannels.map(async (channel) => {
      const [{ count: videoCount }, { count: subscriberCount }] =
        await Promise.all([
          supabase
            .from("videos")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("channel_id", channel.id),

          supabase
            .from("subscriptions")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("channel_id", channel.id)
            .eq("status", "active"),
        ]);

      return {
        ...channel,
        video_count: videoCount ?? 0,
        subscriber_count: subscriberCount ?? 0,
      };
    })
  );

  return channelStats;
}