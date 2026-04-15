import styles from './Footer.module.css';
import branding from "@/app/components/logic/branding";

export default function Footer() {
    return <footer className={styles.footer}>
        <p className={styles.text}>{branding.appName} - "{branding.appDescription}" - License {branding.projectLicense}</p>
        <a className={styles.underline} href={branding.repoLink} target="_blank" rel="noopener noreferrer">
            <p className={styles.text}>Visita repository GitHub</p>
        </a>
        <p className={styles.text}>Progetto didattico realizzato per I.T. Leonardo Da Vinci, Carate Brianza, MB</p>
        <p className={styles.text}>Luca Ambrosone | Classe 5°IA</p>
    </footer>
}