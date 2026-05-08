"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageShell from "@/components/AppPageShell";
import Card from "@/components/atoms/Card";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import { authClient } from "@/lib/auth-client";
import { applyBackgroundPreferenceToDocument, buildBackgroundStyle, DEFAULT_SITE_BACKGROUND, normalizeImageValue } from "@/lib/background-utils";
import { persistAvatarPreference } from "@/lib/avatar-preference";
import { applyAccentPalette, DEFAULT_PROFILE_ICON, resolveProfileIcon } from "@/lib/profile-icons";
import { socket } from "../../../socket";

type MatchHistoryEntry = {
  id: string;
  result: string;
  createdAt: Date;
  playerTeam: string[];
  opponentTeam: string[];
  opponent: string;
  user_id: string;
};

type ProfileClientViewProps = {
  profileName: string;
  initialAvatar: string;
  initialBackground?: string;
  isOwnProfile: boolean;
  profileBadges: string[];
  matchHistory: MatchHistoryEntry[];
};

const RESULT_STYLES: Record<string, string> = {
  win: "bg-emerald-500/15 text-emerald-300",
  lose: "bg-rose-500/15 text-rose-300",
};

const BORDER_STYLES: Record<string, string> = {
  win: "bg-emerald-400",
  lose: "bg-rose-400",
};

const TEAM_PORTRAITS: Record<string, string> = {
  Knight: "/heroes/Avatar_Sorel.webp",
  Assassin: "/heroes/Avatar_Wanda.webp",
  Healer: "/heroes/Avatar_Tulu.webp",
  Archer: "/heroes/Avatar_Uvhash.webp",
  Mage: "/heroes/Avatar_Thais.webp",
};

const defaultBackground = DEFAULT_SITE_BACKGROUND;
const normalizeBackgroundValue = (value: string) => normalizeImageValue(value, defaultBackground);

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ProfileClientView({
  profileName,
  initialAvatar,
  initialBackground,
  isOwnProfile,
  profileBadges,
  matchHistory,
}: ProfileClientViewProps) {
  const router = useRouter();
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [displayAvatar, setDisplayAvatar] = useState(initialAvatar);
  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const profileBackground = normalizeBackgroundValue(initialBackground || defaultBackground);
  const profileBackgroundStyle = buildBackgroundStyle(profileBackground, defaultBackground);

  // Add test match for demo purposes if matchHistory exists
  const enhancedMatchHistory = matchHistory.length > 0 
    ? [...matchHistory, ...matchHistory.slice(0, 2)]
    : matchHistory;
  
  const totalMatches = enhancedMatchHistory.length;

  useEffect(() => {
    if (!isOwnProfile) {
      setDisplayAvatar(initialAvatar);
      return;
    }

    const savedAvatar = localStorage.getItem("profileCustomAvatar");
    if (savedAvatar) {
      setCustomAvatar(savedAvatar);
      setDisplayAvatar(savedAvatar);
    }
  }, [initialAvatar, isOwnProfile]);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setUserPseudo(data.user.name);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!userPseudo || socket.connected) return;

    const onBan = (banned: string) => {
      if (banned === userPseudo) {
        void handleLogout();
      }
    };

    const onReceived = ({ sender, msg }: { sender: string; msg: string }) => {
      setNotifSender(sender);
      setNotification(msg);
      setShowNotification(true);
    };

    const timeoutId = window.setTimeout(() => {
      socket.connect();
      socket.emit("login", userPseudo);
      socket.on("ban", onBan);
      socket.on("received", onReceived);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      socket.off("ban", onBan);
      socket.off("received", onReceived);
    };
  }, [userPseudo]);

  useEffect(() => {
    if (isOwnProfile) return;

    const onAvatarUpdated = ({ userName, imageUrl }: { userName: string; imageUrl: string }) => {
      if (userName === profileName) {
        setDisplayAvatar(imageUrl);
      }
    };

    socket.on("avatar_updated", onAvatarUpdated);
    return () => {
      socket.off("avatar_updated", onAvatarUpdated);
    };
  }, [isOwnProfile, profileName]);

  useEffect(() => {
    const icon = resolveProfileIcon({ url: DEFAULT_PROFILE_ICON.url });
    applyAccentPalette(icon);
  }, []);

  useEffect(() => {
    if (!isOwnProfile) return;
    applyBackgroundPreferenceToDocument(profileBackground, defaultBackground);
  }, [isOwnProfile, profileBackground]);

  const currentAvatar = customAvatar || displayAvatar || DEFAULT_PROFILE_ICON.url;

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload profile picture");
    }

    const data = await response.json();
    const imageUrl = `/profiles/${data.name}`;

    const profileUpdateResponse = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!profileUpdateResponse.ok) {
      throw new Error("Failed to save profile picture to database");
    }

    setCustomAvatar(imageUrl);
    setDisplayAvatar(imageUrl);
    localStorage.setItem("profileCustomAvatar", imageUrl);
    persistAvatarPreference(imageUrl);

    socket.emit("avatar_updated", {
      userName: profileName,
      imageUrl,
    });
  };

  const handleLogout = async () => {
    socket.emit("isdisconnecting");
    socket.disconnect();
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AppPageShell
      showSidebar
      containerClassName="min-h-0 flex-1"
      mainStyle={{
        ...profileBackgroundStyle,
        backgroundAttachment: "fixed",
      }}
    >
      {showNotification && notification && notifSender && (
        <NotificationToast
          onClose={() => setShowNotification(false)}
          msg={notification}
          sender={notifSender}
        />
      )}

      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section: Avatar + Name + Badges */}
        <Card className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#15131d]/92 p-0 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0" style={profileBackgroundStyle} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09070c] via-[#09070c]/72 to-transparent" />

            <div className="relative flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:gap-8 lg:justify-between">
              {/* Avatar */}
              <div className="shrink-0">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => avatarUploadRef.current?.click()}
                    className="group relative block overflow-hidden rounded-[1.6rem] border-2 border-white/15 bg-[#0f0d14]/90 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.46)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#c9a227]/40"
                    aria-label="Change profile picture"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.24),transparent_68%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <div className="relative aspect-square w-32 overflow-hidden rounded-[1.2rem] sm:w-40">
                      <Image
                        src={currentAvatar}
                        alt={`Avatar de ${profileName}`}
                        width={192}
                        height={192}
                        className="h-full w-full object-cover"
                        priority
                        unoptimized
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Changer l&apos;avatar
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="overflow-hidden rounded-[1.6rem] border-2 border-white/15 bg-[#0f0d14]/90 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.46)]">
                    <div className="aspect-square w-32 overflow-hidden rounded-[1.2rem] sm:w-40">
                      <Image
                        src={currentAvatar}
                        alt={`Avatar de ${profileName}`}
                        width={192}
                        height={192}
                        className="h-full w-full object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                <input
                  ref={avatarUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    try {
                      await handleAvatarUpload(file);
                    } catch (error) {
                      console.error("Error uploading profile picture:", error);
                    }

                    event.target.value = "";
                  }}
                />
              </div>

              {/* Name + Badges */}
              <div className="flex-1 min-w-0">
                <div className="mb-4 sm:mb-6">
                  <h1 
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 break-words"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    {profileName}
                  </h1>
                  <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-[#c9a227] to-[#f4e4a6] rounded-full" />
                </div>

                {profileBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {profileBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-lg sm:rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/15 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#f3e3b9] shadow-[0_8px_16px_rgba(201,162,39,0.1)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Match History Section */}
        <Card className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#15131d]/92 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {/* Header */}
          <div className="border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-black text-white break-words" style={{ fontFamily: "var(--font-display), serif" }}>
                  Match History
                </h2>
              </div>
              <div className="shrink-0 rounded-2xl border border-[#c9a227]/30 bg-[#c9a227]/10 px-4 py-2 sm:px-5 sm:py-3 shadow-[0_8px_16px_rgba(201,162,39,0.1)]">
                <div className="text-xs uppercase tracking-[0.18em] text-[#c9a227]/80 mb-1">Combats</div>
                <div className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "var(--font-display), serif" }}>
                  {totalMatches}
                </div>
              </div>
            </div>
          </div>

          {/* Match List - Scrollable Container */}
          <div className="overflow-y-auto space-y-4 p-4 sm:p-6 lg:p-8" style={{ maxHeight: "calc(100vh - 500px)" }}>
            {enhancedMatchHistory.length > 0 ? enhancedMatchHistory.map((match, index) => {
              const isWin = match.result.toLowerCase() === "win";

              return (
                <article
                  key={`${match.createdAt.toString()}-${match.opponent}-${index}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1b1824] to-[#15131d] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                >
                  {/* Result Bar */}
                  <div className={`h-1.5 w-full ${isWin ? BORDER_STYLES.win : BORDER_STYLES.lose}`} />
                  
                  <div className="p-5 sm:p-6">
                    {/* Result + Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.24em] ${RESULT_STYLES[match.result.toLowerCase()] ?? "bg-white/10 text-white"}`}>
                          {match.result.toUpperCase()}
                        </span>
                        <span className="text-sm text-[#b8a98a]">{formatDate(match.createdAt)}</span>
                      </div>
                      <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#d7c9a8] whitespace-nowrap">
                        vs {match.opponent}
                      </span>
                    </div>

                    {/* Teams */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/30 px-5 py-4">
                        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#c9a227]/80 font-semibold">Votre équipe</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {match.playerTeam.map((member) => (
                            <div key={member} className="relative group">
                              <Image
                                src={TEAM_PORTRAITS[member] || TEAM_PORTRAITS.Knight}
                                alt={member}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-lg border border-white/20 shadow-lg transition-transform group-hover:scale-125"
                              />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {member}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 px-5 py-4">
                        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#c9a227]/80 font-semibold">Équipe adverse</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {match.opponentTeam.map((member) => (
                            <div key={member} className="relative group">
                              <Image
                                src={TEAM_PORTRAITS[member] || TEAM_PORTRAITS.Knight}
                                alt={member}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-lg border border-white/20 shadow-lg transition-transform group-hover:scale-125"
                              />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {member}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-[#d2c6a5] text-base">Aucun historique de combat. Votre premier duel apparaîtra ici.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppPageShell>
  );
}
