'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Unregister any SW not pointing at /sw.js (cleans up the old broken one)
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const stale = regs.filter(
        (r) => r.active?.scriptURL && !r.active.scriptURL.endsWith('/sw.js')
      );
      return Promise.all(stale.map((r) => r.unregister()));
    }).then(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.error('[SW] Registration failed:', err));
    });
  }, []);

  return null;
}
