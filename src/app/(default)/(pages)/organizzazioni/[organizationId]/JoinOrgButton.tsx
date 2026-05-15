'use client';

import { useState } from 'react';
import Button from '@/app/components/ui/Button/Button';
import LoginModal from '@/app/components/ui/LoginModal/LoginModal';
import ConfirmModal from '@/app/components/ui/ConfirmModal/ConfirmModal';
import { useUser } from '@/app/components/logic/UserProvider';

export type JoinState = 'idle' | 'loading' | 'member' | 'requested' | 'error';

export default function JoinOrgButton({
    organizationId,
    initialState,
    requiresApproval,
    isPublic,
    isAuthenticated,
}: {
    organizationId: number;
    initialState: JoinState;
    requiresApproval: boolean;
    isPublic: boolean;
    isAuthenticated: boolean;
}) {
    const { user } = useUser();
    const [state, setState] = useState<JoinState>(initialState);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
    const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

    async function doJoin() {
        setIsJoinConfirmOpen(false);
        setState('loading');
        try {
            const res = await fetch('/api/organization/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ organization_id: organizationId }),
            });
            if (!res.ok) { setState('error'); return; }
            const data = await res.json().catch(() => ({}));
            setState(data.requested_at !== undefined ? 'requested' : 'member');
        } catch {
            setState('error');
        }
    }

    async function doLeave() {
        if (!user) return;
        setIsLeaveConfirmOpen(false);
        setState('loading');
        try {
            const res = await fetch(`/api/organization/${organizationId}/member`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ user_id: user.id }),
            });
            if (!res.ok) { setState('error'); return; }
            setState('idle');
        } catch {
            setState('error');
        }
    }

    function handleClick() {
        if (!isAuthenticated) { setIsLoginOpen(true); return; }
        if (!requiresApproval) { setIsJoinConfirmOpen(true); return; }
        doJoin();
    }

    function buildLeaveDescription() {
        let desc = 'Non potrai più vedere le campagne non pubbliche.';
        if (!isPublic) {
            desc += ' Questa organizzazione è solo su invito, per rientrare avrai bisogno di un nuovo invito.';
        } else if (requiresApproval) {
            desc += ' Questa organizzazione richiede l\'approvazione dei membri, per rientrare dovrai essere accettato di nuovo dai moderatori.';
        }
        return desc;
    }

    if (state === 'member') {
        return (
            <>
                <Button text="Sei membro" icon="material-symbols:done" type="filled" onClick={() => setIsLeaveConfirmOpen(true)} />
                <ConfirmModal
                    open={isLeaveConfirmOpen}
                    title="Vuoi lasciare l'organizzazione?"
                    description={buildLeaveDescription()}
                    confirmLabel="Lascia"
                    onConfirm={doLeave}
                    onClose={() => setIsLeaveConfirmOpen(false)}
                />
            </>
        );
    }
    if (state === 'requested') {
        return <Button text="Richiesta inviata" icon="material-symbols:schedule-outline" type="outlined" disabled />;
    }
    if (state === 'error') {
        return <Button text="Errore, riprova" icon="error" type="outlined" onClick={() => setState('idle')} />;
    }

    return (
        <>
            <Button
                text={requiresApproval ? "Richiedi di entrare" : "Unisciti"}
                icon="material-symbols:add-circle-outline"
                type="filled"
                disabled={state === 'loading'}
                onClick={handleClick}
            />
            <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            <ConfirmModal
                open={isJoinConfirmOpen}
                title="Vuoi unirti alla campagna?"
                description="Il tuo nome sarà visibile tra i membri ai proprietari dell'organizzazione e l'organizzazione sarà aggiunta al tuo profilo."
                confirmLabel="Unisciti"
                onConfirm={doJoin}
                onClose={() => setIsJoinConfirmOpen(false)}
            />
        </>
    );
}
