import Sidebar from "@/components/sidebar/Sidebar";
import Footer from "@/components/Footer";

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />

      <main className="ml-56 min-h-[calc(100vh-96px)] pt-24 bg-gray-50 flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </main>
    </>
  );
}