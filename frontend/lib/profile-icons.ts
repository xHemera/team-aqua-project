export type ProfileIconType =
  | "esper"
  | "kusa"
  | "honoh"
  | "mizu"
  | "denki"
  | "normal"
  | "kohri"
  | "iwa"
  | "jimen"
  | "hikoh"
  | "fairy"
  | "mushi"
  | "doku"
  | "ghost"
  | "aku"
  | "hagane"
  | "kakutoh"
  | "dragon"
  | "rival";

export type ProfileIcon = {
  id: string;
  name: string;
  type: ProfileIconType;
  url: string;
  accent: string;
  accentHover: string;
};

export const PROFILE_ICONS: ProfileIcon[] = [
  { id: "avatar_alder", name: "Esper", type: "esper", url: "/profile-icons/esper_icon.jpg", accent: "#f85888", accentHover: "#e24a79" },
  { id: "avatar_cynthia", name: "Kusa", type: "kusa", url: "/profile-icons/kusa_icon.jpg", accent: "#78c850", accentHover: "#64ae3f" },
  { id: "avatar_n", name: "Honoh", type: "honoh", url: "/profile-icons/honoh_icon.jpg", accent: "#f08030", accentHover: "#d96f25" },
  { id: "avatar_red", name: "Mizu", type: "mizu", url: "/profile-icons/mizu_icon.jpg", accent: "#6890f0", accentHover: "#4f79dd" },
  { id: "avatar_ace_f", name: "Denki", type: "denki", url: "/profile-icons/denki_icon.jpg", accent: "#f8d030", accentHover: "#dfbb27" },
  { id: "avatar_ace_m", name: "Normal", type: "normal", url: "/profile-icons/normal_icon.jpg", accent: "#a8a878", accentHover: "#939364" },
  { id: "avatar_artist", name: "Kohri", type: "kohri", url: "/profile-icons/kohri_icon.jpg", accent: "#98d8d8", accentHover: "#80c2c2" },
  { id: "avatar_backers_f", name: "Iwa", type: "iwa", url: "/profile-icons/iwa_icon.jpg", accent: "#b8a038", accentHover: "#a08b2c" },
  { id: "avatar_backers_m", name: "Jimen", type: "jimen", url: "/profile-icons/jimen_icon.jpg", accent: "#e0c068", accentHover: "#ccac53" },
  { id: "avatar_backpacker", name: "Hikoh", type: "hikoh", url: "/profile-icons/hikoh_icon.jpg", accent: "#a890f0", accentHover: "#9178dc" },
  { id: "avatar_baker", name: "Fairy", type: "fairy", url: "/profile-icons/fairy_icon.jpg", accent: "#ee99ac", accentHover: "#db8599" },
  { id: "avatar_battle_girl", name: "Mushi", type: "mushi", url: "/profile-icons/mushi_icon.jpg", accent: "#a8b820", accentHover: "#919f16" },
  { id: "avatar_biker", name: "Doku", type: "doku", url: "/profile-icons/doku_icon.jpg", accent: "#a040a0", accentHover: "#8b318b" },
  { id: "avatar_benga", name: "Ghost", type: "ghost", url: "/profile-icons/gohst_icon.jpg", accent: "#705898", accentHover: "#5d4684" },
  { id: "avatar_bianca", name: "Aku", type: "aku", url: "/profile-icons/aku_icon.jpg", accent: "#705848", accentHover: "#5f4839" },
  { id: "avatar_blaine", name: "Hagane", type: "hagane", url: "/profile-icons/hagane_icon.jpg", accent: "#b8b8d0", accentHover: "#a1a1b8" },
  { id: "avatar_hilda", name: "Kakutoh", type: "kakutoh", url: "/profile-icons/kakutoh_icon.jpg", accent: "#c03028", accentHover: "#ab241d" },
  { id: "avatar_fantina", name: "Dragon", type: "dragon", url: "/profile-icons/dragon_icon.jpg", accent: "#7038f8", accentHover: "#5f2fe0" },
  { id: "avatar_hoopster", name: "Rival", type: "rival", url: "/profile-icons/rivalTeto_icon.jpg", accent: "#f05060", accentHover: "#de3f50" },
];

export const DEFAULT_PROFILE_ICON = PROFILE_ICONS.find((icon) => icon.type === "normal") ?? PROFILE_ICONS[0];

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const normalizeUrl = (url?: string | null) => (url || "").trim().split("?")[0];

export const getProfileIconById = (id?: string | null) => PROFILE_ICONS.find((icon) => icon.id === id);

export const getProfileIconByUrl = (url?: string | null) => {
  const target = normalizeUrl(url);
  if (!target) return undefined;
  return PROFILE_ICONS.find((icon) => normalizeUrl(icon.url) === target);
};

export const resolveProfileIcon = (params: { id?: string | null; url?: string | null }) => {
  return getProfileIconById(params.id) ?? getProfileIconByUrl(params.url) ?? DEFAULT_PROFILE_ICON;
};

export const getAccentPalette = (icon: ProfileIcon) => {
  const { r, g, b } = hexToRgb(icon.accent);
  return {
    color: icon.accent,
    hover: icon.accentHover,
    soft: `rgba(${r}, ${g}, ${b}, 0.22)`,
    border: `rgba(${r}, ${g}, ${b}, 0.68)`,
  };
};

export const applyAccentPalette = (icon: ProfileIcon) => {
  if (typeof document === "undefined") return;
  const palette = getAccentPalette(icon);
  document.documentElement.style.setProperty("--accent-color", palette.color);
  document.documentElement.style.setProperty("--accent-hover", palette.hover);
  document.documentElement.style.setProperty("--accent-soft", palette.soft);
  document.documentElement.style.setProperty("--accent-border", palette.border);
};
