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
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
  <div className="px-6 py-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-[#082645]">
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

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {channels?.length ? (
        channels.map((channel) => (
          <Card
            key={channel.id}
            className="rounded-xl p-4 hover:border-primary transition"
          >
            <h3 className="font-semibold">
              {channel.channel_name}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {channel.description || "No description"}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                ${channel.subscription_price}/month
              </span>

              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href={`/seller/channels/${channel.id}`}>
                <Button size="sm">
                  Manage
                </Button>
              </Link>

              <Link href={`/channels/${channel.slug}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
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
                Create your first channel to start sharing language lessons.
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