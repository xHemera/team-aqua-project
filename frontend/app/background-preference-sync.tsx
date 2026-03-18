"use client";

import { useEffect } from "react";
import { DEFAULT_SITE_BACKGROUND, toCssImageValue } from "@/lib/background-utils";

export default function BackgroundPreferenceSync() {
  useEffect(() => {
    const getStoredBackground = () => {
      return (
        localStorage.getItem("profileBackground") ||
        localStorage.getItem("background") ||
        localStorage.getItem("wallpaper") ||
        localStorage.getItem("customBackground")
      );
    };

    const applyBackground = (backgroundValue?: string | null) => {
      const source =
        backgroundValue ||
        getStoredBackground() ||
        DEFAULT_SITE_BACKGROUND;

      document.documentElement.style.setProperty("--site-bg-image", toCssImageValue(source, DEFAULT_SITE_BACKGROUND));
    };

    applyBackground();

    const hydrateFromProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) return;

        const data = await response.json();
        if (!data?.profileBackground) return;

        localStorage.setItem("profileBackground", data.profileBackground);
        applyBackground(data.profileBackground);
      } catch {
        // ignore and keep local/default background
      }
    };

    void hydrateFromProfile();

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
