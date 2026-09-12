"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

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
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function ReportsTable({
  reports,
  currentPage,
  totalPages,
  totalReports,
  pageSize,
}: ReportsTableProps) {
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
                      {report.video?.title ??
                        "Deleted video"}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {/* Result count */}
          <p className="text-sm text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {start}–{end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {totalReports}
            </span>{" "}
            reports
          </p>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            {currentPage > 1 ? (
              <Link
                href={`/admin/reports?page=${currentPage - 1}`}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-10 cursor-not-allowed items-center rounded-lg border border-border px-4 text-sm font-medium text-muted">
                Previous
              </span>
            )}

            {/* Page numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <Link
                key={page}
                href={`/admin/reports?page=${page}`}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "border border-border text-secondary hover:bg-muted-bg hover:text-foreground"
                }`}
              >
                {page}
              </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={`/admin/reports?page=${currentPage + 1}`}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-10 cursor-not-allowed items-center rounded-lg border border-border px-4 text-sm font-medium text-muted">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
