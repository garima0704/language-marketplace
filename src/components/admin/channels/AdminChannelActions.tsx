"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface AdminChannelActionsProps {
  channelId: string;
  channelSlug: string;
}

export default function AdminChannelActions({
  channelId,
  channelSlug,
}: AdminChannelActionsProps) {
  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <Link
          href={`/admin/channels/${channelId}`}
          className="flex-1"
        >
          <Button className="w-full rounded-lg">
            Manage
          </Button>
        </Link>

        <Link
          href={`/channels/${channelSlug}`}
          target="_blank"
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full rounded-lg"
          >
            View
          </Button>
        </Link>
      </div>
    </div>
  );
}