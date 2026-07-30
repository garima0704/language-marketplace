import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <div className="px-6 py-6 space-y-6">
      {children}
    </div>
  );
}