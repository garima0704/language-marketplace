import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

import UserEditForm from "@/components/admin/users/UserEditForm";

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const adminClient = createAdminClient();

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      country,
      date_of_birth,
      gender,
      is_creator,
      account_status
    `)
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const {
    data: { user },
  } = await adminClient.auth.admin.getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href={`/admin/users/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">
            Edit User
          </h1>

          <p className="mt-2 text-secondary">
            Update this user&apos;s account details.
          </p>
        </div>

        <div className="mt-8">
          <UserEditForm
            user={{
              id: profile.id,
              email: user.email ?? "",
              username: profile.username,
              display_name: profile.display_name,
              country: profile.country,
              date_of_birth: profile.date_of_birth,
              gender: profile.gender,
              is_creator: profile.is_creator,
              account_status: profile.account_status,
            }}
          />
        </div>
      </div>
    </div>
  );
}