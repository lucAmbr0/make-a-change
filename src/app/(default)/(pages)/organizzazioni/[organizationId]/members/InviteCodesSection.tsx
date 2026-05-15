"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button/Button";
import { Modal } from "@/app/components/ui/Modal/Modal";
import { apiFetch } from "@/lib/api/client";
import type { inviteCodeRowSchema } from "@/lib/schemas/invite_codes";
import styles from "./MembersManager.module.css";
import inviteStyles from "./InviteCodesSection.module.css";

function formatExpiry(date: Date | null | undefined): string {
    if (!date) return "Nessuna scadenza";
    return new Date(date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function CodeRow({
    code,
    organizationId,
    onMutate,
}: {
    code: inviteCodeRowSchema;
    organizationId: number;
    onMutate: () => void;
}) {
    const [loading, setLoading] = useState(false);

    async function handleRevoke() {
        setLoading(true);
        try {
            await apiFetch(`/api/organization/${organizationId}/invite_codes`, {
                method: "DELETE",
                body: { code: code.code },
            });
            onMutate();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.row}>
            <div className={styles.rowInfo}>
                <span className={inviteStyles.code}>{code.code}</span>
                <span className={inviteStyles.codeMeta}>
                    {code.uses} {code.uses === 1 ? "utilizzo rimanente" : "utilizzi rimanenti"} · {formatExpiry(code.expires_at)}
                </span>
            </div>
            <div className={styles.rowActions}>
                <Button
                    icon="material-symbols:link-off"
                    title="Revoca codice"
                    type="outlined"
                    onClick={handleRevoke}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

function CreateCodeModal({
    open,
    organizationId,
    onClose,
    onCreated,
}: {
    open: boolean;
    organizationId: number;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [randomCode, setRandomCode] = useState(true);
    const [customCode, setCustomCode] = useState("");
    const [uses, setUses] = useState(1);
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleClose() {
        if (loading) return;
        setRandomCode(true);
        setCustomCode("");
        setUses(1);
        setExpiresAt("");
        setError(null);
        onClose();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiFetch(`/api/organization/${organizationId}/invite_codes`, {
                method: "POST",
                body: {
                    ...(randomCode ? {} : { code: customCode.toUpperCase().trim() }),
                    uses,
                    ...(expiresAt ? { expires_at: expiresAt } : {}),
                },
            });
            handleClose();
            onCreated();
        } catch (err: any) {
            setError(err?.message ?? "Errore durante la creazione del codice.");
        } finally {
            setLoading(false);
        }
    }

    const codeValid = randomCode || /^[A-Z0-9]{6}$/.test(customCode.toUpperCase().trim());

    return (
        <Modal
            open={open}
            onClose={handleClose}
            overlayType="blurred"
            containerBgColor="accent-50"
            borderWidth="1px"
            borderColor="var(--accent-300)"
            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
            <form className={inviteStyles.modalForm} onSubmit={handleSubmit}>
                <h3 className={inviteStyles.modalTitle}>Crea codice invito</h3>

                <div className={inviteStyles.field}>
                    <label className={inviteStyles.label}>Codice</label>
                    <div className={inviteStyles.codeToggle}>
                        <button
                            type="button"
                            className={`${inviteStyles.toggleOption} ${randomCode ? inviteStyles.toggleActive : ""}`}
                            onClick={() => setRandomCode(true)}
                        >
                            Genera automaticamente
                        </button>
                        <button
                            type="button"
                            className={`${inviteStyles.toggleOption} ${!randomCode ? inviteStyles.toggleActive : ""}`}
                            onClick={() => setRandomCode(false)}
                        >
                            Personalizza
                        </button>
                    </div>
                    {!randomCode && (
                        <input
                            className={inviteStyles.input}
                            type="text"
                            maxLength={6}
                            placeholder="Es. ABC123"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                            autoFocus
                        />
                    )}
                </div>

                <div className={inviteStyles.field}>
                    <label className={inviteStyles.label} htmlFor="invite-uses">Utilizzi</label>
                    <input
                        id="invite-uses"
                        className={inviteStyles.input}
                        type="number"
                        min={1}
                        value={uses}
                        onChange={(e) => setUses(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        required
                    />
                </div>

                <div className={inviteStyles.field}>
                    <label className={inviteStyles.label} htmlFor="invite-expires">Scadenza <span className={inviteStyles.optional}>(opzionale)</span></label>
                    <input
                        id="invite-expires"
                        className={inviteStyles.input}
                        type="date"
                        value={expiresAt}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setExpiresAt(e.target.value)}
                    />
                </div>

                {error && <p className={inviteStyles.error}>{error}</p>}

                <div className={inviteStyles.modalActions}>
                    <Button text="Annulla" type="outlined" textSize={16} onClick={handleClose} disabled={loading} />
                    <Button
                        text={loading ? "Creazione..." : "Crea"}
                        icon="material-symbols:add-link"
                        type="filled"
                        textSize={16}
                        disabled={loading || !codeValid || uses < 1}
                    />
                </div>
            </form>
        </Modal>
    );
}

export default function InviteCodesSection({
    organizationId,
    initialCodes,
}: {
    organizationId: number;
    initialCodes: inviteCodeRowSchema[];
}) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);

    function refresh() {
        router.refresh();
    }

    return (
        <section className={inviteStyles.section}>
            <div className={inviteStyles.header}>
                <h2 className={styles.columnTitle}>
                    Codici invito <span className={styles.count}>{initialCodes.length}</span>
                </h2>
                <Button
                    icon="material-symbols:add-link"
                    text="Crea codice"
                    type="outlined"
                    textSize={16}
                    onClick={() => setModalOpen(true)}
                />
            </div>

            {initialCodes.length === 0 ? (
                <p className={styles.empty}>Nessun codice invito attivo.</p>
            ) : (
                <div className={inviteStyles.codeGrid}>
                    {initialCodes.map((c) => (
                        <CodeRow
                            key={c.code}
                            code={c}
                            organizationId={organizationId}
                            onMutate={refresh}
                        />
                    ))}
                </div>
            )}

            <CreateCodeModal
                open={modalOpen}
                organizationId={organizationId}
                onClose={() => setModalOpen(false)}
                onCreated={refresh}
            />
        </section>
    );
}
