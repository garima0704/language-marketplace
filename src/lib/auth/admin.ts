import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, username, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return {
    user,
    profile,
    supabase,
  };
}