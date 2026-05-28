"use client";

import { useEffect } from "react";
import { AVATAR_CHANGED_EVENT, persistAvatarPreference } from "@/lib/avatar-preference";
import { applyAccentPalette, resolveProfileIcon } from "@/lib/profile-icons";
import { authClient } from "@/lib/auth-client";

export default function AccentPreferenceSync() {
  useEffect(() => {
    const applyFromStorage = (avatarId?: string | null, avatarUrl?: string | null) => {
      const nextAvatarId = avatarId || localStorage.getItem("avatarId");
      const nextAvatarUrl = avatarUrl || localStorage.getItem("avatar");
      const icon = resolveProfileIcon({ id: nextAvatarId, url: nextAvatarUrl });
      applyAccentPalette(icon);
    };

    

    applyFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (["avatar", "avatarId"].includes(event.key || "")) {
        applyFromStorage(
          event.key === "avatarId" ? event.newValue : undefined,
          event.key === "avatar" ? event.newValue : undefined,
        );
      }
    };

    const handleAvatarChanged = () => {
      applyFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AVATAR_CHANGED_EVENT, handleAvatarChanged as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AVATAR_CHANGED_EVENT, handleAvatarChanged as EventListener);
    };
  }, []);

  return null;
}
