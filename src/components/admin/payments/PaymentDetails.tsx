import type { Payment } from "@/components/admin/payments/PaymentsHeader";

type Subscription = {
  id: string;
};

type PaymentWithDetails = Payment & {
  subscription: Subscription | null;
};

interface Props {
  payment: PaymentWithDetails;
}

function formatCurrency(
  amount: number,
  currency = "USD"
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

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClasses(
  status: Payment["payment_status"]
) {
  switch (status) {
    case "paid":
      return "bg-foreground text-background";

    case "failed":
    default:
      return "bg-muted-bg text-secondary";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-0">
      <p className="text-sm text-muted">
        {label}
      </p>

      <div className="max-w-[65%] break-all text-right text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

export default function PaymentDetails({
  payment,
}: Props) {
  const buyerName =
    payment.buyer?.display_name ||
    payment.buyer?.username ||
    "Unknown buyer";

  const channelName =
    payment.channel?.channel_name ||
    "Unknown channel";

  return (
    <div>
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Payment Details
          </h1>

          <p className="mt-2 break-all text-sm text-muted">
            {payment.id}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-md px-3 py-1.5 text-xs font-medium capitalize ${getStatusClasses(
            payment.payment_status
          )}`}
        >
          {payment.payment_status}
        </span>
      </div>

      {/* Payment + Buyer */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Payment Information */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Payment Information
          </h2>

          <div className="mt-4">
            <DetailRow
              label="Gross Amount"
              value={formatCurrency(
                Number(payment.gross_amount),
                payment.currency
              )}
            />

            <DetailRow
              label="Platform Fee"
              value={formatCurrency(
                Number(payment.platform_fee),
                payment.currency
              )}
            />

            <DetailRow
              label="Creator Amount"
              value={formatCurrency(
                Number(payment.creator_amount),
                payment.currency
              )}
            />

            <DetailRow
              label="Currency"
              value={payment.currency}
            />

            <DetailRow
              label="Provider"
              value={
                <span className="capitalize">
                  {payment.payment_provider}
                </span>
              }
            />

            <DetailRow
              label="Provider Payment ID"
              value={
                payment.provider_payment_id || "—"
              }
            />

            <DetailRow
              label="Status"
              value={
                <span className="capitalize">
                  {payment.payment_status}
                </span>
              }
            />

            <DetailRow
              label="Invoice Number"
              value={
                payment.invoice_number || "—"
              }
            />

            <DetailRow
              label="Paid At"
              value={formatDateTime(payment.paid_at)}
            />

            <DetailRow
              label="Created At"
              value={formatDateTime(payment.created_at)}
            />
          </div>
        </div>

        {/* Buyer */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Buyer
          </h2>

          <div className="mt-4">
            <DetailRow
              label="Name"
              value={buyerName}
            />

            <DetailRow
              label="Username"
              value={
                payment.buyer?.username
                  ? `@${payment.buyer.username}`
                  : "—"
              }
            />

            <DetailRow
              label="User ID"
              value={payment.buyer_id}
            />
          </div>
        </div>
      </div>

      {/* Channel */}
      <div className="mt-6 rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Channel
        </h2>

        <div className="mt-4 grid gap-x-8 md:grid-cols-2">
          <DetailRow
            label="Channel"
            value={channelName}
          />

          <DetailRow
            label="Slug"
            value={
              payment.channel?.slug
                ? `/${payment.channel.slug}`
                : "—"
            }
          />

          <DetailRow
            label="Channel ID"
            value={payment.channel_id}
          />
        </div>
      </div>

      {/* Subscription */}
      <div className="mt-6 rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Subscription
        </h2>

        <div className="mt-4">
          <DetailRow
            label="Subscription ID"
            value={payment.subscription_id}
          />
        </div>
      </div>
    </div>
  );
}