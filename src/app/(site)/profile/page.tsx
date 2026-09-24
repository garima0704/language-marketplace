import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";
import { getSellerChannels } from "@/lib/channels/getSellerChannels";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import BasicDetailsSection from "@/components/profile/BasicDetailsSection";
import LanguagesSection from "@/components/profile/LanguagesSection";
import SocialLinksSection from "@/components/profile/SocialLinksSection";
import ChannelCard from "@/components/channels/ChannelCard";
import StartSellingButton from "@/components/seller/StartSellingButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "profile.not_found",

      "profile.edit_profile",
      "profile.bio",
      "profile.no_bio",
      "profile.years_old",
      "profile.creator",

      "profile.edit_basic_details",
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
      "profile.bio_placeholder",
      "profile.cancel",
      "profile.saving",
      "profile.save_changes",
      "profile.max_file_size_error",
      "profile.invalid_image_type",
      "profile.photo_upload_error",

      "profile.become_seller",
      "profile.become_seller_description",

      "profile.my_channels",
      "profile.create_channel",
      "profile.no_channels",

      "profile.my_subscriptions",
      "profile.no_subscriptions",

      "profile.languages",
      "profile.languages_description",
      "profile.edit_languages",
      "profile.language",
      "profile.proficiency",
      "profile.native",
      "profile.no_languages",

      "profile.edit_languages_description",
      "profile.native_language",
      "profile.remove_language",
      "profile.no_languages_dialog",
      "profile.add_language",
      "profile.proficiency_beginner",
      "profile.proficiency_intermediate",
      "profile.proficiency_advanced",
      "profile.proficiency_fluent",
      "profile.save_languages_error",
      
      "profile.basic_details",
      "profile.basic_details_description",
      "profile.social_links",
      "profile.social_links_description",
      "profile.edit_social_links",
      "profile.platform",
      "profile.profile",
      "profile.no_social_links",

      "profile.start_selling",
      "profile.remove_social_link",
      "profile.add_link",
      "profile.your_username",
      "profile.skip_for_now",
      "profile.save_profile_error",

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
      "seller.save_continue",
      "seller.paypal_email_required",
      "seller.bank_details_required",
      "seller.payout_error",
      "seller.stripe_connect_error",
      "seller.account_holder_name_placeholder",
      "seller.bank_name_placeholder",
      "seller.account_number_placeholder",
      "seller.iban_placeholder",
      "seller.swift_code_placeholder",
    ],
    locale
  );

  // --------------------------------------------------
  // User
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // Profile
  // --------------------------------------------------

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="px-6 py-6">
        <p>
          {translations["profile.not_found"] ??
            "Profile not found."}
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Languages
  // --------------------------------------------------

  const { data: profileLanguages } = await supabase
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

  const languages = (profileLanguages ?? []).map((language) => ({
    id: language.id,
    language_code: language.language_code,
    proficiency: language.proficiency,
    is_native: language.is_native,
    locales: Array.isArray(language.locales)
      ? language.locales[0] ?? null
      : language.locales ?? null,
  }));

  // --------------------------------------------------
  // Available Languages
  // --------------------------------------------------

  const { data: availableLanguages } = await supabase
    .from("locales")
    .select("code, name")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  // --------------------------------------------------
  // Social Links
  // --------------------------------------------------

  const { data: socialLinks } = await supabase
    .from("profile_social_links")
    .select("*")
    .eq("profile_id", user.id)
    .order("platform");

  // --------------------------------------------------
  // Social Media Platforms
  // --------------------------------------------------

  const { data: availablePlatforms } = await supabase
    .from("social_platforms")
    .select(
      "id, name, slug, url_prefix, placeholder"
    )
    .eq("is_active", true)
    .order("display_order");

  // --------------------------------------------------
  // Seller Channels
  // --------------------------------------------------

  const channels = profile.is_creator
    ? await getSellerChannels(user.id)
    : [];

  // --------------------------------------------------
  // My Subscriptions
  // --------------------------------------------------

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      id,
      status,
      current_period_end,
      subscription_price,
      channel_id
    `)
    .eq("buyer_id", user.id)
    .eq("status", "active");

  // --------------------------------------------------
  // Subscribed Channel Details
  // --------------------------------------------------

  const channelIds = (subscriptions ?? []).map(
    (subscription) => subscription.channel_id
  );

  const { data: subscribedChannels } =
    channelIds.length > 0
      ? await supabase
          .from("channels")
          .select(`
            id,
            channel_name,
            slug,
            description,
            logo_url,
            banner_url,
            subscription_price,
            currency,
            profiles!channels_user_id_fkey (
              display_name,
              username,
              avatar_url
            )
          `)
          .in("id", channelIds)
      : { data: [] };

  const subscribedChannelMap = new Map(
    (subscribedChannels ?? []).map((channel) => [
      channel.id,
      channel,
    ])
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-6 px-6 py-6">

      {/* ==================================================
          BASIC DETAILS
      ================================================== */}

  <BasicDetailsSection
    profile={profile}
    translations={{
      edit_profile:
        translations["profile.edit_profile"] ??
        "Edit Profile",

      bio:
        translations["profile.bio"] ??
        "Bio",

      no_bio:
        translations["profile.no_bio"] ??
        "No bio added yet.",

      years_old:
        translations["profile.years_old"] ??
        "years old",

      creator:
        translations["profile.creator"] ??
        "Creator",

      edit_basic_details:
        translations["profile.edit_basic_details"] ??
        "Edit Basic Details",

      change_photo:
        translations["profile.change_photo"] ??
        "Change Photo",

      uploading:
        translations["profile.uploading"] ??
        "Uploading...",

      image_formats:
        translations["profile.image_formats"] ??
        "JPG, PNG or WebP",

      max_file_size:
        translations["profile.max_file_size"] ??
        "Maximum 5 MB",

      display_name:
        translations["profile.display_name"] ??
        "Display Name",

      display_name_required:
        translations["profile.display_name_required"] ??
        "Display name is required.",

      username:
        translations["profile.username"] ??
        "Username",

      username_locked_description:
        translations["profile.username_locked_description"] ??
        "Your username cannot be changed.",

      country:
        translations["profile.country"] ??
        "Country",

      country_placeholder:
        translations["profile.country_placeholder"] ??
        "e.g. India",

      date_of_birth:
        translations["profile.date_of_birth"] ??
        "Date of Birth",

      gender:
        translations["profile.gender"] ??
        "Gender",

      select_gender:
        translations["profile.select_gender"] ??
        "Select gender",

      gender_female:
        translations["profile.gender_female"] ??
        "Female",

      gender_male:
        translations["profile.gender_male"] ??
        "Male",

      bio_placeholder:
        translations["profile.bio_placeholder"] ??
        "Tell people a little about yourself...",

      cancel:
        translations["profile.cancel"] ??
        "Cancel",

      saving:
        translations["profile.saving"] ??
        "Saving...",

      save_changes:
        translations["profile.save_changes"] ??
        "Save Changes",

      max_file_size_error:
        translations["profile.max_file_size_error"] ??
        "Maximum file size is 5MB.",

      invalid_image_type:
        translations["profile.invalid_image_type"] ??
        "Only JPG, PNG and WebP files are allowed.",

      photo_upload_error:
        translations["profile.photo_upload_error"] ??
        "Failed to upload profile photo.",
    }}
  />

      {/* ==================================================
          LANGUAGES
      ================================================== */}

      <LanguagesSection
        profileId={profile.id}
        languages={languages ?? []}
        availableLanguages={availableLanguages ?? []}
        translations={{
          title:
            translations["profile.languages"] ??
            "Languages",

          description:
            translations["profile.languages_description"] ??
            "Languages you speak and your proficiency level.",

          edit_languages:
            translations["profile.edit_languages"] ??
            "Edit Languages",

          language:
            translations["profile.language"] ??
            "Language",

          proficiency:
            translations["profile.proficiency"] ??
            "Proficiency",

          native:
            translations["profile.native"] ??
            "Native",

          no_languages:
            translations["profile.no_languages"] ??
            "You haven't added any languages yet.",

          dialog_title:
            translations["profile.edit_languages"] ??
            "Edit Languages",

          dialog_description:
            translations["profile.edit_languages_description"] ??
            "Add the languages you speak and set your proficiency level.",

          native_language:
            translations["profile.native_language"] ??
            "Native language",

          remove_language:
            translations["profile.remove_language"] ??
            "Remove language",

          no_languages_dialog:
            translations["profile.no_languages_dialog"] ??
            "No languages added yet.",

          add_language:
            translations["profile.add_language"] ??
            "Add Language",

          cancel:
            translations["profile.cancel"] ??
            "Cancel",

          saving:
            translations["profile.saving"] ??
            "Saving...",

          save_changes:
            translations["profile.save_changes"] ??
            "Save Changes",

          beginner:
            translations["profile.proficiency_beginner"] ??
            "Beginner",

          intermediate:
            translations["profile.proficiency_intermediate"] ??
            "Intermediate",

          advanced:
            translations["profile.proficiency_advanced"] ??
            "Advanced",

          fluent:
            translations["profile.proficiency_fluent"] ??
            "Fluent",

          save_error:
            translations["profile.save_languages_error"] ??
            "Failed to save languages.",
        }}
      />

      {/* ==================================================
          SOCIAL LINKS
      ================================================== */}

      <SocialLinksSection
        profileId={profile.id}
        socialLinks={socialLinks ?? []}
        availablePlatforms={availablePlatforms ?? []}
        translations={{
          title:
            translations["profile.social_links"] ??
            "Social Links",
          description:
            translations["profile.social_links_description"] ??
            "Your social profiles and other online links.",
          edit_social_links:
            translations["profile.edit_social_links"] ??
            "Edit Social Links",
          platform:
            translations["profile.platform"] ??
            "Platform",
          profile:
            translations["profile.profile"] ??
            "Profile",
          no_social_links:
            translations["profile.no_social_links"] ??
            "You haven't added any social links yet.",
        }}
      />

      {/* ==================================================
          MY SUBSCRIPTIONS
          Same ChannelCard used on /subscriptions
      ================================================== */}

      <Card className="rounded-2xl shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold">
            {translations["profile.my_subscriptions"] ??
              "My Subscriptions"}
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((subscription) => {
                const channel =
                  subscribedChannelMap.get(
                    subscription.channel_id
                  );

                if (!channel) return null;

                const seller = Array.isArray(channel.profiles)
                  ? channel.profiles[0]
                  : channel.profiles;

                return (
                  <ChannelCard
                    key={subscription.id}
                    channel={{
                      id: channel.id,
                      channel_name: channel.channel_name,
                      slug: channel.slug,
                      description: channel.description,
                      logo_url: channel.logo_url,
                      banner_url: channel.banner_url,
                      subscription_price:
                        channel.subscription_price,
                      currency: channel.currency,
                    }}
                    seller={seller}
                    variant="subscription"
                    subscription={{
                      id: subscription.id,
                      current_period_end:
                        subscription.current_period_end,
                    }}
                  />
                );
              })
            ) : (
              <p className="text-muted-foreground">
                {translations["profile.no_subscriptions"] ??
                  "You haven't subscribed to any channels yet."}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ==================================================
          BECOME SELLER
          Only for users who are not creators
      ================================================== */}

      {!profile.is_creator && (
        <Card className="rounded-2xl shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">
              {translations["profile.become_seller"] ??
                "Become a Seller"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {translations[
                "profile.become_seller_description"
              ] ??
                "Share your language knowledge, create your own channels, upload videos, and earn from your subscribers."}
            </p>

            <StartSellingButton
  profile={{
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    country: profile.country,
    date_of_birth: profile.date_of_birth,
    gender: profile.gender,
  }}
  languages={languages ?? []}
  availableLanguages={availableLanguages ?? []}
  socialLinks={socialLinks ?? []}
  availablePlatforms={availablePlatforms ?? []}
  translations={{
    start_selling:
      translations["profile.start_selling"],

    basic_details:
      translations["profile.basic_details"],

    basic_details_description:
      translations["profile.basic_details_description"],

    languages:
      translations["profile.languages"],

    languages_description:
      translations["profile.languages_description"],

    social_links:
      translations["profile.social_links"],

    social_links_description:
      translations["profile.social_links_description"],

    change_photo:
      translations["profile.change_photo"],

    uploading:
      translations["profile.uploading"],

    image_formats:
      translations["profile.image_formats"],

    max_file_size:
      translations["profile.max_file_size"],

    display_name:
      translations["profile.display_name"],

    display_name_required:
      translations["profile.display_name_required"],

    username:
      translations["profile.username"],
    
    username_locked_description:
      translations["profile.username_locked_description"],

    country:
      translations["profile.country"],

    country_placeholder:
      translations["profile.country_placeholder"],

    date_of_birth:
      translations["profile.date_of_birth"],

    gender:
      translations["profile.gender"],

    select_gender:
      translations["profile.select_gender"],

    gender_female:
      translations["profile.gender_female"],

    gender_male:
      translations["profile.gender_male"],

    bio:
      translations["profile.bio"],

    bio_placeholder:
      translations["profile.bio_placeholder"],

    language:
      translations["profile.language"],

    proficiency:
      translations["profile.proficiency"],

    native:
      translations["profile.native"],

    native_language:
      translations["profile.native_language"],

    remove_language:
      translations["profile.remove_language"],

    no_languages:
      translations["profile.no_languages"],

    add_language:
      translations["profile.add_language"],

    proficiency_beginner:
      translations["profile.proficiency_beginner"],

    proficiency_intermediate:
      translations["profile.proficiency_intermediate"],

    proficiency_advanced:
      translations["profile.proficiency_advanced"],

    proficiency_fluent:
      translations["profile.proficiency_fluent"],

    platform:
      translations["profile.platform"],

    profile:
      translations["profile.profile"],

    remove_social_link:
      translations["profile.remove_social_link"],

    no_social_links:
      translations["profile.no_social_links"],

    add_link:
      translations["profile.add_link"],

    your_username:
      translations["profile.your_username"],

    skip_for_now:
      translations["profile.skip_for_now"],

    back:
      translations["profile.back"],

    continue:
      translations["profile.continue"],

    saving:
      translations["profile.saving"],

    max_file_size_error:
      translations["profile.max_file_size_error"],

    invalid_image_type:
      translations["profile.invalid_image_type"],

    photo_upload_error:
      translations["profile.photo_upload_error"],

    save_profile_error:
      translations["profile.save_profile_error"],

    save_languages_error:
      translations["profile.save_languages_error"],

    save_social_links_error:
      translations["profile.save_social_links_error"],
    
    become_a_seller: 
      translations["seller.become.title"],

    become_a_seller_description:
      translations["seller.become.description"],

    payout:
      translations["seller.payout"],

    payout_description:
      translations["seller.payout_description"],

    stripe:
      translations["seller.stripe"],

    stripe_recommended:
      translations["seller.stripe_recommended"],

    stripe_description:
      translations["seller.stripe_description"],

    connect_stripe:
      translations["seller.connect_stripe"],

    connecting:
      translations["seller.connecting"],

    paypal:
      translations["seller.paypal"],

    paypal_description:
      translations["seller.paypal_description"],

    paypal_email:
      translations["seller.paypal_email"],

    bank_account:
      translations["seller.bank_account"],

    bank_account_description:
      translations["seller.bank_account_description"],

    account_holder_name:
      translations["seller.account_holder_name"],

    bank_name:
      translations["seller.bank_name"],

    account_number:
      translations["seller.account_number"],

    iban:
      translations["seller.iban"],

    swift_code:
      translations["seller.swift_code"],

    save_continue:
      translations["seller.save_continue"],

    paypal_email_required:
      translations["seller.paypal_email_required"],

    bank_details_required:
      translations["seller.bank_details_required"],

    payout_error:
      translations["seller.payout_error"],

    stripe_connect_error:
      translations["seller.stripe_connect_error"],

    account_holder_name_placeholder:
      translations["seller.account_holder_name_placeholder"],
    
    bank_name_placeholder:
      translations["seller.bank_name_placeholder"],

    account_number_placeholder:
      translations["seller.account_number_placeholder"],

    iban_placeholder:
      translations["seller.iban_placeholder"],

    swift_code_placeholder:
      translations["seller.swift_code_placeholder"],
  }}
/>

</div>
        </Card>
      )}

      {/* ==================================================
          MY CHANNELS
          Only for creators
      ================================================== */}

      {profile.is_creator && (
        <Card className="rounded-2xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {translations["profile.my_channels"] ??
                  "My Channels"}
              </h2>

              <Link href="/seller/channels/new">
                <Button>
                  {translations["profile.create_channel"] ??
                    "Create Channel"}
                </Button>
              </Link>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {channels.length ? (
                channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    seller={{
                      username: profile.username,
                      display_name:
                        profile.display_name,
                      avatar_url:
                        profile.avatar_url,
                    }}
                    variant="seller-management"
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  {translations["profile.no_channels"] ??
                    "You haven't created any channels yet."}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}