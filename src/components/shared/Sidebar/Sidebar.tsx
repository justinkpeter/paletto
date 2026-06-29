"use client";

import type { ReactNode } from "react";
import { BemBuilder } from "@/lib/BemBuilder";
import styles from "./Sidebar.module.scss";
import { XIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

const bem = new BemBuilder("sidebar", styles);

export default function Sidebar({
  isOpen,
  onClose,
  title,
  icon,
  footer,
  children,
}: SidebarProps) {
  return (
    <aside className={bem.block(isOpen && "open")}>
      <div className={bem.element("inner")}>
        <div className={bem.element("header")}>
          <div className={bem.element("header-left")}>
            {icon}
            <span className={bem.element("title")}>{title}</span>
          </div>
          <button
            className={bem.element("close-btn")}
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className={bem.element("content")}>{children}</div>

        {footer && <div className={bem.element("footer")}>{footer}</div>}
      </div>
    </aside>
  );
}
