import { useStore } from "zustand";
import { usePaletteStore } from "@/store/paletteStore";

export function usePalette() {
  const {
    blocks,
    setBlocks,
    regenerate,
    addBlock,
    removeBlock,
    toggleLock,
    updateBlockColor,
  } = usePaletteStore();

  const { undo, redo, pastStates, futureStates } = useStore(
    usePaletteStore.temporal,
  );

  return {
    blocks,
    setBlocks,
    regenerate,
    addBlock,
    removeBlock,
    toggleLock,
    canAdd: blocks.length < 8,
    canRemove: blocks.length > 2,
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    updateBlockColor,
  };
}
