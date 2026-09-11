import Link from "next/link";

import type { Subscription } from "@/components/admin/subscriptions/SubscriptionsHeader";

type Props = {
  subscription: Subscription;
};

function formatPrice(
  price: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function SubscriptionRow({
  subscription,
}: Props) {
  const buyer = subscription.buyer;
  const channel = subscription.channel;

  const buyerName =
    buyer?.display_name ||
    buyer?.username ||
    "Unknown user";

  return (
    <tr className="border-b border-border last:border-0">

      {/* Subscriber */}
      <td className="px-6 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {buyerName}
          </p>

          {buyer?.username && (
            <p className="mt-0.5 truncate text-xs text-muted">
              @{buyer.username}
            </p>
          )}
        </div>
      </td>

      {/* Channel */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-foreground">
            {channel?.channel_name || "Unknown channel"}
          </p>

          {channel?.slug && (
            <p className="mt-0.5 text-xs text-muted">
              /{channel.slug}
            </p>
          )}
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4 text-secondary">
        {formatPrice(
          subscription.subscription_price,
          subscription.currency
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium capitalize text-secondary">
          {subscription.status}
        </span>
      </td>

      {/* Next Billing */}
      <td className="px-6 py-4 text-muted">
        {subscription.status === "active"
          ? formatDate(subscription.next_billing_at)
          : "—"}
      </td>

      {/* Provider */}
      <td className="px-6 py-4 capitalize text-secondary">
        {subscription.payment_provider}
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        <Link
          href={`/admin/subscriptions/${subscription.id}`}
          className="text-sm font-medium text-secondary hover:text-foreground"
        >
          View
        </Link>
      </td>

    </tr>
  );
}