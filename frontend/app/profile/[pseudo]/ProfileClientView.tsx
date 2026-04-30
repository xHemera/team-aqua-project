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
import { applyAccentPalette, resolveProfileIcon, DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import NotificationToast from "@/components/organisms/home/NotificationToast";

type Match_history = {
  id:           string;
  result:       string;
  createdAt:    Date;
  playerTeam:   string[];
  opponentTeam: string[];
  opponent:     string;
  user_id:      string;
}

type Avatar = {
  id: string;
  name: string;
  type: string;
  url: string;
  accent: string;
  accentHover: string
};

type ProfileClientViewProps = {
  profileName: string;
  profileUserId: string;
  initialAvatar: string;
  initialBackground?: string;
  isOwnProfile: boolean;
  profileBadges: string[];
  matchHistory: Match_history[];
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


const formatTime = (date: Date) =>
  date.toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris",
    minute: "2-digit",
    hour: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

const BORDER_STYLES = {
  win: "border-green-500",
  lose: "border-red-500"
};

const RESULT_STYLES: Record<string, string> = {
  win: "bg-green-600",
  lose: "bg-red-600"
};

// HARDCODE: static heroes icon map used for history presentation.
const deckpublic: Record<string, string> = {
  Knight: "/heroes/Avatar_Sorel.webp",
  Assassin: "/heroes/Avatar_Wanda.webp",
  Healer: "/heroes/Avatar_Tulu.webp",
  Archer: "/heroes/Avatar_Uvhash.webp",
  Mage: "/heroes/Avatar_Thais.webp"
};

// HARDCODE: fallback app background value from frontend configuration.
const defaultBackground = DEFAULT_SITE_BACKGROUND;

const normalizeBackgroundValue = (value: string) => normalizeImageValue(value, defaultBackground);
const normalizeBannerValue = (value: string) => value; // Banner normalization preserved only

export default function ProfileClientView({ profileName, profileUserId, initialAvatar, initialBackground, isOwnProfile, profileBadges, matchHistory }: ProfileClientViewProps) {
  const router = useRouter();
  const [profileBackground, setProfileBackground] = useState(initialBackground || defaultBackground);
  const [profileBanner, setProfileBanner] = useState(defaultBanner);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const [draftBackground, setDraftBackground] = useState(initialBackground || defaultBackground);
  const [draftBanner, setDraftBanner] = useState(defaultBanner);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [displayAvatar, setDisplayAvatar] = useState(initialAvatar);
  
  // Default avatar for all users
  const defaultAvatar = DEFAULT_PROFILE_ICON.url;

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

  useEffect(() => {
    if (!isOwnProfile) return;
    const savedAvatar = localStorage.getItem("profileCustomAvatar");
    if (savedAvatar) {
      setCustomAvatar(savedAvatar);
    }
  }, [isOwnProfile]);
  
  // Update displayAvatar when profileName changes (for other profiles)
  useEffect(() => {
    if (!isOwnProfile) {
      setDisplayAvatar(initialAvatar);
    }
  }, [initialAvatar, isOwnProfile]);
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name) {
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
      setShowNotification(true);
    })
  }, [userPseudo]);

  // Listen for avatar updates for other profiles
  useEffect(() => {
    if (isOwnProfile) return;
    socket.on("avatar_updated", ({ userName, imageUrl }) => {
      if (userName === profileName) {
        setDisplayAvatar(imageUrl);
      }
    });
    return () => {
      socket.off("avatar_updated");
    };
  }, [profileName, isOwnProfile]);

  useEffect(() => {
    const icon = resolveProfileIcon({ url: DEFAULT_PROFILE_ICON.url });
    applyAccentPalette(icon);
  }, []);

  useEffect(() => {
    if (!isOwnProfile) return;
    const initOwnProfile = async () => {
      // Use initialBackground from server if available
      if (initialBackground) {
        const nextBackground = normalizeBackgroundValue(initialBackground);
        setProfileBackground(nextBackground);
        setDraftBackground(nextBackground);
        applyBackgroundPreferenceToDocument(nextBackground, defaultBackground);
      }
    };

    initOwnProfile();
  }, [isOwnProfile, initialBackground]);



  // Apply background preference for profile page
  useEffect(() => {
    if (!isOwnProfile) return;
    applyBackgroundPreferenceToDocument(profileBackground, defaultBackground);
  }, [isOwnProfile, profileBackground]);

  // Load banner from database for all profiles (REMOVED - banner has been disabled)

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
    setDraftBackground(profileBackground);
    setDraftBanner(profileBanner);
    setShowCustomizationPanel(true);
  };

  /**
   * Objective: persist profile customization (background only) to API.
   * Usage: called when user confirms profile customization panel.
   * Input: none (reads draft states).
   * Output: none (state updates + local preference sync).
   */
  const handleSaveCustomization = async () => {
    const patchBody: ProfilePatchPayload = {
      profileBackground: draftBackground,
      profileBanner: draftBanner,
    };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });

    if (res.ok) {
      const updated = await res.json();
      // Apply background preference for profile page
      if (updated.profileBackground !== undefined) {
        const normalized = normalizeBackgroundValue(updated.profileBackground);
        setProfileBackground(normalized);
        applyBackgroundPreferenceToDocument(normalized, defaultBackground);
      }
    }
    setShowCustomizationPanel(false);
  };

  const handleLogout = async () => {
    const response = await fetch("/api/profile", {
        method: "PUT",
      })
      const user: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
        typeof user === "object" && user !== null && "error" in user
          ? String((user as { error: string }).error ?? "Impossible de charger l'utilisateur")
          : "Impossible de charger l'utilisateur";
        throw new Error(errorMessage);
      }
    socket.disconnect();
    await authClient.signOut();
    router.push("/");
  };

  const deleteProfile = async () => {
    const response = await fetch("/api/profile", {
        method: "DELETE",
      })
      const user: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
        typeof user === "object" && user !== null && "error" in user
          ? String((user as { error: string }).error ?? "Impossible de charger l'utilisateur")
          : "Impossible de charger l'utilisateur";
        throw new Error(errorMessage);
      }
    socket.emit("has_delete", {
      sender: userPseudo
    });
    socket.disconnect();
    router.push("/");
  }

  const handleDeleteProfile = () => {
    setShowDeleteConfirmation(true);
  };

  const bannerStyle = buildBackgroundStyle(profileBanner, defaultBanner);
  const profileBackgroundStyle = buildBackgroundStyle(profileBackground, defaultBackground);
  const totalMatches = matchHistory.length;
  const totalWins = matchHistory.filter((match) => match.result.toLowerCase() === "win").length;
  const totalLosses = totalMatches - totalWins;

  return (
    <AppPageShell 
      showSidebar 
      containerClassName="min-h-0 flex-1"
      mainStyle={{
        ...profileBackgroundStyle,
        backgroundAttachment: "fixed"
      }}
    >
      {showNotification && notification && notifSender && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification} sender={notifSender} />)}
      <div className="mx-auto flex h-full w-full max-w-[88rem] flex-col overflow-y-auto pr-1">
        <header className="mb-5 flex items-center justify-end gap-3">
          {isOwnProfile && (
            <Button
              type="button"
              onClick={openCustomizationPanel}
              variant="ghost"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[color:var(--accent-border)] bg-[#1f1b2d]/90 px-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#2b2540]"
              aria-label="Customize Profile"
            >
              <i className="fa-solid fa-sliders"></i>
              <span className="hidden sm:inline">Customize Profile</span>
            </Button>
          )}

          {isOwnProfile && (
            <>
              <IconButton
                type="button"
                onClick={handleDeleteProfile}
                variant="ghost"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-600/80 bg-red-600/90 text-white shadow-lg transition-colors hover:bg-red-700"
                aria-label="Delete Profile"
                title="Delete Profile"
              >
                <i className="fa-solid fa-trash"></i>
              </IconButton>
              <IconButton
                type="button"
                onClick={handleLogout}
                variant="ghost"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/80 bg-red-500/90 text-white shadow-lg transition-colors hover:bg-red-500"
                aria-label="Logout"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </IconButton>
            </>
          )}
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
          <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 sm:px-10 sm:pb-8">
            <div className="mb-6 shrink-0 flex flex-wrap items-end justify-between gap-5">
              <div className="flex items-end gap-4">
                <div className="relative">
                  {(customAvatar || displayAvatar) ? (
                    <Image
                      src={customAvatar || displayAvatar}
                      alt={`Avatar de ${profileName}`}
                      width={176}
                      height={176}
                      className="h-40 w-40 rounded-2xl border border-[color:var(--accent-border)] object-cover drop-shadow-2xl sm:h-44 sm:w-44"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="h-40 w-40 rounded-2xl border border-[color:var(--accent-border)] bg-gray-700 flex items-center justify-center drop-shadow-2xl sm:h-44 sm:w-44">
                      <i className="fa-solid fa-user text-6xl text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="pb-3">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{profileName}</h1>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pb-3">
                {profileBadges.map((badge) => (
                  <span key={badge} className="rounded-md border border-yellow-500/50 bg-yellow-600/90 px-3 py-1 text-xs font-bold">{badge}</span>
                )
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[#312b42] pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Match History</h2>
                <div className="text-sm text-gray-400">
                  <span>Total : {totalMatches}</span>
                  <span className="ml-4">Wins : {totalWins}</span>
                  <span className="ml-4 hidden sm:inline">Losses : {totalLosses}</span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 md:max-h-[52vh]">
                <div className="space-y-3.5 pb-1">
                  {matchHistory.map((match, index) => (
                    <article
                      key={`${formatTime(match.createdAt)}-${match.opponent}-${index}`}
                      className={`rounded-xl border-l-4 ${BORDER_STYLES[match.result as keyof typeof BORDER_STYLES] ?? "border-gray-500"} bg-[#211d2e] p-5 transition-colors hover:bg-[#2a253b]`}
                    >
                      <div className="grid gap-4 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-md px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide ${RESULT_STYLES[match.result as keyof typeof RESULT_STYLES] ?? "border-gray-600"}`}>
                              {match.result}
                            </span>
                            <span className="text-base text-gray-300">{formatTime(match.createdAt)}</span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 md:col-span-6">
                          <div className="rounded-lg bg-black/20 px-3 py-2.5">
                            <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Team played</p>
                            <div className="inline-flex items-center gap-2.5">
                              {match.playerTeam.map((member) => 
                                <Image
                                  key={member}
                                  src={deckpublic[member] || deckpublic.Knight}
                                  alt={member}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6"
                                />
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-black/20 px-3 py-2.5">
                            <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Team fought</p>
                            <div className="inline-flex items-center gap-2.5">
                              {match.opponentTeam.map((member) => 
                                <Image
                                  key={member}
                                  src={deckpublic[member] || deckpublic.Knight}
                                  alt={member}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-3 md:text-right">
                          <p className="text-xs uppercase tracking-wide text-gray-400">Opponent</p>
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
              <h3 className="text-lg font-semibold text-white">Customize Profile</h3>
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
                <label className="mb-2 block text-sm font-medium text-gray-200">Profile Picture</label>
                <input
                  ref={avatarUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
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
                        
                        // Save to database
                        const profileUpdateResponse = await fetch("/api/profile", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ imageUrl }),
                        });
                        
                        if (!profileUpdateResponse.ok) {
                          throw new Error("Failed to save profile picture to database");
                        }
                        
                        setCustomAvatar(imageUrl);
                        localStorage.setItem("profileCustomAvatar", imageUrl);
                        setDisplayAvatar(imageUrl);
                        
                        // Notify other users about avatar change
                        socket.emit("avatar_updated", {
                          userName: profileName,
                          imageUrl: imageUrl
                        });
                      } catch (error) {
                        console.error("Error uploading profile picture:", error);
                      }
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => avatarUploadRef.current?.click()}
                    variant="ghost"
                    className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-200"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Upload Picture
                  </Button>
                  {customAvatar && (
                    <Button
                      type="button"
                      onClick={async () => {
                        try {
                          // Remove from database
                          const response = await fetch("/api/profile", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ imageUrl: "/profile-icons/default-avatar.svg" }),
                          });

                          if (!response.ok) {
                            throw new Error("Failed to remove profile picture from database");
                          }

                          setCustomAvatar(null);
                          setDisplayAvatar("");
                          localStorage.removeItem("profileCustomAvatar");

                          // Notify other users about avatar removal
                          socket.emit("avatar_updated", {
                            userName: profileName,
                            imageUrl: "/profile-icons/default-avatar.svg"
                          });
                        } catch (error) {
                          console.error("Error removing profile picture:", error);
                        }
                      }}
                      variant="ghost"
                      className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">Site Background</label>
                <input
                  ref={bgUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("type", "background");
                        
                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });
                        
                        if (!response.ok) {
                          throw new Error("Failed to upload background");
                        }
                        
                        const data = await response.json();
                        const backgroundUrl = `/backgrounds/${data.name}`;
                        setDraftBackground(backgroundUrl);
                      } catch (error) {
                        console.error("Error uploading background:", error);
                      }
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    variant="ghost"
                    className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-200"
                  >
                    <i className="fa-solid fa-upload text-xs" />
                    Upload Background
                  </Button>
                  {profileBackground !== defaultBackground && (
                    <Button
                      type="button"
                      onClick={async () => {
                        try {
                          const patchBody: ProfilePatchPayload = {
                            profileBackground: null as any,
                            profileBanner: draftBanner,
                          };

                          const res = await fetch("/api/profile", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(patchBody),
                          });

                          if (res.ok) {
                            setProfileBackground(defaultBackground);
                            setDraftBackground(defaultBackground);
                            applyBackgroundPreferenceToDocument(defaultBackground, defaultBackground);
                          }
                        } catch (error) {
                          console.error("Error removing background:", error);
                        }
                      }}
                      variant="ghost"
                      className="h-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  onClick={() => setShowCustomizationPanel(false)}
                  variant="ghost"
                  className="h-auto rounded-lg px-4 py-2 text-sm text-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveCustomization}
                  className="h-auto rounded-lg px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <Card
            className="w-[min(420px,calc(100vw-2rem))] rounded-2xl bg-[#15131d] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Profile</h3>
              <p className="text-sm text-gray-300">
                Are you sure you want to delete your profile? This action cannot be undone. All your data including decks, match history, and messages will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                variant="ghost"
                className="h-auto rounded-lg px-4 py-2 text-sm text-gray-200 hover:bg-[#242033]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {setShowDeleteConfirmation(false); deleteProfile()}}
                className="h-auto rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600/90 hover:bg-red-700 border border-red-500/50"
              >
                Delete Profile
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppPageShell>
  );
}