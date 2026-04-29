"use client";

import { useState } from "react";
import styles from './ProfileChip.module.css';
import { Icon } from "@iconify/react";
import { useUser } from '@/app/components/logic/UserProvider';
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";
import ConfirmModal from "@/app/components/ui/ConfirmModal/ConfirmModal";

export default function Profile() {
    const { user, isLoading } = useUser();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const chipText = isLoading ? "..." : user ? `${user.first_name} ${user.last_name}` : "Accedi";

    function handleClick() {
        if (user && !isLoading) {
            setIsLogoutOpen(true);
            return;
        }

        if (!user && !isLoading) {
            setIsLoginOpen(true);
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
        <button className={styles.profileChipContainer} onClick={handleClick} type="button">
            <Icon icon="material-symbols:account-circle-outline" className={styles.profileIcon} fontSize={"32px"} />
            <p className={styles.chipText}>{chipText}</p>
        </button>
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <ConfirmModal
            open={isLogoutOpen}
            title="Debug logout"
            description="This temporary modal lets you sign out quickly while testing."
            confirmLabel="Logout"
            cancelLabel="Cancel"
            onConfirm={handleLogout}
            onClose={() => setIsLogoutOpen(false)}
        />
    </>
}