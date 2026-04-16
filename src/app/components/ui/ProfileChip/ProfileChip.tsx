"use client";

import styles from './ProfileChip.module.css';
import { Icon } from "@iconify/react";
import { useUser } from '@/app/components/logic/UserProvider';

export default function Profile() {
    const { user, isLoading } = useUser();

    const chipText = isLoading ? "..." : user ? `${user.first_name} ${user.last_name}` : "Accedi";

    return <>
        <button className={styles.profileChipContainer}>
            <Icon icon="material-symbols:account-circle-outline" className={styles.profileIcon} fontSize={"32px"} />
            <p className={styles.chipText}>{chipText}</p>
        </button>
    </>
}