import { cookies } from "next/headers";

import LoginForm from "@/components/auth/LoginForm";
import { getTranslations } from "@/lib/translations";

export default async function LoginPage() {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      // Page
      "auth.welcome_back",
      "auth.login_description",

      // Form
      "auth.email",
      "auth.password",
      "auth.forgot_password",
      "auth.password_placeholder",
      "auth.remember_me",
      "auth.sign_in",
      "auth.signing_in",
      "auth.no_account",
      "auth.sign_up",
      "auth.show_password",
      "auth.hide_password",
    ],
    locale
  );

  console.log("LOGIN LOCALE:", locale);
  console.log("LOGIN TRANSLATIONS:", translations);

  return (
    <>
      <h1 className="text-3xl font-bold">
        {translations["auth.welcome_back"] ??
          "Welcome back"}
      </h1>

      <p className="mt-2 text-gray-500">
        {translations["auth.login_description"] ??
          "Sign in to continue learning on NiceConvo."}
      </p>

      <LoginForm translations={translations} />
    </>
  );
}