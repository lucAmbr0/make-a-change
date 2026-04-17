"use client";

import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import Navbar from "../Navbar/Navbar";
import branding from "@/app/components/logic/branding";
import Link from 'next/link';
import Profile from '../ProfileChip/ProfileChip';

export default function Header() {
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        let rafId = 0;
        let lastScrollY = window.scrollY;

        const updateHeaderState = () => {
            const currentScrollY = window.scrollY;
            const nextCompact = currentScrollY > 24 && currentScrollY > lastScrollY;

            lastScrollY = currentScrollY;
            setIsCompact(nextCompact);
            rafId = 0;
        };

        const handleScroll = () => {
            if (rafId !== 0) {
                return;
            }

            rafId = window.requestAnimationFrame(updateHeaderState);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (rafId !== 0) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, []);

    return <header className={`${styles.header} ${isCompact ? styles.headerCompact : ''}`}>
        <div className={styles.topRow}>
            <Link href={'/'} className={`${styles.headerTitle} ${styles.leftSlot}`}><h1 className={styles.headerTitle}>{branding.appName}</h1></Link>
            <div className={styles.rightSlot}>
                <Profile />
            </div>
        </div>
        <div className={styles.centerSlot}>
            <Navbar links={[{ title: "Home", link: "/" }, { title: "Campagne", link: "/campagne" }, { title: "Organizzazioni", link: "/organizzazioni" }, { title: "Informazioni", link: "/informazioni" }]} />
        </div>
    </header>
}