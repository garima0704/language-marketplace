import { cookies } from "next/headers";

import { getTranslations } from "@/lib/translations";

import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "settings.title",
      "settings.description",

      "settings.account",
      "settings.email_password",

      "settings.preferences",
      "settings.notifications",

      "settings.seller",
      "settings.payouts",

      "settings.danger_zone",
      "settings.delete_account",

      // Account
      "settings.email_address",
      "settings.email_password_description",
      "settings.email_change_confirmation",
      "settings.update_email",
      "settings.updating",
      "settings.password",
      "settings.password_description",
      "settings.change_password",
      "settings.sending",
      "settings.confirmation_email_sent",
      "settings.password_reset_email_sent",
      "settings.account_email_not_found",

      // Notifications
      "settings.comments",
      "settings.comments_description",
      "settings.likes",
      "settings.likes_description",
      "settings.reports",
      "settings.reports_description",
      "settings.seller_activity",
      "settings.seller_activity_description",
      "settings.notifications_description",
      "settings.notification_preferences_footer",

      // Payouts
      "settings.payouts_description",
      "settings.stripe",
      "settings.stripe_description",
      "settings.connect_stripe",
      "settings.stripe_connect_description",
      "settings.connecting",
      "settings.stripe_connect_error",
      "settings.stripe_connected",

      "settings.paypal",
      "settings.paypal_description",
      "settings.paypal_email_description",
      "settings.paypal_email_placeholder",
      "settings.save_paypal",
      "settings.saving",
      "settings.paypal_saved",
      "settings.paypal_email_required",
      "settings.paypal_save_error",

      "settings.bank_account",
      "settings.bank_account_description",
      "settings.account_holder_name",
      "settings.bank_name",
      "settings.account_number",
      "settings.iban",
      "settings.swift_code",
      "settings.save_bank_details",
      "settings.bank_details_saved",
      "settings.bank_details_required",
      "settings.bank_details_save_error",

      "settings.loading_payouts",
      "settings.payout_load_error",
      "settings.must_be_logged_in",

      // Delete account
      "settings.delete_account_description",
      "settings.delete_account_warning",
      "settings.delete_account_data_description",
      "settings.delete_account_confirm_label",
      "settings.delete_account_placeholder",
      "settings.delete_account_button",
      "settings.deleting",
    ],
  locale
);

  return (
    <SettingsPageClient
      translations={translations}
      locale={locale}
    />
  );
}