import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import UsersHeader from "@/components/admin/users/UsersHeader";
import UserList from "@/components/admin/users/UserList";

export default async function AdminUsersPage() {
  await requireAdmin();

  const supabase = await createClient();

  // --------------------------------------------------
  // User statistics
  // --------------------------------------------------

  const [
    usersResult,
    activeUsersResult,
    sellersResult,
    buyersResult,
  ] = await Promise.all([
    // Total users
    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "user"),

    // Active users
    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "user")
      .eq("account_status", "active"),

    // Sellers
    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "user")
      .eq("is_creator", true),

    // Buyers
    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "user")
      .eq("is_creator", false),
  ]);

  // --------------------------------------------------
  // Fetch users
  // --------------------------------------------------

  const {
    data: users,
    error: usersError,
  } = await supabase
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
        account_status,
        created_at
      `
    )
    .eq("role", "user")
    .order("created_at", {
      ascending: false,
    });

  if (usersError) {
    console.error("USERS ERROR:", {
      code: usersError.code,
      message: usersError.message,
      details: usersError.details,
      hint: usersError.hint,
    });

    throw new Error(
      usersError.message || "Failed to load users."
    );
  }

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const stats = {
    totalUsers: usersResult.count ?? 0,
    activeUsers: activeUsersResult.count ?? 0,
    sellers: sellersResult.count ?? 0,
    buyers: buyersResult.count ?? 0,
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <UsersHeader stats={stats} />

        <UserList users={users ?? []} />
      </div>
    </div>
  );
}