"use client";

import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export type Payout = {
  id: string;
  user_id: string;
  payout_account_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_payout_id: string | null;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed";
  processed_at: string | null;
  created_at: string;
  notes: string | null;

  creator: {
    id: string;
    username: string | null;
    display_name: string | null;
  } | null;
};

type Props = {
  payouts: Payout[];
};

function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function PayoutsHeader({ payouts }: Props) {
  const pending = payouts.filter(
    (payout) => payout.status === "pending"
  );

  const processing = payouts.filter(
    (payout) => payout.status === "processing"
  );

  const completed = payouts.filter(
    (payout) => payout.status === "completed"
  );

  const failed = payouts.filter(
    (payout) => payout.status === "failed"
  );

  const completedAmount = completed.reduce(
    (total, payout) => total + Number(payout.amount),
    0
  );

  const currency = payouts[0]?.currency || "USD";

  const stats = [
    {
      title: "Total Payouts",
      value: payouts.length.toString(),
      icon: Wallet,
    },
    {
      title: "Pending",
      value: pending.length.toString(),
      icon: Clock,
    },
    {
      title: "Completed",
      value: formatCurrency(completedAmount, currency),
      icon: CheckCircle,
    },
    {
      title: "Failed",
      value: failed.length.toString(),
      icon: XCircle,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Payouts
        </h1>

        <p className="mt-2 text-secondary">
          Track creator payouts and their processing status across NiceConvo.
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