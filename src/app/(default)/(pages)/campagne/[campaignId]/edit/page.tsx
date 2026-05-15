import viewStyles from "../page.module.css";
import styles from "./page.module.css";
import { resolveCoverSrc } from "@/app/components/logic/coverImage";
import OrganizationCard from "@/app/components/ui/OrganizationCard/OrganizationCard";
import ProgressBar from "@/app/components/ui/ProgressBar/ProgressBar";
import Title from "@/app/components/ui/Typography/Title/Title";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import InlineEditField from "@/app/components/ui/InlineEditField/InlineEditField";
import InlineToggleField from "@/app/components/ui/InlineEditField/InlineToggleField";
import CoverImageEditor from "@/app/components/ui/InlineEditField/CoverImageEditor";
import DeleteCampaignButton from "@/app/components/ui/DeleteCampaignButton/DeleteCampaignButton";
import Banner from "@/app/components/ui/Banner/Banner";
import Button from "@/app/components/ui/Button/Button";
import { authGetCampaign } from "@/lib/services/campaignService";
import { authGetOrganization } from "@/lib/services/organizationService";
import { getServerCtx } from "@/lib/auth/ctx";
import { NotFoundError } from "@/lib/errors/ApiError";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import branding from "@/app/components/logic/branding";

export const dynamic = "force-dynamic";

async function loadCampaign(campaignId: number) {
    const ctx = await getServerCtx();
    try {
        const campaign = await authGetCampaign(ctx, campaignId);
        return { ctx, campaign };
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
    const { campaignId } = await params;
    const parsed = Number.parseInt(campaignId, 10);
    if (Number.isNaN(parsed)) return { title: branding.appName };
    const { campaign } = await loadCampaign(parsed);
    return { title: `Modifica: ${campaign.title} - ${branding.appName}` };
}

export default async function EditPage({
    params,
}: {
    params: Promise<{ campaignId: string }>;
}) {
    const { campaignId } = await params;
    const parsedCampaignId = Number.parseInt(campaignId, 10);
    if (Number.isNaN(parsedCampaignId)) notFound();

    const { ctx, campaign } = await loadCampaign(parsedCampaignId);

    if (!campaign.permissions?.can_edit) notFound();

    const organization = campaign.organization_id
        ? await authGetOrganization(ctx, campaign.organization_id).catch(() => null)
        : null;

    return (
        <>
            <Banner
                primaryLabel="Modalità modifica"
                secondaryLabel="Clicca su un elemento per modificarlo."
                actions={
                    <Button
                        href={`/campagne/${parsedCampaignId}`}
                        text="Torna alla pagina"
                        icon="material-symbols:arrow-back"
                        type="outlined"
                        textSize={16}
                    />
                }
            />

            <div className={styles.settingsSection}>
                <h2 className={styles.settingsTitle}>Impostazioni</h2>
                <div className={styles.toggleItem}>
                    <InlineToggleField
                        campaignId={parsedCampaignId}
                        field="is_public"
                        initialValue={campaign.is_public}
                        label="Campagna pubblica"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
                <div className={styles.toggleItem}>
                    <InlineToggleField
                        campaignId={parsedCampaignId}
                        field="comments_active"
                        initialValue={campaign.comments_active}
                        label="Commenti attivi"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
                <div className={styles.toggleItem}>
                    <InlineToggleField
                        campaignId={parsedCampaignId}
                        field="comments_require_approval"
                        initialValue={campaign.comments_require_approval}
                        label="Trattieni i commenti per l'approvazione"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
                <div className={styles.toggleItem}>
                    <InlineToggleField
                        campaignId={parsedCampaignId}
                        field="is_archived"
                        initialValue={campaign.is_archived}
                        label="Campagna archiviata"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
            </div>

            <div className={viewStyles.campaignSummaryContainer}>
                <div className={viewStyles.campaignSummaryImageContainer}>
                    <CoverImageEditor
                        campaignId={parsedCampaignId}
                        initialValue={campaign.cover_path ?? null}
                        src={resolveCoverSrc(campaign.cover_path)}
                        imageClassName={viewStyles.campaignSummaryImage}
                    />
                </div>
                <div className={viewStyles.campaignSummaryTextContainer}>
                    <div className={styles.titleField}>
                        <InlineEditField
                            campaignId={parsedCampaignId}
                            field="title"
                            initialValue={campaign.title}
                            kind="text"
                            placeholder="Titolo campagna"
                        >
                            <h1>{campaign.title}</h1>
                        </InlineEditField>
                    </div>
                    <h2>{campaign.organization_name}</h2>
                    <div className={viewStyles.progressBar}>
                        <InlineEditField
                            campaignId={parsedCampaignId}
                            field="signature_goal"
                            initialValue={campaign.signature_goal ?? null}
                            kind="number"
                            placeholder="Obiettivo firme"
                        >
                            <ProgressBar
                                showLabel={true}
                                unit="sostenitori"
                                total={campaign.signature_goal || 0}
                                current={campaign.signatures}
                            />
                        </InlineEditField>
                    </div>
                </div>
            </div>

            <div className={viewStyles.campaignInfoBodyContainer}>
                <Title text="Informazioni su questa proposta" hierarchy={2} />
                <div className={styles.descriptionField}>
                    <InlineEditField
                        campaignId={parsedCampaignId}
                        field="description"
                        initialValue={campaign.description ?? null}
                        kind="textarea"
                        placeholder="Aggiungi una descrizione"
                    >
                        <Paragraph
                            text={campaign.description || ""}
                            color="accent-950"
                            alignment="justify"
                        />
                    </InlineEditField>
                </div>
            </div>

            {organization && (
                <div className={viewStyles.organizationInfoContainer}>
                    <div className={viewStyles.organizationCardContainer}>
                        <OrganizationCard organization={organization} />
                    </div>
                    <div className={viewStyles.organizationInfoText}>
                        <Title text="Informazioni sull'ente promotore" hierarchy={2} />
                        <Paragraph
                            text={organization.description || ""}
                            color="accent-950"
                            alignment="justify"
                        />
                    </div>
                </div>
            )}

            <DeleteCampaignButton
                campaignId={parsedCampaignId}
                campaignTitle={campaign.title}
            />
        </>
    );
}
