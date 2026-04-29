// HARDCODE: fallback visual used when no persisted/user background is available.
export const DEFAULT_SITE_BACKGROUND =
  "#000000";

// HARDCODE: accepted file extensions for direct video backgrounds.
const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

export type BackgroundMediaType = "none" | "direct-video" | "youtube";

/**
 * Objective: normalize user-provided background values into a usable URL/string.
 * Usage: called before persistence and before CSS style generation.
 * Input: raw value that may be empty, a CSS declaration, or a plain URL.
 * Output: cleaned value; fallback if input is empty/invalid.
 * Special cases: supports values like `background-image: url(...)`.
 */
export const normalizeImageValue = (value: string, fallback: string) => {
  const rawValue = (value || "").trim();

  if (!rawValue) {
    return fallback;
  }

  const withoutDeclaration = rawValue.replace(/^background(-image)?\s*:\s*/i, "").trim();

  if (withoutDeclaration.startsWith("url(")) {
    const insideUrl = withoutDeclaration.slice(4, -1).trim().replace(/^['"]|['"]$/g, "");
    return insideUrl || fallback;
  }

  return withoutDeclaration;
};

const stripQuotes = (value: string) => value.replace(/^['"]|['"]$/g, "");

const tryGetUrl = (value: string) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const extractYouTubeVideoId = (value: string) => {
  const parsed = tryGetUrl(value);
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }

    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "shorts" || pathParts[0] === "embed") {
      return pathParts[1] || null;
    }
  }

  return null;
};

const isDirectVideoUrl = (value: string) => {
  const parsed = tryGetUrl(value);
  if (!parsed) return false;

  const pathname = parsed.pathname.toLowerCase();
  return DIRECT_VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
};

/**
 * Objective: detect media type and compute CSS-safe background values.
 * Usage: single entry point before applying background settings to the app shell.
 * Input: candidate background value and an optional fallback URL.
 * Output: normalized value + css image value + media type/source.
 * Special cases: YouTube and direct-video URLs fallback to image CSS to keep blur layer stable.
 */
export const resolveBackgroundMedia = (value: string, fallback: string = DEFAULT_SITE_BACKGROUND) => {
  const normalizedValue = normalizeImageValue(value, fallback);
  const youtubeId = extractYouTubeVideoId(normalizedValue);

  if (youtubeId) {
    return {
      normalizedValue,
      imageCssValue: `url("${fallback.replace(/"/g, '\\"')}")`,
      mediaType: "youtube" as BackgroundMediaType,
      mediaSource: youtubeId,
    };
  }

  if (isDirectVideoUrl(normalizedValue)) {
    return {
      normalizedValue,
      imageCssValue: `url("${fallback.replace(/"/g, '\\"')}")`,
      mediaType: "direct-video" as BackgroundMediaType,
      mediaSource: normalizedValue,
    };
  }

  return {
    normalizedValue,
    imageCssValue: toCssImageValue(normalizedValue, fallback),
    mediaType: "none" as BackgroundMediaType,
    mediaSource: "",
  };
};

/**
 * Objective: apply current background preference to CSS custom properties.
 * Usage: called when user updates theme/background and at hydration time.
 * Input: raw preferred value and optional fallback.
 * Output: none (side effects on document + custom event dispatch).
 * Special cases: emits `site-background-changed` to sync all mounted shells.
 */
export const applyBackgroundPreferenceToDocument = (value: string, fallback: string = DEFAULT_SITE_BACKGROUND) => {
  const resolved = resolveBackgroundMedia(value, fallback);

  document.documentElement.style.setProperty("--site-bg-image", resolved.imageCssValue);
  document.documentElement.style.setProperty("--site-bg-media-type", resolved.mediaType);
  document.documentElement.style.setProperty("--site-bg-media-source", resolved.mediaSource);

  window.dispatchEvent(new CustomEvent("site-background-changed"));
};

/**
 * Objective: read resolved background media metadata from CSS custom properties.
 * Usage: consumed by page shells to decide image vs video rendering.
 * Input: none.
 * Output: media type and media source currently applied to document root.
 * Special cases: empty CSS variables fallback to `none` and empty source.
 */
export const getBackgroundMediaFromDocument = () => {
  const styles = getComputedStyle(document.documentElement);
  const mediaType = stripQuotes(styles.getPropertyValue("--site-bg-media-type").trim()) as BackgroundMediaType;
  const mediaSource = stripQuotes(styles.getPropertyValue("--site-bg-media-source").trim());

  return {
    mediaType: mediaType || "none",
    mediaSource: mediaSource || "",
  };
};

/**
 * Objective: build a valid CSS image value from raw user input.
 * Usage: internal utility for `resolveBackgroundMedia` and direct style binding.
 * Input: raw value + fallback URL.
 * Output: CSS-ready value (`url(...)` or gradient declaration).
 * Special cases: preserves gradient expressions as-is.
 */
export const toCssImageValue = (value: string, fallback: string) => {
  const normalizedValue = normalizeImageValue(value, fallback);

  if (!normalizedValue || !normalizedValue.trim()) {
    return `url("${fallback}")`;
  }

  if (normalizedValue.startsWith("linear-gradient") || normalizedValue.startsWith("radial-gradient")) {
    return normalizedValue;
  }

  return `url("${normalizedValue.replace(/"/g, '\\"')}")`;
};

/**
 * Objective: return style object consumable by React inline styles for backgrounds.
 * Usage: used by profile/banner previews and dynamic visual sections.
 * Input: raw value + fallback URL.
 * Output: style object with background keys.
 * Special cases: gradients use `background`; images use `backgroundImage`.
 */
export const buildBackgroundStyle = (value: string, fallback: string) => {
  const normalizedValue = normalizeImageValue(value, fallback);

  if (normalizedValue.startsWith("linear-gradient") || normalizedValue.startsWith("radial-gradient")) {
    return {
      background: normalizedValue,
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }

  return {
    backgroundImage: `url("${normalizedValue.replace(/"/g, '\\"')}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
};
