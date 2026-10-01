import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  console.log("SUPABASE ADMIN ENV CHECK:", {
    urlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
  });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}