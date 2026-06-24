import { useStore } from "zustand";
import { usePaletteStore } from "@/store/paletteStore";

export function usePalette() {
  const { blocks, setBlocks, regenerate } = usePaletteStore();
  const { undo, redo, pastStates, futureStates } = useStore(
    usePaletteStore.temporal,
  );

  return {
    blocks,
    setBlocks,
    regenerate,
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
