"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import DeckSelector from "@/components/organisms/home/DeckSelector";
import MatchmakingModal from "@/components/organisms/home/MatchmakingModal";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import PlayCta from "@/components/organisms/home/PlayCta";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import { socket } from "../../socket"
import { useAvatarPreference } from "@/hooks/useAvatarPreference";

type DeckData = {
  id: string;
  title: string;
  image?: string | null;
  cards: Array<unknown>;
};

// Page principale: navigation rapide, lancement de partie et sélection de deck
export default function Home() {
  const router = useRouter();
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const avatar = useAvatarPreference(DEFAULT_PROFILE_ICON.url);

  const deckIcons = useMemo(() => {
    return decks.reduce(
      (acc, deck) => {
        acc[deck.title] = deck.image || "/decks/flygon-icon.png";
        return acc;
      },
      {} as Record<string, string>
    );
  }, [decks]);

  const availableDecks = useMemo(() => decks.map((d) => d.title), [decks]);

  // Fetch decks from API
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch("/api/decks", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          console.error("Failed to fetch decks");
          return;
        }

        const data = await response.json();
        setDecks(data.decks || []);

        // Set initial selected deck
        if (data.decks && data.decks.length > 0) {
          const savedSelectedDeck = localStorage.getItem("selectedDeck");
          const deckTitles = data.decks.map((d: DeckData) => d.title);
          if (savedSelectedDeck && deckTitles.includes(savedSelectedDeck)) {
            setSelectedDeck(savedSelectedDeck);
          } else {
            setSelectedDeck(data.decks[0].title);
          }
        }
      } catch (error) {
        console.error("Error fetching decks:", error);
      }
    };

    fetchDecks();
  }, []);

  // Persist selected deck to localStorage
  useEffect(() => {
    if (selectedDeck) {
      localStorage.setItem("selectedDeck", selectedDeck);
    }
  }, [selectedDeck]);
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
      setShowMatchmaking(false);
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

          {/* Lancement de partie + Selecteur de deck */}
          <div className="relative z-20 flex flex-col items-center justify-center gap-6">
            <PlayCta onPlay={() => setShowMatchmaking(true)} />
            
            {availableDecks.length > 0 && (
              <DeckSelector
                selectedDeck={selectedDeck}
                availableDecks={availableDecks}
                deckIcons={deckIcons}
                onSelectDeck={setSelectedDeck}
              />
            )}
          </div>

          {/* Profile info section */}
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
            <Button
              type="button"
              onClick={handleProfileClick}
              className="h-auto rounded-lg border-2 px-8 py-3 text-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
              {userPseudo || "undefined"}
            </Button>
          </div>
        </div>
      </div>

      <MatchmakingModal open={showMatchmaking} onClose={() => setShowMatchmaking(false)} />
    </AppPageShell>
  );
}

