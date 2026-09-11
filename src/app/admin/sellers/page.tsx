import Link from "next/link";
import {
  Users,
  Tv,
  UserCheck,
  UserPlus,
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  formatTimeAgo,
  getProfileName,
  getInitials,
} from "@/lib/utils";

export default async function AdminSellersPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // Seller statistics
  // ---------------------------------------------------------

  const { data: sellers } = await supabase
    .from("profiles")
    .select(
      `
        id,
        username,
        display_name,
        avatar_url,
        country,
        role,
        is_creator,
        created_at
      `
    )
    .eq("is_creator", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const sellerIds = (sellers ?? []).map(
    (seller) => seller.id
  );

  // ---------------------------------------------------------
  // Seller channels
  // ---------------------------------------------------------

  const { data: channels } =
    sellerIds.length > 0
      ? await supabase
          .from("channels")
          .select("id, user_id, channel_name")
          .in("user_id", sellerIds)
      : { data: [] };

  // ---------------------------------------------------------
  // Build channel count per seller
  // ---------------------------------------------------------

  const channelCountBySeller = new Map<string, number>();

  (channels ?? []).forEach((channel) => {
    channelCountBySeller.set(
      channel.user_id,
      (channelCountBySeller.get(channel.user_id) ?? 0) + 1
    );
  });

  const totalSellers = sellerIds.length;

  const sellersWithChannels = sellerIds.filter(
    (id) => (channelCountBySeller.get(id) ?? 0) > 0
  ).length;

  const sellersWithoutChannels =
    totalSellers - sellersWithChannels;

  const totalChannels = channels?.length ?? 0;

  // ---------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------

  const stats = [
    {
      title: "Total Sellers",
      value: totalSellers,
      icon: Users,
    },
    {
      title: "Active Sellers",
      value: sellersWithChannels,
      icon: UserCheck,
    },
    {
      title: "Without Channels",
      value: sellersWithoutChannels,
      icon: UserPlus,
    },
    {
      title: "Total Channels",
      value: totalChannels,
      icon: Tv,
    },
  ];

  return (
    <main className="min-h-screen bg-light-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* -------------------------------------------------
            Header
        ------------------------------------------------- */}

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Sellers
          </h1>

          <p className="mt-2 text-secondary">
            Manage NiceConvo sellers and their channels.
          </p>
        </div>

        {/* -------------------------------------------------
            Stats
        ------------------------------------------------- */}

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

        {/* -------------------------------------------------
            Filters
        ------------------------------------------------- */}

        <div className="mt-8 rounded-xl border border-border bg-background p-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              placeholder="Search sellers..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
            />
          </div>
        </div>

        {/* -------------------------------------------------
            Sellers Table
        ------------------------------------------------- */}

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">

          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              All Sellers
            </h2>

            <p className="mt-1 text-sm text-muted">
              Sellers currently registered on NiceConvo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-border text-left">

                  <th className="px-6 py-3 font-medium text-secondary">
                    Seller
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Country
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Channels
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Joined
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {sellers && sellers.length > 0 ? (
                  sellers.map((seller) => {
                    const name = getProfileName(seller);

                    const channelCount =
                      channelCountBySeller.get(seller.id) ?? 0;

                    return (
                      <tr
                        key={seller.id}
                        className="border-b border-border last:border-0"
                      >

                        {/* Seller */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {seller.avatar_url ? (
                              <img
                                src={seller.avatar_url}
                                alt={name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted-bg text-sm font-medium text-secondary">
                                {getInitials(name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {name}
                              </p>

                              {seller.username && (
                                <p className="mt-0.5 truncate text-xs text-muted">
                                  @{seller.username}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* Country */}
                        <td className="px-6 py-4 text-secondary">
                          {seller.country || "—"}
                        </td>

                        {/* Channels */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                            {channelCount}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-muted">
                          {formatTimeAgo(seller.created_at)}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/sellers/${seller.id}`}
                            className="text-sm font-medium text-secondary hover:text-foreground"
                          >
                            View
                          </Link>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-muted"
                    >
                      No sellers found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        </div>

      </div>
    </main>
  );
}