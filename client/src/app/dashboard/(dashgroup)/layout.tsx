import Blank from "@/components/dashboard/Blank";
import Navbar from "@/components/dashboard/Navbar";
import Footer from "@/components/Footer";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Blank />
      <div className="flex flex-1">
        <div className="flex-1 flex overflow-hidden">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
