"use client";

import { createContext, useContext, useState } from "react";

export enum SidebarPanel {
  EXTRACT = "extract",
  METHOD = "method",
  ACCESSIBILITY = "accessibility",
}

export const SIDEBAR_ORDER: SidebarPanel[] = [
  SidebarPanel.EXTRACT,
  SidebarPanel.METHOD,
  SidebarPanel.ACCESSIBILITY,
];

type SidebarContextType = {
  open: (id: SidebarPanel) => void;
  close: (id: SidebarPanel) => void;
  toggle: (id: SidebarPanel) => void;
  isOpen: (id: SidebarPanel) => boolean;
  orderedOpenSidebars: SidebarPanel[];
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openSidebars, setOpenSidebars] = useState<Set<SidebarPanel>>(
    new Set(),
  );

  const open = (id: SidebarPanel) =>
    setOpenSidebars((prev) => {
      const isMobile = window.matchMedia("(max-width: 1200px)").matches;
      if (isMobile) return new Set([id]);
      return new Set(prev).add(id);
    });

  const close = (id: SidebarPanel) =>
    setOpenSidebars((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const toggle = (id: SidebarPanel) =>
    openSidebars.has(id) ? close(id) : open(id);

  const isOpen = (id: SidebarPanel) => openSidebars.has(id);

  const orderedOpenSidebars = SIDEBAR_ORDER.filter((id) =>
    openSidebars.has(id),
  );

  return (
    <SidebarContext.Provider
      value={{ open, close, toggle, isOpen, orderedOpenSidebars }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
