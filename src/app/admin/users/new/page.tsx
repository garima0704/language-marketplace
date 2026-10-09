import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import UserForm from "@/components/admin/users/UserForm";

export default function AdminCreateUserPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">
            Add User
          </h1>

          <p className="mt-2 text-secondary">
            Create a new NiceConvo user account.
          </p>
        </div>

        <div className="mt-8">
          <UserForm />
        </div>
      </div>
    </div>
  );
}