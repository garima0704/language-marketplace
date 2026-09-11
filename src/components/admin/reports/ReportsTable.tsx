"use client";

import Link from "next/link";

import type { AdminReport } from "@/lib/reports/admin";

interface ReportsTableProps {
  reports: AdminReport[];
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
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary transition hover:bg-muted-bg hover:text-foreground"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}