'use client';

import styles from './Modal.module.css';
import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  children,
  overlayType,
  containerBgColor = 'white',
  borderWidth = '0px',
  borderColor = 'transparent',
  boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayType?: 'dark' | 'blurred';
  containerBgColor?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
}) {
  useEffect(() => {
    function handleKey(e: { key: string; }) {
      if (e.key === 'Escape') onClose();
    }

    if (open) {
      window.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
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
        style={{
          backgroundColor: containerBgColor,
          borderWidth,
          borderColor,
          borderStyle: borderWidth !== '0px' ? 'solid' : 'none',
          boxShadow,
        }}
      >
        {children}
      </div>
    </div>
  );
}