"use client";

import { useEffect } from "react";
import { DEFAULT_SITE_BACKGROUND, toCssImageValue } from "@/lib/background-utils";

export default function BackgroundPreferenceSync() {
  useEffect(() => {
    const applyBackground = (backgroundValue?: string | null) => {
      const source =
        backgroundValue ||
        localStorage.getItem("profileBackground") ||
        localStorage.getItem("background") ||
        localStorage.getItem("wallpaper") ||
        localStorage.getItem("customBackground") ||
        DEFAULT_SITE_BACKGROUND;

      document.documentElement.style.setProperty("--site-bg-image", toCssImageValue(source, DEFAULT_SITE_BACKGROUND));
    };

    applyBackground();

    const handleStorage = (event: StorageEvent) => {
      if (["profileBackground", "background", "wallpaper", "customBackground"].includes(event.key || "")) {
        applyBackground(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
