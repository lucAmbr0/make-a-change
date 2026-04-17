import styles from "./page.module.css";
import placeholders from "@/app/components/logic/placeholders";
import Button from "@/app/components/ui/Button/Button";
import ProgressBar from "@/app/components/ui/ProgressBar/ProgressBar";
import { campaignResponseSchema } from "@/lib/schemas/campaigns";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

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

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
    const { campaignId } = await params;
    const parsedCampaignId = Number.parseInt(campaignId, 10);

    if (Number.isNaN(parsedCampaignId)) {
        notFound();
    }

    const campaign = await getCampaign(parsedCampaignId);

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
    </>
}