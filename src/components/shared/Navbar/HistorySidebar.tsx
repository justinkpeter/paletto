"use client";

import { useMemo } from "react";
import {
  ColorItem,
  slugFromBlocks,
  usePaletteStore,
} from "@/store/paletteStore";
import { Clock } from "lucide-react";
import { BemBuilder } from "@/lib/BemBuilder";

import styles from "./HistorySidebar.module.scss";
import Sidebar from "../Sidebar/Sidebar";
import ProgressiveBlur from "@/components/ui/ProgressiveBlur";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";

export default function HistorySidebar() {
  const bem = useMemo(() => new BemBuilder("history", styles), []);

  const { isOpen, toggle } = useSidebar();

  const history = usePaletteStore((s) => s.history);
  const blocks = usePaletteStore((s) => s.blocks);
  const activeSlug = slugFromBlocks(blocks);

  const { pause, resume } = usePaletteStore.temporal.getState();

  const handleRestore = (blocks: ColorItem[]) => {
    pause();
    usePaletteStore.setState({ blocks });
    resume();
  };

  return (
    <Sidebar
      isOpen={isOpen(SidebarPanel.HISTORY)}
      onClose={() => toggle(SidebarPanel.HISTORY)}
      title="History"
      icon={<Clock size={16} />}
    >
      {history.length === 0 ? (
        <p className={bem.element("empty")}>
          Generate a palette to start building history.
        </p>
      ) : (
        <ul className={bem.element("list")}>
          {history.map((blocks, i) => {
            const slug = slugFromBlocks(blocks);
            const isActive = slug === activeSlug;
            return (
              <li key={`${slug}-${i}`}>
                <button
                  className={bem.element("entry", isActive && "active")}
                  onClick={() => {
                    if (isActive) return;
                    handleRestore(blocks);
                  }}
                  disabled={isActive}
                >
                  <div className={bem.element("swatches")}>
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className={bem.element("swatch")}
                        style={{ backgroundColor: block.color }}
                      />
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
          <ProgressiveBlur
            direction="to-bottom"
            blur={12}
            fadeSize="40%"
            className={bem.element("blur")}
          />
        </ul>
      )}
    </Sidebar>
  );
}
