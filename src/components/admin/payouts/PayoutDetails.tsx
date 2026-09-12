import type { Payout } from "@/components/admin/payouts/PayoutsHeader";

interface Props {
  payout: Payout;
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

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatDateTime(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getStatusClasses(
  status: Payout["status"]
) {
  switch (status) {
    case "completed":
      return "bg-foreground text-background";

    case "failed":
      return "bg-muted-bg text-secondary";

    case "processing":
    case "pending":
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

      <div className="text-right text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

export default function PayoutDetails({
  payout,
}: Props) {
  const creatorName =
    payout.creator?.display_name ||
    payout.creator?.username ||
    "Unknown creator";

  return (
    <div>
      {/* Page heading */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Payout Details
            </h1>

            <p className="mt-2 break-all text-sm text-muted">
              {payout.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-md px-3 py-1.5 text-xs font-medium capitalize ${getStatusClasses(
              payout.status
            )}`}
          >
            {payout.status}
          </span>
        </div>
      </div>

      {/* Main information */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Payout information */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Payout Information
          </h2>

          <div className="mt-4">
            <DetailRow
              label="Amount"
              value={formatCurrency(
                Number(payout.amount),
                payout.currency
              )}
            />

            <DetailRow
              label="Status"
              value={
                <span className="capitalize">
                  {payout.status}
                </span>
              }
            />

            <DetailRow
              label="Provider"
              value={
                <span className="capitalize">
                  {payout.provider}
                </span>
              }
            />

            <DetailRow
              label="Provider Payout ID"
              value={
                payout.provider_payout_id || "—"
              }
            />

            <DetailRow
              label="Payout Account ID"
              value={payout.payout_account_id}
            />

            <DetailRow
              label="Created"
              value={formatDateTime(
                payout.created_at
              )}
            />

            <DetailRow
              label="Processed"
              value={formatDateTime(
                payout.processed_at
              )}
            />
          </div>
        </div>

        {/* Creator */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Creator
          </h2>

          <div className="mt-4">
            <DetailRow
              label="Name"
              value={creatorName}
            />

            <DetailRow
              label="Username"
              value={
                payout.creator?.username
                  ? `@${payout.creator.username}`
                  : "—"
              }
            />

            <DetailRow
              label="User ID"
              value={payout.user_id}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      {payout.notes && (
        <div className="mt-6 rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Notes
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-secondary">
            {payout.notes}
          </p>
        </div>
      )}
    </div>
  );
}