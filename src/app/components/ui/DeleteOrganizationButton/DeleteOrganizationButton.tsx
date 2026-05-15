"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import styles from "@/app/components/ui/DeleteCampaignButton/DeleteCampaignButton.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

export default function DeleteOrganizationButton({
    organizationId,
    organizationName,
}: {
    organizationId: number;
    organizationName: string;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const remove = useApiAction(
        async () =>
            apiFetch(`/api/organization/${organizationId}`, { method: "DELETE" }),
        {
            onSuccess: () => {
                setOpen(false);
                router.push("/organizzazioni");
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

    const matches = confirmText.trim() === organizationName.trim();

    return (
        <>
            <div className={styles.dangerZone}>
                <h2 className={styles.dangerTitle}>Zona pericolosa</h2>
                <p className={styles.dangerText}>
                    L&apos;eliminazione dell&apos;organizzazione è permanente e rimuoverà tutte le campagne,
                    i membri e i dati associati.
                </p>
                <Button
                    text="Elimina organizzazione"
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
                containerBgColor="var(--accent-950)"
                borderWidth="1px"
                borderColor="var(--accent-800)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
            >
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>Eliminare l&apos;organizzazione?</h3>
                    <p className={styles.modalDescription}>
                        Questa azione è permanente e non può essere annullata.
                        Per confermare, riscrivi il nome esatto dell&apos;organizzazione:
                    </p>
                    <p className={styles.campaignNamePreview}>{organizationName}</p>
                    <input
                        className={styles.confirmInput}
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Riscrivi il nome dell'organizzazione"
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
