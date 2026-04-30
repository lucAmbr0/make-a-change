"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import styles from "./DeleteCampaignButton.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

interface DeleteCampaignButtonProps {
    campaignId: number;
    campaignTitle: string;
}

export default function DeleteCampaignButton({
    campaignId,
    campaignTitle,
}: DeleteCampaignButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const remove = useApiAction(
        async () =>
            apiFetch(`/api/campaign/${campaignId}`, { method: "DELETE" }),
        {
            onSuccess: () => {
                setOpen(false);
                router.push("/campagne");
                router.refresh();
            },
        },
    );

    function close() {
        if (remove.isLoading) return;
        setOpen(false);
        setConfirmText("");
        remove.reset();
    }

    const matches = confirmText.trim() === campaignTitle.trim();

    return (
        <>
            <div className={styles.dangerZone}>
                <h2 className={styles.dangerTitle}>Zona pericolosa</h2>
                <p className={styles.dangerText}>
                    L'eliminazione della campagna è permanente e rimuoverà tutte le firme,
                    i commenti e i preferiti associati.
                </p>
                <Button
                    text="Elimina campagna"
                    icon="delete"
                    type="filled"
                    textSize={16}
                    onClick={() => setOpen(true)}
                />
            </div>

            <Modal
                open={open}
                onClose={close}
                overlayType="blurred"
                containerBgColor="white"
                borderWidth="1px"
                borderColor="var(--accent-300)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
            >
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>Eliminare la campagna?</h3>
                    <p className={styles.modalDescription}>
                        Questa azione è permanente e non può essere annullata.
                        Per confermare, riscrivi il titolo esatto della campagna:
                    </p>
                    <p className={styles.campaignNamePreview}>{campaignTitle}</p>
                    <input
                        className={styles.confirmInput}
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Riscrivi il titolo della campagna"
                        disabled={remove.isLoading}
                        autoFocus
                    />
                    {remove.error ? (
                        <small className={styles.errorText}>{remove.error}</small>
                    ) : null}
                    <div className={styles.modalActions}>
                        <Button
                            text="Annulla"
                            type="outlined"
                            textSize={16}
                            onClick={close}
                        />
                        <button
                            type="button"
                            className={styles.confirmDeleteButton}
                            onClick={() => remove.run()}
                            disabled={!matches || remove.isLoading}
                        >
                            {remove.isLoading ? "Eliminazione..." : "Elimina definitivamente"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
