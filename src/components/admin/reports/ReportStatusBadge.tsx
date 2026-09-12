import type { ReportStatus } from "@/lib/reports/admin";

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const statusLabels: Record<ReportStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
  removed: "Removed",
};

export default function ReportStatusBadge({
  status,
}: ReportStatusBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
      {statusLabels[status]}
    </span>
  );
}