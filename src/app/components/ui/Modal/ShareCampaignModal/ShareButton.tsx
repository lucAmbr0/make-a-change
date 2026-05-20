"use client";

import Button from '../../Button/Button';

interface ShareButtonProps {
    title: string;
    shareText?: string;
    shareUrl?: string;
}

export default function ShareButton({ title, shareText, shareUrl }: ShareButtonProps) {
    async function handleShare() {
        const resolvedUrl = shareUrl ?? window.location.href;
        const text = shareText ?? `${title} - Condividi questa iniziativa`;

        if (navigator.share) {
            await navigator.share({ title, text, url: resolvedUrl });
            return;
        }

        await navigator.clipboard.writeText(resolvedUrl);
    }

    return <Button icon="share" type="outlined" onClick={handleShare} />;
}