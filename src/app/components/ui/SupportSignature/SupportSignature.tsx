"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button/Button";
import ConfirmSignatureModal from "@/app/components/ui/ConfirmSignatureModal/ConfirmSignatureModal";
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";
import { Modal } from "@/app/components/ui/Modal/Modal";
import Banner from "@/app/components/ui/Banner/Banner";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import styles from "./SupportSignature.module.css";

export default function SupportSignature({
  campaignId,
  campaignTitle,
  campaignOrganizationName,
  campaignCreatorName,
  alreadySigned = false,
  isAuthenticated = false,
  isCreator = false,
}: {
  campaignId: number;
  campaignTitle: string;
  campaignOrganizationName: string | null;
  campaignCreatorName: string | null;
  alreadySigned?: boolean;
  isAuthenticated?: boolean;
  isCreator?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUnsignOpen, setIsUnsignOpen] = useState(false);
  const [unsignLoading, setUnsignLoading] = useState(false);
  const [unsignFeedback, setUnsignFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [unsignReloadTimer, setUnsignReloadTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (unsignReloadTimer) {
        clearTimeout(unsignReloadTimer);
      }
    };
  }, [unsignReloadTimer]);

  function translateUnsignError(error: string): string {
    const translations: Record<string, string> = {
      "Cannot remove signature from an archived campaign": "Non è possibile rimuovere la firma da una campagna archiviata.",
      "Signature not found": "Firma non trovata.",
      "Campaign not found": "Campagna non trovata.",
      "Unauthorized": "Non autorizzato.",
    };

    return translations[error] || "Errore durante la rimozione della firma. Riprova più tardi.";
  }

  async function handleUnsignConfirm(event: React.FormEvent) {
    event.preventDefault();
    setUnsignLoading(true);
    setUnsignFeedback(null);

    try {
      await apiFetch(`/api/campaign/${campaignId}/signature`, { method: "DELETE" });
      setUnsignFeedback({
        type: "success",
        message: "Firma rimossa con successo. La pagina si ricaricherà fra pochi secondi.",
      });

      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);
      setUnsignReloadTimer(timer);
    } catch (error) {
      const message = error instanceof ApiClientError ? translateUnsignError(error.message) : "Errore durante la rimozione della firma. Riprova più tardi.";
      setUnsignFeedback({ type: "error", message });
    } finally {
      setUnsignLoading(false);
    }
  }

  function handleUnsignClose() {
    if (unsignReloadTimer) {
      clearTimeout(unsignReloadTimer);
      setUnsignReloadTimer(null);
    }
    setUnsignFeedback(null);
    setIsUnsignOpen(false);
  }

  return (
    <>
      <Button
        text={alreadySigned ? "Firmata" : "Sostieni"}
        icon={alreadySigned ? "material-symbols:check-circle" : "material-symbols:list-alt-check-outline"}
        type="filled"
        onClick={() => {
          if (alreadySigned) {
            setIsUnsignOpen(true);
            return;
          }
          if (!isAuthenticated) {
            setIsLoginOpen(true);
            return;
          }
          setOpen(true);
        }}
        disabled={isCreator}
      />
      {!alreadySigned && (
        <ConfirmSignatureModal
          open={open}
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          campaignOrganizationName={campaignOrganizationName}
          campaignCreatorName={campaignCreatorName}
          onClose={() => setOpen(false)}
          onSigned={() => {}}
        />
      )}
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Modal
        open={isUnsignOpen}
        onClose={handleUnsignClose}
        overlayType="blurred"
        containerBgColor="accent-50"
        borderWidth="1px"
        borderColor="var(--accent-300)"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      >
        <form className={styles.unsignModal} onSubmit={handleUnsignConfirm}>
          <h3 className={styles.unsignTitle}>Rimuovere la firma?</h3>
          <p className={styles.unsignDescription}>
            Stai per rimuovere la tua firma da questa campagna. Vuoi procedere?
          </p>

          {unsignFeedback ? (
            <div className={styles.bannerWrap}>
              <Banner
                primaryLabel={unsignFeedback.message}
                primaryClassName={unsignFeedback.type === "error" ? styles.errorText : styles.successText}
              />
            </div>
          ) : null}

          <div className={styles.actions}>
            <Button text="Annulla" onClick={handleUnsignClose} type="outlined" textSize={20} disabled={unsignLoading} />
            <Button text="Rimuovi firma" icon="material-symbols:delete-outline" type="filled" textSize={20} disabled={unsignLoading} />
          </div>
        </form>
      </Modal>
    </>
  );
}
