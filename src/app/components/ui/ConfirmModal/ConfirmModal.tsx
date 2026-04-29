"use client";

import { Modal } from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      overlayType="blurred"
      containerBgColor="white"
      borderWidth="1px"
      borderColor="var(--accent-300)"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
    >
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
        <div className={styles.actions}>
          <Button text={cancelLabel} onClick={onClose} type="outlined" textSize={16} />
          <Button text={confirmLabel} onClick={onConfirm} type="filled" textSize={16} />
        </div>
      </div>
    </Modal>
  );
}
