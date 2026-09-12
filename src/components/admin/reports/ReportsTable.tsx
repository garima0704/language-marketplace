"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { AdminReport } from "@/lib/reports/admin";

interface ReportsTableProps {
  reports: AdminReport[];
  currentPage: number;
  totalPages: number;
  totalReports: number;
  pageSize: number;
}

function getStatusClasses(
  status: AdminReport["status"]
) {
  switch (status) {
    case "removed":
      return "bg-foreground text-background";

    case "pending":
    case "reviewed":
    case "dismissed":
    default:
      return "bg-muted-bg text-secondary";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportsTable({
  reports,
  currentPage,
  totalPages,
  totalReports,
  pageSize,
}: ReportsTableProps) {
  const router = useRouter();

  if (!reports.length) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex min-h-[240px] items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              No reports found
            </p>

            <p className="mt-1 text-sm text-muted">
              There are no reports to review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const start = (currentPage - 1) * pageSize + 1;

  const end = Math.min(
    currentPage * pageSize,
    totalReports
  );

  return (
    <>
      {/* White card */}
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {/* Header */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Reports
          </h2>

          <p className="mt-1 text-sm text-muted">
            Reports submitted by NiceConvo users.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 font-medium text-secondary">
                  Video
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Reason
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Reported by
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-secondary">
                  Date
                </th>

                <th className="px-6 py-3 text-right font-medium text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border last:border-0"
                >
                  {/* Video */}
                  <td className="px-6 py-4">
                    <div className="max-w-[280px]">
                      <p className="truncate font-medium text-foreground">
                        {report.video?.title ?? "Deleted video"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted">
                        {report.video_id}
                      </p>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4">
                    <span className="capitalize text-secondary">
                      {report.reason}
                    </span>
                  </td>

                  {/* Reporter */}
                  <td className="px-6 py-4">
                    <span className="text-secondary">
                      {report.reporter?.display_name ??
                        report.reporter?.username ??
                        "Unknown user"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap px-6 py-4 text-muted">
                    {formatDate(report.created_at)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition hover:bg-primary/90"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination INSIDE card when there are multiple pages */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted">
              Showing {start}–{end} of {totalReports}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  currentPage > 1 &&
                  router.push(
                    `/admin/reports?page=${currentPage - 1}`
                  )
                }
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/reports?page=${page}`
                    )
                  }
                  className={
                    page === currentPage
                      ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-white"
                      : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg"
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  currentPage < totalPages &&
                  router.push(
                    `/admin/reports?page=${currentPage + 1}`
                  )
                }
                disabled={currentPage === totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Single-page count OUTSIDE card */}
      {totalPages <= 1 && (
        <div className="mt-3 text-xs text-muted">
          Showing {totalReports} of {totalReports} reports.
        </div>
      )}
    </>
  );
}