"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import styles from './AddCommentBox.module.css';
import { useUser } from '@/app/components/logic/UserProvider';
import { usePathname, useRouter } from 'next/navigation';

export default function AddCommentBox() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    const [text, setText] = useState('');
    const [errors, setErrors] = useState('');
    const [requestError, setRequestError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const campaignId = (() => {
        try {
            const match = pathname?.match(/\/campagne\/(\d+)/);
            return match ? Number(match[1]) : null;
        } catch {
            return null;
        }
    })();

    function validate(value: string) {
        const v = value.trim();
        if (!v) return 'Il commento non può essere vuoto';
        if (v.length > 65535) return 'Il commento è troppo lungo';
        return '';
    }

    function getPayloadMessage(payload: any) {
        if (payload?.message && typeof payload.message === 'string') return payload.message;
        if (Array.isArray(payload?.details?.errors)) {
            const first = payload.details.errors[0]?.message;
            if (typeof first === 'string') return first;
        }
        return 'Errore durante l\'invio del commento';
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setRequestError('');
        setSuccessMessage('');

        const validationError = validate(text);
        setErrors(validationError);
        if (validationError) return;

        if (!campaignId) {
            setRequestError("Impossibile risolvere l'ID della campagna");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: text.trim() }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                setRequestError(getPayloadMessage(payload));
                return;
            }

            setSuccessMessage('Commento inviato');
            setText('');
            setTimeout(() => router.refresh(), 600);
        } catch (err) {
            setRequestError('Errore di rete, riprova');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose() {
        setErrors('');
        setRequestError('');
        setSuccessMessage('');
        setIsSubmitting(false);
    }

    return (
        <>
            <form className={styles.container} onSubmit={handleSubmit}>
                <textarea
                    required
                    placeholder="Aggiungi un commento"
                    maxLength={65535}
                    className={styles.input}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setRequestError('');
                        if (errors) setErrors('');
                    }}
                />
                <button className={styles.button} type="submit" disabled={isSubmitting || !user} aria-disabled={isSubmitting || !user}>
                    <Icon icon={"material-symbols:send-outline"} className={styles.icon} fontSize={32} width={32} height={32} />
                </button>
                {errors ? <small className={styles.errorText}>{errors}</small> : null}
                {requestError ? <small className={styles.errorText}>{requestError}</small> : null}
                {successMessage ? <small className={styles.successText}>{successMessage}</small> : null}
            </form>
        </>
    );
}