'use client';

import styles from './Modal.module.css';
import { useEffect } from 'react';

export function Modal({ open, onClose, children, overlayType }: { open: boolean; onClose: () => void; children: React.ReactNode; overlayType?: 'dark' | 'blurred' }) {
  useEffect(() => {
    function handleKey(e: { key: string; }) {
      if (e.key === 'Escape') onClose();
    }

    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={
        overlayType === 'dark'
          ? styles.darkOverlay
          : overlayType === 'blurred'
          ? styles.blurredOverlay
          : styles.modalOverlay
      }
      onClick={onClose}
    >
      <div
        className={`${styles.modalContainer} pageAppear`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}