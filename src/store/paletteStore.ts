import { create } from "zustand";
import { temporal } from "zundo";
import { generatePalette } from "@/components/shared/Hero/colorUtils";

export type ColorItem = {
  id: string;
  color: string;
};

export type PaletteStore = {
  blocks: ColorItem[];
  setBlocks: (blocks: ColorItem[]) => void;
  regenerate: () => void;
};

const createBlocks = (): ColorItem[] =>
  generatePalette().map((color, index) => ({
    id: `color-block-${index}`,
    color,
  }));

export const usePaletteStore = create<PaletteStore>()(
  temporal((set) => ({
    blocks: [],
    setBlocks: (blocks) => set({ blocks }),
    regenerate: () => set({ blocks: createBlocks() }),
  })),
);
