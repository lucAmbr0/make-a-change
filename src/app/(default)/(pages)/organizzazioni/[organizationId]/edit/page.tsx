import styles from "./page.module.css";
import { resolveCoverSrc } from "@/app/components/logic/coverImage";
import Title from "@/app/components/ui/Typography/Title/Title";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import InlineEditField from "@/app/components/ui/InlineEditField/InlineEditField";
import InlineToggleField from "@/app/components/ui/InlineEditField/InlineToggleField";
import CoverImageEditor from "@/app/components/ui/InlineEditField/CoverImageEditor";
import DeleteOrganizationButton from "@/app/components/ui/DeleteOrganizationButton/DeleteOrganizationButton";
import Banner from "@/app/components/ui/Banner/Banner";
import Button from "@/app/components/ui/Button/Button";
import { authGetOrganization } from "@/lib/services/organizationService";
import { getServerCtx } from "@/lib/auth/ctx";
import { NotFoundError, UnauthorizedError } from "@/lib/errors/ApiError";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import branding from "@/app/components/logic/branding";
import { getOptionalAuth } from "@/lib/auth/auth";
import { isOrganizationModeratorOrOwner } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

async function loadOrganization(organizationId: number) {
    const ctx = await getServerCtx();
    try {
        const organization = await authGetOrganization(ctx, organizationId);
        return { ctx, organization };
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ organizationId: string }>;
}): Promise<Metadata> {
    const { organizationId } = await params;
    const parsed = Number.parseInt(organizationId, 10);
    if (Number.isNaN(parsed)) return { title: branding.appName };
    const { organization } = await loadOrganization(parsed);
    return { title: `Modifica: ${organization.name} - ${branding.appName}` };
}

export default async function EditPage({
    params,
}: {
    params: Promise<{ organizationId: string }>;
}) {
    const { organizationId } = await params;
    const parsedId = Number.parseInt(organizationId, 10);
    if (Number.isNaN(parsedId)) notFound();

    const { ctx, organization } = await loadOrganization(parsedId);

    const auth = getOptionalAuth(ctx);
    if (!auth.userId) notFound();

    const canEdit = await isOrganizationModeratorOrOwner(auth.userId, parsedId, ctx).catch(() => false);
    if (!canEdit) notFound();

    const apiPath = `/api/organization/${parsedId}`;

    return (
        <>
            <Banner
                primaryLabel="Modalità modifica"
                secondaryLabel="Clicca su un elemento per modificarlo."
                actions={
                    <Button
                        href={`/organizzazioni/${parsedId}`}
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
                        apiPath={apiPath}
                        field="is_public"
                        initialValue={organization.is_public}
                        label="Organizzazione pubblica"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
                <div className={styles.toggleItem}>
                    <InlineToggleField
                        apiPath={apiPath}
                        field="requires_approval"
                        initialValue={organization.requires_approval}
                        label="Richiede approvazione per entrare"
                        labelClassName={styles.toggleLabel}
                        inputClassName={styles.toggleCheckbox}
                        errorClassName={styles.toggleError}
                    />
                </div>
            </div>

            <div className={styles.orgSummaryContainer}>
                <div className={styles.orgSummaryImageContainer}>
                    <CoverImageEditor
                        apiPath={apiPath}
                        initialValue={organization.cover_path ?? null}
                        src={resolveCoverSrc(organization.cover_path)}
                        imageClassName={styles.orgSummaryImage}
                    />
                </div>
                <div className={styles.orgSummaryTextContainer}>
                    <div className={styles.nameField}>
                        <InlineEditField
                            apiPath={apiPath}
                            field="name"
                            initialValue={organization.name}
                            kind="text"
                            placeholder="Nome organizzazione"
                        >
                            <h1>{organization.name}</h1>
                        </InlineEditField>
                    </div>
                    <InlineEditField
                        apiPath={apiPath}
                        field="category"
                        initialValue={organization.category ?? null}
                        kind="text"
                        placeholder="Categoria"
                    >
                        <h2>{organization.category}</h2>
                    </InlineEditField>
                </div>
            </div>

            <div className={styles.orgInfoBodyContainer}>
                <Title text="Informazioni sull'organizzazione" hierarchy={2} />
                <div className={styles.descriptionField}>
                    <InlineEditField
                        apiPath={apiPath}
                        field="description"
                        initialValue={organization.description ?? null}
                        kind="textarea"
                        placeholder="Aggiungi una descrizione"
                    >
                        <Paragraph
                            text={organization.description || ""}
                            color="accent-950"
                            alignment="justify"
                        />
                    </InlineEditField>
                </div>
            </div>

            <DeleteOrganizationButton
                organizationId={parsedId}
                organizationName={organization.name}
            />
        </>
    );
}
