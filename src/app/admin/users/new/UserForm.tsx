"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  createAdminUser,
  type CreateUserState,
} from "./actions";

const initialState: CreateUserState = {};

export default function UserForm() {
  const [state, formAction, pending] = useActionState(
    createAdminUser,
    initialState
  );

  return (
    <form action={formAction}>
      <div className="rounded-xl border border-border bg-background">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Account Details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

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
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

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
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

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
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />

              <p className="mt-1.5 text-xs text-muted">
                Minimum 6 characters.
              </p>
            </div>

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
                defaultValue="buyer"
                required
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

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
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

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
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

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
                required
                defaultValue=""
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
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Link
            href="/admin/users"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </form>
  );
}