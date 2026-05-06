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
        // Deadzone prevents flicker from mobile scroll noise (momentum, address-bar
        // resize, layout shift caused by the compact transition itself).
        const DELTA_THRESHOLD = 8;

        const updateHeaderState = () => {
            rafId = 0;
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;

            if (Math.abs(delta) < DELTA_THRESHOLD) {
                return;
            }

            lastScrollY = currentScrollY;
            setIsCompact(currentScrollY > 24 && delta > 0);
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
            <Link href={'/'} className={`${styles.headerTitle} ${styles.leftSlot}`}><img src={branding.logo} className={styles.logo} alt={branding.appName} /><h1 className={styles.titleText}>{branding.appName}</h1></Link>
            <div className={styles.rightSlot}>
                <Profile />
            </div>
        </div>
        <div className={styles.centerSlot}>
            <Navbar links={[{ title: "Home", link: "/" }, { title: "Campagne", link: "/campagne" }, { title: "Organizzazioni", link: "/organizzazioni" }, { title: "Informazioni", link: "/informazioni" }]} />
        </div>
    </header>
}