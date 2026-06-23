import { useState, useCallback, useEffect } from "react";
import { generatePalette } from "./colorUtils";
import { ColorItem } from "./colorTypes";

const PLACEHOLDER_COLORS = [
  "#000000",
  "#111111",
  "#222222",
  "#333333",
  "#444444",
];

const createBlocks = (): ColorItem[] =>
  generatePalette().map((color, index) => ({
    id: `color-block-${index}`,
    color,
  }));

const placeholderBlocks = (): ColorItem[] =>
  PLACEHOLDER_COLORS.map((color, index) => ({
    id: `color-block-${index}`,
    color,
  }));

export function useColorPalette() {
  const [blocks, setBlocks] = useState<ColorItem[]>(placeholderBlocks);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlocks(createBlocks());
  }, []);

  const regenerate = useCallback(() => {
    setBlocks(createBlocks());
  }, []);

  return { blocks, setBlocks, regenerate };
}
