"use client";

import { useEffect, useCallback } from "react";
import { usePaletteStore } from "@/store/paletteStore";
import { useStore } from "zustand";

export default function PaletteInit() {
  const regenerate = usePaletteStore((s) => s.regenerate);
  const { undo, redo } = useStore(usePaletteStore.temporal);

  useEffect(() => {
    regenerate();
    usePaletteStore.temporal.getState().clear();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        regenerate();
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    },
    [regenerate, undo, redo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
