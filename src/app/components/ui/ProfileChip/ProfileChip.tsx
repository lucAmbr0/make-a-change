"use client";

import { useState } from "react";
import styles from './ProfileChip.module.css';
import { Icon } from "@iconify/react";
import { useUser } from '@/app/components/logic/UserProvider';
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";

export default function Profile() {
    const { user, isLoading } = useUser();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const chipText = isLoading ? "..." : user ? `${user.first_name} ${user.last_name}` : "Accedi";

    function handleClick() {
        if (!user && !isLoading) {
            setIsLoginOpen(true);
        }
    }

    return <>
        <button className={styles.profileChipContainer} onClick={handleClick} type="button">
            <Icon icon="material-symbols:account-circle-outline" className={styles.profileIcon} fontSize={"32px"} />
            <p className={styles.chipText}>{chipText}</p>
        </button>
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
}