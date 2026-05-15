import type { Metadata } from "next";
import styles from "./page.module.css"
import branding from "../components/logic/branding";
import HomeHero from "../components/ui/HomeHero/HomeHero";
import Paragraph from "../components/ui/Typography/Paragraph/Paragraph";

export const metadata: Metadata = {
  title: "Home - " + branding.appName,
};

export default function Page() {
  return <>
    <div className={styles.container}>
      <HomeHero />
      <Paragraph text={branding.openingDescription} alignment="center" color="accent-900" margin={"80px 20%"} />
    </div>
  </>;
}