import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();

  const { data: locales } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <NavbarClient
      locales={locales ?? []}
      user={user}
    />
  );
}