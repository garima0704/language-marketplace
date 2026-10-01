import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: video, error: videoError } =
      await supabase
        .from("videos")
        .select("id, video_provider, video_id")
        .eq("id", id)
        .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: "Video not found." },
        { status: 404 }
      );
    }

    const {
      data: thumbnailFiles,
      error: thumbnailListError,
    } = await supabase.storage
      .from("video-thumbnails")
      .list(id);

    if (thumbnailListError) {
      return NextResponse.json(
        { error: thumbnailListError.message },
        { status: 500 }
      );
    }

    if (thumbnailFiles?.length) {
      const thumbnailPaths = thumbnailFiles.map(
        (file) => `${id}/${file.name}`
      );

      const { error: thumbnailDeleteError } =
        await supabase.storage
          .from("video-thumbnails")
          .remove(thumbnailPaths);

      if (thumbnailDeleteError) {
        return NextResponse.json(
          { error: thumbnailDeleteError.message },
          { status: 500 }
        );
      }
    }

    if (
      video.video_provider === "supabase" &&
      video.video_id
    ) {
      const { error: videoFileDeleteError } =
        await supabase.storage
          .from("videos")
          .remove([video.video_id]);

      if (videoFileDeleteError) {
        return NextResponse.json(
          { error: videoFileDeleteError.message },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ADMIN DELETE VIDEO ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete video.",
      },
      { status: 500 }
    );
  }
}