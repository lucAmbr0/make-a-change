import styles from "./page.module.css";
import AddCommentBox from "@/app/components/ui/AddCommentBox/AddCommentBox";
import placeholders from "@/app/components/logic/placeholders";
import Button from "@/app/components/ui/Button/Button";
import CampaignCard from "@/app/components/ui/CampaignCard/CampaignCard";
import Carousel from "@/app/components/ui/Carousel/Carousel";
import OrganizationCard from "@/app/components/ui/OrganizationCard/OrganizationCard";
import ProgressBar from "@/app/components/ui/ProgressBar/ProgressBar";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Title from "@/app/components/ui/Typography/Title/Title";
import { campaignResponseSchema } from "@/lib/schemas/campaigns";
import { organizationResponseSchema } from "@/lib/schemas/organization";
import { commentResponseSchema } from "@/lib/schemas/comments";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import CommentBox from "@/app/components/ui/CommentBox/CommentBox";
import { getCampaignsFromSameOrganization } from "@/lib/services/campaignService";
import { NextRequest } from "next/server";

async function getCampaign(campaignId: number) {
    const requestHeaders = await headers();
    const cookieStore = await cookies();
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const host = requestHeaders.get("host");

    if (!host) {
        throw new Error("Unable to resolve request host for campaign fetch");
    }

    const response = await fetch(`${protocol}://${host}/api/campaign/${campaignId}`, {
        cache: "no-store",
        headers: {
            cookie: cookieStore.toString(),
        },
    });

    if (response.status === 404) {
        notFound();
    }

    if (!response.ok) {
        throw new Error(`Failed to load campaign ${campaignId}`);
    }

    const data = await response.json();
    return campaignResponseSchema.parse(data);
}

async function getCampaignComments(campaignId: number) {
    const requestHeaders = await headers();
    const cookieStore = await cookies();
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const host = requestHeaders.get("host");

    if (!host) {
        throw new Error("Unable to resolve request host for comments fetch");
    }

    const response = await fetch(`${protocol}://${host}/api/campaign/${campaignId}/comments`, {
        cache: "no-store",
        headers: {
            cookie: cookieStore.toString(),
        },
    });

    if (!response.ok) {
        console.error(`Failed to load comments for campaign ${campaignId}`);
        return [];
    }

    const data = await response.json();
    return data as commentResponseSchema[];
}

async function getOrganization(organizationId: number) {
    const requestHeaders = await headers();
    const cookieStore = await cookies();
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const host = requestHeaders.get("host");

    if (!host) {
        throw new Error("Unable to resolve request host for organization fetch");
    }

    const response = await fetch(`${protocol}://${host}/api/organization/${organizationId}`, {
        cache: "no-store",
        headers: {
            cookie: cookieStore.toString(),
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return organizationResponseSchema.parse(data);
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
    const { campaignId } = await params;
    const parsedCampaignId = Number.parseInt(campaignId, 10);

    if (Number.isNaN(parsedCampaignId)) {
        notFound();
    }

    const campaign = await getCampaign(parsedCampaignId);
    const organization = campaign.organization_id ? await getOrganization(campaign.organization_id) : null;
    const comments = await getCampaignComments(parsedCampaignId);
    
    // Fetch campaigns from the same organization if it exists
    let relatedCampaigns: campaignResponseSchema[] = [];
    if (campaign.organization_id) {
        try {
            const req = {
                headers: await headers(),
                cookies: await cookies(),
            } as unknown as NextRequest;
            relatedCampaigns = await getCampaignsFromSameOrganization(req, campaign.organization_id, parsedCampaignId);
        } catch (error) {
            console.error("Failed to fetch related campaigns:", error);
        }
    }

    const relatedCampaignCards = relatedCampaigns.map((campaignItem) => (
        <CampaignCard key={campaignItem.id} campaign={campaignItem} href={`/campagne/${campaignItem.id}`} />
    ));

    return <>
        <div className={styles.campaignSummaryContainer}>
            <img className={styles.campaignSummaryImage} src={campaign.cover_path || placeholders.campaignPlaceholderImage} alt={"Immagine campagna"} />
            <div className={styles.campaignSummaryTextContainer}>
                <h1>{campaign.title}</h1>
                <h2>{campaign.organization_name}</h2>
                <div className={styles.actionsContainer}>
                    <Button text="Sostieni" icon="list-alt-check" type="filled" />
                    <Button text="Condividi" icon="share" type="outlined" />
                </div>
                <div className={styles.progressBar}>
                    <ProgressBar showLabel={true} unit="sostenitori" total={campaign.signature_goal || 0} current={campaign.signatures} />
                </div>
            </div>
        </div>
        <div className={styles.campaignInfoBodyContainer}>
            <Title text="Informazioni su questa proposta" hierarchy={2} />
            <Paragraph text={campaign.description} color="accent-950" alignment="justify" />
        </div>
        {organization &&
            <div className={styles.organizationInfoContainer}>
                <div className={styles.organizationCardContainer}>
                    {/* organization card placeholder */}
                    <OrganizationCard organization={organization} />
                </div>
                <div className={styles.organizationInfoText}>
                    <Title text="Informazioni sull'ente promotore" hierarchy={2} />
                    <Paragraph text={organization.description || ""} color="accent-950" alignment="justify" />
                </div>
            </div>
        }
        <div className={styles.commentsSectionContainer}>
            <Title text="Commenti" hierarchy={2} />
            <div className={styles.addCommentBox}>
                <AddCommentBox />
            </div>
            <div className={styles.commentsContainer}>
                {comments.map((comment) => (
                    <CommentBox
                        key={comment.id}
                        authorName={`${comment.user_first_name || ""} ${comment.user_last_name || ""}`.trim() || "Anonimo"}
                        commentText={comment.text}
                        commentId={comment.id}
                        authorId={comment.user_id}
                        campaignId={parsedCampaignId}
                        campaignCreatorId={campaign.creator_id}
                        organizationId={campaign.organization_id ?? undefined}
                    />
                ))}
            </div>
        </div>
        {organization && relatedCampaigns.length > 0 &&
            <div className={styles.commentsSectionContainer}>
                <Title text={`Altre iniziative da ${organization?.name}`} hierarchy={2} />
                <Carousel
                    direction="horizontal"
                    items={relatedCampaignCards}
                />
            </div>
        }

    </>
}