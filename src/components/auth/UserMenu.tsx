"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { signOut } from "@/app/(auth)/actions";

type UserMenuProps = {
  user: User;
};

export default function UserMenu({ user }: UserMenuProps) {
  const username = user.email?.split("@")[0] ?? "User";
  const initial = username.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      {/* User button */}
      <DropdownMenuTrigger
        className="
          flex
          cursor-pointer
          items-center
          gap-2
          rounded-full
          px-2
          py-1
          transition
          hover:bg-muted-bg
          focus:outline-none
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-primary
            text-sm
            font-semibold
            text-white
          "
        >
          {initial}
        </div>

        <ChevronDown
          size={16}
          className="text-muted"
        />
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent
        align="end"
        className="
          w-72
          rounded-2xl
          border
          border-border
          bg-background
          p-2
          shadow-lg
        "
      >
        {/* User information */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  font-semibold
                  text-white
                "
              >
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {username}
                </p>

                <p className="truncate text-xs text-muted">
                  {user.email}
                </p>
              </div>

            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* My Profile */}
        <DropdownMenuItem
          className="
            h-11
            rounded-lg
            text-foreground
            transition
            hover:bg-muted-bg
            hover:text-primary
            focus:bg-muted-bg
            focus:text-primary
          "
          render={<Link href="/profile" />}
        >
          <UserIcon className="size-4" />
          My Profile
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem
          className="
            h-11
            rounded-lg
            text-foreground
            transition
            hover:bg-muted-bg
            hover:text-primary
            focus:bg-muted-bg
            focus:text-primary
          "
          render={<Link href="/settings" />}
        >
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {/* Sign Out */}
        <form action={signOut}>
          <button
            type="submit"
            className="
              flex
              h-11
              w-full
              items-center
              gap-2
              rounded-lg
              px-2
              text-sm
              text-foreground
              transition
              hover:bg-muted-bg
              hover:text-primary
            "
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}