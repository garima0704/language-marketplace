"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageDropdown from "./LanguageDropdown";
import { Globe, Search } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-white shadow-sm">
      <div className="h-full flex items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="NiceConvo"
            width={180}
            height={54}
            priority
          />
        </Link>


        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-10">

          <div className="flex w-full rounded-full bg-[#F5F7F8] shadow-sm overflow-hidden">

            <input
              type="text"
              placeholder="Search conversations, creators..."
              className="
                flex-1 
                px-6 
                py-3 
                bg-transparent 
                outline-none
                text-sm
              "
            />

            <button
              className="
                    px-6
                    bg-primary
                    text-[#082645]
                    hover:brightness-95
                    transition
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
          ? "bg-[#F8BA29] text-[#082645]"
          : "text-[#444444] hover:bg-secondary hover:text-white"
      }`}
    >
      Login
    </Link>

    <Link
      href="/signup"
      className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
        pathname === "/signup"
          ? "bg-[#F8BA29] text-[#082645]"
          : "text-[#444444] hover:bg-secondary hover:text-white"
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