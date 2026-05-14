"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Button from "../Button/Button";
import styles from "./NotificationBox.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

export default function NotificationBox({
    notificationId,
    title,
    content,
    isRead = false,
    href,
}: {
    notificationId: number;
    title: string;
    content?: string;
    isRead?: boolean;
    href?: string;
}) {
    const router = useRouter();
    const [read, setRead] = useState(isRead);
    const [removed, setRemoved] = useState(false);

    const markAsRead = useApiAction(
        () =>
            apiFetch("/api/notification", {
                method: "POST",
                body: {
                    action: "read_notification",
                    notification_id: notificationId,
                },
            }),
        {
            onSuccess: () => {
                setRead(true);
                router.refresh();
            },
        },
    );

    const deleteNotification = useApiAction(
        () =>
            apiFetch("/api/notification", {
                method: "DELETE",
                body: {
                    action: "delete_notification",
                    notification_id: notificationId,
                },
            }),
        {
            onSuccess: () => {
                setRemoved(true);
                router.refresh();
            },
        },
    );

    if (removed) return null;

    const isBusy = markAsRead.isLoading || deleteNotification.isLoading;

    const textBody = (
        <>
            <p className={styles.title}>{title}</p>
            <p className={styles.content}>{content}</p>
            {markAsRead.error ? <small className={styles.content}>{markAsRead.error}</small> : null}
            {deleteNotification.error ? <small className={styles.content}>{deleteNotification.error}</small> : null}
        </>
    );

    return (
        <div className={`${styles.container} ${href && styles.clickable} ${read ? styles.read : styles.notRead}`}>
            {href ? (
                <Link
                    href={href}
                    className={styles.notifTextContainer}
                    onClick={() => { if (!read) markAsRead.run(); }}
                >
                    {textBody}
                    <span className={styles.hrefHint}>
                        <Icon icon="material-symbols:arrow-forward" width={16} height={16} />
                        Vai alla pagina
                    </span>
                </Link>
            ) : (
                <div className={styles.notifTextContainer}>
                    {textBody}
                </div>
            )}
            <div className={styles.actionsContainer}>
                {!read && <Button title="Segna come letto" textSize={18} icon="material-symbols:done-all" type="outlined" onClick={() => markAsRead.run()} disabled={isBusy} />}
                <Button title="Elimina notifica" textSize={18} icon="material-symbols:delete-outline" type="outlined" onClick={() => deleteNotification.run()} disabled={isBusy} />
            </div>
        </div>
    );
}
