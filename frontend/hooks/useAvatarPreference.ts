"use client";

import { useEffect, useState } from "react";
import { AVATAR_CHANGED_EVENT, AVATAR_STORAGE_KEY, readAvatarPreference } from "@/lib/avatar-preference";

/**
 * Objective: keep avatar URL synchronized across tabs and mounted client views.
 * Usage: use in any client component rendering current user avatar.
 * Input: fallback avatar URL.
 * Output: latest known avatar URL.
 * Special cases: listens to both `storage` and custom `site-avatar-changed` events.
 */
export function useAvatarPreference(fallbackAvatar: string) {
  const [avatar, setAvatar] = useState(fallbackAvatar);

  useEffect(() => {
    const hydrateAvatar = () => {
      setAvatar(readAvatarPreference(fallbackAvatar));
    };

    hydrateAvatar();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== AVATAR_STORAGE_KEY) {
        return;
      }

      if (event.newValue) {
        setAvatar(event.newValue);
      } else {
        setAvatar(fallbackAvatar);
      }
    };

    const handleAvatarChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ avatarUrl?: string }>;
      setAvatar(customEvent.detail?.avatarUrl || readAvatarPreference(fallbackAvatar));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AVATAR_CHANGED_EVENT, handleAvatarChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AVATAR_CHANGED_EVENT, handleAvatarChange as EventListener);
    };
  }, [fallbackAvatar]);

  return avatar;
}
