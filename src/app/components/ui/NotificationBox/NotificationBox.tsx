"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import styles from "./NotificationBox.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

export default function NotificationBox({
    notificationId,
    title,
    content,
    isRead = false,
}: {
    notificationId: number;
    title: string;
    content?: string;
    isRead?: boolean;
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

    return <div className={`${styles.container} ${read ? styles.read : styles.notRead}`}>
        <div className={styles.notifTextContainer}>
            <p className={styles.title}>{title}</p>
            <p className={styles.content}>{content}</p>
            {markAsRead.error ? <small className={styles.content}>{markAsRead.error}</small> : null}
            {deleteNotification.error ? <small className={styles.content}>{deleteNotification.error}</small> : null}
        </div>
        <div className={styles.actionsContainer}>
            {!read && <Button title="Segna come letto" textSize={18} icon="material-symbols:done" type="outlined" onClick={() => markAsRead.run()} disabled={isBusy} />}
            <Button title="Elimina notifica" textSize={18} icon="material-symbols:delete-outline" type="outlined" onClick={() => deleteNotification.run()} disabled={isBusy} />
        </div>
    </div>
}