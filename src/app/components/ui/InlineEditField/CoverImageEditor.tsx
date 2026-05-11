"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import styles from "./CoverImageEditor.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";
import ImagePreviewModal from "@/app/components/ui/Modal/ImagePreviewModal/ImagePreviewModal";

interface CoverImageEditorProps {
    campaignId: number;
    initialValue: string | null;
    src: string;
    alt?: string;
    imageClassName?: string;
}

export default function CoverImageEditor({
    campaignId,
    initialValue,
    src,
    alt = "Immagine campagna",
    imageClassName,
}: CoverImageEditorProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(initialValue ?? "");
    const [previewOpen, setPreviewOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const probeRef = useRef<HTMLImageElement | null>(null);

    const save = useApiAction(
        async (value: string | null) =>
            apiFetch(`/api/campaign/${campaignId}`, {
                method: "PATCH",
                body: { cover_path: value },
            }),
        {
            onSuccess: () => {
                setEditing(false);
                router.refresh();
            },
        },
    );

    function cancelPending() {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (probeRef.current) { probeRef.current.onload = null; probeRef.current.onerror = null; probeRef.current = null; }
    }

    function schedulePreview(url: string) {
        cancelPending();

        const img = new window.Image();
        img.onload = () => { cancelPending(); setPreviewOpen(true); };
        img.onerror = () => { probeRef.current = null; };
        img.src = url;
        probeRef.current = img;

        timerRef.current = setTimeout(() => { timerRef.current = null; setPreviewOpen(true); }, 1500);
    }

    function handleUrlChange(value: string) {
        setDraft(value);
        const url = value.trim();
        if (url) {
            schedulePreview(url);
        } else {
            cancelPending();
        }
    }

    function startEditing() {
        setDraft(initialValue ?? "");
        save.reset();
        setEditing(true);
    }

    async function commit() {
        const trimmed = draft.trim();
        await save.run(trimmed === "" ? null : trimmed);
    }

    function cancel() {
        cancelPending();
        setEditing(false);
        save.reset();
    }

    async function handlePreviewSave() {
        setPreviewOpen(false);
        await commit();
    }

    function handlePreviewCancel() {
        cancelPending();
        setPreviewOpen(false);
        setDraft("");
    }

    return (
        <>
        <ImagePreviewModal
            open={previewOpen}
            src={draft.trim()}
            onSave={handlePreviewSave}
            onCancel={handlePreviewCancel}
        />
        <div className={styles.wrapper}>
            <img className={imageClassName} src={src} alt={alt} />
            {!editing && (
                <button
                    type="button"
                    className={styles.hoverOverlay}
                    onClick={startEditing}
                    aria-label="Modifica immagine di copertina"
                >
                    <Icon icon="material-symbols:edit-outline" width={28} height={28} />
                    <span className={styles.hoverLabel}>
                        Clicca per modificare l'immagine
                    </span>
                </button>
            )}
            {editing && (
                <div className={styles.editorPanel} onClick={(e) => e.stopPropagation()}>
                    <label className={styles.editorLabel}>URL immagine di copertina</label>
                    <input
                        className={styles.editorInput}
                        type="url"
                        value={draft}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://..."
                        autoFocus
                    />
                    <div className={styles.editorActions}>
                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.saveButton}`}
                            onClick={commit}
                            disabled={save.isLoading}
                        >
                            {save.isLoading ? "Salvataggio..." : "Salva"}
                        </button>
                        <button
                            type="button"
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            onClick={cancel}
                            disabled={save.isLoading}
                        >
                            Annulla
                        </button>
                    </div>
                    {save.error ? (
                        <small className={styles.errorText}>{save.error}</small>
                    ) : null}
                </div>
            )}
        </div>
        </>
    );
}
