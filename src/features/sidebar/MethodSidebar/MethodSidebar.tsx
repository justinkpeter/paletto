"use client";

import { useMemo } from "react";
import { Palette } from "lucide-react";
import { BemBuilder } from "@/lib/BemBuilder";
import { usePaletteStore } from "@/store/paletteStore";
import {
  ColorScheme,
  Mood,
  MOOD_OPTIONS,
  SCHEME_OPTIONS,
} from "@/features/palette/colorUtils";
import { SidebarPanel, useSidebar } from "@/features/sidebar/SidebarContext";
import styles from "./MethodSidebar.module.scss";
import Sidebar from "@/components/shared/Sidebar/Sidebar";
import OptionGroup from "@/components/ui/input/OptionGroup";

export default function MethodSidebar() {
  const bem = useMemo(() => new BemBuilder("method", styles), []);
  const { isOpen, toggle } = useSidebar();

  const scheme = usePaletteStore((s) => s.scheme);
  const mood = usePaletteStore((s) => s.mood);
  const autoScheme = usePaletteStore((s) => s.autoScheme);
  const setScheme = usePaletteStore((s) => s.setScheme);
  const setMood = usePaletteStore((s) => s.setMood);
  const setAutoScheme = usePaletteStore((s) => s.setAutoScheme);
  const regenerate = usePaletteStore((s) => s.regenerate);

  const activeSchemeValue = autoScheme ? "auto" : scheme;

  const handleMoodChange = (value: Mood) => {
    setMood(value);
    const { activeExtractedHexes } = usePaletteStore.getState();
    regenerate({
      mood: value,
      ...(activeExtractedHexes ? { extractedHexes: activeExtractedHexes } : {}),
    });
  };

  const handleSchemeClick = (value: ColorScheme | "auto") => {
    if (value === "auto") {
      setAutoScheme(true);
      const { activeExtractedHexes } = usePaletteStore.getState();
      regenerate({
        autoScheme: true,
        ...(activeExtractedHexes
          ? { extractedHexes: activeExtractedHexes }
          : {}),
      });
    } else {
      setAutoScheme(false);
      setScheme(value);
      const { activeExtractedHexes } = usePaletteStore.getState();
      regenerate({
        scheme: value,
        autoScheme: false,
        ...(activeExtractedHexes
          ? { extractedHexes: activeExtractedHexes }
          : {}),
      });
    }
  };

  return (
    <Sidebar
      isOpen={isOpen(SidebarPanel.METHOD)}
      onClose={() => toggle(SidebarPanel.METHOD)}
      title="Method"
      icon={<Palette size={16} />}
    >
      <div className={bem.element("section")}>
        <OptionGroup
          label="HARMONY"
          variant="list"
          options={SCHEME_OPTIONS}
          value={activeSchemeValue}
          onChange={handleSchemeClick}
        />
      </div>

      <div className={bem.element("section")}>
        <OptionGroup
          label="MOOD"
          variant="pills"
          options={MOOD_OPTIONS}
          value={mood}
          onChange={handleMoodChange}
        />
      </div>
    </Sidebar>
  );
}
