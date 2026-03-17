export const DEFAULT_SITE_BACKGROUND =
  "https://p4.wallpaperbetter.com/wallpaper/162/64/1018/gengar-ghastly-ghosts-haunter-wallpaper-preview.jpg";

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
