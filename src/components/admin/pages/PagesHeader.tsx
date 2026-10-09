import Link from "next/link";
import { Plus } from "lucide-react";

export default function PagesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Pages
        </h1>

        <p className="mt-1 text-sm text-muted">
          Manage your website pages and legal content.
        </p>
      </div>

      <Link
        href="/admin/pages/new"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add Page
      </Link>
    </div>
  );
}