"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button/Button";
import { apiFetch } from "@/lib/api/client";
import type { memberResponseSchema } from "@/lib/schemas/members";
import type { approvalRequestResponseSchema } from "@/lib/schemas/approval_requests";
import type { inviteCodeRowSchema } from "@/lib/schemas/invite_codes";
import styles from "./MembersManager.module.css";
import InviteCodesSection from "./InviteCodesSection";

function roleName(member: memberResponseSchema) {
    if (member.is_owner) return "Proprietario";
    if (member.is_moderator) return "Moderatore";
    return "Membro";
}

function fullName(first?: string | null, last?: string | null) {
    return [first, last].filter(Boolean).join(" ") || "Utente sconosciuto";
}

function MemberRow({
    member,
    organizationId,
    isOwner,
    onMutate,
}: {
    member: memberResponseSchema;
    organizationId: number;
    isOwner: boolean;
    onMutate: () => void;
}) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleRemove() {
        setLoading("remove");
        try {
            await apiFetch(`/api/organization/${organizationId}/member`, {
                method: "DELETE",
                body: { user_id: member.user_id },
            });
            onMutate();
        } finally {
            setLoading(null);
        }
    }

    async function handleToggleModerator() {
        setLoading("mod");
        try {
            await apiFetch(`/api/organization/${organizationId}/member`, {
                method: "PATCH",
                body: { user_id: member.user_id, is_moderator: !member.is_moderator },
            });
            onMutate();
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className={styles.row}>
            <div className={styles.rowInfo}>
                <span className={styles.name}>{fullName(member.user_first_name, member.user_last_name)}</span>
                <span className={`${styles.badge} ${member.is_owner ? styles.badgeOwner : member.is_moderator ? styles.badgeMod : styles.badgeMember}`}>
                    {roleName(member)}
                </span>
            </div>
            {!member.is_owner && (
                <div className={styles.rowActions}>
                    {isOwner && (
                        <Button
                            icon={member.is_moderator ? "material-symbols:shield" : "material-symbols:shield-outline"}
                            title={member.is_moderator ? "Rimuovi moderatore" : "Promuovi a moderatore"}
                            type="outlined"
                            onClick={handleToggleModerator}
                            disabled={loading !== null}
                        />
                    )}
                    <Button
                        icon="material-symbols:person-remove-outline"
                        title="Rimuovi dall'organizzazione"
                        type="outlined"
                        onClick={handleRemove}
                        disabled={loading !== null}
                    />
                </div>
            )}
        </div>
    );
}

function ApprovalRow({
    request,
    organizationId,
    onMutate,
}: {
    request: approvalRequestResponseSchema;
    organizationId: number;
    onMutate: () => void;
}) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDecision(approval: boolean) {
        setLoading(approval ? "approve" : "reject");
        try {
            await apiFetch(`/api/organization/${organizationId}/approval_requests`, {
                method: "POST",
                body: { user_id: request.user_id, approval },
            });
            onMutate();
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className={styles.row}>
            <div className={styles.rowInfo}>
                <span className={styles.name}>{fullName(request.user_first_name, request.user_last_name)}</span>
                <span className={`${styles.badge} ${styles.badgePending}`}>In attesa</span>
            </div>
            <div className={styles.rowActions}>
                <Button
                    icon="material-symbols:check-circle-outline"
                    title="Approva richiesta"
                    type="outlined"
                    onClick={() => handleDecision(true)}
                    disabled={loading !== null}
                />
                <Button
                    icon="material-symbols:cancel-outline"
                    title="Rifiuta richiesta"
                    type="outlined"
                    onClick={() => handleDecision(false)}
                    disabled={loading !== null}
                />
            </div>
        </div>
    );
}

export default function MembersManager({
    organizationId,
    initialMembers,
    initialRequests,
    initialInviteCodes,
    isOwner,
}: {
    organizationId: number;
    initialMembers: memberResponseSchema[];
    initialRequests: approvalRequestResponseSchema[];
    initialInviteCodes: inviteCodeRowSchema[];
    isOwner: boolean;
}) {
    const router = useRouter();

    function refresh() {
        router.refresh();
    }

    return (
        <>
        <InviteCodesSection organizationId={organizationId} initialCodes={initialInviteCodes} />
        <div className={styles.grid}>
            <section className={styles.column}>
                <h2 className={styles.columnTitle}>Membri <span className={styles.count}>{initialMembers.length}</span></h2>
                {initialMembers.length === 0 ? (
                    <p className={styles.empty}>Nessun membro.</p>
                ) : (
                    <div className={styles.list}>
                        {initialMembers.map((m) => (
                            <MemberRow
                                key={m.user_id}
                                member={m}
                                organizationId={organizationId}
                                isOwner={isOwner}
                                onMutate={refresh}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.column}>
                <h2 className={styles.columnTitle}>In attesa di approvazione <span className={styles.count}>{initialRequests.length}</span></h2>
                {initialRequests.length === 0 ? (
                    <p className={styles.empty}>Nessuna richiesta in sospeso.</p>
                ) : (
                    <div className={styles.list}>
                        {initialRequests.map((r) => (
                            <ApprovalRow
                                key={r.user_id}
                                request={r}
                                organizationId={organizationId}
                                onMutate={refresh}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
        </>
    );
}
