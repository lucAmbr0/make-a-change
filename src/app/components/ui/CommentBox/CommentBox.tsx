"use client";

import { useState } from "react";
import styles from "./CommentBox.module.css";
import ConfirmModal from "@/app/components/ui/ConfirmModal/ConfirmModal";
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";
import { useUser } from "@/app/components/logic/UserProvider";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CommentBox({
    authorName = "Anonimo",
    commentText,
    commentId,
    authorId,
    campaignId,
    canDelete,
    commentDatetime,
}: {
    authorName?: string;
    commentText: string;
    commentId: number;
    authorId: number;
    campaignId: number;
    canDelete: boolean;
    commentDatetime?: string;
}) {
    const { user } = useUser();
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const isOwner = Boolean(user && user.id === authorId);

    const deleteComment = useApiAction(
        async () =>
            apiFetch(`/api/campaign/${campaignId}/comments`, {
                method: "DELETE",
                body: { comment_id: commentId },
            }),
        {
            onSuccess: () => {
                setDeleted(true);
                setShowConfirm(false);
                router.refresh();
            },
            onError: (err) => {
                if (err instanceof ApiClientError && err.status === 401) {
                    setIsLoginOpen(true);
                }
            },
        },
    );

    if (deleted) return null;

    const containerClassName = isOwner ? styles.userComment : styles.otherComment;
    const showError = deleteComment.error && deleteComment.status !== 401;

    return (
        <>
            <div className={`${styles.container} ${containerClassName}`}>
                <div className={styles.headerRow}>
                    <div>
                        <Link className={styles.authorName} href={`/utente/${authorId}`}><Icon icon={"material-symbols:account-circle-outline"} />{authorName || "Anonimo"}</Link>
                        {commentDatetime && (
                            <time className={styles.datetime} dateTime={commentDatetime}>
                                {new Date(commentDatetime).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                            </time>
                        )}
                    </div>
                    {canDelete && (
                        <button
                            className={styles.deleteButton}
                            onClick={() => setShowConfirm(true)}
                            type="button"
                            disabled={deleteComment.isLoading}
                            aria-disabled={deleteComment.isLoading}
                            aria-label="Elimina commento"
                        >
                            <Icon icon={"material-symbols:delete-outline"} width={24} height={24} />
                        </button>
                    )}
                </div>
                <p className={styles.commentText}>{commentText}</p>
                {showError ? <small className={styles.errorText}>{deleteComment.error}</small> : null}
            </div>

            <ConfirmModal
                open={showConfirm}
                title="Eliminare il commento?"
                description="Questa azione è permanente. Vuoi procedere?"
                confirmLabel={deleteComment.isLoading ? "Eliminazione..." : "Elimina"}
                onConfirm={deleteComment.run}
                onClose={() => setShowConfirm(false)}
            />

            <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
}
