"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";
import { usePalette } from "@/hooks/usePalette";
import styles from "./Home.module.scss";
import ColorBlock from "@/components/shared/Hero/ColorBlock";
import { usePaletteStore } from "@/store/paletteStore";
import { VISION_FILTERS } from "@/components/shared/Hero/colorUtils";
import { VisionFilters } from "@/components/shared/Hero/VisionFilters";
import AddBlockDivider from "@/components/shared/Hero/AddBlockDivider";
import SortableBlock from "@/components/shared/Hero/SortableBlock";
import ShadesBlock from "@/components/shared/Hero/ShadesBlock";
import SidebarMap from "@/features/sidebar/SidebarMap";
import { useRemoveBlock } from "@/components/shared/Hero/useRemoveBlock";
import ExportBar from "@/features/extract/ExportBar";

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

  const { mountedIds, removingIds, handleMount, handleRemove } =
    useRemoveBlock(removeBlock);

  const visionFilter = VISION_FILTERS[visionMode];
  return (
    <div className={styles.hero}>
      <div className={styles.hero__inner}>
        <DragDropProvider
          onDragEnd={(e) => setBlocks(move(blocks, e))}
          modifiers={[RestrictToWindow]}
        >
          <div className={styles.hero__colorBlocks}>
            <VisionFilters />
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
                    visionFilter={visionFilter}
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
      <SidebarMap />
      <ExportBar />
    </div>
  );
}
