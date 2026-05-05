import type { Metadata } from "next";
import branding from "@/app/components/logic/branding";

export const metadata: Metadata = {
    title: "Crea account - " + branding.appName,
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
