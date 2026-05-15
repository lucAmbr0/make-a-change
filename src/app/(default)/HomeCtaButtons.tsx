"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Button from "../components/ui/Button/Button";
import LoginModal from "../components/ui/LoginModal/LoginModal";

export default function HomeCtaButtons({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (isAuthenticated) {
    return (
      <div className={styles.ctaButtons}>
        <Button href="/informazioni" type="outlined" text="Scopri di più" icon="material-symbols:info-outline" />
      </div>
    );
  }

  return (
    <>
      <div className={styles.ctaButtons}>
        <Button href="/signup" type="filled" text="Crea il tuo account" icon="material-symbols:person-add-outline" />
        <Button
          type="outlined"
          text="Accedi"
          icon="material-symbols:login"
          onClick={() => setIsLoginOpen(true)}
        />
        <Button href="/informazioni" type="outlined" text="Scopri di più" icon="material-symbols:info-outline" />
      </div>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}