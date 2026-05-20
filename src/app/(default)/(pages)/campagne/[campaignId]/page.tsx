import styles from "./page.module.css";
import AddCommentBox from "@/app/components/ui/AddCommentBox/AddCommentBox";
import { resolveCoverSrc } from "@/app/components/logic/coverImage";
import Button from "@/app/components/ui/Button/Button";
import SupportSignature from "@/app/components/ui/SupportSignature/SupportSignature";
import CampaignCard from "@/app/components/ui/CampaignCard/CampaignCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import DetailHero from "@/app/components/ui/DetailHero/DetailHero";
import OrganizationCard from "@/app/components/ui/OrganizationCard/OrganizationCard";
import PageSection from "@/app/components/ui/PageSection/PageSection";
import ProgressBar from "@/app/components/ui/ProgressBar/ProgressBar";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Title from "@/app/components/ui/Typography/Title/Title";
import { campaignResponseSchema } from "@/lib/schemas/campaigns";
import { notFound } from "next/navigation";
import CommentBox from "@/app/components/ui/CommentBox/CommentBox";
import PendingCommentBox from "@/app/components/ui/PendingCommentBox/PendingCommentBox";
import {
    authGetCampaign,
    getCampaignsFromSameOrganization,
} from "@/lib/services/campaignService";
import { authGetCampaignComments } from "@/lib/services/commentService";
import { authGetOrganization } from "@/lib/services/organizationService";
import { getUserSignatureInCampaign } from "@/lib/db/signatures";
import { getServerCtx } from "@/lib/auth/ctx";
import { NotFoundError } from "@/lib/errors/ApiError";
import { Metadata } from "next";
import Link from "next/link";
import branding from "@/app/components/logic/branding";
import Banner from "@/app/components/ui/Banner/Banner";
import ShareButton from "@/app/components/ui/Modal/ShareCampaignModal/ShareButton";
import { getOptionalAuth } from "@/lib/auth/auth";
import { getMember } from "@/lib/services/memberService";
import { repostExists } from "@/lib/db/reposts";
import RepostCampaignButton from "@/app/components/ui/RepostCampaignButton/RepostCampaignButton";

async function safeGetCampaign(campaignId: number) {
    const ctx = await getServerCtx();
    try {
        return await authGetCampaign(ctx, campaignId);
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ campaignId: string }> }): Promise<Metadata> {
    const { campaignId } = await params;
    const parsedCampaignId = Number.parseInt(campaignId, 10);

    if (Number.isNaN(parsedCampaignId)) {
        return { title: branding.appName };
    }

    const campaign = await safeGetCampaign(parsedCampaignId);
    return { title: `${campaign.title} - ${branding.appName}` };
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
    const { campaignId } = await params;
    const parsedCampaignId = Number.parseInt(campaignId, 10);

    if (Number.isNaN(parsedCampaignId)) notFound();

    const ctx = await getServerCtx();

    let campaign;
    try {
        campaign = await authGetCampaign(ctx, parsedCampaignId);
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }

    const [organization, comments, relatedCampaigns] = await Promise.all([
        campaign.organization_id
            ? authGetOrganization(ctx, campaign.organization_id).catch(() => null)
            : Promise.resolve(null),
        campaign.comments_active
            ? authGetCampaignComments(ctx, parsedCampaignId).catch(() => [])
            : Promise.resolve([]),
        campaign.organization_id
            ? getCampaignsFromSameOrganization(
                ctx,
                campaign.organization_id,
                parsedCampaignId,
            ).catch(() => [] as campaignResponseSchema[])
            : Promise.resolve([] as campaignResponseSchema[]),
    ]);

    const relatedCampaignCards = relatedCampaigns.map((campaignItem) => (
        <CampaignCard key={campaignItem.id} campaign={campaignItem} href={`/campagne/${campaignItem.id}`} />
    ));

    const auth = getOptionalAuth(ctx);

    let userRole = "";
    let userHasSigned = false;
    let userHasReposted = false;
    if (auth.userId !== null) {
        if (campaign.creator_id === auth.userId) {
            userRole = "proprietario";
        } else if (campaign.organization_id) {
            const memberRecord = await getMember(auth.userId, campaign.organization_id);
            if (memberRecord?.is_owner) {
                userRole = "proprietario dell'organizzazione";
            } else if (memberRecord?.is_moderator) {
                userRole = "moderatore nell'organizzazione";
            }
        }

        const userSignature = await getUserSignatureInCampaign({
            signer_id: auth.userId,
            campaign_id: parsedCampaignId,
        }).catch(() => null);
        userHasSigned = !!userSignature;

        userHasReposted = await repostExists({
            user_id: auth.userId,
            campaign_id: parsedCampaignId,
        }).catch(() => false);
    }

    const showRoleBanner = userRole !== "" && campaign.permissions?.can_edit;

    return <>
        {showRoleBanner && (
            <Banner
                primaryLabel={"Sei " + userRole + " di questa campagna."}
                actions={
                    <Button
                        href={`/campagne/${parsedCampaignId}/edit`}
                        text="Modifica campagna"
                        icon="edit"
                        type="outlined"
                        textSize={18}
                    />
                }
            />
        )}
        <DetailHero imageSrc={resolveCoverSrc(campaign.cover_path)} imageAlt="Immagine campagna">
            <h1>{campaign.title}</h1>
            <h2>{campaign.organization_name}</h2>
            {campaign.creator_id && (
                <Link href={`/utente/${campaign.creator_id}`}>
                    <Paragraph
                        text={((`Promossa da ${campaign.creator_first_name || ""} ${campaign.creator_last_name || ""}`).trim() || "Anonimo")}
                        alignment="left"
                        color="accent-950"
                    />
                </Link>
            )}
            <div className={styles.actionsContainer}>
                <SupportSignature
                    campaignId={parsedCampaignId}
                    campaignTitle={campaign.title}
                    campaignOrganizationName={campaign.organization_name || ""}
                    campaignCreatorName={campaign.creator_first_name && campaign.creator_last_name ? `${campaign.creator_first_name} ${campaign.creator_last_name}` : null}
                    alreadySigned={userHasSigned}
                    isAuthenticated={auth.userId !== null}
                    isCreator={auth.userId !== null && campaign.creator_id === auth.userId}
                />
                {auth.userId !== null && (
                    <RepostCampaignButton
                        campaignId={parsedCampaignId}
                        initialReposted={userHasReposted}
                    />
                )}
                <ShareButton title={campaign.title} />
            </div>
            <div className={styles.progressBar}>
                <ProgressBar showLabel={true} unit="sostenitori" total={campaign.signature_goal || 0} current={campaign.signatures} />
            </div>
        </DetailHero>
        <PageSection>
            <Title text="Informazioni su questa proposta" hierarchy={2} />
            <Paragraph text={campaign.description} color="accent-950" alignment="justify" />
        </PageSection>
        {organization &&
            <div className={styles.organizationInfoContainer}>
                <div className={styles.organizationCardContainer}>
                    <OrganizationCard organization={organization} href={`/organizzazioni/${organization.id}`} />
                </div>
                <div className={styles.organizationInfoText}>
                    <Title text="Informazioni sull'ente promotore" hierarchy={2} />
                    <Paragraph text={organization.description || ""} color="accent-950" alignment="justify" />
                </div>
            </div>
        }
        {campaign.comments_active ? (
            <PageSection id="commenti">
                <Title text="Commenti" hierarchy={2} />
                <div className={styles.addCommentBox}>
                    {campaign.comments_require_approval ? (
                        <p className={styles.commentsApprovalWarn}>Il tuo commento sarà pubblicato previa approvazione dei moderatori</p>
                    ) : null}
                    <AddCommentBox
                        campaignId={parsedCampaignId}
                        canComment={campaign.permissions?.can_comment ?? true}
                        requiresApproval={!!campaign.comments_require_approval}
                    />
                </div>
                <div className={styles.commentsContainer}>
                    {comments.map((comment) =>
                        !comment.visible && comment.permissions?.can_moderate ? (
                            <PendingCommentBox
                                key={comment.id}
                                commentId={comment.id}
                                campaignId={parsedCampaignId}
                                authorName={`${comment.user_first_name || ""} ${comment.user_last_name || ""}`.trim() || "Anonimo"}
                                authorId={comment.user_id}
                                commentText={comment.text}
                                commentDatetime={comment.created_at?.toISOString()}
                            />
                        ) : (
                            <CommentBox
                                key={comment.id}
                                authorName={`${comment.user_first_name || ""} ${comment.user_last_name || ""}`.trim() || "Anonimo"}
                                commentText={comment.text}
                                commentId={comment.id}
                                authorId={comment.user_id}
                                campaignId={parsedCampaignId}
                                canDelete={comment.permissions?.can_delete ?? false}
                                commentDatetime={comment.created_at?.toISOString()}
                            />
                        )
                    )}
                </div>
            </PageSection>
        ) : null}
        {organization && relatedCampaigns.length > 0 &&
            <PageSection>
                <Title text={`Altre iniziative da ${organization?.name}`} hierarchy={2} />
                <Carousel
                    direction="horizontal"
                    items={relatedCampaignCards}
                />
            </PageSection>
        }
    </>
}
