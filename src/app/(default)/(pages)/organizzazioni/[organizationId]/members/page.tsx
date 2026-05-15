import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerCtx } from "@/lib/auth/ctx";
import { getOptionalAuth } from "@/lib/auth/auth";
import { authGetOrganization } from "@/lib/services/organizationService";
import { authGetMembersList } from "@/lib/services/memberService";
import { authGetApprovalRequests } from "@/lib/services/approvalRequestService";
import { authGetInviteCodes } from "@/lib/services/inviteCodeService";
import { isOrganizationModeratorOrOwner, isOrganizationOwner } from "@/lib/auth/permissions";
import { NotFoundError } from "@/lib/errors/ApiError";
import Banner from "@/app/components/ui/Banner/Banner";
import Button from "@/app/components/ui/Button/Button";
import PageSection from "@/app/components/ui/PageSection/PageSection";
import Title from "@/app/components/ui/Typography/Title/Title";
import branding from "@/app/components/logic/branding";
import MembersManager from "./MembersManager";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ organizationId: string }>;
}): Promise<Metadata> {
    const { organizationId } = await params;
    const parsed = Number.parseInt(organizationId, 10);
    if (Number.isNaN(parsed)) return { title: branding.appName };
    const ctx = await getServerCtx();
    try {
        const org = await authGetOrganization(ctx, parsed);
        return { title: `Membri: ${org.name} - ${branding.appName}` };
    } catch {
        return { title: branding.appName };
    }
}

export default async function MembersPage({
    params,
}: {
    params: Promise<{ organizationId: string }>;
}) {
    const { organizationId } = await params;
    const parsedId = Number.parseInt(organizationId, 10);
    if (Number.isNaN(parsedId)) notFound();

    const ctx = await getServerCtx();
    const auth = getOptionalAuth(ctx);
    if (!auth.userId) notFound();

    let organization;
    try {
        organization = await authGetOrganization(ctx, parsedId);
    } catch (error) {
        if (error instanceof NotFoundError) notFound();
        throw error;
    }

    const canManage = await isOrganizationModeratorOrOwner(auth.userId, parsedId, ctx).catch(() => false);
    if (!canManage) notFound();

    const [members, approvalRequests, inviteCodes, userIsOwner] = await Promise.all([
        authGetMembersList(ctx, parsedId).catch(() => []),
        authGetApprovalRequests(ctx, parsedId).catch(() => []),
        authGetInviteCodes(ctx, parsedId).catch(() => []),
        isOrganizationOwner(auth.userId, parsedId, ctx).catch(() => false),
    ]);

    return (
        <>
            <Banner
                primaryLabel={`Gestione membri — ${organization.name}`}
                actions={
                    <Button
                        href={`/organizzazioni/${parsedId}`}
                        text="Torna all'organizzazione"
                        icon="material-symbols:arrow-back"
                        type="outlined"
                        textSize={16}
                    />
                }
            />
            <PageSection>
                <Title text="Gestisci membri" hierarchy={1} />
                <MembersManager
                    organizationId={parsedId}
                    initialMembers={members}
                    initialRequests={approvalRequests}
                    initialInviteCodes={inviteCodes}
                    isOwner={userIsOwner}
                />
            </PageSection>
        </>
    );
}
