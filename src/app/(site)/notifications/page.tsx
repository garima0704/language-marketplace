import { cookies } from "next/headers";

import { getTranslations } from "@/lib/translations";

import NotificationsPageClient from "./NotificationsPageClient";

export default async function NotificationsPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "notifications.title",
      "notifications.description",
      "notifications.mark_all_as_read",
      "notifications.empty_title",
      "notifications.empty_description",
      "notifications.unread",

      // Video likes
      "notification.like.title",
      "notification.like.message",

      // Comments
      "notification.comment.title",
      "notification.comment.message",

      // Likes on comments
      "notification.comment_like.title",
      "notification.comment_like.message",

      // Reports
      "notification.report.title",
      "notification.report.message",

      // Seller payments
      "notification.seller.title",
      "notification.seller.message",
    ],
    locale
  );

  return (
    <NotificationsPageClient
      translations={translations}
      locale={locale}
    />
  );
}