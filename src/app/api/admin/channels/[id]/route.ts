import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: Request,
  { params }: RouteProps
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const supabase = await createClient();

    const { data: channel, error: fetchError } =
      await supabase
        .from("channels")
        .select("id")
        .eq("id", id)
        .single();

    if (fetchError || !channel) {
      return NextResponse.json(
        {
          error: "Channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Do not manually delete related records here
     * until the actual FK/cascade relationships are
     * confirmed.
     *
     * If your database has ON DELETE CASCADE configured,
     * this delete is enough.
     */

    const { error: deleteError } =
      await supabase
        .from("channels")
        .delete()
        .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          error: deleteError.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin channel delete error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unauthorized or failed to delete channel.",
      },
      {
        status: 500,
      }
    );
  }
}