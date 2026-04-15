import styles from "./page.module.css";
import branding from "@/app/components/logic/branding";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Title from "@/app/components/ui/Typography/Title/Title";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Informazioni - " + branding.appName,
};

export default function Page() {

    const paragraphs = [
        { title: "La partecipazione come fondamento della democrazia", content: "La democrazia non si limita al momento elettorale, ma si manifesta quotidianamente attraverso la partecipazione attiva dei cittadini. Essere coinvolti nella vita della comunità significa contribuire alla definizione delle priorità, proporre soluzioni concrete e controllare l’operato delle istituzioni. La partecipazione rafforza la coesione sociale, crea responsabilità condivise e permette a ogni individuo di influenzare le decisioni che impattano la propria realtà. Questa piattaforma nasce con l’obiettivo di facilitare e valorizzare questo coinvolgimento, offrendo strumenti per trasformare le opinioni personali in iniziative concrete che possano trovare sostegno e visibilità all’interno della comunità." },
        { title: "Il diritto di associarsi e far sentire la propria voce", content: "La Costituzione italiana riconosce il diritto di associarsi liberamente e di esprimere le proprie opinioni attraverso forme collettive. Questo diritto costituisce un pilastro della cittadinanza attiva, poiché consente ai cittadini di organizzarsi per perseguire obiettivi comuni, promuovere cause condivise e influenzare la vita pubblica. La possibilità di unirsi a organizzazioni e gruppi, o di creare campagne indipendenti, garantisce a ciascun individuo di esercitare concretamente la propria voce. La piattaforma si pone come strumento per esercitare questi diritti in maniera strutturata, sicura e trasparente, facilitando la partecipazione civica nel contesto locale." },
        { title: "Dalla proposta individuale all’azione collettiva", content: "Le idee individuali assumono pieno valore quando si trasformano in azioni collettive. Una singola proposta può avere un impatto limitato, ma quando viene condivisa, discussa e sostenuta da più cittadini, diventa un mezzo efficace per incidere concretamente sulle decisioni che riguardano la comunità. La piattaforma consente di pubblicare iniziative, promuoverle all’interno di gruppi e organizzazioni e raccogliere firme come segno di adesione. Questo processo trasforma l’interesse individuale in mobilitazione collettiva, facilitando la collaborazione tra cittadini con obiettivi comuni e rendendo tangibile la capacità di ciascuno di contribuire al cambiamento sociale." },
        { title: "Tecnologia al servizio della cittadinanza attiva", content: "Gli strumenti digitali rappresentano un’opportunità fondamentale per rendere la partecipazione civica più accessibile e visibile. Questa piattaforma utilizza il web e il database per organizzare, rendere tracciabili e condividere le iniziative locali, facilitando la comunicazione tra cittadini e organizzazioni. La tecnologia permette di raccogliere firme, monitorare il progresso delle campagne e garantire trasparenza nelle attività collettive. In questo modo, ogni cittadino può contribuire in maniera efficace, supportare le proposte che ritiene rilevanti e accedere a informazioni aggiornate, promuovendo una partecipazione consapevole e strutturata, coerente con i principi della democrazia e della cittadinanza attiva." }
    ];

    return <>
        <Title text="Presentazione del Progetto" hierarchy={1} alignment="center" />

        {paragraphs.map(p => <section className={styles.section} key={p.title}>
            <Title text={p.title} hierarchy={2} alignment="left" />
            <Paragraph text={p.content} alignment="justify" color="accent-950" />
        </section>)}

    </>
}