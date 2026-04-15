import Header from "@/app/components/ui/Header/Header";
import Footer from "@/app/components/ui/Footer/Footer";
import PageTransition from "@/app/components/ui/PageTransition/PageTransition";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <Header />
      <main className="appContent">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}