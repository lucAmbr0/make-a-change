"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import InputField from "@/app/components/ui/InputField/InputField";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Button from "@/app/components/ui/Button/Button";
import ImagePreviewModal from "@/app/components/ui/Modal/ImagePreviewModal/ImagePreviewModal";

type OrgOption = { id: number; name: string };

const TITLE_MIN = 4;
const TITLE_MAX = 64;
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 4096;
const COVER_MAX = 512;
const SIGNATURE_GOAL_MAX = 100000;

export default function CreateCampaignForm({ organizations }: { organizations: OrgOption[] }) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        cover_path: "",
        description: "",
        is_public: true,
        comments_active: true,
        comments_require_approval: false,
        signature_goal: "0",
        organization_id: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const probeRef = useRef<HTMLImageElement | null>(null);

    function cancelPending() {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (probeRef.current) { probeRef.current.onload = null; probeRef.current.onerror = null; probeRef.current = null; }
    }

    function handleCoverPathChange(value: string) {
        setField("cover_path", value);
        cancelPending();
        const url = value.trim();
        if (!url) return;

        const img = new window.Image();
        img.onload = () => { cancelPending(); setPreviewOpen(true); };
        img.onerror = () => { if (probeRef.current === img) probeRef.current = null; };
        img.src = url;
        probeRef.current = img;

        timerRef.current = setTimeout(() => { timerRef.current = null; setPreviewOpen(true); }, 1500);
    }

    function setField<K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key as string]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key as string];
                return next;
            });
        }
    }

    function validate(): boolean {
        const next: Record<string, string> = {};

        const title = formData.title.trim();
        if (!title) {
            next.title = "Il titolo è obbligatorio";
        } else if (title.length < TITLE_MIN) {
            next.title = `Minimo ${TITLE_MIN} caratteri`;
        } else if (title.length > TITLE_MAX) {
            next.title = `Massimo ${TITLE_MAX} caratteri`;
        }

        if (formData.cover_path && formData.cover_path.length > COVER_MAX) {
            next.cover_path = `Massimo ${COVER_MAX} caratteri`;
        }

        const description = formData.description.trim();
        if (!description) {
            next.description = "La descrizione è obbligatoria";
        } else if (description.length < DESCRIPTION_MIN) {
            next.description = `Minimo ${DESCRIPTION_MIN} caratteri`;
        } else if (description.length > DESCRIPTION_MAX) {
            next.description = `Massimo ${DESCRIPTION_MAX} caratteri`;
        }

        const goalNum = formData.signature_goal === "" ? 0 : Number(formData.signature_goal);
        if (!Number.isFinite(goalNum) || !Number.isInteger(goalNum) || goalNum < 0) {
            next.signature_goal = "Obiettivo non valido";
        } else if (goalNum > SIGNATURE_GOAL_MAX) {
            next.signature_goal = `Massimo ${SIGNATURE_GOAL_MAX}`;
        }

        if (formData.organization_id) {
            const idNum = Number(formData.organization_id);
            if (!organizations.some((o) => o.id === idNum)) {
                next.organization_id = "Organizzazione non valida";
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError("");
        if (!validate()) return;

        const goalNum = formData.signature_goal === "" ? 0 : Number(formData.signature_goal);
        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            cover_path: formData.cover_path.trim() || null,
            signature_goal: goalNum > 0 ? goalNum : null,
            is_public: formData.is_public,
            comments_active: formData.comments_active,
            comments_require_approval: formData.comments_require_approval,
            organization_id: formData.organization_id ? Number(formData.organization_id) : null,
        };

        setIsLoading(true);
        try {
            const res = await fetch("/api/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setApiError(
                    (data && (data.message || data.error)) ||
                        "Errore durante la creazione della campagna",
                );
                return;
            }

            if (!data || typeof data.id !== "number") {
                setApiError("Risposta inattesa dal server");
                return;
            }

            router.push(`/campagne/${data.id}`);
        } catch (err) {
            console.error("Create campaign error:", err);
            setApiError("Errore di connessione. Riprova più tardi");
        } finally {
            setIsLoading(false);
        }
    }

    const orgOptions = [
        { label: "Pubblica come indipendente", value: "" },
        ...organizations.map((o) => ({ label: o.name, value: String(o.id) })),
    ];

    return (
        <>
        <ImagePreviewModal
            open={previewOpen}
            src={formData.cover_path.trim()}
            onSave={() => setPreviewOpen(false)}
            onCancel={() => { cancelPending(); setField("cover_path", ""); setPreviewOpen(false); }}
        />
        <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formSection}>
                <div className={styles.fullWidth}>
                    <InputField
                        label="Titolo campagna"
                        title="Titolo campagna"
                        type="text"
                        placeholder="Scegli un titolo breve ed efficace"
                        required
                        minLength={TITLE_MIN}
                        maxLength={TITLE_MAX}
                        onChange={(e) => setField("title", e.target.value)}
                    />
                    {errors.title && <p className={styles.error}>{errors.title}</p>}
                </div>
                <div className={styles.fullWidth}>
                    <InputField
                        label="URL Immagine campagna (660x400 px)"
                        title="URL Immagine campagna (600x400 px)"
                        type="text"
                        placeholder="Inserisci l'URL dell'immagine (https://esempio.it/immagine.jpg)"
                        minLength={2}
                        maxLength={COVER_MAX}
                        onChange={(e) => handleCoverPathChange(e.target.value)}
                    />
                    {errors.cover_path && <p className={styles.error}>{errors.cover_path}</p>}
                </div>
                <div className={styles.fullWidth}>
                    <InputField
                        label="Descrizione campagna"
                        title="Descrizione campagna"
                        placeholder="Descrivi in modo completo e dettagliato la tua iniziativa"
                        type="textarea"
                        required
                        minLength={DESCRIPTION_MIN}
                        maxLength={DESCRIPTION_MAX}
                        rows={4}
                        onChange={(e) => setField("description", e.target.value)}
                    />
                    {errors.description && <p className={styles.error}>{errors.description}</p>}
                </div>
                <div>
                    <Paragraph fontSize={16} margin="0 0 10px 0" text="Opzioni di pubblicazione" />
                    <InputField
                        type="checkbox"
                        label="Pubblica campagna anche ai non membri"
                        title="Pubblica campagna anche ai non membri"
                        checked={formData.is_public}
                        onChange={(e) =>
                            setField(
                                "is_public",
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                    <InputField
                        type="checkbox"
                        label="Attiva i commenti"
                        title="Attiva i commenti"
                        checked={formData.comments_active}
                        onChange={(e) =>
                            setField(
                                "comments_active",
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                    <InputField
                        type="checkbox"
                        label="Trattieni i commenti per l'approvazione"
                        title="Trattieni i commenti per l'approvazione"
                        checked={formData.comments_require_approval}
                        onChange={(e) =>
                            setField(
                                "comments_require_approval",
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                </div>
                <div>
                    <InputField
                        title="Obiettivo firme"
                        label="Obiettivo firme"
                        type="number"
                        min={0}
                        max={SIGNATURE_GOAL_MAX}
                        defaultValue="0"
                        onChange={(e) => setField("signature_goal", e.target.value)}
                    />
                    {errors.signature_goal && <p className={styles.error}>{errors.signature_goal}</p>}
                </div>
                <div className={styles.fullWidth}>
                    <InputField
                        title="Aggiungi ad un' organizzazione o pubblica come indipendente"
                        label="Aggiungi ad un'organizzazione o pubblica come indipendente"
                        type="select"
                        options={orgOptions}
                        onChange={(e) => setField("organization_id", e.target.value)}
                    />
                    {errors.organization_id && (
                        <p className={styles.error}>{errors.organization_id}</p>
                    )}
                </div>
            </div>
            {apiError && <p className={styles.apiError}>{apiError}</p>}
            <div
                className={styles.buttonGroup}
                style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? "none" : "auto" }}
            >
                <Button type="outlined" text="Annulla" href="/campagne" />
                <Button text={isLoading ? "Creazione..." : "Crea campagna"} />
            </div>
        </form>
        </>
    );
}
