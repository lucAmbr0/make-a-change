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
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(resolvedUrl);
                return;
            }

            const textarea = document.createElement('textarea');
            textarea.value = resolvedUrl;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) return;

            window.prompt('Copia il link manualmente', resolvedUrl);
        } catch (e) {
            window.prompt('Copia il link manualmente', resolvedUrl);
        }
    }

    return <Button icon="share" type="outlined" onClick={handleShare} />;
}