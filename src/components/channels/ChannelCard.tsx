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
}

export default function ChannelCard({
  channel,
  seller,
  variant,
  subscription,
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
      {/* =========================================================
          BANNER
      ========================================================== */}

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

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="p-6">
        {/* =======================================================
            CHANNEL INFO
        ======================================================== */}

        <div className="flex items-center gap-4">
          {/* Channel Logo */}
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
                alt={seller.username || channel.channel_name}
                className="h-14 w-14 rounded-full object-cover transition hover:opacity-90"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted-bg font-semibold text-foreground">
                {channel.channel_name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          {/* Channel Name + Username */}
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

        {/* =========================================================
            DESCRIPTION / ABOUT
        ========================================================== */}

        {channel.description ? (
          <p className="mt-4 line-clamp-3 text-sm italic leading-6 text-secondary">
            {channel.description}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No description available.
          </p>
        )}

        {/* =========================================================
            SUBSCRIPTION STATUS
            Only shown on subscriptions page
        ========================================================== */}

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

        {/* =========================================================
            ACTIONS
        ========================================================== */}

        {variant === "subscription" && subscription ? (
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
          <div className="mt-6">
            <Link href={`/channels/${channel.slug}`}>
              <Button className="rounded-lg">
                View Channel
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}