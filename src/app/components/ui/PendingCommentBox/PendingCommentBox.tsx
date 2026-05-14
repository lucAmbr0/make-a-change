"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import styles from "./PendingCommentBox.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

export default function PendingCommentBox({
    commentId,
    campaignId,
    authorName,
    authorId,
    commentText,
    commentDatetime,
}: {
    commentId: number;
    campaignId: number;
    authorName: string;
    authorId: number;
    commentText: string;
    commentDatetime?: string;
}) {
    const router = useRouter();
    const [done, setDone] = useState(false);

    const moderate = useApiAction(
        async (approve: boolean) =>
            apiFetch(`/api/campaign/${campaignId}/comments/${commentId}/moderation`, {
                method: "POST",
                body: { comment_approval: approve },
            }),
        {
            onSuccess: () => {
                setDone(true);
                router.refresh();
            },
        },
    );

    if (done) return null;

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div>
                    <Link className={styles.authorName} href={`/utente/${authorId}`}>
                        <Icon icon="material-symbols:account-circle-outline" />
                        {authorName || "Anonimo"}
                    </Link>
                    {commentDatetime && (
                        <time className={styles.datetime} dateTime={commentDatetime}>
                            {new Date(commentDatetime).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                        </time>
                    )}
                </div>
                <div className={styles.actions}>
                    <button
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        onClick={() => moderate.run(true)}
                        disabled={moderate.isLoading}
                        type="button"
                        aria-label="Approva commento"
                    >
                        <Icon icon="material-symbols:check" width={18} height={18} />
                        Approva
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.rejectButton}`}
                        onClick={() => moderate.run(false)}
                        disabled={moderate.isLoading}
                        type="button"
                        aria-label="Elimina commento"
                    >
                        <Icon icon="material-symbols:delete-outline" width={18} height={18} />
                        Elimina
                    </button>
                </div>
            </div>
            <p className={styles.commentText}>{commentText}</p>
            {moderate.error ? <small className={styles.errorText}>{moderate.error}</small> : null}
        </div>
    );
}
