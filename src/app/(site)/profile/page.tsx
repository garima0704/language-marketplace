import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
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
        <p>Profile not found.</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Languages
  // --------------------------------------------------

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
  // Seller Channels
  // --------------------------------------------------

  const channels = profile.is_creator
    ? await getSellerChannels(user.id)
    : [];

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Basic Details */}
      <BasicDetailsSection profile={profile} />

      {/* Languages */}
      <LanguagesSection
        profileId={profile.id}
        languages={languages ?? []}
        availableLanguages={availableLanguages ?? []}
      />

      {/* Social Links */}
      <SocialLinksSection
        profileId={profile.id}
        socialLinks={socialLinks ?? []}
      />

      {/* Become Seller */}
      {!profile.is_creator && (
        <Card className="rounded-2xl shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">
              Become a Seller
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Share your language knowledge, create your own
              channels, upload videos, and earn from your subscribers.
            </p>

            <StartSellingButton
              profile={{
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                country: profile.country,
              }}
              languages={languages ?? []}
              availableLanguages={availableLanguages ?? []}
            />
          </div>
        </Card>
      )}

      {/* Seller Channels */}
      {profile.is_creator && (
        <Card className="rounded-2xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                My Channels
              </h2>

              <Link href="/seller/channels/new">
                <Button>
                  Create Channel
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
                      display_name: profile.display_name,
                      avatar_url: profile.avatar_url,
                    }}
                    variant="seller"
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  You haven't created any channels yet.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}