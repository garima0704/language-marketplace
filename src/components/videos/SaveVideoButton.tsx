"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

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

  const [isSaved, setIsSaved] =
    useState(initialIsSaved);

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {
    if (!isAuthenticated) {
      window.location.href =
        `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;

      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;

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
    <button
      type="button"
      onClick={handleSave}
      disabled={loading}
      aria-label={
        isSaved
          ? "Remove from saved"
          : "Save video"
      }
      title={
        isAuthenticated
          ? isSaved
            ? "Remove from saved"
            : "Save video"
          : "Log in to save"
      }
      className={`
        inline-flex
        h-9
        items-center
        gap-2
        rounded-full
        px-3
        text-sm
        font-medium
        transition-all
        duration-150
        hover:bg-muted-bg
        active:scale-[0.96]
        disabled:cursor-wait
        disabled:opacity-60
        ${
          isSaved
            ? "text-foreground"
            : "text-secondary"
        }
      `}
    >
      {isSaved ? (
        <Bookmark
          className="h-4 w-4 fill-current"
        />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}

      <span>
        {isSaved ? "Saved" : "Save"}
      </span>
    </button>
  );
}