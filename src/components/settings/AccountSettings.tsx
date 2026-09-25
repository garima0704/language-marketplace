"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SettingsPanel from "./SettingsPanel";
import StatusMessage from "./StatusMessage";

type AccountSettingsProps = {
  translations: Record<string, string>;
};

export default function AccountSettings({
  translations,
}: AccountSettingsProps) {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

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

    const { error } =
      await supabase.auth.updateUser({
        email: email.trim(),
      });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        translations[
          "settings.confirmation_email_sent"
        ] ??
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
      setError(
        translations[
          "settings.account_email_not_found"
        ] ??
          "Unable to find your account email."
      );

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
        translations[
          "settings.password_reset_email_sent"
        ] ??
          "A password reset email has been sent to your email address."
      );
    }

    setChangingPassword(false);
  }

  return (
    <SettingsPanel
      title={
        translations["settings.email_password"] ??
        "Email & Password"
      }
      description={
        translations[
          "settings.email_password_description"
        ] ??
        "Manage the email address and password used to access your account."
      }
    >
      <div className="max-w-xl space-y-8">
        <div>
          <label className="mb-2 block text-sm font-medium">
            {translations["settings.email_address"] ??
              "Email address"}
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
            {translations[
              "settings.email_change_confirmation"
            ] ??
              "Changing your email may require confirmation."}
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
              ? translations["settings.updating"] ??
                "Updating..."
              : translations["settings.update_email"] ??
                "Update Email"}
          </Button>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-semibold">
            {translations["settings.password"] ??
              "Password"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {translations[
              "settings.password_description"
            ] ??
              "We will send you an email with a secure link to change your password."}
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
              ? translations["settings.sending"] ??
                "Sending..."
              : translations["settings.change_password"] ??
                "Change Password"}
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