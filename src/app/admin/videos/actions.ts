"use server";

import { requireAdmin } from "@/lib/auth/admin";

export async function deleteAdminVideo(
  videoId: string
) {
  if (!videoId) {
    return {
      success: false,
      error: "Invalid video ID.",
    };
  }

  const { supabase } = await requireAdmin();

  try {
    // Get video information first.
    const { data: video, error: videoFetchError } =
      await supabase
        .from("videos")
        .select(`
          id,
          video_id,
          video_provider
        `)
        .eq("id", videoId)
        .single();

    if (videoFetchError || !video) {
      console.error(
        "ADMIN VIDEO FETCH ERROR:",
        videoFetchError
      );

      return {
        success: false,
        error: "Video not found.",
      };
    }

    // --------------------------------------------
    // Delete thumbnail files
    // --------------------------------------------

    const {
      data: thumbnailFiles,
      error: thumbnailListError,
    } = await supabase.storage
      .from("video-thumbnails")
      .list(video.id);

    if (thumbnailListError) {
      throw new Error(
        `Could not access video thumbnail: ${thumbnailListError.message}`
      );
    }

    if (
      thumbnailFiles &&
      thumbnailFiles.length > 0
    ) {
      const thumbnailPaths =
        thumbnailFiles.map(
          (file) =>
            `${video.id}/${file.name}`
        );

      const {
        error: thumbnailDeleteError,
      } = await supabase.storage
        .from("video-thumbnails")
        .remove(thumbnailPaths);

      if (thumbnailDeleteError) {
        throw new Error(
          `Could not delete thumbnail: ${thumbnailDeleteError.message}`
        );
      }
    }

    // --------------------------------------------
    // Delete Supabase video file
    // --------------------------------------------

    if (
      video.video_provider === "supabase" &&
      video.video_id
    ) {
      const {
        error: videoFileDeleteError,
      } = await supabase.storage
        .from("videos")
        .remove([video.video_id]);

      if (videoFileDeleteError) {
        throw new Error(
          `Could not delete video file: ${videoFileDeleteError.message}`
        );
      }
    }

    // --------------------------------------------
    // Delete database row
    // --------------------------------------------

    const { error: deleteError } =
      await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

    if (deleteError) {
      throw new Error(
        `Could not delete video: ${deleteError.message}`
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "ADMIN VIDEO DELETE ERROR:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to delete this video.",
    };
  }
}