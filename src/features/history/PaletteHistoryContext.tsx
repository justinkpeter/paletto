"use client";

import { createContext, useContext, useState } from "react";

interface PaletteHistoryContextType {
  historyOpen: boolean;
  toggleHistory: () => void;
  closeHistory: () => void;
}

const PaletteHistoryContext = createContext<PaletteHistoryContextType>({
  historyOpen: false,
  toggleHistory: () => {},
  closeHistory: () => {},
});

export function PaletteHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <PaletteHistoryContext.Provider
      value={{
        historyOpen,
        toggleHistory: () => setHistoryOpen((p) => !p),
        closeHistory: () => setHistoryOpen(false),
      }}
    >
      {children}
    </PaletteHistoryContext.Provider>
  );
}

export const usePaletteHistory = () => useContext(PaletteHistoryContext);
