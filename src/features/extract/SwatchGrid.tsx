"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useCallback } from "react";
import Swatch from "./Swatch";
import styles from "./SwatchGrid.module.scss";
import type { ColorEntry } from "./useExtract";

type Props = {
  colors: ColorEntry[];
  isNaming: boolean;
  copiedIndex: number | null;
  onCopy: (hex: string, index: number) => void;
  onToggleLock: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onSetColors: (colors: ColorEntry[]) => void;
};

export default function SwatchGrid({
  colors,
  isNaming,
  copiedIndex,
  onCopy,
  onToggleLock,
  onReorder,
  onSetColors,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
  );

  const displayColors = pendingOrder
    ? (pendingOrder
        .map((id) => colors.find((c) => c.id === id))
        .filter(Boolean) as ColorEntry[])
    : colors;

  const showSkeletons = isNaming && colors.length === 0;
  const showLoading = isNaming && colors.length > 0;
  const showSwatches = !isNaming && colors.length > 0;

  const activeColor = activeId
    ? displayColors.find((c) => c.id === activeId)
    : null;
  const activeIndex = activeId
    ? displayColors.findIndex((c) => c.id === activeId)
    : -1;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setPendingOrder(colors.map((c) => c.id));
  };

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    if (!overId) return;
    setPendingOrder((prev) => {
      if (!prev) return prev;
      const from = prev.indexOf(event.active.id as string);
      const to = prev.indexOf(overId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, event.active.id as string);
      return next;
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const snapshot = pendingOrder;
    setActiveId(null);
    setPendingOrder(null);
    if (!over || !snapshot) return;
    const reordered = snapshot
      .map((id) => colors.find((c) => c.id === id))
      .filter(Boolean) as ColorEntry[];
    onSetColors(reordered);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setPendingOrder(null);
  };

  return (
    <div className={styles.grid}>
      {showSkeletons &&
        Array.from({ length: 6 }).map((_, i) => (
          <Swatch
            key={i}
            hex=""
            name=""
            index={i}
            locked={false}
            isCopied={false}
            isLoading={false}
            isSkeleton
            onClick={() => {}}
            onToggleLock={() => {}}
          />
        ))}

      {showLoading &&
        colors.map((c, i) => (
          <Swatch
            key={c.id}
            hex={c.hex}
            name=""
            index={i}
            locked={c.locked}
            isCopied={false}
            isLoading
            isSkeleton={false}
            onClick={() => {}}
            onToggleLock={() => {}}
          />
        ))}

      {showSwatches && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={displayColors.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {displayColors.map((c, i) => (
              <Swatch
                key={c.id}
                id={c.id}
                hex={c.hex}
                name={c.name}
                index={i}
                locked={c.locked}
                isCopied={copiedIndex === i}
                isLoading={c.isLoading}
                isSkeleton={false}
                isDragging={activeId === c.id}
                onClick={() => onCopy(c.hex, i)}
                onToggleLock={() => onToggleLock(i)}
              />
            ))}
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {activeColor && (
              <Swatch
                hex={activeColor.hex}
                name={activeColor.name}
                index={activeIndex}
                locked={activeColor.locked}
                isCopied={false}
                isLoading={false}
                isSkeleton={false}
                isDragging={false}
                isOverlay
                onClick={() => {}}
                onToggleLock={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
