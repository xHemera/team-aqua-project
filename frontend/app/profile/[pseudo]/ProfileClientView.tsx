"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import IconButton from "@/components/atoms/IconButton";
import Input from "@/components/atoms/Input";
import { socket } from "../../../socket"
import { authClient } from "@/lib/auth-client";
import { applyBackgroundPreferenceToDocument, buildBackgroundStyle, DEFAULT_SITE_BACKGROUND, normalizeImageValue } from "@/lib/background-utils";
import { persistAvatarPreference } from "@/lib/avatar-preference";
import { applyAccentPalette, resolveProfileIcon } from "@/lib/profile-icons";
import NotificationToast from "@/components/organisms/home/NotificationToast";

type AvatarEntry = { id: string; name: string; type: string; url: string; accent: string; accentHover: string };

type ProfileClientViewProps = {
  profileName: string;
  initialAvatar: string;
  isOwnProfile: boolean;
};

type ProfilePayload = {
  avatar?: {
    id: string;
    url: string;
  };
  profileBackground?: string | null;
  profileBanner?: string | null;
};

type ProfilePatchPayload = {
  profileBackground: string;
  profileBanner: string;
  avatarId?: string;
};

// HARDCODE: temporary default banner until user banners are fully managed in DB.
const defaultBanner = "https://www.katebackdrop.fr/cdn/shop/files/B4035519.jpg?v=1710741683&width=600";
// HARDCODE: fallback app background value from frontend configuration.
const defaultBackground = DEFAULT_SITE_BACKGROUND;

// HARDCODE: temporary mocked match history while battle history API is pending.
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

// HARDCODE: static deck icon map used for history presentation.
const deckpublic: Record<string, string> = {
  Flygon: "/decks/flygon-icon.png",
  Ceruledge: "/decks/ceruledge-icon.png",
  Toxtricity: "/decks/toxtricity-icon.png",
  Zacian: "/decks/zacian-icon.png",
};

const normalizeBackgroundValue = (value: string) => normalizeImageValue(value, defaultBackground);
const normalizeBannerValue = (value: string) => normalizeImageValue(value, defaultBanner);

export default function ProfileClientView({ profileName, initialAvatar, isOwnProfile }: ProfileClientViewProps) {
  const router = useRouter();
  const [avatars, setAvatars] = useState<AvatarEntry[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [profileBackground, setProfileBackground] = useState(defaultBackground);
  const [profileBanner, setProfileBanner] = useState(defaultBanner);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const bannerUploadRef = useRef<HTMLInputElement>(null);

  /**
   * Objective: convert uploaded file to Data URL for instant local preview.
   * Usage: used by profile customization upload inputs.
   * Input: browser `File` object.
   * Output: promise resolving to Data URL string.
   * Special cases: rejects on FileReader errors.
   */
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


  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setUserPseudo(data.user.name);
      }
    };
    void getUserData();
  }, []);

  
  //reconnect socket in case of a page refresh
  useEffect(() => {
      if (!userPseudo || socket.connected) return;
  
      socket.connect();
      socket.emit("login", userPseudo);
  
      socket.on("online_users", (users) => {
        console.log("Users from Redis:", users);
      });
  
      return () => {
        socket.off("online_users");
      };
    }, [userPseudo]);
    
  //render messages sent by other users
  useEffect(() => {
    if (!userPseudo) return;
    socket.on("received", async ({sender, receiver, msg}) => {
      setNotifSender(sender);
      setNotification(msg);
    })
  }, [userPseudo]);

  useEffect(() => {
    const icon = resolveProfileIcon({ url: initialAvatar });
    applyAccentPalette(icon);
  }, [initialAvatar]);

  useEffect(() => {
    if (!isOwnProfile) return;

    const initOwnProfile = async () => {
      const avatarsRes = await fetch("/api/avatars");
      let profile: ProfilePayload | null = null;
      if (avatarsRes.ok) {
        const avatarList: AvatarEntry[] = await avatarsRes.json();
        setAvatars(avatarList);

        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          profile = await profileRes.json();
          if (profile?.avatar) {
            setSelectedAvatarId(profile.avatar.id);
            setDraftAvatarId(profile.avatar.id);
            setAvatar(profile.avatar.url);
            persistAvatarPreference(profile.avatar.url, profile.avatar.id);
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
        applyBackgroundPreferenceToDocument(nextSavedBackground, defaultBackground);
      } else if (profile?.profileBackground) {
        const nextBackground = normalizeBackgroundValue(profile.profileBackground);
        setProfileBackground(nextBackground);
        setDraftBackground(nextBackground);
        applyBackgroundPreferenceToDocument(nextBackground, defaultBackground);
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
    applyBackgroundPreferenceToDocument(profileBackground, defaultBackground);
  }, [isOwnProfile, profileBackground]);

  useEffect(() => {
    const handleEscapeModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowCustomizationPanel(false);
    };

    document.addEventListener("keydown", handleEscapeModal);
    return () => {
      document.removeEventListener("keydown", handleEscapeModal);
    };
  }, []);

  const openCustomizationPanel = () => {
    setDraftAvatarId(selectedAvatarId);
    setDraftBackground(profileBackground);
    setDraftBanner(profileBanner);
    setShowCustomizationPanel(true);
  };

  /**
   * Objective: persist profile customization (avatar/background/banner) to API.
   * Usage: called when user confirms profile customization panel.
   * Input: none (reads draft states).
   * Output: none (state updates + local preference sync).
   * Special cases: sends `avatarId` only when avatar changed.
   */
  const handleSaveCustomization = async () => {
    const patchBody: ProfilePatchPayload = {
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
        persistAvatarPreference(updated.avatar.url, updated.avatar.id);
        applyAccentPalette(resolveProfileIcon({ id: updated.avatar.id, url: updated.avatar.url }));
      }
      if (updated.profileBackground !== undefined) {
        const normalized = normalizeBackgroundValue(updated.profileBackground);
        setProfileBackground(normalized);
        applyBackgroundPreferenceToDocument(normalized, defaultBackground);
      }
      if (updated.profileBanner !== undefined) {
        const normalized = normalizeBannerValue(updated.profileBanner);
        setProfileBanner(normalized);
      }
    }
    setShowCustomizationPanel(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const bannerStyle = buildBackgroundStyle(profileBanner, defaultBanner);
  const totalMatches = matchHistory.length;
  const totalWins = matchHistory.filter((match) => match.result.toLowerCase() === "victoire").length;
  const totalLosses = totalMatches - totalWins;

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1">
      {showNotification && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification!} sender={notifSender!} />)}
      <div className="mx-auto flex h-full w-full max-w-[88rem] flex-col overflow-y-auto pr-1">
        <header className="mb-5 flex items-center justify-end gap-3">
          {isOwnProfile && (
            <Button
              type="button"
              onClick={openCustomizationPanel}
              variant="ghost"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[color:var(--accent-border)] bg-[#1f1b2d]/90 px-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#2b2540]"
              aria-label="Personnaliser le profil"
            >
              <i className="fa-solid fa-sliders"></i>
              <span className="hidden sm:inline">Personnaliser</span>
            </Button>
          )}

          {isOwnProfile && (
            <IconButton
              type="button"
              onClick={handleLogout}
              variant="ghost"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/80 bg-red-500/90 text-white shadow-lg transition-colors hover:bg-red-500"
              aria-label="Déconnexion"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </IconButton>
          )}
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="relative h-36 overflow-hidden border-b border-[#3c3650]">
            <div className="absolute inset-0" style={bannerStyle} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 sm:px-10 sm:pb-8">
            <div className="-mt-16 mb-6 shrink-0 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
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

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[#312b42] pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Historique de partie</h2>
                <div className="text-sm text-gray-400">
                  <span>Total : {totalMatches}</span>
                  <span className="ml-4">Victoires : {totalWins}</span>
                  <span className="ml-4 hidden sm:inline">Défaites : {totalLosses}</span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 md:max-h-[52vh]">
                <div className="space-y-3.5 pb-1">
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
          </div>
        </section>
      </div>

      {isOwnProfile && showCustomizationPanel && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCustomizationPanel(false)}
        >
          <Card
            className="w-[min(680px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#15131d] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Personnalisation du profil</h3>
              <IconButton
                type="button"
                onClick={() => setShowCustomizationPanel(false)}
                size="sm"
                className="rounded-md bg-[#242033] text-sm text-gray-200 transition-colors hover:bg-[#302a45]"
                aria-label="Fermer"
              >
                ✕
              </IconButton>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-200">Photo de profil</p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {avatars.map((av) => (
                    <Button
                      key={av.id}
                      type="button"
                      variant="ghost"
                      onClick={() => setDraftAvatarId(av.id)}
                      title={av.name}
                      className="flex h-auto items-center justify-center border-0 bg-transparent p-0 hover:bg-transparent"
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
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Fond d&apos;écran du site</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={draftBackground}
                    onChange={(event) => setDraftBackground(event.target.value)}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
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
                  <Button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    variant="ghost"
                    className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-nowrap"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Fichier
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Bannière de profil</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={draftBanner}
                    onChange={(event) => setDraftBanner(event.target.value)}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
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
                  <Button
                    type="button"
                    onClick={() => bannerUploadRef.current?.click()}
                    variant="ghost"
                    className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-nowrap"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Fichier
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  onClick={() => setShowCustomizationPanel(false)}
                  variant="ghost"
                  className="h-auto rounded-lg px-4 py-2 text-sm text-gray-200"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveCustomization}
                  className="h-auto rounded-lg px-4 py-2 text-sm font-semibold text-white"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppPageShell>
  );
}