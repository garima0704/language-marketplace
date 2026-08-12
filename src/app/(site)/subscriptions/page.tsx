import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get subscriptions
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
        <h1 className="text-3xl font-bold text-gray-900">
          My Subscriptions
        </h1>

        <p className="mt-4 text-gray-700">
          Failed to load subscriptions.
        </p>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Subscriptions
        </h1>

        <p className="mt-2 text-gray-500">
          Continue learning from the channels you've subscribed to.
        </p>

        <div className="mt-8 rounded-xl border bg-white px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
            📺
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            No subscriptions yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-gray-500">
            Subscribe to your favorite language channels and continue learning anytime.
          </p>

          <Link href="/sellers">
            <Button className="mt-8">
              Browse Sellers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get channel details
  const channelIds = subscriptions.map((s) => s.channel_id);

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
        avatar_url
      )
    `)
    .in("id", channelIds);

  const channelMap = new Map(
    (channels ?? []).map((channel) => [channel.id, channel])
  );

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Subscriptions
        </h1>

        <p className="mt-2 text-gray-500">
          Continue learning from the channels you've subscribed to.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {subscriptions.map((subscription) => {
          const channel = channelMap.get(subscription.channel_id);

          if (!channel) return null;

          const seller = Array.isArray(channel.profiles)
            ? channel.profiles[0]
            : channel.profiles;

          const renewalDate = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(subscription.current_period_end));

          return (
            <div
              key={subscription.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-40 bg-gray-100">
                {channel.banner_url ? (
                  <img
                    src={channel.banner_url}
                    alt={channel.channel_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                    No banner available
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  {channel.logo_url ? (
                    <img
                      src={channel.logo_url}
                      alt={channel.channel_name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : seller?.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.display_name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600">
                      {channel.channel_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {channel.channel_name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      by {seller?.display_name ?? "Unknown Seller"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-gray-600">
                  {channel.description || "No description available."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    Active
                  </span>

                  <span className="text-sm text-gray-500">
                    Renews on {renewalDate}
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href={`/channels/${channel.slug}`}>
                    <Button>
                      Continue Learning
                    </Button>
                  </Link>

                  <Link href={`/channels/${channel.slug}`}>
                    <Button variant="outline">
                      View Channel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}