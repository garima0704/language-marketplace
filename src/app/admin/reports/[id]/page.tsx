import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { getAdminReport } from "@/lib/reports/admin";

import ReportDetails from "@/components/admin/reports/ReportDetails";
import ReportActions from "@/components/admin/reports/ReportActions";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportPage({
  params,
}: ReportPageProps) {
  await requireAdmin();

  const { id } = await params;

  const data = await getAdminReport(id);

  if (!data) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>

          <div className="mt-8 rounded-xl border border-border bg-background p-8 text-center">
            <h1 className="text-xl font-bold text-foreground">
              Report not found
            </h1>

            <p className="mt-2 text-sm text-muted">
              This report could not be found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Report Details
          </h1>

          <p className="mt-1 text-sm text-muted">
            Review the reported content and take appropriate action.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <ReportDetails data={data} />

          <ReportActions
            reportId={data.report.id}
            status={data.report.status}
          />
        </div>
      </div>
    </main>
  );
}