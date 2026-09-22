export default function StatusMessage({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  if (!message && !error) {
    return null;
  }

  const hasError = Boolean(error);

  return (
    <div
      className={[
        "mt-6 rounded-lg border px-4 py-3 text-sm",
        hasError
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-border bg-light-bg text-foreground",
      ].join(" ")}
      role={hasError ? "alert" : "status"}
    >
      {hasError ? error : message}
    </div>
  );
}