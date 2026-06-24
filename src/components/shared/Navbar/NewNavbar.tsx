"use client";

import Link from "next/link";
import styles from "./NewNavbar.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import { HistoryIcon, Redo2Icon, Undo2Icon } from "lucide-react";
import { usePalette } from "@/hooks/usePalette";
import { usePaletteHistory } from "@/features/history/PaletteHistoryContext";

export default function NewNavbar() {
  const { undo, redo, canUndo, canRedo } = usePalette();
  const { historyOpen, toggleHistory } = usePaletteHistory();
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__left}>
        <Link href="/" className={styles.navbar__wordMark}>
          Paletto
        </Link>
        <Tooltip text="Generate" shortcut={"spacebar"}>
          <div className={styles.navbar__spaceBarWrapper}>
            Press
            <div className={styles.spaceBar}>spacebar</div>
            to generate
          </div>
        </Tooltip>
      </div>
      <div className={styles.navbar__right}>
        <div className={styles.historyButtons}>
          <Tooltip text="Undo" shortcut={isMac ? "⌘ + z" : "Ctrl+Z"}>
            <button
              className={styles.navbar__button}
              onClick={() => undo()}
              disabled={!canUndo}
              title={"Undo"}
            >
              <Undo2Icon />
            </button>
          </Tooltip>
          <Tooltip text="Redo" shortcut={isMac ? "⌘ + shift + z" : "Ctrl+Y"}>
            <button
              className={styles.navbar__button}
              onClick={() => redo()}
              disabled={!canRedo}
              title={"Redo"}
            >
              <Redo2Icon />
            </button>
          </Tooltip>
        </div>
        <div className={styles.navbar__divider} />
        <button
          onClick={toggleHistory}
          className={`${styles.iconBtn} ${historyOpen ? styles.active : ""}`}
        >
          <HistoryIcon />
        </button>
      </div>
    </nav>
  );
}
