"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button/Button";
import ConfirmModal from "@/app/components/ui/ConfirmModal/ConfirmModal";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";
import styles from "./RepostCampaignButton.module.css";

interface RepostCampaignButtonProps {
    campaignId: number;
    initialReposted: boolean;
}

export default function RepostCampaignButton({
    campaignId,
    initialReposted,
}: RepostCampaignButtonProps) {
    const router = useRouter();
    const [hasReposted, setHasReposted] = useState(initialReposted);
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

    const repost = useApiAction(
        async () =>
            apiFetch("/api/campaign/reposts", {
                method: "POST",
                body: { campaign_id: campaignId },
            }),
        {
            onSuccess: () => {
                setHasReposted(true);
                router.refresh();
            },
        },
    );

    const removeRepost = useApiAction(
        async () =>
            apiFetch("/api/campaign/reposts", {
                method: "DELETE",
                body: { campaign_id: campaignId },
            }),
        {
            onSuccess: () => {
                setHasReposted(false);
                setIsRemoveConfirmOpen(false);
                router.refresh();
            },
        },
    );

    const buttonText = hasReposted
        ? "Ricondivisa sul profilo"
        : repost.isLoading
            ? "Ricondivisione..."
            : "Ricondividi sul profilo";

    const buttonTitle = hasReposted
        ? "Hai già ricondiviso questa campagna: clicca per rimuoverla dal profilo"
        : "Ricondividi questa campagna sul tuo profilo";

    const errorText = repost.errorCode === "CONFLICT"
        ? "Hai già ricondiviso questa campagna."
        : repost.error;

    function handleClick() {
        if (hasReposted) {
            setIsRemoveConfirmOpen(true);
            return;
        }

        if (!repost.isLoading) {
            repost.run();
        }
    }

    function handleRemoveConfirm() {
        if (removeRepost.isLoading) return;
        removeRepost.run();
    }

    return (
        <div className={styles.container}>
            <Button
                icon="material-symbols:autorenew"
                text={buttonText}
                type="outlined"
                disabled={repost.isLoading}
                onClick={handleClick}
                title={buttonTitle}
            />
            {errorText ? <small className={styles.errorText}>{errorText}</small> : null}

            <ConfirmModal
                open={isRemoveConfirmOpen}
                title="Rimuovere la ricondivisione?"
                description="La campagna verrà rimossa dal tuo profilo pubblico. Potrai ricondividerla di nuovo in qualsiasi momento."
                confirmLabel={removeRepost.isLoading ? "Rimozione..." : "Rimuovi ricondivisione"}
                confirmDisabled={removeRepost.isLoading}
                feedback={removeRepost.errorCode === "NOT_FOUND" ? "Questa campagna non risulta più ricondivisa." : removeRepost.error ?? undefined}
                onConfirm={handleRemoveConfirm}
                onClose={() => {
                    if (!removeRepost.isLoading) {
                        setIsRemoveConfirmOpen(false);
                        removeRepost.reset();
                    }
                }}
            />
        </div>
    );
}