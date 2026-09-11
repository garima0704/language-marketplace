"use server";

import { createClient } from "@/lib/supabase/server";

type ProfileData = {
  display_name: string;
  bio: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
};

type LanguageData = {
  language_code: string;
  proficiency:
    | "beginner"
    | "intermediate"
    | "advanced"
    | "fluent";
  is_native: boolean;
};

type SocialLinkData = {
  platform: string;
  url: string;
};

const VALID_GENDERS = [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
] as const;

async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

/* --------------------------------------------------
   Profile
-------------------------------------------------- */

export async function saveOnboardingProfile(
  profile: ProfileData
) {
  const { supabase, user } = await getCurrentUser();

  const displayName = profile.display_name.trim();

  if (!displayName) {
    return {
      success: false,
      error: "Display name is required.",
    };
  }

  const gender =
    profile.gender &&
    VALID_GENDERS.includes(
      profile.gender as (typeof VALID_GENDERS)[number]
    )
      ? profile.gender
      : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio: profile.bio?.trim() || null,
      country: profile.country?.trim() || null,
      date_of_birth: profile.date_of_birth || null,
      gender,
      avatar_url: profile.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error(
      "Onboarding profile update failed:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/* --------------------------------------------------
   Languages
-------------------------------------------------- */

export async function saveOnboardingLanguages(
  languages: LanguageData[]
) {
  const { supabase, user } = await getCurrentUser();

  // Remove duplicate language codes.
  const uniqueLanguages = Array.from(
    new Map(
      languages.map((language) => [
        language.language_code,
        language,
      ])
    ).values()
  );

  // Only one language can be native.
  const nativeLanguages = uniqueLanguages.filter(
    (language) => language.is_native
  );

  if (nativeLanguages.length > 1) {
    return {
      success: false,
      error: "Only one language can be selected as native.",
    };
  }

  // Validate language codes against active locales.
  if (uniqueLanguages.length > 0) {
    const languageCodes = uniqueLanguages.map(
      (language) => language.language_code
    );

    const { data: validLocales, error: localeError } =
      await supabase
        .from("locales")
        .select("code")
        .in("code", languageCodes)
        .eq("is_active", true);

    if (localeError) {
      console.error(
        "Failed to validate languages:",
        localeError
      );

      return {
        success: false,
        error: localeError.message,
      };
    }

    const validCodes = new Set(
      (validLocales ?? []).map((locale) => locale.code)
    );

    const invalidLanguage = uniqueLanguages.find(
      (language) => !validCodes.has(language.language_code)
    );

    if (invalidLanguage) {
      return {
        success: false,
        error: "One or more selected languages are invalid.",
      };
    }
  }

  /*
   * First clear the native flag for this profile.
   *
   * This is important because the database has:
   *
   * one native language per profile
   *
   * If English is currently native and the user changes
   * to Spanish, we must clear English before making
   * Spanish native.
   */
  const { error: clearNativeError } = await supabase
    .from("profile_languages")
    .update({
      is_native: false,
    })
    .eq("profile_id", user.id)
    .eq("is_native", true);

  if (clearNativeError) {
    console.error(
      "Failed to clear native language:",
      clearNativeError
    );

    return {
      success: false,
      error: clearNativeError.message,
    };
  }

  /*
   * Save/update the submitted languages.
   *
   * Existing languages are updated.
   * New languages are inserted.
   */
  if (uniqueLanguages.length > 0) {
    const rows = uniqueLanguages.map((language) => ({
      profile_id: user.id,
      language_code: language.language_code,
      proficiency: language.proficiency,
      is_native: false,
    }));

    const { error: upsertError } = await supabase
      .from("profile_languages")
      .upsert(rows, {
        onConflict: "profile_id,language_code",
      });

    if (upsertError) {
      console.error(
        "Failed to save profile languages:",
        upsertError
      );

      return {
        success: false,
        error: upsertError.message,
      };
    }

    // Set the selected native language after all rows exist.
    const nativeLanguage = nativeLanguages[0];

    if (nativeLanguage) {
      const { error: nativeError } = await supabase
        .from("profile_languages")
        .update({
          is_native: true,
        })
        .eq("profile_id", user.id)
        .eq(
          "language_code",
          nativeLanguage.language_code
        );

      if (nativeError) {
        console.error(
          "Failed to set native language:",
          nativeError
        );

        return {
          success: false,
          error: nativeError.message,
        };
      }
    }
  }

  /*
   * Remove languages that the user removed from the
   * onboarding list.
   *
   * We delete only rows that are no longer selected.
   * We do NOT delete and recreate everything.
   */
  const { data: existingLanguages } = await supabase
    .from("profile_languages")
    .select("id, language_code")
    .eq("profile_id", user.id);

  const submittedCodes = new Set(
    uniqueLanguages.map(
      (language) => language.language_code
    )
  );

  const languageIdsToDelete = (existingLanguages ?? [])
    .filter(
      (language) =>
        !submittedCodes.has(language.language_code)
    )
    .map((language) => language.id);

  if (languageIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("profile_languages")
      .delete()
      .in("id", languageIdsToDelete);

    if (deleteError) {
      console.error(
        "Failed to remove deleted languages:",
        deleteError
      );

      return {
        success: false,
        error: deleteError.message,
      };
    }
  }

  return { success: true };
}

/* --------------------------------------------------
   Social Links
-------------------------------------------------- */

export async function saveOnboardingSocialLinks(
  links: SocialLinkData[]
) {
  const { supabase, user } = await getCurrentUser();

  const cleanedLinks = links
    .map((link) => ({
      platform: link.platform.trim(),
      url: link.url.trim(),
    }))
    .filter(
      (link) => link.platform && link.url
    );

  /*
   * Remove duplicate platforms.
   */
  const uniqueLinks = Array.from(
    new Map(
      cleanedLinks.map((link) => [
        link.platform,
        link,
      ])
    ).values()
  );

  /*
   * Update existing links or insert new ones.
   */
  if (uniqueLinks.length > 0) {
    const rows = uniqueLinks.map((link) => ({
      profile_id: user.id,
      platform: link.platform,
      url: link.url,
    }));

    const { error: upsertError } = await supabase
      .from("profile_social_links")
      .upsert(rows, {
        onConflict: "profile_id,platform",
      });

    if (upsertError) {
      console.error(
        "Failed to save social links:",
        upsertError
      );

      return {
        success: false,
        error: upsertError.message,
      };
    }
  }

  /*
   * Remove links that the user removed.
   */
  const { data: existingLinks } = await supabase
    .from("profile_social_links")
    .select("id, platform")
    .eq("profile_id", user.id);

  const submittedPlatforms = new Set(
    uniqueLinks.map((link) => link.platform)
  );

  const linkIdsToDelete = (existingLinks ?? [])
    .filter(
      (link) =>
        !submittedPlatforms.has(link.platform)
    )
    .map((link) => link.id);

  if (linkIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("profile_social_links")
      .delete()
      .in("id", linkIdsToDelete);

    if (deleteError) {
      console.error(
        "Failed to remove deleted social links:",
        deleteError
      );

      return {
        success: false,
        error: deleteError.message,
      };
    }
  }

  return { success: true };
}

/* --------------------------------------------------
   Complete onboarding
-------------------------------------------------- */

export async function completeProfileOnboarding() {
  const { supabase, user } = await getCurrentUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_dismissed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error(
      "Failed to complete profile onboarding:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/* --------------------------------------------------
   Skip onboarding
-------------------------------------------------- */

export async function dismissProfileOnboarding() {
  const { supabase, user } = await getCurrentUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_dismissed_at:
        new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error(
      "Failed to dismiss profile onboarding:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}