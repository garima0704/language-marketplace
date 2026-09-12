import { requireAdmin } from "@/lib/auth/admin";
import { getAdminReports } from "@/lib/reports/admin";

import ReportsHeader from "@/components/admin/reports/ReportsHeader";
import ReportStats from "@/components/admin/reports/ReportStats";
import ReportsToolbar from "@/components/admin/reports/ReportsToolbar";
import ReportsTable from "@/components/admin/reports/ReportsTable";

interface AdminReportsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  await requireAdmin();

  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 10;
  const search = params.search?.trim() ?? "";

  const { reports, stats, total } = await getAdminReports({
    page,
    pageSize,
    search,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ReportsHeader />

        <div className="mt-8">
          <ReportStats stats={stats} />
        </div>

        <div className="mt-8">
          <ReportsToolbar />
        </div>

        <div className="mt-6">
          <ReportsTable
            reports={reports}
            currentPage={page}
            totalPages={totalPages}
            totalReports={total}
            pageSize={pageSize}
          />
        </div>
      </div>
    </main>
  );
}