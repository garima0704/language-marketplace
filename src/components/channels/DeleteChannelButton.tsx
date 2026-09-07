"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface DeleteChannelButtonProps {
  channelId: string;
  channelName: string;
}

export default function DeleteChannelButton({
  channelId,
  channelName,
}: DeleteChannelButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("channels")
      .delete()
      .eq("id", channelId);

    if (error) {
      console.error("Delete channel error:", error);
      setError("Unable to delete this channel. Please try again.");
      setIsDeleting(false);
      return;
    }

    router.push("/seller/channels");
    router.refresh();
  };

  if (!showConfirm) {
    return (
      <Button
        type="button"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        Delete Channel
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <div>
        <p className="font-semibold text-red-900">
          Delete "{channelName}"?
        </p>

        <p className="mt-1 text-sm text-red-700">
          This will permanently delete the channel, its videos,
          subscriptions, payments, comments, likes, ratings, reports,
          views, saved videos, and watch history.
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-start gap-3 pt-6">
        <Button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="min-w-44"
        >
          {isDeleting ? "Deleting..." : "Yes, Delete"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </Button>  
      </div>
    </div>
  );
}