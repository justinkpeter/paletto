import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>()(
  persist((set) => ({ theme: "system", setTheme: (theme) => set({ theme }) }), {
    name: "paletto-theme",
  }),
);

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const apply = () => {
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;
      document.documentElement.setAttribute("data-theme", resolved);
    };

    apply();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return { theme, setTheme };
}
