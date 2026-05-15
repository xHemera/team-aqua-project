export type ProfileIconType = "default";

export type ProfileIcon = {
  id: string;
  name: string;
  type: ProfileIconType;
  url: string;
  accent: string;
  accentHover: string;
};

// Default gray profile icon
export const PROFILE_ICONS: ProfileIcon[] = [
  { id: "avatar_default", name: "Default", type: "default", url: "/profile-icons/default-avatar.svg", accent: "#c9a227", accentHover: "#b8911b" },
];

export const DEFAULT_PROFILE_ICON = PROFILE_ICONS[0];

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

/**
 * Objective: resolve the best possible icon for a user profile.
 * Usage: central resolver for profile UI and accent derivation.
 * Input: avatar id and/or avatar URL.
 * Output: always returns a valid icon object.
 * Special cases: fallback returns default icon.
 */
export const resolveProfileIcon = (params: { id?: string | null; url?: string | null }) => {
  return DEFAULT_PROFILE_ICON;
};

/**
 * Objective: convert icon accent into full UI palette variables.
 * Usage: prepare CSS token values for theming.
 * Input: resolved profile icon.
 * Output: accent color set (base, hover, soft, border).
 * Special cases: soft and border colors are generated from RGB conversion.
 */
export const getAccentPalette = (icon: ProfileIcon) => {
  const { r, g, b } = hexToRgb(icon.accent);
  return {
    color: icon.accent,
    hover: icon.accentHover,
    soft: `rgba(${r}, ${g}, ${b}, 0.22)`,
    border: `rgba(${r}, ${g}, ${b}, 0.68)`,
  };
};

/**
 * Objective: apply icon-driven accent palette to root CSS variables.
 * Usage: run whenever active profile icon changes.
 * Input: resolved profile icon.
 * Output: none (side effects on `document.documentElement`).
 * Special cases: no-op during SSR.
 */
export const applyAccentPalette = (icon: ProfileIcon) => {
  if (typeof document === "undefined") return;
  const palette = getAccentPalette(icon);
  document.documentElement.style.setProperty("--accent-color", palette.color);
  document.documentElement.style.setProperty("--accent-hover", palette.hover);
  document.documentElement.style.setProperty("--accent-soft", palette.soft);
  document.documentElement.style.setProperty("--accent-border", palette.border);
};
