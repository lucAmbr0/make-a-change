"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import InputField from "@/app/components/ui/InputField/InputField";
import Banner from "@/app/components/ui/Banner/Banner";
import styles from "./ConfirmSignatureModal.module.css";
import { useUser } from "@/app/components/logic/UserProvider";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import Paragraph from "../Typography/Paragraph/Paragraph";

function formatDateForInput(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const datePart = dateStr.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function translateErrorMessage(error: string): string {
    const translations: { [key: string]: string } = {
        "Cannot sign an archived campaign": "Non è possibile firmare una campagna archiviata.",
        "User has already signed this campaign": "Hai già firmato questa campagna.",
        "Campaign not found": "Campagna non trovata.",
        "User not found": "Utente non trovato.",
        "Unauthorized": "Non autorizzato.",
    };
    return translations[error] || "Errore durante la firma. Riprova più tardi.";
}

export default function ConfirmSignatureModal({
    open,
    campaignId,
    campaignTitle,
    campaignOrganizationName,
    campaignCreatorName,
    onClose,
    onSigned,
}: {
    open: boolean;
    campaignId: number;
    campaignTitle: string;
    campaignOrganizationName: string | null;
    campaignCreatorName: string | null;
    onClose: () => void;
    onSigned?: (success: boolean) => void;
}) {
    const { user, isLoading } = useUser();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);
    const [reloadTimer, setReloadTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (reloadTimer) clearTimeout(reloadTimer);
        };
    }, [reloadTimer]);

    async function handleConfirm(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setFeedback(null);
        try {
            await apiFetch(`/api/campaign/${campaignId}/signature`, { method: "POST" });
            setFeedback({ type: "success", message: "Firma inviata con successo. La pagina si ricaricherà fra pochi secondi." });
            onSigned?.(true);
            
            const timer = setTimeout(() => {
                window.location.reload();
            }, 3000);
            setReloadTimer(timer);
        } catch (err) {
            const msg = err instanceof ApiClientError ? translateErrorMessage(err.message) : "Errore durante la firma. Riprova più tardi.";
            setFeedback({ type: "error", message: msg });
            onSigned?.(false);
        } finally {
            setLoading(false);
        }
    }

    function handleModalClose() {
        if (reloadTimer) {
            clearTimeout(reloadTimer);
            setReloadTimer(null);
        }
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleModalClose}
            overlayType="blurred"
            containerBgColor="accent-50"
            borderWidth="1px"
            borderColor="var(--accent-300)"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        >
            <div className={styles.container}>
                <h3 className={styles.title}>Conferma firma</h3>
                <p className={styles.description}>Verifica i tuoi dati prima di confermare la firma.</p>

                {feedback ? (
                    <div className={styles.bannerWrap}>
                        <Banner
                            primaryLabel={feedback.message}
                            primaryClassName={feedback.type === "error" ? styles.errorText : styles.successText}
                        />
                    </div>
                ) : null}

                <form onSubmit={handleConfirm}>
                    <div className={styles.fields}>
                        <InputField
                            type="text"
                            title="Nome completo"
                            label="Nome completo"
                            defaultValue={user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : ""}
                            disabled={true}
                        />

                        <InputField
                            type="date"
                            title="Data di nascita"
                            label="Data di nascita"
                            defaultValue={formatDateForInput(user?.birth_date)}
                            disabled={true}
                        />

                        <InputField
                            type="email"
                            title="Email"
                            label="Email"
                            defaultValue={user?.email ?? ""}
                            disabled={true}
                        />
                    </div>

                    <InputField type="checkbox" required label={`Io sottoscritt* ${user?.first_name} ${user?.last_name}, in data ${new Date().toISOString().split('T')[0]} esprimo il mio sostegno all'iniziativa ${campaignTitle} promossa da ${campaignOrganizationName || campaignCreatorName}.`} title={"Spunta la casella per confermare."}  />

                    <div className={styles.actions}>
                        <Button text="Annulla" onClick={handleModalClose} type="outlined" textSize={20} disabled={loading} />
                        <Button text="Firma" icon="material-symbols:done-all" type="filled" textSize={20} disabled={loading || isLoading || !user} />
                    </div>
                </form>
            </div>
        </Modal>
    );
}