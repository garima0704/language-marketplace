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

    // User menu 
    "nav.notifications", 
    "nav.unread_notifications", 
    "nav.loading", 
    "nav.user", 
    "nav.my_profile", 
    "nav.settings", 
    "nav.sign_out",
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
          notifications: translations["nav.notifications"], 
          unreadNotifications: translations["nav.unread_notifications"], 
          loading: translations["nav.loading"], 
          user: translations["nav.user"], 
          myProfile: translations["nav.my_profile"], 
          settings: translations["nav.settings"], 
          signOut: translations["nav.sign_out"], }}
    />
  );
}