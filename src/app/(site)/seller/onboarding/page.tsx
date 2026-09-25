import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

    const cookieStore = await cookies();
    const locale = cookieStore.get("niceconvo_locale")?.value || "en";

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

  const rawTranslations = await getTranslations(
  [
    // Profile / onboarding
    "profile.basic_details",
    "profile.basic_details_description",
    "profile.languages",
    "profile.languages_description",
    "profile.social_links",
    "profile.social_links_description",

    "profile.change_photo",
    "profile.uploading",
    "profile.image_formats",
    "profile.max_file_size",

    "profile.display_name",
    "profile.display_name_required",
    "profile.username",
    "profile.username_locked_description",
    "profile.country",
    "profile.country_placeholder",
    "profile.date_of_birth",
    "profile.gender",
    "profile.select_gender",
    "profile.gender_female",
    "profile.gender_male",
    "profile.bio",
    "profile.bio_placeholder",

    "profile.language",
    "profile.proficiency",
    "profile.native",
    "profile.native_language",
    "profile.remove_language",
    "profile.no_languages",
    "profile.add_language",

    "profile.proficiency_beginner",
    "profile.proficiency_intermediate",
    "profile.proficiency_advanced",
    "profile.proficiency_fluent",

    "profile.platform",
    "profile.profile",
    "profile.remove_social_link",
    "profile.no_social_links",
    "profile.add_link",
    "profile.your_username",

    "profile.skip_for_now",
    "profile.back",
    "profile.continue",
    "profile.saving",

    "profile.max_file_size_error",
    "profile.invalid_image_type",
    "profile.photo_upload_error",
    "profile.save_profile_error",
    "profile.save_languages_error",
    "profile.save_social_links_error",

    // Seller / payout
    "seller.become.title",
    "seller.become.description",
    "seller.payout",
    "seller.payout_description",
    "seller.stripe",
    "seller.stripe_recommended",
    "seller.stripe_description",
    "seller.connect_stripe",
    "seller.connecting",
    "seller.paypal",
    "seller.paypal_description",
    "seller.paypal_email",
    "seller.bank_account",
    "seller.bank_account_description",
    "seller.account_holder_name",
    "seller.bank_name",
    "seller.account_number",
    "seller.iban",
    "seller.swift_code",
    "seller.account_holder_name_placeholder",
    "seller.bank_name_placeholder",
    "seller.account_number_placeholder",
    "seller.iban_placeholder",
    "seller.swift_code_placeholder",
    "seller.save_continue",
    "seller.paypal_email_required",
    "seller.bank_details_required",
    "seller.payout_error",
    "seller.stripe_connect_error",
  ],
  locale
);

const translations: SellerOnboardingDialogTranslations = {
  // Profile / onboarding
  basic_details: rawTranslations["profile.basic_details"],
  basic_details_description:
    rawTranslations["profile.basic_details_description"],
  languages: rawTranslations["profile.languages"],
  languages_description:
    rawTranslations["profile.languages_description"],
  social_links: rawTranslations["profile.social_links"],
  social_links_description:
    rawTranslations["profile.social_links_description"],

  change_photo: rawTranslations["profile.change_photo"],
  uploading: rawTranslations["profile.uploading"],
  image_formats: rawTranslations["profile.image_formats"],
  max_file_size: rawTranslations["profile.max_file_size"],

  display_name: rawTranslations["profile.display_name"],
  display_name_required:
    rawTranslations["profile.display_name_required"],
  username: rawTranslations["profile.username"],
  username_locked_description:
    rawTranslations["profile.username_locked_description"],
  country: rawTranslations["profile.country"],
  country_placeholder:
    rawTranslations["profile.country_placeholder"],
  date_of_birth: rawTranslations["profile.date_of_birth"],
  gender: rawTranslations["profile.gender"],
  select_gender: rawTranslations["profile.select_gender"],
  gender_female: rawTranslations["profile.gender_female"],
  gender_male: rawTranslations["profile.gender_male"],
  bio: rawTranslations["profile.bio"],
  bio_placeholder: rawTranslations["profile.bio_placeholder"],

  language: rawTranslations["profile.language"],
  proficiency: rawTranslations["profile.proficiency"],
  native: rawTranslations["profile.native"],
  native_language: rawTranslations["profile.native_language"],
  remove_language: rawTranslations["profile.remove_language"],
  no_languages: rawTranslations["profile.no_languages"],
  add_language: rawTranslations["profile.add_language"],

  proficiency_beginner:
    rawTranslations["profile.proficiency_beginner"],
  proficiency_intermediate:
    rawTranslations["profile.proficiency_intermediate"],
  proficiency_advanced:
    rawTranslations["profile.proficiency_advanced"],
  proficiency_fluent:
    rawTranslations["profile.proficiency_fluent"],

  platform: rawTranslations["profile.platform"],
  profile: rawTranslations["profile.profile"],
  remove_social_link:
    rawTranslations["profile.remove_social_link"],
  no_social_links:
    rawTranslations["profile.no_social_links"],
  add_link: rawTranslations["profile.add_link"],
  your_username: rawTranslations["profile.your_username"],

  skip_for_now: rawTranslations["profile.skip_for_now"],
  back: rawTranslations["profile.back"],
  continue: rawTranslations["profile.continue"],
  saving: rawTranslations["profile.saving"],

  max_file_size_error:
    rawTranslations["profile.max_file_size_error"],
  invalid_image_type:
    rawTranslations["profile.invalid_image_type"],
  photo_upload_error:
    rawTranslations["profile.photo_upload_error"],
  save_profile_error:
    rawTranslations["profile.save_profile_error"],
  save_languages_error:
    rawTranslations["profile.save_languages_error"],
  save_social_links_error:
    rawTranslations["profile.save_social_links_error"],

  // Seller / payout
  become_a_seller:
    rawTranslations["seller.become.title"],
  become_a_seller_description:
    rawTranslations["seller.become.description"],
  payout: rawTranslations["seller.payout"],
  payout_description:
    rawTranslations["seller.payout_description"],
  stripe: rawTranslations["seller.stripe"],
  stripe_recommended:
    rawTranslations["seller.stripe_recommended"],
  stripe_description:
    rawTranslations["seller.stripe_description"],
  connect_stripe:
    rawTranslations["seller.connect_stripe"],
  connecting: rawTranslations["seller.connecting"],
  paypal: rawTranslations["seller.paypal"],
  paypal_description:
    rawTranslations["seller.paypal_description"],
  paypal_email: rawTranslations["seller.paypal_email"],
  bank_account: rawTranslations["seller.bank_account"],
  bank_account_description:
    rawTranslations["seller.bank_account_description"],
  account_holder_name:
    rawTranslations["seller.account_holder_name"],
  bank_name: rawTranslations["seller.bank_name"],
  account_number: rawTranslations["seller.account_number"],
  iban: rawTranslations["seller.iban"],
  swift_code: rawTranslations["seller.swift_code"],
  account_holder_name_placeholder:
    rawTranslations["seller.account_holder_name_placeholder"],
  bank_name_placeholder:
    rawTranslations["seller.bank_name_placeholder"],
  account_number_placeholder:
    rawTranslations["seller.account_number_placeholder"],
  iban_placeholder:
    rawTranslations["seller.iban_placeholder"],
  swift_code_placeholder:
    rawTranslations["seller.swift_code_placeholder"],
  save_continue:
    rawTranslations["seller.save_continue"],
  paypal_email_required:
    rawTranslations["seller.paypal_email_required"],
  bank_details_required:
    rawTranslations["seller.bank_details_required"],
  payout_error:
    rawTranslations["seller.payout_error"],
  stripe_connect_error:
    rawTranslations["seller.stripe_connect_error"],
};

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