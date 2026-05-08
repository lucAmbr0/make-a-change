"use client";

import { useState } from "react";
import Link from "next/link";
import styles from './ProfileChip.module.css';
import { Icon } from "@iconify/react";
import { useUser } from '@/app/components/logic/UserProvider';
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";

export default function Profile() {
    const { user, isLoading } = useUser();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const chipText = isLoading ? "..." : user ? `${user.first_name} ${user.last_name}` : "Accedi";

    function handleClick() {
        if (!user && !isLoading) {
            setIsLoginOpen(true);
        }
    }

    function handleMenuOpen() {
        if (user && !isLoading) {
            setIsMenuOpen(true);
        }
    }

    function handleMenuClose() {
        if (user && !isLoading) {
            setIsMenuOpen(false);
        }
    }

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            window.location.reload();
        }
    }

    return <>
        <div
            className={styles.profileChipWrapper}
            onMouseEnter={handleMenuOpen}
            onMouseLeave={handleMenuClose}
        >
            <button 
                className={styles.profileChipContainer} 
                onClick={handleClick} 
                type="button"
                aria-expanded={isMenuOpen}
            >
                <Icon icon="material-symbols:account-circle-outline" className={styles.profileIcon} fontSize={"20px"} />
                <p className={styles.chipText}>{chipText}</p>
            </button>
            {user && isMenuOpen && (
                <div className={styles.profileMenu}>
                    <Link href="/utente" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                        <Icon icon="material-symbols:person-outline" className={styles.menuIcon} fontSize={"20px"} />
                        <span>My profile</span>
                    </Link>
                    <Link href="/campagne" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                        <Icon icon="material-symbols:campaign-outline" className={styles.menuIcon} fontSize={"20px"} />
                        <span>New campaign</span>
                    </Link>
                    <Link href="/organizzazioni" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                        <Icon icon="material-symbols:groups-outline" className={styles.menuIcon} fontSize={"20px"} />
                        <span>Join organization</span>
                    </Link>
                    <button className={styles.menuItem} onClick={handleLogout} type="button">
                        <Icon icon="material-symbols:logout" className={styles.menuIcon} fontSize={"20px"} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
}
