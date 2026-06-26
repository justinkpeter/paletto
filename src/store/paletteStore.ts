import { create } from "zustand";
import { temporal } from "zundo";
import {
  generatePalette,
  ColorScheme,
  Mood,
  VisionMode,
} from "@/components/shared/Hero/colorUtils";

const MIN_BLOCKS = 2;
const MAX_BLOCKS = 8;

export type ColorItem = {
  id: string;
  color: string;
  locked: boolean;
};

export type ColorBlockState = Pick<PaletteStore, "blocks">;

export type PaletteStore = {
  blocks: ColorItem[];
  history: ColorItem[][];
  scheme: ColorScheme;
  visionMode: VisionMode;
  mood: Mood;
  autoScheme: boolean;
  expandedId: string | null;
  setBlocks: (blocks: ColorItem[]) => void;
  setScheme: (scheme: ColorScheme) => void;
  setMood: (mood: Mood) => void;
  setAutoScheme: (auto: boolean) => void;
  setVisionMode: (mode: VisionMode) => void;
  regenerate: () => void;
  hydrateFromSlug: (slug: string) => void;
  addBlock: (insertAt?: number) => void;
  removeBlock: (id: string) => void;
  toggleLock: (id: string) => void;
  setExpandedId: (id: string | null) => void;
};

export const slugFromBlocks = (blocks: ColorItem[]): string =>
  blocks.map((b) => b.color.replace("#", "").toLowerCase()).join("-");

export const blocksFromSlug = (slug: string): ColorItem[] =>
  slug.split("-").map((hex, i) => ({
    id: `color-block-${i}`,
    color: `#${hex}`,
    locked: false,
  }));

const createBlocks = (
  scheme: ColorScheme,
  mood: Mood,
  autoScheme: boolean,
  count: number,
): ColorItem[] =>
  generatePalette(scheme, mood, autoScheme, count).map((color) => ({
    id: crypto.randomUUID(),
    color,
    locked: false,
  }));

export const usePaletteStore = create<PaletteStore>()(
  temporal(
    (set, get) => ({
      blocks: [],
      history: [],
      scheme: "analogous",
      mood: "any",
      autoScheme: true,
      visionMode: "normal",
      expandedId: null,

      setBlocks: (blocks) => set({ blocks }),

      setScheme: (scheme) => set({ scheme, autoScheme: false }),

      setMood: (mood) => set({ mood }),

      setAutoScheme: (autoScheme) => set({ autoScheme }),

      setVisionMode: (mode) => set({ visionMode: mode }),

      setExpandedId: (id) => set({ expandedId: id }),

      regenerate: () => {
        set((state) => {
          const { scheme, mood, autoScheme } = get();
          const newBlocks = state.blocks.map((block) => {
            if (block.locked) return block;
            const [newBlock] = createBlocks(scheme, mood, autoScheme, 1);
            return { ...newBlock, locked: false };
          });
          return {
            blocks: newBlocks,
            history: [newBlocks, ...state.history],
          };
        });
      },

      hydrateFromSlug: (slug) => {
        const blocks = blocksFromSlug(slug);
        set((state) => ({
          blocks,
          history: [blocks, ...state.history],
        }));
      },

      addBlock: (insertAt?: number) => {
        const { blocks, scheme, mood, autoScheme } = get();
        if (blocks.length >= MAX_BLOCKS) return;
        const [newBlock] = createBlocks(scheme, mood, autoScheme, 1);
        const idx = insertAt ?? blocks.length;
        const next = [...blocks.slice(0, idx), newBlock, ...blocks.slice(idx)];
        set((state) => ({ blocks: next, history: [next, ...state.history] }));
      },

      removeBlock: (id) => {
        const { blocks, expandedId } = get();
        if (blocks.length <= MIN_BLOCKS) return;
        const next = blocks.filter((b) => b.id !== id);
        set((state) => ({
          blocks: next,
          history: [next, ...state.history],
          ...(expandedId === id ? { expandedId: null } : {}),
        }));
      },

      toggleLock: (id) => {
        const next = get().blocks.map((b) =>
          b.id === id ? { ...b, locked: !b.locked } : b,
        );
        set({ blocks: next });
      },
    }),
    {
      partialize: (state) => ({ blocks: state.blocks }),
    },
  ),
);
