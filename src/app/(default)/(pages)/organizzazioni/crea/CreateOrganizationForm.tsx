"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import InputField from "@/app/components/ui/InputField/InputField";
import Paragraph from "@/app/components/ui/Typography/Paragraph/Paragraph";
import Button from "@/app/components/ui/Button/Button";
import ImagePreviewModal from "@/app/components/ui/Modal/ImagePreviewModal/ImagePreviewModal";

const NAME_MIN = 1;
const NAME_MAX = 64;
const DESCRIPTION_MAX = 65535;
const CATEGORY_MAX = 64;
const COVER_MAX = 2048;

export default function CreateOrganizationForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        cover_path: "",
        is_public: true,
        requires_approval: false,
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

        const name = formData.name.trim();
        if (!name) {
            next.name = "Il nome è obbligatorio";
        } else if (name.length < NAME_MIN) {
            next.name = `Minimo ${NAME_MIN} caratteri`;
        } else if (name.length > NAME_MAX) {
            next.name = `Massimo ${NAME_MAX} caratteri`;
        }

        if (formData.cover_path && formData.cover_path.length > COVER_MAX) {
            next.cover_path = `Massimo ${COVER_MAX} caratteri`;
        }

        if (formData.description && formData.description.length > DESCRIPTION_MAX) {
            next.description = `Massimo ${DESCRIPTION_MAX} caratteri`;
        }

        if (formData.category && formData.category.length > CATEGORY_MAX) {
            next.category = `Massimo ${CATEGORY_MAX} caratteri`;
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError("");
        if (!validate()) return;

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category: formData.category.trim() || null,
            cover_path: formData.cover_path.trim() || null,
            is_public: formData.is_public,
            requires_approval: formData.requires_approval,
        };

        setIsLoading(true);
        try {
            const res = await fetch("/api/organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setApiError((data && (data.message || data.error)) || "Errore durante la creazione dell'organizzazione");
                return;
            }

            if (!data || typeof data.id !== "number") {
                setApiError("Risposta inattesa dal server");
                return;
            }

            router.push(`/organizzazioni/${data.id}`);
        } catch (err) {
            console.error("Create organization error:", err);
            setApiError("Errore di connessione. Riprova più tardi");
        } finally {
            setIsLoading(false);
        }
    }

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
                        label="Nome organizzazione"
                        title="Nome organizzazione"
                        type="text"
                        placeholder="Nome pubblico dell'organizzazione"
                        required
                        minLength={NAME_MIN}
                        maxLength={NAME_MAX}
                        onChange={(e) => setField("name", e.target.value)}
                    />
                    {errors.name && <p className={styles.error}>{errors.name}</p>}
                </div>

                <div className={styles.fullWidth}>
                    <InputField
                        label="URL Immagine copertina (660x400 px)"
                        title="URL Immagine copertina"
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
                        label="Descrizione"
                        title="Descrizione"
                        placeholder="Breve descrizione della missione dell'organizzazione"
                        type="textarea"
                        minLength={0}
                        maxLength={DESCRIPTION_MAX}
                        rows={4}
                        onChange={(e) => setField("description", e.target.value)}
                    />
                    {errors.description && <p className={styles.error}>{errors.description}</p>}
                </div>

                <div>
                    <InputField
                        title="Categoria"
                        label="Categoria"
                        type="text"
                        placeholder="Categoria (es. Ambiente, Sociale)"
                        maxLength={CATEGORY_MAX}
                        onChange={(e) => setField("category", e.target.value)}
                    />
                    {errors.category && <p className={styles.error}>{errors.category}</p>}
                </div>

                <div>
                    <Paragraph fontSize={16} margin="0 0 10px 0" text="Opzioni di visibilità" />
                    <InputField
                        type="checkbox"
                        label="Visibile pubblicamente"
                        title="Visibile pubblicamente"
                        checked={formData.is_public}
                        onChange={(e) => setField("is_public", (e.target as HTMLInputElement).checked)}
                    />
                    <InputField
                        type="checkbox"
                        label="Richiede approvazione per le richieste di iscrizione"
                        title="Richiede approvazione per le richieste di iscrizione"
                        checked={formData.requires_approval}
                        onChange={(e) => setField("requires_approval", (e.target as HTMLInputElement).checked)}
                    />
                </div>
            </div>

            {apiError && <p className={styles.apiError}>{apiError}</p>}
            <div className={styles.buttonGroup} style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? "none" : "auto" }}>
                <Button type="outlined" text="Annulla" href="/organizzazioni" />
                <Button text={isLoading ? "Creazione..." : "Crea organizzazione"} />
            </div>
        </form>
        </>
    );
}
