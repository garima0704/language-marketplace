import Link from "next/link";
import { Edit, Eye } from "lucide-react";

type SitePage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  page_data: Record<string, unknown>;
  locale_code: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  page: SitePage;
};

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export default function PageRow({ page }: Props) {
  const publicPath =
    page.slug === "privacy-policy"
      ? "/privacy"
      : page.slug === "cookie-policy"
        ? "/cookies"
        : `/${page.slug}`;

  return (
    <tr className="border-b border-border last:border-0">
      {/* Page */}
      <td className="px-6 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {page.title}
          </p>
        </div>
      </td>

      {/* Slug */}
      <td className="px-6 py-4">
        <p className="truncate text-secondary">
          /{page.slug}
        </p>
      </td>

      {/* Language */}
      <td className="px-6 py-4">
        <span className="inline-flex rounded-md border border-border px-2.5 py-1 text-xs font-medium uppercase text-secondary">
          {page.locale_code}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className="inline-flex rounded-md bg-muted-bg px-2.5 py-1 text-xs font-medium capitalize text-secondary">
          {page.is_published ? "Published" : "Draft"}
        </span>
      </td>

      {/* Updated */}
      <td className="px-6 py-4 text-muted">
        {formatDate(page.updated_at)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* View */}
          <Link
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Eye className="h-4 w-4" />
            View
          </Link>

          {/* Edit */}
          <Link
            href={`/admin/pages/${encodeURIComponent(page.slug)}/edit?locale=${encodeURIComponent(page.locale_code)}`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted-bg"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}