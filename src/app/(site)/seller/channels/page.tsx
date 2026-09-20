import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getSellerChannels } from "@/lib/channels/getSellerChannels";
import { getTranslations } from "@/lib/translations";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChannelCard from "@/components/channels/ChannelCard";

export default async function SellerChannelsPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

  // --------------------------------------------------
  // TRANSLATIONS
  // --------------------------------------------------

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "seller_channels.title",
      "seller_channels.description",
      "seller_channels.create_channel",
      "seller_channels.no_channels",
      "seller_channels.no_channels_description",
    ],
    locale
  );

  // --------------------------------------------------
  // CHANNELS
  // --------------------------------------------------

  const channelStats = await getSellerChannels(user.id);

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {translations["seller_channels.title"] ??
              "My Channels"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {translations["seller_channels.description"] ??
              "Create and manage your language channels."}
          </p>
        </div>

        <Link href="/seller/channels/new">
          <Button>
            {translations["seller_channels.create_channel"] ??
              "Create Channel"}
          </Button>
        </Link>
      </div>

      {/* Channels */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {channelStats.length > 0 ? (
          channelStats.map((channel) => (
            <div key={channel.id} className="space-y-3">
              <ChannelCard
                channel={channel}
                variant="seller-management"
                showActions={true}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="rounded-xl border-dashed">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-semibold">
                  {translations["seller_channels.no_channels"] ??
                    "No channels yet"}
                </h3>

                <p className="mt-2 text-muted-foreground">
                  {translations[
                    "seller_channels.no_channels_description"
                  ] ??
                    "Create your first channel to start sharing language lessons."}
                </p>

                <div className="mt-6">
                  <Link href="/seller/channels/new">
                    <Button>
                      {translations[
                        "seller_channels.create_channel"
                      ] ?? "Create Channel"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}