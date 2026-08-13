import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SellerChannelsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) {
    redirect("/");
  }

  const { data: channels } = await supabase
    .from("channels")
    .select(
      `
        id,
        channel_name,
        slug,
        description,
        logo_url,
        banner_url,
        subscription_price,
        status,
        created_at
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Channels
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create and manage your language channels.
          </p>
        </div>

        <Link href="/seller/channels/new">
          <Button>
            Create Channel
          </Button>
        </Link>
      </div>

      {/* Channels */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels?.length ? (
          channels.map((channel) => (
            <Card
              key={channel.id}
              className="group overflow-hidden rounded-xl border border-gray-200/10 bg-background p-0 transition hover:shadow-sm"
            >
              {/* Banner */}
              <div className="relative aspect-[4/1] w-full overflow-hidden bg-gray-100">
                {channel.banner_url ? (
                  <img
                    src={channel.banner_url}
                    alt={`${channel.channel_name} banner`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-400">
                      No banner
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative px-5 pb-5">
                {/* Logo */}
                <div className="-mt-10 mb-4 flex">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-background bg-gray-100 shadow-sm">
                    {channel.logo_url ? (
                      <img
                        src={channel.logo_url}
                        alt={`${channel.channel_name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xl font-semibold text-gray-400">
                          {channel.channel_name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Channel name */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {channel.channel_name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    /c/{channel.slug}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                  {channel.description || "No description"}
                </p>

                {/* Price + Status */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    ${Number(channel.subscription_price).toFixed(2)}
                    <span className="font-normal text-muted-foreground">
                      /month
                    </span>
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      channel.status === "active"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {channel.status === "active"
                      ? "Active"
                      : "Suspended"}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  <Link
                    href={`/seller/channels/${channel.id}`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full"
                    >
                      Manage
                    </Button>
                  </Link>

                  <Link
                    href={`/channels/${channel.slug}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="rounded-xl border-dashed">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-semibold">
                  No channels yet
                </h3>

                <p className="mt-2 text-muted-foreground">
                  Create your first channel to start sharing
                  language lessons.
                </p>

                <div className="mt-6">
                  <Link href="/seller/channels/new">
                    <Button>
                      Create Channel
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