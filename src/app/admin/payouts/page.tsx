import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import PayoutsHeader from "@/components/admin/payouts/PayoutsHeader";
import PayoutList from "@/components/admin/payouts/PayoutList";

export default async function PayoutsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data: payouts,
    error: payoutsError,
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
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (payoutsError) {
    console.error(
      "PAYOUTS FETCH ERROR:",
      payoutsError
    );
  }

  const normalizedPayouts = (payouts ?? []).map(
    (payout) => {
      const creator = Array.isArray(payout.creator)
        ? payout.creator[0] ?? null
        : payout.creator ?? null;

      return {
        ...payout,
        creator,
      };
    }
  );

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PayoutsHeader
          payouts={normalizedPayouts}
        />

        <div className="mt-6">
          <PayoutList
            payouts={normalizedPayouts}
          />
        </div>
      </div>
    </main>
  );
}