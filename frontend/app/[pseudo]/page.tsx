"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const alder = "https://archives.bulbagarden.net/media/upload/e/e8/Spr_B2W2_Alder.png";
const cynthia = "https://archives.bulbagarden.net/media/upload/8/83/Spr_B2W2_Cynthia.png";
const n = "https://archives.bulbagarden.net/media/upload/2/2c/Spr_B2W2_N.png";
const red = "https://archives.bulbagarden.net/media/upload/9/9a/Spr_B2W2_Red.png";

// Historique mock affiché dans la section profil
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

const defaultBanner = "https://www.katebackdrop.fr/cdn/shop/files/B4035519.jpg?v=1710741683&width=600"
const defaultBackground = "https://p4.wallpaperbetter.com/wallpaper/162/64/1018/gengar-ghastly-ghosts-haunter-wallpaper-preview.jpg";

// Normalise une valeur de fond (URL brute, background:, ou url(...))
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

// Construit le style CSS final du fond (image ou gradient)
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

// Transforme une valeur de fond en variable CSS exploitable globalement
const toCssBackgroundImageValue = (value: string) => {
  const normalizedValue = normalizeBackgroundValue(value);
  
  // Si la valeur normalisée est vide ou juste des espaces, utiliser le fond par défaut
  if (!normalizedValue || !normalizedValue.trim()) {
    return `url("${defaultBackground}")`;
  }
  
  // Si c'est un gradient, le retourner tel quel
  if (normalizedValue.startsWith("linear-gradient") || normalizedValue.startsWith("radial-gradient")) {
    return normalizedValue;
  }
  
  return `url("${normalizedValue.replace(/"/g, '\\"')}")`;
};

// Page profil personnalisable d'un joueur
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  // États d'UI et de personnalisation locale
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(alder);
  const [profileBackground, setProfileBackground] = useState(defaultBackground);
  const [profileBanner, setProfileBanner] = useState(defaultBanner);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [draftAvatar, setDraftAvatar] = useState(alder);
  const [draftBackground, setDraftBackground] = useState(defaultBackground);
  const [draftBanner, setDraftBanner] = useState(defaultBanner);

  const avatars = [
    { name: "Alder", url: alder },
    { name: "Cynthia", url: cynthia },
    { name: "N", url: n },
    { name: "Red", url: red },
  ];

  useEffect(() => {
    // Auth guard + chargement des préférences depuis localStorage
    const getUser = async () => {
      const { data, error } = await authClient.getSession();
      if (error || !data) {
        router.push("/");
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    getUser();
    
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
      setDraftAvatar(savedAvatar);
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
  }, [router]);

  useEffect(() => {
    // Synchronise le fond site dès que le profil change
    document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(profileBackground));
  }, [profileBackground]);

  const openCustomizationPanel = () => {
    setDraftAvatar(avatar);
    setDraftBackground(profileBackground);
    setDraftBanner(profileBanner);
    setShowCustomizationPanel(true);
  };

  const handleSaveCustomization = () => {
    // Persiste les préférences et applique immédiatement le rendu
    const nextBackground = normalizeBackgroundValue(draftBackground);
    const nextBanner = normalizeBannerValue(draftBanner);

    setAvatar(draftAvatar);
    setProfileBackground(nextBackground);
    setProfileBanner(nextBanner);

    localStorage.setItem("avatar", draftAvatar);
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

  const pseudoParam = params?.pseudo;
  const displayPseudo = Array.isArray(pseudoParam)
    ? pseudoParam[0]
    : pseudoParam || user?.name || "Pseudo";

  const backgroundStyle = buildBackgroundStyle(profileBackground, defaultBackground);
  const bannerStyle = buildBackgroundStyle(profileBanner, defaultBanner);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl">Chargement...</p>
      </div>
    );
  }

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
          <button
            onClick={openCustomizationPanel}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#b4a8ff]/60 bg-[#1f1b2d]/90 px-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#2b2540]"
            aria-label="Personnaliser le profil"
          >
            <i className="fa-solid fa-sliders"></i>
            <span className="hidden sm:inline">Personnaliser</span>
          </button>
          <button
            onClick={() => router.push("/home")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-500/80 bg-gray-700/80 text-white shadow-lg transition-colors hover:bg-gray-600"
            aria-label="Retour à l'accueil"
          >
            <i className="fa-solid fa-house"></i>
          </button>
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/80 bg-red-500/90 text-white shadow-lg transition-colors hover:bg-red-500"
            aria-label="Déconnexion"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </header>

        <section className="flex-1 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="relative h-36 overflow-hidden border-b border-[#3c3650]">
            <div
              className="absolute inset-0"
              style={bannerStyle}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
          </div>

          <div className="px-5 pb-6 pt-4 sm:px-10 sm:pb-8">
            <div className="-mt-16 mb-6 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
              <div className="flex items-end gap-4">
                <div className="relative">
                <Image
                  src={avatar}
                  alt="Avatar"
                  width={176}
                  height={176}
                  className="drop-shadow-2xl"
                  style={{ imageRendering: "pixelated" }}
                  priority
                />
                </div>

                <div className="pb-3">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{displayPseudo}</h1>
                    <i className="fa-solid fa-circle-check text-[#8e82ff] text-xl"></i>
                    <i className="fa-brands fa-telegram text-blue-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-300">#1 MIMIKYU ENJOYER</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-3">
                <span className="rounded-md border border-yellow-500/50 bg-yellow-600/90 px-3 py-1 text-xs font-bold">OWNER</span>
                <span className="rounded-md border border-[#b4a8ff]/50 bg-[#8e82ff]/90 px-3 py-1 text-xs font-bold">GIGACHAD</span>
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

      {showCustomizationPanel && (
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
                      key={av.name}
                      onClick={() => setDraftAvatar(av.url)}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-2 transition-colors ${
                        draftAvatar === av.url
                          ? "border-[#b4a8ff] bg-[#8e82ff]/20"
                          : "border-[#3c3650] bg-[#242033] hover:bg-[#302a45]"
                      }`}
                    >
                      <Image
                        src={av.url}
                        alt={av.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                        style={{ imageRendering: "pixelated" }}
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
                  className="w-full rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#8e82ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Bannière de profil (URL)</label>
                <input
                  type="url"
                  value={draftBanner}
                  onChange={(event) => setDraftBanner(event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#8e82ff]"
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
                  className="rounded-lg border border-[#b4a8ff]/70 bg-[#8e82ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7d71ec]"
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
