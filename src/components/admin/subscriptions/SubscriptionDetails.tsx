import type { Subscription } from "@/components/admin/subscriptions/SubscriptionsHeader";

type Props = {
  subscription: Subscription;
};

function formatCurrency(
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
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatStatus(status: string) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getStatusClasses(
  status: Subscription["status"]
) {
  switch (status) {
    case "active":
      return "bg-foreground text-background";

    case "cancelled":
    case "expired":
    default:
      return "bg-muted-bg text-secondary";
  }
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-medium text-foreground ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function SubscriptionDetails({
  subscription,
}: Props) {
  const buyer = subscription.buyer;
  const channel = subscription.channel;

  const buyerName =
    buyer?.display_name ||
    buyer?.username ||
    "Unknown user";

  return (
    <div>
      {/* Header */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Subscription Details
            </h1>

            <p className="mt-2 font-mono text-xs text-muted">
              {subscription.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-md px-3 py-1.5 text-xs font-medium capitalize ${getStatusClasses(
              subscription.status
            )}`}
          >
            {subscription.status}
          </span>
        </div>
      </div>

      {/* Subscription Information */}
      <section className="mt-6 rounded-xl border border-border bg-background p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Subscription Information
          </h2>

          <p className="mt-1 text-sm text-muted">
            Billing and subscription details.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Subscription ID"
            value={subscription.id}
            mono
          />

          <DetailItem
            label="Price"
            value={formatCurrency(
              Number(subscription.subscription_price),
              subscription.currency
            )}
          />

          <DetailItem
            label="Currency"
            value={subscription.currency}
          />

          <DetailItem
            label="Payment Provider"
            value={subscription.payment_provider}
          />

          <DetailItem
            label="Status"
            value={formatStatus(subscription.status)}
          />

          <DetailItem
            label="Cancel at Period End"
            value={
              subscription.cancel_at_period_end
                ? "Yes"
                : "No"
            }
          />

          <DetailItem
            label="Started At"
            value={formatDate(
              subscription.started_at
            )}
          />

          <DetailItem
            label="Current Period Start"
            value={formatDate(
              subscription.current_period_start
            )}
          />

          <DetailItem
            label="Current Period End"
            value={formatDate(
              subscription.current_period_end
            )}
          />

          <DetailItem
            label="Next Billing"
            value={formatDate(
              subscription.next_billing_at
            )}
          />

          <DetailItem
            label="Cancelled At"
            value={formatDate(
              subscription.cancelled_at
            )}
          />

          <DetailItem
            label="Created At"
            value={formatDate(
              subscription.created_at
            )}
          />
        </div>
      </section>

      {/* Buyer */}
      <section className="mt-6 rounded-xl border border-border bg-background p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Subscriber
          </h2>

          <p className="mt-1 text-sm text-muted">
            Customer associated with this subscription.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Name"
            value={buyerName}
          />

          <DetailItem
            label="Username"
            value={
              buyer?.username
                ? `@${buyer.username}`
                : "—"
            }
          />

          <DetailItem
            label="User ID"
            value={subscription.buyer_id}
            mono
          />
        </div>
      </section>

      {/* Channel */}
      <section className="mt-6 rounded-xl border border-border bg-background p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Channel
          </h2>

          <p className="mt-1 text-sm text-muted">
            Channel associated with this subscription.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Channel"
            value={
              channel?.channel_name ||
              "Unknown channel"
            }
          />

          <DetailItem
            label="Slug"
            value={
              channel?.slug
                ? `/${channel.slug}`
                : "—"
            }
          />

          <DetailItem
            label="Channel ID"
            value={subscription.channel_id}
            mono
          />
        </div>
      </section>
    </div>
  );
}