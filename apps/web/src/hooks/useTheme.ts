import type { Theme } from "@wishstar/settings";
import { useEffect, useState } from "react";
import { settingsService } from "../services/container";

/** Resolves "auto" against the OS preference and keeps the document in sync as it changes. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("auto");

  useEffect(() => {
    void settingsService.get().then((settings) => setThemeState(settings.theme));
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved = theme === "auto" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
    };

    apply();
    if (theme !== "auto") {
      return;
    }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  async function setTheme(next: Theme): Promise<void> {
    await settingsService.setTheme(next);
    setThemeState(next);
  }

  return { theme, setTheme };
}
