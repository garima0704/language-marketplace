import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /* ========================================================
       AUTHENTICATED USER
    ======================================================== */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* ========================================================
       REQUEST DATA
    ======================================================== */

    const body = await request.json();

    const {
      videoId,
      progressSeconds,
    } = body;

    if (!videoId) {
      return NextResponse.json(
        {
          error: "videoId is required",
        },
        {
          status: 400,
        }
      );
    }

    const progress =
      Number.isFinite(progressSeconds)
        ? Math.max(
            0,
            Math.floor(progressSeconds)
          )
        : 0;

    /* ========================================================
       SAVE / UPDATE WATCH HISTORY
    ======================================================== */

    const { error } = await supabase
      .from("watch_history")
      .upsert(
        {
          user_id: user.id,
          video_id: videoId,
          progress_seconds: progress,
          watched_at: new Date().toISOString(),
        },
        {
          onConflict:
            "user_id,video_id",
        }
      );

    if (error) {
      console.error(
        "Watch history error:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to save watch history",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Watch history request error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}