"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import styles from './AddCommentBox.module.css';
import { useUser } from '@/app/components/logic/UserProvider';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { useApiAction } from '@/lib/api/useApiAction';

interface AddCommentBoxProps {
    campaignId: number;
    canComment?: boolean;
    requiresApproval?: boolean;
}

export default function AddCommentBox({ campaignId, canComment = true, requiresApproval = false }: AddCommentBoxProps) {
    const { user } = useUser();
    const router = useRouter();

    const [text, setText] = useState('');
    const [validationError, setValidationError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const submit = useApiAction(async (value: string) => {
        return apiFetch(`/api/campaign/${campaignId}/comments`, {
            method: 'POST',
            body: { text: value },
        });
    }, {
        onSuccess: () => {
            setSuccessMessage('Commento inviato');
            setText('');
            setTimeout(() => router.refresh(), 600);
        },
    });

    function validate(value: string) {
        const v = value.trim();
        if (!v) return 'Il commento non può essere vuoto';
        if (v.length > 65535) return 'Il commento è troppo lungo';
        return '';
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setSuccessMessage('');

        const error = validate(text);
        setValidationError(error);
        if (error) return;

        await submit.run(text.trim());
    }

    const disabled = submit.isLoading || !user || !canComment;

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <textarea
                required
                placeholder="Aggiungi un commento"
                maxLength={65535}
                className={styles.input}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    if (validationError) setValidationError('');
                    if (submit.error) submit.reset();
                }}
            />
            
            <button className={styles.button} type="submit" disabled={disabled} aria-disabled={disabled}>
                <Icon icon={"material-symbols:send-outline"} className={styles.icon} fontSize={32} width={32} height={32} />
            </button>
            {validationError ? <small className={styles.errorText}>{validationError}</small> : null}
            {submit.error ? <small className={styles.errorText}>{submit.error}</small> : null}
            {successMessage ? <small className={styles.successText}>{successMessage}</small> : null}
        </form>
    );
}
