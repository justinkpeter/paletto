import { create } from "zustand";
import { temporal } from "zundo";
import {
  generatePalette,
  baseHueFromExtracted,
  ColorScheme,
  Mood,
  VisionMode,
} from "@/features/palette/colorUtils";

const MIN_BLOCKS = 2;
const MAX_BLOCKS = 8;

export type ColorItem = {
  id: string;
  color: string;
  locked: boolean;
};

export type ExtractEntry = {
  id: string;
  preview: string;
  colors: string[]; // final block colors — what swatches display
  rawHexes: string[]; // original pixel samples — what restore anchors to
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
  regenerate: (overrides?: {
    scheme?: ColorScheme;
    mood?: Mood;
    autoScheme?: boolean;
    extractedHexes?: string[];
  }) => void;
  hydrateFromSlug: (slug: string) => void;
  addBlock: (insertAt?: number) => void;
  removeBlock: (id: string) => void;
  toggleLock: (id: string) => void;
  setExpandedId: (id: string | null) => void;
  updateBlockColor: (id: string, color: string) => void;
  extractHistory: ExtractEntry[];
  addExtractEntry: (entry: ExtractEntry) => void;
  activeExtractPreview: string | null;
  setActiveExtractPreview: (url: string | null) => void;
  activeExtractedHexes: string[] | null;
  setActiveExtractedHexes: (hexes: string[] | null) => void;
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
  baseHue?: number,
): ColorItem[] =>
  generatePalette(scheme, mood, autoScheme, count, baseHue).map((color) => ({
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
      activeExtractPreview: null,
      activeExtractedHexes: null,

      setBlocks: (blocks) => set({ blocks }),

      setScheme: (scheme) => set({ scheme, autoScheme: false }),

      setMood: (mood) => set({ mood }),

      setAutoScheme: (autoScheme) => set({ autoScheme }),

      setVisionMode: (mode) => set({ visionMode: mode }),

      setExpandedId: (id) => set({ expandedId: id }),

      setActiveExtractPreview: (url) => set({ activeExtractPreview: url }),

      setActiveExtractedHexes: (hexes) => set({ activeExtractedHexes: hexes }),

      regenerate: (overrides?) => {
        set((state) => {
          const current = get();
          const hexes =
            overrides?.extractedHexes ??
            current.activeExtractedHexes ??
            undefined;

          const schemes: ColorScheme[] = [
            "analogous",
            "complementary",
            "triadic",
            "split-complementary",
            "monochromatic",
            "tetradic",
          ];

          const autoScheme = overrides?.autoScheme ?? current.autoScheme;
          const scheme =
            overrides?.scheme ??
            (autoScheme && hexes
              ? schemes[Math.floor(Math.random() * schemes.length)]
              : current.scheme);
          const resolvedAuto = autoScheme && !hexes;
          const mood = overrides?.mood ?? current.mood;
          const baseHue = hexes?.length
            ? baseHueFromExtracted(hexes)
            : undefined;

          const unlockedCount = state.blocks.filter((b) => !b.locked).length;
          const newColors = generatePalette(
            scheme,
            mood,
            resolvedAuto,
            unlockedCount,
            baseHue,
          );

          let colorIndex = 0;
          const newBlocks = state.blocks.map((block) => {
            if (block.locked) return block;
            return { ...block, color: newColors[colorIndex++] };
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

      updateBlockColor: (id, color) => {
        const next = get().blocks.map((b) =>
          b.id === id ? { ...b, color } : b,
        );
        set({ blocks: next, history: [next, ...get().history] });
      },

      extractHistory: [],
      addExtractEntry: (entry) =>
        set((s) => ({
          extractHistory: [entry, ...s.extractHistory].slice(0, 5),
        })),
    }),

    {
      partialize: (state) => ({ blocks: state.blocks }),
    },
  ),
);
