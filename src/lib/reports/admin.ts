import { createClient } from "@/lib/supabase/server";

export type ReportStatus =
  | "pending"
  | "reviewed"
  | "dismissed"
  | "removed";

export interface AdminReport {
  id: string;
  video_id: string;
  user_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;

  video: {
    id: string;
    title: string;
  } | null;

  reporter: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function getAdminReports() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select(`
      id,
      video_id,
      user_id,
      reason,
      description,
      status,
      reviewed_by,
      reviewed_at,
      created_at,
      videos (
        id,
        title
      ),
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Failed to load admin reports:",
      error
    );

    throw new Error(
      "Failed to load reports."
    );
  }

  const reports: AdminReport[] =
    (data ?? []).map((report: any) => ({
      id: report.id,
      video_id: report.video_id,
      user_id: report.user_id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      reviewed_by: report.reviewed_by,
      reviewed_at: report.reviewed_at,
      created_at: report.created_at,

      video: Array.isArray(report.videos)
        ? report.videos[0] ?? null
        : report.videos ?? null,

      reporter: Array.isArray(
        report.profiles
      )
        ? report.profiles[0] ?? null
        : report.profiles ?? null,
    }));

  const stats = {
    total: reports.length,
    pending: reports.filter(
      (report) =>
        report.status === "pending"
    ).length,
    reviewed: reports.filter(
      (report) =>
        report.status === "reviewed"
    ).length,
    dismissed: reports.filter(
      (report) =>
        report.status === "dismissed"
    ).length,
    removed: reports.filter(
      (report) =>
        report.status === "removed"
    ).length,
  };

  return {
    reports,
    stats,
  };
}