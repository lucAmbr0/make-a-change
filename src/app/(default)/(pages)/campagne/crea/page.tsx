import Title from "@/app/components/ui/Typography/Title/Title";
import styles from "./page.module.css";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import { Metadata } from "next";
import branding from "@/app/components/logic/branding";
import { getServerCtx } from "@/lib/auth/ctx";
import { getOptionalAuth } from "@/lib/auth/auth";
import { getAuthorizedOrganizations } from "@/lib/services/organizationService";
import { getMember } from "@/lib/services/memberService";
import { notFound } from "next/navigation";
import CreateCampaignForm from "./CreateCampaignForm";

export const metadata: Metadata = {
    title: `Crea campagna - ${branding.appName}`,
    description: "Dai vita alla tua iniziativa con il nostro strumento di creazione campagna. Compila il form con titolo, descrizione e opzioni di pubblicazione per condividere la tua causa e coinvolgere la comunità.",
}

export default async function Page() {
    const ctx = await getServerCtx();
    const auth = getOptionalAuth(ctx);
    if (auth.userId === null) notFound();

    const userId = auth.userId;
    const organizations = await getAuthorizedOrganizations(ctx).catch(() => []);

    const memberRecords = await Promise.all(
        organizations.map((o: any) => getMember(userId, o.id).catch(() => null)),
    );

    const filteredOrgs = organizations
        .filter((o: any, idx: number) => {
            const m = memberRecords[idx];
            if (m && (m.is_owner || m.is_moderator)) return true;
            return o.creator_id === userId;
        })
        .map((o: any) => ({ id: o.id as number, name: o.name as string }));

    return (
        <div className={styles.pageContainer}>
            <Title text="Crea nuova campagna" hierarchy={1} />
            <Paragraph text="Compila il form per dare vita alla tua iniziativa e condividerla" />
            <CreateCampaignForm organizations={filteredOrgs} />
        </div>
    );
}
