"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import DeckSelector from "@/components/organisms/home/DeckSelector";
import MatchmakingModal from "@/components/organisms/home/MatchmakingModal";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import PlayCta from "@/components/organisms/home/PlayCta";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import { DEFAULT_DECKS, DECK_ICONS, useDeckPreferences } from "@/hooks/useDeckPreferences";
import Button from "@/components/atoms/Button";
import { socket } from "../../socket"
import { useAvatarPreference } from "@/hooks/useAvatarPreference";


// Page principale: navigation rapide, lancement de partie et sélection de deck
export default function Home() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const avatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);
  const { selectedDeck, setSelectedDeck, availableDecks } = useDeckPreferences(DEFAULT_DECKS);

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
      setNotification(msg);
      setNotifSender(sender);
    })
  }, [userPseudo])

  useEffect(() => {
    const handleEscapeModal = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowPopup(false);
    };

    document.addEventListener("keydown", handleEscapeModal);
    return () => {
      document.removeEventListener("keydown", handleEscapeModal);
    };
  }, []);

  const handleProfileClick = async () => {
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      router.push(`/profile/${data.user.name}`);
    } else {
      router.push("/not-connected");
    }
  };

  return (
    <AppPageShell showSidebar containerClassName="min-h-0 flex-1 flex-col">
      {showNotification && notification && notifSender && (<NotificationToast onClose={() => setShowNotification(false)} msg={notification} sender={notifSender} />)}

      <div className="relative z-10 flex min-h-0 flex-1 w-full items-center justify-center">
        <div className="grid w-full max-w-[88rem] grid-cols-1 items-center gap-8 px-2 lg:grid-cols-[1fr_auto_1fr]">
          <div className="hidden lg:block" />

          <div className="relative z-20 flex flex-col items-center justify-center gap-6">
            <PlayCta onPlay={() => setShowPopup(true)} />
            <DeckSelector
              selectedDeck={selectedDeck}
              availableDecks={availableDecks}
              deckIcons={DECK_ICONS}
              onSelectDeck={setSelectedDeck}
            />

          </div>

          <div className="relative z-20 flex flex-col items-center justify-center gap-4">
            <Image
              src={avatar}
              alt="Avatar"
              width={320}
              height={320}
              className="h-auto w-[220px] rounded-3xl border-2 border-[color:var(--accent-border)] object-cover drop-shadow-2xl sm:w-[240px]"
              priority
              unoptimized
            />
            {/* Usage atomique: Button remplace le CTA profil local pour mutualiser hover/focus/disabled. */}
            <Button
              type="button"
              onClick={handleProfileClick}
              className="h-auto rounded-lg border-2 px-8 py-3 text-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
              {userPseudo || "Pseudo"}
            </Button>
          </div>
        </div>
      </div>

      <MatchmakingModal open={showPopup} onClose={() => setShowPopup(false)} />
    </AppPageShell>
  );
}

