import type { Metadata } from "next";
import branding from "../components/logic/branding";

export const metadata: Metadata = {
  title: "Home - " + branding.appName,
};

export default function Page() {
  return null;
}