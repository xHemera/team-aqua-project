"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { applyAccentPalette, resolveProfileIcon } from "@/lib/profile-icons";

type AvatarEntry = { id: string; name: string; type: string; url: string; accent: string; accentHover: string };

type ProfileClientViewProps = {
  profileName: string;
  initialAvatar: string;
  isOwnProfile: boolean;
};

const defaultBanner = "https://www.katebackdrop.fr/cdn/shop/files/B4035519.jpg?v=1710741683&width=600";
const defaultBackground = "https://p4.wallpaperbetter.com/wallpaper/162/64/1018/gengar-ghastly-ghosts-haunter-wallpaper-preview.jpg";

const matchHistory = [
  {
    result: "Victoire",
    resultStyle: "bg-green-600",
    borderStyle: "border-green-500",
    date: "26 janv. 2026",
    playedDeck: "Flygon",
    opponentDeck: "Ceruledge",
    opponent: "SunMiaou",
  },
  {
    result: "Défaite",
    resultStyle: "bg-red-600",
    borderStyle: "border-red-500",
    date: "18 janv. 2026",
    playedDeck: "Zacian",
    opponentDeck: "Toxtricity",
    opponent: "Xoco",
  },
  {
    result: "Victoire",
    resultStyle: "bg-green-600",
    borderStyle: "border-green-500",
    date: "09 déc. 2025",
    playedDeck: "Ceruledge",
    opponentDeck: "Flygon",
    opponent: "Sauralt",
  },
  {
    result: "Victoire",
    resultStyle: "bg-green-600",
    borderStyle: "border-green-500",
    date: "22 nov. 2025",
    playedDeck: "Toxtricity",
    opponentDeck: "Zacian",
    opponent: "GeekMaster",
  },
];

const deckpublic: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

const normalizeImageValue = (value: string, fallback: string) => {
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

const normalizeBackgroundValue = (value: string) => normalizeImageValue(value, defaultBackground);
const normalizeBannerValue = (value: string) => normalizeImageValue(value, defaultBanner);

const buildBackgroundStyle = (value: string, fallback: string) => {
  const normalizedValue = normalizeImageValue(value, fallback);

  if (normalizedValue.startsWith("linear-gradient") || normalizedValue.startsWith("radial-gradient")) {
    return { background: normalizedValue, backgroundPosition: "center", backgroundSize: "cover" };
  }

  return {
    backgroundImage: `url("${normalizedValue.replace(/"/g, '\\"')}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
};

const toCssBackgroundImageValue = (value: string) => {
  const normalizedValue = normalizeBackgroundValue(value);

  if (!normalizedValue || !normalizedValue.trim()) {
    return `url("${defaultBackground}")`;
  }

  if (normalizedValue.startsWith("linear-gradient") || normalizedValue.startsWith("radial-gradient")) {
    return normalizedValue;
  }

  return `url("${normalizedValue.replace(/"/g, '\\"')}")`;
};

export default function ProfileClientView({ profileName, initialAvatar, isOwnProfile }: ProfileClientViewProps) {
  const router = useRouter();
  const [avatars, setAvatars] = useState<AvatarEntry[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [profileBackground, setProfileBackground] = useState(defaultBackground);
  const [profileBanner, setProfileBanner] = useState(defaultBanner);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [draftAvatarId, setDraftAvatarId] = useState<string | null>(null);
  const [draftBackground, setDraftBackground] = useState(defaultBackground);
  const [draftBanner, setDraftBanner] = useState(defaultBanner);

  useEffect(() => {
    const icon = resolveProfileIcon({ url: initialAvatar });
    applyAccentPalette(icon);
  }, [initialAvatar]);

  useEffect(() => {
    if (!isOwnProfile) return;

    const initOwnProfile = async () => {
      const avatarsRes = await fetch("/api/avatars");
      if (avatarsRes.ok) {
        const avatarList: AvatarEntry[] = await avatarsRes.json();
        setAvatars(avatarList);

        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.avatar) {
            setSelectedAvatarId(profile.avatar.id);
            setDraftAvatarId(profile.avatar.id);
            setAvatar(profile.avatar.url);
            localStorage.setItem("avatar", profile.avatar.url);
            localStorage.setItem("avatarId", profile.avatar.id);
            applyAccentPalette(resolveProfileIcon({ id: profile.avatar.id, url: profile.avatar.url }));
          }
        }
      }

      const savedBackground =
        localStorage.getItem("profileBackground") ||
        localStorage.getItem("background") ||
        localStorage.getItem("wallpaper") ||
        localStorage.getItem("customBackground");

      if (savedBackground) {
        const nextSavedBackground = normalizeBackgroundValue(savedBackground);
        setProfileBackground(nextSavedBackground);
        setDraftBackground(nextSavedBackground);
        document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(nextSavedBackground));
      }

      const savedBanner = localStorage.getItem("profileBanner");
      if (savedBanner) {
        const nextSavedBanner = normalizeBannerValue(savedBanner);
        setProfileBanner(nextSavedBanner);
        setDraftBanner(nextSavedBanner);
      }
    };

    initOwnProfile();
  }, [isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile) return;
    document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(profileBackground));
  }, [isOwnProfile, profileBackground]);

  const openCustomizationPanel = () => {
    setDraftAvatarId(selectedAvatarId);
    setDraftBackground(profileBackground);
    setDraftBanner(profileBanner);
    setShowCustomizationPanel(true);
  };

  const handleSaveCustomization = async () => {
    const nextBackground = normalizeBackgroundValue(draftBackground);
    const nextBanner = normalizeBannerValue(draftBanner);

    if (draftAvatarId && draftAvatarId !== selectedAvatarId) {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: draftAvatarId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedAvatarId(updated.avatar?.id ?? draftAvatarId);
        setAvatar(updated.avatar?.url ?? avatar);
        localStorage.setItem("avatar", updated.avatar?.url ?? avatar);
        localStorage.setItem("avatarId", updated.avatar?.id ?? draftAvatarId);
        applyAccentPalette(resolveProfileIcon({ id: updated.avatar?.id ?? draftAvatarId, url: updated.avatar?.url ?? avatar }));
      }
    }

    setProfileBackground(nextBackground);
    setProfileBanner(nextBanner);
    localStorage.setItem("profileBackground", nextBackground);
    localStorage.setItem("profileBanner", nextBanner);
    localStorage.setItem("background", nextBackground);
    document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(nextBackground));
    setShowCustomizationPanel(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const backgroundStyle = buildBackgroundStyle(profileBackground, defaultBackground);
  const bannerStyle = buildBackgroundStyle(profileBanner, defaultBanner);

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          ...backgroundStyle,
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/25" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[92rem] flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="mb-5 flex items-center justify-end gap-3">
          {isOwnProfile && (
            <button
              onClick={openCustomizationPanel}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[color:var(--accent-border)] bg-[#1f1b2d]/90 px-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#2b2540]"
              aria-label="Personnaliser le profil"
            >
              <i className="fa-solid fa-sliders"></i>
              <span className="hidden sm:inline">Personnaliser</span>
            </button>
          )}

          <button
            onClick={() => router.push("/home")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-500/80 bg-gray-700/80 text-white shadow-lg transition-colors hover:bg-gray-600"
            aria-label="Retour à l'accueil"
          >
            <i className="fa-solid fa-house"></i>
          </button>

          {isOwnProfile && (
            <button
              onClick={handleLogout}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/80 bg-red-500/90 text-white shadow-lg transition-colors hover:bg-red-500"
              aria-label="Déconnexion"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          )}
        </header>

        <section className="flex-1 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="relative h-36 overflow-hidden border-b border-[#3c3650]">
            <div className="absolute inset-0" style={bannerStyle} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
          </div>

          <div className="px-5 pb-6 pt-4 sm:px-10 sm:pb-8">
            <div className="-mt-16 mb-6 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Image
                    src={avatar}
                    alt={`Avatar de ${profileName}`}
                    width={176}
                    height={176}
                    className="h-40 w-40 rounded-2xl border border-[color:var(--accent-border)] object-cover drop-shadow-2xl sm:h-44 sm:w-44"
                    priority
                    unoptimized
                  />
                </div>

                <div className="pb-3">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{profileName}</h1>
                    <i className="fa-solid fa-circle-check text-[var(--accent-color)] text-xl"></i>
                    <i className="fa-brands fa-telegram text-blue-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-300">#1 MIMIKYU ENJOYER</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-3">
                <span className="rounded-md border border-yellow-500/50 bg-yellow-600/90 px-3 py-1 text-xs font-bold">OWNER</span>
                <span className="rounded-md border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-3 py-1 text-xs font-bold">GIGACHAD</span>
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#312b42] pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Historique de partie</h2>
                <div className="text-sm text-gray-400">
                  <span>Total : 4</span>
                  <span className="ml-4">Victoires : 3</span>
                </div>
              </div>

              <div className="space-y-3.5">
                {matchHistory.map((match, index) => (
                  <article
                    key={`${match.date}-${match.opponent}-${index}`}
                    className={`rounded-xl border-l-4 ${match.borderStyle} bg-[#211d2e] p-5 transition-colors hover:bg-[#2a253b]`}
                  >
                    <div className="grid gap-4 md:grid-cols-12 md:items-center">
                      <div className="md:col-span-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`rounded-md px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide ${match.resultStyle}`}>
                            {match.result}
                          </span>
                          <span className="text-base text-gray-300">{match.date}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 md:col-span-6">
                        <div className="rounded-lg bg-black/20 px-3 py-2.5">
                          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Deck joué</p>
                          <div className="inline-flex items-center gap-2.5">
                            <Image
                              src={deckpublic[match.playedDeck] || deckpublic.Flygon}
                              alt={match.playedDeck}
                              width={24}
                              height={24}
                              className="h-6 w-6"
                            />
                            <span className="text-base font-semibold text-white">{match.playedDeck}</span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-black/20 px-3 py-2.5">
                          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Deck affronté</p>
                          <div className="inline-flex items-center gap-2.5">
                            <Image
                              src={deckpublic[match.opponentDeck] || deckpublic.Flygon}
                              alt={match.opponentDeck}
                              width={24}
                              height={24}
                              className="h-6 w-6"
                            />
                            <span className="text-base font-semibold text-white">{match.opponentDeck}</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3 md:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Joueur affronté</p>
                        <p className="text-base font-medium text-gray-200">{match.opponent}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {isOwnProfile && showCustomizationPanel && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCustomizationPanel(false)}
        >
          <aside
            className="absolute right-4 top-4 w-[min(460px,calc(100vw-2rem))] rounded-2xl border border-[#3c3650] bg-[#15131d] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Personnalisation du profil</h3>
              <button
                onClick={() => setShowCustomizationPanel(false)}
                className="rounded-md bg-[#242033] px-2 py-1 text-sm text-gray-200 transition-colors hover:bg-[#302a45]"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-200">Photo de profil</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setDraftAvatarId(av.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                        draftAvatarId === av.id
                          ? "border-[color:var(--accent-border)] bg-[var(--accent-soft)]"
                          : "border-[#3c3650] bg-[#242033] hover:bg-[#302a45]"
                      }`}
                    >
                      <Image
                        src={av.url}
                        alt={av.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg border border-[#3c3650] object-cover"
                        unoptimized
                      />
                      <span className="text-xs text-gray-200">{av.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Fond d'écran du site (URL)</label>
                <input
                  type="url"
                  value={draftBackground}
                  onChange={(event) => setDraftBackground(event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[var(--accent-color)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Bannière de profil (URL)</label>
                <input
                  type="url"
                  value={draftBanner}
                  onChange={(event) => setDraftBanner(event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[var(--accent-color)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowCustomizationPanel(false)}
                  className="rounded-lg border border-[#3c3650] bg-[#242033] px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-[#302a45]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveCustomization}
                  className="rounded-lg border border-[color:var(--accent-border)] bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}