export const AVATAR_STORAGE_KEY = "avatar";
export const AVATAR_ID_STORAGE_KEY = "avatarId";
export const AVATAR_CHANGED_EVENT = "site-avatar-changed";

export const readAvatarPreference = (fallbackAvatar: string) => {
  if (typeof window === "undefined") {
    return fallbackAvatar;
  }

  return localStorage.getItem(AVATAR_STORAGE_KEY) || fallbackAvatar;
};

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
