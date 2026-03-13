"use client";

import { useEffect } from "react";
import { applyAccentPalette, resolveProfileIcon } from "@/lib/profile-icons";

export default function AccentPreferenceSync() {
  useEffect(() => {
    const applyFromStorage = (avatarId?: string | null, avatarUrl?: string | null) => {
      const nextAvatarId = avatarId || localStorage.getItem("avatarId");
      const nextAvatarUrl = avatarUrl || localStorage.getItem("avatar");
      const icon = resolveProfileIcon({ id: nextAvatarId, url: nextAvatarUrl });
      applyAccentPalette(icon);
    };

    const hydrateFromProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          avatarId?: string | null;
          image?: string | null;
          avatar?: { id?: string | null; url?: string | null };
        };

        const id = payload.avatar?.id ?? payload.avatarId;
        const url = payload.avatar?.url ?? payload.image;

        if (id) localStorage.setItem("avatarId", id);
        if (url) localStorage.setItem("avatar", url);
        applyFromStorage(id, url);
      } catch {
        applyFromStorage();
      }
    };

    applyFromStorage();
    hydrateFromProfile();

    const handleStorage = (event: StorageEvent) => {
      if (["avatar", "avatarId"].includes(event.key || "")) {
        applyFromStorage(
          event.key === "avatarId" ? event.newValue : undefined,
          event.key === "avatar" ? event.newValue : undefined,
        );
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
