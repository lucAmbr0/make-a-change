import "./globals.css";
import type { Metadata, Viewport } from "next";
import UserProvider from "@/app/components/logic/UserProvider";
import ServiceWorkerRegistrar from "@/app/components/logic/ServiceWorkerRegistrar";
import PwaInstallBanner from "@/app/components/ui/PwaInstallBanner/PwaInstallBanner";
import branding from "./components/logic/branding";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: branding.themePalette[6],
};

export const metadata: Metadata = {
  title: branding.appName,
  description: branding.appDescription,
  applicationName: branding.appName,
  appleWebApp: {
    capable: true,
    title: branding.appName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: branding.logo, type: "image/png" }],
    shortcut: [{ url: branding.logo, type: "image/png" }],
    apple: [{ url: "/logo2_rounded.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <UserProvider>{children}</UserProvider>
        <PwaInstallBanner />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
