import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import PayoutDetails from "@/components/admin/payouts/PayoutDetails";

interface PayoutDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PayoutDetailsPage({
  params,
}: PayoutDetailsPageProps) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: payout,
    error,
  } = await supabase
    .from("payouts")
    .select(`
      id,
      user_id,
      payout_account_id,
      amount,
      currency,
      provider,
      provider_payout_id,
      status,
      processed_at,
      created_at,
      notes,

      creator:profiles!payouts_user_fkey (
        id,
        username,
        display_name
      ),

      payout_account:creator_payout_accounts!payouts_account_fkey (
        id,
        user_id,
        provider,
        provider_account_id,
        paypal_email,
        account_holder_name,
        bank_name,
        account_number,
        iban,
        swift_code,
        is_default,
        status,
        created_at,
        updated_at
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("PAYOUT DETAIL FETCH ERROR:", error);
  }

  if (!payout) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/admin/payouts"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to payouts
          </Link>

          <div className="mt-8 rounded-xl border border-border bg-background p-8">
            <h1 className="text-xl font-semibold text-foreground">
              Payout not found
            </h1>

            <p className="mt-2 text-sm text-muted">
              The payout you are looking for does not exist or could not
              be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const creator = Array.isArray(payout.creator)
    ? payout.creator[0] ?? null
    : payout.creator ?? null;

  const payoutAccount = Array.isArray(payout.payout_account)
    ? payout.payout_account[0] ?? null
    : payout.payout_account ?? null;

  const normalizedPayout = {
    ...payout,
    creator,
    payout_account: payoutAccount,
  };

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/admin/payouts"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to payouts
        </Link>

        <div className="mt-6">
          <PayoutDetails payout={normalizedPayout} />
        </div>
      </div>
    </main>
  );
}