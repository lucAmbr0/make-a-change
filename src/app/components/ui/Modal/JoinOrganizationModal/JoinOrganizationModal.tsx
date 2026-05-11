'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Modal } from '../Modal';
import styles from './JoinOrganizationModal.module.css';
import Button from '../../Button/Button';

const CODE_LENGTH = 6;

function mapJoinError(message: string): string {
    if (message.includes('already a member')) return 'Sei già membro di questa organizzazione.';
    if (message.includes('pending approval request')) return "Hai già inviato una richiesta per questa organizzazione. Attendi l'approvazione dei moderatori.";
    if (message.includes('Invite code not found') || message.includes('not found')) return 'Codice invito non trovato o non valido.';
    if (message.includes('expired')) return 'Il codice invito è scaduto.';
    if (message.includes('no remaining uses')) return 'Il codice invito ha esaurito tutti gli utilizzi disponibili.';
    if (message.includes('not logged in') || message.includes('Unauthorized') || message.includes('401')) return 'Devi essere autenticato per entrare in un\'organizzazione.';
    return "Errore durante l'operazione. Riprova.";
}

type OrgPreview = {
    id: number;
    name: string;
    members_count: number;
    campaigns_count: number;
    requires_approval: boolean;
};

type SuccessState = {
    type: 'joined' | 'requested';
    orgId: number;
    orgName: string;
};

export default function JoinOrganizationModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [orgPreview, setOrgPreview] = useState<OrgPreview | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [success, setSuccess] = useState<SuccessState | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const code = digits.join('');
    const isComplete = digits.every((d) => d !== '');

    function resetState() {
        setDigits(Array(CODE_LENGTH).fill(''));
        setOrgPreview(null);
        setPreviewError('');
        setRequestError('');
        setSuccess(null);
        setIsSubmitting(false);
        setIsLoadingPreview(false);
    }

    function handleClose() {
        resetState();
        onClose();
    }

    // Focus first input when modal opens
    useEffect(() => {
        if (open) {
            resetState();
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Fetch org preview when all 6 digits are filled
    useEffect(() => {
        if (!isComplete) {
            setOrgPreview(null);
            setPreviewError('');
            return;
        }

        let cancelled = false;
        setIsLoadingPreview(true);
        setPreviewError('');
        setOrgPreview(null);

        fetch(`/api/organization/lookup?invite_code=${code}`)
            .then(async (res) => {
                if (cancelled) return;
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg: string = data?.error?.message ?? data?.message ?? '';
                    setPreviewError(msg || 'Codice non valido o non trovato');
                } else {
                    setOrgPreview(data);
                }
            })
            .catch(() => {
                if (!cancelled) setPreviewError('Errore di rete, riprova');
            })
            .finally(() => {
                if (!cancelled) setIsLoadingPreview(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isComplete, code]);

    function handleDigitChange(index: number, value: string) {
        const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!normalized) return;

        const char = normalized[normalized.length - 1];
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        setPreviewError('');

        if (index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (digits[index]) {
                const next = [...digits];
                next[index] = '';
                setDigits(next);
            } else if (index > 0) {
                const next = [...digits];
                next[index - 1] = '';
                setDigits(next);
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData('text')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, CODE_LENGTH);
        if (!pasted) return;

        const next = [...digits];
        for (let i = 0; i < pasted.length; i++) {
            next[i] = pasted[i];
        }
        setDigits(next);
        setPreviewError('');

        const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
        inputRefs.current[nextFocus]?.focus();
    }

    async function handleJoin() {
        if (!orgPreview || isSubmitting) return;
        setIsSubmitting(true);
        setRequestError('');

        try {
            const res = await fetch('/api/organization/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ invite_code: code }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const raw: string = data?.error?.message ?? data?.message ?? '';
                setRequestError(mapJoinError(raw));
                return;
            }

            if (data.requested_at !== undefined) {
                setSuccess({ type: 'requested', orgId: orgPreview.id, orgName: orgPreview.name });
            } else {
                setSuccess({ type: 'joined', orgId: orgPreview.id, orgName: orgPreview.name });
                setTimeout(() => {
                    router.push(`/organizzazioni/${orgPreview.id}`);
                    handleClose();
                }, 1500);
            }
        } catch {
            setRequestError('Errore di rete, riprova');
        } finally {
            setIsSubmitting(false);
        }
    }

    const requiresApproval = Boolean(orgPreview?.requires_approval);

    return (
        <Modal open={open} onClose={handleClose}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Entra in un'organizzazione</h2>
                    <Button type='outlined' icon='material-symbols:close-rounded' textSize={22} onClick={handleClose} />
                </div>

                {!success ? (
                    <>
                        <p className={styles.subtitle}>Inserisci il codice invito di 6 caratteri</p>

                        <div className={styles.codeInputRow} role="group" aria-label="Codice invito">
                            {digits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    className={`${styles.codeBox}${previewError ? ` ${styles.codeBoxError}` : ''}`}
                                    type="text"
                                    inputMode="text"
                                    maxLength={2}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    onFocus={(e) => e.target.select()}
                                    autoComplete="off"
                                    spellCheck={false}
                                    aria-label={`Carattere ${i + 1} del codice invito`}
                                />
                            ))}
                        </div>

                        {isLoadingPreview && (
                            <p className={styles.loading}>Ricerca organizzazione...</p>
                        )}

                        {previewError && !isLoadingPreview && (
                            <p className={styles.errorText}>{previewError}</p>
                        )}

                        {orgPreview && !isLoadingPreview && (
                            <>
                                <div className={styles.orgPreviewCard}>
                                    <div className={styles.orgInfo}>
                                        <span className={styles.orgName}>{orgPreview.name}</span>
                                        <div className={styles.orgStats}>
                                            <span className={styles.orgStat}>
                                                <Icon icon="material-symbols:person-outline" fontSize="16px" />
                                                {orgPreview.members_count}{' '}
                                                {orgPreview.members_count === 1 ? 'membro' : 'membri'}
                                            </span>
                                            <span className={styles.orgStat}>
                                                <Icon icon="material-symbols:campaign-outline" fontSize="16px" />
                                                {orgPreview.campaigns_count}{' '}
                                                {orgPreview.campaigns_count === 1 ? 'campagna' : 'campagne'}
                                            </span>
                                        </div>
                                    </div>
                                    {requiresApproval && (
                                        <span className={styles.approvalBadge}>Su approvazione</span>
                                    )}
                                </div>

                                {requestError && (
                                    <p className={styles.requestError}>{requestError}</p>
                                )}

                                <button
                                    className={styles.joinButton}
                                    onClick={handleJoin}
                                    disabled={isSubmitting}
                                    type="button"
                                >
                                    {isSubmitting
                                        ? 'Invio in corso...'
                                        : requiresApproval
                                        ? 'Richiedi di entrare'
                                        : 'Entra'}
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <Icon
                            icon="material-symbols:check-circle-outline"
                            className={styles.successIcon}
                            fontSize="48px"
                        />
                        {success.type === 'joined' ? (
                            <>
                                <p className={styles.successTitle}>Benvenuto!</p>
                                <p className={styles.successText}>
                                    Ti sei unito all'organizzazione <strong>{success.orgName}</strong>.
                                    Reindirizzamento in corso...
                                </p>
                            </>
                        ) : (
                            <>
                                <p className={styles.successTitle}>Richiesta inviata!</p>
                                <p className={styles.successText}>
                                    La tua richiesta di entrare in <strong>{success.orgName}</strong> è stata
                                    inviata. Attendi l'approvazione dei moderatori.
                                </p>
                                <button className={styles.joinButton} onClick={handleClose} type="button">
                                    Chiudi
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
