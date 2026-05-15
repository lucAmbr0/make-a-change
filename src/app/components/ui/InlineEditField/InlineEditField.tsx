"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./InlineEditField.module.css";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

type FieldKind = "text" | "textarea" | "number";

interface InlineEditFieldProps {
    campaignId?: number;
    apiPath?: string;
    field: string;
    initialValue: string | number | null;
    kind?: FieldKind;
    placeholder?: string;
    displayClassName?: string;
    children: React.ReactNode;
}

function coerceForSubmit(kind: FieldKind, raw: string): string | number | null {
    if (kind === "number") {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const parsed = Number.parseInt(trimmed, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    if (kind === "textarea") {
        return raw === "" ? null : raw;
    }
    return raw.trim();
}

export default function InlineEditField({
    campaignId,
    apiPath,
    field,
    initialValue,
    kind = "text",
    placeholder = "Vuoto",
    displayClassName,
    children,
}: InlineEditFieldProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(
        initialValue === null || initialValue === undefined ? "" : String(initialValue),
    );

    const endpoint = apiPath ?? `/api/campaign/${campaignId}`;

    const save = useApiAction(
        async (value: string | number | null) =>
            apiFetch(endpoint, {
                method: "PATCH",
                body: { [field]: value },
            }),
        {
            onSuccess: () => {
                setEditing(false);
                router.refresh();
            },
        },
    );

    function startEditing() {
        setDraft(initialValue === null || initialValue === undefined ? "" : String(initialValue));
        save.reset();
        setEditing(true);
    }

    function cancel() {
        setEditing(false);
        save.reset();
    }

    async function commit() {
        await save.run(coerceForSubmit(kind, draft));
    }

    if (!editing) {
        const isEmpty =
            initialValue === null || initialValue === undefined || initialValue === "";
        return (
            <div className={styles.container}>
                <div
                    role="button"
                    tabIndex={0}
                    className={`${styles.display} ${displayClassName ?? ""}`}
                    onClick={startEditing}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            startEditing();
                        }
                    }}
                    aria-label={`Modifica ${field}`}
                >
                    {isEmpty ? <span className={styles.placeholder}>{placeholder}</span> : children}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.editor}>
                {kind === "textarea" ? (
                    <textarea
                        className={styles.textarea}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <input
                        className={styles.input}
                        type={kind === "number" ? "number" : "text"}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                    />
                )}
                <div className={styles.actionsRow}>
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
                    {save.error ? <small className={styles.errorText}>{save.error}</small> : null}
                </div>
            </div>
        </div>
    );
}
