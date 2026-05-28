import { useState, useRef, useCallback, useEffect } from "react";
import { getPaletteSync } from "colorthief";

export type ColorEntry = {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
  isLoading: boolean;
};

export type ExtractState = {
  isDragging: boolean;
  preview: string | null;
  colors: ColorEntry[];
  isNaming: boolean;
  toast: string | null;
  copiedIndex: number | null;
  imgRef: React.RefObject<HTMLImageElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleImageLoad: () => void;
  handleFile: (file: File) => void;
  handleCopy: (hex: string, index: number) => void;
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
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [isNaming, setIsNaming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [quality, setQuality] = useState(6);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const colorsRef = useRef<ColorEntry[]>([]);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const nameColors = useCallback(
    async (indicesToName: number[], hexes: string[]) => {
      setColors((prev) =>
        prev.map((c, i) =>
          indicesToName.includes(i) ? { ...c, isLoading: true } : c,
        ),
      );
      try {
        const res = await fetch("/api/name-colors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colors: hexes }),
        });
        const data = await res.json();
        setColors((prev) =>
          prev.map((c, i) => {
            const nameIndex = indicesToName.indexOf(i);
            if (nameIndex === -1) return c;
            return {
              ...c,
              name: data.names[nameIndex] ?? "",
              isLoading: false,
            };
          }),
        );
      } catch (e) {
        console.error("Naming failed", e);
        setColors((prev) =>
          prev.map((c, i) =>
            indicesToName.includes(i) ? { ...c, isLoading: false } : c,
          ),
        );
      } finally {
        setIsNaming(false);
      }
    },
    [],
  );

  const extractColors = useCallback(
    (q: number, existingColors?: ColorEntry[]) => {
      const img = imgRef.current;
      if (!img) return;
      try {
        const raw = getPaletteSync(img, { colorCount: 6, quality: q });
        if (!raw) return;
        const newHexes = raw.map((c) => c.hex().toUpperCase());
        const indicesToName: number[] = [];
        const hexesToName: string[] = [];
        const merged: ColorEntry[] = (
          existingColors ?? Array(6).fill(null)
        ).map((existing: ColorEntry | null, i) => {
          if (existing?.locked) return existing;
          const hex = newHexes[i] ?? newHexes[0];
          indicesToName.push(i);
          hexesToName.push(hex);
          return {
            id: crypto.randomUUID(),
            hex,
            name: "",
            locked: false,
            isLoading: true,
          };
        });
        setIsNaming(true);
        setColors(merged);
        nameColors(indicesToName, hexesToName);
      } catch (e) {
        console.error("Color extraction failed", e);
      }
    },
    [nameColors],
  );

  const handleImageLoad = useCallback(() => {
    extractColors(quality);
  }, [extractColors, quality]);

  const regenerate = useCallback(() => {
    if (!previewRef.current) return;
    const newQuality = Math.floor(Math.random() * 10) + 1;
    setQuality(newQuality);
    extractColors(newQuality, colorsRef.current);
    showToast("New palette generated");
  }, [extractColors, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        regenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [regenerate]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setColors([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
    };
    reader.onerror = (e) => console.error("FileReader error", e);
    reader.readAsDataURL(file);
  }, []);

  const handleCopy = useCallback(
    (hex: string, index: number) => {
      navigator.clipboard.writeText(hex);
      setCopiedIndex(index);
      showToast(`${hex} copied`);
      setTimeout(() => setCopiedIndex(null), 1500);
    },
    [showToast],
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
    setPreview(null);
    setColors([]);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

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
    isNaming,
    toast,
    copiedIndex,
    imgRef,
    inputRef,
    handleImageLoad,
    handleFile,
    handleCopy,
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
