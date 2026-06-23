"use client";

import { useCallback, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";

import ColorBlock from "./ColorBlock";
import styles from "./NewHero.module.scss";
import { useColorPalette } from "./useColorPalette";

export default function NewHero() {
  const { blocks, setBlocks, regenerate } = useColorPalette();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        regenerate();
      }
    },
    [regenerate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.hero}>
      <DragDropProvider
        onDragEnd={(event) => {
          setBlocks((blocks) => move(blocks, event));
        }}
        modifiers={[RestrictToWindow]}
      >
        <div className={styles.hero__colorBlocks}>
          {blocks.map((block, index) => (
            <ColorBlock
              key={block.id}
              id={block.id}
              index={index}
              color={block.color}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
