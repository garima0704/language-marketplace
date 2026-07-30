import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />

      <Sidebar />

      <main className="ml-56 min-h-[calc(100vh-96px)] pt-24 bg-gray-50 flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
}