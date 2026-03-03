"use client";

import { useEffect } from "react";

const defaultBackground = "/images/ectoplasme.jpg";

const normalizeBackgroundValue = (value: string) => {
  const rawValue = (value || "").trim();

  if (!rawValue) {
    return defaultBackground;
  }

  const withoutDeclaration = rawValue.replace(/^background(-image)?\s*:\s*/i, "").trim();

  if (withoutDeclaration.startsWith("url(")) {
    const insideUrl = withoutDeclaration.slice(4, -1).trim().replace(/^['"]|['"]$/g, "");
    return insideUrl || defaultBackground;
  }

  return withoutDeclaration;
};

const toCssImageValue = (value: string) => {
  const normalized = normalizeBackgroundValue(value);
  return `url("${normalized.replace(/"/g, '\\"')}")`;
};

export default function BackgroundPreferenceSync() {
  useEffect(() => {
    const applyBackground = (backgroundValue?: string | null) => {
      const source =
        backgroundValue ||
        localStorage.getItem("profileBackground") ||
        localStorage.getItem("background") ||
        localStorage.getItem("wallpaper") ||
        localStorage.getItem("customBackground") ||
        defaultBackground;

      document.documentElement.style.setProperty("--site-bg-image", toCssImageValue(source));
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
