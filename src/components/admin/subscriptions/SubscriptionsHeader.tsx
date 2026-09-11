"use client";

import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

export type Subscription = {
  id: string;
  buyer_id: string;
  channel_id: string;
  subscription_price: number;
  currency: string;
  status: "active" | "cancelled" | "expired";
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  payment_provider: string;
  next_billing_at: string | null;
  created_at: string;

  buyer: {
    id: string;
    username: string | null;
    display_name: string | null;
  } | null;

  channel: {
    id: string;
    channel_name: string;
    slug: string;
  } | null;
  };

type Props = {
  subscriptions: Subscription[];
};

export default function SubscriptionsHeader({
  subscriptions,
}: Props) {
  const stats = [
    {
      title: "Total Subscriptions",
      value: subscriptions.length,
      icon: CreditCard,
    },
    {
      title: "Active",
      value: subscriptions.filter(
        (subscription) => subscription.status === "active"
      ).length,
      icon: CheckCircle2,
    },
    {
      title: "Cancelled",
      value: subscriptions.filter(
        (subscription) => subscription.status === "cancelled"
      ).length,
      icon: XCircle,
    },
    {
      title: "Expired",
      value: subscriptions.filter(
        (subscription) => subscription.status === "expired"
      ).length,
      icon: Clock3,
    },
  ];

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Subscriptions
        </h1>

        <p className="mt-2 text-secondary">
          Manage customer subscriptions across NiceConvo.
        </p>
      </div>

      {/* Stats */}
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