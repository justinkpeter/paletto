import { useRef, useCallback, useEffect, useState } from "react";
import { getPaletteSync } from "colorthief";
import { usePaletteStore } from "@/store/paletteStore";
import { toast } from "sonner";

export type ColorEntry = {
  id: string;
  hex: string;
  locked: boolean;
};

export type ExtractState = {
  isDragging: boolean;
  preview: string | null;
  colors: ColorEntry[];
  imgRef: React.RefObject<HTMLImageElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (file: File) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  regenerate: () => void;
  toggleLock: (index: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  setColorsDirectly: (colors: ColorEntry[]) => void;
};

export function useExtract(): ExtractState {
  const [isDragging, setIsDragging] = useState(false);
  const [colors, setColors] = useState<ColorEntry[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const extractImgRef = useRef<HTMLImageElement | null>(null);
  const colorsRef = useRef<ColorEntry[]>([]);

  const preview = usePaletteStore((s) => s.activeExtractPreview);
  const setPreview = usePaletteStore((s) => s.setActiveExtractPreview);
  const addExtractEntry = usePaletteStore((s) => s.addExtractEntry);
  const setBlocks = usePaletteStore((s) => s.setBlocks);
  const blocks = usePaletteStore((s) => s.blocks);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const doExtract = useCallback(
    (img: HTMLImageElement, existingColors?: ColorEntry[]) => {
      const toastId = toast.loading("Generating palette…");
      setTimeout(() => {
        try {
          const poolSize = Math.floor(Math.random() * 6) + 8;
          const raw = getPaletteSync(img, { colorCount: poolSize, quality: 1 });
          if (!raw) {
            toast.error("Extraction failed", { id: toastId });
            return;
          }

          const shuffled = [...raw].sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, 6);
          const newHexes = picked.map((c) => c.hex().toUpperCase());

          const base = existingColors?.length
            ? existingColors
            : Array(blocks.length).fill(null);
          const merged: ColorEntry[] = base.map(
            (existing: ColorEntry | null, i) => {
              if (existing?.locked) return existing;
              return {
                id: crypto.randomUUID(),
                hex: newHexes[i] ?? newHexes[0],
                locked: false,
              };
            },
          );

          setColors(merged);

          const currentPreview =
            usePaletteStore.getState().activeExtractPreview;
          if (currentPreview) {
            addExtractEntry({
              id: crypto.randomUUID(),
              preview: currentPreview,
              colors: merged.map((c) => c.hex),
            });
          }

          const currentBlocks = usePaletteStore.getState().blocks;
          setBlocks(
            merged.map((c, i) => {
              const existing = currentBlocks[i];
              if (existing?.locked) return existing;
              return {
                id: existing?.id ?? `color-block-${i}`,
                color: c.hex,
                locked: false,
              };
            }),
          );

          toast.success("Palette ready", { id: toastId });
        } catch (e) {
          console.error("Color extraction failed", e);
          toast.error("Extraction failed", { id: toastId });
        }
      }, 50);
    },
    [addExtractEntry, setBlocks, blocks],
  );

  const loadAndExtract = useCallback(
    (dataUrl: string, existingColors?: ColorEntry[]) => {
      const img = new Image();
      img.onload = () => {
        extractImgRef.current = img;
        doExtract(img, existingColors);
      };
      img.onerror = () => toast.error("Failed to load image");
      img.src = dataUrl;
    },
    [doExtract],
  );

  const regenerate = useCallback(() => {
    const currentPreview = usePaletteStore.getState().activeExtractPreview;
    if (!currentPreview) return;
    if (extractImgRef.current) {
      doExtract(extractImgRef.current, colorsRef.current);
    } else {
      loadAndExtract(currentPreview, colorsRef.current);
    }
  }, [doExtract, loadAndExtract]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image under 5MB");
        return;
      }
      extractImgRef.current = null;
      setColors([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        loadAndExtract(dataUrl);
      };
      reader.onerror = (e) => console.error("FileReader error", e);
      reader.readAsDataURL(file);
    },
    [setPreview, loadAndExtract],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleReset = useCallback(() => {
    extractImgRef.current = null;
    setPreview(null);
    setColors([]);
    if (inputRef.current) inputRef.current.value = "";
  }, [setPreview]);

  const toggleLock = useCallback((index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)),
    );
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setColors((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const setColorsDirectly = useCallback((newColors: ColorEntry[]) => {
    setColors(newColors);
  }, []);

  return {
    isDragging,
    preview,
    colors,
    imgRef,
    inputRef,
    handleFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleChange,
    handleReset,
    regenerate,
    toggleLock,
    reorder,
    setColorsDirectly,
  };
}
