"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/app/(auth)/actions";

const initialState = {
  success: false,
  error: "",
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    login,
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

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-primary"
        />
      </div>

      {/* Password */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 outline-none transition focus:border-primary"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="remember"
          className="rounded border-gray-300"
        />
        Remember me
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-lg bg-primary py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}