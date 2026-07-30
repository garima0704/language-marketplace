import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
    <main className="pt-32 pb-8">
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6">
        <div className="grid w-full max-w-6xl lg:grid-cols-2 gap-8 items-stretch">

          {/* Left */}
          <div className="hidden lg:flex flex-col justify-center rounded-2xl bg-primary p-12 text-white">
            <Link href="/" className="text-4xl font-bold">
              NiceConvo
            </Link>

            <h1 className="mt-10 text-5xl font-bold leading-tight">
              Learn Languages
              <br />
              Through Real
              <br />
              Conversations.
            </h1>

            <p className="mt-6 max-w-md text-lg text-white/80">
              Subscribe to native speakers, improve your speaking skills,
              and enjoy authentic conversations from around the world.
            </p>
          </div>

          {/* Right */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-lg">
              {children}
            </div>
          </div>

        </div>
      </div>
    </main>
    </>
  );
}