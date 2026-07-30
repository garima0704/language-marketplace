// app/actions/seller.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function becomeSeller() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_creator: true,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/profile");
}