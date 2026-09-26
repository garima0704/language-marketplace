type CategoryStatsProps = {
  totalCategories: number;
  mainCategories: number;
  activeCategories: number;
  inactiveCategories: number;
};

export default function CategoryStats({
  totalCategories,
  mainCategories,
  activeCategories,
  inactiveCategories,
}: CategoryStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted">Total Categories</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {totalCategories}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted">Main Categories</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {mainCategories}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted">Active Categories</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {activeCategories}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted">Inactive Categories</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {inactiveCategories}
        </p>
      </div>
    </div>
  );
}