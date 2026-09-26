import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/translations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChannelCard from "@/components/channels/ChannelCard";

type SubscriptionsPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const supabase = await createClient();

  // =========================================================
  // LOCALE
  // =========================================================

  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  const translations = await getTranslations(
    [
      "subscriptions.title",
      "subscriptions.description",

      // Existing empty-state translations
      "subscriptions.empty.title",
      "subscriptions.empty.description",
      "subscriptions.browse_sellers",

      // Existing error translation
      "subscriptions.error",

      // New search translations
      "subscriptions.search_placeholder",
      "subscriptions.no_search_results",
    ],
    locale
  );

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // SEARCH
  // =========================================================

  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  const searchLower = search.toLowerCase();

  // =========================================================
  // GET ACTIVE SUBSCRIPTIONS
  // =========================================================

  const {
    data: subscriptions,
    error,
  } = await supabase
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

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    console.error(
      "Subscriptions lookup error:",
      error
    );

    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {translations[
                "subscriptions.title"
              ] ?? "My Subscriptions"}
            </h1>

            <p className="mt-2 text-sm text-muted">
              {translations[
                "subscriptions.description"
              ] ??
                "Continue learning from the channels you've subscribed to."}
            </p>
          </div>

          {/* Error */}
          <Card className="rounded-xl border-dashed">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold">
                {translations[
                  "subscriptions.error"
                ] ?? "Failed to load subscriptions."}
              </h3>
            </div>
          </Card>

        </div>
      </div>
    );
  }

  // =========================================================
  // GET CHANNEL DETAILS
  // =========================================================

  const channelIds =
    subscriptions?.map(
      (subscription) =>
        subscription.channel_id
    ) ?? [];

  let channels: any[] = [];

  if (channelIds.length > 0) {
    const { data, error: channelsError } =
      await supabase
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
        .in("id", channelIds);

    if (channelsError) {
      console.error(
        "Channels lookup error:",
        channelsError
      );
    }

    channels = data ?? [];
  }

  // =========================================================
  // CHANNEL MAP
  // =========================================================

  const channelMap = new Map(
    channels.map((channel) => [
      channel.id,
      channel,
    ])
  );

  // =========================================================
  // FILTER SUBSCRIPTIONS
  // =========================================================

  const filteredSubscriptions =
    !search
      ? subscriptions ?? []
      : (subscriptions ?? []).filter(
          (subscription) => {
            const channel =
              channelMap.get(
                subscription.channel_id
              );

            if (!channel) {
              return false;
            }

            const seller =
              Array.isArray(
                channel.profiles
              )
                ? channel.profiles[0]
                : channel.profiles;

            const searchableText = [
              channel.channel_name,
              channel.slug,
              seller?.display_name,
              seller?.username,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              searchLower
            );
          }
        );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {translations[
              "subscriptions.title"
            ] ?? "My Subscriptions"}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {translations[
              "subscriptions.description"
            ] ??
              "Continue learning from the channels you've subscribed to."}
          </p>
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <form
          method="GET"
          className="mb-6"
        >
          <Input
            name="search"
            defaultValue={search}
            placeholder={
              translations[
                "subscriptions.search_placeholder"
              ] ?? "Search subscriptions..."
            }
            className="max-w-md"
          />
        </form>

        {/* =====================================================
            NO SUBSCRIPTIONS
        ====================================================== */}

        {subscriptions?.length === 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
              <Card className="rounded-xl border-dashed">
                <div className="flex flex-col items-center justify-center py-12 text-center">

                  <h3 className="text-lg font-semibold">
                    {translations[
                      "subscriptions.empty.title"
                    ] ?? "No subscriptions yet"}
                  </h3>

                  <p className="mt-2 text-muted-foreground">
                    {translations[
                      "subscriptions.empty.description"
                    ] ??
                      "Subscribe to your favorite language channels and continue learning anytime."}
                  </p>

                  <div className="mt-6">
                    <Link href="/sellers">
                      <Button>
                        {translations[
                          "subscriptions.browse_sellers"
                        ] ?? "Browse Sellers"}
                      </Button>
                    </Link>
                  </div>

                </div>
              </Card>
            </div>
          </div>

        ) : filteredSubscriptions.length === 0 ? (

          /* =====================================================
             NO SEARCH RESULTS
          ====================================================== */

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
              <Card className="rounded-xl border-dashed">
                <div className="flex flex-col items-center justify-center py-12 text-center">

                  <h3 className="text-lg font-semibold">
                    {translations[
                      "subscriptions.no_search_results"
                    ] ?? "No subscriptions found."}
                  </h3>

                </div>
              </Card>
            </div>
          </div>

        ) : (

          /* =====================================================
             SUBSCRIPTION GRID
          ====================================================== */

          <div className="grid gap-6 lg:grid-cols-2">
            {filteredSubscriptions.map(
              (subscription) => {
                const channel =
                  channelMap.get(
                    subscription.channel_id
                  );

                if (!channel) {
                  return null;
                }

                const seller =
                  Array.isArray(
                    channel.profiles
                  )
                    ? channel.profiles[0]
                    : channel.profiles;

                return (
                  <ChannelCard
                    key={subscription.id}
                    channel={{
                      id: channel.id,
                      channel_name:
                        channel.channel_name,
                      slug: channel.slug,
                      description:
                        channel.description,
                      logo_url:
                        channel.logo_url,
                      banner_url:
                        channel.banner_url,
                      subscription_price:
                        channel.subscription_price,
                      currency:
                        channel.currency,
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
              }
            )}
          </div>
        )}

      </div>
    </div>
  );
}