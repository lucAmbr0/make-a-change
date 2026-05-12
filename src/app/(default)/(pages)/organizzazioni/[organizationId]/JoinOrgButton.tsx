'use client';

import { useState } from 'react';
import Button from '@/app/components/ui/Button/Button';

export type JoinState = 'idle' | 'loading' | 'member' | 'requested' | 'error';

export default function JoinOrgButton({
    organizationId,
    initialState,
    requiresApproval,
}: {
    organizationId: number;
    initialState: JoinState;
    requiresApproval: boolean;
}) {
    const [state, setState] = useState<JoinState>(initialState);

    async function handleJoin() {
        setState('loading');
        try {
            const res = await fetch('/api/organization/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ organization_id: organizationId }),
            });

            if (!res.ok) {
                setState('error');
                return;
            }

            const data = await res.json().catch(() => ({}));
            setState(data.requested_at !== undefined ? 'requested' : 'member');
        } catch {
            setState('error');
        }
    }

    if (state === 'member') {
        return <Button text="Sei membro" icon="check" type="filled" disabled />;
    }
    if (state === 'requested') {
        return <Button text="Richiesta inviata" icon="check" type="outlined" disabled />;
    }
    if (state === 'error') {
        return <Button text="Errore, riprova" icon="error" type="outlined" onClick={() => setState('idle')} />;
    }

    return (
        <Button
            text={requiresApproval ? "Richiedi di entrare" : "Unisciti"}
            icon="add"
            type="filled"
            disabled={state === 'loading'}
            onClick={handleJoin}
        />
    );
}
