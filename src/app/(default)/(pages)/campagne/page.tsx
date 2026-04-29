import styles from "./page.module.css";
import branding from "@/app/components/logic/branding";
import CampaignCard from "@/app/components/ui/CampaignCard/CampaignCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import type { Metadata } from "next";
import Title from "@/app/components/ui/Typography/Title/Title";
import { cookies, headers } from "next/headers";
import { getFeaturedCampaigns, getUserOrganizationsCampaigns, getIndependentCampaigns } from "@/lib/services/campaignService";
import { NextRequest } from "next/server";

export const metadata: Metadata = {
    title: "Campagne - " + branding.appName,
};

async function createRequestObject() {
    return {
        headers: await headers(),
        cookies: await cookies(),
    } as unknown as NextRequest;
}

export default async function Page() {
    const req = await createRequestObject();
    
    const [featuredCampaigns, userOrgCampaigns, independentCampaigns] = await Promise.all([
        getFeaturedCampaigns(req),
        getUserOrganizationsCampaigns(req),
        getIndependentCampaigns(req),
    ]);

    const featuredCardItems = featuredCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const userOrgCardItems = userOrgCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const independentCardItems = independentCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    return <>
    <div className={styles.carouselContainer}>
        <Title text="Campagne in evidenza" alignment="left" hierarchy={2} />
        <Carousel
            direction="horizontal"
            items={featuredCardItems}
            />
    </div>
    {userOrgCampaigns.length > 0 &&
    <div className={styles.carouselContainer}>
        <Title text="Campagne dalle tue organizzazioni" alignment="left" hierarchy={2} />
        <Carousel
            direction="horizontal"
            items={userOrgCardItems}
            />
    </div>
    }
    {independentCampaigns.length > 0 &&
    <div className={styles.carouselContainer}>
        <Title text="Campagne da indipendenti" alignment="left" hierarchy={2} />
        <Carousel
            direction="horizontal"
            items={independentCardItems}
            />
    </div>
    }
    </>
}