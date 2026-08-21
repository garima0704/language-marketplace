import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ChannelCard from "@/components/channels/ChannelCard";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();

  // =========================================================
  // GET SELLER + CHANNELS
  // =========================================================

  const { data: seller, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      country,
      channels (
        id,
        channel_name,
        slug,
        description,
        logo_url,
        banner_url,
        subscription_price,
        currency
      )
    `)
    .eq("username", username)
    .eq("is_creator", true)
    .single();

  if (error || !seller) {
    notFound();
  }

  return (
    <div className="p-8">

      {/* =======================================================
          SELLER HEADER
      ======================================================== */}

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <div className="flex items-center gap-5">

          {seller.avatar_url ? (
            <img
              src={seller.avatar_url}
              alt={seller.display_name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold">
              {seller.display_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {seller.display_name}
            </h1>

            <p className="text-gray-500">
              @{seller.username}
            </p>

            {seller.country && (
              <p className="mt-1 text-sm text-gray-500">
                {seller.country}
              </p>
            )}
          </div>

        </div>

        {seller.bio && (
          <p className="mt-6 max-w-3xl text-gray-600">
            {seller.bio}
          </p>
        )}

      </div>

      {/* =======================================================
          CHANNELS
      ======================================================== */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold text-gray-900">
          Channels
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {seller.channels?.map((channel) => (

            <ChannelCard
              key={channel.id}
              channel={{
                id: channel.id,
                channel_name: channel.channel_name,
                slug: channel.slug,
                description: channel.description,
                logo_url: channel.logo_url,
                banner_url: channel.banner_url,
              }}
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