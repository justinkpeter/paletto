"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";
import { usePalette } from "@/hooks/usePalette";
import styles from "./Home.module.scss";
import ColorBlock from "@/components/shared/Hero/ColorBlock";
import MethodSidebar from "@/features/sidebar/MethodSidebar/MethodSidebar";
import AccessibilitySidebar from "@/features/sidebar/AccessibilitySidebar/AccessibilitySidebar";
import { usePaletteStore } from "@/store/paletteStore";
import { VISION_FILTERS } from "@/components/shared/Hero/colorUtils";
import { VisionFilters } from "@/components/shared/Hero/VisionFilters";
import AddBlockDivider from "@/components/shared/Hero/AddBlockDivider";
import SortableBlock from "@/components/shared/Hero/SortableBlock";
import ShadesBlock from "@/components/shared/Hero/ShadesBlock";
import { useState, useRef } from "react";
import ExtractSidebar from "@/features/sidebar/ExtractSidebar/ExtractSidebar";

const REMOVE_DURATION = 350;

export default function Home() {
  const {
    blocks,
    setBlocks,
    addBlock,
    canAdd,
    canRemove,
    removeBlock,
    toggleLock,
    updateBlockColor,
  } = usePalette();
  const visionMode = usePaletteStore((s) => s.visionMode ?? "normal");
  const expandedId = usePaletteStore((s) => s.expandedId);
  const setExpandedId = usePaletteStore((s) => s.setExpandedId);

  const [mountedIds, setMountedIds] = useState<Set<string>>(
    () => new Set(blocks.map((b) => b.id)),
  );
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const handleMount = (id: string) => {
    requestAnimationFrame(() => {
      setMountedIds((prev) => new Set(prev).add(id));
    });
  };

  const handleRemove = (id: string) => {
    if (removingIds.has(id)) return;

    setMountedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setRemovingIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      removeBlock(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      removeTimers.current.delete(id);
    }, REMOVE_DURATION);

    removeTimers.current.set(id, timer);
  };

  return (
    <div className={styles.hero}>
      <VisionFilters />
      <div className={styles.hero__inner}>
        <DragDropProvider
          onDragEnd={(e) => setBlocks(move(blocks, e))}
          modifiers={[RestrictToWindow]}
        >
          <div
            className={styles.hero__colorBlocks}
            style={{ filter: VISION_FILTERS[visionMode] }}
          >
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                index={index}
                mounted={mountedIds.has(block.id)}
                removing={removingIds.has(block.id)}
                onMount={() => handleMount(block.id)}
              >
                {expandedId === block.id ? (
                  <ShadesBlock
                    color={block.color}
                    onCollapse={() => setExpandedId(null)}
                    onSelectShade={(shade) => {
                      updateBlockColor(block.id, shade);
                      setExpandedId(null);
                    }}
                  />
                ) : (
                  <ColorBlock
                    color={block.color}
                    locked={block.locked}
                    visionFilter={VISION_FILTERS[visionMode]}
                    onRemove={
                      canRemove ? () => handleRemove(block.id) : undefined
                    }
                    onToggleLock={() => toggleLock(block.id)}
                    onExpand={() => setExpandedId(block.id)}
                  />
                )}
                {canAdd && index < blocks.length - 1 && (
                  <AddBlockDivider onClick={() => addBlock(index + 1)} />
                )}
              </SortableBlock>
            ))}
          </div>
        </DragDropProvider>
      </div>
      <MethodSidebar />
      <AccessibilitySidebar />
      <ExtractSidebar />
    </div>
  );
}
