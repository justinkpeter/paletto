"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";
import { usePalette } from "@/hooks/usePalette";
import styles from "./Home.module.scss";
import ColorBlock from "@/components/shared/Hero/ColorBlock";
import HistorySidebar from "@/components/shared/Navbar/HistorySidebar";

export default function Home() {
  const { blocks, setBlocks } = usePalette();

  return null;
}
