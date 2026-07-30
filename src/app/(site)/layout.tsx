import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <Sidebar />

      <main className="min-h-screen ml-56 pt-24 bg-gray-50">
        {children}
      </main>
    </div>
  );
}