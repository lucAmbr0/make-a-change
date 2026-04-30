"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import styles from "./CoverImageEditor.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

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
        setEditing(false);
        save.reset();
    }

    return (
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
                        onChange={(e) => setDraft(e.target.value)}
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
    );
}
