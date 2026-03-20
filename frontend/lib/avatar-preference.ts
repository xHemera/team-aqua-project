// HARDCODE: localStorage key used until avatar preferences are fully server-driven.
export const AVATAR_STORAGE_KEY = "avatar";
// HARDCODE: localStorage key used until avatar id persistence is fully server-driven.
export const AVATAR_ID_STORAGE_KEY = "avatarId";
export const AVATAR_CHANGED_EVENT = "site-avatar-changed";

/**
 * Objective: read avatar preference in a browser-safe way.
 * Usage: use in hooks/components needing current avatar with SSR fallback.
 * Input: fallback avatar URL.
 * Output: stored avatar URL or fallback.
 * Special cases: on server, always returns fallback (no window/localStorage).
 */
export const readAvatarPreference = (fallbackAvatar: string) => {
  if (typeof window === "undefined") {
    return fallbackAvatar;
  }

  return localStorage.getItem(AVATAR_STORAGE_KEY) || fallbackAvatar;
};

/**
 * Objective: persist avatar preference and notify active views.
 * Usage: call after profile/avatar mutations.
 * Input: avatar URL and optional avatar ID.
 * Output: none (side effects in localStorage + custom event).
 * Special cases: no-op on server runtime.
 */
export const persistAvatarPreference = (avatarUrl: string, avatarId?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
  if (avatarId) {
    localStorage.setItem(AVATAR_ID_STORAGE_KEY, avatarId);
  }

  window.dispatchEvent(
    new CustomEvent(AVATAR_CHANGED_EVENT, {
      detail: { avatarUrl, avatarId: avatarId ?? null },
    }),
  );
};
