import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import SellerOnboarding from "@/components/seller/SellerOnboarding";

export default async function SellerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Already a seller — don't show onboarding again
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (profile?.is_creator) {
    redirect("/seller/dashboard");
  }

  // Get the user's existing languages
  const { data: languages } = await supabase
    .from("profile_languages")
    .select(`
      id,
      language_code,
      proficiency,
      is_native,
      locales (
        code,
        name
      )
    `)
    .eq("profile_id", user.id)
    .order("is_native", { ascending: false });

  // Get available languages
  const { data: availableLanguages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  return (
    <SellerOnboarding
      languages={languages ?? []}
      availableLanguages={availableLanguages ?? []}
    />
  );
}