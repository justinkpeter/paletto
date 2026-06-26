"use client";

import { useMemo } from "react";
import { ImagePlusIcon, UploadIcon, XIcon, RefreshCwIcon } from "lucide-react";
import { BemBuilder } from "@/lib/BemBuilder";
import { usePaletteStore } from "@/store/paletteStore";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";
import styles from "./ExtractSidebar.module.scss";
import Sidebar from "@/components/shared/Sidebar/Sidebar";
import { useExtract } from "@/features/extract/useExtract";

export default function ExtractSidebar() {
  const bem = useMemo(() => new BemBuilder("extract", styles), []);
  const { isOpen, toggle } = useSidebar();
  const setBlocks = usePaletteStore((s) => s.setBlocks);
  const extractHistory = usePaletteStore((s) => s.extractHistory);
  const blocks = usePaletteStore((s) => s.blocks);

  const {
    isDragging,
    preview,
    colors,
    isNaming,
    imgRef,
    inputRef,
    handleImageLoad,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleChange,
    handleReset,
    regenerate,
  } = useExtract();

  const handleRestoreEntry = (hexes: string[]) => {
    setBlocks(
      hexes.map((hex, i) => ({
        id: `color-block-${i}`,
        color: hex,
        locked: false,
      })),
    );
  };

  const isActiveEntry = (entryColors: string[]) =>
    entryColors.length === blocks.length &&
    entryColors.every(
      (hex, i) => hex.toLowerCase() === blocks[i]?.color.toLowerCase(),
    );

  return (
    <Sidebar
      isOpen={isOpen(SidebarPanel.EXTRACT)}
      onClose={() => toggle(SidebarPanel.EXTRACT)}
      title="Extract"
      icon={<ImagePlusIcon size={16} />}
    >
      {/* Upload / current image */}
      <div className={bem.element("section")}>
        <p className={bem.element("label")}>IMAGE</p>
        {preview ? (
          <div className={bem.element("preview")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={preview}
              alt="Uploaded image"
              className={bem.element("thumbnail")}
              onLoad={handleImageLoad}
            />
            <button
              className={bem.element("clear-btn")}
              onClick={handleReset}
              aria-label="Remove image"
            >
              <XIcon size={12} />
            </button>
            {isNaming && (
              <div className={bem.element("extracting")}>Extracting…</div>
            )}
          </div>
        ) : (
          <div
            className={bem.element("dropzone", isDragging && "dragging")}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <UploadIcon size={20} className={bem.element("upload-icon")} />
            <span className={bem.element("dropzone-primary")}>
              Drop or click to upload
            </span>
            <span className={bem.element("dropzone-secondary")}>
              PNG, JPG, WEBP · Max 5MB
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </div>

      {/* Actions for current image */}
      {preview && (
        <div className={bem.element("section")}>
          <button
            className={bem.element("action-btn")}
            onClick={regenerate}
            disabled={isNaming}
          >
            <RefreshCwIcon size={14} />
            Regenerate palette
          </button>
          <button
            className={bem.element("action-btn", "secondary")}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon size={14} />
            Upload new image
          </button>
        </div>
      )}

      {/* Extract history */}
      {extractHistory.length > 0 && (
        <div className={bem.element("section")}>
          <p className={bem.element("label")}>RECENT</p>
          <div className={bem.element("history")}>
            {extractHistory.map((entry) => (
              <button
                key={entry.id}
                className={bem.element(
                  "entry",
                  isActiveEntry(entry.colors) && "active",
                )}
                onClick={() => handleRestoreEntry(entry.colors)}
              >
                <div className={bem.element("entry-thumb")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.preview} alt="" />
                </div>
                <div className={bem.element("entry-swatches")}>
                  {entry.colors.map((hex) => (
                    <div
                      key={hex}
                      className={bem.element("entry-swatch")}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Sidebar>
  );
}
