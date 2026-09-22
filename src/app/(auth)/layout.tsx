import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { getTranslations } from "@/lib/translations";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  const locale =
    cookieStore.get("niceconvo_locale")?.value ?? "en";

  const translations = await getTranslations(
    [
      "auth.learn_languages",
      "auth.through_real_conversations",
      "auth.auth_description",
    ],
    locale
  );

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-8">
        <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6">
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* Left */}
            <div className="hidden flex-col justify-center rounded-2xl bg-primary p-12 text-white lg:flex">
              <Link
                href="/"
                className="text-4xl font-bold"
              >
                NiceConvo
              </Link>

              <h1 className="mt-10 text-5xl font-bold leading-tight">
                {translations["auth.learn_languages"] ??
                  "Learn Languages"}
                <br />
                {translations[
                  "auth.through_real_conversations"
                ] ?? "Through Real Conversations."}
              </h1>

              <p className="mt-6 max-w-md text-lg text-white/80">
                {translations[
                  "auth.auth_description"
                ] ??
                  "Subscribe to native speakers, improve your speaking skills, and enjoy authentic conversations from around the world."}
              </p>
            </div>

            {/* Right */}
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}