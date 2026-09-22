"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { signUp } from "@/app/(auth)/actions";

const initialState = {
  success: false,
  error: "",
};

interface SignupFormProps {
  translations: Record<string, string>;
}

export default function SignupForm({
  translations,
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [state, formAction, pending] = useActionState(
    signUp,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {/* Server Error */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-medium"
        >
          {translations["auth.username"] ?? "Username"}
        </label>

        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          placeholder={
            translations["auth.username_placeholder"] ??
            "john_doe"
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-gray-900"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium"
        >
          {translations["auth.email"] ?? "Email"}
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-gray-900"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium"
        >
          {translations["auth.password"] ?? "Password"}
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder={
              translations["auth.password_placeholder"] ??
              "Minimum 8 characters"
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 outline-none transition focus:border-gray-900"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={
              showPassword
                ? translations["auth.hide_password"] ??
                  "Hide password"
                : translations["auth.show_password"] ??
                  "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium"
        >
          {translations["auth.confirm_password"] ??
            "Confirm Password"}
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            required
            minLength={8}
            placeholder={
              translations["auth.confirm_password_placeholder"] ??
              "Confirm Password"
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 outline-none transition focus:border-gray-900"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={
              showConfirmPassword
                ? translations["auth.hide_password"] ??
                  "Hide password"
                : translations["auth.show_password"] ??
                  "Show password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-lg bg-gray-900 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {translations["auth.creating_account"] ??
              "Creating Account..."}
          </>
        ) : (
          translations["auth.create_account_button"] ??
          "Create Account"
        )}
      </button>

      <p className="pt-1 text-center text-sm text-gray-600">
        {translations["auth.have_account"] ??
          "Already have an account?"}{" "}
        <Link
          href="/login"
          className="font-semibold text-gray-900 hover:underline"
        >
          {translations["auth.login"] ?? "Login"}
        </Link>
      </p>
    </form>
  );
}