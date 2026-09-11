"use client";

import {
  DollarSign,
  Users,
  Building2,
  Wallet,
} from "lucide-react";

export type Payment = {
  id: string;
  subscription_id: string;
  buyer_id: string;
  channel_id: string;
  gross_amount: number;
  platform_fee: number;
  creator_amount: number;
  currency: string;
  payment_provider: string;
  payment_status: "paid" | "failed" | "refunded";
  paid_at: string;
  created_at: string;
  invoice_number: string | null;

  channel: {
    id: string;
    channel_name: string;
    slug: string;
    user_id: string;

    creator: {
      id: string;
      username: string | null;
      display_name: string | null;
    } | null;
  } | null;
};

type Props = {
  payments: Payment[];
  totalPaidOut: number;
};

function calculateTotal(
  payments: Payment[],
  field:
    | "gross_amount"
    | "creator_amount"
    | "platform_fee"
) {
  return payments
    .filter(
      (payment) => payment.payment_status === "paid"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment[field]),
      0
    );
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

export default function EarningsHeader({
  payments,
  totalPaidOut,
}: Props) {
  const totalRevenue = calculateTotal(
    payments,
    "gross_amount"
  );

  const creatorEarnings = calculateTotal(
    payments,
    "creator_amount"
  );

  const platformFees = calculateTotal(
    payments,
    "platform_fee"
  );

  const currency =
    payments[0]?.currency || "USD";

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(
        totalRevenue,
        currency
      ),
      icon: DollarSign,
    },
    {
      title: "Creator Earnings",
      value: formatCurrency(
        creatorEarnings,
        currency
      ),
      icon: Users,
    },
    {
      title: "Platform Fees",
      value: formatCurrency(
        platformFees,
        currency
      ),
      icon: Building2,
    },
    {
      title: "Paid Out",
      value: formatCurrency(
        totalPaidOut,
        currency
      ),
      icon: Wallet,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Earnings
        </h1>

        <p className="mt-2 text-secondary">
          Track revenue, creator earnings, and
          platform fees across NiceConvo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}