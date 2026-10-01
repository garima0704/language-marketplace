"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateUserState = {
  error?: string;
};

export async function createAdminUser(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireAdmin();

  const supabase = createAdminClient();

  const displayName = String(formData.get("display_name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const country = String(formData.get("country") || "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const accountType = String(formData.get("account_type") || "").trim();

  if (!displayName || !username || !email || !password) {
    return {
      error: "Please fill in all required fields.",
    };
  }

  if (!["buyer", "seller"].includes(accountType)) {
    return {
      error: "Please select a valid account type.",
    };
  }

  if (!["female", "male"].includes(gender)) {
    return {
      error: "Please select a gender.",
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
    };
  }

  const isCreator = accountType === "seller";

  // Check username before creating the Auth user.
  const { data: existingUsername, error: usernameError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

  if (usernameError) {
    return {
      error: "Unable to check username availability.",
    };
  }

  if (existingUsername) {
    return {
      error: "That username is already in use.",
    };
  }

  // The handle_new_user() trigger automatically creates
  // the profiles row using username from user_metadata.
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        display_name: displayName,
      },
    });

  if (authError || !authData.user) {
    return {
      error: authError?.message || "Unable to create the user.",
    };
  }

  // The trigger has already created the profile.
  // Update it with the remaining profile information.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      country: country || null,
      date_of_birth: dateOfBirth || null,
      gender,
      role: "user",
      is_creator: isCreator,
    })
    .eq("id", authData.user.id);

  if (profileError) {
    // Roll back the Auth account if the profile update fails.
    await supabase.auth.admin.deleteUser(authData.user.id);

    return {
      error: profileError.message,
    };
  }

  redirect("/admin/users");
}