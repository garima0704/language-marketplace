"use client";

import { useState } from "react";
import { Bookmark, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface SaveVideoButtonProps {
  videoId: string;
  isSaved: boolean;
  isAuthenticated: boolean;
}

export default function SaveVideoButton({
  videoId,
  isSaved: initialIsSaved,
  isAuthenticated,
}: SaveVideoButtonProps) {
  const supabase = createClient();

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // ================================================
      // REMOVE SAVED VIDEO
      // ================================================

      if (isSaved) {
        const { error } = await supabase
          .from("saved_videos")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", videoId);

        if (error) {
          console.error(
            "Error removing saved video:",
            error
          );
          return;
        }

        setIsSaved(false);
        return;
      }

      // ================================================
      // SAVE VIDEO
      // ================================================

      const { error } = await supabase
        .from("saved_videos")
        .insert({
          user_id: user.id,
          video_id: videoId,
        });

      if (error) {
        // Already saved — local state was stale
        if (error.code === "23505") {
          setIsSaved(true);
          return;
        }

        console.error(
          "Error saving video:",
          error
        );
        return;
      }

      setIsSaved(true);
    } catch (error) {
      console.error(
        "Unexpected error saving video:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSave}
      disabled={loading}
      className="rounded-lg border-border"
    >
      {isSaved ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          Save
        </>
      )}
    </Button>
  );
}