import styles from "./page.module.css";
import branding from "@/app/components/logic/branding";
import CampaignCard from "@/app/components/ui/CampaignCard/CampaignCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import sampleCampaigns from "@/app/components/logic/placeholders";
import type { Metadata } from "next";
import Title from "@/app/components/ui/Typography/Title/Title";

export const metadata: Metadata = {
    title: "Campagne - " + branding.appName,
};

export default function Page() {
    return <>
    <div className={styles.carouselContainer}>
        <Title text="Campagne in evidenza" alignment="left" hierarchy={2} />
        <Carousel
            direction="horizontal"
            items={sampleCampaigns.sampleCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
            />
            </div>
    <div className={styles.carouselContainer}>
        <Title text="Campagne dalle tue organizzazioni" alignment="left" hierarchy={2} />
        <Carousel
            direction="horizontal"
            items={sampleCampaigns.sampleCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
            />
            </div>
    </>
}