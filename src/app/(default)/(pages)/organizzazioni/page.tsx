import styles from "./page.module.css";
import branding from "@/app/components/logic/branding";
import OrganizationCard from "@/app/components/ui/OrganizationCard/OrganizationCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import type { Metadata } from "next";
import Title from "@/app/components/ui/Typography/Title/Title";
import { getOrganizationsList } from "@/lib/services/organizationService";
import { getServerCtx } from "@/lib/auth/ctx";

export const metadata: Metadata = {
    title: "Organizzazioni - " + branding.appName,
};

export default async function Page() {
    const ctx = await getServerCtx();
    const organizations = await getOrganizationsList(ctx);

    const orgCardItems = organizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} href={`/organizzazioni/${org.id}`} />
    ));

    return (
        <div className={styles.body}>
            <Title text="Esplora le organizzazioni" alignment="left" hierarchy={1} />
            <div className={styles.carouselContainer}>
                <Title text="Tutte le organizzazioni" alignment="left" hierarchy={2} />
                <Carousel direction="horizontal" items={orgCardItems} />
            </div>
        </div>
    );
}
