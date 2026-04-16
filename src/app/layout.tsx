import "./globals.css";
import type { Viewport } from "next";
import UserProvider from "@/app/components/logic/UserProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
