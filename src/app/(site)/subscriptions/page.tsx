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

          const renewalDate =
            new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(
              new Date(
                subscription.current_period_end
              )
            );

          return (
            <div
              key={subscription.id}
              className="group overflow-hidden rounded-xl border border-border bg-background transition hover:shadow-md"
            >

              {/* =================================================
                  BANNER
              ================================================== */}

              <div className="h-40 bg-muted-bg">
                {channel.banner_url ? (
                  <img
                    src={channel.banner_url}
                    alt={channel.channel_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted-bg text-sm text-muted">
                    No banner available
                  </div>
                )}
              </div>

              {/* =================================================
                  CONTENT
              ================================================== */}

              <div className="p-6">

                {/* ===============================================
                    CHANNEL
                ================================================ */}

                <div className="flex items-center gap-4">
                  <Link
                    href={`/channels/${channel.slug}`}
                    className="shrink-0"
                  >
                    {channel.logo_url ? (
                      <img
                        src={channel.logo_url}
                        alt={channel.channel_name}
                        className="h-14 w-14 rounded-full object-cover transition hover:opacity-90"
                      />
                    ) : seller?.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.username}
                        className="h-14 w-14 rounded-full object-cover transition hover:opacity-90"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted-bg font-semibold text-foreground">
                        {channel.channel_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/channels/${channel.slug}`}
                      className="block"
                    >
                      <h2 className="truncate text-xl font-semibold text-foreground transition hover:text-secondary">
                        {channel.channel_name}
                      </h2>
                    </Link>

                    {seller?.username && (
                      <Link
                        href={`/sellers/${seller.username}`}
                        className="text-sm text-muted transition hover:text-foreground hover:underline"
                      >
                        @{seller.username}
                      </Link>
                    )}
                  </div>
                </div>
                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                {channel.description ? (
                  <p className="mt-4 line-clamp-3 text-sm italic leading-6 text-secondary">
                    {channel.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    No description available.
                  </p>
                )}

                {/* =================================================
                    SUBSCRIPTION STATUS
                ================================================== */}

                <div className="mt-5 flex items-center justify-between">

                  <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
                    Active
                  </span>

                  <span className="text-sm text-muted">
                    Renews on {renewalDate}
                  </span>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================== */}

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    href={`/channels/${channel.slug}`}
                  >
                    <Button className="rounded-lg">
                      Continue Learning
                    </Button>
                  </Link>

                  <Link
                    href={`/subscriptions/${subscription.id}`}
                  >
                    <Button
                      variant="outline"
                      className="rounded-lg"
                    >
                      Manage Subscription
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