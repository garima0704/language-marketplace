"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

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
      <DropdownMenuTrigger
  className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 transition hover:bg-[#F7F9FA]"
>

  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
    {initial}
  </div>

  <ChevronDown
    size={16}
    className="text-gray-500"
  />

</DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl p-2"
      >
        <DropdownMenuGroup>

  <DropdownMenuLabel className="px-3 py-3">

    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white font-semibold">
        {initial}
      </div>

      <div>

        <p className="font-semibold">
          {username}
        </p>

        <p className="text-xs text-gray-500">
          {user.email}
        </p>

      </div>

    </div>

  </DropdownMenuLabel>

</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
  className="h-11 rounded-lg"
  render={<Link href="/profile" />}
>
          <UserIcon className="size-4" />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuItem
  className="h-11 rounded-lg"
  render={<Link href="/settings" />}
>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <form action={signOut}>
  <button
    type="submit"
    className="flex h-11 w-full items-center gap-2 rounded-lg px-2 text-sm text-red-600 hover:bg-red-50"
  >
    <LogOut className="size-4" />
    Sign Out
  </button>
</form>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}