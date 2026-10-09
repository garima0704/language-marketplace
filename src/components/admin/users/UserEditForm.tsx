"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  updateAdminUser,
  type UpdateUserState,
} from "@/app/admin/users/actions";

type User = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  is_creator: boolean;
  account_status: string;
};

type UserEditFormProps = {
  user: User;
};

const initialState: UpdateUserState = {};

export default function UserEditForm({
  user,
}: UserEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAdminUser,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={user.id} />

      <div className="rounded-xl border border-border bg-background">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Account Details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Display Name */}
            <div>
              <label
                htmlFor="display_name"
                className="text-sm font-medium text-foreground"
              >
                Display Name
              </label>

              <input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={user.display_name}
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                defaultValue={user.username}
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                placeholder="Leave blank to keep current password"
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />

              <p className="mt-1.5 text-xs text-muted">
                Leave blank to keep the current password.
              </p>
            </div>

            {/* Account Type */}
            <div>
              <label
                htmlFor="account_type"
                className="text-sm font-medium text-foreground"
              >
                Account Type
              </label>

              <select
                id="account_type"
                name="account_type"
                defaultValue={
                  user.is_creator ? "seller" : "buyer"
                }
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Creator</option>
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label
                htmlFor="account_status"
                className="text-sm font-medium text-foreground"
              >
                Account Status
              </label>

              <select
                id="account_status"
                name="account_status"
                defaultValue={user.account_status}
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="text-sm font-medium text-foreground"
              >
                Country
              </label>

              <input
                id="country"
                name="country"
                type="text"
                defaultValue={user.country ?? ""}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="date_of_birth"
                className="text-sm font-medium text-foreground"
              >
                Date of Birth
              </label>

              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={user.date_of_birth ?? ""}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="text-sm font-medium text-foreground"
              >
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                defaultValue={user.gender ?? ""}
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="border-t border-border px-6 py-4">
            <p className="text-sm text-red-600">
              {state.error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Link
            href={`/admin/users/${user.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}