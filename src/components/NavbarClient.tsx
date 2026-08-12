"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageDropdown from "./LanguageDropdown";
import { Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import UserMenu from "@/components/auth/UserMenu";

type Locale = {
  code: string;
  name: string;
};

type NavbarClientProps = {
  locales: Locale[];
  user: User | null;
};

export default function NavbarClient({
  locales,
  user,
}: NavbarClientProps) {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-24 bg-background shadow-sm">
      <div className="flex h-full items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="NiceConvo"
            width={180}
            height={54}
            priority
          />
        </Link>

        {/* Search */}
        <div className="mx-10 hidden max-w-xl flex-1 md:flex">
          <div className="flex w-full overflow-hidden rounded-full bg-light-bg shadow-sm">
            <input
              type="text"
              placeholder="Search language videos, sellers..."
              className="
                flex-1
                bg-transparent
                px-6
                py-3
                text-sm
                text-foreground
                outline-none
                placeholder:text-muted
              "
            />

            <button
              type="button"
              className="
                bg-primary
                px-6
                text-white
                transition
                hover:opacity-90
              "
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Language */}
          <LanguageDropdown locales={locales} />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  pathname === "/login"
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-muted-bg hover:text-foreground"
                }`}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  pathname === "/signup"
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-muted-bg hover:text-foreground"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}