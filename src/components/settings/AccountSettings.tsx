"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SettingsPanel from "./SettingsPanel";
import StatusMessage from "./StatusMessage";

export default function AccountSettings() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }

      setLoading(false);
    }

    loadUser();
  }, [supabase]);

  async function handleUpdateEmail() {
    if (!email.trim()) return;

    setUpdatingEmail(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.updateUser({
      email: email.trim(),
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "A confirmation email has been sent to your new email address."
      );
    }

    setUpdatingEmail(false);
  }

  async function handleChangePassword() {
    setChangingPassword(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError("Unable to find your account email.");
      setChangingPassword(false);
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "A password reset email has been sent to your email address."
      );
    }

    setChangingPassword(false);
  }

  return (
    <SettingsPanel
      title="Email & Password"
      description="Manage the email address and password used to access your account."
    >
      <div className="max-w-xl space-y-8">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email address
          </label>

          <Input
            type="email"
            value={email}
            disabled={loading || updatingEmail}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="h-10"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Changing your email may require confirmation.
          </p>

          <Button
            type="button"
            className="mt-4"
            size="sm"
            disabled={
              loading ||
              updatingEmail ||
              !email.trim()
            }
            onClick={handleUpdateEmail}
          >
            {updatingEmail
              ? "Updating..."
              : "Update Email"}
          </Button>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-semibold">
            Password
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            We will send you an email with a secure link to
            change your password.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={changingPassword}
            onClick={handleChangePassword}
          >
            {changingPassword
              ? "Sending..."
              : "Change Password"}
          </Button>
        </div>

        <StatusMessage
          message={message}
          error={error}
        />
      </div>
    </SettingsPanel>
  );
}