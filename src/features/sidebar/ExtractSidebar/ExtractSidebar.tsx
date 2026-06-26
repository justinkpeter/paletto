"use client";

import { useMemo, useEffect } from "react";
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

  // Sync extracted colors into palette store
  useEffect(() => {
    if (colors.length === 0) return;
    const ready = colors.every((c) => !c.isLoading);
    if (!ready) return;
    setBlocks(
      colors.map((c, i) => ({
        id: `color-block-${i}`,
        color: c.hex,
      })),
    );
  }, [colors, setBlocks]);

  return (
    <Sidebar
      isOpen={isOpen(SidebarPanel.EXTRACT)}
      onClose={() => toggle(SidebarPanel.EXTRACT)}
      title="Extract"
      icon={<ImagePlusIcon size={16} />}
    >
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
            aria-label="Upload image to extract colors"
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <UploadIcon size={20} className={bem.element("upload-icon")} />
            <span className={bem.element("dropzone-primary")}>
              Drop an image or click to upload
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

      {colors.length > 0 && (
        <div className={bem.element("section")}>
          <p className={bem.element("label")}>EXTRACTED</p>
          <div className={bem.element("swatches")}>
            {colors.map((c, i) => (
              <div key={c.id} className={bem.element("swatch")}>
                <div
                  className={bem.element("swatch-color")}
                  style={{ background: c.hex }}
                />
                <div className={bem.element("swatch-info")}>
                  {c.isLoading ? (
                    <span className={bem.element("swatch-loading")}>…</span>
                  ) : (
                    <span className={bem.element("swatch-name")}>{c.name}</span>
                  )}
                  <span className={bem.element("swatch-hex")}>{c.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className={bem.element("section")}>
          <p className={bem.element("label")}>ACTIONS</p>
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
    </Sidebar>
  );
}
