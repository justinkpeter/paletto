"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStore } from "zustand";
import { usePaletteStore, slugFromBlocks } from "@/store/paletteStore";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";

export default function PaletteInit() {
  const params = useParams();
  const slug = params?.id as string | undefined;

  const regenerate = usePaletteStore((s) => s.regenerate);
  const hydrateFromSlug = usePaletteStore((s) => s.hydrateFromSlug);
  const blocks = usePaletteStore((s) => s.blocks);
  const { undo, redo } = useStore(usePaletteStore.temporal);
  const { isOpen, resample } = useSidebar();

  useEffect(() => {
    if (slug) {
      const currentSlug = slugFromBlocks(usePaletteStore.getState().blocks);
      if (currentSlug !== slug) {
        hydrateFromSlug(slug);
      }
    }
    usePaletteStore.temporal.getState().clear();
  }, []);

  // push slug to URL whenever blocks change
  useEffect(() => {
    if (blocks.length === 0) return;
    const newSlug = slugFromBlocks(blocks);
    const currentSlug = window.location.pathname.replace("/", "");
    if (newSlug !== currentSlug) {
      window.history.replaceState(null, "", `/${newSlug}`);
    }
  }, [blocks]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isOpen(SidebarPanel.EXTRACT)) {
          resample();
        } else {
          const { activeExtractedHexes } = usePaletteStore.getState();
          regenerate(
            activeExtractedHexes
              ? { extractedHexes: activeExtractedHexes }
              : undefined,
          );
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    },
    [regenerate, undo, redo, isOpen, resample],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
