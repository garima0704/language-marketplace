import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/admin";
import AdminSidebar from "@/components/admin/sidebar/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div>
      <AdminHeader
        displayName={profile?.display_name}
        username={profile?.username}
        avatarUrl={profile?.avatar_url}
      />

      <AdminSidebar />

      <main className="ml-56 min-h-[calc(100vh-96px)] pt-24 bg-gray-50 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}