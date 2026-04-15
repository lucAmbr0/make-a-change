import Header from "@/app/components/ui/Header/Header";
import Footer from "@/app/components/ui/Footer/Footer";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <Header />
      <main className="appContent">{children}</main>
      <Footer />
    </div>
  );
}