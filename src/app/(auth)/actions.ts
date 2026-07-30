"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SignupState = {
  success: boolean;
  error?: string;
};

type LoginState = {
  success: boolean;
  error?: string;
};

export async function signUp(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const supabase = await createClient();

  const username = formData.get("username")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!username || !email || !password || !confirmPassword) {
  return {
    success: false,
    error: "All fields are required.",
  };
}

if (username.length < 3) {
  return {
    success: false,
    error: "Username must be at least 3 characters.",
  };
}

if (password.length < 8) {
  return {
    success: false,
    error: "Password must be at least 8 characters.",
  };
}

if (password !== confirmPassword) {
  return {
    success: false,
    error: "Passwords do not match.",
  };
}

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: existingUser } = await supabase
  .from("profiles")
  .select("id")
  .eq("username", username)
  .maybeSingle();

if (existingUser) {
  return {
    success: false,
    error: "Username is already taken.",
  };
}
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        username,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  redirect("/verify-email");
}

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient();

  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}