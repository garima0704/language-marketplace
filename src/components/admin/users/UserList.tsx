"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
} from "lucide-react";
import Link from "next/link";

import {
  formatTimeAgo,
  getProfileName,
  getInitials,
} from "@/lib/utils";

type User = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  role: string;
  is_creator: boolean;
  account_status: string;
  created_at: string;
};

type Props = {
  users: User[];
};

const PAGE_SIZE = 10;

export default function UserList({
  users,
}: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --------------------------------------------------
  // Filter users
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      // ----------------------------------------------
      // Search
      // ----------------------------------------------

      const name = getProfileName(user).toLowerCase();

      const username =
        user.username?.toLowerCase() ?? "";

      const country =
        user.country?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        username.includes(query) ||
        country.includes(query);

      // ----------------------------------------------
      // Account type
      // ----------------------------------------------

      const accountType =
        user.role === "admin"
          ? "admin"
          : user.is_creator
            ? "seller"
            : "buyer";

      const matchesType =
        type === "all" ||
        accountType === type;

      // ----------------------------------------------
      // Status
      // ----------------------------------------------

      const matchesStatus =
        status === "all" ||
        user.account_status === status;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    type,
    status,
  ]);

  // --------------------------------------------------
  // Reset pagination when filters change
  // --------------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    type,
    status,
  ]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / PAGE_SIZE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) *
      PAGE_SIZE;

    return filteredUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [
    filteredUsers,
    safeCurrentPage,
  ]);

  const startResult =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const endResult = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredUsers.length
  );

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  function goToPage(page: number) {
    setCurrentPage(
      Math.min(
        Math.max(page, 1),
        totalPages
      )
    );
  }

  // --------------------------------------------------
  // Page numbers
  // --------------------------------------------------

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      safeCurrentPage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      safeCurrentPage - 2,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      safeCurrentPage + 2,
    ];
  }, [
    safeCurrentPage,
    totalPages,
  ]);

  return (
    <>
      {/* --------------------------------------------------
          Filters
      -------------------------------------------------- */}

      <div className="mt-8 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search users..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground"
            />
          </div>

          {/* Filters */}

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
            >
              <option value="all">
                All users
              </option>

              <option value="buyer">
                Buyers
              </option>

              <option value="seller">
                Sellers
              </option>
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
            >
              <option value="all">
                All statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="suspended">
                Suspended
              </option>

              <option value="deactivated">
                Deactivated
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          Users Table
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {/* Table header */}

        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Users
          </h2>

          <p className="mt-1 text-sm text-muted">
            Recently registered NiceConvo accounts.
          </p>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  User
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Country
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Account Type
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="whitespace-nowrap px-6 py-3 font-medium text-secondary">
                  Joined
                </th>

                <th className="whitespace-nowrap px-6 py-3 text-right font-medium text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const name =
                    getProfileName(user);

                  const accountType =
                    user.role === "admin"
                      ? "Admin"
                      : user.is_creator
                        ? "Seller"
                        : "Buyer";

                  const accountStatus =
                    user.account_status
                      ? user.account_status
                          .charAt(0)
                          .toUpperCase() +
                        user.account_status.slice(
                          1
                        )
                      : "Active";

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0"
                    >
                      {/* User */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={
                                user.avatar_url
                              }
                              alt={name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted-bg text-sm font-medium text-secondary">
                              {getInitials(name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {name}
                            </p>

                            {user.username && (
                              <p className="mt-0.5 truncate text-xs text-muted">
                                @{user.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Country */}

                      <td className="px-6 py-4 text-secondary">
                        {user.country || "—"}
                      </td>

                      {/* Account Type */}

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                          {accountType}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium text-secondary">
                          {accountStatus}
                        </span>
                      </td>

                      {/* Joined */}

                      <td className="px-6 py-4 text-muted">
                        {formatTimeAgo(
                          user.created_at
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-light-bg"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>

                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-foreground">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Try changing your search or
                      filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        {filteredUsers.length > 0 &&
          totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startResult}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {endResult}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredUsers.length}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage - 1
                    )
                  }
                  disabled={
                    safeCurrentPage === 1
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        goToPage(page)
                      }
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition ${
                        page === safeCurrentPage
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:bg-muted-bg"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      safeCurrentPage + 1
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Result count */}

      {filteredUsers.length > 0 &&
        totalPages === 1 && (
          <div className="mt-3 text-xs text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startResult}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {endResult}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredUsers.length}
            </span>{" "}
            users.
          </div>
        )}
    </>
  );
}