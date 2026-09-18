import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const { data: locales } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const translationKeys = [
    "search.search_placeholder",
    "auth.login",
    "auth.sign_up",
  ];

  const translations = await getTranslations(
    translationKeys,
    locale
  );

  return (
    <NavbarClient
      locales={locales ?? []}
      user={user}
      translations={{
        searchPlaceholder:
          translations["search.search_placeholder"],
        login: translations["auth.login"],
        signUp: translations["auth.sign_up"],
      }}
    />
  );
}