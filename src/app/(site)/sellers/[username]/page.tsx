import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";


export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();

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

      {/* Seller Header */}
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
              {seller.display_name.charAt(0)}
            </div>
          )}


          <div>
            <h1 className="text-3xl font-bold text-[#082645]">
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



      {/* Channels */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold text-[#082645]">
          Channels
        </h2>


        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {seller.channels?.map((channel) => (

            <div
              key={channel.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >

              <div className="flex items-center gap-4">

                {channel.logo_url ? (
                  <img
                    src={channel.logo_url}
                    alt={channel.channel_name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-gray-200" />
                )}


                <h3 className="font-semibold text-[#082645]">
                  {channel.channel_name}
                </h3>

              </div>


              <p className="mt-4 line-clamp-3 text-sm text-gray-600">
                {channel.description || "No description available."}
              </p>


              <p className="mt-3 text-sm font-medium">
                {channel.subscription_price} {channel.currency}/month
              </p>

                <Link href={`/channels/${channel.slug}`}>
                  <Button className="mt-5">
                    View Channel
                  </Button>
                </Link>
              

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}