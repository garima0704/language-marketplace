"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface VideoLikeButtonProps {
  videoId: string;
  isAuthenticated: boolean;
}

export default function VideoLikeButton({
  videoId,
  isAuthenticated,
}: VideoLikeButtonProps) {
  const supabase = createClient();

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadLikeState() {
      setLoading(true);

      try {
        // ---------------------------------------------
        // Total likes
        // ---------------------------------------------

        const { count, error: countError } =
          await supabase
            .from("likes")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("video_id", videoId);

        if (countError) {
          console.error(
            "Failed to load like count:",
            countError
          );
        }

        if (!mounted) return;

        setLikeCount(count ?? 0);

        // ---------------------------------------------
        // Current user
        // ---------------------------------------------

        if (!isAuthenticated) {
          setIsLiked(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLiked(false);
          return;
        }

        // ---------------------------------------------
        // Check user's like
        // ---------------------------------------------

        const { data, error } =
          await supabase
            .from("likes")
            .select("id")
            .eq("video_id", videoId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
          console.error(
            "Failed to check like:",
            error
          );
        }

        if (!mounted) return;

        setIsLiked(!!data);
      } catch (error) {
        console.error(
          "Failed to load likes:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadLikeState();

    return () => {
      mounted = false;
    };
  }, [videoId, isAuthenticated]);

  async function handleLike() {
    if (saving || loading) return;

    // ---------------------------------------------
    // Login required
    // ---------------------------------------------

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // ---------------------------------------------
    // Optimistic update
    // ---------------------------------------------

    setIsLiked(!previousLiked);

    setLikeCount(
      previousLiked
        ? Math.max(previousCount - 1, 0)
        : previousCount + 1
    );

    if (!previousLiked) {
      setAnimate(true);

      window.setTimeout(() => {
        setAnimate(false);
      }, 300);
    }

    try {
      if (previousLiked) {
        // -------------------------------------------
        // Unlike
        // -------------------------------------------

        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("video_id", videoId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        // -------------------------------------------
        // Like
        // -------------------------------------------

        const { error } = await supabase
          .from("likes")
          .insert({
            video_id: videoId,
            user_id: user.id,
          });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        "Failed to update like:",
        error
      );

      // ---------------------------------------------
      // Rollback
      // ---------------------------------------------

      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={saving || loading}
      aria-label={
        isLiked
          ? "Unlike video"
          : "Like video"
      }
      className="
        group
        inline-flex
        items-center
        gap-2
        rounded-full
        px-3
        py-2
        text-sm
        font-medium
        text-foreground
        transition
        hover:bg-muted-bg
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <Heart
        className={`
          h-5 w-5
          transition-transform
          duration-200
          ${
            isLiked
              ? "fill-foreground text-foreground"
              : "text-foreground"
          }
          ${
            animate
              ? "scale-125"
              : "scale-100"
          }
        `}
      />

      <span className="tabular-nums">
        {loading ? "—" : likeCount}
      </span>
    </button>
  );
}