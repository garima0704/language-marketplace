import Link from "next/link";

import type { Payout } from "@/components/admin/payouts/PayoutsHeader";

type Props = {
  payout: Payout;
};

function formatPrice(amount: number, currency: string) {
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

export default function PayoutRow({ payout }: Props) {
  const creatorName =
    payout.creator?.display_name ||
    payout.creator?.username ||
    "Unknown creator";

  return (
    <tr className="border-b border-border last:border-0">
      {/* Creator */}
      <td className="px-6 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {creatorName}
          </p>

          {payout.creator?.username && (
            <p className="mt-0.5 truncate text-xs text-muted">
              @{payout.creator.username}
            </p>
          )}
        </div>
      </td>

      {/* Amount */}
      <td className="px-6 py-4 font-medium text-foreground">
        {formatPrice(
          Number(payout.amount),
          payout.currency
        )}
      </td>

      {/* Provider */}
      <td className="px-6 py-4 capitalize text-secondary">
        {payout.provider}
      </td>

      {/* Provider payout ID */}
      <td className="px-6 py-4 text-secondary">
        {payout.provider_payout_id || "—"}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium capitalize text-secondary">
          {payout.status}
        </span>
      </td>

      {/* Created */}
      <td className="px-6 py-4 text-muted">
        {formatDate(payout.created_at)}
      </td>

      {/* Processed */}
      <td className="px-6 py-4 text-muted">
        {formatDate(payout.processed_at)}
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        <Link
          href={`/admin/payouts/${payout.id}`}
          className="text-sm font-medium text-secondary hover:text-foreground"
        >
          View
        </Link>
      </td>
    </tr>
  );
}