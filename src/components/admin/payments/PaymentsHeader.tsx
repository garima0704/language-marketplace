"use client";

import {
  CreditCard,
  CheckCircle,
  XCircle,
  RotateCcw,
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
  provider_payment_id: string;
  payment_status: "paid" | "failed";
  paid_at: string;
  created_at: string;
  invoice_number: string | null;

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
  payments: Payment[];
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

export default function PaymentsHeader({ payments }: Props) {
  const paidPayments = payments.filter(
    (payment) => payment.payment_status === "paid"
  );

  const failedPayments = payments.filter(
    (payment) => payment.payment_status === "failed"
  );

  const totalRevenue = paidPayments.reduce(
    (total, payment) => total + Number(payment.gross_amount),
    0
  );

  const currency = payments[0]?.currency || "USD";

  const stats = [
    {
      title: "Total Payments",
      value: payments.length.toString(),
      icon: CreditCard,
    },
    {
      title: "Successful",
      value: paidPayments.length.toString(),
      icon: CheckCircle,
    },
    {
      title: "Failed",
      value: failedPayments.length.toString(),
      icon: XCircle,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue, currency),
      icon: RotateCcw,
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Payments
        </h1>

        <p className="mt-2 text-secondary">
          View and manage all payment transactions across NiceConvo.
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