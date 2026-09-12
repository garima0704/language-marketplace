import Link from "next/link";
import { Eye } from "lucide-react";

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

      {/* Action */}
      <td className="px-6 py-4">
        <Link
          href={`/admin/payouts/${payout.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      </td>
    </tr>
  );
}