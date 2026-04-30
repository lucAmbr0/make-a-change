import "./globals.css";
import type { Viewport } from "next";
import UserProvider from "@/app/components/logic/UserProvider";
import branding from "./components/logic/branding";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  icons: {
    icon: [{ url: branding.logo, type: "image/png" }],
    shortcut: [{ url: branding.logo, type: "image/png" }],
    apple: [{ url: branding.logo, type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
