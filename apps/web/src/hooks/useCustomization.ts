import { useEffect, useState } from "react";
import { settingsService } from "../services/container";

export interface Customization {
  accentColor: string | null;
  backgroundImage: string | null;
  backgroundOpacity: number;
}

const DEFAULT_CUSTOMIZATION: Customization = {
  accentColor: null,
  backgroundImage: null,
  backgroundOpacity: 0.5,
};

/** Applies the accent color to the document root as a CSS custom property override; the background image is rendered separately by the caller. */
export function useCustomization() {
  const [customization, setCustomizationState] = useState<Customization>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    void settingsService.get().then((settings) => {
      setCustomizationState({
        accentColor: settings.accentColor,
        backgroundImage: settings.backgroundImage,
        backgroundOpacity: settings.backgroundOpacity,
      });
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement.style;
    if (customization.accentColor) {
      root.setProperty("--color-primary", customization.accentColor);
      root.setProperty("--color-primary-strong", customization.accentColor);
    } else {
      root.removeProperty("--color-primary");
      root.removeProperty("--color-primary-strong");
    }
  }, [customization.accentColor]);

  async function setCustomization(patch: Partial<Customization>): Promise<void> {
    const updated = await settingsService.setCustomization(patch);
    setCustomizationState({
      accentColor: updated.accentColor,
      backgroundImage: updated.backgroundImage,
      backgroundOpacity: updated.backgroundOpacity,
    });
  }

  return { customization, setCustomization };
}
