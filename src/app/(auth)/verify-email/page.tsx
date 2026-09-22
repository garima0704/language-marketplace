import { cookies } from "next/headers";
import { MailCheck } from "lucide-react";

import { getTranslations } from "@/lib/translations";

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "auth.check_your_email",
      "auth.verification_email_sent",
      "auth.verify_email_description",
    ],
    locale
  );

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <MailCheck
          className="h-8 w-8 text-gray-900"
          strokeWidth={1.8}
        />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
        {translations["auth.check_your_email"] ??
          "Check your email"}
      </h1>

      <p className="mt-4 max-w-sm text-base leading-6 text-gray-600">
        {translations["auth.verification_email_sent"] ??
          "We've sent you a verification email."}
      </p>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {translations["auth.verify_email_description"] ??
          "Click the link in your inbox to activate your account."}
      </p>
    </div>
  );
}
