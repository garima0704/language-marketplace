import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  // Exchange the code for a user session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const user = data.user;

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  // Create profile only if it doesn't exist
  if (!existingProfile) {
    const username =
      user.user_metadata.username ??
      user.email?.split("@")[0] ??
      "user";

    const displayName =
      user.user_metadata.display_name ?? username;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        display_name: displayName,
        role: "user",
        is_creator: false,
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError);

      return NextResponse.redirect(
        `${origin}/login?error=profile`
      );
    }
  }

  return NextResponse.redirect(origin);
}