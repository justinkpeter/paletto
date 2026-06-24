"use client";

import { ReactNode } from "react";
import styles from "./Tooltip.module.scss";

type TooltipProps = {
  text: string;
  shortcut?: string;
  children: ReactNode;
  position?: "top" | "bottom";
};

export default function Tooltip({
  text,
  shortcut,
  children,
  position = "bottom",
}: TooltipProps) {
  return (
    <span className={`${styles.tooltip} ${styles[`tooltip--${position}`]}`}>
      {children}
      <span className={styles.tooltip__box}>
        <span className={styles.tooltip__text}>{text}</span>
        {shortcut && (
          <span className={styles.tooltip__shortcut}>{shortcut}</span>
        )}
      </span>
    </span>
  );
}
