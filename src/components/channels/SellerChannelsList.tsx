"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChannelCard from "@/components/channels/ChannelCard";

type Channel = {
  id: string;
  channel_name?: string | null;
  slug?: string | null;
  logo_url?: string | null;
  [key: string]: any;
};

interface SellerChannelsListProps {
  channels: Channel[];
  searchPlaceholder: string;
  noResultsText: string;
}

export default function SellerChannelsList({
  channels,
  searchPlaceholder,
  noResultsText,
}: SellerChannelsListProps) {
  const [search, setSearch] = useState("");

  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return channels;
    }

    return channels.filter((channel) => {
      const name =
        channel.channel_name?.toLowerCase() ?? "";

      const slug =
        channel.slug?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        slug.includes(query)
      );
    });
  }, [channels, search]);

  return (
    <div>
      {/* Search */}
      {channels.length > 0 && (
        <Input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder={searchPlaceholder}
          className="mb-8 max-w-md"
        />
      )}

      {/* Results */}
      {filteredChannels.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className="space-y-3"
            >
              <ChannelCard
                channel={channel}
                variant="seller-management"
                showActions={true}
              />
            </div>
          ))}
        </div>
      ) : search.trim() ? (
        <Card className="rounded-xl border-dashed">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {noResultsText}
            </h2>
          </div>
        </Card>
      ) : null}
    </div>
  );
}