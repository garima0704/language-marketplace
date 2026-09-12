"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
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

export interface AdminReportDetails {
  report: {
    id: string;
    video_id: string;
    user_id: string;
    reason: string;
    description: string | null;
    status: ReportStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    admin_note: string | null;
  };

  video: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    status: string;
    access_type: "free" | "subscriber";
    language_code: string;
    level: string | null;
    view_count: number;
    created_at: string;
    channel_id: string;
  } | null;

  reporter: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;

  channel: {
    id: string;
    channel_name: string;
    slug: string | null;
    logo_url: string | null;
    user_id: string;
  } | null;

  creator: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;

  reviewer: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;

  categoryLabel: string | null;
}

export async function getAdminReports(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  await requireAdmin();

  const supabase = await createClient();

  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 10;
  const search = options?.search?.trim() ?? "";

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // --------------------------------------------------
  // Search related records
  // --------------------------------------------------

  let matchingVideoIds: string[] = [];
  let matchingProfileIds: string[] = [];

  if (search) {
    const searchValue = `%${search}%`;

    // Search video titles
    const { data: matchingVideos, error: videosError } =
      await supabase
        .from("videos")
        .select("id")
        .ilike("title", searchValue);

    if (videosError) {
      console.error(
        "Failed to search videos:",
        videosError
      );

      throw new Error("Failed to search reports.");
    }

    matchingVideoIds =
      matchingVideos?.map((video) => video.id) ?? [];

    // Search reporter username/display name
    const {
      data: matchingProfiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select("id")
      .or(
        `username.ilike.${searchValue},display_name.ilike.${searchValue}`
      );

    if (profilesError) {
      console.error(
        "Failed to search profiles:",
        profilesError
      );

      throw new Error("Failed to search reports.");
    }

    matchingProfileIds =
      matchingProfiles?.map((profile) => profile.id) ?? [];
  }

  // --------------------------------------------------
  // Reports query
  // --------------------------------------------------

  let query = supabase
    .from("reports")
    .select(
      `
        id,
        video_id,
        user_id,
        reason,
        description,
        status,
        reviewed_by,
        reviewed_at,
        created_at,
        admin_note,
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
      `,
      { count: "exact" }
    )
    .order("created_at", {
      ascending: false,
    });

  // --------------------------------------------------
  // Apply search
  // --------------------------------------------------

  if (search) {
    const searchValue = `%${search}%`;

    const conditions = [
      `reason.ilike.${searchValue}`,
      `description.ilike.${searchValue}`,
    ];

    if (matchingVideoIds.length > 0) {
      conditions.push(
        `video_id.in.(${matchingVideoIds.join(",")})`
      );
    }

    if (matchingProfileIds.length > 0) {
      conditions.push(
        `user_id.in.(${matchingProfileIds.join(",")})`
      );
    }

    query = query.or(conditions.join(","));
  }

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const {
    data,
    error,
    count,
  } = await query.range(from, to);

  if (error) {
    console.error(
      "Failed to load admin reports:",
      error
    );

    throw new Error("Failed to load reports.");
  }

  const reports = (data ?? []).map((report: any) => ({
    id: report.id,
    video_id: report.video_id,
    user_id: report.user_id,
    reason: report.reason,
    description: report.description,
    status: report.status as ReportStatus,
    reviewed_by: report.reviewed_by,
    reviewed_at: report.reviewed_at,
    created_at: report.created_at,
    admin_note: report.admin_note,

    video: Array.isArray(report.videos)
      ? report.videos[0] ?? null
      : report.videos ?? null,

    reporter: Array.isArray(report.profiles)
      ? report.profiles[0] ?? null
      : report.profiles ?? null,
  }));

  // --------------------------------------------------
  // Overall stats
  // --------------------------------------------------

  const {
    data: statsData,
    error: statsError,
  } = await supabase
    .from("reports")
    .select("status");

  if (statsError) {
    console.error(
      "Failed to load report stats:",
      statsError
    );

    throw new Error("Failed to load report stats.");
  }

  const stats = {
    total: statsData?.length ?? 0,

    pending:
      statsData?.filter(
        (report) => report.status === "pending"
      ).length ?? 0,

    reviewed:
      statsData?.filter(
        (report) => report.status === "reviewed"
      ).length ?? 0,

    dismissed:
      statsData?.filter(
        (report) => report.status === "dismissed"
      ).length ?? 0,

    removed:
      statsData?.filter(
        (report) => report.status === "removed"
      ).length ?? 0,
  };

  return {
    reports,
    stats,
    total: count ?? 0,
  };
}

export async function getAdminReport(
  reportId: string
): Promise<AdminReportDetails | null> {
await requireAdmin();

const supabase = await createClient();

// --------------------------------------------------
// Report
// --------------------------------------------------

const { data: report, error: reportError } =
await supabase
.from("reports")
.select(`         id,
        video_id,
        user_id,
        reason,
        description,
        status,
        reviewed_by,
        reviewed_at,
        created_at,
        admin_note
      `)
.eq("id", reportId)
.single();

if (reportError || !report) {
console.error(
"Failed to load admin report:",
reportError
);

return null;
}

// --------------------------------------------------
// Reported video
// --------------------------------------------------

const { data: video, error: videoError } =
await supabase
.from("videos")
.select(`         id,
        title,
        slug,
        description,
        thumbnail_url,
        status,
        access_type,
        language_code,
        level,
        view_count,
        created_at,
        channel_id,
        category_id
      `)
.eq("id", report.video_id)
.single();

if (videoError || !video) {
console.error(
"Failed to load reported video:",
videoError
);

return null;
}

// --------------------------------------------------
// Reporter
// --------------------------------------------------

const { data: reporter } =
await supabase
.from("profiles")
.select(`         id,
        username,
        display_name,
        avatar_url
      `)
.eq("id", report.user_id)
.single();

// --------------------------------------------------
// Channel
// --------------------------------------------------

const { data: channel } =
await supabase
.from("channels")
.select(`         id,
        channel_name,
        slug,
        logo_url,
        user_id
      `)
.eq("id", video.channel_id)
.single();

// --------------------------------------------------
// Creator
// --------------------------------------------------

let creator = null;

if (channel?.user_id) {
const { data: creatorProfile } =
await supabase
.from("profiles")
.select(`           id,
          username,
          display_name,
          avatar_url
        `)
.eq("id", channel.user_id)
.single();

creator = creatorProfile;
}

// --------------------------------------------------
// Reviewer
// --------------------------------------------------

let reviewer = null;

if (report.reviewed_by) {
const { data: reviewerProfile } =
await supabase
.from("profiles")
.select(`           id,
          username,
          display_name,
          avatar_url
        `)
.eq("id", report.reviewed_by)
.single();

reviewer = reviewerProfile;
}

// --------------------------------------------------
// Category
// --------------------------------------------------

let categoryLabel: string | null = null;

if (video.category_id) {
const { data: category } =
await supabase
.from("categories")
.select(`           id,
          name
        `)
.eq("id", video.category_id)
.single();

if (category?.name) {
  categoryLabel = category.name;
}
}

return {
  report: {
    id: report.id,
    video_id: report.video_id,
    user_id: report.user_id,
    reason: report.reason,
    description: report.description,
    status: report.status as ReportStatus,
    reviewed_by: report.reviewed_by,
    reviewed_at: report.reviewed_at,
    created_at: report.created_at,
    admin_note: report.admin_note,
  },

  video: {
    id: video.id,
    title: video.title,
    slug: video.slug,
    description: video.description,
    thumbnail_url: video.thumbnail_url,
    status: video.status,
    access_type: video.access_type,
    language_code: video.language_code,
    level: video.level,
    view_count: video.view_count ?? 0,
    created_at: video.created_at,
    channel_id: video.channel_id,
  },

  reporter: reporter ?? null,
  channel: channel ?? null,
  creator,
  reviewer,
  categoryLabel,
};
}

export async function moderateReport(
formData: FormData
) {
const admin = await requireAdmin();
const supabase = await createClient();

const reportId = String(
formData.get("reportId") ?? ""
);

const action = String(
formData.get("action") ?? ""
);

const adminNote = String(
formData.get("adminNote") ?? ""
).trim();

if (!reportId) {
throw new Error("Report ID is required.");
}

if (
!["dismiss", "warn", "remove"].includes(action)
) {
throw new Error("Invalid moderation action.");
}

if (!adminNote) {
throw new Error(
"An admin note is required."
);
}

const { data: report, error: reportError } =
await supabase
.from("reports")
.select(`         id,
        video_id,
        status
      `)
.eq("id", reportId)
.single();

if (reportError || !report) {
throw new Error("Report not found.");
}

if (report.status !== "pending") {
throw new Error(
"This report has already been reviewed."
);
}

const now = new Date().toISOString();

let reportStatus: ReportStatus;

if (action === "dismiss") {
reportStatus = "dismissed";
} else if (action === "warn") {
reportStatus = "reviewed";
} else {
reportStatus = "removed";
}

// --------------------------------------------------
// Remove video
// --------------------------------------------------

if (action === "remove") {
const { error: videoError } =
await supabase
.from("videos")
.update({
status: "removed",
updated_at: now,
})
.eq("id", report.video_id);

if (videoError) {
  console.error(
    "Failed to remove reported video:",
    videoError
  );

  throw new Error(
    "Failed to remove the video."
  );
}
}

// --------------------------------------------------
// Warn creator
// --------------------------------------------------

if (action === "warn") {
const { data: video } =
await supabase
.from("videos")
.select(`           id,
          channel_id
        `)
.eq("id", report.video_id)
.single();


if (video?.channel_id) {
  const { data: channel } =
    await supabase
      .from("channels")
      .select("user_id")
      .eq("id", video.channel_id)
      .single();

  if (channel?.user_id) {
    const { error: messageError } =
      await supabase
        .from("admin_messages")
        .insert({
          admin_id: admin.user.id,
          user_id: channel.user_id,
          subject: "Content warning",
          message: adminNote,
          is_read: false,
        });

    if (messageError) {
      console.error(
        "Failed to send creator warning:",
        messageError
      );

      throw new Error(
        "Failed to send the creator warning."
      );
    }
  }
}
}

// --------------------------------------------------
// Update report
// --------------------------------------------------

const { error: updateError } =
await supabase
.from("reports")
.update({
status: reportStatus,
reviewed_by: admin.user.id,
reviewed_at: now,
admin_note: adminNote,
})
.eq("id", reportId)
.eq("status", "pending");

if (updateError) {
console.error(
"Failed to update report:",
updateError
);

throw new Error(
  "Failed to update the report."
);
}

revalidatePath("/admin/reports");
revalidatePath(
`/admin/reports/${reportId}`
);

return {
success: true,
};
}
