import Link from "next/link";

import type { Payment } from "@/components/admin/earnings/EarningsHeader";

type Props = {
  payment: Payment;
};

function formatPrice(
  amount: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
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

export default function EarningsRow({
  payment,
}: Props) {
  const channel = payment.channel;
  const creator = channel?.creator;

  const creatorName =
    creator?.display_name ||
    creator?.username ||
    "Unknown creator";

  return (
    <tr className="border-b border-border last:border-0">
      {/* Creator */}
      <td className="px-6 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {creatorName}
          </p>

          {creator?.username && (
            <p className="mt-0.5 truncate text-xs text-muted">
              @{creator.username}
            </p>
          )}
        </div>
      </td>

      {/* Channel */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-foreground">
            {channel?.channel_name ||
              "Unknown channel"}
          </p>

          {channel?.slug && (
            <p className="mt-0.5 text-xs text-muted">
              /{channel.slug}
            </p>
          )}
        </div>
      </td>

      {/* Revenue */}
      <td className="px-6 py-4 text-secondary">
        {formatPrice(
          Number(payment.gross_amount),
          payment.currency
        )}
      </td>

      {/* Platform Fee */}
      <td className="px-6 py-4 text-secondary">
        {formatPrice(
          Number(payment.platform_fee),
          payment.currency
        )}
      </td>

      {/* Creator Amount */}
      <td className="px-6 py-4 font-medium text-foreground">
        {formatPrice(
          Number(payment.creator_amount),
          payment.currency
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium capitalize text-secondary">
          {payment.payment_status}
        </span>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-muted">
        {formatDate(payment.paid_at)}
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        <Link
          href={`/admin/earnings/${payment.id}`}
          className="text-sm font-medium text-secondary hover:text-foreground"
        >
          View
        </Link>
      </td>
    </tr>
  );
}