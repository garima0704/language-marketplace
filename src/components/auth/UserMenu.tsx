"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type Profile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function UserMenu({
  user,
}: UserMenuProps) {
  const supabase = createClient();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "display_name, username, avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Failed to load user profile:",
          error
        );
      }

      if (mounted) {
        setProfile(data ?? null);
        setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [supabase, user.id]);

  useEffect(() => {
    let mounted = true;

    const loadUnreadNotifications = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Failed to load notification count:",
          error
        );
        return;
      }

      if (mounted) {
        setUnreadCount(count ?? 0);
      }
    };

    loadUnreadNotifications();

    return () => {
      mounted = false;
    };
  }, [supabase, user.id]);

  /* =====================================================
     USER DISPLAY DATA
  ===================================================== */

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user.email?.split("@")[0] ||
    "User";

  const username =
    profile?.username ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    profile?.avatar_url || "";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {/* =================================================
          NOTIFICATIONS
      ================================================== */}

      <Link
        href="/notifications"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-foreground
          transition
          hover:bg-muted-bg
          focus:outline-none
        "
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              right-1
              top-1
              flex
              min-h-4
              min-w-4
              items-center
              justify-center
              rounded-full
              bg-primary
              px-1
              text-[10px]
              font-semibold
              leading-none
              text-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </Link>

      {/* =================================================
          USER MENU
      ================================================== */}

      <DropdownMenu>
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
          {/* Avatar */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-primary
              text-sm
              font-semibold
              text-white
            "
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <ChevronDown
            size={16}
            className="text-muted"
          />
        </DropdownMenuTrigger>

        {/* =================================================
            DROPDOWN
        ================================================== */}

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
          {/* =================================================
              USER INFORMATION
          ================================================== */}

          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-primary
                    font-semibold
                    text-white
                  "
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                {/* Name */}

                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {loadingProfile
                      ? "Loading..."
                      : displayName}
                  </p>

                  <p className="truncate text-xs text-muted">
                    {profile?.username
                      ? `@${profile.username}`
                      : user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border" />

          {/* =================================================
              MY PROFILE
          ================================================== */}

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

          {/* =================================================
              SETTINGS
          ================================================== */}

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

          {/* =================================================
              SIGN OUT
          ================================================== */}

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
    </div>
  );
}