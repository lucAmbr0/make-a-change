import styles from './Header.module.css';
import Navbar from "../Navbar/Navbar";
import branding from "@/app/components/logic/branding";
import Link from 'next/link';

export default function Header() {
    return <header className={styles.header}>
        <Link href={'/'} id="left" className={styles.headerTitle}><h1 className={styles.headerTitle}>{branding.appName}</h1></Link>
        <div id="center">
            <Navbar links={[{ title: "Home", link: "/" }, { title: "Campagne", link: "/campagne" }, { title: "Organizzazioni", link: "/organizzazioni" }, { title: "Informazioni", link: "/informazioni" }]} />
        </div>
        <div id="right" />
    </header>
}