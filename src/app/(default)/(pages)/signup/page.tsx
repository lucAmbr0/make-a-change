import styles from './page.module.css'
import branding from "@/app/components/logic/branding";
import InlineEditField from '@/app/components/ui/InlineEditField/InlineEditField';
import InputField from '@/app/components/ui/InputField/InputField';
import Title from "@/app/components/ui/Typography/Title/Title";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crea account - " + branding.appName,
};

export default function Page() {
    return <>
        <Title text="Crea il tuo account" alignment="center" hierarchy={1} />
        <form action="" className={styles.form}>
            <Title text="Inserisci i tuoi dati" alignment="left" hierarchy={2} />
            <div className={styles.userDataInputContainer}>
            <InputField type='text' label='Nome' placeholder='Nome' title='Nome' maxLength={40} required minLength={2}  />
            <InputField type='text' label='Cognome'placeholder='Cognome' title='Cognome' maxLength={40} required minLength={2}  />
            <InputField type='date' label='Data di nascita' placeholder='Data di nascita' title='Data di nascita' maxLength={40} required minLength={2}  />
            </div>
            <Title text="Imposta la tua password" alignment="left" hierarchy={2} />
        </form>
    </>;
}