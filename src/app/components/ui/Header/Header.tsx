import styles from './Header.module.css';
import Navbar from "../Navbar/Navbar";
import branding from "@/app/components/logic/branding";
import Link from 'next/link';
import Profile from '../ProfileChip/ProfileChip';

export default function Header() {
    return <header className={styles.header}>
        <Link href={'/'} className={`${styles.headerTitle} ${styles.leftSlot}`}><h1 className={styles.headerTitle}>{branding.appName}</h1></Link>
        <div className={styles.centerSlot}>
            <Navbar links={[{ title: "Home", link: "/" }, { title: "Campagne", link: "/campagne" }, { title: "Organizzazioni", link: "/organizzazioni" }, { title: "Informazioni", link: "/informazioni" }]} />
        </div>
        <div className={styles.rightSlot}>
            <Profile />
        </div>
    </header>
}