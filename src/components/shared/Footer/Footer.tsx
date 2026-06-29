"use client";

import styles from "./Footer.module.scss";
import { toast } from "sonner";

export default function Footer() {
  const year = new Date().getFullYear();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Site link copied", {
      duration: 2000,
      dismissible: true,
    });
  };

  return (
    <footer className={styles.footer}>
      <span className={styles.footer__copy}>Paletto© {year}</span>
      <button className={styles.footer__share} onClick={handleShare}>
        Share site
      </button>
    </footer>
  );
}
