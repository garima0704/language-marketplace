import { requireAdmin } from "@/lib/auth/admin";

import { getAdminReports } from "@/lib/reports/admin";

import ReportsHeader from "@/components/admin/reports/ReportsHeader";
import ReportStats from "@/components/admin/reports/ReportStats";
import ReportsToolbar from "@/components/admin/reports/ReportsToolbar";
import ReportsTable from "@/components/admin/reports/ReportsTable";

export default async function AdminReportsPage() {
  await requireAdmin();

  const { reports, stats } = await getAdminReports();

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
          <ReportsTable reports={reports} />
        </div>
      </div>
    </main>
  );
}