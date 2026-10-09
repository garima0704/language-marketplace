import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSellerChannels } from "@/lib/channels/getSellerChannels";
import { createClient } from "@/lib/supabase/server";

import BasicDetailsSection from "@/components/profile/BasicDetailsSection";
import LanguagesSection from "@/components/profile/LanguagesSection";
import SocialLinksSection from "@/components/profile/SocialLinksSection";
import ChannelCard from "@/components/channels/ChannelCard";

type PayoutMethodType = "stripe" | "paypal" | "bank";

type PayoutAccount = {
  id: string;
  provider: PayoutMethodType;
  paypal_email: string | null;
  account_holder_name: string | null;
  bank_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  is_default: boolean;
  status: string;
};

const basicDetailsTranslations = {
  edit_profile: "Edit Profile",
  bio: "Bio",
  no_bio: "No bio added.",
  years_old: "years old",
  creator: "Creator",

  edit_basic_details: "Edit Basic Details",
  change_photo: "Change Photo",
  uploading: "Uploading...",
  image_formats: "JPG, PNG or WEBP",
  max_file_size: "Maximum file size: 5MB",

  display_name: "Display Name",
  display_name_required: "Display name is required.",

  username: "Username",
  username_locked_description:
    "Username cannot be changed here.",

  country: "Country",
  country_placeholder: "Enter your country",

  date_of_birth: "Date of Birth",

  gender: "Gender",
  select_gender: "Select gender",
  gender_female: "Female",
  gender_male: "Male",

  bio_placeholder: "Tell us about yourself",

  cancel: "Cancel",
  saving: "Saving...",
  save_changes: "Save Changes",

  max_file_size_error:
    "The image must be smaller than 5MB.",
  invalid_image_type:
    "Please upload a valid image.",
  photo_upload_error:
    "Unable to upload photo.",
};

const languagesTranslations = {
  title: "Languages",
  description:
    "Languages and proficiency levels.",
  edit_languages: "Edit Languages",
  language: "Language",
  proficiency: "Proficiency",
  native: "Native",
  no_languages: "No languages added.",

  dialog_title: "Edit Languages",
  dialog_description:
    "Manage your languages and proficiency.",
  native_language: "Native Language",
  remove_language: "Remove",
  no_languages_dialog: "No languages added.",
  add_language: "Add Language",
  cancel: "Cancel",
  saving: "Saving...",
  save_changes: "Save Changes",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  fluent: "Fluent",
  save_error: "Unable to save languages.",
};

const socialTranslations = {
  title: "Social Links",
  description:
    "Social media profiles connected to this account.",
  edit_social_links: "Edit Social Links",
  platform: "Platform",
  profile: "Profile",
  no_social_links: "No social links added.",
};

function formatStatus(status: string | null) {
  if (!status) return "—";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatProvider(provider: PayoutMethodType) {
  if (provider === "paypal") {
    return "PayPal";
  }

  if (provider === "bank") {
    return "Bank Account";
  }

  return "Stripe";
}

function maskAccountNumber(accountNumber: string | null) {
  if (!accountNumber) return "—";

  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `••••••••${accountNumber.slice(-4)}`;
}

export default async function AdminUserViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: profile, error: profileError } =
    await supabase
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
        is_creator,
        account_status,
        created_at
      `)
      .eq("id", id)
      .single();

  if (profileError || !profile) {
    notFound();
  }

  const [
    authUserResult,
    languagesResult,
    localesResult,
    socialLinksResult,
    socialPlatformsResult,
  ] = await Promise.all([
    adminClient.auth.admin.getUserById(id),

    adminClient
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
      .eq("profile_id", id)
      .order("is_native", { ascending: false }),

    supabase
      .from("locales")
      .select("code, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    adminClient
      .from("profile_social_links")
      .select("id, platform, url")
      .eq("profile_id", id)
      .order("id", { ascending: true }),

    supabase
      .from("social_platforms")
      .select(
        "id, name, slug, url_prefix, placeholder"
      )
      .eq("is_active", true)
      .order("id", { ascending: true }),
  ]);

  const { data: subscriptions } = await supabase
  .from("subscriptions")
  .select(`
    id,
    status,
    current_period_end,
    subscription_price,
    channel_id
  `)
  .eq("buyer_id", id)
  .eq("status", "active");

  const rawLanguages = languagesResult.data ?? [];

  const languages = rawLanguages.map((language) => {
    const localeValue = Array.isArray(language.locales)
      ? language.locales[0] ?? null
      : language.locales ?? null;

    return {
      id: language.id,
      language_code: language.language_code,
      proficiency: language.proficiency,
      is_native: language.is_native,
      locales: localeValue,
    };
  });

  const availableLanguages = localesResult.data ?? [];

  const socialLinks = socialLinksResult.data ?? [];
  const availablePlatforms = socialPlatformsResult.data ?? [];

  const subscriptionChannelIds = subscriptions.map(
    (subscription) => subscription.channel_id
  );

  const { data: subscribedChannels } =
    subscriptionChannelIds.length > 0
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
          .in("id", subscriptionChannelIds)
      : { data: [] };

  const subscribedChannelMap = new Map(
    (subscribedChannels ?? []).map((channel) => [
      channel.id,
      channel,
    ])
  );

  let channels: Awaited<
    ReturnType<typeof getSellerChannels>
  > = [];

  let payoutAccounts: PayoutAccount[] = [];

  if (profile.is_creator) {
    channels = await getSellerChannels(profile.id);

    const { data: payoutData } = await supabase
      .from("creator_payout_accounts")
      .select(`
        id,
        provider,
        paypal_email,
        account_holder_name,
        bank_name,
        account_number,
        iban,
        swift_code,
        is_default,
        status
      `)
      .eq("user_id", profile.id)
      .order("is_default", { ascending: false });

    payoutAccounts = (payoutData ?? []) as PayoutAccount[];
  }

  const email =
    authUserResult.data.user?.email ?? "—";

  const accountType = profile.is_creator
    ? "Creator"
    : "Buyer";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                User Details
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                View the complete details for this user.
              </p>
            </div>

            {profile.is_creator && (
            <Link
                href={`/sellers/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
              >
                View Public Profile
              </Link>
              )}
            </div>
          </div>

        {/* Basic Details */}
        <BasicDetailsSection
          profile={profile}
          translations={basicDetailsTranslations}
          readOnly
        />

        {/* Account */}
        <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Account
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Account and access information.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Email
              </p>

              <p className="mt-1 text-sm font-medium">
                {email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Account Type
              </p>

              <p className="mt-1 text-sm font-medium">
                {accountType}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Account Status
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatStatus(profile.account_status)}
              </p>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="mt-6">
          <LanguagesSection
            profileId={profile.id}
            languages={languages}
            availableLanguages={availableLanguages}
            translations={languagesTranslations}
            readOnly
          />
        </div>

        {/* Social Links */}
        <div className="mt-6">
          <SocialLinksSection
            profileId={profile.id}
            socialLinks={socialLinks}
            availablePlatforms={availablePlatforms}
            translations={socialTranslations}
            readOnly
          />
        </div>


        {/* Subscriptions */}
        <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">
              Subscriptions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Channels this user is currently subscribed to.
            </p>
          </div>

          {subscriptions.length > 0 ? (
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              {subscriptions.map((subscription) => {
                const channel = subscribedChannelMap.get(
                  subscription.channel_id
                );

                if (!channel) return null;

                const creator = Array.isArray(channel.profiles)
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
                    seller={creator}
                    variant="subscription"
                    subscription={{
                      id: subscription.id,
                      current_period_end:
                        subscription.current_period_end,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No active subscriptions.
              </p>
            </div>
          )}
        </div>

        {/* Creator */}
        {profile.is_creator && (
          <>
            {/* Channels */}
            <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">
                  Channels
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Channels created by this creator.
                </p>
              </div>

              {channels.length > 0 ? (
                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  {channels.map((channel) => (
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
                      variant="seller-public"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No channels yet.
                  </p>
                </div>
              )}
            </div>

            {/* Payout Details */}
            <div className="mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold">
                  Payout Details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Payout methods saved by this creator.
                </p>
              </div>

              {payoutAccounts.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {payoutAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="rounded-xl border border-border p-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-sm font-semibold">
                          {formatProvider(
                            account.provider
                          )}
                        </h3>

                        <div className="flex items-center gap-2">
                          {account.is_default && (
                            <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium">
                              Default
                            </span>
                          )}

                          <span className="rounded-full bg-muted-bg px-3 py-1 text-xs font-medium">
                            {formatStatus(account.status)}
                          </span>
                        </div>
                      </div>

                      {account.provider ===
                        "stripe" && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            Stripe account connection status
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {account.status ===
                            "active"
                              ? "Connected"
                              : formatStatus(
                                  account.status
                                )}
                          </p>
                        </div>
                      )}

                      {account.provider ===
                        "paypal" && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            PayPal Email
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {account.paypal_email ??
                              "—"}
                          </p>
                        </div>
                      )}

                      {account.provider === "bank" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Account Holder Name
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {account.account_holder_name ??
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Bank Name
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {account.bank_name ?? "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Account Number
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {maskAccountNumber(
                                account.account_number
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              IBAN
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {account.iban ?? "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              SWIFT Code
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {account.swift_code ?? "—"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No payout details have been added.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}