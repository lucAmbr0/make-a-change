import styles from './page.module.css'
import branding from "@/app/components/logic/branding";
import Title from '@/app/components/ui/Typography/Title/Title';
import Paragraph from '@/app/components/ui/Typography/Paragraph/Paragraph';
import type { Metadata } from "next";
import { getUserById } from "@/lib/db/users";
import { notFound } from "next/navigation";
import { getServerCtx } from "@/lib/auth/ctx";
import { getOptionalAuth } from "@/lib/auth/auth";
import { NotFoundError } from "@/lib/errors/ApiError";
import Carousel from '@/app/components/ui/Carousel/Carousel';
import StatsBox from '@/app/components/ui/StatsBox/StatsBox';
import CampaignCard from '@/app/components/ui/CampaignCard/CampaignCard';
import OrganizationCard from '@/app/components/ui/OrganizationCard/OrganizationCard';
import { getUserProfileCollections } from '@/lib/services/userService';
import Button from '@/app/components/ui/Button/Button';

async function safeGetUser(userId: number) {
    try {
        return await getUserById({ userId });
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
    const { userId } = await params;
    const parsedUserId = Number.parseInt(userId, 10);

    if (Number.isNaN(parsedUserId)) {
        return { title: branding.appName };
    }

    try {
        const user = await safeGetUser(parsedUserId);
        const userFullName = `${user.first_name} ${user.last_name}`;
        return { title: `${userFullName} - ${branding.appName}` };
    } catch {
        return { title: branding.appName };
    }
}

export const dynamic = "force-dynamic";

type ProfileContext = "own_profile" | "other_user" | "guest";

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const parsedUserId = Number.parseInt(userId, 10);

    if (Number.isNaN(parsedUserId)) notFound();

    const user = await safeGetUser(parsedUserId);
    const ctx = await getServerCtx();
    const auth = getOptionalAuth(ctx);

    // Determine the profile context
    let profileContext: ProfileContext = "guest";
    if (auth.userId !== null) {
        profileContext = auth.userId === parsedUserId ? "own_profile" : "other_user";
    }

    const userFullName = `${user.first_name} ${user.last_name}`;
    const isOwnProfile = profileContext === "own_profile";
    const isLoggedIn = auth.userId !== null;

    const {
        repostedCampaigns,
        signedCampaigns,
        createdCampaigns,
        organizations,
    } = await getUserProfileCollections(ctx, parsedUserId, isOwnProfile);

    const repostedCardItems = repostedCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const signedCardItems = signedCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const createdCardItems = createdCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const organizationCardItems = organizations.map((organization) => (
        <OrganizationCard key={organization.id} organization={organization} />
    ));

    const stats = [
        {
            label: "Campagne ricondivise",
            value: repostedCampaigns.length,
        },
        {
            label: "Campagne create",
            value: createdCampaigns.length,
        },
        {
            label: "Organizzazioni",
            value: organizations.length,
        },
    ];

    return <>
        <div className={styles.profileContainer}>

            <div className={styles.profileHeader}>
                <div style={{paddingTop: "18px"}}>
                    <Title text={userFullName} hierarchy={1} />
                    <Paragraph
                        text={`Membro dal ${new Date(user.registered_at).toLocaleDateString('it-IT')}`}
                        color="accent-950"
                        alignment="left"
                    />
                </div>
                <div>
                    <StatsBox stats={stats} />
                </div>
            </div>
            {isLoggedIn && isOwnProfile && (
                <div className={styles.actionsSuggestions}>
                    <Button href='/campagne/crea' textSize={18} text="Crea campagna" icon="material-symbols:campaign-outline" type="text" />
                    <Button href='/organizzazioni/crea' textSize={18} text="Crea organizzazione" icon="material-symbols:groups-outline" type="text" />
                    <Button href='/utente/notifiche' textSize={18} text="Notifiche" icon="material-symbols:notifications-outline" type="text" />
                    <Button href={`/utente/modifica`} textSize={18} text="Modifica profilo" icon="material-symbols:edit-outline" type="text" />
                </div>
            )}


            {isLoggedIn && isOwnProfile && signedCampaigns.length > 0 && (
                <div className={styles.carouselContainer}>
                    <Title text='Campagne firmate' hierarchy={2} alignment='left' />
                    {isOwnProfile && (
                        <div className={styles.minorText}>
                            <Paragraph
                                text="Solo tu puoi vedere quali campagne hai firmato."
                                color="accent-900"
                                alignment="left"
                            />
                        </div>
                    )}
                    <Carousel direction="horizontal" items={signedCardItems} />
                </div>
            )}


            {repostedCampaigns.length > 0 && (
                <div className={styles.carouselContainer}>
                <Title text='Campagne ricondivise' hierarchy={2} alignment='left' />
                <Carousel direction="horizontal" items={repostedCardItems} />
                </div>
            )}

            {createdCampaigns.length > 0 && (
                <div className={styles.carouselContainer}>
                <Title text='Campagne create' hierarchy={2} alignment='left' />
                <Carousel direction="horizontal" items={createdCardItems} />
                </div>
            )}

            {organizations.length > 0 && (
                <div className={styles.carouselContainer}>
                <Title text='Organizzazioni' hierarchy={2} alignment='left' />
                <Carousel direction="horizontal" items={organizationCardItems} />
                </div>
            )}

            <Paragraph color='accent-900' text={"Per tutelare la privacy degli utenti, le campagne firmate non sono visibili dai visitatori del profilo, ma il proprietario può ricondividere sul suo profilo le campagne che desidera sostenere pubblicamente."} />

        </div>
    </>;
}