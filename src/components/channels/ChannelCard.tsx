import Link from "next/link";

import { Button } from "@/components/ui/button";

type SellerInfo = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Channel = {
  id: string;
  channel_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  subscription_price: number | string | null;
  currency: string | null;

  // Seller-specific stats
  subscriber_count?: number;
  video_count?: number;
};

type SubscriptionInfo = {
  id: string;
  current_period_end: string;
};

interface ChannelCardProps {
  channel: Channel;
  seller?: SellerInfo | null;
  variant: "subscription" | "seller";
  subscription?: SubscriptionInfo;
  showActions?: boolean;
}

export default function ChannelCard({
  channel,
  seller,
  variant,
  subscription,
  showActions = true,
}: ChannelCardProps) {
  const renewalDate =
    subscription?.current_period_end
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(subscription.current_period_end))
      : null;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-background transition hover:shadow-md">

      {/* Banner */}
      <div className="relative aspect-[3/1] bg-muted-bg">
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

        {/* Channel Logo */}
        <Link
          href={`/channels/${channel.slug}`}
          className="absolute bottom-0 left-5 z-10 translate-y-1/2"
        >
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-background shadow-sm">
            {channel.logo_url ? (
              <img
                src={channel.logo_url}
                alt={channel.channel_name}
                className="h-full w-full object-cover"
              />
            ) : seller?.avatar_url ? (
              <img
                src={seller.avatar_url}
                alt={seller.username || channel.channel_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted-bg text-xl font-semibold text-foreground">
                {channel.channel_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-16">

        {/* Channel Name */}
        <Link
          href={`/channels/${channel.slug}`}
          className="block"
        >
          <h2 className="truncate text-xl font-semibold text-foreground transition hover:text-secondary">
            {channel.channel_name}
          </h2>
        </Link>

        {/* Username */}
        {seller?.username && (
          <Link
            href={`/sellers/${seller.username}`}
            className="mt-1 block text-sm text-muted transition hover:text-foreground hover:underline"
          >
            @{seller.username}
          </Link>
        )}

        {/* Description */}
        {channel.description ? (
          <p className="mt-4 line-clamp-3 text-sm italic leading-6 text-secondary">
            {channel.description}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No description available.
          </p>
        )}

        {/* Seller Details */}
        {variant === "seller" && (
          <>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                ${Number(channel.subscription_price ?? 0).toFixed(2)}
                <span className="font-normal text-muted">
                  /month
                </span>
              </span>
            </div>

            <div className="mt-2 text-sm text-muted">
              {channel.subscriber_count ?? 0} subscribers
              <span className="mx-2">·</span>
              {channel.video_count ?? 0} videos
            </div>
          </>
        )}

        {/* Subscription Status */}
        {variant === "subscription" && subscription && (
          <div className="mt-5 flex items-center justify-between">
            <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
              Active
            </span>

            {renewalDate && (
              <span className="text-sm text-muted">
                Renews on {renewalDate}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions &&
          (variant === "subscription" && subscription ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/channels/${channel.slug}`}>
                <Button className="rounded-lg">
                  Continue Learning
                </Button>
              </Link>

              <Link href={`/subscriptions/${subscription.id}`}>
                <Button
                  variant="outline"
                  className="rounded-lg"
                >
                  Manage Subscription
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Manage / View */}
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/seller/channels/${channel.id}`}
                  className="flex-1"
                >
                  <Button className="w-full rounded-lg">
                    Manage
                  </Button>
                </Link>

                <Link
                  href={`/channels/${channel.slug}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-lg"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </>
          ))}
      </div>
    </div>
  );
}