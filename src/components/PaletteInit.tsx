"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "zustand";
import { usePaletteStore, slugFromBlocks } from "@/store/paletteStore";

export default function PaletteInit() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.id as string | undefined;

  const regenerate = usePaletteStore((s) => s.regenerate);
  const hydrateFromSlug = usePaletteStore((s) => s.hydrateFromSlug);
  const blocks = usePaletteStore((s) => s.blocks);
  const { undo, redo } = useStore(usePaletteStore.temporal);

  useEffect(() => {
    if (slug) {
      const currentSlug = slugFromBlocks(usePaletteStore.getState().blocks);
      if (currentSlug !== slug) {
        hydrateFromSlug(slug);
      }
    } else {
      regenerate();
    }
    usePaletteStore.temporal.getState().clear();
  }, []);

  // push slug to URL whenever blocks change
  useEffect(() => {
    if (blocks.length === 0) return;
    const newSlug = slugFromBlocks(blocks);
    const currentSlug = window.location.pathname.replace("/", "");
    if (newSlug !== currentSlug) {
      router.replace(`/${newSlug}`);
    }
  }, [blocks]);

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
