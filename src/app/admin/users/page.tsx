import Link from "next/link";
import {
  Users,
  UserCheck,
  UserRound,
  ShieldCheck,
  Search,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  formatTimeAgo,
  getProfileName,
  getInitials,
} from "@/lib/utils";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // User statistics
  // ---------------------------------------------------------

  const [
    usersResult,
    sellersResult,
    buyersResult,
    adminsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_creator", true),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "buyer"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
  ]);

  // ---------------------------------------------------------
  // Users
  // ---------------------------------------------------------

  const { data: users } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(50);

  const stats = [
    {
      title: "Total Users",
      value: usersResult.count ?? 0,
      icon: Users,
    },
    {
      title: "Sellers",
      value: sellersResult.count ?? 0,
      icon: UserCheck,
    },
    {
      title: "Buyers",
      value: buyersResult.count ?? 0,
      icon: UserRound,
    },
    {
      title: "Admins",
      value: adminsResult.count ?? 0,
      icon: ShieldCheck,
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
            Users
          </h1>

          <p className="mt-2 text-secondary">
            Manage NiceConvo users and their account roles.
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="search"
                placeholder="Search users..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-foreground"
              />
            </div>

            {/* Role filter */}
            <select
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              defaultValue="all"
            >
              <option value="all">
                All users
              </option>

              <option value="buyer">
                Buyers
              </option>

              <option value="seller">
                Sellers
              </option>

              <option value="admin">
                Admins
              </option>
            </select>
          </div>
        </div>

        {/* -------------------------------------------------
            Users Table
        ------------------------------------------------- */}

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">

          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-foreground">
              All Users
            </h2>

            <p className="mt-1 text-sm text-muted">
              Recently registered NiceConvo accounts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 font-medium text-secondary">
                    User
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Country
                  </th>

                  <th className="px-6 py-3 font-medium text-secondary">
                    Account Type
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
                {users && users.length > 0 ? (
                  users.map((user) => {
                    const name = getProfileName(user);

                    const accountType =
                      user.role === "admin"
                        ? "Admin"
                        : user.is_creator
                          ? "Seller"
                          : "Buyer";

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-0"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
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

                              {user.username && (
                                <p className="mt-0.5 truncate text-xs text-muted">
                                  @{user.username}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* Country */}
                        <td className="px-6 py-4 text-secondary">
                          {user.country || "—"}
                        </td>

                        {/* Account Type */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                            {accountType}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-muted">
                          {formatTimeAgo(user.created_at)}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/users/${user.id}`}
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
                      No users found.
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