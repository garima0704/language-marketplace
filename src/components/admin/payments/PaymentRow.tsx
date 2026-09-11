import Link from "next/link";

import type { Payment } from "@/components/admin/payments/PaymentsHeader";

type Props = {
  payment: Payment;
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

export default function PaymentRow({ payment }: Props) {
  const buyer = payment.buyer;
  const channel = payment.channel;

  const buyerName =
    buyer?.display_name ||
    buyer?.username ||
    "Unknown buyer";

  return (
    <tr className="border-b border-border last:border-0">
      {/* Buyer */}
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

      {/* Amount */}
      <td className="px-6 py-4 font-medium text-foreground">
        {formatPrice(
          Number(payment.gross_amount),
          payment.currency
        )}
      </td>

      {/* Provider */}
      <td className="px-6 py-4">
        <span className="capitalize text-secondary">
          {payment.payment_provider}
        </span>
      </td>

      {/* Invoice */}
      <td className="px-6 py-4 text-secondary">
        {payment.invoice_number || "—"}
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
          href={`/admin/payments/${payment.id}`}
          className="text-sm font-medium text-secondary hover:text-foreground"
        >
          View
        </Link>
      </td>
    </tr>
  );
}