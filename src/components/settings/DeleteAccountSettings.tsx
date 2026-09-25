"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SettingsPanel from "./SettingsPanel";

type DeleteAccountSettingsProps = {
  translations: Record<string, string>;
};

export default function DeleteAccountSettings({
  translations,
}: DeleteAccountSettingsProps) {
  const [confirmText, setConfirmText] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") {
      return;
    }

    setDeleting(true);

    // Account deletion should be handled by a secure
    // server-side endpoint / Supabase admin operation.
    //
    // Example later:
    //
    // await fetch("/api/account/delete", {
    //   method: "DELETE",
    // });

    setDeleting(false);
  }

  return (
    <SettingsPanel
      title={
        translations[
          "settings.delete_account"
        ] ?? "Delete Account"
      }
      description={
        translations[
          "settings.delete_account_description"
        ] ??
        "Permanently remove your NiceConvo account."
      }
    >
      <div className="max-w-xl">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">
            {translations[
              "settings.delete_account_warning"
            ] ??
              "This action cannot be undone"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {translations[
              "settings.delete_account_data_description"
            ] ??
              "Deleting your account will permanently remove your account and associated data from NiceConvo."}
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              {translations[
                "settings.delete_account_confirm_label"
              ] ?? "Type DELETE to continue"}
            </label>

            <Input
              value={confirmText}
              onChange={(event) =>
                setConfirmText(
                  event.target.value
                )
              }
              placeholder={
                translations[
                  "settings.delete_account_placeholder"
                ] ?? "DELETE"
              }
              className="h-10 max-w-sm bg-background"
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-4"
            disabled={
              confirmText !== "DELETE" ||
              deleting
            }
            onClick={handleDeleteAccount}
          >
            {deleting
              ? translations[
                  "settings.deleting"
                ] ?? "Deleting..."
              : translations[
                  "settings.delete_account_button"
                ] ?? "Delete Account"}
          </Button>
        </div>
      </div>
    </SettingsPanel>
  );
}