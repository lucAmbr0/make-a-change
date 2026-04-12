import Navbar from "./components/ui/Navbar/Navbar";
import NavbarLink from "./components/ui/Navbar/NavbarLink";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Roboto, "Segoe UI", Arial' }}>
      <Navbar links={["Home", "Campagne", "Organizzazioni", "Informazioni"]} />
    </main>
  );
}
