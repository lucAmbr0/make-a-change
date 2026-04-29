"use client";

import { useEffect, useState } from "react";
import styles from "./CommentBox.module.css";
import ConfirmModal from "@/app/components/ui/ConfirmModal/ConfirmModal";
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";
import { useUser } from "@/app/components/logic/UserProvider";
import { Icon } from "@iconify/react";

export default function CommentBox({
    authorName = "Anonimo",
    commentText,
    commentId,
    authorId,
    campaignId,
    campaignCreatorId,
    organizationId,
}: {
    authorName?: string;
    commentText: string;
    commentId: number;
    authorId: number;
    campaignId: number;
    campaignCreatorId?: number;
    organizationId?: number;
}) {
    const { user, isLoading } = useUser();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [requestError, setRequestError] = useState("");
    const [deleted, setDeleted] = useState(false);
    const [isOrgModeratorOrOwner, setIsOrgModeratorOrOwner] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const isOwner = Boolean(user && user.id === authorId);
    const isCampaignCreator = Boolean(user && campaignCreatorId && user.id === campaignCreatorId);
    const canDelete = Boolean(isOwner || isCampaignCreator || isOrgModeratorOrOwner);

    async function handleDelete() {
        setRequestError("");
        if (!campaignId) {
            setRequestError("Impossibile risolvere l'ID della campagna");
            return;
        }

        setIsDeleting(true);
        try {
            const resp = await fetch(`/api/campaign/${campaignId}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ comment_id: commentId }),
            });

            if (resp.status === 401) {
                // not authenticated — open login modal
                setIsLoginOpen(true);
                return;
            }

            if (!resp.ok) {
                const payload = await resp.json().catch(() => ({}));
                setRequestError(payload?.message || "Errore durante la cancellazione");
                return;
            }

            setDeleted(true);
        } catch (err) {
            setRequestError("Errore di rete, riprova");
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        async function fetchMembership() {
            if (!organizationId || !user) return;
            try {
                const resp = await fetch(`/api/organization/${organizationId}/member/me`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!mounted) return;
                if (resp.status === 401) return; // not logged in
                if (!resp.ok) return;
                const data = await resp.json().catch(() => ({}));
                if (data?.is_member && (data.is_owner || data.is_moderator)) {
                    setIsOrgModeratorOrOwner(true);
                }
            } catch (e) {
                // ignore
            }
        }

        void fetchMembership();
        return () => {
            mounted = false;
        };
    }, [organizationId, user]);

    if (deleted) return null;

    return (
        <>
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <h4 className={styles.authorName}>{authorName || "Anonimo"}</h4>
                    {canDelete && (
                        <button
                            className={styles.deleteButton}
                            onClick={() => setShowConfirm(true)}
                            type="button"
                            disabled={isDeleting}
                            aria-disabled={isDeleting}
                            aria-label="Elimina commento"
                        >
                            <Icon icon={"material-symbols:delete-outline"} width={24} height={24} />
                        </button>
                    )}
                </div>
                <p className={styles.commentText}>{commentText}</p>
                {requestError ? <small className={styles.errorText}>{requestError}</small> : null}
            </div>

            <ConfirmModal
                open={showConfirm}
                title="Eliminare il commento?"
                description="Questa azione è permanente. Vuoi procedere?"
                confirmLabel={isDeleting ? "Eliminazione..." : "Elimina"}
                onConfirm={handleDelete}
                onClose={() => setShowConfirm(false)}
            />

            <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
}