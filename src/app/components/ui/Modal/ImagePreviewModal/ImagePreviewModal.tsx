'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from '../Modal';
import Button from '../../Button/Button';
import styles from './ImagePreviewModal.module.css';

export default function ImagePreviewModal({
    open,
    src,
    onSave,
    onCancel,
}: {
    open: boolean;
    src: string;
    onSave: () => void;
    onCancel: () => void;
}) {
    const [broken, setBroken] = useState(false);

    useEffect(() => {
        if (open) setBroken(false);
    }, [open, src]);

    return (
        <Modal open={open} onClose={onCancel}>
            <div className={styles.container}>
                <h3 className={styles.title}>Anteprima immagine</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className={styles.image}
                    src={src}
                    alt="Anteprima"
                    onError={() => setBroken(true)}
                    onLoad={() => setBroken(false)}
                />
                {broken && (
                    <p className={styles.error}>
                        <Icon icon="material-symbols:broken-image-outline" fontSize={18} />
                        Impossibile caricare l&apos;immagine dall&apos;URL fornito
                    </p>
                )}
                <div className={styles.actions}>
                    <Button text="Annulla" onClick={onCancel} type="outlined" />
                    <Button text="Salva" onClick={onSave} type="filled" />
                </div>
            </div>
        </Modal>
    );
}
