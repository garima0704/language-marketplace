import {
  Users,
  UserCheck,
  UserRound,
  Plus,
} from "lucide-react";
import Link from "next/link";

type Props = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    sellers: number;
    buyers: number;
  };
};

export default function UsersHeader({
  stats,
}: Props) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
    },
    {
      title: "Sellers",
      value: stats.sellers,
      icon: UserCheck,
    },
    {
      title: "Buyers",
      value: stats.buyers,
      icon: UserRound,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Users
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage NiceConvo users and their account roles.
          </p>
        </div>

        <Link
          href="/admin/users/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Add User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}