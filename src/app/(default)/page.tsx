import type { Metadata } from "next";
import styles from "./page.module.css"
import branding from "../components/logic/branding";
import HomeHero from "../components/ui/HomeHero/HomeHero";
import Paragraph from "../components/ui/Typography/Paragraph/Paragraph";
import CarouselSection from "../components/ui/CarouselSection/CarouselSection";
import CampaignCard from "../components/ui/CampaignCard/CampaignCard";
import OrganizationCard from "../components/ui/OrganizationCard/OrganizationCard";
import { getFeaturedCampaigns } from "@/lib/services/campaignService";
import { getOrganizationsList } from "@/lib/services/organizationService";
import { getServerCtx } from "@/lib/auth/ctx";
import { getOptionalAuth } from "@/lib/auth/auth";
import { getGlobalStats } from "@/lib/db/campaigns";
import Title from "../components/ui/Typography/Title/Title";
import StatsBox from "../components/ui/StatsBox/StatsBox";
import HomeCtaButtons from "./HomeCtaButtons";

export const metadata: Metadata = {
  title: "Home - " + branding.appName,
};

export default async function Page() {
  const ctx = await getServerCtx();
  const isAuthenticated = getOptionalAuth(ctx).userId !== null;

  const [featuredCampaigns, organizations, globalStats] = await Promise.all([
    getFeaturedCampaigns(ctx),
    getOrganizationsList(ctx),
    getGlobalStats(),
  ]);

  const campaignItems = featuredCampaigns.map((campaign) => (
    <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
  ));

  const organizationItems = organizations.map((org) => (
    <OrganizationCard key={org.id} organization={org} href={`/organizzazioni/${org.id}`} />
  ));

  return <>
    <div className={styles.container}>
      <HomeHero />
      <Paragraph text={branding.openingDescription} alignment="center" color="accent-900" margin={"80px 20%"} />
      <div className={styles.sectionsContainer}>
        <CarouselSection
          title="Campagne in evidenza oggi"
          carouselItems={campaignItems}
          buttonText="Vedi altro"
          buttonLink="/campagne"
          icon="material-symbols:arrow-forward-rounded"
        />
        <CarouselSection
          title="Organizzazioni"
          carouselItems={organizationItems}
          buttonText="Vedi altro"
          buttonLink="/organizzazioni"
          icon="material-symbols:arrow-forward-rounded"
        />
      </div>
      <div className={styles.statsSection}>
        <Title text="Unisciti alla community" alignment="center" hierarchy={1} />
        <StatsBox
          // showBackground
          stats={[
            { label: "Utenti", value: globalStats.users_count },
            { label: "Commenti nelle discussioni", value: globalStats.comments_count },
            { label: "Firme raccolte", value: globalStats.signatures_count },
            { label: "Campagne attive", value: globalStats.active_campaigns_count },
            { label: "Organizzazioni", value: globalStats.organizations_count },
          ]}
        />
        <HomeCtaButtons isAuthenticated={isAuthenticated} />
      </div>


    </div>
  </>;
}
