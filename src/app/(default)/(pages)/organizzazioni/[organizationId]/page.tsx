import styles from "./page.module.css";
import { resolveCoverSrc } from "@/app/components/logic/coverImage";
import Button from "@/app/components/ui/Button/Button";
import Banner from "@/app/components/ui/Banner/Banner";
import CampaignCard from "@/app/components/ui/CampaignCard/CampaignCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import DetailHero from "@/app/components/ui/DetailHero/DetailHero";
import PageSection from "@/app/components/ui/PageSection/PageSection";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Title from "@/app/components/ui/Typography/Title/Title";
import { notFound } from "next/navigation";
import { authGetOrganization } from "@/lib/services/organizationService";
import { getOrganizationCampaigns } from "@/lib/services/campaignService";
import { getServerCtx } from "@/lib/auth/ctx";
import { NotFoundError } from "@/lib/errors/ApiError";
import { Metadata } from "next";
import Link from "next/link";
import branding from "@/app/components/logic/branding";
import { getOptionalAuth } from "@/lib/auth/auth";
import { getMember } from "@/lib/services/memberService";
import { getApprovalRequest } from "@/lib/db/approval_requests";
import { Icon } from "@iconify/react";
import JoinOrgButton, { JoinState } from "./JoinOrgButton";

async function safeGetOrganization(organizationId: number) {
    const ctx = await getServerCtx();
    try {
        return await authGetOrganization(ctx, organizationId);
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ organizationId: string }> }): Promise<Metadata> {
    const { organizationId } = await params;
    const parsedId = Number.parseInt(organizationId, 10);
    if (Number.isNaN(parsedId)) return { title: branding.appName };
    const org = await safeGetOrganization(parsedId);
    return { title: `${org.name} - ${branding.appName}` };
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ organizationId: string }> }) {
    const { organizationId } = await params;
    const parsedId = Number.parseInt(organizationId, 10);

    if (Number.isNaN(parsedId)) notFound();

    const ctx = await getServerCtx();

    let organization;
    try {
        organization = await authGetOrganization(ctx, parsedId);
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }

    const auth = getOptionalAuth(ctx);

    const [campaigns, memberRecord, pendingRequest] = await Promise.all([
        getOrganizationCampaigns(ctx, parsedId).catch(() => []),
        auth.userId !== null
            ? getMember(auth.userId, parsedId).catch(() => null)
            : Promise.resolve(null),
        auth.userId !== null
            ? getApprovalRequest({ user_id: auth.userId, organization_id: parsedId }).catch(() => null)
            : Promise.resolve(null),
    ]);

    const joinState: JoinState = memberRecord
        ? 'member'
        : pendingRequest
            ? 'requested'
            : 'idle';

    const canManage = !!(memberRecord?.is_moderator || memberRecord?.is_owner);

    const campaignCards = campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} href={`/campagne/${campaign.id}`} />
    ));

    const creatorName = [organization.creator_first_name, organization.creator_last_name]
        .filter(Boolean)
        .join(" ") || "Anonimo";

    return <>
        {canManage && (
            <Banner
                primaryLabel={memberRecord?.is_owner ? "Sei proprietario di questa organizzazione." : "Sei moderatore di questa organizzazione."}
                actions={
                    <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                            href={`/organizzazioni/${parsedId}/edit`}
                            text="Modifica organizzazione"
                            icon="edit"
                            type="outlined"
                            textSize={18}
                        />
                        <Button
                            href={`/organizzazioni/${parsedId}/members`}
                            text="Gestisci membri"
                            icon="material-symbols:group-outline"
                            type="outlined"
                            textSize={18}
                        />
                    </div>
                }
            />
        )}
        <DetailHero imageSrc={resolveCoverSrc(organization.cover_path)} imageAlt={`Immagine di ${organization.name}`}>
            <h1>{organization.name}</h1>
            {organization.category && <h2>{organization.category}</h2>}
            <Link href={`/utente/${organization.creator_id}`}>
                <Paragraph
                    text={`Creata da ${creatorName}`}
                    alignment="left"
                    color="accent-950"
                />
            </Link>
            <div className={styles.actionsContainer}>
                <JoinOrgButton
                    organizationId={parsedId}
                    initialState={joinState}
                    requiresApproval={organization.requires_approval}
                    isPublic={organization.is_public}
                    isAuthenticated={auth.userId !== null}
                />
                <Button text="Condividi" icon="share" type="outlined" />
            </div>
            <div className={styles.statsContainer}>
                <Icon icon="material-symbols:diversity-3" width="32" height="32" />
                <p>{organization.members_count ?? 0} membri</p>
                <Icon icon="material-symbols:docs-outline" width="32" height="32" />
                <p>{organization.campaigns_count ?? 0} campagne</p>
            </div>
        </DetailHero>
        {organization.description && (
            <PageSection>
                <Title text="Informazioni sull'organizzazione" hierarchy={2} />
                <Paragraph text={organization.description} color="accent-950" alignment="justify" />
            </PageSection>
        )}
        {campaigns.length > 0 && (
            <PageSection>
                <Title text={`Le iniziative da ${organization.name}`} hierarchy={2} />
                <Carousel direction="horizontal" items={campaignCards} />
            </PageSection>
        )}
    </>;
}
