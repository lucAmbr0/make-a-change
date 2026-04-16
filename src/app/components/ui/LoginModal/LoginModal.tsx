"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/app/components/ui/Modal/Modal";
import { useUser } from "@/app/components/logic/UserProvider";
import styles from "./LoginModal.module.css";

type LoginErrors = {
    email?: string;
    password?: string;
};

function validate(email: string, password: string): LoginErrors {
    const errors: LoginErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        errors.email = "Email obbligatoria";
    } else if (normalizedEmail.length > 256 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        errors.email = "Email non valida";
    }

    if (!password) {
        errors.password = "Password obbligatoria";
    } else if (
        password.length < 8 ||
        password.length > 72 ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
        errors.password = "Credenziali non valide";
    }

    return errors;
}

function getApiErrorMessage(payload: any): string {
    if (payload?.message && typeof payload.message === "string") {
        return payload.message;
    }

    if (Array.isArray(payload?.details?.errors)) {
        const firstMessage = payload.details.errors[0]?.message;
        if (typeof firstMessage === "string") {
            return firstMessage;
        }
    }

    return "Credenziali errate o non valide";
}

export default function LoginModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { refreshUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [requestError, setRequestError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRequestError("");
        setSuccessMessage("");

        const nextErrors = validate(email, password);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: normalizedEmail,
                    password,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                setRequestError(getApiErrorMessage(payload));
                return;
            }

            await refreshUser();
            setSuccessMessage("Accesso effettuato");
            setPassword("");
            setTimeout(() => {
                onClose();
            }, 400);
        } catch {
            setRequestError("Errore di rete, riprova");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose() {
        setErrors({});
        setRequestError("");
        setSuccessMessage("");
        setIsSubmitting(false);
        onClose();
    }

    function handleEmailChange(value: string) {
        setEmail(value);
        setRequestError("");
        if (errors.email) {
            setErrors((prev) => ({ ...prev, email: undefined }));
        }
    }

    function handlePasswordChange(value: string) {
        setPassword(value);
        setRequestError("");
        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
        }
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <form className={styles.loginModal} onSubmit={handleSubmit} noValidate>
                <h2 className={styles.title}>Accedi al tuo account</h2>
                <div className={styles.fields}>
                    <label className={styles.field}>
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => handleEmailChange(event.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            className={errors.email ? styles.inputError : undefined}
                        />
                        {errors.email ? <small className={styles.errorText}>{errors.email}</small> : null}
                    </label>
                    <label className={styles.field}>
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => handlePasswordChange(event.target.value)}
                            aria-invalid={Boolean(errors.password)}
                            className={errors.password ? styles.inputError : undefined}
                        />
                        {errors.password ? <small className={styles.errorText}>{errors.password}</small> : null}
                    </label>
                </div>
                {requestError ? <p className={styles.requestError}>{requestError}</p> : null}
                {successMessage ? <p className={styles.successText}>{successMessage}</p> : null}
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Accesso in corso..." : "Accedi"}
                </button>
                <a href="#" className={styles.signupLink} onClick={(event) => event.preventDefault()}>
                    Crea il tuo account
                </a>
            </form>
        </Modal>
    );
}