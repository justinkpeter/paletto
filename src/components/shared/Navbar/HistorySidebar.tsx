"use client";

import { useMemo } from "react";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import { usePaletteStore, type PaletteStore } from "@/store/paletteStore";
import { usePaletteHistory } from "@/features/history/PaletteHistoryContext";
import { Clock } from "lucide-react";
import { BemBuilder } from "@/lib/BemBuilder";

import styles from "./HistorySidebar.module.scss";
import Sidebar from "../Sidebar/Sidebar";

function useTemporalStore<T>(
  selector: (state: TemporalState<PaletteStore>) => T,
): T {
  return useStore(usePaletteStore.temporal, selector);
}

export default function HistorySidebar() {
  const bem = useMemo(() => new BemBuilder("history", styles), []);

  const { historyOpen, closeHistory } = usePaletteHistory();

  const pastStates = useTemporalStore((s) => s.pastStates);
  const undo = useTemporalStore((s) => s.undo);
  const clear = useTemporalStore((s) => s.clear);
  const currentBlocks = usePaletteStore((s) => s.blocks);

  const allEntries = [
    currentBlocks,
    ...[...pastStates].reverse().map((s) => s.blocks),
  ];

  const footer =
    pastStates.length > 0 ? (
      <button className={bem.element("clear-btn")} onClick={clear}>
        Clear history
      </button>
    ) : null;

  return (
    <Sidebar
      isOpen={historyOpen}
      onClose={closeHistory}
      title="History"
      icon={<Clock size={16} />}
      footer={footer}
    >
      {allEntries.length === 0 ? (
        <p className={bem.element("empty")}>
          Generate a palette to start building history.
        </p>
      ) : (
        <ul className={bem.element("list")}>
          {allEntries.map((blocks, index) => {
            const isActive = index === 0;
            return (
              <li key={index}>
                <button
                  className={bem.element("entry", isActive && "active")}
                  onClick={() => !isActive && undo(index)}
                  disabled={isActive}
                >
                  <div className={bem.element("swatches")}>
                    {blocks?.map((block) => (
                      <div
                        key={block.id}
                        className={bem.element("swatch")}
                        style={{ backgroundColor: `${block.color}` }}
                      />
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sidebar>
  );
}
