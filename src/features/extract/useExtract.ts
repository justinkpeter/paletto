import { useRef, useCallback, useState } from "react";
import { getPaletteSync } from "colorthief";
import { usePaletteStore } from "@/store/paletteStore";
import { toast } from "sonner";

export type ExtractState = {
  isDragging: boolean;
  preview: string | null;
  imgRef: React.RefObject<HTMLImageElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (file: File) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  resample: () => void;
};

export function useExtract(): ExtractState {
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const extractImgRef = useRef<HTMLImageElement | null>(null);

  const preview = usePaletteStore((s) => s.activeExtractPreview);
  const setPreview = usePaletteStore((s) => s.setActiveExtractPreview);
  const addExtractEntry = usePaletteStore((s) => s.addExtractEntry);
  const regenerateStore = usePaletteStore((s) => s.regenerate);
  const setActiveExtractedHexes = usePaletteStore(
    (s) => s.setActiveExtractedHexes,
  );

  const doExtract = useCallback(
    (img: HTMLImageElement) => {
      const toastId = toast.loading("Generating palette…");
      setTimeout(() => {
        try {
          const { blocks, autoScheme, scheme } = usePaletteStore.getState();
          const count = blocks.filter((b) => !b.locked).length;

          // Sample a large pool so resampling produces genuine variety
          const raw = getPaletteSync(img, { colorCount: 256, quality: 1 });
          if (!raw) {
            toast.error("Extraction failed", { id: toastId });
            return;
          }

          const hexes = [...raw]
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map((c) => c.hex().toUpperCase());

          // Store raw pixel samples as the hue anchor
          setActiveExtractedHexes(hexes);

          if (autoScheme) {
            // No scheme selected — place raw extracted colors directly into
            // blocks so the palette is faithful to the image
            const currentBlocks = usePaletteStore.getState().blocks;
            const newBlocks = currentBlocks.map((block, i) => {
              if (block.locked) return block;
              return { ...block, color: hexes[i] ?? hexes[0] };
            });
            usePaletteStore.getState().setBlocks(newBlocks);
          } else {
            // User has a scheme selected — apply it anchored to image hues
            regenerateStore({
              extractedHexes: hexes,
              scheme,
              autoScheme: false,
            });
          }

          // Save to history using final block colors so swatches match
          // what the user actually sees in the palette
          const currentPreview =
            usePaletteStore.getState().activeExtractPreview;
          const finalBlocks = usePaletteStore.getState().blocks;
          if (currentPreview) {
            addExtractEntry({
              id: crypto.randomUUID(),
              preview: currentPreview,
              rawHexes: hexes,
              colors: finalBlocks.map((b) => b.color),
            });
          }

          toast.success("Palette ready", { id: toastId });
        } catch (e) {
          console.error("Color extraction failed", e);
          toast.error("Extraction failed", { id: toastId });
        }
      }, 50);
    },
    [addExtractEntry, regenerateStore, setActiveExtractedHexes],
  );

  const loadAndExtract = useCallback(
    (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        extractImgRef.current = img;
        doExtract(img);
      };
      img.onerror = () => toast.error("Failed to load image");
      img.src = dataUrl;
    },
    [doExtract],
  );

  // Re-runs colorthief on the source image for a fresh pixel sample,
  // then applies current scheme/mood. Spacebar triggers this when
  // the Extract panel is open.
  const resample = useCallback(() => {
    const currentPreview = usePaletteStore.getState().activeExtractPreview;
    if (!currentPreview) return;
    if (extractImgRef.current) {
      doExtract(extractImgRef.current);
    } else {
      loadAndExtract(currentPreview);
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
    setActiveExtractedHexes(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [setPreview, setActiveExtractedHexes]);

  return {
    isDragging,
    preview,
    imgRef,
    inputRef,
    handleFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleChange,
    handleReset,
    resample,
  };
}
