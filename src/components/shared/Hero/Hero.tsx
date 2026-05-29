"use client";

import { useExtract } from "@/features/extract/useExtract";
import DropZone from "@/features/extract/DropZone";
import SwatchGrid from "@/features/extract/SwatchGrid";
import ExportBar from "@/features/extract/ExportBar";
import Toast from "@/components/shared/Toast/Toast";
import styles from "./Hero.module.scss";

export default function Hero() {
  const extract = useExtract();

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h1>
            Extract the palette
            <br />
            from any image.
          </h1>
          <p>
            Upload a photo you love and instantly pull the colors out of it.
          </p>
        </div>

        <DropZone
          isDragging={extract.isDragging}
          preview={extract.preview}
          imgRef={extract.imgRef}
          inputRef={extract.inputRef}
          handleImageLoad={extract.handleImageLoad}
          handleDragOver={extract.handleDragOver}
          handleDragLeave={extract.handleDragLeave}
          handleDrop={extract.handleDrop}
          handleChange={extract.handleChange}
          handleReset={extract.handleReset}
          regenerate={extract.regenerate}
        />

        {(extract.isNaming || extract.colors.length > 0) && (
          <SwatchGrid
            colors={extract.colors}
            isNaming={extract.isNaming}
            copiedIndex={extract.copiedIndex}
            onCopy={extract.handleCopy}
            onToggleLock={extract.toggleLock}
            onReorder={extract.reorder}
            onSetColors={extract.setColorsDirectly}
          />
        )}

        {extract.preview && extract.colors.length > 0 && (
          <p className={styles.hint}>
            Press <kbd className={styles.kbd}>Space</kbd> to regenerate
          </p>
        )}
      </div>
      <Toast message={extract.toast} />
      <ExportBar
        colors={extract.colors}
        visible={extract.colors.length > 0 && !extract.isNaming}
        preview={extract.preview}
      />
    </section>
  );
}
