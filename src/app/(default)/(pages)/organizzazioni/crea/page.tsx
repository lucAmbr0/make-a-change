import Title from "@/app/components/ui/Typography/Title/Title";
import styles from "./page.module.css";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import { Metadata } from "next";
import branding from "@/app/components/logic/branding";
import { getServerCtx } from "@/lib/auth/ctx";
import { getOptionalAuth } from "@/lib/auth/auth";
import { notFound } from "next/navigation";
import CreateOrganizationForm from "./CreateOrganizationForm";

export const metadata: Metadata = {
    title: `Crea organizzazione - ${branding.appName}`,
    description: "Crea una nuova organizzazione: scegli un nome, aggiungi descrizione e preferenze di visibilità.",
}

export default async function Page() {
    const ctx = await getServerCtx();
    const auth = getOptionalAuth(ctx);
    if (auth.userId === null) notFound();

    return (
        <div className={styles.pageContainer}>
            <Title text="Crea nuova organizzazione" hierarchy={1} />
            <Paragraph text="Compila il form per creare un'organizzazione e gestirne i membri e le campagne" />
            <CreateOrganizationForm />
        </div>
    );
}