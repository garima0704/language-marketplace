import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import SellerOnboardingDialog, {
  type SellerOnboardingDialogTranslations,
} from "@/components/seller/SellerOnboardingDialog";

export default async function SellerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * ---------------------------------------------------------
   * Profile
   * ---------------------------------------------------------
   */

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      country,
      date_of_birth,
      gender,
      is_creator
    `)
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile");
  }

  /*
   * Already a seller.
   */

  if (profile.is_creator) {
    redirect("/seller/dashboard");
  }

  /*
   * ---------------------------------------------------------
   * Existing languages
   * ---------------------------------------------------------
   *
   * These are the SAME languages used by Profile Onboarding.
   */

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

  const normalizedLanguages =
    languages?.map((language) => ({
      ...language,
      locales: Array.isArray(language.locales)
        ? language.locales[0] ?? null
        : language.locales,
    })) ?? [];

  /*
   * ---------------------------------------------------------
   * Available languages
   * ---------------------------------------------------------
   */

  const { data: availableLanguages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  /*
   * ---------------------------------------------------------
   * Existing social links
   * ---------------------------------------------------------
   */

  const { data: socialLinks } = await supabase
    .from("profile_social_links")
    .select(`
      id,
      platform,
      url
    `)
    .eq("profile_id", user.id)
    .order("id");

  /*
   * ---------------------------------------------------------
   * Available social platforms
   * ---------------------------------------------------------
   */

  const { data: availablePlatforms } = await supabase
    .from("social_platforms")
    .select(`
      id,
      name,
      slug,
      url_prefix,
      placeholder
    `)
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  /*
   * ---------------------------------------------------------
   * Translations
   * ---------------------------------------------------------
   * 
   * First three steps reuse the existing profile translation
   * keys.
   *
   * Seller-specific payout strings are added to the same
   * translation object.
   */

  const translations = (await getTranslations(
    [
      "basic_details",
      "basic_details_description",
      "languages",
      "languages_description",
      "social_links",
      "social_links_description",

      "change_photo",
      "uploading",
      "image_formats",
      "max_file_size",

      "display_name",
      "display_name_required",
      "username",
      "username_locked_description",
      "country",
      "country_placeholder",
      "date_of_birth",
      "gender",
      "select_gender",
      "gender_female",
      "gender_male",
      "bio",
      "bio_placeholder",

      "language",
      "proficiency",
      "native",
      "native_language",
      "remove_language",
      "no_languages",
      "add_language",

      "proficiency_beginner",
      "proficiency_intermediate",
      "proficiency_advanced",
      "proficiency_fluent",

      "platform",
      "profile",
      "remove_social_link",
      "no_social_links",
      "add_link",
      "your_username",

      "skip_for_now",
      "back",
      "continue",
      "saving",

      "max_file_size_error",
      "invalid_image_type",
      "photo_upload_error",
      "save_profile_error",
      "save_languages_error",
      "save_social_links_error",

      /*
       * Seller / payout
       */

      "become_a_seller",
      "become_a_seller_description",
      "payout",
      "payout_description",
      "stripe",
      "stripe_recommended",
      "stripe_description",
      "connect_stripe",
      "connecting",
      "paypal",
      "paypal_description",
      "paypal_email",
      "bank_account",
      "bank_account_description",
      "account_holder_name",
      "bank_name",
      "account_number",
      "iban",
      "swift_code",
      "account_holder_name_placeholder",
      "bank_name_placeholder",
      "account_number_placeholder",
      "iban_placeholder",
      "swift_code_placeholder",
      "save_continue",
      "paypal_email_required",
      "bank_details_required",
      "payout_error",
      "stripe_connect_error",
    ],
    "seller"
  )) as unknown as SellerOnboardingDialogTranslations;

  return (
    <SellerOnboardingDialog
      open={true}
      onOpenChange={() => {
        // The page itself owns the initial open state.
      }}
      profile={profile}
      languages={normalizedLanguages}
      availableLanguages={availableLanguages ?? []}
      socialLinks={socialLinks ?? []}
      availablePlatforms={availablePlatforms ?? []}
      translations={translations}
    />
  );
}