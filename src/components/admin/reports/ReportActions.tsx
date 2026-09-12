"use client";

import { useState } from "react";
import { Check, Loader2, MessageSquareWarning, Trash2 } from "lucide-react";

import { moderateReport } from "@/lib/reports/admin";
import type { ReportStatus } from "@/lib/reports/admin";

interface ReportActionsProps {
  reportId: string;
  status: ReportStatus;
}

export default function ReportActions({
  reportId,
  status,
}: ReportActionsProps) {
  const [adminNote, setAdminNote] = useState("");
  const [loadingAction, setLoadingAction] =
    useState<"dismiss" | "warn" | "remove" | null>(null);
  const [error, setError] = useState("");

  const isPending = status === "pending";

  async function handleAction(
    action: "dismiss" | "warn" | "remove"
  ) {
    if (!adminNote.trim()) {
      setError("Please add an admin note before taking action.");
      return;
    }

    if (action === "remove") {
      const confirmed = window.confirm(
        "Remove this video? The video will be marked as removed and will no longer be treated as published."
      );

      if (!confirmed) return;
    }

    setError("");
    setLoadingAction(action);

    try {
      const formData = new FormData();

      formData.append("reportId", reportId);
      formData.append("action", action);
      formData.append("adminNote", adminNote.trim());

      await moderateReport(formData);

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <aside className="h-fit rounded-xl border border-border bg-background">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-foreground">
          Moderation
        </h2>

        <p className="mt-1 text-sm text-muted">
          Record the decision made for this report.
        </p>
      </div>

      <div className="space-y-5 p-6">
        {!isPending ? (
          <div className="rounded-lg border border-border bg-muted-bg p-4">
            <p className="text-sm font-semibold text-foreground">
              This report has already been reviewed.
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              No further moderation actions are available.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label
                htmlFor="admin-note"
                className="text-sm font-semibold text-foreground"
              >
                Admin note
              </label>

              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(event) =>
                  setAdminNote(event.target.value)
                }
                placeholder="Explain the moderation decision..."
                rows={5}
                disabled={loadingAction !== null}
                className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-muted">
                This note will be stored with the moderation decision.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-border bg-muted-bg px-4 py-3 text-sm text-foreground">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <ActionButton
                label="Dismiss Report"
                icon={<Check className="h-4 w-4" />}
                loading={loadingAction === "dismiss"}
                disabled={loadingAction !== null}
                onClick={() => handleAction("dismiss")}
              />

              <ActionButton
                label="Warn Creator"
                icon={
                  <MessageSquareWarning className="h-4 w-4" />
                }
                loading={loadingAction === "warn"}
                disabled={loadingAction !== null}
                onClick={() => handleAction("warn")}
              />

              <ActionButton
                label="Remove Video"
                icon={<Trash2 className="h-4 w-4" />}
                loading={loadingAction === "remove"}
                disabled={loadingAction !== null}
                onClick={() => handleAction("remove")}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function ActionButton({
  label,
  icon,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}

      {loading ? "Processing..." : label}
    </button>
  );
}