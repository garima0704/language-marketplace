import Image from "next/image";
import Link from "next/link";
import { UserCircle } from "lucide-react";

type AdminHeaderProps = {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
};

export default function AdminHeader({
  displayName,
  username,
  avatarUrl,
}: AdminHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-24 bg-background shadow-sm">
      <div className="flex h-full items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/admin"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="NiceConvo"
            width={180}
            height={54}
            priority
          />
        </Link>

        {/* Admin Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-muted-bg"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName || username || "Admin"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-bg">
              <UserCircle className="h-6 w-6 text-muted" />
            </div>
          )}

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-foreground">
              {displayName || username || "Admin"}
            </p>

            {username && (
              <p className="text-xs text-muted">
                @{username}
              </p>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}