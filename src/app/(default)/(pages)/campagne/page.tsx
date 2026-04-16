import branding from "@/app/components/logic/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Campagne - " + branding.appName,
};

export default function Page() {
    return null;
}