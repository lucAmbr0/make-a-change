'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import styles from './PwaInstallBanner.module.css';

// Fired by Chrome/Android before showing the native install prompt
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaInstallBanner() {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((navigator as any).standalone) return; // iOS standalone
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    // Android / Chrome: capture the deferred prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari: no automatic prompt, show manual instructions instead
    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as any).MSStream;
    const isInSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isInSafari) setShowIos(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setDismissed(true);
    setAndroidPrompt(null);
    setShowIos(false);
  }

  async function installAndroid() {
    if (!androidPrompt) return;
    await androidPrompt.prompt();
    const { outcome } = await androidPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    else setAndroidPrompt(null);
  }

  if (dismissed) return null;

  if (androidPrompt) {
    return (
      <div className={styles.banner} role="banner">
        <Icon icon="material-symbols:install-mobile-outline" fontSize={22} className={styles.icon} />
        <p className={styles.text}>
          Installa <strong>Make a Change</strong> sul tuo dispositivo per un&apos;esperienza migliore.
        </p>
        <div className={styles.actions}>
          <button className={styles.install} onClick={installAndroid} type="button">Installa</button>
          <button className={styles.dismiss} onClick={dismiss} type="button" aria-label="Chiudi">
            <Icon icon="material-symbols:close-rounded" fontSize={18} />
          </button>
        </div>
      </div>
    );
  }

  if (showIos) {
    return (
      <div className={styles.banner} role="banner">
        <Icon icon="material-symbols:ios-share" fontSize={22} className={styles.icon} />
        <p className={styles.text}>
          Per installare l&apos;app tocca{' '}
          <Icon icon="material-symbols:ios-share" fontSize={14} style={{ verticalAlign: 'middle' }} />{' '}
          e poi <strong>&quot;Aggiungi a Home&quot;</strong>.
        </p>
        <button className={styles.dismiss} onClick={dismiss} type="button" aria-label="Chiudi">
          <Icon icon="material-symbols:close-rounded" fontSize={18} />
        </button>
      </div>
    );
  }

  return null;
}
