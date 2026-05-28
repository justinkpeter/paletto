"use client";

import { UploadIcon } from "@/components/ui/Icon";
import styles from "./DropZone.module.scss";
import type { ExtractState } from "./useExtract";

type Props = Pick<
  ExtractState,
  | "isDragging"
  | "preview"
  | "imgRef"
  | "inputRef"
  | "handleImageLoad"
  | "handleDragOver"
  | "handleDragLeave"
  | "handleDrop"
  | "handleChange"
  | "handleReset"
  | "regenerate"
>;

export default function DropZone({
  isDragging,
  preview,
  imgRef,
  inputRef,
  handleImageLoad,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleChange,
  handleReset,
  regenerate,
}: Props) {
  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${preview ? styles.hasPreview : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!preview ? (
        <label className={styles.uploadLabel} htmlFor="file-upload">
          <input
            ref={inputRef}
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className={styles.inputHidden}
          />
          <UploadIcon />
          <span className={styles.promptText}>Drop an image here</span>
          <span className={styles.promptSub}>or tap to browse</span>
        </label>
      ) : (
        <div className={styles.previewWrapper}>
          <img
            ref={imgRef}
            src={preview}
            alt="Uploaded"
            className={styles.previewImage}
            onLoad={handleImageLoad}
          />
          <button
            className={styles.resetBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
          >
            ✕ Remove
          </button>
          <button
            className={styles.regenerateBtn}
            onClick={(e) => {
              e.stopPropagation();
              regenerate();
            }}
            title="Regenerate palette (Space)"
          >
            ↻ Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
