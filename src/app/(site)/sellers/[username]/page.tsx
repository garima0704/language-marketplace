import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getSellerChannels } from "@/lib/channels/getSellerChannels";
import { getTranslations } from "@/lib/translations";

import ChannelCard from "@/components/channels/ChannelCard";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();

  // =========================================================
  // CURRENT UI LANGUAGE
  // =========================================================

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  const translations = await getTranslations(
    [
      "seller_profile.channels",
    ],
    locale
  );

  // =========================================================
  // GET SELLER
  // =========================================================

  const { data: seller, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      country
    `)
    .eq("username", username)
    .eq("is_creator", true)
    .single();

  if (error || !seller) {
    notFound();
  }

  // =========================================================
  // GET SELLER CHANNELS + STATS
  // =========================================================

  const channelStats =
    await getSellerChannels(seller.id);

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="p-8">

      {/* =======================================================
          SELLER HEADER
      ======================================================== */}

      <div className="rounded-xl border border-border bg-background p-8 shadow-sm">

        <div className="flex items-center gap-5">

          {seller.avatar_url ? (
            <img
              src={seller.avatar_url}
              alt={seller.display_name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-full
                bg-muted-bg
                text-3xl
                font-semibold
                text-muted
              "
            >
              {seller.display_name
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {seller.display_name}
            </h1>

            <p className="text-muted-foreground">
              @{seller.username}
            </p>

            {seller.country && (
              <p className="mt-1 text-sm text-muted-foreground">
                {seller.country}
              </p>
            )}
          </div>

        </div>

        {seller.bio && (
          <p className="mt-6 max-w-3xl text-muted-foreground">
            {seller.bio}
          </p>
        )}

      </div>

      {/* =======================================================
          CHANNELS
      ======================================================== */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold text-foreground">
          {translations["seller_profile.channels"] ??
            "Channels"}
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {channelStats.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              seller={{
                username: seller.username,
                display_name: seller.display_name,
                avatar_url: seller.avatar_url,
              }}
              variant="seller"
            />
          ))}

        </div>

      </div>

    </div>
  );
}