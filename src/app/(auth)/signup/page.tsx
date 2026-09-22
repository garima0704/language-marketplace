import { cookies } from "next/headers";

import SignupForm from "@/components/auth/SignupForm";
import { getTranslations } from "@/lib/translations";

export default async function SignupPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      // Page
      "auth.create_account",
      "auth.signup_description",

      // Form
      "auth.username",
      "auth.username_placeholder",
      "auth.email",
      "auth.password",
      "auth.password_placeholder",
      "auth.confirm_password",
      "auth.confirm_password_placeholder",
      "auth.show_password",
      "auth.hide_password",
      "auth.creating_account",
      "auth.create_account_button",
      "auth.have_account",
      "auth.login",
    ],
    locale
  );

  return (
    <>
      <h1 className="text-3xl font-bold">
        {translations["auth.create_account"] ??
          "Create your account"}
      </h1>

      <p className="mt-2 text-gray-500">
        {translations["auth.signup_description"] ??
          "Start learning languages on NiceConvo."}
      </p>

      <SignupForm translations={translations} />
    </>
  );
}
