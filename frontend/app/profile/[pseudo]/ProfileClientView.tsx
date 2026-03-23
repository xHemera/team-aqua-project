"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";
import { authClient } from "@/lib/auth-client";
import { socket } from "../../../socket"
import { buildBackgroundStyle, DEFAULT_SITE_BACKGROUND, normalizeImageValue, toCssImageValue } from "@/lib/background-utils";
import { applyAccentPalette, resolveProfileIcon } from "@/lib/profile-icons";

type AvatarEntry = { id: string; name: string; type: string; url: string; accent: string; accentHover: string };

type ProfileClientViewProps = {
  profileName: string;
  initialAvatar: string;
  isOwnProfile: boolean;
};

const defaultBanner = "https://www.katebackdrop.fr/cdn/shop/files/B4035519.jpg?v=1710741683&width=600";
const defaultBackground = DEFAULT_SITE_BACKGROUND;

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

const normalizeBackgroundValue = (value: string) => normalizeImageValue(value, defaultBackground);
const normalizeBannerValue = (value: string) => normalizeImageValue(value, defaultBanner);

const toCssBackgroundImageValue = (value: string) => toCssImageValue(value, defaultBackground);

export default function ProfileClientView({ profileName, initialAvatar, isOwnProfile }: ProfileClientViewProps) {
  const router = useRouter();
  const [avatars, setAvatars] = useState<AvatarEntry[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [profileBackground, setProfileBackground] = useState(defaultBackground);
  const [profileBanner, setProfileBanner] = useState(defaultBanner);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const bannerUploadRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  const [draftAvatarId, setDraftAvatarId] = useState<string | null>(null);
  const [draftBackground, setDraftBackground] = useState(defaultBackground);
  const [draftBanner, setDraftBanner] = useState(defaultBanner);
  const [disconnect, setDisconnect] = useState(false);
  const [userPseudo, setUserPseudo] = useState<string | null>(null)


  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name)
      {
        setUserPseudo(data.user.name);
      };
    };
    getUserData();
  });

  //reconnection en cas de chargement de la page
    useEffect(() => {
      if (socket.connected || disconnect || !userPseudo) return;
      socket.connect()
      socket.emit("login", userPseudo);
      socket.on("online_users", (users) => {
        console.log("Users from Redis:", users);
      });
    });
  
    //deconnecte le socket
    useEffect(() => {
      if (disconnect == true)
        socket.disconnect();
    });
    
  useEffect(() => {
    const icon = resolveProfileIcon({ url: initialAvatar });
    applyAccentPalette(icon);
  }, [initialAvatar]);

  useEffect(() => {
    if (!isOwnProfile) return;

    const initOwnProfile = async () => {
      const avatarsRes = await fetch("/api/avatars");
      let profile: any = null;
      if (avatarsRes.ok) {
        const avatarList: AvatarEntry[] = await avatarsRes.json();
        setAvatars(avatarList);

        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          profile = await profileRes.json();
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
        localStorage.setItem("profileBackground", nextSavedBackground);
        document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(nextSavedBackground));
      } else if (profile?.profileBackground) {
        const nextBackground = normalizeBackgroundValue(profile.profileBackground);
        setProfileBackground(nextBackground);
        setDraftBackground(nextBackground);
        localStorage.setItem("profileBackground", nextBackground);
        document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(nextBackground));
      }

      if (profile?.profileBanner) {
        const nextBanner = normalizeBannerValue(profile.profileBanner);
        setProfileBanner(nextBanner);
        setDraftBanner(nextBanner);
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
    const patchBody: any = {
      profileBackground: draftBackground,
      profileBanner: draftBanner,
    };

    if (draftAvatarId && draftAvatarId !== selectedAvatarId) {
      patchBody.avatarId = draftAvatarId;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });

    if (res.ok) {
      const updated = await res.json();
      if (updated.avatar) {
        setSelectedAvatarId(updated.avatar.id);
        setAvatar(updated.avatar.url);
        localStorage.setItem("avatar", updated.avatar.url);
        localStorage.setItem("avatarId", updated.avatar.id);
        applyAccentPalette(resolveProfileIcon({ id: updated.avatar.id, url: updated.avatar.url }));
      }
      if (updated.profileBackground !== undefined) {
        const normalized = normalizeBackgroundValue(updated.profileBackground);
        setProfileBackground(normalized);
        localStorage.setItem("profileBackground", normalized);
        document.documentElement.style.setProperty("--site-bg-image", toCssBackgroundImageValue(normalized));
      }
      if (updated.profileBanner !== undefined) {
        const normalized = normalizeBannerValue(updated.profileBanner);
        setProfileBanner(normalized);
      }
    }
    setShowCustomizationPanel(false);
  };

  const handleLogout = async () => {
    setDisconnect(true);
    await authClient.signOut();
    router.push("/");
  };

  const handleDeleteProfile = async () => {
    const shouldDelete = window.confirm("Supprimer définitivement votre profil ? Cette action est irréversible.");
    if (!shouldDelete) return;

    const res = await fetch("/api/profile", { method: "DELETE" });
    if (!res.ok) {
      alert("Impossible de supprimer le profil");
      return;
    }

    setDisconnect(true);
    localStorage.removeItem("avatar");
    localStorage.removeItem("avatarId");
    localStorage.removeItem("profileBackground");
    localStorage.removeItem("background");
    localStorage.removeItem("wallpaper");
    localStorage.removeItem("customBackground");

    await authClient.signOut();
    router.push("/");
  };

  const bannerStyle = buildBackgroundStyle(profileBanner, defaultBanner);

  return (
    <AppPageShell containerClassName="flex min-h-screen w-full max-w-[92rem] flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="w-full">
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

          {isOwnProfile && (
            <button
              onClick={handleDeleteProfile}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/80 bg-red-700/90 px-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-700"
              aria-label="Supprimer le profil"
            >
              <i className="fa-solid fa-user-xmark"></i>
              <span className="hidden sm:inline">Supprimer le profil</span>
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCustomizationPanel(false)}
        >
          <aside
            className="w-[min(680px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#3c3650] bg-[#15131d] p-6 shadow-2xl"
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
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setDraftAvatarId(av.id)}
                      title={av.name}
                      className="flex items-center justify-center bg-transparent p-0"
                    >
                      <Image
                        src={av.url}
                        alt={av.name}
                        width={80}
                        height={80}
                        className={`h-16 w-16 rounded-xl object-cover pointer-events-none transition-all ${
                          draftAvatarId === av.id
                            ? "ring-2 ring-[color:var(--accent-border)] ring-offset-2 ring-offset-[#15131d]"
                            : "opacity-75 hover:opacity-100"
                        }`}
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Fond d&apos;écran du site</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={draftBackground}
                    onChange={(event) => setDraftBackground(event.target.value)}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[var(--accent-color)]"
                  />
                  <input
                    ref={bgUploadRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setDraftBackground(await fileToDataUrl(file));
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-[#302a45] whitespace-nowrap"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Fichier
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Bannière de profil</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={draftBanner}
                    onChange={(event) => setDraftBanner(event.target.value)}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[var(--accent-color)]"
                  />
                  <input
                    ref={bannerUploadRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setDraftBanner(await fileToDataUrl(file));
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => bannerUploadRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3c3650] bg-[#242033] px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-[#302a45] whitespace-nowrap"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Fichier
                  </button>
                </div>
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
    </AppPageShell>
  );
}