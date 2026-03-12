export const DEFAULT_SITE_BACKGROUND =
  "https://p4.wallpaperbetter.com/wallpaper/162/64/1018/gengar-ghastly-ghosts-haunter-wallpaper-preview.jpg";

const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

export type BackgroundMediaType = "none" | "direct-video" | "youtube";

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

export const applyBackgroundPreferenceToDocument = (value: string, fallback: string = DEFAULT_SITE_BACKGROUND) => {
  const resolved = resolveBackgroundMedia(value, fallback);

  document.documentElement.style.setProperty("--site-bg-image", resolved.imageCssValue);
  document.documentElement.style.setProperty("--site-bg-media-type", resolved.mediaType);
  document.documentElement.style.setProperty("--site-bg-media-source", resolved.mediaSource);

  window.dispatchEvent(new CustomEvent("site-background-changed"));
};

export const getBackgroundMediaFromDocument = () => {
  const styles = getComputedStyle(document.documentElement);
  const mediaType = stripQuotes(styles.getPropertyValue("--site-bg-media-type").trim()) as BackgroundMediaType;
  const mediaSource = stripQuotes(styles.getPropertyValue("--site-bg-media-source").trim());

  return {
    mediaType: mediaType || "none",
    mediaSource: mediaSource || "",
  };
};

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
