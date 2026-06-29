"use client";

import Link from "next/link";
import styles from "./Navbar.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import {
  EyeIcon,
  ImagePlusIcon,
  PaletteIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { usePalette } from "@/hooks/usePalette";
import { BemBuilder } from "@/lib/BemBuilder";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";

export default function Navbar() {
  const { undo, redo, canUndo, canRedo, regenerate } = usePalette();
  const { isOpen, toggle } = useSidebar();

  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  const bem = new BemBuilder("navbar", styles);

  return (
    <nav className={bem.block()}>
      <div className={bem.element("left")}>
        <Link href="/" className={bem.element("wordMark")}>
          Paletto
        </Link>
        <Tooltip text="Generate" shortcut={"spacebar"}>
          <div className={bem.element("spaceBarWrapper")}>
            <span className={bem.element("spaceBarWrapper", "desktopHint")}>
              Press
              <div className={styles.spaceBar}>spacebar</div>
              to generate
            </span>
            <span
              className={bem.element("spaceBarWrapper", "mobileHint")}
              onClick={() => regenerate()}
            >
              Tap to generate
            </span>
          </div>
        </Tooltip>
      </div>
      <div className={bem.element("right")}>
        <div className={bem.element("historyButtons")}>
          <Tooltip text="Undo" shortcut={isMac ? "⌘ + z" : "Ctrl+Z"}>
            <button
              className={bem.element("button")}
              onClick={() => undo()}
              disabled={!canUndo}
              title={"Undo"}
            >
              <Undo2Icon />
            </button>
          </Tooltip>
          <Tooltip text="Redo" shortcut={isMac ? "⌘ + shift + z" : "Ctrl+Y"}>
            <button
              className={bem.element("button")}
              onClick={() => redo()}
              disabled={!canRedo}
              title={"Redo"}
            >
              <Redo2Icon />
            </button>
          </Tooltip>
        </div>
        <div className={bem.element("divider")} />
        <div className={bem.element("actionButtons")}>
          <Tooltip text="Upload Image">
            <button
              onClick={() => toggle(SidebarPanel.EXTRACT)}
              className={`${styles.iconBtn} ${isOpen(SidebarPanel.EXTRACT) ? styles.active : ""} ${bem.element("button")}`}
            >
              <ImagePlusIcon />
            </button>
          </Tooltip>
          <Tooltip text="Edit color schemes">
            <button
              onClick={() => toggle(SidebarPanel.METHOD)}
              className={`${styles.iconBtn} ${isOpen(SidebarPanel.METHOD) ? styles.active : ""} ${bem.element("button")}`}
            >
              <PaletteIcon />
            </button>
          </Tooltip>
          <Tooltip text="Check accessibility">
            <button
              onClick={() => toggle(SidebarPanel.ACCESSIBILITY)}
              className={`${styles.iconBtn} ${isOpen(SidebarPanel.ACCESSIBILITY) ? styles.active : ""} ${bem.element("button")}`}
            >
              <EyeIcon />
            </button>
          </Tooltip>
        </div>
      </div>
    </nav>
  );
}
